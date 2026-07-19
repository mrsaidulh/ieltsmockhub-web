export type TestCategory = 'all' | 'listening' | 'reading' | 'writing' | 'speaking';

export type TestType = 'Academic' | 'General';

export type DifficultyLevel = 'Easy' | 'Medium' | 'Hard';

export interface IELTSTest {
  id: string;
  title: string;
  category: TestCategory;
  type: TestType;
  durationMinutes: number;
  questionsCount: number;
  attemptsCount: number;
  averageScore: number;
  difficulty: DifficultyLevel;
  description: string;
  sections: string[];
}

export interface UserProgress {
  targetBand: number;
  streakDays: number;
  practiceTimeHours: number;
  completedTestsCount: number;
  lastPracticeDate: string;
}

export interface AttemptHistory {
  id: string;
  testId: string;
  testTitle: string;
  category: TestCategory;
  date: string;
  bandScore: number;
  correctAnswers?: number;
  totalQuestions?: number;
  timeSpentMinutes: number;
  examinerFeedback?: string;
}

export interface BandProgressPoint {
  date: string;
  Listening: number;
  Reading: number;
  Writing: number;
  Speaking: number;
  Average: number;
}
