import React, { useState } from 'react';
import { 
  Database, Plus, Trash2, Edit3, ArrowLeft, Check, AlertCircle, 
  HelpCircle, Volume2, BookOpen, PenTool, Mic, PlusCircle, MinusCircle, 
  RefreshCw, FileText, LayoutGrid, Eye, EyeOff, Lock, Unlock, Settings
} from 'lucide-react';
import { IELTSTest, IELTSQuestion, TestCategory, TestType, DifficultyLevel, QuestionType } from '../types';

interface AdminPanelProps {
  tests: IELTSTest[];
  onAddTest: (test: IELTSTest) => void;
  onUpdateTest: (test: IELTSTest) => void;
  onDeleteTest: (id: string) => void;
  onResetToDefaults: () => void;
  onLogoutAdmin?: () => void;
}

export default function AdminPanel({
  tests,
  onAddTest,
  onUpdateTest,
  onDeleteTest,
  onResetToDefaults,
  onLogoutAdmin
}: AdminPanelProps) {
  // Navigation inside Admin Panel
  const [viewMode, setViewMode] = useState<'list' | 'form'>('list');
  const [editingTestId, setEditingTestId] = useState<string | null>(null);

  // Form States - Core Metadata
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<TestCategory>('reading');
  const [type, setType] = useState<TestType>('Academic');
  const [durationMinutes, setDurationMinutes] = useState<number>(60);
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('Medium');
  const [description, setDescription] = useState('');
  
  // Custom Content Fields
  const [passage, setPassage] = useState('');
  const [audioUrl, setAudioUrl] = useState('');
  const [audioScript, setAudioScript] = useState('');
  const [writingPrompt, setWritingPrompt] = useState('');
  const [speakingPart1, setSpeakingPart1] = useState('');
  const [speakingPart2, setSpeakingPart2] = useState('');
  const [speakingPart3, setSpeakingPart3] = useState('');

  // Sections (e.g. ['Section 1', 'Section 2'])
  const [sectionsText, setSectionsText] = useState('');

  // Questions Array State
  const [questions, setQuestions] = useState<IELTSQuestion[]>([]);

  // Individual Question Builder State (For adding/editing within the form)
  const [currentQText, setCurrentQText] = useState('');
  const [currentQType, setCurrentQType] = useState<QuestionType>('MCQ');
  const [currentQCorrect, setCurrentQCorrect] = useState('');
  const [currentQExplanation, setCurrentQExplanation] = useState('');
  const [currentQOptions, setCurrentQOptions] = useState<string[]>(['A. ', 'B. ', 'C. ', 'D. ']);
  const [currentQHeadings, setCurrentQHeadings] = useState<string[]>(['i. ', 'ii. ', 'iii. ', 'iv. ']);
  const [selectedQuestionIndex, setSelectedQuestionIndex] = useState<number | null>(null);

  const [formError, setFormError] = useState<string | null>(null);
  const [showConfirmReset, setShowConfirmReset] = useState(false);

  // Load existing test data for editing
  const handleStartEdit = (test: IELTSTest) => {
    setEditingTestId(test.id);
    setTitle(test.title);
    setCategory(test.category);
    setType(test.type);
    setDurationMinutes(test.durationMinutes);
    setDifficulty(test.difficulty);
    setDescription(test.description);
    setSectionsText(test.sections.join('\n'));
    setPassage(test.passage || '');
    setAudioUrl(test.audioUrl || '');
    setAudioScript(test.audioScript || '');
    
    if (test.category === 'writing') {
      setWritingPrompt(test.sections[0] || '');
    } else if (test.category === 'speaking') {
      setSpeakingPart1(test.sections[0] || '');
      setSpeakingPart2(test.sections[1] || '');
      setSpeakingPart3(test.sections[2] || '');
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
    setDifficulty('Medium');
    setDescription('');
    setSectionsText('');
    setPassage('');
    setAudioUrl('');
    setAudioScript('');
    setWritingPrompt('');
    setSpeakingPart1('');
    setSpeakingPart2('');
    setSpeakingPart3('');
    setQuestions([]);
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
      options: currentQType === 'MCQ' ? currentQOptions.filter(o => o.trim() !== '') : undefined,
      headingOptions: currentQType === 'MatchingHeadings' ? currentQHeadings.filter(h => h.trim() !== '') : undefined
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

    let resolvedSections: string[] = [];
    if (category === 'writing') {
      resolvedSections = [writingPrompt || `Task 1: Write at least 150 words describing details.`];
    } else if (category === 'speaking') {
      resolvedSections = [
        speakingPart1 || 'Part 1: Discussion on leisure and hobbies',
        speakingPart2 || 'Part 2 Cue Card: Describe an old building or structure',
        speakingPart3 || 'Part 3: Preservation vs modernization'
      ];
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
      questionsCount: category === 'writing' ? 1 : category === 'speaking' ? 3 : questions.length,
      attemptsCount: editingTestId ? (tests.find(t => t.id === editingTestId)?.attemptsCount || 0) : 0,
      averageScore: editingTestId ? (tests.find(t => t.id === editingTestId)?.averageScore || 7.0) : 7.0,
      difficulty,
      description: description.trim() || `Authentic custom practice test designed for ${category} assessment.`,
      sections: resolvedSections,
      questions: category !== 'writing' && category !== 'speaking' ? questions : undefined,
      passage: category === 'reading' ? passage.trim() : undefined,
      audioUrl: category === 'listening' ? audioUrl.trim() : undefined,
      audioScript: category === 'listening' ? audioScript.trim() : undefined
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
            <span className="rounded bg-rose-50 border border-rose-100 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-rose-700">
              Restricted Area
            </span>
            <h2 className="text-base font-extrabold text-gray-900 mt-1">IELTS Content Manager</h2>
          </div>
        </div>

        {viewMode === 'list' ? (
          <div className="flex flex-wrap gap-2 w-full sm:w-auto">
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
            <button
              type="button"
              onClick={() => setShowConfirmReset(true)}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-all active:scale-95 cursor-pointer"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>Reset to Defaults</span>
            </button>
            <button
              type="button"
              onClick={handleStartCreate}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 rounded-xl shadow-md shadow-rose-100 transition-all active:scale-95 cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>Create Mock Test</span>
            </button>
          </div>
        ) : (
          <button
            onClick={() => setViewMode('list')}
            className="flex items-center gap-1 px-3 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-50 rounded-xl border border-gray-200 transition-all active:scale-95 cursor-pointer"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Cancel & Back</span>
          </button>
        )}
      </div>

      {/* Confirmation Modal for Resets */}
      {showConfirmReset && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-900/40 backdrop-blur-sm">
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-sm w-full p-6 border border-gray-100 shadow-2xl space-y-4 my-8">
            <div className="h-10 w-10 bg-rose-50 rounded-full flex items-center justify-center text-rose-600 mx-auto">
              <AlertCircle className="h-6 w-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="font-extrabold text-gray-900 text-sm">Reset Content Bank?</h3>
              <p className="text-xs text-gray-400">This will delete all custom uploaded tests and restore the core mock datasets. This action is irreversible.</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowConfirmReset(false)}
                className="flex-1 py-2.5 border border-gray-200 text-xs font-semibold text-gray-600 rounded-xl hover:bg-gray-50 cursor-pointer"
              >
                Go Back
              </button>
              <button
                onClick={() => {
                  onResetToDefaults();
                  setShowConfirmReset(false);
                  alert('Content bank restored to default mock data successfully.');
                }}
                className="flex-1 py-2.5 bg-rose-600 text-xs font-semibold text-white rounded-xl hover:bg-rose-500 cursor-pointer"
              >
                Confirm Reset
              </button>
            </div>
          </div>
        </div>
      </div>
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
                    <th className="px-4 py-3">Difficulty</th>
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
                        <td className="px-4 py-3.5">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                            test.difficulty === 'Easy' ? 'bg-emerald-50 text-emerald-600' : 
                            test.difficulty === 'Medium' ? 'bg-amber-50 text-amber-600' : 'bg-rose-50 text-rose-600'
                          }`}>
                            {test.difficulty}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 font-semibold text-gray-600">{test.durationMinutes}m</td>
                        <td className="px-4 py-3.5 text-gray-500 font-bold font-mono">
                          {test.category === 'writing' ? '1 Prompt' : test.category === 'speaking' ? '3 Parts' : `${test.questions?.length || test.questionsCount || 0} Qs`}
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

            <div className="grid gap-4 md:grid-cols-3">
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
                <label className="text-[11px] font-bold text-gray-500 uppercase">Difficulty Level *</label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value as DifficultyLevel)}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50/50 p-2.5 text-xs text-gray-700 outline-none transition-all focus:bg-white focus:border-rose-500"
                >
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>
              </div>

              <div className="space-y-1.5 md:col-span-1">
                <label className="text-[11px] font-bold text-gray-500 uppercase">Questions Count Display</label>
                <input
                  type="text"
                  disabled
                  value={category === 'writing' ? '1 Essay Prompt' : category === 'speaking' ? '3 speaking tasks' : `${questions.length} questions built`}
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
          </div>

          {/* Part B: Real Content Input fields (Reading passage, Listening audio link, etc.) */}
          <div className="border-t border-gray-100 pt-5 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">Step 2: Authenticated Real Content</h3>

            {category === 'reading' && (
              <div className="space-y-3">
                <div className="rounded-xl bg-rose-50/50 p-3.5 border border-rose-100/50 flex gap-2">
                  <BookOpen className="h-5 w-5 text-rose-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-rose-800">Reading Passage Content</h4>
                    <p className="text-[10px] text-gray-400">Specify the primary paragraphs. Candidates will see this passage during their active reading simulator.</p>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <textarea
                    placeholder="Type or paste the full IELTS Reading Article/Passage here..."
                    value={passage}
                    onChange={(e) => setPassage(e.target.value)}
                    rows={8}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50/50 p-3 text-xs text-gray-700 outline-none transition-all focus:bg-white focus:border-rose-500 font-sans leading-relaxed"
                  />
                </div>
                <div className="space-y-1.5">
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
                    <p className="text-[10px] text-gray-400">Input a streaming audio source URL (.mp3 format) to enable an authentic audio player. Candidates can practice with genuine sound cues.</p>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-gray-500 uppercase">Audio Track Source Link (.mp3 format preferred)</label>
                    <input
                      type="text"
                      placeholder="e.g. https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"
                      value={audioUrl}
                      onChange={(e) => setAudioUrl(e.target.value)}
                      className="w-full rounded-xl border border-gray-200 bg-gray-50/50 p-2.5 text-xs text-gray-700 outline-none transition-all focus:bg-white focus:border-rose-500 font-mono"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-gray-500 uppercase">Audio Transcript Summary</label>
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
                    placeholder="Part 1: Library Membership Registration&#10;Part 2: Tour Guide Dialogue"
                    value={sectionsText}
                    onChange={(e) => setSectionsText(e.target.value)}
                    rows={2}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50/50 p-2.5 text-xs text-gray-700 outline-none transition-all focus:bg-white focus:border-rose-500 font-mono"
                  />
                </div>
              </div>
            )}

            {category === 'writing' && (
              <div className="space-y-3">
                <div className="rounded-xl bg-teal-50/50 p-3.5 border border-teal-100/50 flex gap-2">
                  <PenTool className="h-5 w-5 text-teal-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-teal-800">Writing Essay Prompt</h4>
                    <p className="text-[10px] text-gray-400">Define the core writing task prompt. In practice sessions, candidates will type an essay and get scored based on target thresholds.</p>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-gray-500 uppercase">Task 1 or Task 2 Prompt Details *</label>
                  <textarea
                    placeholder="Discuss both views and give your opinion on whether Generative AI technologies will ultimately empower or extinguish human-led creative professions..."
                    value={writingPrompt}
                    onChange={(e) => setWritingPrompt(e.target.value)}
                    rows={4}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50/50 p-3 text-xs text-gray-700 outline-none transition-all focus:bg-white focus:border-rose-500 font-sans leading-relaxed"
                    required={category === 'writing'}
                  />
                </div>
              </div>
            )}

            {category === 'speaking' && (
              <div className="space-y-4">
                <div className="rounded-xl bg-purple-50/50 p-3.5 border border-purple-100/50 flex gap-2">
                  <Mic className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-purple-800">Speaking Cue Cards & Parts</h4>
                    <p className="text-[10px] text-gray-400">Declare the prompts for the three core Speaking interview parts.</p>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-gray-500 uppercase">Part 1 Introduction Prompt</label>
                    <textarea
                      placeholder="Discussion on hobbies, digital devices, and leisure habits."
                      value={speakingPart1}
                      onChange={(e) => setSpeakingPart1(e.target.value)}
                      rows={3}
                      className="w-full rounded-xl border border-gray-200 bg-gray-50/50 p-2.5 text-xs text-gray-700 outline-none transition-all focus:bg-white focus:border-rose-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-gray-500 uppercase">Part 2 Cue Card Topic</label>
                    <textarea
                      placeholder="Describe an old building or heritage structure you visited. You should say where it is, what it looks like..."
                      value={speakingPart2}
                      onChange={(e) => setSpeakingPart2(e.target.value)}
                      rows={3}
                      className="w-full rounded-xl border border-gray-200 bg-gray-50/50 p-2.5 text-xs text-gray-700 outline-none transition-all focus:bg-white focus:border-rose-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-gray-500 uppercase">Part 3 Abstract Analysis Prompt</label>
                    <textarea
                      placeholder="Analytical discussion on heritage preservation versus rapid modernization."
                      value={speakingPart3}
                      onChange={(e) => setSpeakingPart3(e.target.value)}
                      rows={3}
                      className="w-full rounded-xl border border-gray-200 bg-gray-50/50 p-2.5 text-xs text-gray-700 outline-none transition-all focus:bg-white focus:border-rose-500"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Part C: Questions Editor (For Listening / Reading only) */}
          {category !== 'writing' && category !== 'speaking' && (
            <div className="border-t border-gray-100 pt-5 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">Step 3: Interactive Question Bank</h3>
                <span className="text-[10px] font-bold bg-amber-50 text-amber-700 px-2 py-0.5 rounded border border-amber-100">{questions.length} Questions Configured</span>
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
                        // Sensible default correct answers based on type
                        if (nextType === 'TrueFalseNotGiven') setCurrentQCorrect('True');
                        else if (nextType === 'MatchingHeadings') setCurrentQCorrect('i');
                        else if (nextType === 'MCQ') setCurrentQCorrect('A');
                        else setCurrentQCorrect('');
                      }}
                      className="w-full rounded-xl border border-gray-200 bg-white p-2 text-xs text-gray-700 outline-none transition-all focus:border-rose-500"
                    >
                      <option value="MCQ">Multiple Choice (MCQ)</option>
                      <option value="TrueFalseNotGiven">True/False/Not Given</option>
                      <option value="MatchingHeadings">Matching Paragraph Headings</option>
                      <option value="Blanks">Fill in the Blanks</option>
                    </select>
                  </div>
                </div>

                {/* Subform: Multiple Choice details */}
                {currentQType === 'MCQ' && (
                  <div className="space-y-2 bg-white p-3 rounded-xl border border-gray-100">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Set MCQ Choice Labels</span>
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
                        </div>
                      ))}
                    </div>
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
                <div className="grid gap-3 md:grid-cols-3 items-end">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-gray-500 uppercase">Correct Answer *</label>
                    {currentQType === 'TrueFalseNotGiven' ? (
                      <select
                        value={currentQCorrect}
                        onChange={(e) => setCurrentQCorrect(e.target.value)}
                        className="w-full rounded-xl border border-gray-200 bg-white p-2 text-xs text-gray-700 outline-none"
                      >
                        <option value="True">True</option>
                        <option value="False">False</option>
                        <option value="Not Given">Not Given</option>
                      </select>
                    ) : currentQType === 'MCQ' ? (
                      <select
                        value={currentQCorrect}
                        onChange={(e) => setCurrentQCorrect(e.target.value)}
                        className="w-full rounded-xl border border-gray-200 bg-white p-2 text-xs text-gray-700 outline-none"
                      >
                        <option value="A">A</option>
                        <option value="B">B</option>
                        <option value="C">C</option>
                        <option value="D">D</option>
                      </select>
                    ) : (
                      <input
                        type="text"
                        placeholder={currentQType === 'MatchingHeadings' ? 'e.g. ii' : 'e.g. October'}
                        value={currentQCorrect}
                        onChange={(e) => setCurrentQCorrect(e.target.value)}
                        className="w-full rounded-xl border border-gray-200 bg-white p-2 text-xs text-gray-700 outline-none focus:border-rose-500 font-mono"
                      />
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-gray-500 uppercase">Teacher explanation/commentary</label>
                    <input
                      type="text"
                      placeholder="e.g. The narrator highlights how early sailors relied on stars..."
                      value={currentQExplanation}
                      onChange={(e) => setCurrentQExplanation(e.target.value)}
                      className="w-full rounded-xl border border-gray-200 bg-white p-2 text-xs text-gray-700 outline-none focus:border-rose-500"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleSaveQuestion}
                    className="w-full py-2 bg-gray-900 hover:bg-gray-800 text-white rounded-xl text-xs font-bold transition-all active:scale-95 cursor-pointer"
                  >
                    {selectedQuestionIndex !== null ? 'Save Changes' : 'Include Question'}
                  </button>
                </div>
              </div>

              {/* Form Question List Overview */}
              <div className="space-y-2">
                <span className="text-[11px] font-bold text-gray-500 uppercase block">Active Question list for this test</span>
                {questions.length === 0 ? (
                  <p className="text-xs text-gray-400 italic bg-gray-50 border border-gray-100 rounded-xl p-3">No interactive questions added yet. Use the question generator above to add listening or reading questions.</p>
                ) : (
                  <div className="grid gap-2">
                    {questions.map((q, idx) => (
                      <div key={q.id} className="flex items-center justify-between rounded-xl bg-white border border-gray-100 p-2.5 text-xs hover:border-gray-200 transition-all">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className="h-5 w-5 rounded-full bg-rose-50 text-rose-700 flex items-center justify-center font-extrabold text-[10px] border border-rose-100 flex-shrink-0">{idx + 1}</span>
                          <div className="truncate">
                            <p className="font-bold text-gray-800 truncate">{q.questionText}</p>
                            <p className="text-[10px] text-gray-400 font-mono uppercase mt-0.2">{q.type} • Answer: <span className="font-bold text-rose-600 font-mono">{q.correctAnswer}</span></p>
                          </div>
                        </div>
                        <div className="flex gap-1 flex-shrink-0 ml-4">
                          <button
                            type="button"
                            onClick={() => handleEditQuestion(idx)}
                            className="p-1 text-gray-500 hover:text-rose-600 hover:bg-rose-50 rounded"
                          >
                            <Edit3 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteQuestion(idx)}
                            className="p-1 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded"
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
