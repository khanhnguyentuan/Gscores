import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { patchTypeOrmUtils } from './config/typeorm.config';

patchTypeOrmUtils();


async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Cấu hình global prefix
  app.setGlobalPrefix('api');
  
  // Cấu hình validation pipe
  app.useGlobalPipes(new ValidationPipe({
    transform: true,
    whitelist: true,
    forbidNonWhitelisted: true,
  }));
  
  // Cấu hình CORS
  app.enableCors();
  
  // Cấu hình Swagger
  const config = new DocumentBuilder()
    .setTitle('G-Scores API')
    .setDescription('API để hiển thị và phân tích điểm thi THPT 2024')
    .setVersion('1.0')
    .addTag('students', 'Quản lý thông tin học sinh và điểm số')
    .addTag('reports', 'Tạo báo cáo thống kê và phân tích')
    .addTag('import', 'Quản lý việc import dữ liệu')
    .build();
  
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
  // Khởi động ứng dụng
  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`Ứng dụng đang chạy trên cổng ${port}`);
}

bootstrap();
