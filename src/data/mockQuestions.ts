import { IELTSQuestion } from '../types';

export const MOCK_QUESTIONS_BY_TEST_ID: Record<string, IELTSQuestion[]> = {
  l1: [
    {
      id: 'l1_q1',
      type: 'Blanks',
      questionText: 'The preferred date for membership commencement is the 14th of ______.',
      correctAnswer: 'October',
      explanation: "The receptionist states: 'I can schedule the membership to start from the fourteenth of October.' The candidate confirms this is perfect."
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
      explanation: "The speaker mentions: 'Our standard general public rate is seventy-five pounds, but since you are a full-time university student, you qualify for our 20% discount, bringing it down to sixty pounds annually.'"
    },
    {
      id: 'l1_q3',
      type: 'TrueFalseNotGiven',
      questionText: 'The library requires a physical utility bill to verify the student\'s local address.',
      correctAnswer: 'False',
      explanation: "The librarian says: 'Any digital PDF copy of your rental agreement or a bank statement shown on your phone is perfectly fine. We do not require a hardcopy utility bill anymore.'"
    }
  ],
  l2: [
    {
      id: 'l2_q1',
      type: 'Blanks',
      questionText: 'The workplace safety briefing is scheduled to take place in the ______ room.',
      correctAnswer: 'Conference',
      explanation: "The manager announces: 'Please make your way over to the main Conference room on the second floor where the briefing will begin in ten minutes.'"
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
      explanation: "The safety officer highlights: 'Standard operating procedures state that steel-toed boots and orange high-visibility vests are non-negotiable for anyone stepping onto the active factory floor.'"
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
      explanation: "Paragraph A describes the basic structural mechanics of reefs: 'The architectural marvel of coral reefs is built on tiny organisms known as coral polyps. Polyps secrete hard carbonate exoskeletons which support vast underwater communities.'"
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
      explanation: "The text states: 'However, ocean temperature rises of even 1.5°C disrupt the fragile symbiotic algae, leading to widespread bleaching events.'"
    },
    {
      id: 'r1_q3',
      type: 'TrueFalseNotGiven',
      questionText: 'Only greenhouse emissions contribute to modern coral reef deterioration.',
      correctAnswer: 'False',
      explanation: "The passage notes that while greenhouse temperature rises are a primary threat, other human activities like chemical runoff and physical damage from anchoring also degrade the reefs, so emissions are not the 'only' cause."
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
      explanation: "The guidelines policy document states: 'All full-time personnel must be present or active during our core operation hours from 10:00 AM to 3:00 PM daily.'"
    },
    {
      id: 'r2_q2',
      type: 'TrueFalseNotGiven',
      questionText: 'Employees must sign out physically at the security desk when leaving for lunch.',
      correctAnswer: 'False',
      explanation: "The policy mentions: 'Physical sign-outs are no longer required. Lunches and short departures should instead be logged via the digital workspace clock-out portal.'"
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
      explanation: "Paragraph A details the Gestalt grouping principles, specifically focusing on proximity: 'The human brain automatically groups elements that are visually close together into single perceived patterns, a principle known as proximity.'"
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
      explanation: "The passage defines 'cognitive load' as the amount of mental processing power required by the human mind to navigate, read, and comprehend complex system elements."
    }
  ]
};
