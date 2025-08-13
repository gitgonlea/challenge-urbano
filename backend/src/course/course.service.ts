import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ILike } from 'typeorm';

import { CreateCourseDto, UpdateCourseDto } from './course.dto';
import { Course } from './course.entity';
import { CourseQuery } from './course.query';

@Injectable()
export class CourseService {
  async save(createCourseDto: CreateCourseDto): Promise<Course> {
    return await Course.create({
      ...createCourseDto,
      dateCreated: new Date(),
    }).save();
  }

async findAll(courseQuery: CourseQuery): Promise<Course[]> {
  const whereClause: any = {};
  
  if (courseQuery.name && courseQuery.name.trim()) {
    whereClause.name = ILike(`%${courseQuery.name}%`);
  }
  
  if (courseQuery.description && courseQuery.description.trim()) {
    whereClause.description = ILike(`%${courseQuery.description}%`);
  }
  
  return await Course.find({
    where: Object.keys(whereClause).length > 0 ? whereClause : {},
    order: {
      name: 'ASC',
      description: 'ASC',
    },
  });
}
  async findById(id: string): Promise<Course> {
    const course = await Course.findOne(id) as Course;
    if (!course) {
      throw new HttpException(`Could not find csourse with matching id ${id}`, HttpStatus.NOT_FOUND);
    }
    return course;
  }

  async update(id: string, updateCourseDto: UpdateCourseDto): Promise<Course> {
    const course = await this.findById(id);
    return await Course.create({ id: course.id, ...updateCourseDto }).save();
  }

  async delete(id: string): Promise<string> {
    const course = await this.findById(id);
    await Course.delete(course);
    return id;
  }

  async count(): Promise<number> {
    return await Course.count();
  }
}