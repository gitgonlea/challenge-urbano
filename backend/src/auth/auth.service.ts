import {
  ForbiddenException,
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Request, Response } from 'express';

import { UserService } from '../user/user.service';
import { LoginDto, LoginResponseDto, UserResponseDto } from './auth.dto';

@Injectable()
export class AuthService {
  private readonly SECRET = process.env.JWT_SECRET;
  private readonly REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;

  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  // Helper method to create safe user response
private createUserResponse(user: any): UserResponseDto {
  return {
    id: user.id,
    username: user.username,
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role,
    isActive: user.isActive,
  };
}

  async login(
    loginDto: LoginDto,
    response: Response,
  ): Promise<LoginResponseDto> {
    const { username, password } = loginDto;
    const user = await this.userService.findByUsername(username);

    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new HttpException(
        'Invalid username or password',
        HttpStatus.UNAUTHORIZED,
      );
    }

    if (!user.isActive) {
      throw new HttpException('Account is disabled', HttpStatus.UNAUTHORIZED);
    }

    const { id, firstName, lastName, role } = user;

    const accessToken = await this.jwtService.signAsync(
      { username, firstName, lastName, role },
      { subject: id, expiresIn: '15m', secret: this.SECRET },
    );

    /* Generates a refresh token and stores it HASHED in the database */
    const refreshToken = await this.jwtService.signAsync(
      { username, firstName, lastName, role },
      { subject: id, expiresIn: '1y', secret: this.REFRESH_SECRET },
    );

    // Hash the refresh token before storing it
    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
    await this.userService.setRefreshToken(id, hashedRefreshToken);

    response.cookie('refresh-token', refreshToken, { 
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // Only send over HTTPS in production
      sameSite: 'strict' // CSRF protection
    });

    // Return safe user data without password
    return { token: accessToken, user: this.createUserResponse(user) };
  }

  /* Because JWT is a stateless authentication, this function removes the refresh token from the cookies and the database */
  async logout(request: Request, response: Response): Promise<boolean> {
    const userId = request.user['userId'];
    await this.userService.setRefreshToken(userId, null);
    response.clearCookie('refresh-token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    });
    return true;
  }

  async refresh(
    refreshToken: string,
    response: Response,
  ): Promise<LoginResponseDto> {
    if (!refreshToken) {
      throw new HttpException('Refresh token required', HttpStatus.BAD_REQUEST);
    }

    let decoded;
    try {
      // Verify the refresh token first
      decoded = await this.jwtService.verifyAsync(refreshToken, {
        secret: this.REFRESH_SECRET,
      });
    } catch (error) {
      response.clearCookie('refresh-token');
      throw new HttpException(
        'Refresh token is not valid',
        HttpStatus.FORBIDDEN,
      );
    }

    const user = await this.userService.findById(decoded['sub']);
    if (!user || !user.refreshToken) {
      response.clearCookie('refresh-token');
      throw new HttpException(
        'Refresh token is not valid',
        HttpStatus.FORBIDDEN,
      );
    }

    const { firstName, lastName, username, id, role } = user;

    // Compare the provided refresh token with the hashed one in database
    if (!(await bcrypt.compare(refreshToken, user.refreshToken))) {
      response.clearCookie('refresh-token');
      await this.userService.setRefreshToken(id, null);
      throw new HttpException(
        'Refresh token is not valid',
        HttpStatus.FORBIDDEN,
      );
    }

    const accessToken = await this.jwtService.signAsync(
      { username, firstName, lastName, role },
      { subject: id, expiresIn: '15m', secret: this.SECRET },
    );

    // Return safe user data without password
    return { token: accessToken, user: this.createUserResponse(user) };
  }
}