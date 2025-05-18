import * as fs from 'fs';
import * as csvParser from 'csv-parser';
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, EntityManager, DataSource } from 'typeorm';
import { Student } from '../students/entities/student.entity';
import { Subject } from '../subjects/entities/subject.entity';
import { Score } from '../scores/entities/score.entity';

interface CsvRow {
  sbd: string;
  toan: string;
  ngu_van: string;
  ngoai_ngu: string;
  vat_li: string;
  hoa_hoc: string;
  sinh_hoc: string;
  lich_su: string;
  dia_li: string;
  gdcd: string;
  ma_ngoai_ngu: string;
  [key: string]: string;
}

@Injectable()
export class ImportService {
  private readonly logger = new Logger(ImportService.name);
  private readonly BATCH_SIZE = 2000; // Số lượng bản ghi mỗi batch

  constructor(
    @InjectRepository(Student)
    private studentRepository: Repository<Student>,
    @InjectRepository(Subject)
    private subjectRepository: Repository<Subject>,
    @InjectRepository(Score)
    private scoreRepository: Repository<Score>,
    private dataSource: DataSource,
  ) {}

  async importFromCSV(filePath: string): Promise<{ total: number, success: number }> {
    this.logger.log(`Starting import from ${filePath}`);
    
    // Tạo subjects trước
    const subjects = [
      { code: 'toan', name: 'Toán' },
      { code: 'ngu_van', name: 'Ngữ văn' },
      { code: 'ngoai_ngu', name: 'Ngoại ngữ' },
      { code: 'vat_li', name: 'Vật lý' },
      { code: 'hoa_hoc', name: 'Hóa học' },
      { code: 'sinh_hoc', name: 'Sinh học' },
      { code: 'lich_su', name: 'Lịch sử' },
      { code: 'dia_li', name: 'Địa lý' },
      { code: 'gdcd', name: 'Giáo dục công dân' },
    ];

    // Lưu subjects vào database
    this.logger.log('Creating subjects...');
    await this.createSubjects(subjects);

    // Lấy tất cả subjects để sử dụng khi import điểm
    const allSubjects = await this.subjectRepository.find();
    const subjectsMap: Record<string, Subject> = {};
    allSubjects.forEach(subject => {
      subjectsMap[subject.code] = subject;
    });

    // Đọc toàn bộ CSV file vào bộ nhớ trước
    this.logger.log('Reading entire CSV file...');
    const allRows: CsvRow[] = await this.readCsvFile(filePath);
    this.logger.log(`Read ${allRows.length} rows from CSV file`);
    
    // Xử lý theo batch
    const total = allRows.length;
    let success = 0;
    const batchSize = this.BATCH_SIZE;
    const concurrentBatches = 2; // Số lượng batch xử lý đồng thời
    
    for (let i = 0; i < total; i += batchSize * concurrentBatches) {
      const batchPromises: Promise<number>[] = [];
      
      // Tạo nhiều batch để xử lý đồng thời
      for (let j = 0; j < concurrentBatches; j++) {
        const startIdx = i + j * batchSize;
        if (startIdx >= total) break;
        
        const endIdx = Math.min(startIdx + batchSize, total);
        const currentBatch = allRows.slice(startIdx, endIdx);
        
        this.logger.log(`Starting batch ${startIdx}-${endIdx-1} (${currentBatch.length} rows)`);
        const promise = this.processBatch(currentBatch, subjectsMap)
          .then(processedCount => {
            success += processedCount;
            this.logger.log(`Completed batch ${startIdx}-${endIdx-1}: ${processedCount}/${currentBatch.length} records`);
            return processedCount;
          })
          .catch(error => {
            this.logger.error(`Error in batch ${startIdx}-${endIdx-1}: ${error.message}`);
            return 0;
          });
        
        batchPromises.push(promise);
      }
      
      // Đợi tất cả batch hiện tại hoàn thành trước khi tiếp tục
      try {
        await Promise.all(batchPromises);
        this.logger.log(`Processed ${Math.min(i + batchSize * concurrentBatches, total)}/${total} records so far`);
      } catch (error) {
        this.logger.error(`Error waiting for batches: ${error.message}`);
      }
    }
    
    this.logger.log(`Import completed: ${success}/${total} records processed successfully`);
    return { total, success };
  }

