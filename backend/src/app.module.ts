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
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    CacheModule.register({
      isGlobal: true,
      ttl: 3600, // 1 giờ cache
    }),
    ScheduleModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '3306', 10),
      username: process.env.DB_USERNAME || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_DATABASE || 'g_scores',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true, // Tắt đồng bộ hóa tự động để đảm bảo an toàn dữ liệu
      logging: process.env.NODE_ENV === 'development',
    }),
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
