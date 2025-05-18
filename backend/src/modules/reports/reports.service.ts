import { Injectable, Inject, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, DataSource } from 'typeorm';
import { Student } from '../students/entities/student.entity';
import { Score } from '../scores/entities/score.entity';
import { Subject } from '../subjects/entities/subject.entity';
import { SubjectStatistic, PassingRate, GenderStatistic, ScoreLevelStatistic, ScoreLevelBySubject, GroupAStudent } from './interfaces/report.interfaces';
import { Cache } from '@nestjs/cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

@Injectable()
export class ReportsService {
  private readonly logger = new Logger(ReportsService.name);
  private readonly CACHE_DURATION = 3600; // 1 giờ cache

  // Định nghĩa constant cho các khoảng điểm
  private readonly SCORE_RANGES = [
    { min: 0, max: 1, label: '0-1', count: 0 },
    { min: 1, max: 2, label: '1-2', count: 0 },
    { min: 2, max: 3, label: '2-3', count: 0 },
    { min: 3, max: 4, label: '3-4', count: 0 },
    { min: 4, max: 5, label: '4-5', count: 0 },
    { min: 5, max: 6, label: '5-6', count: 0 },
    { min: 6, max: 7, label: '6-7', count: 0 },
    { min: 7, max: 8, label: '7-8', count: 0 },
    { min: 8, max: 9, label: '8-9', count: 0 },
    { min: 9, max: 10, label: '9-10', count: 0 },
  ];

  // Định nghĩa constant cho các cấp độ điểm
  private readonly SCORE_LEVELS = {
    excellent: { min: 8, max: 10, label: '≥ 8' },
    good: { min: 6, max: 8, label: '6-8' },
    average: { min: 4, max: 6, label: '4-6' },
    poor: { min: 0, max: 4, label: '< 4' }
  };
  
