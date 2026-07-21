import React, { useState, useEffect, useRef } from 'react';
import { 
  X, ChevronLeft, ChevronRight, Clock, Sparkles, BookOpen, PenTool, 
  Volume2, PlayCircle, PauseCircle, Maximize2, Share2, AlertTriangle, 
  Download, Save, FileText, Check, HelpCircle, Settings, Sliders, Play, Flag, Trash2
} from 'lucide-react';
import { IELTSTest, IELTSQuestion } from '../types';
import SpeakingPractice from './SpeakingPractice';
import QuestionRenderer from './QuestionRenderer';

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
  
  // Rich Highlight Interface
  interface RichHighlight {
    text: string;
    type: 'highlight' | 'underline';
    note?: string;
  }

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

  // New IELTS Computer features
  const [colorTheme, setColorTheme] = useState<'standard' | 'contrast' | 'beige'>('standard');
  const [volume, setVolume] = useState<number>(80);
  const [leftWidth, setLeftWidth] = useState<number>(50); // Equal width partition (50/50 split)
  const [isResizing, setIsResizing] = useState<boolean>(false);
  const [isMobile, setIsMobile] = useState<boolean>(false);
  
  // Note-taking temporary states
  const [noteInput, setNoteInput] = useState<string>('');
  const [showNoteForm, setShowNoteForm] = useState<boolean>(false);

  // Advanced IELTS states
  const [highlights, setHighlights] = useState<RichHighlight[]>([]);
  const [flaggedQuestions, setFlaggedQuestions] = useState<string[]>([]);
  const [selectionBox, setSelectionBox] = useState<{ x: number; y: number; text: string } | null>(null);
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  // Container reference for draggable partition
  const containerRef = useRef<HTMLDivElement>(null);

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

  // Track mobile screen sizes
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Draggable partition splitter logic
  useEffect(() => {
    if (!isResizing) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const relativeX = e.clientX - rect.left;
      const percentage = (relativeX / rect.width) * 100;
      // Impose limits to prevent panels from vanishing
      setLeftWidth(Math.min(Math.max(percentage, 25), 75));
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!containerRef.current || e.touches.length === 0) return;
      const rect = containerRef.current.getBoundingClientRect();
      const relativeX = e.touches[0].clientX - rect.left;
      const percentage = (relativeX / rect.width) * 100;
      setLeftWidth(Math.min(Math.max(percentage, 25), 75));
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('touchmove', handleTouchMove);
    document.addEventListener('touchend', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleMouseUp);
    };
  }, [isResizing]);

  // Load saved progress draft from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(`ielts_draft_${test.id}`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.userAnswers) setUserAnswers(parsed.userAnswers);
        if (parsed.writingEssay) setWritingEssay(parsed.writingEssay);
        if (parsed.scratchpadText) setScratchpadText(parsed.scratchpadText);
        
        if (parsed.highlights) {
          // Convert legacy format string list of highlights to rich structures
          const converted = parsed.highlights.map((h: any) => {
            if (typeof h === 'string') {
              return { text: h, type: 'highlight' as const };
            }
            return h;
          });
          setHighlights(converted);
        }
        
        if (parsed.flaggedQuestions) setFlaggedQuestions(parsed.flaggedQuestions);
        if (parsed.colorTheme) setColorTheme(parsed.colorTheme);
        if (parsed.volume !== undefined) setVolume(parsed.volume);
        if (parsed.leftWidth !== undefined) setLeftWidth(parsed.leftWidth);
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
      colorTheme,
      volume,
      leftWidth,
      timestamp: Date.now()
    };
    localStorage.setItem(`ielts_draft_${test.id}`, JSON.stringify(draftData));
  }, [userAnswers, writingEssay, scratchpadText, highlights, flaggedQuestions, secondsLeft, colorTheme, volume, leftWidth, test.id]);

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
          y: rect.top + window.scrollY - 50,
          text
        });
        // Clear any previous note-taking drafts
        setShowNoteForm(false);
        setNoteInput('');
      } catch (err) {
        // Range bounding client rect can occasionally throw errors if selection changes rapidly
      }
    } else {
      setSelectionBox(null);
    }
  };

  const handleAddHighlight = (text: string, type: 'highlight' | 'underline' = 'highlight', note?: string) => {
    if (!text || text.trim().length === 0) return;
    setHighlights(prev => {
      const filtered = prev.filter(h => h.text.toLowerCase() !== text.toLowerCase());
      return [...filtered, { text, type, note: note || undefined }];
    });
    triggerToast(note ? "Added note & marked passage!" : `Added ${type === 'underline' ? 'underline' : 'highlight'}!`);
    setSelectionBox(null);
    setShowNoteForm(false);
    setNoteInput('');
    window.getSelection()?.removeAllRanges();
  };

  const handleRemoveHighlight = (text: string) => {
    setHighlights(prev => prev.filter(h => h.text.toLowerCase() !== text.toLowerCase()));
    triggerToast("Removed mark.");
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

  // Highlight-aware text rendering helper with rich styles and note indicators
  const highlightText = (text: string, richHighlights: RichHighlight[]) => {
    if (!richHighlights || richHighlights.length === 0) return <span>{text}</span>;
    const phrases = richHighlights.map(h => h.text).filter(p => p.trim().length > 0);
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
            const hObj = richHighlights.find(h => h.text.toLowerCase() === part.toLowerCase());
            if (hObj) {
              const isUnderline = hObj.type === 'underline';
              return (
                <span 
                  key={i} 
                  className={`relative group inline cursor-pointer select-text transition-all ${
                    isUnderline
                      ? 'underline decoration-sky-500 decoration-2 underline-offset-2 hover:bg-sky-50 px-0.5'
                      : 'bg-yellow-200 text-gray-950 rounded-sm px-0.5 hover:bg-yellow-300'
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                >
                  {part}
                  
                  {/* Floating tooltip/note card on hover */}
                  <span className="absolute left-1/2 -translate-x-1/2 bottom-full mb-1.5 hidden group-hover:flex flex-col bg-gray-950 text-white text-[10px] p-2.5 rounded-xl shadow-2xl z-30 min-w-[200px] border border-gray-850 text-left pointer-events-auto leading-normal">
                    <span className="text-yellow-400 font-extrabold uppercase text-[8px] tracking-wider mb-1 block">
                      {isUnderline ? 'Blue Underline' : 'Yellow Highlight'} {hObj.note && '• Notes attached'}
                    </span>
                    {hObj.note ? (
                      <p className="text-gray-100 font-sans mb-2 italic bg-gray-900 p-1.5 rounded-lg border border-gray-800">"{hObj.note}"</p>
                    ) : (
                      <p className="text-gray-400 mb-2">No custom note attached.</p>
                    )}
                    <button
                      type="button"
                      onClick={(evt) => {
                        evt.stopPropagation();
                        handleRemoveHighlight(hObj.text);
                      }}
                      className="text-rose-400 hover:text-rose-300 font-extrabold text-[9px] self-end cursor-pointer uppercase tracking-wider"
                    >
                      Delete Mark
                    </button>
                  </span>

                  {/* Tiny note indicator */}
                  {hObj.note && (
                    <span className="inline-flex items-center justify-center ml-1 px-1.5 py-0.5 text-[8px] font-extrabold bg-rose-600 hover:bg-rose-500 text-white rounded-md leading-none shadow-xs">
                      ✍️
                    </span>
                  )}
                </span>
              );
            }
            return <span key={i}>{part}</span>;
          })}
        </span>
      );
    } catch (e) {
      return <span>{text}</span>;
    }
  };

  // Helper for mock text rendering with custom paragraph structures
  const renderPassageParagraphs = () => {
    // If we have custom block-based structures, render them sequentially
    if (test.passageBlocks && test.passageBlocks.length > 0) {
      let paragraphCounter = 0;
      return (
        <div className="space-y-4 text-left">
          {test.passageBlocks.map((block, idx) => {
            if (block.type === 'heading') {
              return (
                <h4 key={block.id || idx} className="text-xs sm:text-sm font-extrabold text-gray-800 uppercase tracking-wider mt-6 mb-2.5 flex items-center gap-2 border-l-2 border-rose-500 pl-2">
                  {block.content}
                </h4>
              );
            }

            if (block.type === 'paragraph') {
              paragraphCounter++;
              const letterLabel = String.fromCharCode(64 + paragraphCounter);
              return (
                <div key={block.id || idx} className="flex gap-4 items-start text-left mb-4.5">
                  <span className="font-mono text-[11px] font-extrabold text-rose-500 bg-rose-50 px-2 py-0.5 rounded-md mt-0.5" title={`Paragraph ${letterLabel}`}>
                    {letterLabel}
                  </span>
                  <p className="leading-relaxed font-sans flex-1">
                    {highlightText(block.content, highlights)}
                  </p>
                </div>
              );
            }

            if (block.type === 'image') {
              return (
                <div key={block.id || idx} className="my-6 rounded-2xl border border-gray-150 p-2.5 bg-gray-50/50 flex flex-col items-center">
                  <img 
                    src={block.content} 
                    alt={block.caption || 'Illustration Diagram'} 
                    className="max-h-64 object-contain rounded-xl shadow-xs" 
                    referrerPolicy="no-referrer"
                    onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                  />
                  {block.caption && (
                    <p className="text-[10px] text-gray-400 font-bold mt-2 font-sans text-center">
                      {block.caption}
                    </p>
                  )}
                </div>
              );
            }

            if (block.type === 'table') {
              return (
                <div key={block.id || idx} className="my-6 overflow-x-auto border border-gray-200 rounded-xl shadow-2xs bg-white">
                  <table className="w-full text-left border-collapse text-[11px]">
                    <tbody>
                      {block.content.split('\n').filter(line => line.trim()).map((line, rIdx) => {
                        const cells = line.split('|').map(c => c.trim());
                        return (
                          <tr key={rIdx} className={rIdx === 0 ? 'bg-gray-50 font-bold text-gray-700 border-b border-gray-200' : 'border-b border-gray-100 hover:bg-gray-50/30'}>
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
      );
    }

    // LEGACY FALLBACK
    const defaultText = test.passage || `The architectural marvel of coral reefs is built on tiny organisms known as coral polyps. Polyps secrete hard carbonate exoskeletons which support vast communities. However, ocean temperature rises of even 1.5°C disrupt the fragile symbiotic algae, leading to widespread bleaching events.\n\nHistorically, reefs have weathered numerous prehistoric thermal variations. However, the modern velocity of industrial climate change bypasses the adaptation curves of slow-growing deep sea reef builders. Immediate artificial shading, heat-resistant strain seeding, and localized carbon removal represent modern mitigation strategies.`;
    
    const paragraphs = defaultText.split(/\n\s*\n/);
    
    return paragraphs.map((para, pIdx) => {
      const letterLabel = String.fromCharCode(65 + pIdx); // A, B, C, D...
      return (
        <div key={pIdx} className="flex gap-4 items-start text-left mb-5">
          <span className="font-mono text-xs font-extrabold text-rose-500 bg-rose-50 px-2 py-1 rounded-md mt-0.5" title={`Paragraph ${letterLabel}`}>
            {letterLabel}
          </span>
          <p className="leading-relaxed font-sans flex-1">
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

  // Dynamic Theme Styling mappings
  let themeBg = 'bg-gray-50 text-gray-900';
  let paneBg = 'bg-white text-gray-800';
  let sidePaneBg = 'bg-gray-50 text-gray-700';
  let borderCol = 'border-gray-200';
  let headerBg = 'bg-white text-gray-900 border-gray-200';
  let footerBg = 'bg-white text-gray-900 border-gray-200';
  let textMuted = 'text-gray-500';

  if (colorTheme === 'contrast') {
    themeBg = 'bg-yellow-200 text-black';
    paneBg = 'bg-yellow-100 text-black';
    sidePaneBg = 'bg-yellow-200/90 text-black';
    borderCol = 'border-yellow-400';
    headerBg = 'bg-yellow-300 text-black border-yellow-400';
    footerBg = 'bg-yellow-300 text-black border-yellow-400';
    textMuted = 'text-yellow-950/80';
  } else if (colorTheme === 'beige') {
    themeBg = 'bg-[#f4ebd0] text-stone-900';
    paneBg = 'bg-[#faf0e6] text-stone-800';
    sidePaneBg = 'bg-[#fdf6e3]/70 text-stone-700';
    borderCol = 'border-amber-200/50';
    headerBg = 'bg-[#faf0e6] text-stone-900 border-amber-200/50';
    footerBg = 'bg-[#faf0e6] text-stone-900 border-amber-200/50';
    textMuted = 'text-stone-500';
  }

  return (
    <div className={`fixed inset-0 z-50 flex flex-col h-screen w-screen overflow-hidden font-sans select-text ${themeBg}`} id="ielts-exam-session-full">
      
      {/* 1. TOP HEADER (COMPACT & HIGH FIDELITY) */}
      <header className={`h-14 flex items-center justify-between px-4 sm:px-6 z-10 shadow-xs shrink-0 border-b ${headerBg}`}>
        
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
                  <div className="px-3.5 py-2 border-t border-gray-100 mt-1 space-y-1.5 bg-gray-50/50">
                    <span className="text-[9px] font-bold text-gray-400 uppercase">Passage Text Size:</span>
                    <div className="flex gap-1">
                      {(['small', 'medium', 'large'] as const).map((sz) => (
                        <button
                          key={sz}
                          type="button"
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

                  {/* Color theme options in settings */}
                  <div className="px-3.5 py-2 border-t border-gray-150 space-y-1.5 bg-gray-50/50">
                    <span className="text-[9px] font-bold text-gray-400 uppercase">Screen Color Theme:</span>
                    <div className="flex gap-1">
                      {(['standard', 'contrast', 'beige'] as const).map((th) => (
                        <button
                          key={th}
                          type="button"
                          onClick={() => {
                            setColorTheme(th);
                            triggerToast(`Switched screen theme to ${th === 'contrast' ? 'High Contrast' : th === 'beige' ? 'Beige Contrast' : 'Standard Colors'}!`);
                          }}
                          className={`flex-1 py-1 rounded-md text-[9px] font-extrabold uppercase border transition-all cursor-pointer ${
                            colorTheme === th 
                              ? 'bg-rose-600 border-rose-600 text-white' 
                              : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'
                          }`}
                        >
                          {th}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Volume options in settings */}
                  <div className="px-3.5 py-2 border-t border-b border-gray-150 space-y-1.5 bg-gray-50/50">
                    <span className="text-[9px] font-bold text-gray-400 uppercase flex items-center justify-between">
                      <span>Volume Control:</span>
                      <span className="font-mono">{volume}%</span>
                    </span>
                    <div className="flex items-center gap-1.5">
                      <Volume2 className="h-3.5 w-3.5 text-gray-500 shrink-0" />
                      <input 
                        type="range" 
                        min="0" 
                        max="100" 
                        value={volume} 
                        onChange={(e) => {
                          setVolume(parseInt(e.target.value));
                        }}
                        className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-rose-600" 
                      />
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
          <div 
            ref={containerRef}
            className={`flex-1 flex flex-col md:flex-row h-full overflow-hidden ${isResizing ? 'cursor-col-resize select-none' : ''}`}
          >
            
            {/* LEFT COLUMN: SOURCE DATA (Passage / Audio Script) */}
            <div 
              style={{ width: isMobile ? '100%' : `${leftWidth}%` }}
              className={`border-r overflow-y-auto flex flex-col h-full shrink-0 ${paneBg} ${borderCol}`}
              onMouseUp={handleTextSelection}
            >
              
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
            <div 
              onMouseDown={() => setIsResizing(true)}
              onTouchStart={() => setIsResizing(true)}
              className={`hidden md:flex flex-col items-center justify-center relative w-1.5 ${borderCol} ${isResizing ? 'bg-rose-500' : 'bg-gray-200/80 hover:bg-rose-400'} z-20 cursor-col-resize select-none shrink-0 transition-colors`}
              title="Drag horizontally to resize reading panels"
            >
              <div className="absolute flex flex-col gap-1 items-center justify-center h-10 w-6 bg-white border border-gray-200 text-gray-500 rounded-md shadow-md hover:border-rose-400 hover:text-rose-600 transition-all cursor-col-resize">
                <span className="text-[8px] font-bold uppercase tracking-widest leading-none">&lt;</span>
                <span className="text-[8px] font-bold uppercase tracking-widest leading-none">&gt;</span>
              </div>
            </div>

            {/* RIGHT COLUMN: INTERACTIVE QUESTION VIEWER & INPUTS */}
            <div className={`flex-1 overflow-y-auto flex flex-col p-5 sm:p-6 text-left ${sidePaneBg}`}>
              
              {/* Heading Panel */}
              <div className={`flex items-center justify-between border-b pb-3 mb-5 ${borderCol}`}>
                <span className="text-[10px] font-extrabold uppercase text-gray-400 tracking-wider">Candidate Response Panel</span>
                <span className={`text-[10px] font-bold bg-white border px-2.5 py-1 rounded-lg shadow-2xs ${borderCol}`}>
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
                            • {
                              q.type === 'MCQ' ? 'Multiple Choice' :
                              q.type === 'TrueFalseNotGiven' ? 'True/False/Not Given' :
                              q.type === 'YesNoNotGiven' ? "Yes/No/Not Given" :
                              q.type === 'MatchingInfo' ? 'Matching Information' :
                              q.type === 'MatchingHeadings' ? 'Matching Paragraph Headings' :
                              q.type === 'MatchingFeatures' ? 'Matching Features' :
                              q.type === 'MatchingSentenceEndings' ? 'Matching Sentence Endings' :
                              q.type === 'SentenceCompletion' ? 'Sentence Completion' :
                              q.type === 'SummaryCompletion' ? 'Summary Completion' :
                              q.type === 'DiagramCompletion' ? 'Diagram Label Completion' :
                              q.type === 'ShortAnswer' ? 'Short-Answer' : 'Fill in the Blanks'
                            }
                          </span>
                        </div>
                        
                        {/* Question core text */}
                        <h4 className="text-xs sm:text-sm font-bold text-gray-800 leading-snug mb-4">
                          {q.questionText}
                        </h4>

                        {/* Unified IELTS Question Renderer */}
                        <QuestionRenderer
                          question={q}
                          value={userAnswers[q.id] || ''}
                          onChange={(val) => {
                            setUserAnswers(prev => ({ ...prev, [q.id]: val }));
                          }}
                        />

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
      <footer className={`h-14 flex items-center justify-between px-4 sm:px-6 shrink-0 z-10 shadow-inner border-t ${footerBg}`}>
        
        {/* Left Side: answered count & visual indicator legend */}
        <div className="hidden lg:flex items-center gap-4">
          <div className={`font-extrabold text-[11px] px-3 py-1.5 rounded-lg border bg-white/50 ${borderCol}`}>
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
          className="fixed z-50 bg-gray-950 text-white text-[11px] font-bold p-3 rounded-2xl shadow-2xl border border-gray-800 flex flex-col gap-2 animate-in fade-in zoom-in-95 duration-150 max-w-xs"
          style={{ 
            top: `${Math.max(10, selectionBox.y - window.scrollY)}px`, 
            left: `${Math.max(10, selectionBox.x - window.scrollX)}px` 
          }}
        >
          <span className="text-gray-400 max-w-[120px] truncate">"{selectionBox.text}"</span>
          {!showNoteForm ? (
            <div className="flex items-center gap-1.5 mt-1 shrink-0">
              <button
                type="button"
                onClick={() => handleAddHighlight(selectionBox.text, 'highlight')}
                className="bg-yellow-400 hover:bg-yellow-300 text-gray-950 font-extrabold px-2 py-1 rounded-lg text-[10px] cursor-pointer transition-all"
              >
                Highlight
              </button>
              <button
                type="button"
                onClick={() => handleAddHighlight(selectionBox.text, 'underline')}
                className="bg-sky-500 hover:bg-sky-450 text-white font-extrabold px-2 py-1 rounded-lg text-[10px] cursor-pointer transition-all"
              >
                Underline
              </button>
              <button
                type="button"
                onClick={() => setShowNoteForm(true)}
                className="bg-gray-800 hover:bg-gray-750 text-white font-extrabold px-2 py-1 rounded-lg text-[10px] cursor-pointer transition-all"
              >
                ✍️ Add Note
              </button>
              <button
                type="button"
                onClick={() => {
                  setSelectionBox(null);
                  window.getSelection()?.removeAllRanges();
                }}
                className="text-gray-400 hover:text-white font-bold text-[9px] px-1.5 cursor-pointer ml-auto"
              >
                Cancel
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-1.5 text-left mt-1 w-full">
              <span className="text-[8px] font-extrabold text-gray-400 uppercase tracking-widest">Type Note:</span>
              <textarea
                value={noteInput}
                onChange={(e) => setNoteInput(e.target.value)}
                placeholder="Type study notes here..."
                rows={2}
                className="w-full bg-gray-900 border border-gray-850 text-white text-[10px] font-medium p-1.5 rounded-lg outline-none focus:border-yellow-400 resize-none font-sans"
              />
              <div className="flex gap-1.5 justify-end mt-1">
                <button
                  type="button"
                  onClick={() => setShowNoteForm(false)}
                  className="bg-gray-800 text-gray-350 px-2 py-1 rounded-md text-[9px] font-bold cursor-pointer hover:bg-gray-700"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => handleAddHighlight(selectionBox.text, 'highlight', noteInput)}
                  className="bg-yellow-400 text-gray-950 px-2.5 py-1 rounded-md text-[9px] font-extrabold cursor-pointer hover:bg-yellow-300 animate-pulse"
                >
                  Save & Highlight
                </button>
                <button
                  type="button"
                  onClick={() => handleAddHighlight(selectionBox.text, 'underline', noteInput)}
                  className="bg-sky-500 text-white px-2.5 py-1 rounded-md text-[9px] font-extrabold cursor-pointer hover:bg-sky-400"
                >
                  Save & Underline
                </button>
              </div>
            </div>
          )}
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
