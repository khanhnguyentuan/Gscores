import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Score } from './entities/score.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Score])
  ],
  controllers: [],
  providers: [],
  exports: [TypeOrmModule],
})
export class ScoresModule {} 