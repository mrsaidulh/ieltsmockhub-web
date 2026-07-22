import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, CheckCircle2, ChevronRight, X, 
  ArrowUpRight, Info, Compass, Target, GraduationCap, Lock, Unlock, ShieldAlert
} from 'lucide-react';
import Header from './components/Header';
import CategoryNav from './components/CategoryNav';
import DashboardOverview from './components/DashboardOverview';
import TestList from './components/TestList';
import AnalyticsView from './components/AnalyticsView';
import TestStartModal from './components/TestStartModal';
import VocabularyView from './components/VocabularyView';
import AdminPanel from './components/AdminPanel';
import StudentAuthModal from './components/StudentAuthModal';
import StudentProfileModal from './components/StudentProfileModal';
import SplashAnimation from './components/SplashAnimation';
import { 
  INITIAL_USER_PROGRESS, MOCK_TESTS, 
  MOCK_ATTEMPT_HISTORY, MOCK_BAND_PROGRESS 
} from './data/mockData';
import { INITIAL_REGISTERED_STUDENTS } from './data/mockUserData';
import { IELTSTest, TestCategory, TestType, AttemptHistory, BandProgressPoint, VocabularyWord, StudentLead } from './types';

export default function App() {
  // Website Load Splash Animation state
  const [showSplash, setShowSplash] = useState(true);

  // Global States
  const [progress, setProgress] = useState(INITIAL_USER_PROGRESS);
  const [recentAttempts, setRecentAttempts] = useState<AttemptHistory[]>(MOCK_ATTEMPT_HISTORY);
  const [progressData, setProgressData] = useState<BandProgressPoint[]>(MOCK_BAND_PROGRESS);
  const [activeCategory, setActiveCategory] = useState<TestCategory>('all');
  const [activeType, setActiveType] = useState<TestType | 'All' | 'Analytics' | 'Vocabulary' | 'Admin'>('All');
  const [streakIncremented, setStreakIncremented] = useState(false);
  const [selectedTest, setSelectedTest] = useState<IELTSTest | null>(null);
  const [completedTestIds, setCompletedTestIds] = useState<string[]>(['r1', 'l1']);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const [showProfileModal, setShowProfileModal] = useState<boolean>(false);

  // Admin authentication and privileges
  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    return localStorage.getItem('ielts_is_admin') === 'true';
  });
  const [showAdminAuth, setShowAdminAuth] = useState<boolean>(false);
  const [adminPinInput, setAdminPinInput] = useState<string>('');
  const [adminPinError, setAdminPinError] = useState<string | null>(null);

  // Close Admin PIN modal on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showAdminAuth) {
        setShowAdminAuth(false);
        setAdminPinError(null);
        setAdminPinInput('');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [showAdminAuth]);

  // Content Bank Tests state (loads custom tests and merges with default mock tests)
  const [tests, setTests] = useState<IELTSTest[]>(() => {
    const saved = localStorage.getItem('ielts_custom_tests');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          const merged = [...parsed];
          MOCK_TESTS.forEach((mTest) => {
            if (!merged.some((t) => t.id === mTest.id)) {
              merged.push(mTest);
            }
          });
          return merged;
        }
      } catch (e) {
        console.error(e);
      }
    }
    return MOCK_TESTS;
  });

  // Student Lead Directory State
  const [registeredStudents, setRegisteredStudents] = useState<StudentLead[]>(() => {
    const saved = localStorage.getItem('ielts_registered_students');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) { }
    }
    localStorage.setItem('ielts_registered_students', JSON.stringify(INITIAL_REGISTERED_STUDENTS));
    return INITIAL_REGISTERED_STUDENTS;
  });

  const handleUpdateStudents = (updatedStudents: StudentLead[]) => {
    setRegisteredStudents(updatedStudents);
    localStorage.setItem('ielts_registered_students', JSON.stringify(updatedStudents));
  };

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

  const handleAddTest = (newTest: IELTSTest) => {
    setTests((prev) => {
      const updated = [newTest, ...prev];
      localStorage.setItem('ielts_custom_tests', JSON.stringify(updated.filter(t => t.id.startsWith('custom_'))));
      return updated;
    });
    triggerToast(`"${newTest.title}" deployed successfully!`);
  };

  const handleUpdateTest = (updatedTest: IELTSTest) => {
    setTests((prev) => {
      const updated = prev.map((t) => t.id === updatedTest.id ? updatedTest : t);
      localStorage.setItem('ielts_custom_tests', JSON.stringify(updated.filter(t => t.id.startsWith('custom_'))));
      return updated;
    });
    triggerToast(`"${updatedTest.title}" updated successfully!`);
  };

  const handleDeleteTest = (id: string) => {
    setTests((prev) => {
      const updated = prev.filter((t) => t.id !== id);
      localStorage.setItem('ielts_custom_tests', JSON.stringify(updated.filter(t => t.id.startsWith('custom_'))));
      return updated;
    });
    triggerToast(`Test deleted successfully.`);
  };

  const handleResetToDefaults = () => {
    setTests(MOCK_TESTS);
    localStorage.removeItem('ielts_custom_tests');
    triggerToast('All content restored to core mock data defaults.');
  };

  const handleAdminLogin = (pin: string) => {
    if (pin.trim() === 'admin123') {
      setIsAdmin(true);
      localStorage.setItem('ielts_is_admin', 'true');
      setShowAdminAuth(false);
      setAdminPinInput('');
      setAdminPinError(null);
      setActiveType('Admin'); // Immediately transition to Admin workspace!
      triggerToast('Welcome Admin! Content manager tools unlocked.');
    } else {
      setAdminPinError('Invalid security passcode. Hint: Use admin123');
    }
  };

  const handleAdminLogout = () => {
    setIsAdmin(false);
    localStorage.removeItem('ielts_is_admin');
    if (activeType === 'Admin') {
      setActiveType('All');
    }
    triggerToast('Administrator logged out successfully.');
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
        onVerifyUser={handleVerifyUser}
        showAuthModal={showAuthModal}
        setShowAuthModal={setShowAuthModal}
        onOpenStudentProfile={() => setShowProfileModal(true)}
      />

      {/* IELTS standard navigation menu */}
      <CategoryNav
        activeCategory={activeCategory}
        onSelectCategory={handleSelectCategory}
        activeType={activeType}
        onSelectType={handleSelectType}
        isAdmin={isAdmin}
        onAdminAuthClick={() => setShowAdminAuth(true)}
      />

      {/* Main Content Workspace */}
      <main className="flex-grow mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-4">
        <AnimatePresence mode="wait">
          {activeType === 'Admin' ? (
            <motion.div
              key="admin-panel"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <AdminPanel
                tests={tests}
                onAddTest={handleAddTest}
                onUpdateTest={handleUpdateTest}
                onDeleteTest={handleDeleteTest}
                onResetToDefaults={handleResetToDefaults}
                onLogoutAdmin={handleAdminLogout}
                students={registeredStudents}
                onUpdateStudents={handleUpdateStudents}
              />
            </motion.div>
          ) : activeType === 'Vocabulary' ? (
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
                tests={tests}
                onStartTest={handleStartTest}
                currentUser={currentUser}
                onOpenAuth={() => setShowAuthModal(true)}
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
                tests={tests}
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
            <span className="font-mono text-[10px] font-bold text-gray-500 uppercase tracking-widest">Learn, Practice & Score</span>
          </div>
          <div className="flex flex-wrap items-center justify-center sm:justify-end gap-3 text-xs">
            <button
              onClick={() => {
                if (isAdmin) {
                  setActiveType('Admin');
                } else {
                  setShowAdminAuth(true);
                }
              }}
              className="flex items-center gap-1.5 text-gray-500 hover:text-rose-600 font-bold transition-colors cursor-pointer"
            >
              <Lock className="h-3.5 w-3.5" />
              <span>Admin Portal</span>
            </button>
            <span className="text-gray-200">|</span>
            <p className="text-gray-400">
              © 2026 IELTS Mock Hub. Non-affiliated with IDP, IELTS, or British Council.
            </p>
          </div>
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

      {/* Admin Authorization Security Dialog */}
      <AnimatePresence>
        {showAdminAuth && (
          <div 
            className="fixed inset-0 z-50 overflow-y-auto bg-gray-950/40 backdrop-blur-sm"
            onClick={() => {
              setShowAdminAuth(false);
              setAdminPinError(null);
              setAdminPinInput('');
            }}
          >
            <div className="flex min-h-full items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-3xl max-w-sm w-full p-6 border border-gray-150 shadow-2xl space-y-5 my-8"
                onClick={(e) => e.stopPropagation()}
              >
              <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="h-5 w-5 text-rose-600" />
                  <h3 className="font-extrabold text-gray-900 text-sm">Staff Authentication</h3>
                </div>
                <button
                  onClick={() => {
                    setShowAdminAuth(false);
                    setAdminPinError(null);
                    setAdminPinInput('');
                  }}
                  className="p-1 rounded-full text-gray-400 hover:bg-gray-100"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-3 text-left">
                <p className="text-xs text-gray-400">
                  Please enter the Admin Security PIN to manage actual reading articles, speaking prompts, and streaming tracks.
                </p>

                <div className="bg-rose-50 border border-rose-100 rounded-xl p-2.5 text-[11px] text-rose-700 font-semibold flex items-center gap-2">
                  <span className="bg-rose-600 text-white rounded text-[9px] px-1 py-0.2 font-extrabold uppercase">Hint</span>
                  <span>PIN is <strong className="font-mono">admin123</strong> for testing & verification.</span>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase">Security PIN</label>
                  <input
                    type="password"
                    placeholder="Enter Security PIN"
                    value={adminPinInput}
                    onChange={(e) => {
                      setAdminPinInput(e.target.value);
                      if (adminPinError) setAdminPinError(null);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleAdminLogin(adminPinInput);
                      }
                    }}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50/50 p-2.5 text-xs text-center font-mono font-bold tracking-widest text-gray-800 outline-none focus:bg-white focus:border-rose-500"
                  />
                  {adminPinError && (
                    <p className="text-[10px] text-rose-600 font-bold mt-1">{adminPinError}</p>
                  )}
                </div>
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  onClick={() => {
                    setShowAdminAuth(false);
                    setAdminPinError(null);
                    setAdminPinInput('');
                  }}
                  className="flex-1 py-2.5 border border-gray-200 text-xs font-semibold text-gray-600 rounded-xl hover:bg-gray-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleAdminLogin(adminPinInput)}
                  className="flex-1 py-2.5 bg-rose-600 text-xs font-semibold text-white rounded-xl hover:bg-rose-500 cursor-pointer"
                >
                  Unlock Access
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      )}
      </AnimatePresence>

      {/* Student Authentication Modal */}
      <AnimatePresence>
        {showAuthModal && (
          <StudentAuthModal
            isOpen={showAuthModal}
            onClose={() => setShowAuthModal(false)}
            onVerifyUser={handleVerifyUser}
          />
        )}
      </AnimatePresence>

      {/* Student Profile & Stats Modal */}
      <AnimatePresence>
        {showProfileModal && (
          <StudentProfileModal
            isOpen={showProfileModal}
            onClose={() => setShowProfileModal(false)}
            currentUser={currentUser}
            progress={progress}
            recentAttempts={recentAttempts}
            streakIncremented={streakIncremented}
            onClaimStreak={handleClaimStreak}
            onLogout={() => {
              handleLogout();
              setShowProfileModal(false);
            }}
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

      {/* Website Loading Splash Animation */}
      <AnimatePresence>
        {showSplash && (
          <SplashAnimation onComplete={() => setShowSplash(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}
