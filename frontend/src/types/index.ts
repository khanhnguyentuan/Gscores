export interface Student {
  id: number;
  name: string;
  code: string; // registration number
  group?: string;
  class?: string;
  foreignLanguageCode?: string;
}

export interface Score {
  id: number;
  value: number;
  student_id: number;
  subject_id: number;
  subject_name: string;
  subject_code: string;
}

export interface StudentWithScores extends Student {
  scores: Score[];
  average_score?: number;
  rank?: number;
}

export interface Subject {
  id: number;
  name: string;
  code: string;
}

export interface ScoreLevelCount {
  excellent: number; // >= 8 points
  good: number; // >= 6 points & < 8 points
  average: number; // >= 4 points & < 6 points
  weak: number; // < 4 points
}

export interface ScoreLevelBySubject {
  subject_code: string;
  subject_name: string;
  levels: ScoreLevelCount;
}

export interface TopStudent {
  id: number;
  name: string;
  code: string;
  math_score: number;
  physics_score: number;
  chemistry_score: number;
  total_score: number;
  rank: number;
} 