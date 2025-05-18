import { Test, TestingModule } from '@nestjs/testing';
import { StudentsController } from '../src/modules/students/students.controller';
import { StudentsService } from '../src/modules/students/students.service';
import { NotFoundException } from '@nestjs/common';

// Mock data
const mockStudent = {
  id: 1,
  studentCode: 'S001',
  name: 'Nguyễn Văn A',
  dob: new Date('2006-01-01'),
  gender: 'Nam',
  classId: '12A1',
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockScores = {
  student: mockStudent,
  scores: [
    { subject: 'Toán', subjectCode: 'MATH', score: 8.5 },
    { subject: 'Văn', subjectCode: 'LIT', score: 7.0 },
  ],
};

const mockSummary = {
  student: mockStudent,
  summary: {
    totalSubjects: 2,
    averageScore: '7.75',
    highestScore: '8.50',
    lowestScore: '7.00',
    rank: { rank: 5, totalStudents: 100 },
  },
  scores: mockScores.scores,
};

// Mock service
const mockStudentsService = {
  findAll: jest.fn(),
  findByCode: jest.fn(),
  getStudentScores: jest.fn(),
  getStudentSummary: jest.fn(),
};

describe('StudentsController', () => {
  let controller: StudentsController;
  let service: StudentsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StudentsController],
      providers: [
        {
          provide: StudentsService,
          useValue: mockStudentsService,
        },
      ],
    }).compile();

    controller = module.get<StudentsController>(StudentsController);
    service = module.get<StudentsService>(StudentsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return paginated students', async () => {
      const result = {
        data: [mockStudent],
        meta: { total: 1, page: 1, limit: 10, totalPages: 1 },
      };
      
      mockStudentsService.findAll.mockResolvedValue(result);

      expect(await controller.findAll(1, 10)).toBe(result);
      expect(mockStudentsService.findAll).toHaveBeenCalledWith({
        page: 1,
        limit: 10,
        search: undefined,
      });
    });
  });

  describe('findByCode', () => {
    it('should return a student by code', async () => {
      mockStudentsService.findByCode.mockResolvedValue(mockStudent);

      expect(await controller.findByCode('S001')).toBe(mockStudent);
      expect(mockStudentsService.findByCode).toHaveBeenCalledWith('S001');
    });

    it('should throw NotFoundException if student not found', async () => {
      mockStudentsService.findByCode.mockResolvedValue(null);

      await expect(controller.findByCode('UNKNOWN')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getStudentScores', () => {
    it('should return student scores', async () => {
      mockStudentsService.getStudentScores.mockResolvedValue(mockScores);

      expect(await controller.getStudentScores('S001')).toBe(mockScores);
      expect(mockStudentsService.getStudentScores).toHaveBeenCalledWith('S001');
    });

    it('should throw NotFoundException if student not found', async () => {
      mockStudentsService.getStudentScores.mockResolvedValue(null);

      await expect(controller.getStudentScores('UNKNOWN')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getStudentSummary', () => {
    it('should return student summary', async () => {
      mockStudentsService.getStudentSummary.mockResolvedValue(mockSummary);

      expect(await controller.getStudentSummary('S001')).toBe(mockSummary);
      expect(mockStudentsService.getStudentSummary).toHaveBeenCalledWith('S001');
    });

    it('should throw NotFoundException if student not found', async () => {
      mockStudentsService.getStudentSummary.mockResolvedValue(null);

      await expect(controller.getStudentSummary('UNKNOWN')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
}); 