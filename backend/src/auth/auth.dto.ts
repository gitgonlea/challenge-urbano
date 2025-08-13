import { IsNotEmpty } from 'class-validator';
import { User } from 'src/user/user.entity';

export class LoginDto {
  @IsNotEmpty()
  username: string;

  @IsNotEmpty()
  password: string;
}

export class UserResponseDto {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  role: string;
  isActive: boolean;
}

export class LoginResponseDto {
  token: string;
  user: UserResponseDto;
}
