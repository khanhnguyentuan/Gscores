export interface SubjectStatistic {
    subject: string;
    subjectCode: string;
    count: number;
    average: number;
    min: number | null;
    max: number | null;
    median: number;
    passingRate: string;
  }
  
  export interface PassingRate {
    subject: string;
    subjectCode: string;
    totalStudents: number;
    passingStudents: number;
    passingRate: string;
  }
  
  export interface GenderStatistic {
    count: number;
    average: number;
    passingRate: string;
  }

  export interface ScoreLevelCount {
    range: string;
    count: number;
  }

  export interface ScoreLevelStatistic {
    excellent: ScoreLevelCount;
    good: ScoreLevelCount;
    average: ScoreLevelCount;
    poor: ScoreLevelCount;
    total: number;
  }

  export interface ScoreLevelBySubject {
    subject: string;
    subjectCode: string;
    excellent: number;
    good: number;
    average: number;
    poor: number;
    total: number;
  }

  export interface GroupAStudent {
    rank: number;
    student: {
      id: string;
      name: string;
      studentCode: string;
    };
    scores: {
      toan: number;
      vat_li: number;
      hoa_hoc: number;
    };
    total: number;
    average: number;
  }