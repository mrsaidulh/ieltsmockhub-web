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
import { 
  INITIAL_USER_PROGRESS, MOCK_TESTS, 
  MOCK_ATTEMPT_HISTORY, MOCK_BAND_PROGRESS 
} from './data/mockData';
import { IELTSTest, TestCategory, TestType, AttemptHistory, BandProgressPoint } from './types';

export default function App() {
  // Global States
  const [progress, setProgress] = useState(INITIAL_USER_PROGRESS);
  const [recentAttempts, setRecentAttempts] = useState<AttemptHistory[]>(MOCK_ATTEMPT_HISTORY);
  const [progressData, setProgressData] = useState<BandProgressPoint[]>(MOCK_BAND_PROGRESS);
  const [activeCategory, setActiveCategory] = useState<TestCategory>('all');
  const [activeType, setActiveType] = useState<TestType | 'All' | 'Analytics'>('All');
  const [streakIncremented, setStreakIncremented] = useState(false);
  const [selectedTest, setSelectedTest] = useState<IELTSTest | null>(null);
  const [completedTestIds, setCompletedTestIds] = useState<string[]>(['r1', 'l1']);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Handlers
  const handleSelectCategory = (category: TestCategory) => {
    setActiveCategory(category);
  };

  const handleSelectType = (type: TestType | 'All' | 'Analytics') => {
    setActiveType(type);
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

  // Simulating completion of a mock practice test
  const handleConfirmStart = (test: IELTSTest, mode: 'Practice' | 'Exam') => {
    // 1. Generate random realistic band score based on difficulty and target
    let mockBand = progress.targetBand - 0.5; // default center
    if (test.difficulty === 'Easy') mockBand += 0.5;
    if (test.difficulty === 'Hard') mockBand -= 0.5;
    
    // Add minor random fluctuation
    mockBand += (Math.random() * 1.0 - 0.5);
    // Bound scores between 4.5 and 9.0 in increments of 0.5
    mockBand = Math.round(mockBand * 2) / 2;
    mockBand = Math.max(4.5, Math.min(9.0, mockBand));

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
      date: '2026-07-19', // Today
      bandScore: mockBand,
      correctAnswers,
      totalQuestions: test.questionsCount > 1 ? test.questionsCount : undefined,
      timeSpentMinutes: Math.round(test.durationMinutes * (0.8 + Math.random() * 0.3)), // ~80% to 110% of duration
      examinerFeedback: `Outstanding work on ${test.title}! Your accuracy under ${mode} Mode shows high command of language. Review errors in complex sentences to target a band higher next time.`
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
          {activeType === 'Analytics' ? (
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
