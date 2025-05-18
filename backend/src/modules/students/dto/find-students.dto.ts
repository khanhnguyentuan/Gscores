import { IsOptional, IsPositive, IsString, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class FindStudentsDto {
  @ApiProperty({
    description: 'Số trang (bắt đầu từ 1)',
    default: 1,
    required: false,
  })
  @IsPositive()
  @Min(1)
  @Type(() => Number)
  @IsOptional()
  page?: number = 1;

  @ApiProperty({
    description: 'Số học sinh mỗi trang',
    default: 10,
    required: false,
  })
  @IsPositive()
  @Type(() => Number)
  @IsOptional()
  limit?: number = 10;

  @ApiProperty({
    description: 'Từ khóa tìm kiếm (tên hoặc số báo danh)',
    required: false,
  })
  @IsString()
  @IsOptional()
  search?: string;
} 