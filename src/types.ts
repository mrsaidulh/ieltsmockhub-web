export type TestCategory = 'all' | 'listening' | 'reading' | 'writing' | 'speaking';

export type TestType = 'Academic' | 'General';

export type AdminRole = 'Administrator' | 'ContentManager';

export interface AdminUser {
  username: string;
  role: AdminRole;
  displayName: string;
}

export interface StudentLead {
  name: string;
  email: string;
  phone: string;
  verified: boolean;
  otpSent?: boolean;
  password?: string;
  isLocked?: boolean;
  passwordLastReset?: string;
  createdAt?: string; // YYYY-MM-DD
  lastActiveDate?: string; // YYYY-MM-DD
  testsCompletedCount?: number;
  lastTestDate?: string; // YYYY-MM-DD
  reminderSentDate?: string; // YYYY-MM-DD
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

export interface CriterionDetail {
  score: number; // Band score 0.0 - 9.0
  reason: string; // Justification for the awarded band score
  advice: string; // Specific recommendation on how to reach the next band score
}

export interface WritingEvaluation {
  taskAchievement: CriterionDetail; // Task Achievement (Task 1) or Task Response (Task 2) [25%]
  coherenceCohesion: CriterionDetail; // Coherence & Cohesion (CC) [25%]
  lexicalResource: CriterionDetail; // Lexical Resource (LR) [25%]
  grammaticalRangeAccuracy: CriterionDetail; // Grammatical Range & Accuracy (GRA) [25%]
  overallBand: number; // Average of 4 criteria rounded to nearest 0.5
  evaluatorType?: 'AI' | 'Instructor' | 'Official Examiner';
  evaluatorName?: string;
  evaluatedAt?: string;
  generalAdvice?: string;
}

export interface SpeakingEvaluation {
  fluencyCoherence: CriterionDetail; // Fluency & Coherence (FC) [25%]
  lexicalResource: CriterionDetail; // Lexical Resource (LR) [25%]
  grammaticalRangeAccuracy: CriterionDetail; // Grammatical Range & Accuracy (GRA) [25%]
  pronunciation: CriterionDetail; // Pronunciation (P) [25%]
  overallBand: number; // Average of 4 criteria rounded to nearest 0.5
  evaluatorType?: 'AI' | 'Instructor' | 'Official Examiner';
  evaluatorName?: string;
  evaluatedAt?: string;
  generalAdvice?: string;
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
  writingEvaluation?: WritingEvaluation;
  speakingEvaluation?: SpeakingEvaluation;
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


