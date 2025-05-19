import { Controller, Get, Query, ParseIntPipe, DefaultValuePipe } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { ApiTags, ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { ScoreLevelStatistic, ScoreLevelBySubject } from './interfaces/report.interfaces';

@ApiTags('reports')
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('score-levels')
  @ApiOperation({ 
    summary: 'Thống kê số lượng học sinh theo 4 cấp độ điểm', 
    description: 'Phân loại điểm số thành 4 cấp độ: Giỏi (≥8), Khá (6-8), Trung bình (4-6), Yếu (<4)'
  })
  @ApiQuery({ name: 'subject_code', required: false, type: String, description: 'Mã môn học (để trống nếu muốn xem tất cả)' })
  @ApiResponse({ status: 200, description: 'Trả về thống kê số lượng học sinh theo 4 cấp độ điểm' })
  async getScoreLevels(
    @Query('subject_code') subjectCode?: string,
  ): Promise<ScoreLevelStatistic> {
    return this.reportsService.getScoreLevels(subjectCode);
  }

  @Get('score-levels-by-subject')
  @ApiOperation({ 
    summary: 'Thống kê học sinh theo 4 cấp độ điểm cho từng môn học', 
    description: 'Kết quả phù hợp để hiển thị trên biểu đồ. Phân loại điểm số: Giỏi (≥8), Khá (6-8), Trung bình (4-6), Yếu (<4)'
  })
  @ApiResponse({ status: 200, description: 'Trả về thống kê số lượng học sinh theo 4 cấp độ điểm cho từng môn học' })
  async getScoreLevelsBySubject(): Promise<ScoreLevelBySubject[]> {
    return this.reportsService.getScoreLevelsBySubject();
  }

  @Get('top-students-group-a')
  @ApiOperation({ 
    summary: 'Lấy top học sinh khối A (toán, lý, hóa)', 
    description: 'Trả về danh sách học sinh có tổng điểm 3 môn toán, lý, hóa cao nhất'
  })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Số lượng học sinh hiển thị (mặc định: 10)' })
  @ApiQuery({ name: 'offset', required: false, type: Number, description: 'Vị trí bắt đầu (mặc định: 0)' })
  @ApiResponse({ status: 200, description: 'Trả về danh sách top học sinh khối A' })
  async getTopStudentsGroupA(
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('offset', new DefaultValuePipe(0), ParseIntPipe) offset: number,
  ) {
    return this.reportsService.getTopStudentsGroupA(limit, offset);
  }

  @Get('refresh-cache')
  @ApiOperation({ summary: 'Cập nhật cache cho báo cáo', description: 'Yêu cầu hệ thống tính toán lại và cập nhật cache cho các báo cáo thống kê.' })
  @ApiResponse({ status: 200, description: 'Cache đã được cập nhật thành công.' })
  async refreshCache() {
    await this.reportsService.refreshScoreLevelCache();
    return { message: 'Cache đã được cập nhật thành công' };
  }

  @Get('refresh-top-students')
  @ApiOperation({ summary: 'Cập nhật cache cho top học sinh khối A', description: 'Yêu cầu hệ thống tính toán lại và cập nhật cache cho top học sinh khối A.' })
  @ApiResponse({ status: 200, description: 'Cache đã được cập nhật thành công.' })
  async refreshTopStudentsCache() {
    await this.reportsService.refreshTopStudentsCache();
    return { message: 'Cache top học sinh khối A đã được cập nhật thành công' };
  }
} 