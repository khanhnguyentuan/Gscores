import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Subject } from './entities/subject.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Subject])
  ],
  controllers: [],
  providers: [],
  exports: [TypeOrmModule],
})
export class SubjectsModule {} 