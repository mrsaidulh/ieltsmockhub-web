import React, { useState, useEffect, useRef } from 'react';
import { 
  Database, Plus, Trash2, Edit3, ArrowLeft, Check, AlertCircle, 
  HelpCircle, Volume2, BookOpen, PenTool, Mic, PlusCircle, MinusCircle, 
  FileText, LayoutGrid, Eye, EyeOff, Lock, Unlock, Settings,
  ArrowUp, ArrowDown, Image as ImageIcon, Table as TableIcon, Users, BarChart3,
  Sparkles, Play, Pause, Layers, HelpCircle as HelpIcon, CheckCircle2, Sparkle, Server
} from 'lucide-react';
import { IELTSTest, IELTSQuestion, TestCategory, TestType, QuestionType, PassageBlock, StudentLead, AdminUser } from '../types';
import AdminUserStats from './AdminUserStats';
import AdminServerMonitor from './AdminServerMonitor';
import QuestionRenderer from './QuestionRenderer';

interface AdminPanelProps {
  tests: IELTSTest[];
  onAddTest: (test: IELTSTest) => void;
  onUpdateTest: (test: IELTSTest) => void;
  onDeleteTest: (id: string) => void;
  onResetToDefaults?: () => void;
  onLogoutAdmin?: () => void;
  students?: StudentLead[];
  onUpdateStudents?: (updatedStudents: StudentLead[]) => void;
  adminUser?: AdminUser | null;
  onResetAnalytics?: () => void;
}

const ALL_QUESTION_TYPES: QuestionType[] = [
  'MCQ', 
  'TrueFalseNotGiven', 
  'YesNoNotGiven', 
  'MatchingHeadings', 
  'MatchingInfo', 
  'MatchingFeatures', 
  'MatchingSentenceEndings', 
  'SentenceCompletion', 
  'SummaryCompletion', 
  'DiagramCompletion', 
  'ShortAnswer',
  'Blanks'
];

