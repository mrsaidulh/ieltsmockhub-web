import React, { useState, useEffect, useRef } from 'react';
import { 
  X, ChevronLeft, ChevronRight, Clock, Sparkles, BookOpen, PenTool, 
  Volume2, PlayCircle, PauseCircle, Maximize2, Share2, AlertTriangle, 
  Download, Save, FileText, Check, HelpCircle, Settings, Sliders, Play, Flag, Trash2
} from 'lucide-react';
import { IELTSTest, IELTSQuestion } from '../types';
import SpeakingPractice from './SpeakingPractice';

interface TestSessionProps {
  test: IELTSTest;
  timeLimit: 'unlimited' | '60' | '30' | '20';
  activeQuestions: IELTSQuestion[];
  onCancel: () => void;
  onSubmit: (userAnswers: Record<string, string>, writingEssay: string, isTimeout: boolean) => void;
  onAddVocabularyWord?: (wordData: { word: string; definition: string; exampleSentence?: string; sourceTestId?: string; sourceTestTitle?: string }) => void;
}

export default function TestSession({
  test,
  timeLimit,
  activeQuestions,
  onCancel,
  onSubmit,
  onAddVocabularyWord,
}: TestSessionProps) {
  const totalSeconds = timeLimit === 'unlimited' ? 0 : parseInt(timeLimit) * 60;
  
  // States
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [writingEssay, setWritingEssay] = useState('');
  const [isTimerPaused, setIsTimerPaused] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(totalSeconds);
  const [activeQuestionIdx, setActiveQuestionIdx] = useState(0);
  const [textSize, setTextSize] = useState<'small' | 'medium' | 'large'>('medium');
  const [showScratchpad, setShowScratchpad] = useState(false);
  const [scratchpadText, setScratchpadText] = useState('');
  const [showSettingsDropdown, setShowSettingsDropdown] = useState(false);
  const [notificationToast, setNotificationToast] = useState<string | null>(null);

  // Advanced IELTS states
  const [highlights, setHighlights] = useState<string[]>([]);
  const [flaggedQuestions, setFlaggedQuestions] = useState<string[]>([]);
  const [selectionBox, setSelectionBox] = useState<{ x: number; y: number; text: string } | null>(null);
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  // References to keep timer accurate without resets during text updates
  const answersRef = useRef(userAnswers);
  const essayRef = useRef(writingEssay);
  const onSubmitRef = useRef(onSubmit);

  useEffect(() => {
    answersRef.current = userAnswers;
  }, [userAnswers]);

  useEffect(() => {
    essayRef.current = writingEssay;
  }, [writingEssay]);

  useEffect(() => {
    onSubmitRef.current = onSubmit;
  }, [onSubmit]);

  // Load saved progress draft from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(`ielts_draft_${test.id}`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.userAnswers) setUserAnswers(parsed.userAnswers);
        if (parsed.writingEssay) setWritingEssay(parsed.writingEssay);
        if (parsed.scratchpadText) setScratchpadText(parsed.scratchpadText);
        if (parsed.highlights) setHighlights(parsed.highlights);
        if (parsed.flaggedQuestions) setFlaggedQuestions(parsed.flaggedQuestions);
        if (parsed.secondsLeft !== undefined && timeLimit !== 'unlimited') {
          setSecondsLeft(parsed.secondsLeft);
        }
        triggerToast("Restored your saved test progress!");
      } catch (e) {
        console.error("Error parsing saved draft", e);
      }
    }
  }, [test.id]);

  // Persist draft progress after every user interaction or timer tick
  useEffect(() => {
    const draftData = {
      userAnswers,
      writingEssay,
      scratchpadText,
      highlights,
      flaggedQuestions,
      secondsLeft,
      timestamp: Date.now()
    };
    localStorage.setItem(`ielts_draft_${test.id}`, JSON.stringify(draftData));
  }, [userAnswers, writingEssay, scratchpadText, highlights, flaggedQuestions, secondsLeft, test.id]);

  // Alert before browser tab close
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = 'Your test progress is saved as a local draft, but you must submit to receive an evaluation scorecard.';
      return e.returnValue;
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  // Text selection listener for highlights
  const handleTextSelection = () => {
    const selection = window.getSelection();
    if (!selection) return;
    const text = selection.toString().trim();
    if (text.length > 2) {
      try {
        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        setSelectionBox({
          x: rect.left + window.scrollX,
          y: rect.top + window.scrollY - 45,
          text
        });
      } catch (err) {
        // Range bounding client rect can occasionally throw errors if selection changes rapidly
      }
    } else {
      setSelectionBox(null);
    }
  };

  const handleAddHighlight = (text: string) => {
    if (!text || text.trim().length === 0) return;
    if (!highlights.includes(text)) {
      setHighlights(prev => [...prev, text]);
      triggerToast("Highlighted passage section!");
    }
    setSelectionBox(null);
    window.getSelection()?.removeAllRanges();
  };

  const handleRemoveHighlight = (text: string) => {
    setHighlights(prev => prev.filter(h => h !== text));
    triggerToast("Highlight removed.");
  };

  // Auto-close toast
  useEffect(() => {
    if (notificationToast) {
      const t = setTimeout(() => setNotificationToast(null), 3000);
      return () => clearTimeout(t);
    }
  }, [notificationToast]);

  // Timer Tick-down
  useEffect(() => {
    if (timeLimit === 'unlimited') return;
    
    const interval = setInterval(() => {
      if (!isTimerPaused) {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            localStorage.removeItem(`ielts_draft_${test.id}`);
            onSubmitRef.current(answersRef.current, essayRef.current, true);
            return 0;
          }
          return prev - 1;
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isTimerPaused, timeLimit, test.id]);

  // Accelerate timer helper
  const handleAccelerateTimer = () => {
    if (timeLimit !== 'unlimited') {
      setSecondsLeft(10);
      setNotificationToast("Timer set to 10 seconds remaining for quick testing!");
    }
  };

  const isTimeCritical = timeLimit !== 'unlimited' && secondsLeft < 300; // 5 mins

  const formatTimer = (seconds: number) => {
    if (timeLimit === 'unlimited') return '∞ Unlimited';
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')} remaining`;
  };

  // Count answered questions
  const answeredCount = activeQuestions.filter(q => userAnswers[q.id]?.trim() !== '').length;

  // Jump to specific question
  const handleJumpToQuestion = (idx: number) => {
    setActiveQuestionIdx(idx);
    const element = document.getElementById(`question-container-${idx}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  // Highlight-aware text rendering helper
  const highlightText = (text: string, highlightPhrases: string[]) => {
    if (!highlightPhrases || highlightPhrases.length === 0) return <span>{text}</span>;
    const phrases = highlightPhrases.filter(p => p.trim().length > 0);
    if (phrases.length === 0) return <span>{text}</span>;

    // Escape regex characters
    const escapedPhrases = phrases.map(p => p.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'));
    escapedPhrases.sort((a, b) => b.length - a.length);

    try {
      const regex = new RegExp(`(${escapedPhrases.join('|')})`, 'gi');
      const parts = text.split(regex);
      return (
        <span>
          {parts.map((part, i) => {
            const isHighlighted = phrases.some(p => p.toLowerCase() === part.toLowerCase());
            return isHighlighted ? (
              <mark 
                key={i} 
                className="bg-yellow-200 text-gray-900 rounded-sm px-0.5 cursor-pointer hover:bg-yellow-300 transition-colors inline relative group font-sans" 
                title="Click to remove highlight"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveHighlight(part);
                }}
              >
                {part}
              </mark>
            ) : (
              <span key={i}>{part}</span>
            );
          })}
        </span>
      );
    } catch (e) {
      return <span>{text}</span>;
    }
  };

  // Helper for mock text rendering with custom paragraph structures
  const renderPassageParagraphs = () => {
    const defaultText = test.passage || `The architectural marvel of coral reefs is built on tiny organisms known as coral polyps. Polyps secrete hard carbonate exoskeletons which support vast communities. However, ocean temperature rises of even 1.5°C disrupt the fragile symbiotic algae, leading to widespread bleaching events.\n\nHistorically, reefs have weathered numerous prehistoric thermal variations. However, the modern velocity of industrial climate change bypasses the adaptation curves of slow-growing deep sea reef builders. Immediate artificial shading, heat-resistant strain seeding, and localized carbon removal represent modern mitigation strategies.`;
    
    const paragraphs = defaultText.split(/\n\s*\n/);
    
    return paragraphs.map((para, pIdx) => {
      const letterLabel = String.fromCharCode(65 + pIdx); // A, B, C, D...
      return (
        <div key={pIdx} className="flex gap-4 items-start text-left mb-5">
          <span className="font-mono text-xs font-extrabold text-rose-500 bg-rose-50 px-2 py-1 rounded-md mt-0.5" title={`Paragraph ${letterLabel}`}>
            {letterLabel}
          </span>
          <p className="text-gray-700 leading-relaxed font-sans">
            {highlightText(para, highlights)}
          </p>
        </div>
      );
    });
  };

  // Get image background/Unsplash based on category/title
  const getPassageImage = () => {
    if (test.title.toLowerCase().includes('coral')) {
      return 'https://images.unsplash.com/photo-1546026423-cc4642628d2b?w=800&auto=format&fit=crop&q=80';
    }
    if (test.title.toLowerCase().includes('cognitive') || test.title.toLowerCase().includes('psychology')) {
      return 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=800&auto=format&fit=crop&q=80';
    }
    return 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&auto=format&fit=crop&q=80';
  };

  // Toast notifier
  const triggerToast = (msg: string) => {
    setNotificationToast(msg);
  };

  return (
    <div className="fixed inset-0 z-50 bg-gray-50 flex flex-col h-screen w-screen overflow-hidden font-sans select-none" id="ielts-exam-session-full">
      
      {/* 1. TOP HEADER (COMPACT & HIGH FIDELITY) */}
      <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-4 sm:px-6 z-10 shadow-xs shrink-0">
        
        {/* Brand & Test Title */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={() => setShowExitConfirm(true)}
            className="p-1 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-rose-600 transition-colors cursor-pointer"
            title="Exit and return"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-tr from-rose-500 to-pink-600 text-white shadow-xs">
            <BookOpen className="h-4 w-4" />
          </div>
          <div className="flex flex-col text-left">
            <div className="flex items-center gap-2">
              <span className="font-bold text-gray-900 text-xs sm:text-sm tracking-tight">IELTS Mock Hub</span>
              <span className="text-[9px] font-extrabold uppercase bg-rose-50 border border-rose-100 text-rose-600 px-1.5 py-0.2 rounded">
                Practice Session
              </span>
            </div>
            <span className="text-[10px] text-gray-400 font-semibold truncate max-w-[150px] sm:max-w-xs" title={test.title}>
              {test.title}
            </span>
          </div>
        </div>

        {/* Center Space is kept empty to keep controls cleanly aligned on the right */}
        <div className="hidden md:block flex-1" />

        {/* Right Section: Core Action Buttons with Countdown Timer placed in the top-right corner */}
        <div className="flex items-center gap-2 sm:gap-3 relative">
          
          {/* PERSISTENT COUNTDOWN TIMER (TOP-RIGHT CORNER) */}
          <div className="flex items-center gap-1.5">
            {timeLimit !== 'unlimited' && (
              <button
                onClick={() => setIsTimerPaused(!isTimerPaused)}
                className="p-1 rounded-full text-gray-400 hover:bg-gray-100 hover:text-rose-600 transition-colors cursor-pointer"
                title={isTimerPaused ? "Resume test" : "Pause test"}
              >
                {isTimerPaused ? <Play className="h-3.5 w-3.5 fill-rose-600 text-rose-600" /> : <PauseCircle className="h-4.5 w-4.5" />}
              </button>
            )}

            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-bold tracking-tight font-mono transition-all ${
              isTimeCritical 
                ? 'bg-red-50 text-red-600 border-red-200 animate-pulse' 
                : 'bg-rose-50/50 text-rose-700 border-rose-100/70'
            }`}>
              <Clock className={`h-3.5 w-3.5 ${isTimeCritical ? 'text-red-500 animate-bounce' : 'text-rose-500'}`} />
              <span>{formatTimer(secondsLeft)}</span>
              {isTimerPaused && <span className="text-[9px] font-extrabold text-amber-600 uppercase tracking-wider ml-1">Paused</span>}
            </div>
          </div>

          {/* Scratchpad Trigger */}
          <button
            onClick={() => setShowScratchpad(!showScratchpad)}
            className={`flex items-center gap-1 text-[11px] font-bold px-2.5 py-1.5 rounded-lg border transition-all cursor-pointer ${
              showScratchpad 
                ? 'bg-gray-900 border-gray-900 text-white' 
                : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            <FileText className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Scratchpad</span>
          </button>

          {/* More Settings Menu */}
          <div className="relative">
            <button
              onClick={() => setShowSettingsDropdown(!showSettingsDropdown)}
              className={`p-1.5 rounded-lg border text-gray-500 hover:bg-gray-50 transition-colors cursor-pointer ${
                showSettingsDropdown ? 'bg-gray-100 border-gray-300' : 'bg-white border-gray-200'
              }`}
              title="More Test Options"
            >
              <Sliders className="h-4 w-4" />
            </button>

            {showSettingsDropdown && (
              <>
                <div 
                  className="fixed inset-0 z-20" 
                  onClick={() => setShowSettingsDropdown(false)} 
                />
                <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-xl shadow-xl py-2 z-30 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="px-3 py-1.5 border-b border-gray-100 mb-1">
                    <span className="text-[9px] font-extrabold uppercase text-gray-400 tracking-wider">Configure Workspace</span>
                  </div>

                  <button
                    onClick={() => {
                      triggerToast("Test sharing link copied to clipboard!");
                      setShowSettingsDropdown(false);
                    }}
                    className="w-full text-left px-3.5 py-2 text-xs text-gray-600 hover:bg-rose-50 hover:text-rose-700 transition-colors flex items-center gap-2 cursor-pointer"
                  >
                    <Share2 className="h-3.5 w-3.5 text-gray-400" />
                    <span>Share Test</span>
                  </button>

                  <button
                    onClick={() => {
                      triggerToast("Error report submitted to administrators.");
                      setShowSettingsDropdown(false);
                    }}
                    className="w-full text-left px-3.5 py-2 text-xs text-gray-600 hover:bg-rose-50 hover:text-rose-700 transition-colors flex items-center gap-2 cursor-pointer"
                  >
                    <AlertTriangle className="h-3.5 w-3.5 text-gray-400" />
                    <span>Report Mistake</span>
                  </button>

                  {/* Text Size options in settings */}
                  <div className="px-3.5 py-2 border-y border-gray-100 my-1 space-y-1.5 bg-gray-50/50">
                    <span className="text-[9px] font-bold text-gray-400 uppercase">Passage Text Size:</span>
                    <div className="flex gap-1">
                      {(['small', 'medium', 'large'] as const).map((sz) => (
                        <button
                          key={sz}
                          onClick={() => setTextSize(sz)}
                          className={`flex-1 py-1 rounded-md text-[10px] font-extrabold uppercase border transition-all cursor-pointer ${
                            textSize === sz 
                              ? 'bg-rose-600 border-rose-600 text-white' 
                              : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'
                          }`}
                        >
                          {sz.slice(0, 3)}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      triggerToast("Answers guide toggled. Correct solutions highlighted.");
                      setShowSettingsDropdown(false);
                    }}
                    className="w-full text-left px-3.5 py-2 text-xs text-gray-600 hover:bg-rose-50 hover:text-rose-700 transition-colors flex items-center gap-2 cursor-pointer"
                  >
                    <HelpCircle className="h-3.5 w-3.5 text-gray-400" />
                    <span>View Hint / Solution</span>
                  </button>

                  <button
                    onClick={() => {
                      triggerToast("Downloading simulated IELTS PDF Package...");
                      setShowSettingsDropdown(false);
                    }}
                    className="w-full text-left px-3.5 py-2 text-xs text-gray-600 hover:bg-rose-50 hover:text-rose-700 transition-colors flex items-center gap-2 cursor-pointer"
                  >
                    <Download className="h-3.5 w-3.5 text-gray-400" />
                    <span>Download Materials</span>
                  </button>

                  <button
                    onClick={() => {
                      triggerToast("Practice progress backup saved locally.");
                      setShowSettingsDropdown(false);
                    }}
                    className="w-full text-left px-3.5 py-2 text-xs text-gray-600 hover:bg-rose-50 hover:text-rose-700 transition-colors flex items-center gap-2 cursor-pointer"
                  >
                    <Save className="h-3.5 w-3.5 text-gray-400" />
                    <span>Save Draft Progress</span>
                  </button>

                  {/* Quick developer demo button */}
                  {timeLimit !== 'unlimited' && secondsLeft > 15 && (
                    <button
                      onClick={() => {
                        handleAccelerateTimer();
                        setShowSettingsDropdown(false);
                      }}
                      className="w-full text-left px-3.5 py-2 text-xs text-amber-700 hover:bg-amber-50 transition-colors flex items-center gap-2 cursor-pointer border-t border-dashed border-gray-200 font-semibold"
                    >
                      <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                      <span>Warp to 10s Remaining</span>
                    </button>
                  )}

                  <button
                    onClick={() => {
                      setShowSettingsDropdown(false);
                      setShowExitConfirm(true);
                    }}
                    className="w-full text-left px-3.5 py-2 text-xs text-rose-600 hover:bg-rose-50 hover:text-rose-700 transition-colors flex items-center gap-2 cursor-pointer font-bold border-t border-gray-100"
                  >
                    <X className="h-3.5 w-3.5 text-rose-500" />
                    <span>Exit Test Hub</span>
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Solid Green Submit Button */}
          <button
            onClick={() => {
              localStorage.removeItem(`ielts_draft_${test.id}`);
              onSubmit(userAnswers, writingEssay, false);
            }}
            className="flex items-center gap-1.5 py-2 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-xs transition-all active:scale-98 cursor-pointer font-sans"
            title="Complete mock test & view verified scorecard results"
          >
            <Check className="h-3.5 w-3.5" />
            <span>Submit</span>
          </button>

        </div>
      </header>

      {/* 2. SPLIT INTERFACE PANEL MAIN BODY */}
      <main className="flex-1 flex overflow-hidden relative">
        
        {/* Toast notifications container */}
        {notificationToast && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-gray-900 text-white font-semibold text-xs py-2 px-4 rounded-xl shadow-2xl z-40 flex items-center gap-2 animate-bounce">
            <Sparkles className="h-3.5 w-3.5 text-yellow-400 animate-pulse" />
            <span>{notificationToast}</span>
          </div>
        )}

        {test.category === 'speaking' ? (
          /* Speaking full screen layout */
          <div className="flex-1 overflow-y-auto p-6 flex flex-col items-center justify-center max-w-4xl mx-auto">
            <SpeakingPractice
              testId={test.id}
              testTitle={test.title}
              cueCardTopic={test.description || "Describe a historical building or heritage structure you visited."}
            />
          </div>
        ) : test.category === 'writing' ? (
          /* Writing split screen layout */
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 h-full overflow-hidden">
            {/* Left Prompt Pane */}
            <div className="border-r border-gray-200 bg-white p-6 overflow-y-auto flex flex-col text-left">
              <span className="self-start text-[9px] font-extrabold uppercase text-rose-600 bg-rose-50 px-2.5 py-1 rounded-md mb-3 border border-rose-100">
                Writing Task Guidelines
              </span>
              <h2 className="text-lg font-bold text-gray-900 mb-2 leading-snug">{test.title}</h2>
              <p className="text-xs text-gray-500 leading-normal mb-5">{test.description}</p>

              <div className="rounded-2xl border border-gray-150 bg-gray-50 p-5 space-y-4 shadow-xs">
                <div className="flex items-center gap-2">
                  <PenTool className="h-5 w-5 text-rose-500 flex-shrink-0" />
                  <span className="text-xs font-extrabold text-gray-700 uppercase">Official Instructions</span>
                </div>
                <div className="text-xs text-gray-600 leading-relaxed space-y-3 font-sans">
                  {test.sections.map((section, sIdx) => (
                    <p key={sIdx} className="bg-white p-3 rounded-xl border border-gray-100 shadow-2xs font-medium">
                      {section}
                    </p>
                  ))}
                </div>
              </div>

              {/* Tips */}
              <div className="mt-auto pt-6 border-t border-gray-100">
                <span className="text-[10px] font-bold text-rose-600 uppercase block mb-1">💡 Preparation Checklist:</span>
                <ul className="text-[10px] text-gray-500 leading-normal space-y-1 list-disc list-inside">
                  <li>Structure your essay with an Introduction, 2 Body Paragraphs, and Conclusion.</li>
                  <li>Use high-level transition vocabularies to establish cohesion (e.g. Furthermore, Consequently).</li>
                  <li>Fulfill the word count requirement (minimum 250 words).</li>
                </ul>
              </div>
            </div>

            {/* Right Editor Pane */}
            <div className="bg-gray-50 p-6 overflow-y-auto flex flex-col">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-extrabold uppercase text-gray-400 tracking-wider">Candidate Response Workspace</span>
                <span className={`text-xs font-bold font-mono px-3 py-1 rounded-full border ${
                  writingEssay.trim().split(/\s+/).filter(Boolean).length >= 250
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-rose-50 text-rose-600 border-rose-150'
                }`}>
                  {writingEssay.trim().split(/\s+/).filter(Boolean).length} Words {writingEssay.trim().split(/\s+/).filter(Boolean).length < 250 && '/ 250 Min Target'}
                </span>
              </div>
              <textarea
                value={writingEssay}
                onChange={(e) => setWritingEssay(e.target.value)}
                placeholder="Begin writing your academic essay response here. IELTS Mock Hub will perform real-time counts, grammars checklist, and band projection checks on submit..."
                className="flex-1 w-full rounded-2xl border border-gray-200 bg-white p-5 text-xs text-gray-800 outline-none transition-all placeholder:text-gray-400 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 shadow-inner font-sans leading-relaxed resize-none overflow-y-auto"
              />
            </div>
          </div>
        ) : (
          /* Reading & Listening Split Screens */
          <div className="flex-1 grid grid-cols-1 md:grid-cols-12 h-full overflow-hidden">
            
            {/* LEFT COLUMN: SOURCE DATA (Passage / Audio Script) - 5 Cols */}
            <div className="md:col-span-5 border-r border-gray-200 bg-white overflow-y-auto flex flex-col">
              
              {/* Passage Banner Picture (IELTS portal touch) */}
              <div className="relative h-44 w-full shrink-0">
                <img 
                  src={getPassageImage()} 
                  alt="Reading Passage Concept" 
                  className="h-full w-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-950/80 via-gray-950/20 to-transparent" />
                <div className="absolute bottom-4 left-4 text-left">
                  <span className="text-[9px] font-extrabold uppercase bg-rose-600 text-white px-2 py-0.5 rounded-md tracking-wider">
                    Part 2
                  </span>
                  <h3 className="text-white text-base font-extrabold mt-1 tracking-tight drop-shadow-sm font-sans uppercase">
                    Reading Passage 2
                  </h3>
                </div>
              </div>

              {/* Section Instruction / Passage content */}
              <div className="p-5 flex-1 flex flex-col text-left">
                
                {/* Simulated Spec header box */}
                <div className="bg-rose-50/20 border border-rose-100 rounded-xl p-4.5 mb-5 space-y-1">
                  <span className="text-[10px] font-extrabold text-rose-700 uppercase tracking-widest flex items-center gap-1">
                    <BookOpen className="h-3.5 w-3.5" />
                    <span>Academic Reading Module</span>
                  </span>
                  <p className="text-xs text-gray-600 leading-normal font-sans">
                    You should spend about 20 minutes on Questions 1 to {activeQuestions.length} which are based on the reading passage below.
                  </p>
                </div>

                {/* Interactive Vocabulary term lookup drawer */}
                {onAddVocabularyWord && (
                  <div className="border border-dashed border-gray-200 rounded-xl p-3 bg-gray-50/50 mb-5 text-left flex flex-col gap-2">
                    <span className="text-[9px] font-bold uppercase text-gray-400 tracking-wider flex items-center gap-1">
                      <Sparkles className="h-3 w-3 text-rose-500" />
                      <span>Vocabulary Term Assistant (Interactive Lookup)</span>
                    </span>
                    <div className="flex gap-1.5">
                      <input 
                        type="text" 
                        id="fullscreen-vocab-term-input"
                        placeholder="Double-click words in text or type terms to save..."
                        className="flex-1 bg-white border border-gray-200 rounded-lg text-[11px] px-2.5 py-1.5 outline-none focus:border-rose-500"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            const input = e.currentTarget;
                            if (input.value.trim()) {
                              onAddVocabularyWord({
                                word: input.value.trim(),
                                definition: `Looked up during full-screen mock test: ${test.title}`,
                                sourceTestId: test.id,
                                sourceTestTitle: test.title
                              });
                              triggerToast(`"${input.value.trim()}" added to your vocabulary revision book!`);
                              input.value = '';
                            }
                          }
                        }}
                      />
                      <button
                        onClick={() => {
                          const input = document.getElementById('fullscreen-vocab-term-input') as HTMLInputElement;
                          if (input && input.value.trim()) {
                            onAddVocabularyWord({
                              word: input.value.trim(),
                              definition: `Looked up during full-screen mock test: ${test.title}`,
                              sourceTestId: test.id,
                              sourceTestTitle: test.title
                            });
                            triggerToast(`"${input.value.trim()}" added to your vocab database!`);
                            input.value = '';
                          }
                        }}
                        className="bg-gray-900 text-white font-bold text-[10px] px-3 py-1.5 rounded-lg hover:bg-gray-800 transition-colors cursor-pointer"
                      >
                        Save
                      </button>
                    </div>
                  </div>
                )}

                {/* LISTENING SPECIFIC AUDIO CORE */}
                {test.category === 'listening' && (
                  <div className="rounded-2xl border border-blue-100 bg-blue-50/10 p-4 mb-5 space-y-3 text-left shadow-xs">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
                        <Volume2 className="h-4.5 w-4.5 animate-pulse" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-gray-800">IELTS Listening Sound Track</h4>
                        <p className="text-[10px] text-gray-400 font-medium">Please play the sound feed to answer the questions in the right panel.</p>
                      </div>
                    </div>
                    {test.audioUrl ? (
                      <div className="rounded-xl bg-white p-3 border border-gray-100 shadow-2xs flex flex-col gap-2">
                        <audio 
                          src={test.audioUrl} 
                          controls 
                          className="w-full text-xs h-9 accent-rose-600 rounded-lg outline-none"
                        />
                      </div>
                    ) : (
                      <div className="flex items-center gap-3 rounded-xl bg-white p-2 border border-gray-100 shadow-2xs">
                        <button type="button" className="text-blue-600 hover:text-blue-700 p-1 rounded-full hover:bg-blue-50">
                          <PlayCircle className="h-6 w-6" />
                        </button>
                        <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full bg-blue-500" style={{ width: '60%' }} />
                        </div>
                        <span className="text-[10px] font-mono text-gray-400 font-semibold pr-1">02:14 / 04:30</span>
                      </div>
                    )}
                  </div>
                )}

                {/* THE PASSAGE BODY */}
                <article 
                  className={`border-t border-gray-100 pt-5 pr-1 ${
                    textSize === 'small' 
                      ? 'text-xs leading-relaxed' 
                      : textSize === 'medium' 
                      ? 'text-sm leading-relaxed' 
                      : 'text-base leading-relaxed'
                  }`}
                  id="passage-article-text"
                >
                  {renderPassageParagraphs()}
                </article>

              </div>
            </div>

            {/* SEPARATOR DRAG INDICATOR (AUTHENTIC SIMULATION PORTAL LOOK) */}
            <div className="hidden md:flex flex-col items-center justify-center relative w-[1px] bg-gray-200 z-10">
              <div className="absolute flex flex-col gap-1 items-center justify-center h-10 w-6 bg-white border border-gray-200 text-gray-400 rounded-md shadow-xs hover:border-rose-400 hover:text-rose-500 transition-all cursor-ew-resize">
                <span className="text-[8px] font-bold uppercase tracking-widest leading-none">&lt;</span>
                <span className="text-[8px] font-bold uppercase tracking-widest leading-none">&gt;</span>
              </div>
            </div>

            {/* RIGHT COLUMN: INTERACTIVE QUESTION VIEWER & INPUTS - 7 Cols */}
            <div className="md:col-span-7 bg-gray-50 overflow-y-auto flex flex-col p-5 sm:p-6 text-left">
              
              {/* Heading Panel */}
              <div className="flex items-center justify-between border-b border-gray-200 pb-3 mb-5">
                <span className="text-[10px] font-extrabold uppercase text-gray-400 tracking-wider">Candidate Response Panel</span>
                <span className="text-[10px] text-gray-500 font-semibold bg-white border border-gray-200 px-2.5 py-1 rounded-lg shadow-2xs">
                  {answeredCount} of {activeQuestions.length} Completed
                </span>
              </div>

              {/* Questions Stack */}
              <div className="space-y-6 flex-1 pb-12">
                {activeQuestions.length === 0 ? (
                  <div className="bg-white rounded-2xl p-8 text-center border border-gray-150 shadow-xs">
                    <p className="text-xs text-gray-400 italic">No questions defined for this mock session. Submit response to check scorecard completion.</p>
                  </div>
                ) : (
                  activeQuestions.map((q, idx) => {
                    const isActive = idx === activeQuestionIdx;
                    const hasAnswer = userAnswers[q.id] && userAnswers[q.id].trim() !== '';

                    return (
                      <div 
                        key={q.id} 
                        id={`question-container-${idx}`}
                        onClick={() => setActiveQuestionIdx(idx)}
                        className={`rounded-2xl border bg-white p-5 shadow-xs transition-all relative cursor-pointer ${
                          isActive 
                            ? 'border-rose-500 shadow-md ring-1 ring-rose-500/20' 
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        {/* Top-Right Controls: Active indicator & Flag button */}
                        <div className="absolute top-4 right-4 flex items-center gap-2">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              const isFlagged = flaggedQuestions.includes(q.id);
                              if (isFlagged) {
                                setFlaggedQuestions(prev => prev.filter(id => id !== q.id));
                                triggerToast(`Removed flag from Question ${idx + 1}`);
                              } else {
                                setFlaggedQuestions(prev => [...prev, q.id]);
                                triggerToast(`Flagged Question ${idx + 1} for review`);
                              }
                            }}
                            className={`p-1.5 rounded-lg border text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                              flaggedQuestions.includes(q.id)
                                ? 'bg-amber-100 border-amber-300 text-amber-800'
                                : 'bg-gray-50 border-gray-200 text-gray-400 hover:bg-gray-100'
                            }`}
                            title="Flag this question for review"
                          >
                            <Flag className={`h-3 w-3 ${flaggedQuestions.includes(q.id) ? 'fill-amber-500 text-amber-500 font-bold' : ''}`} />
                            <span className="text-[10px] hidden sm:inline">{flaggedQuestions.includes(q.id) ? 'Flagged' : 'Flag for review'}</span>
                          </button>

                          {isActive && (
                            <div className="flex items-center gap-1 bg-rose-50 text-rose-600 px-2 py-1 rounded-lg text-[9px] font-extrabold uppercase tracking-wide border border-rose-100">
                              <span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-ping" />
                              Active Focus
                            </div>
                          )}
                        </div>

                        {/* Top Question Tag */}
                        <div className="flex items-center gap-2 mb-3">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold uppercase tracking-wide border ${
                            hasAnswer 
                              ? 'bg-emerald-50 border-emerald-100 text-emerald-700' 
                              : 'bg-rose-50 border-rose-100 text-rose-700'
                          }`}>
                            Question {idx + 1}
                          </span>
                          <span className="text-[9px] font-bold text-gray-400 uppercase">
                            • {q.type === 'MCQ' ? 'Multiple Choice' : q.type === 'MatchingHeadings' ? 'Matching Heading' : q.type === 'TrueFalseNotGiven' ? 'True/False/Not Given' : 'Fill in the blanks'}
                          </span>
                        </div>
                        
                        {/* Question core text */}
                        <h4 className="text-xs sm:text-sm font-bold text-gray-800 leading-snug mb-4">
                          {q.questionText}
                        </h4>

                        {/* MCQ WIDGET */}
                        {q.type === 'MCQ' && q.options && (
                          <div className="grid gap-2.5">
                            {q.options.map((opt) => {
                              const optCode = opt.charAt(0); // A, B, C, D
                              const isSelected = userAnswers[q.id] === optCode;

                              return (
                                <button
                                  key={opt}
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setUserAnswers(prev => ({ ...prev, [q.id]: optCode }));
                                  }}
                                  className={`w-full text-left p-3 rounded-xl text-xs border transition-all flex items-center gap-3.5 cursor-pointer ${
                                    isSelected
                                      ? 'bg-rose-50/70 border-rose-400 text-rose-900 font-semibold shadow-2xs'
                                      : 'bg-white border-gray-100 text-gray-600 hover:bg-gray-50/70 hover:border-gray-300'
                                  }`}
                                >
                                  {/* Letter Circle */}
                                  <div className={`h-6 w-6 shrink-0 rounded-full border flex items-center justify-center font-bold text-xs transition-colors ${
                                    isSelected
                                      ? 'bg-rose-600 border-rose-600 text-white shadow-xs'
                                      : 'bg-gray-50 border-gray-200 text-gray-500'
                                  }`}>
                                    {optCode}
                                  </div>
                                  <span className="leading-tight">{opt.slice(3)}</span>
                                </button>
                              );
                            })}
                          </div>
                        )}

                        {/* MATCHING HEADINGS WIDGET */}
                        {q.type === 'MatchingHeadings' && q.headingOptions && (
                          <div className="space-y-2 text-left">
                            <span className="text-[9px] font-bold text-gray-400 uppercase block tracking-wider mb-1">Select paragraph heading:</span>
                            <div className="grid gap-2">
                              {q.headingOptions.map((heading) => {
                                const headingCode = heading.split('.')[0].trim(); // i, ii, iii
                                const isSelected = userAnswers[q.id] === headingCode;

                                return (
                                  <button
                                    key={heading}
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setUserAnswers(prev => ({ ...prev, [q.id]: headingCode }));
                                    }}
                                    className={`w-full text-left p-2.5 rounded-xl text-xs border transition-all flex items-center justify-between cursor-pointer ${
                                      isSelected
                                        ? 'bg-rose-50 border-rose-400 text-rose-800 font-bold'
                                        : 'bg-white border-gray-150 text-gray-600 hover:bg-gray-50'
                                    }`}
                                  >
                                    <span>{heading}</span>
                                    <div className={`h-4.5 w-4.5 rounded-full border flex items-center justify-center ${
                                      isSelected ? 'bg-rose-600 border-rose-600 text-white' : 'border-gray-200 bg-gray-50'
                                    }`}>
                                      {isSelected && <Check className="h-2.5 w-2.5 stroke-[3]" />}
                                    </div>
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {/* TRUE / FALSE / NOT GIVEN WIDGET */}
                        {q.type === 'TrueFalseNotGiven' && (
                          <div className="grid grid-cols-3 gap-2.5">
                            {['True', 'False', 'Not Given'].map((opt) => {
                              const isSelected = userAnswers[q.id] === opt;
                              return (
                                <button
                                  key={opt}
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setUserAnswers(prev => ({ ...prev, [q.id]: opt }));
                                  }}
                                  className={`py-2.5 rounded-xl text-xs font-bold border transition-all text-center cursor-pointer ${
                                    isSelected
                                      ? 'bg-rose-600 border-rose-600 text-white shadow-md'
                                      : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-100'
                                  }`}
                                >
                                  {opt}
                                </button>
                              );
                            })}
                          </div>
                        )}

                        {/* BLANKS / SENTENCE COMPLETION WIDGET */}
                        {q.type === 'Blanks' && (
                          <div className="space-y-1.5 text-left">
                            <span className="text-[9px] font-bold text-gray-400 uppercase block tracking-wider">Candidate Response Input:</span>
                            <div className="relative">
                              <input
                                type="text"
                                value={userAnswers[q.id] || ''}
                                onChange={(e) => setUserAnswers(prev => ({ ...prev, [q.id]: e.target.value }))}
                                onClick={(e) => e.stopPropagation()}
                                placeholder="Type missing word(s)..."
                                className="w-full rounded-xl border border-gray-200 bg-gray-50/50 p-3 pr-10 text-xs text-gray-800 outline-none transition-all focus:bg-white focus:border-rose-500 focus:ring-1 focus:ring-rose-500 shadow-inner font-mono font-bold"
                              />
                              {hasAnswer && (
                                <span className="absolute inset-y-0 right-3 flex items-center text-emerald-500">
                                  <Check className="h-4 w-4 stroke-[3]" />
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>

          </div>
        )}

        {/* 3. FLOATING SIDEBAR FOR SCRATCHPAD (NOTEPAD DRAWER) */}
        {showScratchpad && (
          <div className="absolute md:relative inset-y-0 right-0 w-80 bg-white border-l border-gray-200 shadow-2xl z-20 flex flex-col text-left">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-gray-50">
              <div className="flex items-center gap-1.5">
                <FileText className="h-4.5 w-4.5 text-gray-700" />
                <span className="text-xs font-extrabold text-gray-800 uppercase tracking-wide">Scratchpad / Drafts</span>
              </div>
              <button 
                onClick={() => setShowScratchpad(false)}
                className="p-1 rounded-full hover:bg-gray-200 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            
            <div className="p-3.5 bg-rose-50/30 border-b border-rose-100 text-[10px] text-rose-800 leading-normal font-sans">
              <strong>Draft Workspace:</strong> Type temporary drafts or write notes here while studying the passage. Text typed here is for scratchpad references and is not evaluated as final test answers.
            </div>

            <textarea
              value={scratchpadText}
              onChange={(e) => setSecondsLeft && setScratchpadText(e.target.value)}
              placeholder="Paste passage fragments or write notes here..."
              className="flex-1 p-4 text-xs font-mono text-gray-700 outline-none resize-none leading-relaxed overflow-y-auto placeholder:text-gray-300"
            />
          </div>
        )}

      </main>

      {/* 4. BOTTOM NAVIGATION & PROGRESS BAR */}
      <footer className="h-14 bg-white border-t border-gray-200 flex items-center justify-between px-4 sm:px-6 shrink-0 z-10 shadow-inner">
        
        {/* Left Side: answered count & visual indicator legend */}
        <div className="hidden lg:flex items-center gap-4">
          <div className="bg-gray-50 text-gray-700 font-extrabold text-[11px] px-3 py-1.5 rounded-lg border border-gray-200">
            Passage Progress: <span className="text-rose-600">{answeredCount}</span> of {activeQuestions.length} Answered
          </div>

          {/* Color Indicators Legend */}
          <div className="flex items-center gap-3 text-[10px] font-bold text-gray-500 font-sans">
            <div className="flex items-center gap-1">
              <span className="h-3 w-3 rounded bg-emerald-600 inline-block" />
              <span>Answered</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="h-3 w-3 rounded bg-amber-500 inline-block" />
              <span>For Review</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="h-3 w-3 rounded bg-white border border-gray-200 inline-block" />
              <span>Incomplete</span>
            </div>
          </div>
        </div>

        {/* Center: Question Navigation Squares with color coding */}
        <div className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 overflow-x-auto px-2">
          {activeQuestions.length > 0 && (
            <div className="flex items-center gap-1.5">
              {/* Previous button */}
              <button
                type="button"
                onClick={() => handleJumpToQuestion(Math.max(0, activeQuestionIdx - 1))}
                disabled={activeQuestionIdx === 0}
                className="h-8 w-8 rounded-full border border-gray-200 bg-white hover:bg-gray-50 text-gray-500 disabled:opacity-40 flex items-center justify-center cursor-pointer transition-colors"
                title="Previous Question"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              {/* Individual Circles with state colors */}
              <div className="flex items-center gap-1.5">
                {activeQuestions.map((q, idx) => {
                  const isActive = idx === activeQuestionIdx;
                  const isFlagged = flaggedQuestions.includes(q.id);
                  const hasAnswer = userAnswers[q.id] && userAnswers[q.id].trim() !== '';

                  let btnStyle = 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50';
                  if (isFlagged) {
                    btnStyle = 'bg-amber-500 border-amber-500 text-white hover:bg-amber-600';
                  } else if (hasAnswer) {
                    btnStyle = 'bg-emerald-600 border-emerald-600 text-white hover:bg-emerald-700';
                  }

                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleJumpToQuestion(idx)}
                      className={`h-8 min-w-[32px] px-2 rounded-lg text-xs font-extrabold flex items-center justify-center border transition-all cursor-pointer relative ${btnStyle} ${
                        isActive
                          ? 'ring-2 ring-rose-500 ring-offset-2 scale-105'
                          : ''
                      }`}
                      title={`Go to Question ${idx + 1}${isFlagged ? ' (Flagged for Review)' : hasAnswer ? ' (Answered)' : ' (Incomplete)'}`}
                    >
                      {idx + 1}
                      {isFlagged && (
                        <span className="absolute -top-1 -right-1 flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Next button */}
              <button
                type="button"
                onClick={() => handleJumpToQuestion(Math.min(activeQuestions.length - 1, activeQuestionIdx + 1))}
                disabled={activeQuestionIdx === activeQuestions.length - 1}
                className="h-8 w-8 rounded-full border border-gray-200 bg-white hover:bg-gray-50 text-gray-500 disabled:opacity-40 flex items-center justify-center cursor-pointer transition-colors"
                title="Next Question"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>

        {/* Right Side: Quick Action review indicator */}
        <div className="hidden md:block">
          <span className="text-[10px] font-mono font-bold uppercase text-gray-400 bg-gray-50 px-2.5 py-1 rounded-lg border border-gray-200">
            IELTS SECURE SHIELD ACTIVE
          </span>
        </div>

      </footer>

      {/* FLOATING TEXT SELECTION HIGHLIGHT TOOLTIP */}
      {selectionBox && (
        <div 
          className="fixed z-50 bg-gray-950 text-white text-[11px] font-bold px-3 py-2 rounded-xl shadow-2xl border border-gray-800 flex items-center gap-2.5 animate-in fade-in zoom-in-95 duration-150"
          style={{ 
            top: `${Math.max(10, selectionBox.y - window.scrollY)}px`, 
            left: `${Math.max(10, selectionBox.x - window.scrollX)}px` 
          }}
        >
          <span className="text-gray-400 max-w-[120px] truncate">"{selectionBox.text}"</span>
          <button
            onClick={() => handleAddHighlight(selectionBox.text)}
            className="bg-yellow-400 hover:bg-yellow-300 text-gray-950 font-extrabold px-2.5 py-1 rounded-lg text-[10px] cursor-pointer flex items-center gap-1 transition-all"
          >
            Highlight
          </button>
          <button
            onClick={() => {
              setSelectionBox(null);
              window.getSelection()?.removeAllRanges();
            }}
            className="text-gray-400 hover:text-white text-[10px] px-1.5 cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* EXIT CONFIRMATION DIALOG MODAL */}
      {showExitConfirm && (
        <div className="fixed inset-0 z-50 bg-gray-950/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-150 text-left space-y-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 font-sans tracking-tight">
                Exit Practice Session?
              </h3>
            </div>

            <p className="text-xs text-gray-600 leading-relaxed font-sans">
              You are currently inside a secure full-screen IELTS test workspace. Your practice draft has been saved to this browser so you won't lose your progress, but you must submit your answers to obtain a verified band score evaluation scorecard.
            </p>

            <div className="flex flex-col gap-2 pt-2">
              <button
                onClick={() => setShowExitConfirm(false)}
                className="w-full py-2.5 px-4 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl transition-all cursor-pointer text-center"
              >
                Continue Practice Session
              </button>
              
              <button
                onClick={() => {
                  setShowExitConfirm(false);
                  onCancel();
                }}
                className="w-full py-2.5 px-4 bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 font-bold text-xs rounded-xl transition-all cursor-pointer text-center"
              >
                Exit and Keep Saved Draft
              </button>

              <button
                onClick={() => {
                  localStorage.removeItem(`ielts_draft_${test.id}`);
                  setShowExitConfirm(false);
                  onCancel();
                }}
                className="w-full py-2 px-4 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs rounded-xl transition-all cursor-pointer text-center flex items-center justify-center gap-1.5 border border-rose-100"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Discard Progress and Exit</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
