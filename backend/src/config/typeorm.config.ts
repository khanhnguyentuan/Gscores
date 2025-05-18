import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { v4 as uuidv4 } from 'uuid';
import * as dotenv from 'dotenv';

// Đảm bảo biến môi trường được load
dotenv.config();

export const typeOrmConfig: TypeOrmModuleOptions = {
  type: 'mysql',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  username: process.env.DB_USERNAME || 'root',
  password: process.env.DB_PASSWORD || 'root',
  database: process.env.DB_DATABASE || 'g_scores',
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  synchronize: true,
};

// Override hàm generateString để sử dụng uuid thay vì crypto
export const patchTypeOrmUtils = () => {
  try {
    const typeOrmUtils = require('@nestjs/typeorm/dist/common/typeorm.utils');
    if (typeOrmUtils && typeof typeOrmUtils.generateString === 'function') {
      typeOrmUtils.generateString = () => uuidv4();
      console.log('✅ Đã override generateString thành công với uuid');
    }
  } catch (err) {
    console.error('❌ Không thể patch typeorm.utils:', err);
  }
};