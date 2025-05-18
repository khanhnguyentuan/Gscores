import { Controller, Post, Body, HttpStatus, HttpException, Get } from '@nestjs/common';
import { ImportService } from './import.service';
import * as path from 'path';
import * as fs from 'fs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Student } from '../students/entities/student.entity';
import { Subject } from '../subjects/entities/subject.entity';
import { Score } from '../scores/entities/score.entity';

@Controller('import')
export class ImportController {
  constructor(
    private readonly importService: ImportService,
    @InjectRepository(Student)
    private readonly studentRepository: Repository<Student>,
    @InjectRepository(Subject)
    private readonly subjectRepository: Repository<Subject>,
    @InjectRepository(Score)
    private readonly scoreRepository: Repository<Score>,
  ) {}

  @Post()
  async importCsv() {
    try {
      // Đường dẫn tuyệt đối tới file CSV
      const csvFilePath = path.resolve(__dirname, '..', '..', '..', '..', 'dataset', 'diem_thi_thpt_2024.csv');
      console.log('📁 CSV File Path:', csvFilePath);
  
      // Kiểm tra xem file có tồn tại không
      if (!fs.existsSync(csvFilePath)) {
        console.error('❌ CSV file not found at:', csvFilePath);
        throw new Error('CSV file not found');
      }
      console.log('✅ CSV file found. Proceeding to import...');
  
      const result = await this.importService.importFromCSV(csvFilePath);
      console.log('✅ Import result:', result);
  
      // Kiểm tra số lượng bản ghi sau khi import
      const status = await this.getImportStatus();
      console.log('📊 Current import status:', status);
  
      return {
        message: 'Import completed successfully',
        ...result,
        currentData: status,
      };
    } catch (error) {
      console.error('❌ Import failed:', error);
      throw new HttpException(
        `Import failed: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
  
  
  @Get('status')
  async checkImportStatus() {
    return this.getImportStatus();
  }
  
  private async getImportStatus() {
    const studentsCount = await this.studentRepository.count();
    const subjectsCount = await this.subjectRepository.count();
    const scoresCount = await this.scoreRepository.count();
    
    const isImported = studentsCount > 0 && subjectsCount > 0 && scoresCount > 0;
    
    return {
      status: isImported ? 'success' : 'not_imported',
      data: {
        students: studentsCount,
        subjects: subjectsCount,
        scores: scoresCount,
      }
    };
  }
} 