export default function AdminPanel({
  tests,
  onAddTest,
  onUpdateTest,
  onDeleteTest,
  onLogoutAdmin,
  students = [],
  onUpdateStudents = () => {},
  adminUser = null,
  onResetAnalytics
}: AdminPanelProps) {
  // Navigation inside Admin Panel
  const [viewMode, setViewMode] = useState<'user_stats' | 'server_monitor' | 'list' | 'form'>('user_stats');
  const [editingTestId, setEditingTestId] = useState<string | null>(null);
  const [serverThresholdBreached, setServerThresholdBreached] = useState<boolean>(false);
  const [serverMaxPct, setServerMaxPct] = useState<number>(0);

  // Form States - Core Metadata
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<TestCategory>('reading');
  const [type, setType] = useState<TestType>('Academic');
  const [durationMinutes, setDurationMinutes] = useState<number>(60);
  const [description, setDescription] = useState('');
  const [year, setYear] = useState<number | ''>(2026);
  const [bookNumber, setBookNumber] = useState<number | ''>('');
  const [testNumber, setTestNumber] = useState<number | ''>('');
  const [passageNumber, setPassageNumber] = useState<number | ''>(1);
  const [selectedQuestionTypes, setSelectedQuestionTypes] = useState<QuestionType[]>([]);
  
  // Custom Content Fields
  const [passage, setPassage] = useState('');
  const [passageBlocks, setPassageBlocks] = useState<PassageBlock[]>([]);
  const [audioUrl, setAudioUrl] = useState('');
  const [audioScript, setAudioScript] = useState('');
  
  // Writing Multi-Task Content Fields
  const [writingPrompt, setWritingPrompt] = useState(''); // Task 1 prompt text
  const [writingTask2Prompt, setWritingTask2Prompt] = useState(''); // Task 2 essay prompt text
  const [writingTask1ImageUrl, setWritingTask1ImageUrl] = useState(''); // Task 1 chart/graph image URL
  const [writingSampleAnswer, setWritingSampleAnswer] = useState(''); // Band 9 model answer

  // Speaking Multi-Part Content Fields
  const [speakingPart1, setSpeakingPart1] = useState(''); // Part 1 Introduction topics
  const [speakingPart2, setSpeakingPart2] = useState(''); // Part 2 Cue card prompt
  const [speakingPart3, setSpeakingPart3] = useState(''); // Part 3 Discussion questions
  const [speakingSampleAnswer, setSpeakingSampleAnswer] = useState(''); // Band 9 model answers / vocabulary

  // Audio stream tester
  const [isPlayingAudioTest, setIsPlayingAudioTest] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Question Builder Preview State
  const [previewTestAnswer, setPreviewTestAnswer] = useState('');

  // Sections (e.g. ['Section 1', 'Section 2'])
  const [sectionsText, setSectionsText] = useState('');

  // Questions Array State
  const [questions, setQuestions] = useState<IELTSQuestion[]>([]);

  // Individual Question Builder State (For adding/editing within the form)
  const [currentQText, setCurrentQText] = useState('');
  const [currentQType, setCurrentQType] = useState<QuestionType>('MCQ');
  const [currentQCorrect, setCurrentQCorrect] = useState('');
  const [currentQExplanation, setCurrentQExplanation] = useState('');
  const [currentQOptions, setCurrentQOptions] = useState<string[]>(['A. Option A', 'B. Option B', 'C. Option C', 'D. Option D']);
  const [currentQHeadings, setCurrentQHeadings] = useState<string[]>(['i. Heading i', 'ii. Heading ii', 'iii. Heading iii', 'iv. Heading iv']);
  const [currentQPassageNumber, setCurrentQPassageNumber] = useState<number>(1);
  const [selectedQuestionIndex, setSelectedQuestionIndex] = useState<number | null>(null);

  const [formError, setFormError] = useState<string | null>(null);

  // Load existing test data for editing
  const handleStartEdit = (test: IELTSTest) => {
    setEditingTestId(test.id);
    setTitle(test.title);
    setCategory(test.category);
    setType(test.type);
    setDurationMinutes(test.durationMinutes);
    setDescription(test.description);
    setSectionsText(test.sections.join('\n'));
    setPassage(test.passage || '');
    setAudioUrl(test.audioUrl || '');
    setAudioScript(test.audioScript || '');
    setYear(test.bookYear || test.year || 2026);
    setBookNumber(test.bookNumber !== undefined ? test.bookNumber : '');
    setTestNumber(test.testNumber !== undefined ? test.testNumber : '');
    setPassageNumber(test.passageNumber || 1);
    setSelectedQuestionTypes(test.questionTypes || []);
    
    // Load passage blocks with high fidelity migration
    if (test.passageBlocks && test.passageBlocks.length > 0) {
      setPassageBlocks(test.passageBlocks);
    } else {
      const legacyText = test.passage || '';
      const blocks = legacyText.split(/\n\s*\n/).map((para, idx) => ({
        id: `block_${idx}_${Math.random().toString(36).substr(2, 4)}`,
        type: 'paragraph' as const,
        content: para,
      }));
      setPassageBlocks(blocks);
    }

    if (test.category === 'writing') {
      setWritingPrompt(test.sections[0] || '');
      setWritingTask2Prompt(test.sections[1] || '');
      setWritingSampleAnswer(test.sections[2] || '');
      if (test.passage && test.passage.startsWith('http')) {
        setWritingTask1ImageUrl(test.passage);
      } else {
        setWritingTask1ImageUrl('');
      }
    } else if (test.category === 'speaking') {
      setSpeakingPart1(test.sections[0] || '');
      setSpeakingPart2(test.sections[1] || '');
      setSpeakingPart3(test.sections[2] || '');
      setSpeakingSampleAnswer(test.sections[3] || '');
    }

    // Load questions
    setQuestions(test.questions || []);
    resetQuestionBuilder();
    setViewMode('form');
  };

  const handleStartCreate = () => {
    setEditingTestId(null);
    setTitle('');
    setCategory('reading');
    setType('Academic');
    setDurationMinutes(60);
    setDescription('');
    setSectionsText('');
    setPassage('');
    setPassageBlocks([
      {
        id: 'b1',
        type: 'heading',
        content: 'Title of the Reading Passage'
      },
      {
        id: 'b2',
        type: 'paragraph',
        content: 'Write the first paragraph of your reading passage here. Label paragraphs like Paragraph A, Paragraph B for matching questions.'
      }
    ]);
    setAudioUrl('');
    setAudioScript('');
    setWritingPrompt('');
    setWritingTask2Prompt('');
    setWritingTask1ImageUrl('');
    setWritingSampleAnswer('');
    setSpeakingPart1('');
    setSpeakingPart2('');
    setSpeakingPart3('');
    setSpeakingSampleAnswer('');
    setQuestions([]);
    setYear(2026);
    setBookNumber('');
    setTestNumber('');
    setPassageNumber(1);
    setSelectedQuestionTypes([]);
    resetQuestionBuilder();
    setFormError(null);
    setViewMode('form');
  };

  const resetQuestionBuilder = () => {
    setCurrentQText('');
    setCurrentQType('MCQ');
    setCurrentQCorrect('');
    setCurrentQExplanation('');
    setCurrentQOptions(['A. Option A', 'B. Option B', 'C. Option C', 'D. Option D']);
    setCurrentQHeadings(['i. Heading i', 'ii. Heading ii', 'iii. Heading iii', 'iv. Heading iv']);
    setCurrentQPassageNumber(1);
    setSelectedQuestionIndex(null);
  };

  // Add or Update Question in current list
  const handleSaveQuestion = () => {
    if (!currentQText.trim()) {
      alert('Question text cannot be empty.');
      return;
    }
    if (!currentQCorrect.trim()) {
      alert('Please specify the correct answer.');
      return;
    }

    const questionData: IELTSQuestion = {
      id: selectedQuestionIndex !== null && questions[selectedQuestionIndex]
        ? questions[selectedQuestionIndex].id
        : `q_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      type: currentQType,
      questionText: currentQText,
      correctAnswer: currentQCorrect.trim(),
      explanation: currentQExplanation.trim() || 'Predefined answers check verified.',
      options: ['MCQ', 'MatchingInfo', 'MatchingFeatures', 'MatchingSentenceEndings', 'SummaryCompletion'].includes(currentQType)
        ? currentQOptions.filter(o => o.trim() !== '')
        : undefined,
      headingOptions: currentQType === 'MatchingHeadings' ? currentQHeadings.filter(h => h.trim() !== '') : undefined,
      passageNumber: currentQPassageNumber || 1
    };

    if (selectedQuestionIndex !== null) {
      // Update
      const updated = [...questions];
      updated[selectedQuestionIndex] = questionData;
      setQuestions(updated);
    } else {
      // Add new
      setQuestions([...questions, questionData]);
    }

    resetQuestionBuilder();
  };

  // Load question into builder for editing
  const handleEditQuestion = (index: number) => {
    const q = questions[index];
    setSelectedQuestionIndex(index);
    setCurrentQText(q.questionText);
    setCurrentQType(q.type);
    setCurrentQCorrect(q.correctAnswer);
    setCurrentQExplanation(q.explanation || '');
    if (q.options) setCurrentQOptions(q.options);
    if (q.headingOptions) setCurrentQHeadings(q.headingOptions);
    setCurrentQPassageNumber(q.passageNumber || 1);
  };

  const handleDeleteQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index));
    if (selectedQuestionIndex === index) {
      resetQuestionBuilder();
    }
  };

  const handleSaveTest = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      setFormError('Test Title is required.');
      return;
    }

    if (year === '') {
      setFormError('Book Year is required.');
      return;
    }
    const yNum = Number(year);
    if (isNaN(yNum) || yNum < 2011 || yNum > 2026) {
      setFormError('Book Year must be a valid number between 2011 and 2026.');
      return;
    }

    if (bookNumber === '') {
      setFormError('Book Number is required.');
      return;
    }
    const bNum = Number(bookNumber);
    if (isNaN(bNum) || bNum < 10 || bNum > 21) {
      setFormError('Book Number must be a valid number between 10 and 21.');
      return;
    }

    if (testNumber === '') {
      setFormError('Test Number is required.');
      return;
    }
    const tNum = Number(testNumber);
    if (isNaN(tNum) || tNum < 1 || tNum > 4) {
      setFormError('Test Number must be a valid number between 1 and 4.');
      return;
    }

    if (passageNumber === '') {
      setFormError('Passage / Part Number is required.');
      return;
    }
    const pNum = Number(passageNumber);
    const maxPassage = category === 'listening' ? 4 : 3;
    if (isNaN(pNum) || pNum < 1 || pNum > maxPassage) {
      setFormError(`Passage / Part Number must be a valid number between 1 and ${maxPassage}.`);
      return;
    }

    let resolvedSections: string[] = [];
    if (category === 'writing') {
      resolvedSections = [
        writingPrompt || `Task 1: The visual chart or diagram below shows data regarding key metrics. Write at least 150 words.`,
        writingTask2Prompt || `Task 2: Discuss both views and give your opinion with relevant examples. Write at least 250 words.`,
        writingSampleAnswer || ''
      ].filter((s, idx) => idx < 2 || s.trim() !== '');
    } else if (category === 'speaking') {
      resolvedSections = [
        speakingPart1 || 'Part 1: Discussion on leisure and hobbies',
        speakingPart2 || 'Part 2 Cue Card: Describe an old building or structure',
        speakingPart3 || 'Part 3: Preservation vs modernization',
        speakingSampleAnswer || ''
      ].filter((s, idx) => idx < 3 || s.trim() !== '');
    } else {
      resolvedSections = sectionsText.split('\n').map(s => s.trim()).filter(s => s !== '');
      if (resolvedSections.length === 0) {
        resolvedSections = ['Section 1: General Core Overview'];
      }
    }

    const testData: IELTSTest = {
      id: editingTestId || `custom_${Date.now()}`,
      title: title.trim(),
      category,
      type,
      durationMinutes: Number(durationMinutes) || 30,
      questionsCount: category === 'writing' ? 2 : category === 'speaking' ? 3 : (questions.length > 0 ? questions.length : 40),
      attemptsCount: editingTestId ? (tests.find(t => t.id === editingTestId)?.attemptsCount || 0) : 0,
      averageScore: editingTestId ? (tests.find(t => t.id === editingTestId)?.averageScore || 7.0) : 7.0,
      description: description.trim() || `Authentic custom practice test designed for ${category} assessment.`,
      sections: resolvedSections,
      questions: category !== 'writing' && category !== 'speaking' ? questions : undefined,
      passageBlocks: category === 'reading' ? passageBlocks : undefined,
      passage: category === 'reading' 
        ? passageBlocks.map(b => b.content).join('\n\n') 
        : category === 'writing' && writingTask1ImageUrl
          ? writingTask1ImageUrl
          : undefined,
      audioUrl: category === 'listening' ? audioUrl.trim() : undefined,
      audioScript: category === 'listening' ? audioScript.trim() : undefined,
      bookYear: Number(year) || 2026,
      year: Number(year) || 2026,
      bookNumber: bookNumber !== '' ? Number(bookNumber) : 21,
      testNumber: testNumber !== '' ? Number(testNumber) : 1,
      passageNumber: Number(passageNumber) || 1,
      questionTypes: selectedQuestionTypes.length > 0
        ? selectedQuestionTypes
        : (category !== 'writing' && category !== 'speaking' ? Array.from(new Set(questions.map(q => q.type))) : []) as QuestionType[]
    };

    if (editingTestId) {
      onUpdateTest(testData);
    } else {
      onAddTest(testData);
    }

    setViewMode('list');
    setEditingTestId(null);
  };

  // Calculations for Admin Stats Panel
  const stats = {
    total: tests.length,
    listening: tests.filter(t => t.category === 'listening').length,
    reading: tests.filter(t => t.category === 'reading').length,
    writing: tests.filter(t => t.category === 'writing').length,
    speaking: tests.filter(t => t.category === 'speaking').length,
    questions: tests.reduce((acc, t) => acc + (t.questions?.length || (t.questionsCount || 0)), 0)
  };

  return (
    <div className="bg-white rounded-3xl border border-gray-150 p-6 shadow-sm min-h-[600px] text-left space-y-6 animate-in fade-in duration-200">
      
      {/* Header of Admin Panel */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-gray-100 pb-5">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-100">
            <Database className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="rounded bg-rose-50 border border-rose-100 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-rose-700">
                {adminUser?.role === 'ContentManager' ? 'Content Manager' : 'Administrator'}
              </span>
              {adminUser?.username && (
                <span className="text-[10px] text-gray-500 font-semibold">
                  ({adminUser.username})
                </span>
              )}
            </div>
            <h2 className="text-base font-extrabold text-gray-900 mt-1">
              {adminUser?.role === 'ContentManager' ? 'IELTS Content Manager Workspace' : 'IELTS Admin Workspace'}
            </h2>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          {onLogoutAdmin && (
            <button
              type="button"
              onClick={onLogoutAdmin}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-bold text-rose-600 border border-rose-200 bg-rose-50/50 rounded-xl hover:bg-rose-50 hover:text-rose-700 transition-all active:scale-95 cursor-pointer"
            >
              <Lock className="h-3.5 w-3.5" />
              <span>Exit Admin</span>
            </button>
          )}

          {viewMode === 'list' && (
            <button
              type="button"
              onClick={handleStartCreate}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 rounded-xl shadow-md shadow-rose-100 transition-all active:scale-95 cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>Create Mock Test</span>
            </button>
          )}

          {viewMode === 'form' && (
            <button
              onClick={() => setViewMode('list')}
              className="flex items-center gap-1 px-3 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-50 rounded-xl border border-gray-200 transition-all active:scale-95 cursor-pointer"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back to Tests</span>
            </button>
          )}
        </div>
      </div>

      {/* Admin Module Sub-Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-gray-150 pb-2">
        <button
          onClick={() => setViewMode('user_stats')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            viewMode === 'user_stats'
              ? 'bg-rose-600 text-white shadow-md shadow-rose-100'
              : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
          }`}
        >
          <BarChart3 className="h-4 w-4" />
          <span>User Statistics & Analytics</span>
        </button>

        <button
          onClick={() => setViewMode('server_monitor')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer relative ${
            viewMode === 'server_monitor'
              ? 'bg-rose-600 text-white shadow-md shadow-rose-100'
              : serverThresholdBreached
              ? 'bg-rose-50 text-rose-700 border border-rose-300 hover:bg-rose-100'
              : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
          }`}
        >
          <Server className={`h-4 w-4 ${serverThresholdBreached ? 'text-rose-600 animate-bounce' : ''}`} />
          <span>Server Resources & Peak Load Monitor</span>
          {serverThresholdBreached && (
            <span className="bg-rose-600 text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider animate-pulse shadow-sm">
              ⚠️ OVERLOAD {serverMaxPct}%
            </span>
          )}
        </button>

        <button
          onClick={() => setViewMode('list')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            viewMode === 'list' || viewMode === 'form'
              ? 'bg-rose-600 text-white shadow-md shadow-rose-100'
              : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
          }`}
        >
          <Database className="h-4 w-4" />
          <span>IELTS Test Content Bank ({tests.length})</span>
        </button>
      </div>

      {/* User Statistics View */}
      {viewMode === 'user_stats' && (
        <AdminUserStats 
          students={students} 
          onUpdateStudents={onUpdateStudents} 
          adminUser={adminUser}
          onResetAnalytics={onResetAnalytics}
        />
      )}

      {/* Server Resources & Load Monitor View */}
      {viewMode === 'server_monitor' && (
        <AdminServerMonitor 
          onThresholdStatusChange={(isBreached, maxPct) => {
            setServerThresholdBreached(isBreached);
            setServerMaxPct(maxPct);
          }}
        />
      )}

      {/* List Mode View */}
      {viewMode === 'list' && (
        <div className="space-y-6">
          {/* Quick Metrics Dashboard */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
            {[
              { label: 'Total Tests', val: stats.total, color: 'bg-gray-50 text-gray-800' },
              { label: 'Listening', val: stats.listening, color: 'bg-blue-50 text-blue-700' },
              { label: 'Reading', val: stats.reading, color: 'bg-rose-50 text-rose-700' },
              { label: 'Writing', val: stats.writing, color: 'bg-teal-50 text-teal-700' },
              { label: 'Speaking', val: stats.speaking, color: 'bg-purple-50 text-purple-700' },
              { label: 'Interactive Qs', val: stats.questions, color: 'bg-amber-50 text-amber-700' }
            ].map((st, i) => (
              <div key={i} className={`rounded-2xl p-3 border border-transparent ${st.color} flex flex-col justify-between h-20`}>
                <span className="text-[10px] font-bold uppercase tracking-wider opacity-80">{st.label}</span>
                <span className="text-xl font-black">{st.val}</span>
              </div>
            ))}
          </div>

          {/* Test Listing Panel */}
          <div className="border border-gray-100 rounded-2xl overflow-hidden bg-white shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-gray-50/75 text-gray-400 font-bold uppercase tracking-wider border-b border-gray-100">
                    <th className="px-4 py-3">IELTS Title & Category</th>
                    <th className="px-4 py-3">Mode Type</th>
                    <th className="px-4 py-3">Duration</th>
                    <th className="px-4 py-3">Questions</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {tests.map((test) => {
                    const isCustom = test.id.startsWith('custom_');
                    return (
                      <tr key={test.id} className="hover:bg-gray-50/50 transition-all">
                        <td className="px-4 py-3.5">
                          <div className="flex flex-col">
                            <span className="font-bold text-gray-900 flex items-center gap-1.5">
                              {test.title}
                              {isCustom && (
                                <span className="bg-rose-100 text-rose-700 border border-rose-150 rounded text-[9px] px-1 py-0.2 font-extrabold uppercase">Custom</span>
                              )}
                            </span>
                            <span className="text-[10px] text-gray-400 capitalize mt-0.5 font-mono">{test.category}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3.5">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                            test.type === 'Academic' ? 'bg-indigo-50 text-indigo-600' : 'bg-emerald-50 text-emerald-600'
                          }`}>
                            {test.type}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 font-semibold text-gray-600">{test.durationMinutes}m</td>
                        <td className="px-4 py-3.5 text-gray-500 font-bold font-mono">
                          {test.category === 'writing' ? '2 Tasks' : test.category === 'speaking' ? '3 Parts' : `${test.questions?.length || test.questionsCount || 40} Qs`}
                        </td>
                        <td className="px-4 py-3.5 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => handleStartEdit(test)}
                              className="p-1.5 rounded-lg text-gray-500 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                              title="Edit test elements"
                            >
                              <Edit3 className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => {
                                if (confirm(`Are you sure you want to delete "${test.title}"?`)) {
                                  onDeleteTest(test.id);
                                  alert('Test deleted successfully.');
                                }
                              }}
                              className="p-1.5 rounded-lg text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                              title="Delete test"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {tests.length === 0 && (
              <div className="py-12 text-center text-gray-400 space-y-1">
                <AlertCircle className="h-8 w-8 text-gray-300 mx-auto" />
                <p className="text-xs font-semibold">No tests found in database.</p>
                <p className="text-[10px]">Create a new custom mock test to begin building.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Form Mode View */}
      {viewMode === 'form' && (
        <form onSubmit={handleSaveTest} className="space-y-6">
          {formError && (
            <div className="bg-rose-50 border border-rose-100 rounded-xl p-3 flex items-start gap-2 text-rose-700 text-xs font-semibold">
              <AlertCircle className="h-4.5 w-4.5 flex-shrink-0 mt-0.5" />
              <span>{formError}</span>
            </div>
          )}

          {/* Part A: Core Meta */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">Step 1: Core Test Metadata</h3>
            
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-gray-500 uppercase">Test Title *</label>
                <input
                  type="text"
                  placeholder="e.g. IELTS Academic Vol 16 - Listening Test 2"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50/50 p-2.5 text-xs text-gray-700 outline-none transition-all focus:bg-white focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-gray-500 uppercase">Category *</label>
                  <select
                    value={category}
                    onChange={(e) => {
                      const newCat = e.target.value as TestCategory;
                      setCategory(newCat);
                      // Set logical duration default
                      if (newCat === 'reading') setDurationMinutes(60);
                      else if (newCat === 'listening') setDurationMinutes(30);
                      else if (newCat === 'writing') setDurationMinutes(60);
                      else if (newCat === 'speaking') setDurationMinutes(15);
                    }}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50/50 p-2.5 text-xs text-gray-700 outline-none transition-all focus:bg-white focus:border-rose-500"
                  >
                    <option value="listening">Listening</option>
                    <option value="reading">Reading</option>
                    <option value="writing">Writing</option>
                    <option value="speaking">Speaking</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-gray-500 uppercase">IELTS Type *</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as TestType)}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50/50 p-2.5 text-xs text-gray-700 outline-none transition-all focus:bg-white focus:border-rose-500"
                  >
                    <option value="Academic">Academic</option>
                    <option value="General">General</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Cambridge IELTS tagging fields */}
            <div className="bg-rose-50/20 p-3.5 rounded-2xl border border-rose-100/30 grid gap-4 grid-cols-2 sm:grid-cols-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-rose-700 uppercase">Book Year *</label>
                <input
                  type="number"
                  placeholder="e.g. 2026"
                  min={2011}
                  max={2026}
                  value={year === '' ? '' : year}
                  onChange={(e) => setYear(e.target.value !== '' ? Number(e.target.value) : '')}
                  className="w-full rounded-xl border border-gray-200 bg-white p-2.5 text-xs text-gray-700 outline-none transition-all focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-rose-700 uppercase">Book Number (10-21) *</label>
                <input
                  type="number"
                  placeholder="e.g. 21"
                  min={10}
                  max={21}
                  value={bookNumber === '' ? '' : bookNumber}
                  onChange={(e) => setBookNumber(e.target.value !== '' ? Number(e.target.value) : '')}
                  className="w-full rounded-xl border border-gray-200 bg-white p-2.5 text-xs text-gray-700 outline-none transition-all focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-rose-700 uppercase">Test Number (1-4) *</label>
                <input
                  type="number"
                  placeholder="e.g. 1"
                  min={1}
                  max={4}
                  value={testNumber === '' ? '' : testNumber}
                  onChange={(e) => setTestNumber(e.target.value !== '' ? Number(e.target.value) : '')}
                  className="w-full rounded-xl border border-gray-200 bg-white p-2.5 text-xs text-gray-700 outline-none transition-all focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-rose-700 uppercase">
                  {category === 'listening' ? 'Part Number (1-4) *' : 'Passage Number (1-3) *'}
                </label>
                <input
                  type="number"
                  placeholder="e.g. 1"
                  min={1}
                  max={category === 'listening' ? 4 : 3}
                  value={passageNumber === '' ? '' : passageNumber}
                  onChange={(e) => setPassageNumber(e.target.value !== '' ? Number(e.target.value) : '')}
                  className="w-full rounded-xl border border-gray-200 bg-white p-2.5 text-xs text-gray-700 outline-none transition-all focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-gray-500 uppercase">Duration (Minutes) *</label>
                <input
                  type="number"
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(Number(e.target.value))}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50/50 p-2.5 text-xs text-gray-700 outline-none transition-all focus:bg-white focus:border-rose-500"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-gray-500 uppercase">Questions Count Display</label>
                <input
                  type="text"
                  disabled
                  value={
                    category === 'writing' 
                      ? '2 Tasks (Task 1 & Task 2)' 
                      : category === 'speaking' 
                        ? '3 Speaking Parts' 
                        : questions.length > 0 
                          ? `${questions.length} Questions Configured (${category === 'listening' ? '4 Listening Parts' : '3 Reading Passages'})`
                          : `40 Questions (Standard IELTS ${category === 'listening' ? 'Listening' : 'Reading'})`
                  }
                  className="w-full rounded-xl border border-gray-150 bg-gray-100 p-2.5 text-xs text-gray-500 cursor-not-allowed font-medium"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-gray-500 uppercase">Description / Overview</label>
              <textarea
                placeholder="A short overview description of this mock exam..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                className="w-full rounded-xl border border-gray-200 bg-gray-50/50 p-2.5 text-xs text-gray-700 outline-none transition-all focus:bg-white focus:border-rose-500"
              />
            </div>

            {/* Question Types Tagging */}
            {(category === 'reading' || category === 'listening') && (
              <div className="space-y-2 border-t border-gray-100 pt-4 animate-in fade-in duration-200">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold text-gray-600 uppercase tracking-wider block">Question Types Included</label>
                  <span className="text-[10px] text-rose-600 font-bold bg-rose-50 px-2 py-0.5 rounded border border-rose-100">
                    {selectedQuestionTypes.length} Tagged
                  </span>
                </div>
                <p className="text-[10px] text-gray-400">Tag this mock test with the specific question types it contains to enable precise drill-down filtering for students.</p>
                
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                  {ALL_QUESTION_TYPES.map((typeOption) => {
                    const isSelected = selectedQuestionTypes.includes(typeOption);
                    const formattedLabel = 
                      typeOption === 'MCQ' ? 'Multiple Choice (MCQ)' :
                      typeOption === 'TrueFalseNotGiven' ? 'True/False/Not Given' :
                      typeOption === 'YesNoNotGiven' ? 'Yes/No/Not Given' :
                      typeOption === 'MatchingHeadings' ? 'Matching Headings' :
                      typeOption === 'MatchingInfo' ? 'Matching Info' :
                      typeOption === 'MatchingFeatures' ? 'Matching Features' :
                      typeOption === 'MatchingSentenceEndings' ? 'Sentence Endings' :
                      typeOption === 'SentenceCompletion' ? 'Sentence Completion' :
                      typeOption === 'SummaryCompletion' ? 'Summary Completion' :
                      typeOption === 'DiagramCompletion' ? 'Diagram/Flowchart' :
                      typeOption === 'ShortAnswer' ? 'Short Answer' :
                      typeOption === 'Blanks' ? 'Fill in the Blanks' : typeOption;

                    return (
                      <button
                        key={typeOption}
                        type="button"
                        onClick={() => {
                          if (isSelected) {
                            setSelectedQuestionTypes(selectedQuestionTypes.filter(t => t !== typeOption));
                          } else {
                            setSelectedQuestionTypes([...selectedQuestionTypes, typeOption]);
                          }
                        }}
                        className={`flex items-center gap-2 p-2 rounded-xl border text-[11px] font-semibold transition-all text-left cursor-pointer active:scale-95 ${
                          isSelected 
                            ? 'border-rose-500 bg-rose-50/70 text-rose-700 shadow-xs' 
                            : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50/80'
                        }`}
                      >
                        <div className={`h-3 w-3 rounded flex items-center justify-center border transition-all ${
                          isSelected ? 'border-rose-500 bg-rose-500 text-white' : 'border-gray-300 bg-white'
                        }`}>
                          {isSelected && <span className="text-[8px] font-black leading-none">✓</span>}
                        </div>
                        <span className="truncate">{formattedLabel}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Part B: Real Content Input fields (Reading passage, Listening audio link, etc.) */}
          <div className="border-t border-gray-100 pt-5 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">Step 2: Authenticated Real Content</h3>

            {category === 'reading' && (
              <div className="space-y-4">
                <div className="rounded-xl bg-rose-50/50 p-3.5 border border-rose-100/50 flex gap-2">
                  <BookOpen className="h-5 w-5 text-rose-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-rose-800">Visual Page Block-Based Passage Editor</h4>
                    <p className="text-[10px] text-gray-400">Design your mock passage block-by-block. Candidates will see paragraphs, images, tables, and subheadings formatted exactly as designed.</p>
                  </div>
                </div>

                {/* Stack of active Blocks */}
                <div className="space-y-3">
                  {passageBlocks.map((block, idx) => {
                    const isHeading = block.type === 'heading';
                    const isParagraph = block.type === 'paragraph';
                    const isImage = block.type === 'image';
                    const isTable = block.type === 'table';

                    // Calculate paragraph letter label (only count paragraphs for labels like A, B, C...)
                    let paraLetter = '';
                    if (isParagraph) {
                      let pCount = 0;
                      for (let i = 0; i <= idx; i++) {
                        if (passageBlocks[i].type === 'paragraph') pCount++;
                      }
                      paraLetter = String.fromCharCode(64 + pCount); // A, B, C...
                    }

                    return (
                      <div 
                        key={block.id} 
                        className={`rounded-xl border p-3.5 bg-white transition-all hover:shadow-xs flex flex-col gap-3 ${
                          isHeading ? 'border-l-4 border-l-blue-500 border-gray-150' :
                          isParagraph ? 'border-l-4 border-l-rose-500 border-gray-150' :
                          isImage ? 'border-l-4 border-l-purple-500 border-gray-150' :
                          'border-l-4 border-l-teal-500 border-gray-150'
                        }`}
                      >
                        {/* Block Header Toolbar */}
                        <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider pb-1.5 border-b border-gray-100">
                          <div className="flex items-center gap-2">
                            {isHeading && <span className="text-blue-600">✦ Heading Block</span>}
                            {isParagraph && (
                              <span className="text-rose-600">
                                ✦ Paragraph Block {paraLetter && `[Labeled Paragraph ${paraLetter}]`}
                              </span>
                            )}
                            {isImage && <span className="text-purple-600">✦ Image/Diagram Block</span>}
                            {isTable && <span className="text-teal-600">✦ Structured Table Block</span>}
                          </div>

                          <div className="flex items-center gap-1.5">
                            {/* Reordering and Delete Actions */}
                            <button
                              type="button"
                              onClick={() => {
                                if (idx === 0) return;
                                const updated = [...passageBlocks];
                                const temp = updated[idx];
                                updated[idx] = updated[idx - 1];
                                updated[idx - 1] = temp;
                                setPassageBlocks(updated);
                              }}
                              disabled={idx === 0}
                              className="p-1 rounded text-gray-400 hover:text-gray-700 hover:bg-gray-100 disabled:opacity-35 cursor-pointer"
                              title="Move Up"
                            >
                              <ArrowUp className="h-3 w-3" />
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                if (idx === passageBlocks.length - 1) return;
                                const updated = [...passageBlocks];
                                const temp = updated[idx];
                                updated[idx] = updated[idx + 1];
                                updated[idx + 1] = temp;
                                setPassageBlocks(updated);
                              }}
                              disabled={idx === passageBlocks.length - 1}
                              className="p-1 rounded text-gray-400 hover:text-gray-700 hover:bg-gray-100 disabled:opacity-35 cursor-pointer"
                              title="Move Down"
                            >
                              <ArrowDown className="h-3 w-3" />
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setPassageBlocks(passageBlocks.filter(b => b.id !== block.id));
                              }}
                              className="p-1 rounded text-gray-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer"
                              title="Delete Block"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                        </div>

                        {/* Block Editors */}
                        {isHeading && (
                          <input
                            type="text"
                            placeholder="Enter section subheading..."
                            value={block.content}
                            onChange={(e) => {
                              const updated = [...passageBlocks];
                              updated[idx].content = e.target.value;
                              setPassageBlocks(updated);
                            }}
                            className="w-full text-xs font-bold text-gray-800 border-none bg-gray-50/50 p-2 rounded-lg outline-none focus:bg-white"
                          />
                        )}

                        {isParagraph && (
                          <textarea
                            placeholder="Enter paragraph text..."
                            value={block.content}
                            onChange={(e) => {
                              const updated = [...passageBlocks];
                              updated[idx].content = e.target.value;
                              setPassageBlocks(updated);
                            }}
                            rows={3}
                            className="w-full text-xs text-gray-700 leading-relaxed border-none bg-gray-50/50 p-2 rounded-lg outline-none focus:bg-white font-sans"
                          />
                        )}

                        {isImage && (
                          <div className="space-y-2">
                            <div className="grid gap-2 md:grid-cols-2">
                              <div className="space-y-1">
                                <span className="text-[9px] font-bold text-gray-400 uppercase">Image/Diagram URL</span>
                                <input
                                  type="text"
                                  placeholder="e.g. https://images.unsplash.com/..."
                                  value={block.content}
                                  onChange={(e) => {
                                    const updated = [...passageBlocks];
                                    updated[idx].content = e.target.value;
                                    setPassageBlocks(updated);
                                  }}
                                  className="w-full text-xs text-gray-700 border border-gray-150 bg-gray-50/30 p-1.5 rounded outline-none font-mono"
                                />
                              </div>
                              <div className="space-y-1">
                                <span className="text-[9px] font-bold text-gray-400 uppercase">Interactive Caption / Subtitle</span>
                                <input
                                  type="text"
                                  placeholder="e.g. Figure 2.1: The internal structure of marine micro-polyps"
                                  value={block.caption || ''}
                                  onChange={(e) => {
                                    const updated = [...passageBlocks];
                                    updated[idx].caption = e.target.value;
                                    setPassageBlocks(updated);
                                  }}
                                  className="w-full text-xs text-gray-700 border border-gray-150 bg-gray-50/30 p-1.5 rounded outline-none"
                                />
                              </div>
                            </div>

                            <div className="flex gap-2 items-center">
                              <button
                                type="button"
                                onClick={() => {
                                  const updated = [...passageBlocks];
                                  const presets = [
                                    'https://images.unsplash.com/photo-1546026423-cc4642628d2b?w=800&auto=format&fit=crop&q=80',
                                    'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=800&auto=format&fit=crop&q=80',
                                    'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=800&auto=format&fit=crop&q=80'
                                  ];
                                  updated[idx].content = presets[idx % presets.length];
                                  setPassageBlocks(updated);
                                }}
                                className="text-[9px] font-bold bg-purple-50 text-purple-700 border border-purple-100 px-2 py-1 rounded hover:bg-purple-100 transition-colors cursor-pointer"
                              >
                                ⚡ Load Sketch Preset
                              </button>
                              {block.content && (
                                <div className="h-10 w-24 rounded border border-gray-150 bg-gray-50 overflow-hidden flex items-center justify-center shrink-0">
                                  <img 
                                    src={block.content} 
                                    alt="Live Thumbnail Preview" 
                                    className="h-full w-full object-cover"
                                    referrerPolicy="no-referrer"
                                    onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                                  />
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {isTable && (
                          <div className="space-y-2">
                            <span className="text-[9px] font-bold text-gray-400 uppercase block">Table Data (Format cells with pipe characters `|`)</span>
                            <textarea
                              placeholder="Header 1 | Header 2 | Header 3&#10;Value A1 | Value A2 | Value A3&#10;Value B1 | Value B2 | Value B3"
                              value={block.content}
                              onChange={(e) => {
                                const updated = [...passageBlocks];
                                updated[idx].content = e.target.value;
                                setPassageBlocks(updated);
                              }}
                              rows={3}
                              className="w-full text-xs font-mono text-gray-700 bg-gray-50/50 p-2 rounded-lg outline-none focus:bg-white"
                            />

                            {/* Simple Live Table Render Preview */}
                            {block.content.trim() && (
                              <div className="border border-teal-100/50 rounded-lg overflow-hidden text-[10px] text-gray-600 font-sans">
                                <span className="bg-teal-50/30 text-teal-800 font-bold px-2 py-0.5 border-b border-teal-100/30 block uppercase tracking-wider text-[8px]">Live Builder Table Preview</span>
                                <table className="w-full text-left border-collapse">
                                  <tbody>
                                    {block.content.split('\n').filter(line => line.trim()).map((line, rIdx) => {
                                      const cells = line.split('|').map(c => c.trim());
                                      return (
                                        <tr key={rIdx} className={rIdx === 0 ? 'bg-gray-100/50 font-bold text-gray-700 border-b border-gray-200' : 'border-b border-gray-100 hover:bg-gray-50/40'}>
                                          {cells.map((cell, cIdx) => (
                                            <td key={cIdx} className="p-1.5 border-r border-gray-100 last:border-r-0">{cell}</td>
                                          ))}
                                        </tr>
                                      );
                                    })}
                                  </tbody>
                                </table>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Blocks Toolbar Controls */}
                <div className="flex flex-wrap gap-2 pt-2 border-t border-dashed border-gray-200 justify-center">
                  <button
                    type="button"
                    onClick={() => setPassageBlocks([...passageBlocks, {
                      id: `block_${Date.now()}_p`,
                      type: 'paragraph',
                      content: 'Type custom paragraph details here...'
                    }])}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-rose-200 bg-rose-50/30 text-rose-700 font-bold text-[10px] hover:bg-rose-50 hover:border-rose-300 transition-all cursor-pointer"
                  >
                    <Plus className="h-3.5 w-3.5" /> + Paragraph
                  </button>
                  <button
                    type="button"
                    onClick={() => setPassageBlocks([...passageBlocks, {
                      id: `block_${Date.now()}_h`,
                      type: 'heading',
                      content: 'New Section Subheading'
                    }])}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-blue-200 bg-blue-50/30 text-blue-700 font-bold text-[10px] hover:bg-blue-50 hover:border-blue-300 transition-all cursor-pointer"
                  >
                    <Plus className="h-3.5 w-3.5" /> + Subheading
                  </button>
                  <button
                    type="button"
                    onClick={() => setPassageBlocks([...passageBlocks, {
                      id: `block_${Date.now()}_img`,
                      type: 'image',
                      content: 'https://images.unsplash.com/photo-1546026423-cc4642628d2b?w=800&auto=format&fit=crop&q=80',
                      caption: 'Figure: Diagram illustration overview'
                    }])}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-purple-200 bg-purple-50/30 text-purple-700 font-bold text-[10px] hover:bg-purple-50 hover:border-purple-300 transition-all cursor-pointer"
                  >
                    <ImageIcon className="h-3.5 w-3.5" /> + Image/Diagram
                  </button>
                  <button
                    type="button"
                    onClick={() => setPassageBlocks([...passageBlocks, {
                      id: `block_${Date.now()}_tbl`,
                      type: 'table',
                      content: 'Parameter | Normal Value | Adaptation Rate\nOcean Heat | <1.2 °C | Moderate\nAcid Density | 8.1 pH | Extremely slow'
                    }])}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-teal-200 bg-teal-50/30 text-teal-700 font-bold text-[10px] hover:bg-teal-50 hover:border-teal-300 transition-all cursor-pointer"
                  >
                    <TableIcon className="h-3.5 w-3.5" /> + Structured Table
                  </button>
                </div>

                {/* Legacy description sections/chapters text */}
                <div className="space-y-1.5 pt-2">
                  <label className="text-[11px] font-bold text-gray-500 uppercase">Sections / Chapters (One per line)</label>
                  <textarea
                    placeholder="Passage 1: Biology and Evolution of Deep Sea Reefs&#10;Passage 2: Economic Restoration"
                    value={sectionsText}
                    onChange={(e) => setSectionsText(e.target.value)}
                    rows={2}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50/50 p-2.5 text-xs text-gray-700 outline-none transition-all focus:bg-white focus:border-rose-500 font-mono"
                  />
                </div>
              </div>
            )}

            {category === 'listening' && (
              <div className="space-y-4">
                <div className="rounded-xl bg-blue-50/50 p-3.5 border border-blue-100/50 flex gap-2">
                  <Volume2 className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-blue-800">Listening Stream & Audio Details</h4>
                    <p className="text-[10px] text-gray-400">Input a streaming audio source URL (.mp3 format) to enable an authentic audio player for candidates.</p>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] font-bold text-gray-500 uppercase">Audio Track Source Link (.mp3)</label>
                      {audioUrl && (
                        <button
                          type="button"
                          onClick={() => {
                            if (audioRef.current) {
                              if (isPlayingAudioTest) {
                                audioRef.current.pause();
                                setIsPlayingAudioTest(false);
                              } else {
                                audioRef.current.play().then(() => setIsPlayingAudioTest(true)).catch(() => alert('Could not play audio from URL'));
                              }
                            }
                          }}
                          className="text-[10px] font-bold text-blue-600 hover:underline flex items-center gap-1"
                        >
                          {isPlayingAudioTest ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
                          <span>{isPlayingAudioTest ? 'Pause Audio' : 'Test Audio Playback'}</span>
                        </button>
                      )}
                    </div>
                    <input
                      type="text"
                      placeholder="e.g. https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"
                      value={audioUrl}
                      onChange={(e) => setAudioUrl(e.target.value)}
                      className="w-full rounded-xl border border-gray-200 bg-gray-50/50 p-2.5 text-xs text-gray-700 outline-none transition-all focus:bg-white focus:border-rose-500 font-mono"
                    />
                    {audioUrl && <audio ref={audioRef} src={audioUrl} onEnded={() => setIsPlayingAudioTest(false)} className="hidden" />}
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-gray-500 uppercase">Audio Transcript Summary / Script</label>
                    <input
                      type="text"
                      placeholder="e.g. Section 1 Library Member Registration dialogue."
                      value={audioScript}
                      onChange={(e) => setAudioScript(e.target.value)}
                      className="w-full rounded-xl border border-gray-200 bg-gray-50/50 p-2.5 text-xs text-gray-700 outline-none transition-all focus:bg-white focus:border-rose-500"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-gray-500 uppercase">Sections / Tracks Structure (One per line)</label>
                  <textarea
                    placeholder="Part 1: Library Membership Registration (Qs 1-10)&#10;Part 2: Local Park Renovation Plan (Qs 11-20)&#10;Part 3: University Project Discussion (Qs 21-30)&#10;Part 4: Renewable Energy Lecture (Qs 31-40)"
                    value={sectionsText}
                    onChange={(e) => setSectionsText(e.target.value)}
                    rows={3}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50/50 p-2.5 text-xs text-gray-700 outline-none transition-all focus:bg-white focus:border-rose-500 font-mono"
                  />
                </div>
              </div>
            )}

            {category === 'writing' && (
              <div className="space-y-4">
                <div className="rounded-xl bg-teal-50/50 p-3.5 border border-teal-100/50 flex gap-2">
                  <PenTool className="h-5 w-5 text-teal-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-teal-800">Writing Module Tasks & Criteria</h4>
                    <p className="text-[10px] text-gray-400">Configure Task 1 (Graph/Chart/Letter) and Task 2 (Discursive Essay) along with Model Answers.</p>
                  </div>
                </div>

                {/* Task 1 Box */}
                <div className="p-4 rounded-2xl border border-teal-100 bg-white space-y-3">
                  <span className="text-xs font-bold text-teal-800 uppercase tracking-wider block">Task 1 Details (Report / Graph / Letter - Min 150 Words)</span>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-500 uppercase">Task 1 Prompt Text *</label>
                    <textarea
                      placeholder="The bar chart below illustrates the proportion of energy generated from renewable sources across five countries between 2010 and 2025. Summarise the information by selecting and reporting the main features..."
                      value={writingPrompt}
                      onChange={(e) => setWritingPrompt(e.target.value)}
                      rows={3}
                      className="w-full rounded-xl border border-gray-200 bg-gray-50/50 p-2.5 text-xs text-gray-700 outline-none focus:bg-white focus:border-teal-500"
                      required={category === 'writing'}
                    />
                  </div>
                  <div className="grid gap-2 md:grid-cols-2">
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-gray-500 uppercase">Task 1 Chart / Graph Image URL (Optional)</span>
                      <input
                        type="text"
                        placeholder="e.g. https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800"
                        value={writingTask1ImageUrl}
                        onChange={(e) => setWritingTask1ImageUrl(e.target.value)}
                        className="w-full rounded-xl border border-gray-200 bg-gray-50/50 p-2 text-xs text-gray-700 outline-none font-mono"
                      />
                    </div>
                    <div className="flex items-end gap-2">
                      <button
                        type="button"
                        onClick={() => setWritingTask1ImageUrl('https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop&q=80')}
                        className="text-[10px] font-bold px-2.5 py-2 bg-teal-50 text-teal-700 rounded-xl border border-teal-100 hover:bg-teal-100 cursor-pointer"
                      >
                        ⚡ Load Sample Chart Image
                      </button>
                    </div>
                  </div>
                </div>

                {/* Task 2 Box */}
                <div className="p-4 rounded-2xl border border-teal-100 bg-white space-y-3">
                  <span className="text-xs font-bold text-teal-800 uppercase tracking-wider block">Task 2 Details (Discursive Essay - Min 250 Words)</span>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-500 uppercase">Task 2 Essay Prompt *</label>
                    <textarea
                      placeholder="Some people argue that artificial intelligence will eliminate traditional job roles, while others believe it will spawn new career opportunities. Discuss both views and give your opinion with relevant examples..."
                      value={writingTask2Prompt}
                      onChange={(e) => setWritingTask2Prompt(e.target.value)}
                      rows={3}
                      className="w-full rounded-xl border border-gray-200 bg-gray-50/50 p-2.5 text-xs text-gray-700 outline-none focus:bg-white focus:border-teal-500"
                    />
                  </div>
                </div>

                {/* Model Answer Box */}
                <div className="p-4 rounded-2xl border border-gray-150 bg-gray-50/40 space-y-2">
                  <span className="text-xs font-bold text-gray-700 uppercase tracking-wider block">Band 9 Sample Model Answer (For Candidate Review)</span>
                  <textarea
                    placeholder="Provide a Band 9 sample essay answer or commentary for teacher reference..."
                    value={writingSampleAnswer}
                    onChange={(e) => setWritingSampleAnswer(e.target.value)}
                    rows={4}
                    className="w-full rounded-xl border border-gray-200 bg-white p-2.5 text-xs text-gray-700 outline-none focus:border-teal-500 font-sans leading-relaxed"
                  />
                </div>
              </div>
            )}

            {category === 'speaking' && (
              <div className="space-y-4">
                <div className="rounded-xl bg-purple-50/50 p-3.5 border border-purple-100/50 flex gap-2">
                  <Mic className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-purple-800">Speaking Parts & Model Hints</h4>
                    <p className="text-[10px] text-gray-400">Declare the prompts for all three core Speaking interview parts.</p>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-1.5 p-3 rounded-2xl border border-purple-100 bg-white">
                    <label className="text-[11px] font-bold text-purple-700 uppercase block">Part 1: Intro & Personal Topics</label>
                    <textarea
                      placeholder="Let's talk about your hometown and daily routine. How often do you use public transport? What do you enjoy doing during your free time?"
                      value={speakingPart1}
                      onChange={(e) => setSpeakingPart1(e.target.value)}
                      rows={4}
                      className="w-full rounded-xl border border-gray-200 bg-gray-50/50 p-2.5 text-xs text-gray-700 outline-none focus:bg-white focus:border-purple-500"
                    />
                  </div>

                  <div className="space-y-1.5 p-3 rounded-2xl border border-purple-100 bg-white">
                    <label className="text-[11px] font-bold text-purple-700 uppercase block">Part 2: Cue Card Topic (1-2 mins)</label>
                    <textarea
                      placeholder="Describe a historic landmark or structure you visited. You should say: where it is located, what it looks like, who you went with, and explain why this place made a deep impression on you."
                      value={speakingPart2}
                      onChange={(e) => setSpeakingPart2(e.target.value)}
                      rows={4}
                      className="w-full rounded-xl border border-gray-200 bg-gray-50/50 p-2.5 text-xs text-gray-700 outline-none focus:bg-white focus:border-purple-500"
                    />
                  </div>

                  <div className="space-y-1.5 p-3 rounded-2xl border border-purple-100 bg-white">
                    <label className="text-[11px] font-bold text-purple-700 uppercase block">Part 3: In-depth Discussion</label>
                    <textarea
                      placeholder="Why is it important to preserve ancient architecture in modern cities? Do you think governments should prioritize cultural heritage funding over infrastructure development?"
                      value={speakingPart3}
                      onChange={(e) => setSpeakingPart3(e.target.value)}
                      rows={4}
                      className="w-full rounded-xl border border-gray-200 bg-gray-50/50 p-2.5 text-xs text-gray-700 outline-none focus:bg-white focus:border-purple-500"
                    />
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl border border-gray-150 bg-gray-50/40 space-y-1.5">
                  <label className="text-[11px] font-bold text-gray-700 uppercase block">Band 9 Model Vocabulary & Key Phrases</label>
                  <textarea
                    placeholder="e.g. Key collocations: architectural splendour, historical significance, urban gentrification, structural integrity, preservation endeavours."
                    value={speakingSampleAnswer}
                    onChange={(e) => setSpeakingSampleAnswer(e.target.value)}
                    rows={3}
                    className="w-full rounded-xl border border-gray-200 bg-white p-2.5 text-xs text-gray-700 outline-none focus:border-purple-500"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Part C: Questions Editor (For Listening / Reading only) */}
          {category !== 'writing' && category !== 'speaking' && (
            <div className="border-t border-gray-100 pt-5 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">Step 3: Interactive Question Bank</h3>
                  <p className="text-[10px] text-gray-400">Build interactive items for Listening or Reading using all official IELTS question formats.</p>
                </div>
                <span className="text-[10px] font-bold bg-amber-50 text-amber-700 px-2.5 py-1 rounded-lg border border-amber-200">
                  {questions.length} Questions Configured
                </span>
              </div>

              {/* Quick Presets Bar */}
              <div className="p-3 rounded-2xl border border-indigo-100 bg-indigo-50/30 space-y-2">
                <span className="text-[10px] font-bold text-indigo-800 uppercase tracking-wider flex items-center gap-1">
                  <Sparkles className="h-3.5 w-3.5 text-indigo-600" />
                  <span>⚡ Quick Sample Presets (Click to Auto-Populate Question Template)</span>
                </span>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setCurrentQType('MCQ');
                      setCurrentQText('Which factor contributed most significantly to the species migration?');
                      setCurrentQOptions(['A. Seasonal temperature shifts', 'B. Loss of natural forest habitats', 'C. Industrial pollution runoff', 'D. Increased predator populations']);
                      setCurrentQCorrect('B');
                      setCurrentQExplanation('Paragraph C explicitly cites habitat deforestation as the primary driver.');
                    }}
                    className="px-2.5 py-1 bg-white hover:bg-indigo-50 border border-indigo-200 text-indigo-700 text-[10px] font-bold rounded-lg transition-all cursor-pointer shadow-xs"
                  >
                    + Sample MCQ
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setCurrentQType('TrueFalseNotGiven');
                      setCurrentQText('The original experiment yielded conclusive evidence during the initial trials.');
                      setCurrentQCorrect('False');
                      setCurrentQExplanation('Paragraph A states results remained ambiguous until trial 4.');
                    }}
                    className="px-2.5 py-1 bg-white hover:bg-indigo-50 border border-indigo-200 text-indigo-700 text-[10px] font-bold rounded-lg transition-all cursor-pointer shadow-xs"
                  >
                    + Sample True/False/Not Given
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setCurrentQType('MatchingHeadings');
                      setCurrentQText('Select the correct heading for Paragraph B');
                      setCurrentQHeadings(['i. Unanticipated experimental hurdles', 'ii. Economic impact on coastal communities', 'iii. Early technological innovations', 'iv. Future conservation directives']);
                      setCurrentQCorrect('i');
                      setCurrentQExplanation('Paragraph B outlines technical setbacks faced by researchers.');
                    }}
                    className="px-2.5 py-1 bg-white hover:bg-indigo-50 border border-indigo-200 text-indigo-700 text-[10px] font-bold rounded-lg transition-all cursor-pointer shadow-xs"
                  >
                    + Sample Matching Headings
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setCurrentQType('SentenceCompletion');
                      setCurrentQText('Researchers discovered that deep ocean corals thrive best in waters with low ____ levels.');
                      setCurrentQCorrect('salinity');
                      setCurrentQExplanation('Paragraph D confirms low salinity water accelerates coral polyp growth.');
                    }}
                    className="px-2.5 py-1 bg-white hover:bg-indigo-50 border border-indigo-200 text-indigo-700 text-[10px] font-bold rounded-lg transition-all cursor-pointer shadow-xs"
                  >
                    + Sample Sentence Completion
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setCurrentQType('SummaryCompletion');
                      setCurrentQText('Complete the summary using words from the box below.');
                      setCurrentQOptions(['A. Biodiversity', 'B. Deforestation', 'C. Urbanization', 'D. Agriculture']);
                      setCurrentQCorrect('A');
                      setCurrentQExplanation('The passage summary focuses on preserving marine biodiversity.');
                    }}
                    className="px-2.5 py-1 bg-white hover:bg-indigo-50 border border-indigo-200 text-indigo-700 text-[10px] font-bold rounded-lg transition-all cursor-pointer shadow-xs"
                  >
                    + Sample Word Bank Summary
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setCurrentQType('DiagramCompletion');
                      setCurrentQText('Label the diagram below: The upper filtration chamber (Label 3)');
                      setCurrentQCorrect('sediment filter');
                      setCurrentQExplanation('Diagram section 3 depicts the primary sediment filter mesh.');
                    }}
                    className="px-2.5 py-1 bg-white hover:bg-indigo-50 border border-indigo-200 text-indigo-700 text-[10px] font-bold rounded-lg transition-all cursor-pointer shadow-xs"
                  >
                    + Sample Diagram Label
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setCurrentQType('Blanks');
                      setCurrentQText('The main library remains open until ____ PM on weekdays.');
                      setCurrentQCorrect('9:00');
                      setCurrentQExplanation('Section 1 audio announces weekday closing time as 9:00 PM.');
                    }}
                    className="px-2.5 py-1 bg-white hover:bg-indigo-50 border border-indigo-200 text-indigo-700 text-[10px] font-bold rounded-lg transition-all cursor-pointer shadow-xs"
                  >
                    + Sample Fill in Blanks
                  </button>
                </div>
              </div>

              {/* Dynamic Questions Builder Block */}
              <div className="rounded-2xl border border-gray-150 p-4 bg-gray-50/20 space-y-4">
                <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                  <span className="text-xs font-bold text-gray-700 flex items-center gap-1">
                    <HelpCircle className="h-4 w-4 text-rose-500" />
                    <span>{selectedQuestionIndex !== null ? `Edit Question #${selectedQuestionIndex + 1}` : 'Construct New Question'}</span>
                  </span>
                  {selectedQuestionIndex !== null && (
                    <button
                      type="button"
                      onClick={resetQuestionBuilder}
                      className="text-[10px] font-bold text-rose-600 hover:underline"
                    >
                      Clear & Create New
                    </button>
                  )}
                </div>

                <div className="grid gap-3 md:grid-cols-3">
                  <div className="md:col-span-2 space-y-1.5">
                    <label className="text-[10px] font-bold text-gray-500 uppercase">Question Prompt / Heading Text *</label>
                    <input
                      type="text"
                      placeholder="e.g. Paragraph B details which technological advancement?"
                      value={currentQText}
                      onChange={(e) => setCurrentQText(e.target.value)}
                      className="w-full rounded-xl border border-gray-200 bg-white p-2 text-xs text-gray-700 outline-none transition-all focus:border-rose-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-gray-500 uppercase">Question Style *</label>
                    <select
                      value={currentQType}
                      onChange={(e) => {
                        const nextType = e.target.value as QuestionType;
                        setCurrentQType(nextType);
                        if (nextType === 'TrueFalseNotGiven') {
                          setCurrentQCorrect('True');
                        } else if (nextType === 'YesNoNotGiven') {
                          setCurrentQCorrect('Yes');
                        } else if (nextType === 'MatchingHeadings') {
                          setCurrentQCorrect('i');
                          setCurrentQHeadings(['i. Heading i', 'ii. Heading ii', 'iii. Heading iii', 'iv. Heading iv']);
                        } else if (nextType === 'MCQ') {
                          setCurrentQCorrect('A');
                          setCurrentQOptions(['A. Option A', 'B. Option B', 'C. Option C', 'D. Option D']);
                        } else if (['MatchingInfo', 'MatchingFeatures', 'MatchingSentenceEndings', 'SummaryCompletion'].includes(nextType)) {
                          setCurrentQCorrect('A');
                          setCurrentQOptions(['A. Option A', 'B. Option B', 'C. Option C']);
                        } else {
                          setCurrentQCorrect('');
                        }
                      }}
                      className="w-full rounded-xl border border-gray-200 bg-white p-2 text-xs text-gray-700 outline-none transition-all focus:border-rose-500"
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
                      <option value="Blanks">12. Fill in the Blanks</option>
                    </select>
                  </div>
                </div>

                {/* Subform: MCQ & Options-based types details */}
                {['MCQ', 'MatchingInfo', 'MatchingFeatures', 'MatchingSentenceEndings', 'SummaryCompletion'].includes(currentQType) && (
                  <div className="space-y-2 bg-white p-3 rounded-xl border border-gray-100">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                      Configure Options List (e.g. Scientist Names, Sentence Endings, Paragraph Keys)
                    </span>
                    <div className="grid gap-2 md:grid-cols-2">
                      {currentQOptions.map((opt, idx) => (
                        <div key={idx} className="flex gap-2 items-center">
                          <span className="text-xs font-bold text-gray-400 w-4">{String.fromCharCode(65 + idx)}</span>
                          <input
                            type="text"
                            value={opt}
                            onChange={(e) => {
                              const opts = [...currentQOptions];
                              opts[idx] = e.target.value;
                              setCurrentQOptions(opts);
                            }}
                            className="flex-grow rounded-lg border border-gray-200 p-1.5 text-xs text-gray-700 outline-none focus:border-rose-500"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              if (currentQOptions.length > 2) {
                                setCurrentQOptions(currentQOptions.filter((_, i) => i !== idx));
                              }
                            }}
                            className="text-xs text-gray-300 hover:text-rose-500 font-bold"
                            title="Remove row"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const letter = String.fromCharCode(65 + currentQOptions.length);
                        setCurrentQOptions([...currentQOptions, `${letter}. New Option`]);
                      }}
                      className="text-[10px] font-semibold text-rose-600 hover:underline flex items-center gap-1 mt-1"
                    >
                      <PlusCircle className="h-3 w-3" /> Add Option Row
                    </button>
                  </div>
                )}

                {/* Subform: Matching Headings details */}
                {currentQType === 'MatchingHeadings' && (
                  <div className="space-y-2 bg-white p-3 rounded-xl border border-gray-100">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Declare Roman-Numeral Heading Options</span>
                    <div className="grid gap-2 md:grid-cols-2">
                      {currentQHeadings.map((heading, idx) => (
                        <div key={idx} className="flex gap-2 items-center">
                          <span className="text-xs font-bold text-gray-400 w-6">Option</span>
                          <input
                            type="text"
                            value={heading}
                            onChange={(e) => {
                              const heads = [...currentQHeadings];
                              heads[idx] = e.target.value;
                              setCurrentQHeadings(heads);
                            }}
                            className="flex-grow rounded-lg border border-gray-200 p-1.5 text-xs text-gray-700 outline-none focus:border-rose-500"
                          />
                        </div>
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={() => setCurrentQHeadings([...currentQHeadings, `${currentQHeadings.length + 1}. Heading option`])}
                      className="text-[10px] font-semibold text-rose-600 hover:underline flex items-center gap-1"
                    >
                      <PlusCircle className="h-3 w-3" /> Add Heading Row
                    </button>
                  </div>
                )}

                {/* Question grading inputs */}
                <div className="grid gap-3 md:grid-cols-4 items-end">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-gray-500 uppercase">Passage / Part Number *</label>
                    <select
                      value={currentQPassageNumber}
                      onChange={(e) => setCurrentQPassageNumber(Number(e.target.value))}
                      className="w-full rounded-xl border border-gray-200 bg-white p-2 text-xs text-gray-700 outline-none"
                    >
                      <option value={1}>Passage 1 / Part 1</option>
                      <option value={2}>Passage 2 / Part 2</option>
                      <option value={3}>Passage 3 / Part 3</option>
                      <option value={4}>Passage 4 / Part 4</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-gray-500 uppercase">Correct Answer *</label>
                    {currentQType === 'TrueFalseNotGiven' ? (
                      <select
                        value={currentQCorrect}
                        onChange={(e) => setCurrentQCorrect(e.target.value)}
                        className="w-full rounded-xl border border-gray-200 bg-white p-2 text-xs text-gray-700 outline-none font-bold text-emerald-700"
                      >
                        <option value="True">True</option>
                        <option value="False">False</option>
                        <option value="Not Given">Not Given</option>
                      </select>
                    ) : currentQType === 'YesNoNotGiven' ? (
                      <select
                        value={currentQCorrect}
                        onChange={(e) => setCurrentQCorrect(e.target.value)}
                        className="w-full rounded-xl border border-gray-200 bg-white p-2 text-xs text-gray-700 outline-none font-bold text-emerald-700"
                      >
                        <option value="Yes">Yes</option>
                        <option value="No">No</option>
                        <option value="Not Given">Not Given</option>
                      </select>
                    ) : ['MCQ', 'MatchingInfo', 'MatchingFeatures', 'MatchingSentenceEndings'].includes(currentQType) ? (
                      <select
                        value={currentQCorrect}
                        onChange={(e) => setCurrentQCorrect(e.target.value)}
                        className="w-full rounded-xl border border-gray-200 bg-white p-2 text-xs text-gray-700 outline-none font-mono font-bold text-emerald-700"
                      >
                        {currentQOptions.map((_, i) => {
                          const code = String.fromCharCode(65 + i);
                          return <option key={code} value={code}>{code}</option>;
                        })}
                      </select>
                    ) : (
                      <input
                        type="text"
                        placeholder={
                          currentQType === 'MatchingHeadings' ? 'e.g. ii' :
                          currentQType === 'SentenceCompletion' ? 'e.g. salinity' :
                          currentQType === 'DiagramCompletion' ? 'e.g. sediment filter' : 'e.g. 9:00'
                        }
                        value={currentQCorrect}
                        onChange={(e) => setCurrentQCorrect(e.target.value)}
                        className="w-full rounded-xl border border-gray-200 bg-white p-2 text-xs text-gray-700 outline-none focus:border-rose-500 font-mono font-bold text-emerald-700"
                      />
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-gray-500 uppercase">Teacher Explanation / Notes</label>
                    <input
                      type="text"
                      placeholder="e.g. Paragraph B details this adaptation explicitly..."
                      value={currentQExplanation}
                      onChange={(e) => setCurrentQExplanation(e.target.value)}
                      className="w-full rounded-xl border border-gray-200 bg-white p-2 text-xs text-gray-700 outline-none focus:border-rose-500"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleSaveQuestion}
                    className="w-full py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold transition-all active:scale-95 cursor-pointer shadow-md shadow-rose-100"
                  >
                    {selectedQuestionIndex !== null ? 'Save Changes' : 'Include Question'}
                  </button>
                </div>

                {/* Live Candidate View Preview Card */}
                {currentQText && (
                  <div className="p-3.5 rounded-2xl border border-slate-200 bg-white space-y-2 shadow-xs">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                      <Eye className="h-3.5 w-3.5 text-rose-500" />
                      <span>Live Candidate View Preview</span>
                    </span>
                    <div className="p-2.5 rounded-xl bg-slate-50/70 border border-slate-100">
                      <QuestionRenderer
                        question={{
                          id: 'preview_temp',
                          type: currentQType,
                          questionText: currentQText,
                          correctAnswer: currentQCorrect || 'Sample Answer',
                          explanation: currentQExplanation || 'Teacher explanation will appear here after test submission.',
                          options: ['MCQ', 'MatchingInfo', 'MatchingFeatures', 'MatchingSentenceEndings', 'SummaryCompletion'].includes(currentQType) ? currentQOptions : undefined,
                          headingOptions: currentQType === 'MatchingHeadings' ? currentQHeadings : undefined,
                          passageNumber: currentQPassageNumber
                        }}
                        value={previewTestAnswer}
                        onChange={(val) => setPreviewTestAnswer(val)}
                        showFeedback={true}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Form Question List Overview */}
              <div className="space-y-2">
                <span className="text-[11px] font-bold text-gray-500 uppercase block">Active Question List for this Test</span>
                {questions.length === 0 ? (
                  <p className="text-xs text-gray-400 italic bg-gray-50 border border-gray-100 rounded-xl p-3">
                    No interactive questions added yet. Use the question generator above to add listening or reading questions.
                  </p>
                ) : (
                  <div className="grid gap-2">
                    {questions.map((q, idx) => (
                      <div key={q.id} className="flex items-center justify-between rounded-xl bg-white border border-gray-150 p-2.5 text-xs hover:border-rose-200 transition-all shadow-2xs">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className="h-5 w-5 rounded-full bg-rose-50 text-rose-700 flex items-center justify-center font-extrabold text-[10px] border border-rose-100 flex-shrink-0">
                            {idx + 1}
                          </span>
                          <div className="truncate">
                            <p className="font-bold text-gray-800 truncate">{q.questionText}</p>
                            <p className="text-[10px] text-gray-400 font-mono uppercase mt-0.2">
                              {q.type} • Answer: <span className="font-bold text-emerald-600 font-mono">{q.correctAnswer}</span> • Part {q.passageNumber || 1}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0 ml-4">
                          {/* Reorder Buttons */}
                          {idx > 0 && (
                            <button
                              type="button"
                              onClick={() => {
                                const newQs = [...questions];
                                const temp = newQs[idx];
                                newQs[idx] = newQs[idx - 1];
                                newQs[idx - 1] = temp;
                                setQuestions(newQs);
                              }}
                              className="p-1 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded"
                              title="Move Up"
                            >
                              <ArrowUp className="h-3.5 w-3.5" />
                            </button>
                          )}
                          {idx < questions.length - 1 && (
                            <button
                              type="button"
                              onClick={() => {
                                const newQs = [...questions];
                                const temp = newQs[idx];
                                newQs[idx] = newQs[idx + 1];
                                newQs[idx + 1] = temp;
                                setQuestions(newQs);
                              }}
                              className="p-1 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded"
                              title="Move Down"
                            >
                              <ArrowDown className="h-3.5 w-3.5" />
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => handleEditQuestion(idx)}
                            className="p-1.5 text-gray-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                            title="Edit question"
                          >
                            <Edit3 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteQuestion(idx)}
                            className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                            title="Delete question"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Core Save controls */}
          <div className="border-t border-gray-100 pt-5 flex justify-end gap-2.5">
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className="px-5 py-3 border border-gray-200 text-gray-500 font-bold rounded-xl text-xs hover:bg-gray-50 transition-all cursor-pointer"
            >
              Go Back
            </button>
            <button
              type="submit"
              className="px-6 py-3 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl text-xs shadow-lg shadow-rose-100 transition-all active:scale-95 cursor-pointer"
            >
              {editingTestId ? 'Save Mock Test' : 'Deploy Mock Test'}
            </button>
          </div>
        </form>
      )}

    </div>
  );
}
