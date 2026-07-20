import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, CheckCircle2, ChevronRight, X, 
  ArrowUpRight, Info, Compass, Target, GraduationCap 
} from 'lucide-react';
import Header from './components/Header';
import CategoryNav from './components/CategoryNav';
import DashboardOverview from './components/DashboardOverview';
import TestList from './components/TestList';
import AnalyticsView from './components/AnalyticsView';
import TestStartModal from './components/TestStartModal';
import VocabularyView from './components/VocabularyView';
import { 
  INITIAL_USER_PROGRESS, MOCK_TESTS, 
  MOCK_ATTEMPT_HISTORY, MOCK_BAND_PROGRESS 
} from './data/mockData';
import { IELTSTest, TestCategory, TestType, AttemptHistory, BandProgressPoint, VocabularyWord, StudentLead } from './types';

export default function App() {
  // Global States
  const [progress, setProgress] = useState(INITIAL_USER_PROGRESS);
  const [recentAttempts, setRecentAttempts] = useState<AttemptHistory[]>(MOCK_ATTEMPT_HISTORY);
  const [progressData, setProgressData] = useState<BandProgressPoint[]>(MOCK_BAND_PROGRESS);
  const [activeCategory, setActiveCategory] = useState<TestCategory>('all');
  const [activeType, setActiveType] = useState<TestType | 'All' | 'Analytics' | 'Vocabulary'>('All');
  const [streakIncremented, setStreakIncremented] = useState(false);
  const [selectedTest, setSelectedTest] = useState<IELTSTest | null>(null);
  const [completedTestIds, setCompletedTestIds] = useState<string[]>(['r1', 'l1']);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Student Lead Session State
  const [currentUser, setCurrentUser] = useState<StudentLead | null>(() => {
    const saved = localStorage.getItem('ielts_student_user');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { }
    }
    return null;
  });

  // Vocabulary Bank State
  const [vocabularyList, setVocabularyList] = useState<VocabularyWord[]>(() => {
    const saved = localStorage.getItem('ielts_vocabulary');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { }
    }
    return [
      {
        id: 'vocab_1',
        word: 'Symbiotic',
        definition: 'Denoting a mutually beneficial relationship between different organisms.',
        exampleSentence: 'disrupt the fragile symbiotic algae, leading to widespread bleaching events.',
        sourceTestTitle: 'Marine Ecosystem Dynamics',
        dateAdded: '2026-07-19',
        mastered: false,
      },
      {
        id: 'vocab_2',
        word: 'Commencement',
        definition: 'The beginning or start of something.',
        exampleSentence: 'The preferred date for membership commencement is the 14th of October.',
        sourceTestTitle: 'Audio Registration Conversation',
        dateAdded: '2026-07-19',
        mastered: false,
      },
      {
        id: 'vocab_3',
        word: 'Empower',
        definition: 'Make stronger and more confident, especially in controlling their life and claiming their rights.',
        exampleSentence: 'Discuss whether Generative AI technologies will ultimately empower or extinguish human creative professions.',
        sourceTestTitle: 'Generative AI & Creative Careers',
        dateAdded: '2026-07-19',
        mastered: true,
      }
    ];
  });

  // Handlers
  const handleSelectCategory = (category: TestCategory) => {
    setActiveCategory(category);
  };

  const handleSelectType = (type: TestType | 'All' | 'Analytics' | 'Vocabulary') => {
    setActiveType(type);
  };

  const handleAddVocabularyWord = (wordData: { word: string; definition: string; exampleSentence?: string; sourceTestId?: string; sourceTestTitle?: string }) => {
    const newWord: VocabularyWord = {
      ...wordData,
      id: `vocab_${Date.now()}`,
      dateAdded: new Date().toISOString().split('T')[0],
      mastered: false,
    };
    setVocabularyList((prev) => {
      const updated = [newWord, ...prev];
      localStorage.setItem('ielts_vocabulary', JSON.stringify(updated));
      return updated;
    });
    triggerToast(`Added "${newWord.word}" to Vocabulary Bank!`);
  };

  const handleToggleMastery = (id: string) => {
    setVocabularyList((prev) => {
      const updated = prev.map((w) => w.id === id ? { ...w, mastered: !w.mastered } : w);
      localStorage.setItem('ielts_vocabulary', JSON.stringify(updated));
      return updated;
    });
  };

  const handleDeleteVocabularyWord = (id: string) => {
    setVocabularyList((prev) => {
      const updated = prev.filter((w) => w.id !== id);
      localStorage.setItem('ielts_vocabulary', JSON.stringify(updated));
      return updated;
    });
    triggerToast('Vocabulary word removed.');
  };

  const handleChangeTarget = (newTarget: number) => {
    setProgress((prev) => ({
      ...prev,
      targetBand: newTarget,
    }));
    triggerToast(`Target Band updated to ${newTarget.toFixed(1)}! Keep striving!`);
  };

  const handleClaimStreak = () => {
    if (!streakIncremented) {
      setProgress((prev) => ({
        ...prev,
        streakDays: prev.streakDays + 1,
      }));
      setStreakIncremented(true);
      triggerToast('Daily streak recorded! Your +1 practice reward has been added.');
    }
  };

  const handleStartTest = (test: IELTSTest) => {
    setSelectedTest(test);
  };

  const handleVerifyUser = (lead: StudentLead) => {
    setCurrentUser(lead);
    localStorage.setItem('ielts_student_user', JSON.stringify(lead));
    triggerToast(`Welcome ${lead.name}! Phone verification successful.`);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('ielts_student_user');
    triggerToast('You have logged out of your practice session.');
  };

  // Simulating completion of a mock practice test with calculated score and options
  const handleConfirmStart = (
    test: IELTSTest, 
    mode: 'Practice' | 'Exam', 
    score: number, 
    userAnswers?: Record<string, string>, 
    feedback?: string
  ) => {
    const mockBand = score;

    // 2. Generate correct answers if applicable
    const correctAnswers = test.questionsCount > 1 
      ? Math.round((mockBand / 9.0) * test.questionsCount)
      : undefined;

    // 3. Create new attempt object
    const newAttempt: AttemptHistory = {
      id: `att_${Date.now()}`,
      testId: test.id,
      testTitle: test.title,
      category: test.category,
      date: new Date().toISOString().split('T')[0], // Today
      bandScore: mockBand,
      correctAnswers,
      totalQuestions: test.questionsCount > 1 ? test.questionsCount : undefined,
      timeSpentMinutes: Math.round(test.durationMinutes * (0.5 + Math.random() * 0.4)), // dynamic timeframe
      examinerFeedback: feedback || `Excellent work on ${test.title} under ${mode} Mode. Review difficult structures to hit your band ${progress.targetBand} target.`,
      userAnswers
    };

    // 4. Update states
    setRecentAttempts((prev) => [newAttempt, ...prev]);
    
    if (!completedTestIds.includes(test.id)) {
      setCompletedTestIds((prev) => [...prev, test.id]);
    }

    setProgress((prev) => ({
      ...prev,
      completedTestsCount: prev.completedTestsCount + 1,
      practiceTimeHours: parseFloat((prev.practiceTimeHours + (test.durationMinutes / 60)).toFixed(1)),
    }));

    // Update progress trends chart data
    const lastPoint = progressData[progressData.length - 1];
    const newTrendPoint: BandProgressPoint = {
      date: 'Jul 19',
      Listening: test.category === 'listening' ? mockBand : lastPoint.Listening,
      Reading: test.category === 'reading' ? mockBand : lastPoint.Reading,
      Writing: test.category === 'writing' ? mockBand : lastPoint.Writing,
      Speaking: test.category === 'speaking' ? mockBand : lastPoint.Speaking,
      Average: parseFloat(
        ((
          (test.category === 'listening' ? mockBand : lastPoint.Listening) +
          (test.category === 'reading' ? mockBand : lastPoint.Reading) +
          (test.category === 'writing' ? mockBand : lastPoint.Writing) +
          (test.category === 'speaking' ? mockBand : lastPoint.Speaking)
        ) / 4).toFixed(2)
      ),
    };
    setProgressData((prev) => [...prev, newTrendPoint]);

    triggerToast(`Completed ${test.title}! Recorded Band Score: ${mockBand.toFixed(1)}`);
  };

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  return (
    <div className="min-h-screen bg-gray-50/50 flex flex-col antialiased text-gray-800 font-sans" id="applet-main-container">
      {/* Dynamic Action Header */}
      <Header
        progress={progress}
        onChangeTarget={handleChangeTarget}
        streakIncremented={streakIncremented}
        onClaimStreak={handleClaimStreak}
        currentUser={currentUser}
        onLogout={handleLogout}
      />

      {/* IELTS standard navigation menu */}
      <CategoryNav
        activeCategory={activeCategory}
        onSelectCategory={handleSelectCategory}
        activeType={activeType}
        onSelectType={handleSelectType}
      />

      {/* Main Content Workspace */}
      <main className="flex-grow mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-4">
        <AnimatePresence mode="wait">
          {activeType === 'Vocabulary' ? (
            <motion.div
              key="vocabulary"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <VocabularyView
                vocabularyList={vocabularyList}
                onAddWord={handleAddVocabularyWord}
                onToggleMastery={handleToggleMastery}
                onDeleteWord={handleDeleteVocabularyWord}
              />
            </motion.div>
          ) : activeType === 'Analytics' ? (
            <motion.div
              key="analytics"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <AnalyticsView
                progress={progress}
                recentAttempts={recentAttempts}
                progressData={progressData}
              />
            </motion.div>
          ) : activeCategory === 'all' && activeType === 'All' ? (
            /* Home / Dashboard view (default) */
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <DashboardOverview
                progress={progress}
                recentAttempts={recentAttempts}
                onSelectCategory={handleSelectCategory}
                onSelectType={handleSelectType}
                streakIncremented={streakIncremented}
                onClaimStreak={handleClaimStreak}
              />
            </motion.div>
          ) : (
            /* Selected category or specific test lists */
            <motion.div
              key="test-list"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <TestList
                tests={MOCK_TESTS}
                category={activeCategory}
                selectedType={activeType}
                onStartTest={handleStartTest}
                completedTestIds={completedTestIds}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Standard IELTS Mock Hub Branding Footer */}
      <footer className="bg-white border-t border-gray-100 py-6 mt-12 text-center text-xs text-gray-400 font-medium">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-4 w-4 text-rose-500" />
            <span className="font-semibold text-gray-700">IELTS Mock Hub</span>
            <span className="text-gray-300">|</span>
            <span className="font-mono">IELTSmockhub.com</span>
          </div>
          <p>
            © 2026 IELTS Mock Hub. Designed in collaboration with senior software architects. Non-affiliated with IDP, IELTS, or British Council.
          </p>
        </div>
      </footer>

      {/* Launch Test Start Dialog */}
      <AnimatePresence>
        {selectedTest && (
          <TestStartModal
            test={selectedTest}
            onClose={() => setSelectedTest(null)}
            onConfirmStart={handleConfirmStart}
            onAddVocabularyWord={handleAddVocabularyWord}
            currentUser={currentUser}
            onVerifyUser={handleVerifyUser}
          />
        )}
      </AnimatePresence>

      {/* Floating Interactive Notification Toast */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-2xl bg-gray-900 px-4 py-3.5 text-xs font-semibold text-white shadow-xl max-w-sm"
          >
            <CheckCircle2 className="h-5 w-5 text-emerald-400 flex-shrink-0 animate-bounce" />
            <span>{toastMessage}</span>
            <button
              onClick={() => setToastMessage(null)}
              className="ml-auto rounded p-0.5 hover:bg-white/10 text-gray-400 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