  private async createSubjects(subjects: { code: string; name: string }[]): Promise<void> {
    for (const subject of subjects) {
      const existingSubject = await this.subjectRepository.findOne({
        where: { code: subject.code },
      });
      if (!existingSubject) {
        await this.subjectRepository.save(subject);
      }
    }
  }

  private async processBatch(batch: CsvRow[], subjectsMap: Record<string, Subject>): Promise<number> {
    let processedCount = 0;
    
    try {
      // Lọc các dòng không hợp lệ (student_code rỗng hoặc null)
      const validBatch = batch.filter(row => row.sbd && row.sbd.trim() !== '');
      
      if (validBatch.length === 0) {
        return 0;
      }
      
      // Tạo queryRunner để xử lý transaction
      const queryRunner = this.dataSource.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();
      
      try {
        // 1. Tạo và lấy Students
        const studentIds = validBatch.map(row => row.sbd);
        
        // Tìm students đã tồn tại
        const existingStudents = await this.studentRepository.find({
          where: { id: In(studentIds) },
        });
        
        const existingStudentMap: Record<string, Student> = {};
        existingStudents.forEach(student => {
          existingStudentMap[student.id] = student;
        });
        
        // Chuẩn bị students mới để bulk insert
        const newStudents: Student[] = [];
        for (const row of validBatch) {
          if (!existingStudentMap[row.sbd]) {
            try {
              const student = this.studentRepository.create({
                id: row.sbd,
                studentCode: row.sbd,
                name: "Học sinh " + row.sbd,
                dob: new Date("2006-01-01"),
                foreignLanguageCode: row.ma_ngoai_ngu ? row.ma_ngoai_ngu : undefined,
              });
              newStudents.push(student);
              existingStudentMap[row.sbd] = student;
            } catch (error) {
              this.logger.error(`Error creating student ${row.sbd}: ${error.message}`);
            }
          }
        }
        
        // Bulk insert students mới
        if (newStudents.length > 0) {
          try {
            await queryRunner.manager.save(Student, newStudents);
            this.logger.log(`Inserted ${newStudents.length} new students`);
          } catch (error) {
            this.logger.error(`Error inserting students: ${error.message}`);
            // Thử lưu từng student riêng lẻ
            let savedStudents = 0;
            for (const student of newStudents) {
              try {
                await queryRunner.manager.save(Student, student);
                existingStudentMap[student.id] = student;
                savedStudents++;
              } catch (studentError) {
                this.logger.error(`Error saving individual student ${student.id}: ${studentError.message}`);
              }
            }
            this.logger.log(`Saved ${savedStudents}/${newStudents.length} students individually`);
          }
        }
        
        // 2. Chuẩn bị scores để bulk insert
        const newScores: Score[] = [];
        
        for (const row of validBatch) {
          const student = existingStudentMap[row.sbd];
          if (!student) continue; // Bỏ qua nếu không tìm thấy student
          
          // Tạo score cho mỗi môn học có điểm
          for (const subject of Object.values(subjectsMap)) {
            const scoreValue = row[subject.code];
            if (scoreValue !== undefined && scoreValue !== '') {
              try {
                // Kiểm tra giá trị điểm có hợp lệ hay không
                const parsedScore = this.parseAndValidateScore(scoreValue, row.sbd, subject.code);
                
                // Nếu parseAndValidateScore trả về null, bỏ qua điểm này
                if (parsedScore !== null) {
                  const score = this.scoreRepository.create({
                    student,
                    subject,
                    score: parsedScore,
                  });
                  newScores.push(score);
                }
              } catch (error) {
                this.logger.error(`Error creating score for student ${row.sbd}, subject ${subject.code}: ${error.message}`);
              }
            }
          }
          processedCount++;
        }
        
        // Bulk insert scores
        if (newScores.length > 0) {
          const chunkSize = 500; // Giảm kích thước chunk xuống để giảm khả năng lỗi
          for (let i = 0; i < newScores.length; i += chunkSize) {
            const chunk = newScores.slice(i, i + chunkSize);
            try {
              await queryRunner.manager.save(Score, chunk);
              this.logger.log(`Inserted scores chunk ${i}-${i+chunk.length}: ${chunk.length} scores`);
            } catch (error) {
              this.logger.error(`Error inserting scores chunk ${i}-${i+chunk.length}: ${error.message}`);
              
              // Thử lưu từng bản ghi riêng lẻ để bỏ qua các bản ghi lỗi
              let savedCount = 0;
              for (const singleScore of chunk) {
                try {
                  await queryRunner.manager.save(Score, singleScore);
                  savedCount++;
                } catch (scoreError) {
                  this.logger.error(`Skipping invalid score for student ${singleScore.student.id}, subject ${singleScore.subject.code}: ${scoreError.message}`);
                }
              }
              this.logger.log(`Saved ${savedCount}/${chunk.length} scores individually after bulk error`);
            }
          }
          this.logger.log(`Inserted ${newScores.length} new scores`);
        }
        
        // Commit transaction
        await queryRunner.commitTransaction();
        
      } catch (transactionError) {
        // Rollback transaction nếu có lỗi
        this.logger.error(`Transaction error: ${transactionError.message}`);
        await queryRunner.rollbackTransaction();
        // Không throw lỗi để đảm bảo vẫn có thể xử lý các batch tiếp theo
      } finally {
        // Giải phóng queryRunner
        await queryRunner.release();
      }
    } catch (batchError) {
      this.logger.error(`Fatal batch processing error: ${batchError.message}`);
      // Return partial success count instead of throwing
    }
    
    return processedCount;
  }

