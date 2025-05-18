import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';
import { Student } from '../students/entities/student.entity';
import { Score } from '../scores/entities/score.entity';
import { Subject } from '../subjects/entities/subject.entity';
import { CacheModule } from '@nestjs/cache-manager';

@Module({
  imports: [
    TypeOrmModule.forFeature([Student, Score, Subject]),
    CacheModule.register({
      ttl: 3600, // thời gian cache (giây)
    })
  ],
  controllers: [ReportsController],
  providers: [ReportsService],
  exports: [ReportsService],
})
export class ReportsModule {} 