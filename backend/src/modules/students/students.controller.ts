import { Controller, Get, Param, Query, NotFoundException } from '@nestjs/common';
import { StudentsService } from './students.service';
import { ApiTags, ApiOperation, ApiParam, ApiQuery, ApiResponse } from '@nestjs/swagger';

@ApiTags('students')
@Controller('students')
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách tất cả học sinh' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Số trang' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Số học sinh mỗi trang' })
  @ApiQuery({ name: 'search', required: false, type: String, description: 'Từ khóa tìm kiếm (tên hoặc số báo danh)' })
  @ApiResponse({ status: 200, description: 'Trả về danh sách học sinh phân trang' })
  async findAll(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('search') search?: string,
  ) {
    return this.studentsService.findAll({
      page: +page,
      limit: +limit,
      search,
    });
  }

  @Get('search')
  @ApiOperation({ 
    summary: 'Tìm kiếm học sinh theo số báo danh', 
    description: 'API này cho phép tra cứu thông tin học sinh bằng số báo danh'
  })
  @ApiQuery({ name: 'registration_number', required: true, type: String, description: 'Số báo danh của học sinh' })
  @ApiResponse({ status: 200, description: 'Trả về thông tin học sinh nếu tìm thấy' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy học sinh' })
  async searchByRegistrationNumber(@Query('registration_number') regNum: string) {
    const student = await this.studentsService.findByCode(regNum);
    if (!student) {
      throw new NotFoundException(`Không tìm thấy học sinh với số báo danh ${regNum}`);
    }
    return student;
  }

  @Get(':code')
  @ApiOperation({ summary: 'Lấy thông tin học sinh theo số báo danh' })
  @ApiParam({ name: 'code', description: 'Số báo danh học sinh' })
  @ApiResponse({ status: 200, description: 'Trả về thông tin học sinh' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy học sinh' })
  async findByCode(@Param('code') code: string) {
    const student = await this.studentsService.findByCode(code);
    if (!student) {
      throw new NotFoundException(`Không tìm thấy học sinh với số báo danh ${code}`);
    }
    return student;
  }

  @Get(':code/scores')
  @ApiOperation({ 
    summary: 'Lấy điểm số của học sinh theo số báo danh',
    description: 'API này trả về điểm số của tất cả các môn học của học sinh, được tra cứu bằng số báo danh'
  })
  @ApiParam({ name: 'code', description: 'Số báo danh học sinh' })
  @ApiResponse({ status: 200, description: 'Trả về điểm số của học sinh' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy học sinh' })
  async getStudentScores(@Param('code') code: string) {
    const scores = await this.studentsService.getStudentScores(code);
    if (!scores) {
      throw new NotFoundException(`Không tìm thấy học sinh với số báo danh ${code}`);
    }
    return scores;
  }

  @Get(':code/summary')
  @ApiOperation({ 
    summary: 'Lấy tổng hợp điểm số của học sinh theo số báo danh',
    description: 'API này trả về điểm số và thông tin tổng hợp (điểm trung bình, xếp hạng) của học sinh'
  })
  @ApiParam({ name: 'code', description: 'Số báo danh học sinh' })
  @ApiResponse({ status: 200, description: 'Trả về tổng hợp điểm số và xếp hạng' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy học sinh' })
  async getStudentSummary(@Param('code') code: string) {
    const summary = await this.studentsService.getStudentSummary(code);
    if (!summary) {
      throw new NotFoundException(`Không tìm thấy học sinh với số báo danh ${code}`);
    }
    return summary;
  }
} 