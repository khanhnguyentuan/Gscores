export interface StudentScore {
  sbd: string;
  toan: number;
  vat_li: number;
  hoa_hoc: number;
  total: number;
}

export interface ScoreStatistics {
  [subjectCode: string]: {
    level1: number; // >= 8
    level2: number; // >= 6 và < 8
    level3: number; // >= 4 và < 6
    level4: number; // < 4
    subjectName: string;
    total: number;
  };
} 