  constructor(
    @InjectRepository(Student)
    private readonly studentRepository: Repository<Student>,
    @InjectRepository(Score)
    private readonly scoreRepository: Repository<Score>,
    @InjectRepository(Subject)
    private readonly subjectRepository: Repository<Subject>,
    private dataSource: DataSource,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  /**
   * Thống kê điểm số theo môn học
   */
  async getSubjectStatistics(): Promise<SubjectStatistic[]> {
    // Lấy thông tin cơ bản về môn học và các chỉ số thống kê trong một query
    const basicStats = await this.scoreRepository
      .createQueryBuilder('score')
      .innerJoin('score.subject', 'subject')
      .select('subject.id', 'subjectId')
      .addSelect('subject.name', 'subjectName')
      .addSelect('subject.code', 'subjectCode')
      .addSelect('COUNT(score.id)', 'count')
      .addSelect('AVG(score.score)', 'average')
      .addSelect('MIN(score.score)', 'min')
      .addSelect('MAX(score.score)', 'max')
      .addSelect('SUM(CASE WHEN score.score >= 5 THEN 1 ELSE 0 END)', 'passingCount')
      .groupBy('subject.id')
      .addGroupBy('subject.name')
      .addGroupBy('subject.code')
      .getRawMany();

    // Xử lý kết quả và tính các chỉ số phức tạp hơn
    const statistics: SubjectStatistic[] = await Promise.all(
      basicStats.map(async (stat) => {
        // Lấy tất cả điểm của môn học để tính median (không thể tính bằng SQL thuần)
        const scores = await this.scoreRepository
          .createQueryBuilder('score')
          .innerJoin('score.subject', 'subject')
          .where('subject.id = :subjectId', { subjectId: stat.subjectId })
          .select('score.score')
          .getRawMany();

        const scoreValues = scores.map(s => Number(s.score_score));
        const passingRate = stat.count > 0 
          ? (Number(stat.passingCount) / Number(stat.count) * 100).toFixed(2) + '%' 
          : '0.00%';

        return {
          subject: stat.subjectName,
          subjectCode: stat.subjectCode,
          count: Number(stat.count),
          average: Number(Number(stat.average).toFixed(2)),
          min: Number(stat.min),
          max: Number(stat.max),
          median: this.calculateMedian(scoreValues),
          passingRate: passingRate,
        };
      })
    );

    return statistics;
  }

  /**
   * Xếp hạng học sinh theo điểm trung bình
   */
  async getStudentRankings(limit: number = 100, offset: number = 0) {
    // Lấy tất cả học sinh và tính điểm trung bình với phân trang
    const rankings = await this.studentRepository
      .createQueryBuilder('student')
      .leftJoinAndSelect('student.scores', 'score')
      .leftJoinAndSelect('score.subject', 'subject')
      .select('student.id', 'id')
      .addSelect('student.name', 'name')
      .addSelect('student.studentCode', 'studentCode')
      .addSelect('student.gender', 'gender')
      .addSelect('AVG(score.score)', 'averageScore')
      .groupBy('student.id')
      .addGroupBy('student.name')
      .addGroupBy('student.studentCode')
      .addGroupBy('student.gender')
      .orderBy('averageScore', 'DESC')
      .limit(limit)
      .offset(offset)
      .getRawMany();

    // Tính tổng số học sinh để hỗ trợ phân trang
    const totalCount = await this.studentRepository
      .createQueryBuilder('student')
      .getCount();

    // Format kết quả
    return {
      data: rankings.map((item, index) => ({
        rank: offset + index + 1,
        id: item.id,
        name: item.name,
        studentCode: item.studentCode,
        gender: item.gender,
        averageScore: Number(item.averageScore).toFixed(2),
      })),
      pagination: {
        total: totalCount,
        limit,
        offset,
      }
    };
  }

  /**
   * Phân phối điểm số theo khoảng
   */
  async getScoreDistribution(subjectCode?: string) {
    let query = this.scoreRepository
      .createQueryBuilder('score')
      .innerJoin('score.subject', 'subject')
      .select('score.score', 'score');

    if (subjectCode) {
      query = query.where('subject.code = :subjectCode', { subjectCode });
    }

    const scores = await query.getRawMany();
    const scoreValues = scores.map(s => Number(s.score));

    // Sử dụng SCORE_RANGES đã định nghĩa
    const ranges = JSON.parse(JSON.stringify(this.SCORE_RANGES)); // Clone để không ảnh hưởng đến constant

    // Đếm số lượng điểm trong mỗi khoảng
    scoreValues.forEach(score => {
      for (const range of ranges) {
        if (score >= range.min && score < range.max) {
          range.count++;
          break;
        } else if (range.max === 10 && score === 10) {
          // Trường hợp đặc biệt cho điểm 10
          range.count++;
          break;
        }
      }
    });

    return {
      distribution: ranges,
      total: scoreValues.length,
      subjectCode,
    };
  }

  /**
   * Phân tích điểm số theo giới tính
   */
  async getGenderAnalysis() {
    // Thực hiện một truy vấn GROUP BY để lấy thống kê theo giới tính
    const genderStats = await this.scoreRepository
      .createQueryBuilder('score')
      .innerJoin('score.student', 'student')
      .select('student.gender', 'gender')
      .addSelect('COUNT(DISTINCT student.id)', 'studentCount')
      .addSelect('AVG(score.score)', 'average')
      .addSelect('COUNT(score.id)', 'totalScores')
      .addSelect('SUM(CASE WHEN score.score >= 5 THEN 1 ELSE 0 END)', 'passingScores')
      .groupBy('student.gender')
      .getRawMany();

    // Xử lý kết quả để đúng định dạng
    const genderMap = {};
    genderStats.forEach(stat => {
      const passingRate = Number(stat.totalScores) > 0 
        ? (Number(stat.passingScores) / Number(stat.totalScores) * 100).toFixed(2) + '%' 
        : '0.00%';
      
      genderMap[stat.gender?.toLowerCase() || 'unknown'] = {
        count: Number(stat.studentCount),
        average: Number(Number(stat.average).toFixed(2)),
        passingRate,
      };
    });

    // Đảm bảo luôn có dữ liệu cho nam và nữ
    const males = genderMap['nam'] || { count: 0, average: 0, passingRate: '0.00%' };
    const females = genderMap['nữ'] || { count: 0, average: 0, passingRate: '0.00%' };

    return {
      male: males,
      female: females,
      comparison: {
        averageDifference: (males.average - females.average).toFixed(2),
        passingRateDifference: (
          parseFloat(males.passingRate) - parseFloat(females.passingRate)
        ).toFixed(2) + '%',
      },
    };
  }

  /**
   * Top học sinh có điểm cao nhất theo môn học
   */
  async getTopStudentsBySubject(subjectCode: string, limit: number = 10, offset: number = 0) {
    const subject = await this.subjectRepository.findOne({
      where: { code: subjectCode },
    });

    if (!subject) {
      return {
        error: 'Không tìm thấy môn học này',
      };
    }

    const topScores = await this.scoreRepository
      .createQueryBuilder('score')
      .innerJoin('score.subject', 'subject')
      .innerJoinAndSelect('score.student', 'student')
      .where('subject.code = :subjectCode', { subjectCode })
      .orderBy('score.score', 'DESC')
      .limit(limit)
      .offset(offset)
      .getMany();

    // Đếm tổng số học sinh có điểm cho môn học này
    const totalCount = await this.scoreRepository
      .createQueryBuilder('score')
      .innerJoin('score.subject', 'subject')
      .where('subject.code = :subjectCode', { subjectCode })
      .getCount();

    return {
      subject: subject.name,
      subjectCode: subject.code,
      topStudents: topScores.map((score, index) => ({
        rank: offset + index + 1,
        student: {
          id: score.student.id,
          name: score.student.name,
          studentCode: score.student.studentCode,
          gender: score.student.gender,
        },
        score: score.score,
      })),
      pagination: {
        total: totalCount,
        limit,
        offset
      }
    };
  }

  /**
   * Tỷ lệ đạt (điểm >= 5) theo từng môn học
   */
  async getPassingRates(): Promise<PassingRate[]> {
    // Thực hiện với một truy vấn duy nhất thay vì lặp từng môn
    const passingRates = await this.scoreRepository
      .createQueryBuilder('score')
      .innerJoin('score.subject', 'subject')
      .select('subject.id', 'subjectId')
      .addSelect('subject.name', 'subjectName')
      .addSelect('subject.code', 'subjectCode')
      .addSelect('COUNT(score.id)', 'totalStudents')
      .addSelect('SUM(CASE WHEN score.score >= 5 THEN 1 ELSE 0 END)', 'passingStudents')
      .groupBy('subject.id')
      .addGroupBy('subject.name')
      .addGroupBy('subject.code')
      .getRawMany();

    // Format kết quả
    return passingRates.map(rate => {
      const totalStudents = Number(rate.totalStudents);
      const passingStudents = Number(rate.passingStudents);
      const passingRate = totalStudents > 0 
        ? (passingStudents / totalStudents * 100).toFixed(2) + '%' 
        : '0.00%';

      return {
        subject: rate.subjectName,
        subjectCode: rate.subjectCode,
        totalStudents,
        passingStudents,
        passingRate,
      };
    });
  }

  /**
   * Tính trung bình của một mảng số
   */
  private calculateAverage(values: number[]): number {
    if (!values.length) return 0;
    const sum = values.reduce((a, b) => a + b, 0);
    return parseFloat((sum / values.length).toFixed(2));
  }

  /**
   * Tính trung vị của một mảng số
   */
  private calculateMedian(values: number[]): number {
    if (!values.length) return 0;
    
    const sorted = [...values].sort((a, b) => a - b);
    const middle = Math.floor(sorted.length / 2);
    
    if (sorted.length % 2 === 0) {
      return parseFloat(((sorted[middle - 1] + sorted[middle]) / 2).toFixed(2));
    } else {
      return parseFloat(sorted[middle].toFixed(2));
    }
  }

  /**
   * Thống kê số lượng học sinh theo 4 cấp độ điểm
   */
  async getScoreLevels(subjectCode?: string): Promise<ScoreLevelStatistic> {
    // Tạo cache key dựa trên tham số
    const cacheKey = `score_levels_${subjectCode || 'all'}`;
    
    // Kiểm tra cache
    const cachedData = await this.cacheManager.get<ScoreLevelStatistic>(cacheKey);
    if (cachedData) {
      this.logger.log(`Cache hit for ${cacheKey}`);
      return cachedData;
    }
    
    this.logger.log(`Cache miss for ${cacheKey}, querying database...`);
    
    // Tạo truy vấn tối ưu sử dụng CASE statement trong SQL
    const queryBuilder = this.scoreRepository
      .createQueryBuilder('score')
      .innerJoin('score.subject', 'subject')
      .select(`COUNT(score.id)`, 'total')
      .addSelect(`SUM(CASE WHEN score.score >= ${this.SCORE_LEVELS.excellent.min} THEN 1 ELSE 0 END)`, 'excellent')
      .addSelect(`SUM(CASE WHEN score.score >= ${this.SCORE_LEVELS.good.min} AND score.score < ${this.SCORE_LEVELS.good.max} THEN 1 ELSE 0 END)`, 'good')
      .addSelect(`SUM(CASE WHEN score.score >= ${this.SCORE_LEVELS.average.min} AND score.score < ${this.SCORE_LEVELS.average.max} THEN 1 ELSE 0 END)`, 'average')
      .addSelect(`SUM(CASE WHEN score.score < ${this.SCORE_LEVELS.poor.max} THEN 1 ELSE 0 END)`, 'poor');
    
    if (subjectCode) {
      queryBuilder.where('subject.code = :subjectCode', { subjectCode });
    }
    
    const result = await queryBuilder.getRawOne();
    
    // Format kết quả
    const levels: ScoreLevelStatistic = {
      excellent: {
        range: this.SCORE_LEVELS.excellent.label,
        count: Number(result.excellent) || 0
      },
      good: {
        range: this.SCORE_LEVELS.good.label,
        count: Number(result.good) || 0
      },
      average: {
        range: this.SCORE_LEVELS.average.label,
        count: Number(result.average) || 0
      },
      poor: {
        range: this.SCORE_LEVELS.poor.label,
        count: Number(result.poor) || 0
      },
      total: Number(result.total) || 0
    };
    
    // Lưu vào cache
    await this.cacheManager.set(cacheKey, levels, this.CACHE_DURATION);
    
    return levels;
  }

  /**
   * Thống kê số lượng học sinh theo 4 cấp độ điểm cho từng môn học
   */
  async getScoreLevelsBySubject(): Promise<ScoreLevelBySubject[]> {
    const cacheKey = 'score_levels_by_subject';
    
    // Kiểm tra cache
    const cachedData = await this.cacheManager.get<ScoreLevelBySubject[]>(cacheKey);
    if (cachedData) {
      this.logger.log(`Cache hit for ${cacheKey}`);
      return cachedData;
    }
    
    this.logger.log(`Cache miss for ${cacheKey}, querying database...`);
    
    // Thực hiện truy vấn tối ưu với một lần query duy nhất
    const results = await this.scoreRepository
      .createQueryBuilder('score')
      .innerJoin('score.subject', 'subject')
      .select('subject.name', 'subject')
      .addSelect('subject.code', 'subjectCode')
      .addSelect('COUNT(score.id)', 'total')
      .addSelect(`SUM(CASE WHEN score.score >= ${this.SCORE_LEVELS.excellent.min} THEN 1 ELSE 0 END)`, 'excellent')
      .addSelect(`SUM(CASE WHEN score.score >= ${this.SCORE_LEVELS.good.min} AND score.score < ${this.SCORE_LEVELS.good.max} THEN 1 ELSE 0 END)`, 'good')
      .addSelect(`SUM(CASE WHEN score.score >= ${this.SCORE_LEVELS.average.min} AND score.score < ${this.SCORE_LEVELS.average.max} THEN 1 ELSE 0 END)`, 'average')
      .addSelect(`SUM(CASE WHEN score.score < ${this.SCORE_LEVELS.poor.max} THEN 1 ELSE 0 END)`, 'poor')
      .groupBy('subject.id')
      .addGroupBy('subject.name')
      .addGroupBy('subject.code')
      .getRawMany();
      
    // Format kết quả
    const formattedResults = results.map(r => ({
      subject: r.subject,
      subjectCode: r.subjectCode,
      excellent: Number(r.excellent) || 0,
      good: Number(r.good) || 0,
      average: Number(r.average) || 0,
      poor: Number(r.poor) || 0,
      total: Number(r.total) || 0
    }));
    
    // Lưu vào cache
    await this.cacheManager.set(cacheKey, formattedResults, this.CACHE_DURATION);
    
    return formattedResults;
  }

  /**
   * Lấy top học sinh khối A (toán, lý, hóa)
   */
  async getTopStudentsGroupA(limit = 10, offset = 0) {
    const cacheKey = `top_students_group_a_${limit}_${offset}`;
    
    // Kiểm tra cache
    const cachedData = await this.cacheManager.get(cacheKey);
    if (cachedData) {
      this.logger.log(`Cache hit for ${cacheKey}`);
      return cachedData;
    }
    
    this.logger.log(`Cache miss for ${cacheKey}, querying database...`);
    
    // Lấy ID của các môn khối A
    const [toan, vatLy, hoaHoc] = await Promise.all([
      this.subjectRepository.findOne({ where: { code: 'toan' } }),
      this.subjectRepository.findOne({ where: { code: 'vat_li' } }),
      this.subjectRepository.findOne({ where: { code: 'hoa_hoc' } })
    ]);
    
    if (!toan || !vatLy || !hoaHoc) {
      return {
        topStudents: [],
        pagination: { total: 0, limit, offset }
      };
    }
    
    // Thực hiện truy vấn tối ưu với JOIN và CASE
    const queryResult = await this.scoreRepository
      .createQueryBuilder('score')
      .innerJoin('score.subject', 'subject')
      .innerJoin('score.student', 'student')
      .where('subject.code IN (:...subjectCodes)', { 
        subjectCodes: ['toan', 'vat_li', 'hoa_hoc'] 
      })
      .select('student.id', 'studentId')
      .addSelect('student.name', 'studentName')
      .addSelect('student.studentCode', 'studentCode')
      .addSelect(`
        SUM(CASE 
          WHEN subject.code = 'toan' THEN score.score 
          ELSE 0 
        END)`, 'toan')
      .addSelect(`
        SUM(CASE 
          WHEN subject.code = 'vat_li' THEN score.score 
          ELSE 0 
        END)`, 'vat_li')
      .addSelect(`
        SUM(CASE 
          WHEN subject.code = 'hoa_hoc' THEN score.score 
          ELSE 0 
        END)`, 'hoa_hoc')
      .addSelect(`(
        SUM(CASE WHEN subject.code = 'toan' THEN score.score ELSE 0 END) +
        SUM(CASE WHEN subject.code = 'vat_li' THEN score.score ELSE 0 END) +
        SUM(CASE WHEN subject.code = 'hoa_hoc' THEN score.score ELSE 0 END)
      )`, 'total')
      .addSelect(`(
        SUM(CASE WHEN subject.code = 'toan' THEN score.score ELSE 0 END) +
        SUM(CASE WHEN subject.code = 'vat_li' THEN score.score ELSE 0 END) +
        SUM(CASE WHEN subject.code = 'hoa_hoc' THEN score.score ELSE 0 END)
      ) / 3`, 'average')
      .groupBy('student.id')
      .addGroupBy('student.name')
      .addGroupBy('student.studentCode')
      .having('COUNT(DISTINCT subject.code) = 3')
      .orderBy('total', 'DESC');
    
    // Đếm tổng số học sinh có đủ 3 môn khối A
    const countQueryResult = await queryResult.getCount();
    
    // Áp dụng phân trang
    const pagedQueryResult = await queryResult
      .offset(offset)
      .limit(limit)
      .getRawMany();
    
    // Format kết quả
    const topStudents = pagedQueryResult.map((item, index) => ({
      rank: offset + index + 1,
      student: {
        id: item.studentId,
        name: item.studentName,
        studentCode: item.studentCode
      },
      scores: {
        toan: Number(item.toan) || 0,
        vat_li: Number(item.vat_li) || 0,
        hoa_hoc: Number(item.hoa_hoc) || 0
      },
      total: Number(Number(item.total).toFixed(2)),
      average: Number(Number(item.average).toFixed(2))
    }));
    
    const result = {
      topStudents,
      pagination: {
        total: countQueryResult,
        limit,
        offset
      }
    };
    
    // Lưu vào cache
    await this.cacheManager.set(cacheKey, result, this.CACHE_DURATION);
    
    return result;
  }

  /**
   * Preload dữ liệu báo cáo vào cache (có thể chạy định kỳ bởi cron job)
   */
  async preloadReportData(): Promise<void> {
    this.logger.log('Preloading report data into cache...');
    
    // Preload score levels
    await this.getScoreLevels();
    
    // Preload score levels by subject
    await this.getScoreLevelsBySubject();
    
    // Preload top students of group A
    await this.getTopStudentsGroupA(10, 0);
    
    this.logger.log('Preloaded report data successfully');
  }

  /**
   * Tạo chỉ mục để tăng hiệu suất (gọi một lần khi setup database)
   */
  async createPerformanceIndexes(): Promise<void> {
    this.logger.log('Creating performance indexes...');
    
    try {
      // Tạo chỉ mục cho cột score
      await this.dataSource.query(`
        CREATE INDEX IF NOT EXISTS idx_score_value ON scores (score);
      `);
      
      // Tạo chỉ mục cho subject_code
      await this.dataSource.query(`
        CREATE INDEX IF NOT EXISTS idx_subject_code ON subjects (code);
      `);
      
      this.logger.log('Created performance indexes successfully');
    } catch (error) {
      this.logger.error(`Error creating indexes: ${error.message}`);
    }
  }
}