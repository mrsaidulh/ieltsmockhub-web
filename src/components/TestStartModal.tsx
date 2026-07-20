import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, Check, AlertCircle, Clock, HelpCircle, 
  Sparkles, FileText, Play, CheckCircle2, Award,
  Volume2, BookOpen, PenTool, Mic, PlayCircle, PauseCircle, 
  FastForward, Smartphone, Mail, User, Lock, ChevronRight, Eye
} from 'lucide-react';
import { IELTSTest, StudentLead, IELTSQuestion } from '../types';
import SpeakingPractice from './SpeakingPractice';
import TestSession from './TestSession';
import { MOCK_QUESTIONS_BY_TEST_ID } from '../data/mockQuestions';

interface TestStartModalProps {
  test: IELTSTest | null;
  onClose: () => void;
  onConfirmStart: (test: IELTSTest, mode: 'Practice' | 'Exam', score: number, userAnswers?: Record<string, string>, feedback?: string) => void;
  onAddVocabularyWord?: (wordData: { word: string; definition: string; exampleSentence?: string; sourceTestId?: string; sourceTestTitle?: string }) => void;
  currentUser: StudentLead | null;
  onVerifyUser: (lead: StudentLead) => void;
}

export default function TestStartModal({
  test,
  onClose,
  onConfirmStart,
  onAddVocabularyWord,
  currentUser,
  onVerifyUser,
}: TestStartModalProps) {
  // Mode Selection States
  const [selectedMode, setSelectedMode] = useState<'Practice' | 'Exam'>('Practice');
  const [partsChosen, setPartsChosen] = useState<'full' | 'p1' | 'p2' | 'p3'>('full');
  const [timeLimit, setTimeLimit] = useState<'unlimited' | '60' | '30' | '20'>('60');

  // Active Simulation States
  const [isSimulating, setIsSimulating] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isTimerPaused, setIsTimerPaused] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Candidate Response Input States
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [writingEssay, setWritingEssay] = useState('');

  // Bangladeshi OTP Lead Verification States
  const [isVerifying, setIsVerifying] = useState(false);
  const [leadName, setLeadName] = useState('');
  const [leadEmail, setLeadEmail] = useState('');
  const [leadPhone, setLeadPhone] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [enteredOtp, setEnteredOtp] = useState('');
  const [otpCode, setOtpCode] = useState('5824'); // Fixed simulated verification code
  const [otpError, setOtpError] = useState<string | null>(null);
  const [isSendingSms, setIsSendingSms] = useState(false);

  // Result States (Unlocked post-verification)
  const [simulatedScore, setSimulatedScore] = useState<number | null>(null);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [reviewMode, setReviewMode] = useState(false);

  // Load questions for specific test
  const activeQuestions = test ? (MOCK_QUESTIONS_BY_TEST_ID[test.id] || []) : [];

  // Update time based on selections when starting test
  useEffect(() => {
    if (test) {
      if (selectedMode === 'Exam') {
        setTimeLimit(test.durationMinutes === 15 ? '20' : test.durationMinutes === 30 ? '30' : '60');
      } else {
        setTimeLimit('unlimited');
      }
    }
  }, [test, selectedMode]);

  useEffect(() => {
    if (test && isSimulating) {
      if (timeLimit === 'unlimited') {
        setTimeLeft(999999); // Practically unlimited
      } else {
        setTimeLeft(parseInt(timeLimit) * 60);
      }
    }
  }, [isSimulating, timeLimit]);

  // Clock Countdown Management
  useEffect(() => {
    if (isSimulating && !hasSubmitted && !isTimerPaused && timeLimit !== 'unlimited') {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            if (timerRef.current) clearInterval(timerRef.current);
            handleForceSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isSimulating, isTimerPaused, hasSubmitted, timeLimit]);

  if (!test) return null;

  // Set time limit under 5 minutes for demonstration / warning tests
  const handleWarpTime = () => {
    setTimeLimit('20');
    setTimeLeft(290); // 4 minutes 50 seconds
  };

  const isTimeCritical = timeLeft < 300 && timeLimit !== 'unlimited';

  const formatTime = (seconds: number) => {
    if (timeLimit === 'unlimited') return '∞ Unlimited';
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Begin simulator
  const handleStartSimulation = () => {
    setIsSimulating(true);
    setUserAnswers({});
    setWritingEssay('');
    setHasSubmitted(false);
    setIsVerifying(false);
    setSimulatedScore(null);
  };

  // Trigger Bangladeshi Lead Verification on submit
  const handleSubmitTestAttempt = () => {
    // If user is already verified, proceed to calculate score immediately
    if (currentUser && currentUser.verified) {
      calculateAndShowResults();
    } else {
      // Open Bangladeshi student verification form
      setIsVerifying(true);
    }
  };

  // Auto/Force submit if timer runs out
  const handleForceSubmit = () => {
    if (currentUser && currentUser.verified) {
      calculateAndShowResults();
    } else {
      setIsVerifying(true);
    }
  };

  // Send simulated SMS OTP to Bangladeshi phone number
  const handleSendSimulatedSms = () => {
    if (!leadName.trim()) {
      setOtpError('Please enter your full name first.');
      return;
    }
    if (!leadEmail.trim() || !leadEmail.includes('@')) {
      setOtpError('Please enter a valid email address.');
      return;
    }
    
    // Validate Bangladeshi phone number: starts with 013-019 / +8801 / 1
    const cleanPhone = leadPhone.replace(/[\s-]/g, '');
    const isBdNumber = /(^(\+880|880)?(1[3-9]\d{8})$)/.test(cleanPhone) || /^(01[3-9]\d{8})$/.test(cleanPhone);
    
    if (!isBdNumber) {
      setOtpError('Please enter a valid Bangladeshi mobile number (e.g. +880 1720-10300 or 0172010300)');
      return;
    }

    setOtpError(null);
    setIsSendingSms(true);

    // Simulate network delay
    setTimeout(() => {
      setIsSendingSms(false);
      setOtpSent(true);
      // Generate random 4 digit code
      const generatedCode = Math.floor(1000 + Math.random() * 9000).toString();
      setOtpCode(generatedCode);
    }, 1500);
  };

  // Confirm OTP Verification and Unlock Score
  const handleConfirmOtp = () => {
    if (enteredOtp !== otpCode) {
      setOtpError('Invalid OTP code. Please enter the correct 4-digit code sent to your phone.');
      return;
    }

    setOtpError(null);
    
    // Save verified student lead globally
    onVerifyUser({
      name: leadName,
      email: leadEmail,
      phone: leadPhone,
      verified: true
    });

    setIsVerifying(false);
    calculateAndShowResults();
  };

  // Compute realistic scores based on candidates performance
  const calculateAndShowResults = (overrideAnswers?: Record<string, string>, overrideEssay?: string) => {
    let finalScore = 6.5; // default center
    const answersToUse = overrideAnswers || userAnswers;
    const essayToUse = overrideEssay !== undefined ? overrideEssay : writingEssay;

    if (test.category === 'reading' || test.category === 'listening') {
      // Calculate based on predefined correct answers
      let correctCount = 0;
      activeQuestions.forEach(q => {
        if (answersToUse[q.id]?.toLowerCase().trim() === q.correctAnswer.toLowerCase().trim()) {
          correctCount++;
        }
      });

      // Grade scaling
      if (activeQuestions.length > 0) {
        const percentage = correctCount / activeQuestions.length;
        if (percentage === 1) finalScore = 9.0;
        else if (percentage >= 0.6) finalScore = 7.5;
        else if (percentage >= 0.3) finalScore = 6.0;
        else finalScore = 4.5;
      }
    } else if (test.category === 'writing') {
      // Calculate based on essay length
      const wordCount = essayToUse.trim() === '' ? 0 : essayToUse.trim().split(/\s+/).length;
      if (wordCount >= 250) finalScore = 8.0;
      else if (wordCount >= 150) finalScore = 6.5;
      else if (wordCount > 10) finalScore = 5.5;
      else finalScore = 4.0;
    } else if (test.category === 'speaking') {
      // Simulated speaking score
      finalScore = 7.0;
    }

    setSimulatedScore(finalScore);
    setHasSubmitted(true);
  };

  // Submit back to App state and close modal
  const handleFinalRecord = () => {
    if (simulatedScore !== null) {
      const answersMap = test.category === 'writing' ? { essay: writingEssay } : userAnswers;
      const computedFeedback = test.category === 'writing' 
        ? `Task achievement satisfies professional layout requirements. Word count reached ${writingEssay.split(/\s+/).length} words. Focus on varied cohesive structures to transition into Band 8.5.`
        : test.category === 'speaking'
        ? `Great response vocabulary. Excellent grammatical flow and minimal filled pauses detected on your heritage cue card.`
        : `Predefined answers check verified. Review wrong answer explanations to master paragraph matching and True/False/Not Given traps.`;

      onConfirmStart(test, selectedMode, simulatedScore, answersMap, computedFeedback);
      setIsSimulating(false);
      setHasSubmitted(false);
      setSimulatedScore(null);
      onClose();
    }
  };

  // Renders the diverse interactive questions
  const renderQuestionsScreen = () => {
    if (test.category === 'speaking') {
      return (
        <SpeakingPractice
          testId={test.id}
          testTitle={test.title}
          cueCardTopic={test.description || "Describe a historical building or heritage structure you visited. You should say: where it is, what it looks like, what you did there, and explain why you think it is important."}
        />
      );
    }

    if (test.category === 'writing') {
      const wordCount = writingEssay.trim() === '' ? 0 : writingEssay.trim().split(/\s+/).length;
      return (
        <div className="space-y-4 text-left">
          <div className="rounded-2xl bg-gray-50/50 p-4 border border-gray-100 flex items-start gap-2.5">
            <PenTool className="h-5 w-5 text-rose-500 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="text-xs font-bold text-gray-800">Task Prompt</h4>
              <p className="text-[11px] text-gray-500 leading-normal mt-1">
                {test.sections[0] || "Write a report or discuss the topic in at least 250 words. Support your opinion with relevant examples."}
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center text-[10px] font-bold text-gray-400 uppercase tracking-wider">
              <span>Your Essay Response</span>
              <span className={wordCount >= 250 ? 'text-emerald-600 font-extrabold' : 'text-rose-600'}>
                {wordCount} Words {wordCount < 250 && '(Target: 250+)'}
              </span>
            </div>
            <textarea
              value={writingEssay}
              onChange={(e) => setWritingEssay(e.target.value)}
              placeholder="Begin typing your IELTS response..."
              rows={8}
              className="w-full rounded-2xl border border-gray-200 bg-white p-4 text-xs text-gray-700 outline-none transition-all placeholder:text-gray-400 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 font-sans leading-relaxed shadow-sm"
            />
          </div>
        </div>
      );
    }

    // Reading & Listening interactive questionnaires
    return (
      <div className="space-y-6 text-left">
        {/* If Reading, show passages excerpt */}
        {test.category === 'reading' && (
          <div className="space-y-2 rounded-2xl border border-rose-100 bg-rose-50/10 p-4 max-h-48 overflow-y-auto">
            <h4 className="text-[10px] font-bold text-rose-700 uppercase tracking-wider flex items-center gap-1">
              <BookOpen className="h-3.5 w-3.5" />
              <span>Academic Reading Excerpt</span>
            </h4>
            <p className="text-[11px] text-gray-600 leading-relaxed font-sans">
              <strong>The Architecture of Coral Reefs:</strong> Built by tiny organisms known as coral polyps, reefs are underwater castles. Polyps secrete hard carbonate exoskeletons which support vast communities. However, ocean temperature rises of even 1.5°C disrupt the fragile symbiotic algae, leading to widespread bleaching events...
            </p>
          </div>
        )}

        {/* If Listening, show simulated player */}
        {test.category === 'listening' && (
          <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4 space-y-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-600 animate-pulse">
                <Volume2 className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-gray-800">IELTS Audio Core Track</h4>
                <p className="text-[10px] text-gray-400">Section 1 Conversation — Membership and Booking Details</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-xl bg-white p-2 border border-gray-100 shadow-sm">
              <button className="text-blue-600 hover:text-blue-700">
                <PlayCircle className="h-6 w-6" />
              </button>
              <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 animate-pulse" style={{ width: '40%' }} />
              </div>
              <span className="text-[10px] font-mono text-gray-400 font-semibold">01:05 / 03:20</span>
            </div>
          </div>
        )}

        {/* Active interactive question widgets */}
        <div className="space-y-4">
          <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Candidate Response Panel</h4>
          {activeQuestions.length === 0 ? (
            <p className="text-xs text-gray-400 italic">No custom interactive questions declared for this mock category. Click Submit to simulate completion.</p>
          ) : (
            activeQuestions.map((q, idx) => (
              <div key={q.id} className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm space-y-3">
                <span className="rounded bg-rose-50 text-rose-700 border border-rose-100 px-1.5 py-0.5 text-[9px] font-bold uppercase">
                  Question {idx + 1} • {q.type}
                </span>
                
                <p className="text-xs font-bold text-gray-800 leading-normal">{q.questionText}</p>

                {/* MCQ Widget */}
                {q.type === 'MCQ' && q.options && (
                  <div className="grid gap-2">
                    {q.options.map((opt) => {
                      const optCode = opt.charAt(0);
                      return (
                        <button
                          key={opt}
                          onClick={() => setUserAnswers(prev => ({ ...prev, [q.id]: optCode }))}
                          className={`w-full text-left p-2.5 rounded-xl text-xs font-medium border transition-all ${
                            userAnswers[q.id] === optCode
                              ? 'bg-rose-50 border-rose-500 text-rose-700 font-semibold'
                              : 'bg-white border-gray-100 text-gray-600 hover:bg-gray-50'
                          }`}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Matching Headings Widget */}
                {q.type === 'MatchingHeadings' && q.headingOptions && (
                  <div className="grid gap-2">
                    <p className="text-[10px] font-semibold text-gray-400 uppercase">Select Correct Paragraph Heading:</p>
                    {q.headingOptions.map((heading) => {
                      const headingCode = heading.split('.')[0].trim();
                      return (
                        <button
                          key={heading}
                          onClick={() => setUserAnswers(prev => ({ ...prev, [q.id]: headingCode }))}
                          className={`w-full text-left p-2 rounded-lg text-xs border transition-all ${
                            userAnswers[q.id] === headingCode
                              ? 'bg-rose-50 border-rose-500 text-rose-700 font-semibold'
                              : 'bg-white border-gray-100 text-gray-600 hover:bg-gray-50'
                          }`}
                        >
                          {heading}
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* True / False / Not Given Widget */}
                {q.type === 'TrueFalseNotGiven' && (
                  <div className="flex gap-2">
                    {['True', 'False', 'Not Given'].map((opt) => (
                      <button
                        key={opt}
                        onClick={() => setUserAnswers(prev => ({ ...prev, [q.id]: opt }))}
                        className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all ${
                          userAnswers[q.id] === opt
                            ? 'bg-rose-50 border-rose-500 text-rose-700'
                            : 'bg-white border-gray-100 text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                )}

                {/* Blanks Sentence Completion Widget */}
                {q.type === 'Blanks' && (
                  <input
                    type="text"
                    value={userAnswers[q.id] || ''}
                    onChange={(e) => setUserAnswers(prev => ({ ...prev, [q.id]: e.target.value }))}
                    placeholder="Type missing word(s)..."
                    className="w-full rounded-xl border border-gray-200 bg-gray-50/50 p-2.5 text-xs text-gray-700 outline-none transition-all focus:bg-white focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
                  />
                )}
              </div>
            ))
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-950/60 backdrop-blur-sm" id="test-start-modal-backdrop">
      {/* Modal Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-3xl border border-gray-100 bg-white p-6 shadow-2xl"
      >
        {/* Close Modal X */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 rounded-full p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
        >
          <X className="h-5 w-5" />
        </button>

        {/* STEP 1: INITIAL CHOOSE MODE PAGE */}
        {!isSimulating && !hasSubmitted && !isVerifying && (
          <div className="space-y-6">
            <div className="space-y-2 text-left">
              <span className="rounded-md bg-rose-50 border border-rose-100 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-rose-700">
                {test.category} practice hub
              </span>
              <h3 className="font-sans text-xl font-bold text-gray-900 leading-snug pr-8">
                {test.title}
              </h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                {test.description}
              </p>
            </div>

            {/* Test Specifications Info Card */}
            <div className="grid grid-cols-2 gap-3 bg-gray-50 p-4 rounded-2xl border border-gray-100">
              <div className="flex items-center gap-2.5 text-left">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-rose-500 shadow-sm">
                  <Clock className="h-4.5 w-4.5" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Timing</p>
                  <p className="text-xs font-semibold text-gray-800">{test.durationMinutes} Minutes</p>
                </div>
              </div>

              <div className="flex items-center gap-2.5 text-left">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-blue-500 shadow-sm">
                  <HelpCircle className="h-4.5 w-4.5" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Questions</p>
                  <p className="text-xs font-semibold text-gray-800">{test.questionsCount} Item Mock</p>
                </div>
              </div>
            </div>

            {/* Choose Mode Layout (Similar to OneIELTS / IELTS Online Tests) */}
            <div className="space-y-4 text-left">
              <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider">Choose a Mode</h4>
              
              <div className="grid gap-3 sm:grid-cols-2">
                {/* Practice Mode Box */}
                <button
                  type="button"
                  onClick={() => setSelectedMode('Practice')}
                  className={`flex flex-col text-left p-4 rounded-2xl border transition-all relative ${
                    selectedMode === 'Practice'
                      ? 'border-rose-500 bg-rose-50/10 shadow-sm shadow-rose-100'
                      : 'border-gray-200 bg-white hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="text-xs font-bold text-gray-900">Practice Mode</span>
                    <input 
                      type="radio" 
                      checked={selectedMode === 'Practice'} 
                      readOnly 
                      className="accent-rose-600 h-3.5 w-3.5"
                    />
                  </div>
                  <span className="text-[10px] text-gray-400 mt-1.5 leading-normal">
                    Untimed or custom timeframe. Provides instant reviews, definitions, and wrong answer explanations.
                  </span>
                </button>

                {/* Exam Simulation Box */}
                <button
                  type="button"
                  onClick={() => setSelectedMode('Exam')}
                  className={`flex flex-col text-left p-4 rounded-2xl border transition-all relative ${
                    selectedMode === 'Exam'
                      ? 'border-rose-500 bg-rose-50/10 shadow-sm shadow-rose-100'
                      : 'border-gray-200 bg-white hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="text-xs font-bold text-gray-900">Exam Simulation</span>
                    <input 
                      type="radio" 
                      checked={selectedMode === 'Exam'} 
                      readOnly 
                      className="accent-rose-600 h-3.5 w-3.5"
                    />
                  </div>
                  <span className="text-[10px] text-gray-400 mt-1.5 leading-normal">
                    Strict official IELTS timing constraints. Simulates real-world testing environment with full scorecard locks.
                  </span>
                </button>
              </div>

              {/* Dynamic Sub-options based on Mode choice */}
              {selectedMode === 'Practice' ? (
                <div className="p-4 rounded-2xl border border-gray-100 bg-gray-50/50 space-y-4 animate-in fade-in duration-200">
                  {/* Select Parts */}
                  <div className="space-y-1.5">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Choose part/task(s) to practice:</p>
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => setPartsChosen('full')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                          partsChosen === 'full' ? 'bg-rose-600 text-white border-rose-600' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        Full Section ({test.questionsCount} Qs)
                      </button>
                      <button
                        onClick={() => setPartsChosen('p1')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                          partsChosen === 'p1' ? 'bg-rose-600 text-white border-rose-600' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        Part 1
                      </button>
                      <button
                        onClick={() => setPartsChosen('p2')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                          partsChosen === 'p2' ? 'bg-rose-600 text-white border-rose-600' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        Part 2
                      </button>
                    </div>
                  </div>

                  {/* Select Time limit */}
                  <div className="space-y-1.5">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Choose a time limit:</p>
                    <div className="grid grid-cols-4 gap-2">
                      {[
                        { key: 'unlimited', label: 'Unlimited' },
                        { key: '60', label: '60 mins' },
                        { key: '30', label: '30 mins' },
                        { key: '20', label: '20 mins' },
                      ].map((t) => (
                        <button
                          key={t.key}
                          onClick={() => setTimeLimit(t.key as any)}
                          className={`py-2 rounded-xl text-xs font-semibold border transition-all ${
                            timeLimit === t.key
                              ? 'bg-rose-50 border-rose-500 text-rose-700 font-bold'
                              : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                          }`}
                        >
                          {t.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-3.5 bg-rose-50/40 rounded-xl border border-rose-100 text-[11px] text-rose-800 leading-normal flex gap-2 items-start animate-in fade-in duration-200">
                  <AlertCircle className="h-4.5 w-4.5 text-rose-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="font-bold">Standard IELTS Specifications Active:</span> Timer will run for exactly <span className="font-bold">{test.durationMinutes} minutes</span> without pauses. You are advised to simulate an authentic desk-setting.
                  </div>
                </div>
              )}
            </div>

            {/* Action buttons */}
            <div className="flex gap-3 pt-4 border-t border-gray-50">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 border border-gray-200 text-gray-500 font-bold rounded-2xl text-xs hover:bg-gray-50 transition-all active:scale-[0.98]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleStartSimulation}
                className="flex-1 py-3 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-2xl text-xs shadow-lg shadow-rose-100 transition-all active:scale-[0.98] flex items-center justify-center gap-1.5"
              >
                <Play className="h-3.5 w-3.5 fill-current" />
                <span>Begin Mock Test</span>
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: ACTIVE SIMULATION WITH DYNAMIC TESTSESSION WORKSPACE */}
        {isSimulating && !hasSubmitted && !isVerifying && (
          <TestSession
            test={test}
            timeLimit={timeLimit}
            activeQuestions={activeQuestions}
            onCancel={() => {
              setIsSimulating(false);
              onClose();
            }}
            onSubmit={(answers, essay) => {
              setUserAnswers(answers);
              setWritingEssay(essay);
              if (currentUser && currentUser.verified) {
                calculateAndShowResults(answers, essay);
              } else {
                setIsVerifying(true);
              }
            }}
            onAddVocabularyWord={onAddVocabularyWord}
          />
        )}

        {/* STEP 3: BANGLADESHI LEAD GENERATION & OTP VERIFICATION */}
        {isVerifying && (
          <div className="space-y-6 text-left">
            <div className="text-center space-y-2">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-rose-50 text-rose-600">
                <Lock className="h-6 w-6 animate-pulse" />
              </div>
              <h3 className="text-base font-bold text-gray-900">Unlock Scored Band Result</h3>
              <p className="text-xs text-gray-500 max-w-sm mx-auto leading-relaxed">
                To fulfill security lead-generation and verify student progress at <span className="font-semibold text-rose-600">IELTSmockhub.com</span>, please register your contact details.
              </p>
            </div>

            <div className="space-y-4">
              {/* Name Field */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Full Name</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                    <User className="h-4 w-4" />
                  </span>
                  <input
                    type="text"
                    required
                    value={leadName}
                    onChange={(e) => setLeadName(e.target.value)}
                    placeholder="Enter your name (e.g., Asif Rahman)..."
                    className="w-full rounded-2xl border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-xs text-gray-700 outline-none focus:border-rose-500 transition-all"
                  />
                </div>
              </div>

              {/* Email Field */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Email Address</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                    <Mail className="h-4 w-4" />
                  </span>
                  <input
                    type="email"
                    required
                    value={leadEmail}
                    onChange={(e) => setLeadEmail(e.target.value)}
                    placeholder="name@domain.com"
                    className="w-full rounded-2xl border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-xs text-gray-700 outline-none focus:border-rose-500 transition-all"
                  />
                </div>
              </div>

              {/* Bangladeshi Phone Number */}
              <div className="space-y-1">
                <div className="flex justify-between">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Bangladeshi Mobile Phone</label>
                  <span className="text-[9px] text-gray-400 font-semibold font-mono">OTP will be sent via SMS</span>
                </div>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                    <Smartphone className="h-4 w-4" />
                  </span>
                  <input
                    type="tel"
                    required
                    value={leadPhone}
                    onChange={(e) => setLeadPhone(e.target.value)}
                    placeholder="e.g. +880 1720-10300 or 0172010300"
                    className="w-full rounded-2xl border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-xs text-gray-700 outline-none focus:border-rose-500 transition-all font-mono"
                  />
                </div>
              </div>

              {/* OTP Error Banner */}
              {otpError && (
                <div className="rounded-xl bg-red-50 border border-red-100 p-3 text-xs text-red-700 flex gap-2 items-center">
                  <AlertCircle className="h-4.5 w-4.5 text-red-500 flex-shrink-0" />
                  <span>{otpError}</span>
                </div>
              )}

              {/* Simulated Notification Box for OTP */}
              {otpSent && (
                <div className="rounded-2xl bg-amber-50 border border-amber-200 p-4 space-y-2 text-xs text-amber-900 animate-bounce">
                  <div className="flex items-center gap-2">
                    <Smartphone className="h-4 w-4 text-amber-600 animate-pulse" />
                    <span className="font-bold">🔑 Simulated SMS Gateway [IELTSmockhub.com]:</span>
                  </div>
                  <p className="font-mono bg-white p-2 rounded-lg border border-amber-100 shadow-sm text-center tracking-widest text-lg font-black text-rose-600">
                    {otpCode}
                  </p>
                  <p className="text-[10px] text-amber-700 text-center">Enter this 4-digit code in the field below to verify your lead identity.</p>
                </div>
              )}

              {/* OTP Code entry field */}
              {otpSent && (
                <div className="space-y-1 text-center">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Enter Verification Code</label>
                  <input
                    type="text"
                    maxLength={4}
                    value={enteredOtp}
                    onChange={(e) => setEnteredOtp(e.target.value)}
                    placeholder="XXXX"
                    className="w-32 rounded-2xl border-2 border-rose-500 bg-white p-3 text-center text-lg font-black tracking-widest outline-none shadow-md"
                  />
                </div>
              )}

              {/* Button configurations */}
              {!otpSent ? (
                <button
                  type="button"
                  onClick={handleSendSimulatedSms}
                  disabled={isSendingSms}
                  className="w-full py-3 bg-gray-900 hover:bg-gray-800 text-white font-bold rounded-2xl text-xs transition-all flex items-center justify-center gap-2"
                >
                  {isSendingSms ? (
                    <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <span>Request Verification SMS Code</span>
                  )}
                  <ChevronRight className="h-4 w-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleConfirmOtp}
                  className="w-full py-3 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-2xl text-xs transition-all shadow-lg shadow-rose-100"
                >
                  Verify Code & Access Band Scores
                </button>
              )}
            </div>

            <button
              onClick={() => {
                setIsVerifying(false);
                setIsSimulating(false);
                onClose();
              }}
              className="w-full text-center text-[10px] font-bold text-gray-400 hover:text-gray-500 mt-2 block"
            >
              Quit Exam & Discard Temporary Results
            </button>
          </div>
        )}

        {/* STEP 4: SUBMITTED SUCCESS & DIAGNOSTIC REVIEW PANEL */}
        {hasSubmitted && simulatedScore !== null && (
          <div className="space-y-6 text-center">
            
            {/* Achieved Score Header */}
            {!reviewMode ? (
              <div className="space-y-5 py-4">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                  <CheckCircle2 className="h-8 w-8 animate-bounce" />
                </div>
                
                <div>
                  <h4 className="text-base font-bold text-gray-900">Mock Session Completed!</h4>
                  <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto leading-relaxed">
                    Congratulations <span className="font-bold text-gray-800">{currentUser?.name}</span>! Your answers for <span className="font-semibold text-gray-800">{test.title}</span> are processed.
                  </p>
                </div>

                <div className="inline-flex items-center gap-3 bg-rose-50 border border-rose-100 px-6 py-4 rounded-2xl text-left">
                  <Award className="h-8 w-8 text-rose-600 flex-shrink-0" />
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Scored Performance</p>
                    <p className="text-xl font-black text-rose-700">Band {simulatedScore.toFixed(1)}</p>
                  </div>
                </div>

                {/* General Advisor Statement */}
                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 text-xs text-gray-600 leading-relaxed max-w-md mx-auto text-left space-y-1">
                  <span className="font-bold text-gray-800 block">Lead Advisor Feedback:</span>
                  <p>
                    Excellent initiative! Since your phone <span className="font-semibold font-mono">{currentUser?.phone}</span> is verified, you are in our senior marking list. 
                    {test.category === 'writing' || test.category === 'speaking' 
                      ? ' Our academic panel will evaluate your complex grammatical phrasing and post custom examiner critiques here and on your WhatsApp within 24 hours.' 
                      : ' Direct diagnostics check is unlocked below.'}
                  </p>
                </div>

                <div className="flex flex-col gap-2.5 max-w-xs mx-auto pt-2">
                  {(test.category === 'reading' || test.category === 'listening') && (
                    <button
                      type="button"
                      onClick={() => setReviewMode(true)}
                      className="w-full py-2.5 bg-gray-900 hover:bg-gray-800 text-white font-bold rounded-xl text-xs transition-all shadow-md flex items-center justify-center gap-2"
                    >
                      <Eye className="h-4 w-4" />
                      <span>Review Explanations & Wrong Answers</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={handleFinalRecord}
                    className="w-full py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl text-xs transition-all shadow-lg"
                  >
                    Save Results & Exit to Dashboard
                  </button>
                </div>
              </div>
            ) : (
              /* THE WRONG ANSWERS EXPLANATION WORKSPACE (Review mode) */
              <div className="space-y-5 text-left animate-in slide-in-from-bottom-2 duration-300">
                <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                  <div>
                    <h4 className="text-xs font-bold text-gray-900">Diagnostics: Correct Answers & Explanations</h4>
                    <p className="text-[10px] text-gray-400 font-medium">Verify structural mistakes and reasoning</p>
                  </div>
                  <button
                    onClick={() => setReviewMode(false)}
                    className="text-xs font-semibold text-rose-600 hover:underline"
                  >
                    Back to Score
                  </button>
                </div>

                {/* Question diagnostic items */}
                <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-1">
                  {activeQuestions.map((q, idx) => {
                    const userAns = userAnswers[q.id] || 'Not Answered';
                    const isCorrect = userAns.toLowerCase().trim() === q.correctAnswer.toLowerCase().trim();

                    return (
                      <div key={q.id} className="rounded-2xl border border-gray-150 p-4 space-y-2.5 bg-gray-50/50">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold text-gray-400 uppercase">Question {idx + 1}</span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                            isCorrect ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                          }`}>
                            {isCorrect ? '✓ Correct' : '✗ Incorrect'}
                          </span>
                        </div>

                        <p className="text-xs font-bold text-gray-800 leading-normal">{q.questionText}</p>

                        <div className="grid grid-cols-2 gap-2 text-xs bg-white p-2 rounded-xl border border-gray-100">
                          <div>
                            <span className="text-[10px] font-bold text-gray-400 uppercase block">Your Answer:</span>
                            <span className={`font-semibold ${isCorrect ? 'text-emerald-600' : 'text-rose-600 line-through'}`}>{userAns}</span>
                          </div>
                          <div>
                            <span className="text-[10px] font-bold text-gray-400 uppercase block">Correct Answer:</span>
                            <span className="font-bold text-emerald-600">{q.correctAnswer}</span>
                          </div>
                        </div>

                        {/* Explanation Box */}
                        <div className="p-3 bg-emerald-50/25 rounded-xl border border-emerald-100 text-[11px] text-gray-600 leading-relaxed">
                          <span className="font-bold text-emerald-800 block mb-0.5">Academic Rationale:</span>
                          {q.explanation}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="pt-4 border-t border-gray-50">
                  <button
                    type="button"
                    onClick={handleFinalRecord}
                    className="w-full py-3 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-2xl text-xs transition-all shadow-md"
                  >
                    Back to Dashboard Overview
                  </button>
                </div>
              </div>
            )}

          </div>
        )}

      </motion.div>
    </div>
  );
}
