import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Plus, Trash2, Edit3, ArrowLeft, Check, AlertCircle, 
  HelpCircle, BookOpen, RefreshCw, FileText, LayoutGrid, Eye, 
  Copy, Download, FileJson, ArrowUp, ArrowDown, HelpCircle as HelpIcon,
  PlusCircle, CheckCircle2, ChevronRight, Settings, Image as ImageIcon,
  Table as TableIcon, Info, Layers
} from 'lucide-react';
import { IELTSTest, IELTSQuestion, TestCategory, TestType, DifficultyLevel, QuestionType, PassageBlock } from '../types';
import QuestionRenderer from './QuestionRenderer';

interface AdminTestManagerProps {
  tests: IELTSTest[];
  onAddTest: (newTest: IELTSTest) => void;
  onUpdateTest: (updatedTest: IELTSTest) => void;
  onDeleteTest: (id: string) => void;
  onClose: () => void;
}

// 1-click test configuration templates for testing various IELTS Question Types
const TEMPLATE_ACADEMIC_1: IELTSTest = {
  id: 'template_reading_1',
  title: 'Marine Ecosystem Adaptation and Regeneration',
  category: 'reading',
  type: 'Academic',
  durationMinutes: 60,
  questionsCount: 5,
  attemptsCount: 0,
  averageScore: 7.5,
  difficulty: 'Hard',
  description: 'An advanced Academic reading test on ocean temperatures and micro-organism adaptation speeds, featuring Matching Paragraph Headings, Yes/No/Not Given, and Sentence Completion.',
  sections: ['Section 1: Micro-polyp adaptability under thermal stress'],
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
  questions: [
    {
      id: 'q_t1_1',
      type: 'MatchingHeadings',
      questionText: 'Which heading matches Paragraph A?',
      correctAnswer: 'ii',
      explanation: 'Paragraph A highlights the structural anatomy of coral reefs and the cellular stress of bleaching.',
      headingOptions: [
        'i. Tectonic vent ecosystems',
        'ii. Structural composition and the onset of bleaching',
        'iii. Risks of foreign genotype seeding',
        'iv. The role of heat-shock protein genes'
      ]
    },
    {
      id: 'q_t1_2',
      type: 'MatchingHeadings',
      questionText: 'Which heading matches Paragraph B?',
      correctAnswer: 'iv',
      explanation: 'Paragraph B explicitly describes the extreme heat-tolerant polyps and their heat-shock protein genes.',
      headingOptions: [
        'i. Tectonic vent ecosystems',
        'ii. Structural composition and the onset of bleaching',
        'iii. Risks of foreign genotype seeding',
        'iv. The role of heat-shock protein genes'
      ]
    },
    {
      id: 'q_t1_3',
      type: 'YesNoNotGiven',
      questionText: 'Dr. Vance believes the polyps located near tectonic vents survived due to their specialized heat-shock protein gene sequence.',
      correctAnswer: 'Yes',
      explanation: 'Paragraph B notes Vance suggests that these extreme thermophiles possess a custom heat-shock protein gene sequence.'
    },
    {
      id: 'q_t1_4',
      type: 'YesNoNotGiven',
      questionText: 'The introduction of vent-adapted larvae is universally accepted by marine ecologists as a safe solution.',
      correctAnswer: 'No',
      explanation: 'Paragraph C states "Opponents, however, caution that introducing foreign genotypes into fragile native habitats might trigger unforeseen ecological cascading failures."'
    },
    {
      id: 'q_t1_5',
      type: 'SentenceCompletion',
      questionText: 'The architectural framework of coral reefs is constructed out of calcium __________ secreted by marine polyps over millennia.',
      correctAnswer: 'carbonate',
      explanation: 'Paragraph A states "these polyps secrete calcium carbonate to erect elaborate three-dimensional frameworks."'
    }
  ],
  bookYear: 2026,
  year: 2026,
  bookNumber: 21,
  testNumber: 1,
  passageNumber: 1,
  questionTypes: ['MatchingHeadings', 'YesNoNotGiven', 'SentenceCompletion']
};

const TEMPLATE_GENERAL_1: IELTSTest = {
  id: 'template_reading_2',
  title: 'Workspace Ergonomics & Employee Welfare',
  category: 'reading',
  type: 'General',
  durationMinutes: 60,
  questionsCount: 4,
  attemptsCount: 0,
  averageScore: 7.0,
  difficulty: 'Medium',
  description: 'A General Training Reading passage and questions regarding optimal chair height, screen posture, and preventative movement breaks, focusing on MCQ and Identifying Info.',
  sections: ['Section 1: Posture guidelines and preventative workplace habits'],
  passageBlocks: [
    {
      id: 'g_tb_h1',
      type: 'heading',
      content: 'Optimal Desktop Ergonomics for Remote Professionals'
    },
    {
      id: 'g_tb_p1',
      type: 'paragraph',
      content: 'Paragraph A: Studies show that remote employees spend an average of 9.3 hours per day sitting. Standard screen alignment suggests your eye-level should line up exactly with the top third of your computer screen. If the screen is positioned too low, individuals are forced to flex their neck downward, introducing significant cervical stress. Utilizing adjustable monitor risers is a proven way to alleviate this stress.'
    },
    {
      id: 'g_tb_p2',
      type: 'paragraph',
      content: 'Paragraph B: Adequate lower lumbar support is equally crucial. An ergonomic chair must feature a dynamic lumbar curvature that fits snugly against the lower spine. Sitting without lumbar support prompts the pelvis to tilt backward, flattening the natural inward curve of the lower back. This posture causes fatigue and chronic muscular tightness over time.'
    },
    {
      id: 'g_tb_p3',
      type: 'paragraph',
      content: 'Paragraph C: In addition to correct posture, proactive breaks are highly recommended. Under the 20-20-20 rule, employees must look at an object 20 feet away for at least 20 seconds every 20 minutes. This practice relieves eye muscle strain. Standard ergonomic rules also suggest standing up and walking for 2 minutes every hour.'
    }
  ],
  passage: 'Optimal Desktop Ergonomics for Remote Professionals\n\nParagraph A: Studies show that remote employees spend an average of 9.3 hours per day sitting. Standard screen alignment suggests your eye-level should line up exactly with the top third of your computer screen. If the screen is positioned too low, individuals are forced to flex their neck downward, introducing significant cervical stress. Utilizing adjustable monitor risers is a proven way to alleviate this stress.\n\nParagraph B: Adequate lower lumbar support is equally crucial. An ergonomic chair must feature a dynamic lumbar curvature that fits snugly against the lower spine. Sitting without lumbar support prompts the pelvis to tilt backward, flattening the natural inward curve of the lower back. This posture causes fatigue and chronic muscular tightness over time.\n\nParagraph C: In addition to correct posture, proactive breaks are highly recommended. Under the 20-20-20 rule, employees must look at an object 20 feet away for at least 20 seconds every 20 minutes. This practice relieves eye muscle strain. Standard ergonomic rules also suggest standing up and walking for 2 minutes every hour.',
  questions: [
    {
      id: 'q_g1_1',
      type: 'MCQ',
      questionText: 'According to Paragraph A, what is the ideal position for the eyes when using a computer monitor?',
      options: [
        'A. Level with the absolute middle of the monitor',
        'B. Aligned exactly with the top third of the screen',
        'C. Slightly above the outer bezel casing',
        'D. Configured at a 45-degree angle downwards'
      ],
      correctAnswer: 'B',
      explanation: 'Paragraph A states: "Standard screen alignment suggests your eye-level should line up exactly with the top third of your computer screen."'
    },
    {
      id: 'q_g1_2',
      type: 'TrueFalseNotGiven',
      questionText: 'Sitting without Lumbar curvature support tilt the pelvis backward and flattens the natural lower back curve.',
      correctAnswer: 'True',
      explanation: 'Paragraph B outlines: "Sitting without lumbar support prompts the pelvis to tilt backward, flattening the natural inward curve of the lower back."'
    },
    {
      id: 'q_g1_3',
      type: 'TrueFalseNotGiven',
      questionText: 'Remote employees who stand up for 10 minutes every hour report a total absence of lower back pain.',
      correctAnswer: 'Not Given',
      explanation: 'Paragraph C recommends walking 2 minutes every hour and looking at distant objects, but does not claim this causes a total absence of pain.'
    },
    {
      id: 'q_g1_4',
      type: 'ShortAnswer',
      questionText: 'What is the minimum duration (in seconds) one should stare at a distant object under the 20-20-20 rule?',
      correctAnswer: '20',
      explanation: 'Paragraph C states: "...look at an object 20 feet away for at least 20 seconds..."'
    }
  ],
  bookYear: 2025,
  year: 2025,
  bookNumber: 21,
  testNumber: 2,
  passageNumber: 1,
  questionTypes: ['MCQ', 'TrueFalseNotGiven', 'ShortAnswer']
};

