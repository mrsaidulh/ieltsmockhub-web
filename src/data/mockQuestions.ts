import { IELTSQuestion } from '../types';

export const MOCK_QUESTIONS_BY_TEST_ID: Record<string, IELTSQuestion[]> = {
  l1: [
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
  ],
  l2: [
    {
      id: 'l2_q1',
      type: 'Blanks',
      questionText: 'The workplace safety briefing is scheduled to take place in the ______ room.',
      correctAnswer: 'Conference',
      explanation: "The manager announces: 'Please make your way over to the main Conference room on the second floor where the briefing will begin in ten minutes.'",
      passageNumber: 1
    },
    {
      id: 'l2_q2',
      type: 'MCQ',
      questionText: 'Which protective gear is mandatory for all visitors entering the main factory floor?',
      options: [
        'A. Level-3 noise-canceling earplugs only',
        'B. Heat-resistant protective gloves',
        'C. Steel-toed safety boots and high-visibility vests',
        'D. Full safety goggles and dust particulate respirators'
      ],
      correctAnswer: 'C',
      explanation: "The safety officer highlights: 'Standard operating procedures state that steel-toed boots and orange high-visibility vests are non-negotiable for anyone stepping onto the active factory floor.'",
      passageNumber: 2
    }
  ],
  r1: [
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
      explanation: "Paragraph A describes the basic structural mechanics of reefs.",
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
      explanation: "The text states: 'However, ocean temperature rises of even 1.5°C disrupt the fragile symbiotic algae.'",
      passageNumber: 1
    },
    {
      id: 'r1_q3',
      type: 'TrueFalseNotGiven',
      questionText: 'Only greenhouse emissions contribute to modern coral reef deterioration.',
      correctAnswer: 'False',
      explanation: "The passage notes that while greenhouse temperature rises are a primary threat, other human activities also degrade the reefs.",
      passageNumber: 1
    },
    {
      id: 'r1_q4',
      type: 'YesNoNotGiven',
      questionText: 'The author agrees that artificial reefs are a complete replacement for natural reefs.',
      correctAnswer: 'No',
      explanation: "The author explicitly states that artificial reefs can never fully replace the complex ecosystem of natural reefs.",
      passageNumber: 1
    },
    {
      id: 'r1_q5',
      type: 'MatchingInfo',
      questionText: 'Which paragraph contains information about the financial cost of coral bleaching?',
      options: ['A', 'B', 'C', 'D'],
      correctAnswer: 'C',
      explanation: "Paragraph C details the economic impact, including lost tourism revenue.",
      passageNumber: 2
    },
    {
      id: 'r1_q6',
      type: 'MatchingFeatures',
      questionText: 'Match the coral reef type with its primary location.',
      options: ['A. Great Barrier Reef', 'B. Mesoamerican Reef', 'C. Red Sea Coral Reef'],
      correctAnswer: 'A',
      explanation: "The Great Barrier Reef is located in Australia.",
      passageNumber: 2
    },
    {
      id: 'r1_q7',
      type: 'MatchingSentenceEndings',
      questionText: 'The process of coral bleaching occurs when...',
      options: ['A. water temperatures drop significantly.', 'B. symbiotic algae are expelled.', 'C. fish populations increase.'],
      correctAnswer: 'B',
      explanation: "Bleaching happens when stressed corals expel their algae.",
      passageNumber: 2
    },
    {
      id: 'r1_q8',
      type: 'SentenceCompletion',
      questionText: 'Coral reefs are often referred to as the __________ of the sea.',
      correctAnswer: 'rainforests',
      explanation: "They are called rainforests of the sea due to their high biodiversity.",
      passageNumber: 3
    },
    {
      id: 'r1_q9',
      type: 'SummaryCompletion',
      questionText: 'Complete the summary: Coral reefs provide habitats for many marine species. However, they are threatened by climate change and _________.',
      correctAnswer: 'pollution',
      explanation: "The summary section mentions pollution as the secondary major threat.",
      passageNumber: 3
    },
    {
      id: 'r1_q10',
      type: 'DiagramCompletion',
      questionText: 'Label the part of the coral polyp that is used to capture food.',
      correctAnswer: 'tentacles',
      explanation: "The diagram shows the tentacles extending to catch plankton.",
      passageNumber: 3
    },
    {
      id: 'r1_q11',
      type: 'ShortAnswer',
      questionText: 'What is the minimum temperature required for coral reefs to thrive?',
      correctAnswer: '18 degrees',
      explanation: "The passage states that corals need water of at least 18 degrees Celsius.",
      passageNumber: 3
    }
  ],
  r2: [
    {
      id: 'r2_q1',
      type: 'MCQ',
      questionText: 'Under the new flexible hours policy, what are the mandatory core office hours?',
      options: [
        'A. 08:00 to 12:00',
        'B. 10:00 to 15:00',
        'C. 09:00 to 17:00',
        'D. 11:00 to 14:00'
      ],
      correctAnswer: 'B',
      explanation: "The guidelines policy document states: 'All full-time personnel must be present or active during our core operation hours from 10:00 AM to 3:00 PM daily.'",
      passageNumber: 1
    },
    {
      id: 'r2_q2',
      type: 'TrueFalseNotGiven',
      questionText: 'Employees must sign out physically at the security desk when leaving for lunch.',
      correctAnswer: 'False',
      explanation: "The policy mentions: 'Physical sign-outs are no longer required. Lunches and short departures should instead be logged via the digital workspace clock-out portal.'",
      passageNumber: 2
    }
  ],
  r3: [
    {
      id: 'r3_q1',
      type: 'MatchingHeadings',
      questionText: 'Paragraph A: Gestalt Perception Principles in Layouts',
      headingOptions: [
        'i. Reducing processing times through visual symmetry',
        'ii. How the human mind clusters adjacent design elements',
        'iii. Historical engineering of military control cockpits',
        'iv. Cognitive effects of monochromatic color palettes'
      ],
      correctAnswer: 'ii',
      explanation: "Paragraph A details the Gestalt grouping principles, specifically focusing on proximity: 'The human brain automatically groups elements that are visually close together into single perceived patterns, a principle known as proximity.'",
      passageNumber: 1
    },
    {
      id: 'r3_q2',
      type: 'MCQ',
      questionText: 'What term describes the mental effort required to process information in a user interface?',
      options: [
        'A. Visual latency threshold',
        'B. Cognitive load',
        'C. Synaptic resistance coefficient',
        'D. Neurological bandwidth'
      ],
      correctAnswer: 'B',
      explanation: "The passage defines 'cognitive load' as the amount of mental processing power required by the human mind to navigate, read, and comprehend complex system elements.",
      passageNumber: 2
    }
  ]
};
