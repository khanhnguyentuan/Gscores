import { Test, TestingModule } from '@nestjs/testing';
import { ReportsController } from '../src/modules/reports/reports.controller';
import { ReportsService } from '../src/modules/reports/reports.service';

// Mock data
const mockSubjectStatistics = [
  {
    subject: 'Toán',
    subjectCode: 'MATH',
    count: 100,
    average: 7.5,
    min: 3.0,
    max: 10.0,
    median: 7.5,
    passingRate: '85.00%',
  },
  {
    subject: 'Văn',
    subjectCode: 'LIT',
    count: 100,
    average: 6.8,
    min: 2.5,
    max: 9.5,
    median: 7.0,
    passingRate: '78.00%',
  },
];

const mockStudentRankings = [
  {
    rank: 1,
    id: 1,
    name: 'Nguyễn Văn A',
    studentCode: 'S001',
    gender: 'Nam',
    averageScore: '9.50',
  },
  {
    rank: 2,
    id: 2,
    name: 'Trần Thị B',
    studentCode: 'S002',
    gender: 'Nữ',
    averageScore: '9.25',
  },
];

// Mock service
const mockReportsService = {
  getSubjectStatistics: jest.fn().mockResolvedValue(mockSubjectStatistics),
  getStudentRankings: jest.fn().mockResolvedValue(mockStudentRankings),
  getScoreDistribution: jest.fn(),
  getGenderAnalysis: jest.fn(),
  getTopStudentsBySubject: jest.fn(),
  getPassingRates: jest.fn(),
};

describe('ReportsController', () => {
  let controller: ReportsController;
  let service: ReportsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReportsController],
      providers: [
        {
          provide: ReportsService,
          useValue: mockReportsService,
        },
      ],
    }).compile();

    controller = module.get<ReportsController>(ReportsController);
    service = module.get<ReportsService>(ReportsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getSubjectStatistics', () => {
    it('should return subject statistics', async () => {
      expect(await controller.getSubjectStatistics()).toBe(mockSubjectStatistics);
      expect(mockReportsService.getSubjectStatistics).toHaveBeenCalled();
    });
  });

  describe('getStudentRankings', () => {
    it('should return student rankings with default limit', async () => {
      expect(await controller.getStudentRankings(10)).toBe(mockStudentRankings);
      expect(mockReportsService.getStudentRankings).toHaveBeenCalledWith(10);
    });

    it('should return student rankings with custom limit', async () => {
      mockReportsService.getStudentRankings.mockResolvedValueOnce(mockStudentRankings.slice(0, 1));
      
      expect(await controller.getStudentRankings(1)).toEqual([mockStudentRankings[0]]);
      expect(mockReportsService.getStudentRankings).toHaveBeenCalledWith(1);
    });
  });

  describe('getScoreDistribution', () => {
    it('should return score distribution for all subjects', async () => {
      const mockDistribution = {
        distribution: [
          { min: 0, max: 1, label: '0-1', count: 5 },
          // ...other ranges
        ],
        total: 100,
        subjectCode: undefined,
      };
      
      mockReportsService.getScoreDistribution.mockResolvedValueOnce(mockDistribution);
      
      expect(await controller.getScoreDistribution()).toBe(mockDistribution);
      expect(mockReportsService.getScoreDistribution).toHaveBeenCalledWith(undefined);
    });

    it('should return score distribution for a specific subject', async () => {
      const mockDistribution = {
        distribution: [
          { min: 0, max: 1, label: '0-1', count: 2 },
          // ...other ranges
        ],
        total: 50,
        subjectCode: 'MATH',
      };
      
      mockReportsService.getScoreDistribution.mockResolvedValueOnce(mockDistribution);
      
      expect(await controller.getScoreDistribution('MATH')).toBe(mockDistribution);
      expect(mockReportsService.getScoreDistribution).toHaveBeenCalledWith('MATH');
    });
  });

  describe('getTopStudentsBySubject', () => {
    it('should return top students for a subject', async () => {
      const mockTopStudents = {
        subject: 'Toán',
        subjectCode: 'MATH',
        topStudents: [
          {
            rank: 1,
            student: {
              id: 1,
              name: 'Nguyễn Văn A',
              studentCode: 'S001',
              gender: 'Nam',
            },
            score: 10,
          },
        ],
      };
      
      mockReportsService.getTopStudentsBySubject.mockResolvedValueOnce(mockTopStudents);
      
      expect(await controller.getTopStudentsBySubject('MATH', 10)).toBe(mockTopStudents);
      expect(mockReportsService.getTopStudentsBySubject).toHaveBeenCalledWith('MATH', 10);
    });
  });
}); 