export default function AdminTestManager({ 
  tests, 
  onAddTest, 
  onUpdateTest, 
  onDeleteTest, 
  onClose 
}: AdminTestManagerProps) {
  // Test Level States
  const [testId, setTestId] = useState<string>(`custom_${Date.now()}`);
  const [title, setTitle] = useState('');
  const [type, setType] = useState<TestType>('Academic');
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('Medium');
  const [durationMinutes, setDurationMinutes] = useState<number>(60);
  const [description, setDescription] = useState('');
  const [year, setYear] = useState<number>(2026);
  const [bookNumber, setBookNumber] = useState<number | ''>('');
  const [testNumber, setTestNumber] = useState<number | ''>('');
  
  // Passage Page Blocks
  const [passageBlocks, setPassageBlocks] = useState<PassageBlock[]>([
    {
      id: 'pb_h_1',
      type: 'heading',
      content: 'Enter Your Passage Title Here'
    },
    {
      id: 'pb_p_1',
      type: 'paragraph',
      content: 'Paragraph A: Write or paste your first paragraph text. To support headings matching or paragraph location questions, label paragraphs with letters like "Paragraph A", "Paragraph B" etc.'
    }
  ]);

  // Questions State
  const [questions, setQuestions] = useState<IELTSQuestion[]>([]);

  // Question Builder States
  const [selectedQIndex, setSelectedQIndex] = useState<number | null>(null);
  const [qId, setQId] = useState<string>(`q_${Date.now()}`);
  const [qType, setQType] = useState<QuestionType>('MCQ');
  const [qText, setQText] = useState('');
  const [qCorrect, setQCorrect] = useState('A');
  const [qExplanation, setQExplanation] = useState('');
  const [qOptions, setQOptions] = useState<string[]>(['A. Option A', 'B. Option B', 'C. Option C', 'D. Option D']);
  const [qHeadings, setQHeadings] = useState<string[]>(['i. Heading i', 'ii. Heading ii', 'iii. Heading iii', 'iv. Heading iv']);
  const [qPassageNumber, setQPassageNumber] = useState<number>(1);

  const [activeTab, setActiveTab] = useState<'editor' | 'preview' | 'json'>('editor');
  const [validationMsg, setValidationMsg] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  // Load a full template for immediate testing
  const handleLoadTemplate = (template: IELTSTest) => {
    setTestId(`custom_${Date.now()}`);
    setTitle(template.title);
    setType(template.type);
    setDifficulty(template.difficulty);
    setDurationMinutes(template.durationMinutes);
    setDescription(template.description);
    setYear(template.year || 2026);
    setBookNumber(template.bookNumber !== undefined ? template.bookNumber : '');
    setTestNumber(template.testNumber !== undefined ? template.testNumber : '');
    if (template.passageBlocks) {
      setPassageBlocks(JSON.parse(JSON.stringify(template.passageBlocks)));
    }
    if (template.questions) {
      setQuestions(JSON.parse(JSON.stringify(template.questions)));
    }
    setValidationMsg({
      type: 'success',
      text: `Loaded "${template.title}" template! Scroll down to edit or click Save Test below to write to LocalStorage.`
    });
  };

  // Build the complete IELTSTest Object dynamically for live inspection
  const compileTestObject = (): IELTSTest => {
    return {
      id: testId,
      title: title.trim() || 'Untitled IELTS Reading Test',
      category: 'reading',
      type,
      durationMinutes: Number(durationMinutes) || 60,
      questionsCount: questions.length,
      attemptsCount: 0,
      averageScore: difficulty === 'Easy' ? 7.5 : difficulty === 'Medium' ? 7.0 : 6.5,
      difficulty,
      description: description.trim() || `Authentic IELTS practice reading exam focusing on comprehensive structure analysis.`,
      sections: ['Section 1: General Reading Comprehension'],
      passageBlocks: passageBlocks,
      passage: passageBlocks.map(b => b.content).join('\n\n'),
      questions: questions,
      bookYear: Number(year) || 2026,
      year: Number(year) || 2026,
      bookNumber: bookNumber !== '' ? Number(bookNumber) : 21,
      testNumber: testNumber !== '' ? Number(testNumber) : 1,
      passageNumber: 1,
      questionTypes: Array.from(new Set(questions.map(q => q.type))) as QuestionType[]
    };
  };

  // Block handlers
  const addBlock = (blockType: 'paragraph' | 'heading' | 'image' | 'table') => {
    const newBlock: PassageBlock = {
      id: `block_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      type: blockType,
      content: blockType === 'heading' ? 'New Heading Section' :
               blockType === 'paragraph' ? 'Write paragraph details here...' :
               blockType === 'image' ? 'https://images.unsplash.com/photo-1546026423-cc4642628d2b?w=800&auto=format&fit=crop&q=80' :
               'Header 1 | Header 2\nValue A1 | Value A2\nValue B1 | Value B2'
    };
    if (blockType === 'image') {
      newBlock.caption = 'Figure: Diagram illustration overview';
    }
    setPassageBlocks([...passageBlocks, newBlock]);
  };

  const deleteBlock = (id: string) => {
    if (passageBlocks.length <= 1) {
      alert('Keep at least one block element in your passage.');
      return;
    }
    setPassageBlocks(passageBlocks.filter(b => b.id !== id));
  };

  const moveBlock = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === passageBlocks.length - 1) return;
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    const updated = [...passageBlocks];
    const temp = updated[index];
    updated[index] = updated[targetIdx];
    updated[targetIdx] = temp;
    setPassageBlocks(updated);
  };

  const updateBlockContent = (index: number, val: string) => {
    const updated = [...passageBlocks];
    updated[index].content = val;
    setPassageBlocks(updated);
  };

  const updateBlockCaption = (index: number, val: string) => {
    const updated = [...passageBlocks];
    updated[index].caption = val;
    setPassageBlocks(updated);
  };

  // Question Creator Actions
  const handleAddQuestionToDraft = (e: React.FormEvent) => {
    e.preventDefault();
    if (!qText.trim()) {
      alert('Question prompt text is required.');
      return;
    }

    const draftQ: IELTSQuestion = {
      id: qId,
      type: qType,
      questionText: qText.trim(),
      options: ['MCQ', 'MatchingInfo', 'MatchingFeatures', 'MatchingSentenceEndings', 'SummaryCompletion', 'Blanks'].includes(qType)
        ? qOptions.filter(o => o.trim() !== '')
        : undefined,
      headingOptions: qType === 'MatchingHeadings' ? qHeadings.filter(h => h.trim() !== '') : undefined,
      correctAnswer: qCorrect.trim(),
      explanation: qExplanation.trim() || 'Verified by IELTS Test System.',
      passageNumber: qPassageNumber || 1
    };

    if (selectedQIndex !== null) {
      const updatedQs = [...questions];
      updatedQs[selectedQIndex] = draftQ;
      setQuestions(updatedQs);
      setSelectedQIndex(null);
      setValidationMsg({ type: 'success', text: 'Question updated in the test drafts list.' });
    } else {
      setQuestions([...questions, draftQ]);
      setValidationMsg({ type: 'success', text: 'New question appended successfully to the test.' });
    }

    resetQuestionForm();
  };

  const handleEditQuestionFromList = (index: number) => {
    const q = questions[index];
    setSelectedQIndex(index);
    setQId(q.id);
    setQType(q.type);
    setQText(q.questionText);
    setQCorrect(q.correctAnswer);
    setQExplanation(q.explanation || '');
    if (q.options) setQOptions(q.options);
    if (q.headingOptions) setQHeadings(q.headingOptions);
    setQPassageNumber(q.passageNumber || 1);
  };

  const handleDeleteQuestionFromList = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index));
    if (selectedQIndex === index) {
      resetQuestionForm();
    }
  };

  const resetQuestionForm = () => {
    setQId(`q_${Date.now()}`);
    setQText('');
    setQExplanation('');
    setSelectedQIndex(null);
    setQPassageNumber(1);
    // logical defaults based on type
    if (qType === 'TrueFalseNotGiven') setQCorrect('True');
    else if (qType === 'YesNoNotGiven') setQCorrect('Yes');
    else if (qType === 'MatchingHeadings') {
      setQCorrect('i');
      setQHeadings(['i. Heading i', 'ii. Heading ii', 'iii. Heading iii', 'iv. Heading iv']);
    } else if (qType === 'MCQ') {
      setQCorrect('A');
      setQOptions(['A. Option A', 'B. Option B', 'C. Option C', 'D. Option D']);
    } else {
      setQCorrect('A');
      setQOptions(['A. Option A', 'B. Option B', 'C. Option C']);
    }
  };

  const handleSaveWholeTest = () => {
    if (!title.trim()) {
      setValidationMsg({ type: 'error', text: 'Test title is required to deploy this test.' });
      return;
    }

    if (questions.length === 0) {
      setValidationMsg({ type: 'error', text: 'You must add at least one configure question for the reading test.' });
      return;
    }

    const testObject = compileTestObject();

    // Save to localStorage ielts_custom_tests
    const saved = localStorage.getItem('ielts_custom_tests');
    let customList: IELTSTest[] = [];
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          customList = parsed;
        }
      } catch (e) {
        console.error(e);
      }
    }

    // Filter out existing one if modifying
    customList = customList.filter(t => t.id !== testObject.id);
    customList.unshift(testObject);

    // Write back to local storage
    localStorage.setItem('ielts_custom_tests', JSON.stringify(customList));

    // Callback
    onAddTest(testObject);

    setValidationMsg({ 
      type: 'success', 
      text: `"${testObject.title}" successfully written to local storage and active in the mock test bank!` 
    });

    // Reset general fields or trigger success close
    setTimeout(() => {
      onClose();
    }, 1500);
  };

  const copyJSONToClipboard = () => {
    const raw = JSON.stringify(compileTestObject(), null, 2);
    navigator.clipboard.writeText(raw);
    alert('Schema-compliant IELTS Test JSON copied to clipboard!');
  };

  const downloadJSONFile = () => {
    const raw = JSON.stringify(compileTestObject(), null, 2);
    const blob = new Blob([raw], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${title.toLowerCase().replace(/[^a-z0-9]+/g, '_')}_ieltstest.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white rounded-3xl border border-gray-150 p-6 shadow-sm min-h-[600px] text-left space-y-6" id="admin-test-manager-root">
      
      {/* Upper header action area */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-gray-100 pb-5">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-100">
            <Layers className="h-5 w-5" />
          </div>
          <div>
            <span className="rounded bg-rose-50 border border-rose-100 px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-rose-700">
              High-Fidelity Configurator
            </span>
            <h2 className="text-base font-extrabold text-gray-900 mt-1">Admin Test Manager (IELTS Reading)</h2>
          </div>
        </div>

        <div className="flex gap-2 w-full sm:w-auto">
          <button
            onClick={onClose}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all active:scale-95 cursor-pointer"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Content Manager</span>
          </button>
        </div>
      </div>

      {/* 1-Click Interactive Test Pre-loaders templates */}
      <div className="bg-rose-50/40 rounded-2xl border border-rose-100/50 p-4 space-y-3">
        <div className="flex items-start gap-2.5">
          <Info className="h-4.5 w-4.5 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-xs font-bold text-gray-800">1-Click IELTS Test Schema Pre-Loaders</h4>
            <p className="text-[10px] text-gray-500 mt-0.5">Preload pre-configured authentic reading passages containing multiple structured IELTS question types (Headings matching, Yes/No/Not Given, completion lists) to view how schemas populate, verify structures, or store directly.</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 pt-1">
          <button
            type="button"
            onClick={() => handleLoadTemplate(TEMPLATE_ACADEMIC_1)}
            className="bg-white border border-rose-200 hover:border-rose-400 text-[10px] font-bold text-rose-700 px-3 py-2 rounded-xl transition-all shadow-2xs hover:shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <span>⚡ Load Academic Reading Template</span>
          </button>
          <button
            type="button"
            onClick={() => handleLoadTemplate(TEMPLATE_GENERAL_1)}
            className="bg-white border border-gray-200 hover:border-gray-400 text-[10px] font-bold text-gray-700 px-3 py-2 rounded-xl transition-all shadow-2xs hover:shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <span>⚡ Load General Reading Template</span>
          </button>
        </div>
      </div>

      {/* Validation status banners */}
      {validationMsg && (
        <div className={`p-3.5 rounded-xl text-xs font-semibold flex items-start gap-2.5 border ${
          validationMsg.type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-800' :
          validationMsg.type === 'error' ? 'bg-rose-50 border-rose-100 text-rose-800' :
          'bg-blue-50 border-blue-100 text-blue-800'
        }`}>
          <AlertCircle className={`h-4.5 w-4.5 shrink-0 mt-0.5 ${
            validationMsg.type === 'success' ? 'text-emerald-600' :
            validationMsg.type === 'error' ? 'text-rose-600' : 'text-blue-600'
          }`} />
          <span className="leading-relaxed">{validationMsg.text}</span>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex border-b border-gray-150 gap-1.5">
        {[
          { id: 'editor', label: '1. Build Passage & Questions', icon: Edit3 },
          { id: 'preview', label: '2. Live Simulator Preview', icon: Eye },
          { id: 'json', label: '3. Schema JSON Output', icon: FileJson }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold transition-all relative ${
                isActive ? 'text-rose-600' : 'text-gray-400 hover:text-gray-700'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{tab.label}</span>
              {isActive && (
                <motion.div 
                  layoutId="active-tab-indicator" 
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-rose-500 rounded-full" 
                />
              )}
            </button>
          );
        })}
      </div>

      {/* EDITOR WORKSPACE */}
      {activeTab === 'editor' && (
        <div className="space-y-8 animate-in fade-in duration-150">
          
          {/* Section 1: Basic test info */}
          <div className="bg-gray-50/50 p-4 rounded-2xl border border-gray-100 space-y-4">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Passage Settings & Context</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-500 uppercase block">Test Title *</label>
                <input
                  type="text"
                  placeholder="e.g. Cambridge Vol 18 - Reading Test 1"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full text-xs font-bold text-gray-800 bg-white border border-gray-200 rounded-xl p-2.5 outline-none focus:border-rose-500 transition-all"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-500 uppercase block">Type</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as TestType)}
                    className="w-full text-xs font-semibold text-gray-700 bg-white border border-gray-200 rounded-xl p-2.5 outline-none"
                  >
                    <option value="Academic">Academic</option>
                    <option value="General">General</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-500 uppercase block">Difficulty</label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value as DifficultyLevel)}
                    className="w-full text-xs font-semibold text-gray-700 bg-white border border-gray-200 rounded-xl p-2.5 outline-none"
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-500 uppercase block">Time (Min)</label>
                  <input
                    type="number"
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(Number(e.target.value))}
                    className="w-full text-xs font-bold text-gray-800 bg-white border border-gray-200 rounded-xl p-2.5 outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Cambridge IELTS tagging fields */}
            <div className="bg-rose-50/20 p-3.5 rounded-2xl border border-rose-100/30 grid gap-4 grid-cols-3">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-rose-700 uppercase block">Conduct Year</label>
                <input
                  type="number"
                  placeholder="e.g. 2026"
                  value={year}
                  onChange={(e) => setYear(Number(e.target.value))}
                  className="w-full text-xs font-bold text-gray-800 bg-white border border-gray-200 rounded-xl p-2.5 outline-none focus:border-rose-500 transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-rose-700 uppercase block">Cambridge Book #</label>
                <input
                  type="number"
                  placeholder="e.g. 21"
                  value={bookNumber}
                  onChange={(e) => setBookNumber(e.target.value !== '' ? Number(e.target.value) : '')}
                  className="w-full text-xs font-bold text-gray-800 bg-white border border-gray-200 rounded-xl p-2.5 outline-none focus:border-rose-500 transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-rose-700 uppercase block">Test Number</label>
                <input
                  type="number"
                  placeholder="e.g. 1"
                  value={testNumber}
                  onChange={(e) => setTestNumber(e.target.value !== '' ? Number(e.target.value) : '')}
                  className="w-full text-xs font-bold text-gray-800 bg-white border border-gray-200 rounded-xl p-2.5 outline-none focus:border-rose-500 transition-all"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-gray-500 uppercase block">Brief Overview / Instructions</label>
              <input
                type="text"
                placeholder="Brief description seen by students before initiating the exam..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full text-xs text-gray-700 bg-white border border-gray-200 rounded-xl p-2.5 outline-none focus:border-rose-500"
              />
            </div>
          </div>

          {/* Section 2: Block based Reading Passage Builder */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-gray-150 pb-2">
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-rose-500" />
                <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider">Reading Article Passage Blocks ({passageBlocks.length})</h3>
              </div>
              <span className="text-[10px] font-bold text-rose-500 bg-rose-50 px-2 py-0.5 rounded">Block Editor</span>
            </div>

            <div className="space-y-3">
              {passageBlocks.map((block, idx) => {
                const isHeading = block.type === 'heading';
                const isParagraph = block.type === 'paragraph';
                const isImage = block.type === 'image';
                const isTable = block.type === 'table';

                // Count paragraphs sequentially to map letter label A, B, C...
                let paragraphLetter = '';
                if (isParagraph) {
                  let pCount = 0;
                  for (let i = 0; i <= idx; i++) {
                    if (passageBlocks[i].type === 'paragraph') pCount++;
                  }
                  paragraphLetter = String.fromCharCode(64 + pCount); // A, B, C...
                }

                return (
                  <div 
                    key={block.id}
                    className={`rounded-xl border p-3.5 bg-white transition-all hover:shadow-xs flex flex-col gap-3 ${
                      isHeading ? 'border-l-4 border-l-indigo-500 border-gray-150' :
                      isParagraph ? 'border-l-4 border-l-rose-500 border-gray-150' :
                      isImage ? 'border-l-4 border-l-purple-500 border-gray-150' :
                      'border-l-4 border-l-teal-500 border-gray-150'
                    }`}
                  >
                    {/* Header Toolbar */}
                    <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider pb-1.5 border-b border-gray-100">
                      <div className="flex items-center gap-2">
                        {isHeading && <span className="text-indigo-600">✦ Subheading Block</span>}
                        {isParagraph && (
                          <span className="text-rose-600">
                            ✦ Paragraph Block {paragraphLetter && `[Paragraph ${paragraphLetter}]`}
                          </span>
                        )}
                        {isImage && <span className="text-purple-600">✦ Diagram/Image Block</span>}
                        {isTable && <span className="text-teal-600">✦ Structured Table Block</span>}
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => moveBlock(idx, 'up')}
                          disabled={idx === 0}
                          className="p-1 rounded text-gray-400 hover:text-gray-700 hover:bg-gray-100 disabled:opacity-35 cursor-pointer"
                          title="Move Block Up"
                        >
                          <ArrowUp className="h-3 w-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => moveBlock(idx, 'down')}
                          disabled={idx === passageBlocks.length - 1}
                          className="p-1 rounded text-gray-400 hover:text-gray-700 hover:bg-gray-100 disabled:opacity-35 cursor-pointer"
                          title="Move Block Down"
                        >
                          <ArrowDown className="h-3 w-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteBlock(block.id)}
                          className="p-1 rounded text-gray-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer"
                          title="Delete Block"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    </div>

                    {/* Editors */}
                    {isHeading && (
                      <input
                        type="text"
                        placeholder="Type section heading title..."
                        value={block.content}
                        onChange={(e) => updateBlockContent(idx, e.target.value)}
                        className="w-full text-xs font-bold text-gray-800 border-none bg-gray-50/50 p-2 rounded-lg outline-none focus:bg-white"
                      />
                    )}

                    {isParagraph && (
                      <textarea
                        placeholder="Write paragraph text content... Prefix paragraphs with Letters if needed."
                        value={block.content}
                        onChange={(e) => updateBlockContent(idx, e.target.value)}
                        rows={3}
                        className="w-full text-xs text-gray-700 leading-relaxed border-none bg-gray-50/50 p-2 rounded-lg outline-none focus:bg-white font-sans"
                      />
                    )}

                    {isImage && (
                      <div className="space-y-2">
                        <div className="grid gap-2 md:grid-cols-2">
                          <div className="space-y-1">
                            <span className="text-[9px] font-bold text-gray-400 uppercase">Interactive Image/Diagram URL</span>
                            <input
                              type="text"
                              placeholder="https://..."
                              value={block.content}
                              onChange={(e) => updateBlockContent(idx, e.target.value)}
                              className="w-full text-xs text-gray-700 border border-gray-150 bg-gray-50/30 p-1.5 rounded outline-none font-mono"
                            />
                          </div>
                          <div className="space-y-1">
                            <span className="text-[9px] font-bold text-gray-400 uppercase">Subtext/Caption</span>
                            <input
                              type="text"
                              placeholder="Figure Caption description..."
                              value={block.caption || ''}
                              onChange={(e) => updateBlockCaption(idx, e.target.value)}
                              className="w-full text-xs text-gray-700 border border-gray-150 bg-gray-50/30 p-1.5 rounded outline-none"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {isTable && (
                      <div className="space-y-2">
                        <span className="text-[9px] font-bold text-gray-400 uppercase block">Table Markdown (Delineate cells with pipe symbol `|`)</span>
                        <textarea
                          placeholder="Column A | Column B | Column C&#10;Value A1 | Value A2 | Value A3"
                          value={block.content}
                          onChange={(e) => updateBlockContent(idx, e.target.value)}
                          rows={3}
                          className="w-full text-xs font-mono text-gray-700 bg-gray-50/50 p-2 rounded-lg outline-none focus:bg-white"
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Block generation controls */}
            <div className="flex flex-wrap gap-2 pt-2 border-t border-dashed border-gray-200 justify-center">
              <button
                type="button"
                onClick={() => addBlock('paragraph')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-rose-200 bg-rose-50/30 text-rose-700 font-bold text-[10px] hover:bg-rose-50 hover:border-rose-300 transition-all cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" /> + Paragraph Block
              </button>
              <button
                type="button"
                onClick={() => addBlock('heading')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-indigo-200 bg-indigo-50/30 text-indigo-700 font-bold text-[10px] hover:bg-indigo-50 hover:border-indigo-300 transition-all cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" /> + Subheading Block
              </button>
              <button
                type="button"
                onClick={() => addBlock('image')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-purple-200 bg-purple-50/30 text-purple-700 font-bold text-[10px] hover:bg-purple-50 hover:border-purple-300 transition-all cursor-pointer"
              >
                <ImageIcon className="h-3.5 w-3.5" /> + Diagram/Image
              </button>
              <button
                type="button"
                onClick={() => addBlock('table')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-teal-200 bg-teal-50/30 text-teal-700 font-bold text-[10px] hover:bg-teal-50 hover:border-teal-300 transition-all cursor-pointer"
              >
                <TableIcon className="h-3.5 w-3.5" /> + Custom Table
              </button>
            </div>
          </div>

          {/* Section 3: Questions List & Form Configuration */}
          <div className="grid gap-6 lg:grid-cols-12 items-start">
            
            {/* Form Creator Side (7 cols) */}
            <div className="lg:col-span-7 bg-white border border-gray-150 p-4 rounded-2xl space-y-4 shadow-3xs">
              <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider flex items-center gap-1">
                  <PlusCircle className="h-4 w-4 text-rose-500" />
                  <span>{selectedQIndex !== null ? 'Modify Question' : 'Add New Question'}</span>
                </h4>
                {selectedQIndex !== null && (
                  <button 
                    onClick={resetQuestionForm}
                    className="text-[10px] font-bold text-rose-500 hover:underline"
                  >
                    Reset Form
                  </button>
                )}
              </div>

              <form onSubmit={handleAddQuestionToDraft} className="space-y-4">                {/* Question Type Selection */}
                <div className="grid gap-2 sm:grid-cols-3">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-gray-500 uppercase block">IELTS Question Type</span>
                    <select
                      value={qType}
                      onChange={(e) => {
                        const newType = e.target.value as QuestionType;
                        setQType(newType);
                        // Sensible default answers based on selected type
                        if (newType === 'TrueFalseNotGiven') {
                          setQCorrect('True');
                        } else if (newType === 'YesNoNotGiven') {
                          setQCorrect('Yes');
                        } else if (newType === 'MatchingHeadings') {
                          setQCorrect('i');
                          setQHeadings(['i. Heading i', 'ii. Heading ii', 'iii. Heading iii', 'iv. Heading iv']);
                        } else if (newType === 'MCQ') {
                          setQCorrect('A');
                          setQOptions(['A. Option A', 'B. Option B', 'C. Option C', 'D. Option D']);
                        } else if (['MatchingInfo', 'MatchingFeatures', 'MatchingSentenceEndings'].includes(newType)) {
                          setQCorrect('A');
                          setQOptions(['A. Option A', 'B. Option B', 'C. Option C']);
                        } else {
                          setQCorrect('');
                        }
                      }}
                      className="w-full text-xs font-semibold text-gray-700 border border-gray-200 rounded-xl p-2 bg-white"
                    >
                      <option value="MCQ">1. Multiple Choice (MCQ)</option>
                      <option value="TrueFalseNotGiven">2. Identifying Info (True/False/Not Given)</option>
                      <option value="YesNoNotGiven">3. Writer's Views (Yes/No/Not Given)</option>
                      <option value="MatchingInfo">4. Matching Information</option>
                      <option value="MatchingHeadings">5. Matching Paragraph Headings</option>
                      <option value="MatchingFeatures">6. Matching Features</option>
                      <option value="MatchingSentenceEndings">7. Matching Sentence Endings</option>
                      <option value="SentenceCompletion">8. Sentence Completion</option>
                      <option value="SummaryCompletion">9. Summary/Note/Table Completion</option>
                      <option value="DiagramCompletion">10. Diagram Label Completion</option>
                      <option value="ShortAnswer">11. Short-Answer Questions</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-gray-500 uppercase block">Passage / Part Number</span>
                    <select
                      value={qPassageNumber}
                      onChange={(e) => setQPassageNumber(Number(e.target.value))}
                      className="w-full text-xs font-semibold text-gray-700 border border-gray-200 rounded-xl p-2 bg-white"
                    >
                      <option value={1}>Passage 1 / Part 1</option>
                      <option value={2}>Passage 2 / Part 2</option>
                      <option value={3}>Passage 3 / Part 3</option>
                      <option value={4}>Passage 4 / Part 4</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-gray-500 uppercase block">Correct Answer Value</span>
                    {qType === 'TrueFalseNotGiven' ? (
                      <select
                        value={qCorrect}
                        onChange={(e) => setQCorrect(e.target.value)}
                        className="w-full text-xs font-semibold text-gray-700 border border-gray-200 rounded-xl p-2 bg-white"
                      >
                        <option value="True">True</option>
                        <option value="False">False</option>
                        <option value="Not Given">Not Given</option>
                      </select>
                    ) : qType === 'YesNoNotGiven' ? (
                      <select
                        value={qCorrect}
                        onChange={(e) => setQCorrect(e.target.value)}
                        className="w-full text-xs font-semibold text-gray-700 border border-gray-200 rounded-xl p-2 bg-white"
                      >
                        <option value="Yes">Yes</option>
                        <option value="No">No</option>
                        <option value="Not Given">Not Given</option>
                      </select>
                    ) : ['MCQ', 'MatchingInfo', 'MatchingFeatures', 'MatchingSentenceEndings'].includes(qType) ? (
                      <select
                        value={qCorrect}
                        onChange={(e) => setQCorrect(e.target.value)}
                        className="w-full text-xs font-bold text-gray-800 border border-gray-200 rounded-xl p-2 bg-white font-mono"
                      >
                        {qOptions.map((_, i) => {
                          const letter = String.fromCharCode(65 + i);
                          return <option key={letter} value={letter}>{letter}</option>;
                        })}
                      </select>
                    ) : (
                      <input
                        type="text"
                        placeholder={
                          qType === 'MatchingHeadings' ? 'e.g. ii' :
                          qType === 'SentenceCompletion' ? 'e.g. carbon emission' : 'e.g. solar energy'
                        }
                        value={qCorrect}
                        onChange={(e) => setQCorrect(e.target.value)}
                        className="w-full text-xs font-bold text-gray-800 border border-gray-200 rounded-xl p-2 bg-white font-mono"
                      />
                    )}
                  </div>
                </div>

                {/* Question prompt input */}
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-gray-500 uppercase block">Question Prompt / Sentence Stem *</span>
                  <textarea
                    placeholder={
                      qType === 'SentenceCompletion' ? 'Write sentence stem with blank gap represented by underscores, e.g. "Marine biologists discovered deep sea polyps near active tectonic __________."' :
                      qType === 'MatchingHeadings' ? 'Select matching heading for Paragraph A, B etc.' :
                      'Type full question prompt text...'
                    }
                    value={qText}
                    onChange={(e) => setQText(e.target.value)}
                    rows={2}
                    className="w-full text-xs text-gray-700 border border-gray-200 rounded-xl p-2 bg-white outline-none focus:border-rose-500 font-sans leading-relaxed"
                    required
                  />
                </div>

                {/* Subform: Option configuration */}
                {['MCQ', 'MatchingInfo', 'MatchingFeatures', 'MatchingSentenceEndings', 'SummaryCompletion', 'Blanks'].includes(qType) && (
                  <div className="space-y-2 bg-gray-50/50 p-3 rounded-xl border border-gray-100">
                    <span className="text-[9px] font-extrabold text-gray-400 uppercase tracking-wider block">
                      Define Options/Sentence Endings/Scientist List (Maximum 8)
                    </span>
                    <div className="grid gap-1.5 md:grid-cols-2">
                      {qOptions.map((opt, idx) => (
                        <div key={idx} className="flex gap-1.5 items-center bg-white p-1 rounded-lg border border-gray-150">
                          <span className="font-mono font-bold text-[10px] text-gray-400 pl-1">
                            {String.fromCharCode(65 + idx)}.
                          </span>
                          <input
                            type="text"
                            value={opt.includes('. ') ? opt.split('. ').slice(1).join('. ') : opt}
                            onChange={(e) => {
                              const updated = [...qOptions];
                              const prefix = String.fromCharCode(65 + idx);
                              updated[idx] = `${prefix}. ${e.target.value}`;
                              setQOptions(updated);
                            }}
                            placeholder={`Option ${String.fromCharCode(65 + idx)}`}
                            className="flex-grow text-[11px] text-gray-700 outline-none border-none bg-transparent"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              if (qOptions.length > 2) {
                                setQOptions(qOptions.filter((_, i) => i !== idx));
                              }
                            }}
                            className="text-gray-300 hover:text-rose-500 font-bold px-1.5"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        const letter = String.fromCharCode(65 + qOptions.length);
                        setQOptions([...qOptions, `${letter}. New Option Row`]);
                      }}
                      className="text-[9px] font-bold text-rose-600 hover:underline flex items-center gap-1 mt-1"
                    >
                      <PlusCircle className="h-3 w-3" /> Add Option Entry
                    </button>
                  </div>
                )}

                {/* Subform: Paragraph Headings list config */}
                {qType === 'MatchingHeadings' && (
                  <div className="space-y-2 bg-gray-50/50 p-3 rounded-xl border border-gray-100">
                    <span className="text-[9px] font-extrabold text-gray-400 uppercase tracking-wider block">
                      Set Paragraph Headings Pool (Roman numerals)
                    </span>
                    <div className="space-y-1.5">
                      {qHeadings.map((head, idx) => (
                        <div key={idx} className="flex gap-1.5 items-center bg-white p-1 rounded-lg border border-gray-150">
                          <span className="font-mono font-bold text-[10px] text-indigo-500 pl-1 w-8 text-right">
                            {['i','ii','iii','iv','v','vi','vii','viii','ix','x'][idx]}.
                          </span>
                          <input
                            type="text"
                            value={head.includes('. ') ? head.split('. ').slice(1).join('. ') : head}
                            onChange={(e) => {
                              const updated = [...qHeadings];
                              const roman = ['i','ii','iii','iv','v','vi','vii','viii','ix','x'][idx];
                              updated[idx] = `${roman}. ${e.target.value}`;
                              setQHeadings(updated);
                            }}
                            placeholder="Heading Text..."
                            className="flex-grow text-[11px] text-gray-700 outline-none border-none bg-transparent"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              if (qHeadings.length > 2) {
                                setQHeadings(qHeadings.filter((_, i) => i !== idx));
                              }
                            }}
                            className="text-gray-300 hover:text-rose-500 font-bold px-1.5"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        const roman = ['i','ii','iii','iv','v','vi','vii','viii','ix','x'][qHeadings.length];
                        setQHeadings([...qHeadings, `${roman}. New Heading option`]);
                      }}
                      className="text-[9px] font-bold text-rose-600 hover:underline flex items-center gap-1 mt-1"
                    >
                      <PlusCircle className="h-3 w-3" /> Add Heading option row
                    </button>
                  </div>
                )}

                {/* Word limit info box for completions */}
                {['SentenceCompletion', 'SummaryCompletion', 'DiagramCompletion', 'ShortAnswer'].includes(qType) && (
                  <div className="rounded-xl border border-blue-150 bg-blue-50/50 p-2.5 text-[10px] text-blue-800 font-semibold flex items-center gap-2">
                    <Info className="h-3.5 w-3.5 text-blue-600" />
                    <span>IELTS rules apply. Use instructions like "Write NO MORE THAN TWO WORDS" for candidate text input guidance.</span>
                  </div>
                )}

                {/* Explanation text */}
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-gray-500 uppercase block">Teacher Explanation / Reference Location</span>
                  <input
                    type="text"
                    placeholder="e.g. Paragraph B explicitly details Vance discovering specialized protein genes."
                    value={qExplanation}
                    onChange={(e) => setQExplanation(e.target.value)}
                    className="w-full text-xs text-gray-700 border border-gray-200 rounded-xl p-2.5 bg-white outline-none focus:border-rose-500"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2 bg-gray-900 hover:bg-black text-white rounded-xl text-xs font-bold transition-all active:scale-98 cursor-pointer"
                >
                  {selectedQIndex !== null ? '✓ Update Question' : '+ Append Question to Draft Test'}
                </button>
              </form>
            </div>

            {/* Questions List Draft Area (5 cols) */}
            <div className="lg:col-span-5 bg-gray-50/50 border border-gray-100 p-4 rounded-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-gray-200 pb-2">
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Test Questions Draft ({questions.length})
                </h4>
                {questions.length > 0 && (
                  <button
                    onClick={() => {
                      if (confirm('Delete all drafted questions?')) setQuestions([]);
                    }}
                    className="text-[10px] font-bold text-rose-600 hover:underline"
                  >
                    Clear All
                  </button>
                )}
              </div>

              {questions.length === 0 ? (
                <div className="py-12 text-center text-gray-400 space-y-2">
                  <HelpIcon className="h-8 w-8 text-gray-300 mx-auto animate-bounce" />
                  <p className="text-xs font-semibold">No questions added yet.</p>
                  <p className="text-[10px] text-gray-400 leading-normal max-w-xs mx-auto">Use the configurator form on the left to add specific IELTS question types to your reading passage.</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-[450px] overflow-y-auto pr-1">
                  {questions.map((q, index) => (
                    <div 
                      key={q.id}
                      onClick={() => handleEditQuestionFromList(index)}
                      className={`group relative p-3 rounded-xl border text-left cursor-pointer transition-all ${
                        selectedQIndex === index 
                          ? 'bg-rose-50/50 border-rose-300 shadow-sm'
                          : 'bg-white border-gray-150 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-mono text-[10px] font-extrabold text-rose-600 bg-rose-50 px-1.5 py-0.2 rounded">
                          Q{index + 1}
                        </span>
                        <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider font-mono">
                          {q.type}
                        </span>
                      </div>
                      <p className="text-[11px] font-semibold text-gray-700 mt-1.5 line-clamp-2">
                        {q.questionText}
                      </p>
                      <div className="flex items-center justify-between gap-2 mt-2 pt-1.5 border-t border-gray-100/50 text-[10px] text-gray-400">
                        <span className="truncate max-w-[150px]">Answer: <strong>{q.correctAnswer}</strong></span>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditQuestionFromList(index);
                            }}
                            className="p-1 rounded text-gray-400 hover:text-gray-700 hover:bg-gray-100"
                            title="Edit"
                          >
                            <Edit3 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteQuestionFromList(index);
                            }}
                            className="p-1 rounded text-gray-400 hover:text-rose-600 hover:bg-rose-50"
                            title="Delete"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Section 4: Deployed local storage */}
          <div className="flex justify-end pt-5 border-t border-gray-100">
            <button
              onClick={handleSaveWholeTest}
              className="px-6 py-3 rounded-xl text-xs font-black text-white bg-rose-600 hover:bg-rose-500 shadow-lg shadow-rose-100 flex items-center gap-2 transition-all active:scale-95 cursor-pointer"
            >
              <Check className="h-4 w-4" />
              <span>✓ Compile & Deploy Custom Test to Local Storage</span>
            </button>
          </div>
        </div>
      )}

      {/* LIVE SIMULATOR PREVIEW TAB */}
      {activeTab === 'preview' && (
        <div className="grid gap-6 md:grid-cols-12 items-start animate-in fade-in duration-150">
          
          {/* Left: Passage Preview (6 cols) */}
          <div className="md:col-span-6 bg-white border border-gray-150 rounded-2xl p-4 space-y-4 max-h-[600px] overflow-y-auto">
            <div className="border-b border-gray-100 pb-2">
              <span className="text-[9px] font-extrabold text-rose-500 bg-rose-50 px-2 py-0.5 rounded">IELTS Simulator Reading Passage</span>
              <h3 className="text-sm font-extrabold text-gray-900 mt-1">{title || 'Untitled Passage'}</h3>
            </div>

            <div className="space-y-4 text-xs text-gray-700 leading-relaxed font-sans">
              {passageBlocks.map((b, i) => {
                if (b.type === 'heading') {
                  return <h4 key={i} className="text-xs font-black text-gray-800 uppercase tracking-wider mt-4">{b.content}</h4>;
                }
                if (b.type === 'paragraph') {
                  return <p key={i} className="indent-4">{b.content}</p>;
                }
                if (b.type === 'image') {
                  return (
                    <div key={i} className="my-4 p-2 bg-gray-50 border border-gray-150 rounded-xl flex flex-col items-center">
                      <img src={b.content} alt={b.caption} className="max-h-48 object-contain rounded-lg" referrerPolicy="no-referrer" />
                      {b.caption && <span className="text-[9px] text-gray-400 font-bold mt-1.5">{b.caption}</span>}
                    </div>
                  );
                }
                if (b.type === 'table') {
                  return (
                    <div key={i} className="my-4 overflow-x-auto border border-gray-150 rounded-xl bg-white text-[10px]">
                      <table className="w-full text-left border-collapse">
                        <tbody>
                          {b.content.split('\n').filter(l => l.trim()).map((line, rIdx) => {
                            const cells = line.split('|').map(c => c.trim());
                            return (
                              <tr key={rIdx} className={rIdx === 0 ? 'bg-gray-50 font-bold text-gray-700 border-b border-gray-200' : 'border-b border-gray-100'}>
                                {cells.map((cell, cIdx) => (
                                  <td key={cIdx} className="p-2 border-r border-gray-100 last:border-r-0">{cell}</td>
                                ))}
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  );
                }
                return null;
              })}
            </div>
          </div>

          {/* Right: Question Widgets Preview (6 cols) */}
          <div className="md:col-span-6 bg-gray-50/50 border border-gray-100 rounded-2xl p-4 space-y-4 max-h-[600px] overflow-y-auto">
            <div className="border-b border-gray-200 pb-2">
              <span className="text-[9px] font-extrabold text-gray-400 uppercase tracking-wider">Interactive Candidate Widget Mockup</span>
              <h3 className="text-xs font-bold text-gray-600 mt-1">Questions list view seen by candidates during active testing</h3>
            </div>

            {questions.length === 0 ? (
              <div className="py-12 text-center text-gray-400 space-y-1">
                <AlertCircle className="h-6 w-6 text-gray-300 mx-auto" />
                <p className="text-xs font-bold">No interactive questions added yet.</p>
                <p className="text-[10px]">Back to the Editor tab to configure questions.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {questions.map((q, idx) => (
                  <div key={q.id} className="bg-white p-3.5 rounded-xl border border-gray-150 space-y-3 shadow-3xs">
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] font-black bg-rose-600 text-white px-1.5 py-0.2 rounded">Q{idx + 1}</span>
                      <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">{q.type}</span>
                    </div>

                    <p className="text-xs font-bold text-gray-800 leading-normal">{q.questionText}</p>

                    {/* Dynamic answer renderer using unified QuestionRenderer */}
                    <QuestionRenderer
                      question={q}
                      value=""
                      onChange={() => {}}
                      disabled
                    />

                    <div className="pt-2 border-t border-dashed border-gray-100 text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                      <Check className="h-3 w-3" />
                      <span>Correct Answer Schema: <strong className="font-mono text-xs text-rose-600 font-black">{q.correctAnswer}</strong></span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* SCHEMA JSON OUTPUT TAB */}
      {activeTab === 'json' && (
        <div className="space-y-4 animate-in fade-in duration-150">
          <div className="rounded-xl border border-gray-150 p-4 bg-gray-50/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h4 className="text-xs font-bold text-gray-800">IELTS Test Data Model Schema Representation</h4>
              <p className="text-[10px] text-gray-400 mt-0.5">Below is the complete, high-fidelity JSON object generated from your active passage blocks and question configurations.</p>
            </div>
            
            <div className="flex items-center gap-1.5 self-stretch sm:self-auto">
              <button
                type="button"
                onClick={copyJSONToClipboard}
                className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold shadow-2xs cursor-pointer transition-all active:scale-95"
              >
                <Copy className="h-3.5 w-3.5 text-gray-500" />
                <span>Copy JSON</span>
              </button>
              <button
                type="button"
                onClick={downloadJSONFile}
                className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl px-3 py-2 text-xs font-bold shadow-xs cursor-pointer transition-all active:scale-95"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Download .json</span>
              </button>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-150 overflow-hidden bg-gray-950 p-4 relative shadow-inner">
            <div className="absolute top-3 right-3 text-[10px] text-gray-500 uppercase tracking-widest font-mono font-bold bg-gray-900/60 px-2 py-0.5 rounded">
              IELTSTest Schema Compliant
            </div>
            <pre className="text-emerald-400 text-xs font-mono overflow-x-auto max-h-[500px] text-left leading-relaxed whitespace-pre p-1">
              {JSON.stringify(compileTestObject(), null, 2)}
            </pre>
          </div>
        </div>
      )}

    </div>
  );
}
