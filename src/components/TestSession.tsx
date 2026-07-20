import React, { useState } from 'react';
import { 
  Sparkles, PlayCircle, Volume2, BookOpen, PenTool
} from 'lucide-react';
import { IELTSTest, IELTSQuestion } from '../types';
import SpeakingPractice from './SpeakingPractice';
import CountdownTimer from './CountdownTimer';

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
  
  // User input states
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [writingEssay, setWritingEssay] = useState('');
  const [isTimerPaused, setIsTimerPaused] = useState(false);

  // Render question interface based on test category
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

    return (
      <div className="space-y-6 text-left">
        {/* Academic Reading Excerpt */}
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

        {/* Listening simulated audio player */}
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

        {/* Interactive Questions list */}
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

                {/* MCQ option selector */}
                {q.type === 'MCQ' && q.options && (
                  <div className="grid gap-2">
                    {q.options.map((opt) => {
                      const optCode = opt.charAt(0);
                      return (
                        <button
                          key={opt}
                          type="button"
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

                {/* Matching headings select option */}
                {q.type === 'MatchingHeadings' && q.headingOptions && (
                  <div className="grid gap-2">
                    <p className="text-[10px] font-semibold text-gray-400 uppercase">Select Correct Paragraph Heading:</p>
                    {q.headingOptions.map((heading) => {
                      const headingCode = heading.split('.')[0].trim();
                      return (
                        <button
                          key={heading}
                          type="button"
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

                {/* True / False / Not Given button group */}
                {q.type === 'TrueFalseNotGiven' && (
                  <div className="flex gap-2">
                    {['True', 'False', 'Not Given'].map((opt) => (
                      <button
                        key={opt}
                        type="button"
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

                {/* Fill in the Blanks input */}
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
    <div className="space-y-6">
      {/* Visual Timer Header */}
      <div className="flex flex-col gap-3 border-b border-gray-100 pb-4">
        <div className="text-left">
          <span className="rounded bg-rose-50 border border-rose-100 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-rose-700">
            Active IELTS Exam Workspace
          </span>
          <h4 className="text-sm font-extrabold text-gray-900 mt-1 max-w-[280px] truncate">{test.title}</h4>
        </div>

        <CountdownTimer
          durationSeconds={totalSeconds}
          isPaused={isTimerPaused}
          onPauseToggle={() => setIsTimerPaused(!isTimerPaused)}
          onTimeout={() => onSubmit(userAnswers, writingEssay, true)}
          isUnlimited={timeLimit === 'unlimited'}
        />
      </div>

      {/* Render Current Interactive Quiz Form */}
      {renderQuestionsScreen()}

      {/* Vocabulary Note Drawer on the fly */}
      {onAddVocabularyWord && test.category !== 'speaking' && (
        <div className="rounded-2xl border border-rose-100 bg-rose-50/5 p-4 text-left space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-rose-700 font-bold text-[10px] uppercase tracking-wider">
              <Sparkles className="h-3.5 w-3.5 text-rose-500" />
              <span>Vocabulary Assistant</span>
            </div>
            <span className="text-[9px] text-gray-400">Add vocabulary on the fly</span>
          </div>
          
          <div className="flex items-center gap-2">
            <input
              type="text"
              id="session-vocab-input"
              placeholder="Spotted a complex academic term? Save it instantly..."
              className="flex-1 rounded-xl border border-gray-200 px-3 py-2 text-xs text-gray-700 outline-none focus:border-rose-500 bg-white"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  const input = e.currentTarget;
                  const val = input.value.trim();
                  if (val) {
                    onAddVocabularyWord({
                      word: val,
                      definition: `Encountered during active exam session on ${test.title}`,
                      sourceTestId: test.id,
                      sourceTestTitle: test.title,
                    });
                    input.value = '';
                  }
                }
              }}
            />
            <button
              type="button"
              onClick={() => {
                const input = document.getElementById('session-vocab-input') as HTMLInputElement;
                const val = input?.value?.trim();
                if (val) {
                  onAddVocabularyWord({
                    word: val,
                    definition: `Encountered during active exam session on ${test.title}`,
                    sourceTestId: test.id,
                    sourceTestTitle: test.title,
                  });
                  input.value = '';
                }
              }}
              className="px-3.5 py-2 rounded-xl bg-gray-900 text-white font-semibold text-xs hover:bg-gray-800 transition-all flex-shrink-0"
            >
              Add Word
            </button>
          </div>
        </div>
      )}

      {/* Session Controls */}
      <div className="flex gap-3 pt-4 border-t border-gray-50">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 py-3 border border-gray-200 text-gray-500 font-bold rounded-2xl text-xs hover:bg-gray-50 transition-all active:scale-[0.98]"
        >
          Abandon Session
        </button>
        <button
          type="button"
          onClick={() => onSubmit(userAnswers, writingEssay, false)}
          className="flex-1 py-3 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-2xl text-xs shadow-lg shadow-rose-100 transition-all active:scale-[0.98]"
        >
          Submit Mock Test
        </button>
      </div>
    </div>
  );
}
