import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import * as dotenv from 'dotenv';

// Đảm bảo biến môi trường được load
dotenv.config();

// Adapter để chuyển từ MySQL sang PostgreSQL
export const getTypeOrmConfig = (): TypeOrmModuleOptions => {
  const dbType = process.env.DB_TYPE || 'mysql';
  
  // Cấu hình chung
  const baseConfig: TypeOrmModuleOptions = {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    username: process.env.DB_USERNAME || 'root',
    password: process.env.DB_PASSWORD || 'root',
    database: process.env.DB_DATABASE || 'g_scores',
    entities: [__dirname + '/../**/*.entity{.ts,.js}'],
    synchronize: process.env.DB_SYNCHRONIZE === 'true',
  };

  // Điều chỉnh theo loại database
  if (dbType === 'postgres') {
    return {
      ...baseConfig,
      type: 'postgres',
      port: parseInt(process.env.DB_PORT || '5432', 10),
      ssl: process.env.NODE_ENV === 'production', // SSL cho production
    };
  } else {
    return {
      ...baseConfig,
      type: 'mysql',
    };
  }
};

// Override hàm generateString để sử dụng uuid thay vì crypto (nếu cần)
export const patchTypeOrmUtils = () => {
  try {
    const { v4: uuidv4 } = require('uuid');
    const typeOrmUtils = require('@nestjs/typeorm/dist/common/typeorm.utils');
    if (typeOrmUtils && typeof typeOrmUtils.generateString === 'function') {
      typeOrmUtils.generateString = () => uuidv4();
      console.log('✅ Đã override generateString thành công với uuid');
    }
  } catch (err) {
    console.error('❌ Không thể patch typeorm.utils:', err);
  }
}; 