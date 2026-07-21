export type TestCategory = 'all' | 'listening' | 'reading' | 'writing' | 'speaking';

export type TestType = 'Academic' | 'General';

export interface StudentLead {
  name: string;
  email: string;
  phone: string;
  verified: boolean;
  otpSent?: boolean;
  password?: string;
}

export type QuestionType = 
  | 'MCQ' 
  | 'TrueFalseNotGiven' 
  | 'YesNoNotGiven' 
  | 'MatchingHeadings' 
  | 'MatchingInfo' 
  | 'MatchingFeatures' 
  | 'MatchingSentenceEndings' 
  | 'SentenceCompletion' 
  | 'SummaryCompletion' 
  | 'DiagramCompletion' 
  | 'ShortAnswer'
  | 'Blanks';

export interface PassageBlock {
  id: string;
  type: 'paragraph' | 'heading' | 'image' | 'table';
  content: string; // text or cell data (JSON) or caption
  imageUrl?: string;
  caption?: string;
}

export interface IELTSQuestion {
  id: string;
  type: QuestionType;
  questionText: string;
  options?: string[]; // For MCQ, MatchingInfo, MatchingFeatures, MatchingSentenceEndings, etc.
  correctAnswer: string;
  explanation: string;
  headingOptions?: string[]; // Specifically for matching paragraph headings
  passageNumber?: number; // Passage number (e.g., 1, 2, 3 for Reading; or Part 1, 2, 3, 4 for Listening)
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
  description: string;
  sections: string[];
  questions?: IELTSQuestion[]; // Embedded interactive questions
  passage?: string; // Custom reading passage text (legacy)
  passageBlocks?: PassageBlock[]; // Modern block-based content
  audioUrl?: string; // Listening audio stream source URL
  audioScript?: string; // Listening audio spoken transcript script
  year?: number; // Release/Publication Year of the test
  bookNumber: number; // e.g., 21 for Cambridge IELTS Book 21
  testNumber: number; // e.g., 1 for Test 1
  bookYear: number;
  passageNumber: number;
  questionTypes: QuestionType[];
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


