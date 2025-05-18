import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Student } from './entities/student.entity';
import { Score } from '../scores/entities/score.entity';
import { Subject } from '../subjects/entities/subject.entity';

@Injectable()
export class StudentsService {
  constructor(
    @InjectRepository(Student)
    private readonly studentRepository: Repository<Student>,
    @InjectRepository(Score)
    private readonly scoreRepository: Repository<Score>,
  ) {}

  /**
   * Tìm tất cả học sinh với phân trang và tìm kiếm
   */
  async findAll({ page, limit, search }: { page: number; limit: number; search?: string }) {
    const queryBuilder = this.studentRepository.createQueryBuilder('student');

    if (search) {
      queryBuilder.where(
        'student.name LIKE :search OR student.studentCode LIKE :search',
        { search: `%${search}%` },
      );
    }

    const [students, total] = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .orderBy('student.name', 'ASC')
      .getManyAndCount();

    return {
      data: students,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Tìm học sinh theo số báo danh
   */
  async findByCode(code: string): Promise<Student | null> {
    return this.studentRepository.findOne({
      where: { studentCode: code },
    });
  }

  /**
   * Lấy điểm số của học sinh theo số báo danh
   */
  async getStudentScores(code: string) {
    const student = await this.findByCode(code);
    if (!student) return null;

    const scores = await this.scoreRepository
      .createQueryBuilder('score')
      .innerJoinAndSelect('score.subject', 'subject')
      .where('score.student_id = :studentId', { studentId: student.id })
      .orderBy('subject.name', 'ASC')
      .getMany();

    return {
      student,
      scores: scores.map(score => ({
        subject: score.subject.name,
        subjectCode: score.subject.code,
        score: score.score,
      })),
    };
  }

  /**
   * Lấy tổng hợp điểm số và xếp hạng của học sinh
   */
  async getStudentSummary(code: string) {
    const student = await this.findByCode(code);
    if (!student) return null;

    const scores = await this.scoreRepository
      .createQueryBuilder('score')
      .innerJoinAndSelect('score.subject', 'subject')
      .where('score.student_id = :studentId', { studentId: student.id })
      .getMany();

    // Tính điểm trung bình
    const totalScore = scores.reduce((sum, score) => sum + Number(score.score), 0);
    const averageScore = scores.length > 0 ? totalScore / scores.length : 0;

    // Tính xếp hạng
    const rank = await this.calculateRank(student.id, averageScore);

    return {
      student,
      summary: {
        totalSubjects: scores.length,
        averageScore: averageScore.toFixed(2),
        highestScore: Math.max(...scores.map(s => Number(s.score)), 0).toFixed(2),
        lowestScore: scores.length > 0 ? Math.min(...scores.map(s => Number(s.score))).toFixed(2) : 'N/A',
        rank,
      },
      scores: scores.map(score => ({
        subject: score.subject.name,
        subjectCode: score.subject.code,
        score: score.score,
      })),
    };
  }

  /**
   * Tính xếp hạng của học sinh dựa trên điểm trung bình
   */
  private async calculateRank(studentId: string, averageScore: number): Promise<{ rank: number; totalStudents: number }> {
    // Lấy danh sách tất cả học sinh kèm điểm trung bình
    const studentsWithAvg = await this.studentRepository
      .createQueryBuilder('student')
      .leftJoin('student.scores', 'score')
      .select('student.id', 'id')
      .addSelect('AVG(score.score)', 'average')
      .groupBy('student.id')
      .orderBy('average', 'DESC')
      .getRawMany();

    // Tìm xếp hạng của học sinh hiện tại
    const totalStudents = studentsWithAvg.length;
    const studentRank = studentsWithAvg.findIndex(s => s.id === studentId) + 1;

    return {
      rank: studentRank,
      totalStudents,
    };
  }
} 