  /**
   * Phân tích và xác thực giá trị điểm
   * @param scoreValue Giá trị điểm từ CSV
   * @param studentId ID của học sinh
   * @param subjectCode Mã môn học
   * @returns Điểm đã được xác thực hoặc null nếu không hợp lệ
   */
  private parseAndValidateScore(scoreValue: string, studentId: string, subjectCode: string): number | null {
    // Loại bỏ khoảng trắng nếu có
    const trimmedScore = scoreValue.trim();
    
    // Các trường hợp đặc biệt cần bỏ qua 
    if (
      trimmedScore === '-' || 
      trimmedScore === '--' ||
      trimmedScore.toLowerCase() === 'miễn' ||
      trimmedScore.toLowerCase() === 'miễn thi' ||
      trimmedScore.toLowerCase() === 'miẽn'
    ) {
      this.logger.log(`Skipping special score value "${trimmedScore}" for student ${studentId}, subject ${subjectCode}`);
      return null;
    }
    
    // Chuyển đổi sang số và kiểm tra tính hợp lệ
    const parsedScore = parseFloat(trimmedScore);
    
    // Kiểm tra nếu không phải số hợp lệ
    if (isNaN(parsedScore)) {
      this.logger.warn(`Invalid score value "${trimmedScore}" for student ${studentId}, subject ${subjectCode}`);
      return null;
    }
    
    // Giới hạn giá trị điểm trong khoảng hợp lệ (0-10)
    let validScore = parsedScore;
    if (parsedScore < 0) {
      this.logger.warn(`Score value ${parsedScore} for student ${studentId}, subject ${subjectCode} is below 0. Setting to 0.`);
      validScore = 0;
    }
    
    // Xử lý đặc biệt cho điểm 10
    if (Math.abs(parsedScore - 10) < 0.0001) {
      this.logger.log(`Detected exact score 10 for student ${studentId}, subject ${subjectCode}, setting to 9.99 to avoid MySQL issues`);
      return 9.99;
    }
    
    if (parsedScore > 10) {
      this.logger.warn(`Score value ${parsedScore} for student ${studentId}, subject ${subjectCode} is above 10. Setting to 9.99.`);
      return 9.99;
    }
    
    // Làm tròn đến 2 chữ số thập phân để tránh lỗi precision
    return Math.round(validScore * 100) / 100;
  }

  /**
   * Đọc file CSV và trả về mảng các bản ghi
   */
  private readCsvFile(filePath: string): Promise<CsvRow[]> {
    return new Promise((resolve, reject) => {
      const results: CsvRow[] = [];
      
      fs.createReadStream(filePath)
        .pipe(csvParser())
        .on('data', (data: CsvRow) => {
          results.push(data);
        })
        .on('end', () => {
          resolve(results);
        })
        .on('error', (error) => {
          reject(error);
        });
    });
  }
} 