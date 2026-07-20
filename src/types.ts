export type TestCategory = 'all' | 'listening' | 'reading' | 'writing' | 'speaking';

export type TestType = 'Academic' | 'General';

export type DifficultyLevel = 'Easy' | 'Medium' | 'Hard';

export interface StudentLead {
  name: string;
  email: string;
  phone: string;
  verified: boolean;
  otpSent?: boolean;
}

export type QuestionType = 'MCQ' | 'MatchingHeadings' | 'TrueFalseNotGiven' | 'Blanks';

export interface IELTSQuestion {
  id: string;
  type: QuestionType;
  questionText: string;
  options?: string[]; // For MCQ or MatchingHeadings list
  correctAnswer: string;
  explanation: string;
  headingOptions?: string[]; // Specifically for matching paragraph headings
}

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
  questions?: IELTSQuestion[]; // Embedded interactive questions
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
  userAnswers?: Record<string, string>; // Maps questionId -> answer
}

export interface BandProgressPoint {
  date: string;
  Listening: number;
  Reading: number;
  Writing: number;
  Speaking: number;
  Average: number;
}

export interface VocabularyWord {
  id: string;
  word: string;
  definition: string;
  exampleSentence?: string;
  sourceTestId?: string;
  sourceTestTitle?: string;
  dateAdded: string;
  mastered: boolean;
}


