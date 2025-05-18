import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { StudentsModule } from './modules/students/students.module';
import { ReportsModule } from './modules/reports/reports.module';
import { SubjectsModule } from './modules/subjects/subjects.module';
import { ScoresModule } from './modules/scores/scores.module';
import { ImportModule } from './modules/import/import.module';
import { CacheModule } from '@nestjs/cache-manager';
import { typeOrmConfig } from './config/typeorm.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    CacheModule.register({
      isGlobal: true,
      ttl: 3600, // 1 giờ cache
    }),
    TypeOrmModule.forRoot(typeOrmConfig),
    StudentsModule,
    ReportsModule,
    SubjectsModule,
    ScoresModule,
    ImportModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
