import { IELTSTest, AttemptHistory, BandProgressPoint, UserProgress } from '../types';

export const INITIAL_USER_PROGRESS: UserProgress = {
  targetBand: 7.5,
  streakDays: 5,
  practiceTimeHours: 18.5,
  completedTestsCount: 12,
  lastPracticeDate: '2026-07-18',
};

export const MOCK_TESTS: IELTSTest[] = [
  // Listening Complete Mock Test
  {
    id: 'l1',
    title: 'IELTS Official Listening Practice Test 1 (Parts 1-4)',
    category: 'listening',
    type: 'Academic',
    durationMinutes: 30,
    questionsCount: 10,
    attemptsCount: 14205,
    averageScore: 6.8,
    description: 'A full authentic Listening Mock Test consisting of four parts. Covers conversational English, workplace briefings, educational discussions, and a scientific lecture with real audio playback.',
    sections: [
      'Part 1: Library Membership Registration (Qs 1-3)',
      'Part 2: National Park Guided Tour (Qs 4-5)',
      'Part 3: Academic Discussion on Microplastics (Qs 6-8)',
      'Part 4: Scientific Lecture on Early Navigation (Qs 9-10)'
    ],
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    audioScript: 'Part 1: Dialogue between receptionist and student registering for library card. Part 2: Audio guide at National Wildlife Conservation Park. Part 3: Seminar on microplastic contamination in ocean estuaries. Part 4: Academic lecture on early celestial navigation instruments.',
    year: 2026,
    bookNumber: 21,
    testNumber: 1,
    bookYear: 2026,
    passageNumber: 1,
    questionTypes: ['Blanks', 'MCQ', 'TrueFalseNotGiven', 'SentenceCompletion'],
    questions: [
      {
        id: 'l1_q1',
        type: 'Blanks',
        questionText: 'The preferred date for membership commencement is the 14th of ______.',
        correctAnswer: 'October',
        explanation: "The receptionist states: 'I can schedule the membership to start from the fourteenth of October.' The candidate confirms this is perfect.",
        passageNumber: 1
      },
      {
        id: 'l1_q2',
        type: 'MCQ',
        questionText: 'What is the standard price for an annual student library membership?',
        options: [
          'A. £45 (Basic individual rate)',
          'B. £60 (Discounted student tier)',
          'C. £75 (Full general public rate)',
          'D. £90 (Family bundle tier)'
        ],
        correctAnswer: 'B',
        explanation: "The speaker mentions: 'Our standard general public rate is seventy-five pounds, but since you are a full-time university student, you qualify for our 20% discount, bringing it down to sixty pounds annually.'",
        passageNumber: 1
      },
      {
        id: 'l1_q3',
        type: 'TrueFalseNotGiven',
        questionText: 'The library requires a physical utility bill to verify the student\'s local address.',
        correctAnswer: 'False',
        explanation: "The librarian says: 'Any digital PDF copy of your rental agreement or a bank statement shown on your phone is perfectly fine. We do not require a hardcopy utility bill anymore.'",
        passageNumber: 1
      },
      {
        id: 'l1_q4',
        type: 'Blanks',
        questionText: 'Visitors must report to the main ______ before beginning the guided park tour.',
        correctAnswer: 'Visitor Centre',
        explanation: "Part 2 announcement directs all tour participants to assemble at the Visitor Centre.",
        passageNumber: 2
      },
      {
        id: 'l1_q5',
        type: 'MCQ',
        questionText: 'What time does the last shuttle bus return from the park summit?',
        options: [
          'A. 16:30',
          'B. 17:15',
          'C. 18:00',
          'D. 18:45'
        ],
        correctAnswer: 'C',
        explanation: "The ranger confirms: 'Make sure you are back at the bus stop by 18:00 hours sharp.'",
        passageNumber: 2
      },
      {
        id: 'l1_q6',
        type: 'SentenceCompletion',
        questionText: 'Microplastic runoff in marine estuaries severely affects the digestive systems of local ____.',
        correctAnswer: 'shellfish',
        explanation: "The researcher emphasizes that filter-feeding shellfish ingest microplastic particles at alarming rates.",
        passageNumber: 3
      },
      {
        id: 'l1_q7',
        type: 'MCQ',
        questionText: 'Which research methodology did the team select for soil sample analysis?',
        options: [
          'A. Spectroscopic infrared imaging',
          'B. Manual microscopic filtration',
          'C. Gravimetric density separation',
          'D. Thermal degradation chromatography'
        ],
        correctAnswer: 'A',
        explanation: "The professor explains that spectroscopic infrared imaging provided the highest precision.",
        passageNumber: 3
      },
      {
        id: 'l1_q8',
        type: 'Blanks',
        questionText: 'Early Polynesian navigators relied primarily on observing island wave reflection and ocean ____.',
        correctAnswer: 'swells',
        explanation: "The lecture highlights ocean swells and star constellations as primary navigational indicators.",
        passageNumber: 4
      },
      {
        id: 'l1_q9',
        type: 'MCQ',
        questionText: 'The cross-staff was originally developed during the 14th century to measure:',
        options: [
          'A. Magnetic declination of the north pole',
          'B. Angular altitude of celestial bodies above the horizon',
          'C. Ocean depth in uncharted coastal waters',
          'D. Barometric atmospheric pressure variations'
        ],
        correctAnswer: 'B',
        explanation: "The lecturer clarifies the cross-staff measured the angular height of stars above the horizon.",
        passageNumber: 4
      },
      {
        id: 'l1_q10',
        type: 'SentenceCompletion',
        questionText: 'The invention of the marine chronometer solved the long-standing challenge of calculating ____ at sea.',
        correctAnswer: 'longitude',
        explanation: "John Harrison's marine chronometer allowed accurate longitude calculation.",
        passageNumber: 4
      }
    ]
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
    description: 'Standard General Training listening practice focusing on real-life transactional dialogues and public announcements.',
    sections: ['Part 1: Gym Membership Inquiry', 'Part 2: Workplace Safety Briefing', 'Part 3: Academic Tutor Feedback Session', 'Part 4: Presentation on Urban Gardening Initiatives'],
    year: 2025,
    bookNumber: 20,
    testNumber: 2,
    bookYear: 2025,
    passageNumber: 1,
    questionTypes: ['Blanks', 'MCQ']
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
    description: 'High-speed audio challenge aimed at band score 8+ aspirants. Focuses on dense note-taking and rapid speech pattern recognition.',
    sections: ['Part 1: Astrophysics Seminar Outline', 'Part 2: Structural Challenges of Skyscraper Engineering'],
    year: 2026,
    bookNumber: 21,
    testNumber: 3,
    bookYear: 2026,
    passageNumber: 1,
    questionTypes: ['MCQ']
  },

  // Reading Complete Mock Test
  {
    id: 'r1',
    title: 'Academic Reading: The Architecture of Coral Reefs',
    category: 'reading',
    type: 'Academic',
    durationMinutes: 60,
    questionsCount: 11,
    attemptsCount: 18450,
    averageScore: 6.2,
    description: 'A deep academic reading paper testing true comprehension of scientific articles. Includes True/False/Not Given, Flow-chart completion, and Paragraph matching.',
    sections: [
      'Passage 1: Biology and Evolution of Deep Sea Reefs',
      'Passage 2: Economic Valuation of Coastal Ecosystems',
      'Passage 3: Future Restoration Strategies and Marine Sanctuaries'
    ],
    passageBlocks: [
      {
        id: 'tb_h1',
        type: 'heading',
        content: 'The Velocity of Deep Sea Regeneration'
      },
      {
        id: 'tb_p1',
        type: 'paragraph',
        content: 'Paragraph A: The architectural marvel of coral reefs is constructed by tiny calcifying organisms known as marine polyps. Over millennia, these polyps secrete calcium carbonate to erect elaborate three-dimensional frameworks. However, modern rising marine temperatures of just 1.5°C over prolonged periods trigger catastrophic cellular stress, leading to widespread bleaching. This occurs when corals expel their symbiotic zooxanthellae, stripping them of nutrients and color.'
      },
      {
        id: 'tb_p2',
        type: 'paragraph',
        content: 'Paragraph B: Recent deep-sea expeditions led by marine biologist Dr. Alistair Vance have discovered isolated pockets of polyps displaying high heat-tolerance. Located near active tectonic vents at depths of 1,200 meters, these colonies have adapted to temperatures exceeding 35°C. Vance suggests that these extreme thermophiles possess a custom heat-shock protein gene sequence, which maintains cellular structure under high temperature stress.'
      },
      {
        id: 'tb_img',
        type: 'image',
        content: 'https://images.unsplash.com/photo-1546026423-cc4642628d2b?w=800&auto=format&fit=crop&q=80',
        caption: 'Figure 1: Cellular disruption of zooxanthellae under extreme thermal exposure'
      },
      {
        id: 'tb_p3',
        type: 'paragraph',
        content: 'Paragraph C: The replication of these heat-resistant genomes through artificial hatchery seeding represents a key pillar in ecological recovery programs. Proponents argue that seeding threatened shallow reefs with vent-adapted larvae will buffer communities against severe mid-century heatwaves. Opponents, however, caution that introducing foreign genotypes into fragile native habitats might trigger unforeseen ecological cascading failures.'
      },
      {
        id: 'tb_tbl',
        type: 'table',
        content: 'Parameter | Native Corals | Vent-Adapted Clones\nMax Temp | 29.5 °C | 38.0 °C\nReplication | Standard | Accelerated\nBleaching Risk | High | Minimal'
      }
    ],
    passage: 'The Velocity of Deep Sea Regeneration\n\nParagraph A: The architectural marvel of coral reefs is constructed by tiny calcifying organisms known as marine polyps. Over millennia, these polyps secrete calcium carbonate to erect elaborate three-dimensional frameworks. However, modern rising marine temperatures of just 1.5°C over prolonged periods trigger catastrophic cellular stress, leading to widespread bleaching. This occurs when corals expel their symbiotic zooxanthellae, stripping them of nutrients and color.\n\nParagraph B: Recent deep-sea expeditions led by marine biologist Dr. Alistair Vance have discovered isolated pockets of polyps displaying high heat-tolerance. Located near active tectonic vents at depths of 1,200 meters, these colonies have adapted to temperatures exceeding 35°C. Vance suggests that these extreme thermophiles possess a custom heat-shock protein gene sequence, which maintains cellular structure under high temperature stress.\n\nParagraph C: The replication of these heat-resistant genomes through artificial hatchery seeding represents a key pillar in ecological recovery programs. Proponents argue that seeding threatened shallow reefs with vent-adapted larvae will buffer communities against severe mid-century heatwaves. Opponents, however, caution that introducing foreign genotypes into fragile native habitats might trigger unforeseen ecological cascading failures.',
    year: 2026,
    bookNumber: 21,
    testNumber: 1,
    bookYear: 2026,
    passageNumber: 1,
    questionTypes: ['MatchingHeadings', 'MCQ', 'TrueFalseNotGiven', 'YesNoNotGiven', 'MatchingInfo', 'MatchingFeatures', 'SentenceCompletion', 'SummaryCompletion', 'DiagramCompletion', 'ShortAnswer'],
    questions: [
      {
        id: 'r1_q1',
        type: 'MatchingHeadings',
        questionText: 'Paragraph A: Coral Polyps and Carbonate Structures',
        headingOptions: [
          'i. High-tech thermal monitoring tools',
          'ii. The foundation of underwater biological architecture',
          'iii. Global commercial valuation of fishing banks',
          'iv. Artificial reef construction milestones'
        ],
        correctAnswer: 'ii',
        explanation: 'Paragraph A describes the basic structural mechanics of reefs.',
        passageNumber: 1
      },
      {
        id: 'r1_q2',
        type: 'MCQ',
        questionText: 'According to the passage, what specific temperature rise triggers coral bleaching events?',
        options: [
          'A. A rise of any seasonal drop below normal winter density',
          'B. An ocean temperature rise of even 1.5°C',
          'C. Direct sea surface volcanic acid releases',
          'D. Sudden reductions in baseline solar radiation levels'
        ],
        correctAnswer: 'B',
        explanation: 'The text states: "However, ocean temperature rises of even 1.5°C disrupt the fragile symbiotic algae."',
        passageNumber: 1
      },
      {
        id: 'r1_q3',
        type: 'TrueFalseNotGiven',
        questionText: 'Only greenhouse emissions contribute to modern coral reef deterioration.',
        correctAnswer: 'False',
        explanation: 'The passage notes that while greenhouse temperature rises are a primary threat, other human activities also degrade the reefs.',
        passageNumber: 1
      },
      {
        id: 'r1_q4',
        type: 'YesNoNotGiven',
        questionText: 'Dr. Vance believes the polyps located near tectonic vents survived due to their specialized heat-shock protein gene sequence.',
        correctAnswer: 'Yes',
        explanation: 'Paragraph B notes Vance suggests that these extreme thermophiles possess a custom heat-shock protein gene sequence.',
        passageNumber: 1
      },
      {
        id: 'r1_q5',
        type: 'MatchingInfo',
        questionText: 'Which paragraph contains information about the financial cost of coral bleaching?',
        options: ['A', 'B', 'C', 'D'],
        correctAnswer: 'C',
        explanation: 'Paragraph C details the economic impact, including lost tourism revenue.',
        passageNumber: 2
      },
      {
        id: 'r1_q6',
        type: 'MatchingFeatures',
        questionText: 'Match the coral reef type with its primary location.',
        options: ['A. Great Barrier Reef', 'B. Mesoamerican Reef', 'C. Red Sea Coral Reef'],
        correctAnswer: 'A',
        explanation: 'The Great Barrier Reef is located in Australia.',
        passageNumber: 2
      },
      {
        id: 'r1_q7',
        type: 'SentenceCompletion',
        questionText: 'The architectural framework of coral reefs is constructed out of calcium __________ secreted by marine polyps over millennia.',
        correctAnswer: 'carbonate',
        explanation: 'Paragraph A states "these polyps secrete calcium carbonate to erect elaborate three-dimensional frameworks."',
        passageNumber: 2
      },
      {
        id: 'r1_q8',
        type: 'SummaryCompletion',
        questionText: 'Complete the summary: Coral reefs provide habitats for many marine species. However, they are threatened by climate change and _________.',
        correctAnswer: 'pollution',
        explanation: 'The summary section mentions pollution as the secondary major threat.',
        passageNumber: 3
      },
      {
        id: 'r1_q9',
        type: 'DiagramCompletion',
        questionText: 'Label the part of the coral polyp that is used to capture food.',
        correctAnswer: 'tentacles',
        explanation: 'The diagram shows the tentacles extending to catch plankton.',
        passageNumber: 3
      },
      {
        id: 'r1_q10',
        type: 'ShortAnswer',
        questionText: 'What is the minimum temperature required for coral reefs to thrive?',
        correctAnswer: '18 degrees',
        explanation: 'The passage states that corals need water of at least 18 degrees Celsius.',
        passageNumber: 3
      }
    ]
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
    description: 'General reading passages reflecting daily workplace booklets, travel instructions, and general knowledge notices.',
    sections: ['Section 1: Office Flexible Working Hours Policy', 'Section 2: Fire Evacuation Protocols', 'Section 3: The Rise and Fall of the Silk Road Trading Route'],
    year: 2025,
    bookNumber: 21,
    testNumber: 2,
    bookYear: 2025,
    passageNumber: 1,
    questionTypes: ['MCQ', 'TrueFalseNotGiven']
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
    description: 'Excellent practice test focusing on psychological principles in modern user interfaces and industrial engineering.',
    sections: ['Passage 1: Gestalt Principles of Human Visual Perception', 'Passage 2: User Interfaces and Cognitive Load Management', 'Passage 3: Case Study: Ergonomics in Autonomous Vehicle Cockpits'],
    year: 2026,
    bookNumber: 20,
    testNumber: 1,
    bookYear: 2026,
    passageNumber: 1,
    questionTypes: ['MatchingHeadings', 'MCQ']
  },

  // Writing Complete Mock Test
  {
    id: 'w1',
    title: 'IELTS Official Writing Test 1 (Task 1 & Task 2)',
    category: 'writing',
    type: 'Academic',
    durationMinutes: 60,
    questionsCount: 2,
    attemptsCount: 6810,
    averageScore: 6.4,
    description: 'Complete Academic Writing Mock Test consisting of Task 1 (Data Visual Analysis with Chart Image) and Task 2 (Discursive Essay) with Band 9 model answers.',
    passage: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop&q=80',
    sections: [
      'Task 1: The bar chart below illustrates the proportion of energy generated from renewable sources across five countries between 2010 and 2025. Summarise the information by selecting and reporting the main features, and make comparisons where relevant. Write at least 150 words.',
      'Task 2: Some people argue that artificial intelligence will eliminate traditional job roles, while others believe it will spawn new career opportunities. Discuss both views and give your opinion with relevant examples from your knowledge or experience. Write at least 250 words.',
      'Band 9 Sample Model Answer:\nTask 1 Overview: Renewable energy share witnessed a steady upward trajectory in all monitored nations...\nTask 2 Overview: The advent of modern artificial intelligence has ignited a passionate debate regarding future workforce dynamics...'
    ],
    year: 2026,
    bookNumber: 21,
    testNumber: 1,
    bookYear: 2026,
    passageNumber: 1,
    questionTypes: []
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
    description: 'Discuss both views and give your opinion on whether Generative AI technologies will ultimately empower or extinguish human-led creative professions.',
    sections: ['Task 2: Discuss the ethical, economical, and personal development factors. Write at least 250 words and justify with relevant examples.'],
    year: 2026,
    bookNumber: 21,
    testNumber: 2,
    bookYear: 2026,
    passageNumber: 1,
    questionTypes: []
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
    description: 'Draft an informal letter apologising to a close friend for missing a celebratory event due to an unexpected travel delay.',
    sections: ['Task 1: State clearly what happened, express genuine regret, and propose a specific plan to meet up and catch up in the near future.'],
    year: 2024,
    bookNumber: 20,
    testNumber: 3,
    bookYear: 2024,
    passageNumber: 1,
    questionTypes: []
  },

  // Speaking Complete Mock Test
  {
    id: 's1',
    title: 'IELTS Official Speaking Practice Test 1 (All 3 Parts)',
    category: 'speaking',
    type: 'Academic',
    durationMinutes: 14,
    questionsCount: 3,
    attemptsCount: 7420,
    averageScore: 6.6,
    description: 'Simulated live Speaking interview testing rapid-response fluency, vocabulary range, and grammatical consistency across all 3 official test parts.',
    sections: [
      'Part 1: Let\'s talk about your hometown and daily routine. How often do you use public transport? What do you enjoy doing during your free time?',
      'Part 2 Cue Card: Describe an old building or heritage landmark you visited.\nYou should say:\n- Where it is located\n- What it looks like\n- Who you went with\nand explain why this place made a deep impression on you.',
      'Part 3: Why is it important to preserve ancient architecture in modern cities? Do you think governments should prioritize cultural heritage funding over infrastructure development?',
      'Band 9 Vocabulary & Collocations: Architectural splendour, historical significance, urban gentrification, structural integrity, preservation endeavours.'
    ],
    year: 2026,
    bookNumber: 21,
    testNumber: 1,
    bookYear: 2026,
    passageNumber: 1,
    questionTypes: []
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
    description: 'A rigorous conceptual dialogue aimed at band score 8+. Covers abstract social themes, global commerce, and ethical research.',
    sections: ['Part 1: Introductions and discussion about environmental responsibility', 'Part 2 Cue Card: Describe a historical choice made by your country', 'Part 3: Discussion on the future of international trade regulations'],
    year: 2025,
    bookNumber: 20,
    testNumber: 4,
    bookYear: 2025,
    passageNumber: 1,
    questionTypes: []
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
    examinerFeedback: 'Cohesion and coherence are clear. You successfully highlighted major trends. However, improve lexical resource by varying key vocabulary and avoiding repetitive transition terms.',
    writingEvaluation: {
      taskAchievement: {
        score: 7.0,
        reason: 'Presents a clear overview of key trends in renewable energy adoption across all three regions.',
        advice: 'Highlight exact numerical values at key inflection points to support data comparisons better.'
      },
      coherenceCohesion: {
        score: 7.0,
        reason: 'Paragraph structure is logical with smooth progression between overview and specific detail paragraphs.',
        advice: 'Use a wider variety of cohesive devices rather than repeating "In addition" and "Furthermore".'
      },
      lexicalResource: {
        score: 6.0,
        reason: 'Adequate range of vocabulary used for reporting data trends, though some word choices repeat.',
        advice: 'Incorporate higher-level academic collocations like "dramatic surge", "fluctuated wildly", and "reached a plateau".'
      },
      grammaticalRangeAccuracy: {
        score: 6.0,
        reason: 'Mix of simple and complex sentence forms with frequent error-free sentences, but minor tense slip-ups.',
        advice: 'Ensure consistent past-tense agreement when describing historical data ranges from 2010 to 2020.'
      },
      overallBand: 6.5,
      evaluatorType: 'Instructor',
      evaluatorName: 'Senior IELTS Examiner (British Council Certified)',
      evaluatedAt: '2026-07-10 14:30',
      generalAdvice: 'Strong Task 1 response overall. Focus on lexical variation to push your score to Band 7.5.'
    }
  },
  {
    id: 'att4',
    testId: 's1',
    testTitle: 'Speaking Part 1 & 2: Leisure Habits & Memorable Places',
    category: 'speaking',
    date: '2026-07-05',
    bandScore: 6.5,
    timeSpentMinutes: 14,
    examinerFeedback: 'Fluency is outstanding and pronunciation is highly intelligible. Grammatical errors were noticed during Part 2 cue card when describing past events (tense inconsistency).',
    speakingEvaluation: {
      fluencyCoherence: {
        score: 7.0,
        reason: 'Speaks at length without noticeable effort or loss of coherence. Uses discourse markers effectively.',
        advice: 'Reduce occasional hesitation when organizing abstract ideas in Part 3.'
      },
      lexicalResource: {
        score: 6.5,
        reason: 'Uses vocabulary resource flexibly to discuss a variety of topics with idiomatic phrasing.',
        advice: 'Incorporate more sophisticated topic-specific vocabulary and avoid overusing generic words like "good" or "nice".'
      },
      grammaticalRangeAccuracy: {
        score: 6.0,
        reason: 'Uses a mix of simple and complex structures. Occasional tense inconsistency in Part 2 past narrative.',
        advice: 'Practice narrative tenses (past simple vs past perfect continuous) to maintain consistency in stories.'
      },
      pronunciation: {
        score: 6.5,
        reason: 'Uses a range of pronunciation features including stress and intonation with high intelligibility.',
        advice: 'Pay attention to word stress on multi-syllable academic nouns (e.g., "infrastructure", "sustainability").'
      },
      overallBand: 6.5,
      evaluatorType: 'AI',
      evaluatorName: 'IELTS AI Speaking Assessor v4',
      evaluatedAt: '2026-07-05 16:15',
      generalAdvice: 'Great rhythm and confidence! Tightening grammatical tense control will easily lift you to Band 7.5.'
    }
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
