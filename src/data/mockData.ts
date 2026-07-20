import { IELTSTest, AttemptHistory, BandProgressPoint, UserProgress } from '../types';

export const INITIAL_USER_PROGRESS: UserProgress = {
  targetBand: 7.5,
  streakDays: 5,
  practiceTimeHours: 18.5,
  completedTestsCount: 12,
  lastPracticeDate: '2026-07-18',
};

export const MOCK_TESTS: IELTSTest[] = [
  // Listening Tests
  {
    id: 'l1',
    title: 'IELTS Academic Vol 15 - Listening Practice Test 1',
    category: 'listening',
    type: 'Academic',
    durationMinutes: 30,
    questionsCount: 40,
    attemptsCount: 14205,
    averageScore: 6.8,
    difficulty: 'Medium',
    description: 'A full authentic Listening Mock Test consisting of four parts. Covers conversational english, educational discussions, and a scientific lecture.',
    sections: ['Part 1: Library Membership Registration', 'Part 2: National Park Guided Tour Guide', 'Part 3: Student Discussion on Microplastics', 'Part 4: Lecture on the History of Early Navigation'],
    year: 2026
  },
  {
    id: 'l2',
    title: 'General Training Listening Vol 11 - Sectional Test 2',
    category: 'listening',
    type: 'General',
    durationMinutes: 30,
    questionsCount: 40,
    attemptsCount: 8940,
    averageScore: 7.2,
    difficulty: 'Easy',
    description: 'Standard General Training listening practice focusing on real-life transactional dialogues and public announcements.',
    sections: ['Part 1: Gym Membership Inquiry', 'Part 2: Workplace Safety Briefing', 'Part 3: Academic Tutor Feedback Session', 'Part 4: Presentation on Urban Gardening Initiatives'],
    year: 2025
  },
  {
    id: 'l3',
    title: 'Advanced Listening - Fast-paced Monologue Drill',
    category: 'listening',
    type: 'Academic',
    durationMinutes: 15,
    questionsCount: 20,
    attemptsCount: 5410,
    averageScore: 5.9,
    difficulty: 'Hard',
    description: 'High-speed audio challenge aimed at band score 8+ aspirants. Focuses on dense note-taking and rapid speech pattern recognition.',
    sections: ['Part 1: Astrophysics Seminar Outline', 'Part 2: Structural Challenges of Skyscraper Engineering'],
    year: 2026
  },

  // Reading Tests
  {
    id: 'r1',
    title: 'Academic Reading: The Architecture of Coral Reefs',
    category: 'reading',
    type: 'Academic',
    durationMinutes: 60,
    questionsCount: 40,
    attemptsCount: 18450,
    averageScore: 6.2,
    difficulty: 'Hard',
    description: 'A deep academic reading paper testing true comprehension of scientific articles. Includes True/False/Not Given, Flow-chart completion, and Paragraph matching.',
    sections: ['Passage 1: Biology and Evolution of Deep Sea Reefs', 'Passage 2: Economic Valuation of Coastal Ecosystems', 'Passage 3: Future Restoration Strategies and Marine Sanctuaries'],
    year: 2026
  },
  {
    id: 'r2',
    title: 'General Training Reading: Employment Guidelines & Safety',
    category: 'reading',
    type: 'General',
    durationMinutes: 60,
    questionsCount: 40,
    attemptsCount: 11200,
    averageScore: 7.4,
    difficulty: 'Easy',
    description: 'General reading passages reflecting daily workplace booklets, travel instructions, and general knowledge notices.',
    sections: ['Section 1: Office Flexible Working Hours Policy', 'Section 2: Fire Evacuation Protocols', 'Section 3: The Rise and Fall of the Silk Road Trading Route'],
    year: 2025
  },
  {
    id: 'r3',
    title: 'IELTS Academic Reading: Cognitive Psychology in Design',
    category: 'reading',
    type: 'Academic',
    durationMinutes: 60,
    questionsCount: 40,
    attemptsCount: 9320,
    averageScore: 6.5,
    difficulty: 'Medium',
    description: 'Excellent practice test focusing on psychological principles in modern user interfaces and industrial engineering.',
    sections: ['Passage 1: Gestalt Principles of Human Visual Perception', 'Passage 2: User Interfaces and Cognitive Load Management', 'Passage 3: Case Study: Ergonomics in Autonomous Vehicle Cockpits'],
    year: 2026
  },

  // Writing Tests
  {
    id: 'w1',
    title: 'Academic Writing Task 1: Renewable Energy Shares (Line Graph)',
    category: 'writing',
    type: 'Academic',
    durationMinutes: 20,
    questionsCount: 1,
    attemptsCount: 6810,
    averageScore: 6.4,
    difficulty: 'Medium',
    description: 'Analyze, summarize, and report on trends shown in a line graph depicting global renewable energy investment from 2015 to 2025.',
    sections: ['Task 1: Write a report of at least 150 words describing the primary trends, differences, and key metrics in renewable energy use.'],
    year: 2026
  },
  {
    id: 'w2',
    title: 'Writing Task 2: AI Impact on Creative Careers (Essay)',
    category: 'writing',
    type: 'Academic',
    durationMinutes: 40,
    questionsCount: 1,
    attemptsCount: 12450,
    averageScore: 6.1,
    difficulty: 'Hard',
    description: 'Discuss both views and give your opinion on whether Generative AI technologies will ultimately empower or extinguish human-led creative professions.',
    sections: ['Task 2: Discuss the ethical, economical, and personal development factors. Write at least 250 words and justify with relevant examples.'],
    year: 2026
  },
  {
    id: 'w3',
    title: 'General Training Writing Task 1: Informal Apology Letter',
    category: 'writing',
    type: 'General',
    durationMinutes: 20,
    questionsCount: 1,
    attemptsCount: 4320,
    averageScore: 7.0,
    difficulty: 'Easy',
    description: 'Draft an informal letter apologising to a close friend for missing a celebratory event due to an unexpected travel delay.',
    sections: ['Task 1: State clearly what happened, express genuine regret, and propose a specific plan to meet up and catch up in the near future.'],
    year: 2024
  },

  // Speaking Tests
  {
    id: 's1',
    title: 'Speaking Part 1 & 2: Leisure Habits & Memorable Places',
    category: 'speaking',
    type: 'Academic',
    durationMinutes: 14,
    questionsCount: 3,
    attemptsCount: 7420,
    averageScore: 6.6,
    difficulty: 'Medium',
    description: 'Simulated live Speaking interview testing rapid-response fluency, vocabulary range, and grammatical consistency.',
    sections: ['Part 1: Discussion on leisure time, hobbies, and digital devices', 'Part 2 Cue Card: Describe an old building or heritage structure you visited', 'Part 3: Analytical discussion on heritage preservation vs modernization'],
    year: 2026
  },
  {
    id: 's2',
    title: 'Advanced Speaking Part 3: Global Economic Shifts',
    category: 'speaking',
    type: 'Academic',
    durationMinutes: 15,
    questionsCount: 4,
    attemptsCount: 3105,
    averageScore: 5.8,
    difficulty: 'Hard',
    description: 'A rigorous conceptual dialogue aimed at band score 8+. Covers abstract social themes, global commerce, and ethical research.',
    sections: ['Part 1: Introductions and discussion about environmental responsibility', 'Part 2 Cue Card: Describe a historical choice made by your country', 'Part 3: Discussion on the future of international trade regulations'],
    year: 2025
  }
];

export const MOCK_ATTEMPT_HISTORY: AttemptHistory[] = [
  {
    id: 'att1',
    testId: 'r1',
    testTitle: 'Academic Reading: The Architecture of Coral Reefs',
    category: 'reading',
    date: '2026-07-18',
    bandScore: 7.5,
    correctAnswers: 33,
    totalQuestions: 40,
    timeSpentMinutes: 52,
    examinerFeedback: 'Superb time management! Your reading speed and paragraph-matching skills are highly advanced. Focus on clarifying subtle differences between "False" and "Not Given" options in Section 3.'
  },
  {
    id: 'att2',
    testId: 'l1',
    testTitle: 'IELTS Academic Vol 15 - Listening Practice Test 1',
    category: 'listening',
    date: '2026-07-14',
    bandScore: 7.0,
    correctAnswers: 30,
    totalQuestions: 40,
    timeSpentMinutes: 30,
    examinerFeedback: 'Good comprehension throughout. Watch out for singular vs plural spelling conventions in Part 1 registration sections (e.g. "books" instead of "book" as dictated).'
  },
  {
    id: 'att3',
    testId: 'w1',
    testTitle: 'Academic Writing Task 1: Renewable Energy Shares (Line Graph)',
    category: 'writing',
    date: '2026-07-10',
    bandScore: 6.5,
    timeSpentMinutes: 20,
    examinerFeedback: 'Cohesion and coherence are clear. You successfully highlighted major trends. However, improve lexical resource by varying key vocabulary and avoiding repetitive transition terms.'
  },
  {
    id: 'att4',
    testId: 's1',
    testTitle: 'Speaking Part 1 & 2: Leisure Habits & Memorable Places',
    category: 'speaking',
    date: '2026-07-05',
    bandScore: 6.5,
    timeSpentMinutes: 14,
    examinerFeedback: 'Fluency is outstanding and pronunciation is highly intelligible. Grammatical errors were noticed during Part 2 cue card when describing past events (tense inconsistency).'
  }
];

export const MOCK_BAND_PROGRESS: BandProgressPoint[] = [
  { date: 'May 10', Listening: 6.0, Reading: 6.5, Writing: 5.5, Speaking: 6.0, Average: 6.0 },
  { date: 'May 25', Listening: 6.5, Reading: 6.5, Writing: 5.5, Speaking: 6.5, Average: 6.25 },
  { date: 'Jun 10', Listening: 6.5, Reading: 7.0, Writing: 6.0, Speaking: 6.5, Average: 6.5 },
  { date: 'Jun 25', Listening: 7.0, Reading: 7.0, Writing: 6.0, Speaking: 6.5, Average: 6.6 },
  { date: 'Jul 10', Listening: 7.0, Reading: 7.5, Writing: 6.5, Speaking: 6.5, Average: 6.88 },
  { date: 'Jul 18', Listening: 7.0, Reading: 7.5, Writing: 6.5, Speaking: 6.5, Average: 6.88 }
];
