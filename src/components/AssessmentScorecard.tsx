import React, { useState } from 'react';
import { 
  CheckCircle2, Sparkles, Award, MessageSquare, Lightbulb, 
  ChevronDown, ChevronUp, FileText, Mic, PenTool, RefreshCw, UserCheck, Sliders
} from 'lucide-react';
import { WritingEvaluation, SpeakingEvaluation, CriterionDetail } from '../types';

interface AssessmentScorecardProps {
  module: 'writing' | 'speaking';
  writingEval?: WritingEvaluation;
  speakingEval?: SpeakingEvaluation;
  editable?: boolean;
  onSaveEvaluation?: (evalData: WritingEvaluation | SpeakingEvaluation) => void;
  studentSubmissionText?: string;
}

export default function AssessmentScorecard({
  module,
  writingEval,
  speakingEval,
  editable = false,
  onSaveEvaluation,
  studentSubmissionText
}: AssessmentScorecardProps) {
  const isWriting = module === 'writing';

  // State for editable inputs
  const [wEval, setWEval] = useState<WritingEvaluation>(
    writingEval || {
      taskAchievement: {
        score: 6.5,
        reason: 'Addresses all parts of the prompt with a clear overview of main ideas.',
        advice: 'Support key statements with more specific data points and relevant details.'
      },
      coherenceCohesion: {
        score: 6.5,
        reason: 'Organizes information logically with clear paragraphing throughout.',
        advice: 'Vary transition phrases to avoid overusing repetitive linkers.'
      },
      lexicalResource: {
        score: 6.5,
        reason: 'Uses an adequate range of vocabulary for the topic with clear word choice.',
        advice: 'Incorporate less common academic vocabulary and collocations.'
      },
      grammaticalRangeAccuracy: {
        score: 6.5,
        reason: 'Uses a mix of simple and complex sentence forms with good punctuation.',
        advice: 'Focus on complex clause structures and avoid minor subject-verb agreement slips.'
      },
      overallBand: 6.5,
      evaluatorType: 'AI',
      evaluatorName: 'IELTS Official Assessment Engine',
      generalAdvice: 'Solid attempt overall. Enhancing lexical variety and data support will raise your score to Band 7.5.'
    }
  );

  const [sEval, setSEval] = useState<SpeakingEvaluation>(
    speakingEval || {
      fluencyCoherence: {
        score: 6.5,
        reason: 'Speaks at length with good momentum and clear topic cohesion.',
        advice: 'Reduce self-correction and hesitation when answering complex Part 3 questions.'
      },
      lexicalResource: {
        score: 6.5,
        reason: 'Displays a good range of vocabulary to express personal opinions and experiences.',
        advice: 'Introduce idiomatic expressions and precise topic-specific words.'
      },
      grammaticalRangeAccuracy: {
        score: 6.5,
        reason: 'Produces frequent error-free complex sentences with clear tense usage.',
        advice: 'Watch out for past tense consistency when narrating past experiences in Part 2.'
      },
      pronunciation: {
        score: 6.5,
        reason: 'Pronunciation is generally clear and intelligible throughout the responses.',
        advice: 'Work on sentence stress and intonation to convey subtle shades of meaning.'
      },
      overallBand: 6.5,
      evaluatorType: 'AI',
      evaluatorName: 'IELTS Official Assessment Engine',
      generalAdvice: 'Confident spoken response. Focus on intonation and complex tense accuracy to hit Band 7.5.'
    }
  );

  const [isGeneratingAI, setIsGeneratingAI] = useState(false);

  // Helper to calculate overall band rounded to nearest 0.5
  const calculateOverall = (scores: number[]): number => {
    const sum = scores.reduce((a, b) => a + b, 0);
    const avg = sum / 4;
    return Math.round(avg * 2) / 2;
  };

  const handleWritingChange = (
    key: keyof Omit<WritingEvaluation, 'overallBand' | 'evaluatorType' | 'evaluatorName' | 'evaluatedAt' | 'generalAdvice'>,
    field: keyof CriterionDetail,
    val: string | number
  ) => {
    const updated = { ...wEval };
    updated[key] = {
      ...updated[key],
      [field]: field === 'score' ? Number(val) : val
    };
    const overall = calculateOverall([
      updated.taskAchievement.score,
      updated.coherenceCohesion.score,
      updated.lexicalResource.score,
      updated.grammaticalRangeAccuracy.score
    ]);
    updated.overallBand = overall;
    setWEval(updated);
    if (onSaveEvaluation) onSaveEvaluation(updated);
  };

  const handleSpeakingChange = (
    key: keyof Omit<SpeakingEvaluation, 'overallBand' | 'evaluatorType' | 'evaluatorName' | 'evaluatedAt' | 'generalAdvice'>,
    field: keyof CriterionDetail,
    val: string | number
  ) => {
    const updated = { ...sEval };
    updated[key] = {
      ...updated[key],
      [field]: field === 'score' ? Number(val) : val
    };
    const overall = calculateOverall([
      updated.fluencyCoherence.score,
      updated.lexicalResource.score,
      updated.grammaticalRangeAccuracy.score,
      updated.pronunciation.score
    ]);
    updated.overallBand = overall;
    setSEval(updated);
    if (onSaveEvaluation) onSaveEvaluation(updated);
  };

  // Simulate AI evaluation generator
  const triggerAIEvaluation = () => {
    setIsGeneratingAI(true);
    setTimeout(() => {
      if (isWriting) {
        const textLen = (studentSubmissionText || '').length;
        const mockBand = textLen > 250 ? 7.5 : textLen > 150 ? 6.5 : 5.5;
        const newWEval: WritingEvaluation = {
          taskAchievement: {
            score: mockBand,
            reason: textLen > 200 ? 'Extensive response addressing all bullet points in detail.' : 'Addresses the prompt adequately but could expand key arguments.',
            advice: 'Add concrete real-world statistics or survey examples to bolster main points.'
          },
          coherenceCohesion: {
            score: mockBand,
            reason: 'Clear paragraph organization with cohesive linkers ("Furthermore", "In summary").',
            advice: 'Use substitution and reference pronouns to avoid repeating subject nouns.'
          },
          lexicalResource: {
            score: mockBand,
            reason: 'Good vocabulary selection with sophisticated academic terms.',
            advice: 'Incorporate less common collocations like "pivotal role", "substantial impact", "unprecedented growth".'
          },
          grammaticalRangeAccuracy: {
            score: mockBand > 6.0 ? mockBand - 0.5 : mockBand,
            reason: 'Frequent error-free sentence structures with complex subordinating clauses.',
            advice: 'Ensure subject-verb agreement in passive voice sentences.'
          },
          overallBand: mockBand,
          evaluatorType: 'AI',
          evaluatorName: 'IELTS AI Evaluator Pro',
          evaluatedAt: new Date().toISOString().split('T')[0],
          generalAdvice: `AI Diagnostic: Submission evaluated at Band ${mockBand}. Focus on refining grammatical clause precision.`
        };
        setWEval(newWEval);
        if (onSaveEvaluation) onSaveEvaluation(newWEval);
      } else {
        const newSEval: SpeakingEvaluation = {
          fluencyCoherence: {
            score: 7.0,
            reason: 'Sustained speech with minimal hesitation and good flow.',
            advice: 'Use transition signals like "To look at it another way" in Part 3.'
          },
          lexicalResource: {
            score: 7.0,
            reason: 'Diverse vocabulary with idiomatic turns of phrase.',
            advice: 'Incorporate precise topic-specific adjectives.'
          },
          grammaticalRangeAccuracy: {
            score: 6.5,
            reason: 'Good range of grammatical structures with minor slip-ups.',
            advice: 'Consolidate conditional sentences ("If I had... I would have...").'
          },
          pronunciation: {
            score: 7.0,
            reason: 'Clear intonation and natural stress patterns throughout.',
            advice: 'Focus on word stress in multi-syllable terms.'
          },
          overallBand: 7.0,
          evaluatorType: 'AI',
          evaluatorName: 'IELTS AI Speaking Assessor',
          evaluatedAt: new Date().toISOString().split('T')[0],
          generalAdvice: 'Excellent spoken performance! Clear pronunciation and strong topic coherence.'
        };
        setSEval(newSEval);
        if (onSaveEvaluation) onSaveEvaluation(newSEval);
      }
      setIsGeneratingAI(false);
    }, 900);
  };

  const activeEval = isWriting ? wEval : sEval;

  const criteriaList = isWriting
    ? [
        {
          key: 'taskAchievement' as const,
          code: 'TA/TR',
          title: 'Task Achievement / Response',
          weight: '25%',
          desc: 'Addresses all requirements of the prompt with clear main ideas and supporting detail.',
          data: wEval.taskAchievement
        },
        {
          key: 'coherenceCohesion' as const,
          code: 'CC',
          title: 'Coherence & Cohesion',
          weight: '25%',
          desc: 'Logical structure, paragraphing, and effective use of cohesive devices.',
          data: wEval.coherenceCohesion
        },
        {
          key: 'lexicalResource' as const,
          code: 'LR',
          title: 'Lexical Resource',
          weight: '25%',
          desc: 'Range of vocabulary, word choice precision, spelling, and collocations.',
          data: wEval.lexicalResource
        },
        {
          key: 'grammaticalRangeAccuracy' as const,
          code: 'GRA',
          title: 'Grammatical Range & Accuracy',
          weight: '25%',
          desc: 'Flexibility of grammar, complex sentence structures, and punctuation accuracy.',
          data: wEval.grammaticalRangeAccuracy
        }
      ]
    : [
        {
          key: 'fluencyCoherence' as const,
          code: 'FC',
          title: 'Fluency & Coherence',
          weight: '25%',
          desc: 'Ability to talk continuously without hesitation or self-correction, logical ordering.',
          data: sEval.fluencyCoherence
        },
        {
          key: 'lexicalResource' as const,
          code: 'LR',
          title: 'Lexical Resource',
          weight: '25%',
          desc: 'Flexible and precise use of vocabulary, idioms, and paraphrasing.',
          data: sEval.lexicalResource
        },
        {
          key: 'grammaticalRangeAccuracy' as const,
          code: 'GRA',
          title: 'Grammatical Range & Accuracy',
          weight: '25%',
          desc: 'Range and accuracy of sentence structures and complex clauses.',
          data: sEval.grammaticalRangeAccuracy
        },
        {
          key: 'pronunciation' as const,
          code: 'P',
          title: 'Pronunciation',
          weight: '25%',
          desc: 'Clarity, word/sentence stress, intonation, and intelligibility.',
          data: sEval.pronunciation
        }
      ];

  const currentOverallBand = isWriting ? wEval.overallBand : sEval.overallBand;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden space-y-6">
      {/* 1. Scorecard Banner Header */}
      <div className={`p-5 text-white ${
        isWriting 
          ? 'bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700' 
          : 'bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-white/10 rounded-xl backdrop-blur-xs">
              {isWriting ? <PenTool className="h-6 w-6 text-white" /> : <Mic className="h-6 w-6 text-white" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded text-white">
                  {isWriting ? 'Writing Module' : 'Speaking Module'}
                </span>
                <span className="text-xs text-white/80">4 Assessment Criteria (25% each)</span>
              </div>
              <h3 className="text-lg font-bold text-white mt-0.5">
                {isWriting ? 'Official Writing Criteria Assessment' : 'Official Speaking Criteria Assessment'}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-4 bg-black/20 p-3 rounded-xl border border-white/10 backdrop-blur-xs shrink-0">
            <div>
              <p className="text-[9px] font-bold text-white/70 uppercase tracking-widest">Overall Band</p>
              <p className="text-2xl font-black text-white">
                Band {currentOverallBand.toFixed(1)}
              </p>
            </div>
            {editable && (
              <button
                onClick={triggerAIEvaluation}
                disabled={isGeneratingAI}
                className="bg-white text-gray-900 font-bold text-xs px-3 py-2 rounded-lg shadow hover:bg-gray-100 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Sparkles className={`h-3.5 w-3.5 text-amber-500 ${isGeneratingAI ? 'animate-spin' : ''}`} />
                <span>{isGeneratingAI ? 'Analyzing...' : 'Auto-Assess AI'}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 2. Criteria Breakdown List */}
      <div className="p-5 space-y-5">
        <div className="flex items-center justify-between pb-2 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Sliders className="h-4 w-4 text-indigo-600" />
            <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider">
              Four Core Criteria Breakdown (25% Weightage Each)
            </h4>
          </div>
          <span className="text-[11px] text-gray-400 font-medium">
            Evaluator: <strong className="text-gray-700">{activeEval.evaluatorName || 'IELTS Certified Assessor'}</strong>
          </span>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {criteriaList.map((crit) => {
            const score = crit.data.score;
            const percentage = Math.min((score / 9.0) * 100, 100);

            return (
              <div 
                key={crit.key} 
                className="rounded-xl border border-gray-200 bg-gray-50/50 p-4 space-y-3 relative hover:border-indigo-200 transition-all shadow-xs"
              >
                {/* Header line for criterion */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-indigo-100 text-indigo-800 font-black text-[10px] tracking-wider">
                      {crit.code}
                    </span>
                    <h5 className="text-xs font-bold text-gray-900">{crit.title}</h5>
                  </div>
                  <span className="text-[10px] font-extrabold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-100">
                    {crit.weight}
                  </span>
                </div>

                <p className="text-[11px] text-gray-500 leading-snug">{crit.desc}</p>

                {/* Score bar & Input */}
                <div className="space-y-1.5 bg-white p-2.5 rounded-lg border border-gray-100">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-gray-700">Awarded Score:</span>
                    {editable ? (
                      <div className="flex items-center gap-1.5">
                        <input
                          type="range"
                          min="0"
                          max="9"
                          step="0.5"
                          value={score}
                          onChange={(e) => {
                            if (isWriting) handleWritingChange(crit.key as any, 'score', e.target.value);
                            else handleSpeakingChange(crit.key as any, 'score', e.target.value);
                          }}
                          className="w-24 accent-indigo-600 cursor-pointer"
                        />
                        <select
                          value={score}
                          onChange={(e) => {
                            if (isWriting) handleWritingChange(crit.key as any, 'score', e.target.value);
                            else handleSpeakingChange(crit.key as any, 'score', e.target.value);
                          }}
                          className="text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 rounded px-1.5 py-0.5 cursor-pointer"
                        >
                          {[0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5, 5.5, 6, 6.5, 7, 7.5, 8, 8.5, 9].map(num => (
                            <option key={num} value={num}>Band {num.toFixed(1)}</option>
                          ))}
                        </select>
                      </div>
                    ) : (
                      <span className="font-extrabold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                        Band {score.toFixed(1)} / 9.0
                      </span>
                    )}
                  </div>

                  <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-300 ${
                        score >= 7.0 ? 'bg-emerald-500' : score >= 6.0 ? 'bg-amber-500' : 'bg-rose-500'
                      }`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>

                {/* Reason & Advice Blocks */}
                <div className="space-y-2 text-xs pt-1">
                  {/* Reason Block */}
                  <div className="bg-amber-50/60 rounded-lg p-2.5 border border-amber-100 space-y-1">
                    <div className="flex items-center gap-1.5 text-amber-900 font-bold text-[11px]">
                      <MessageSquare className="h-3.5 w-3.5 text-amber-600 shrink-0" />
                      <span>Reason / Justification:</span>
                    </div>
                    {editable ? (
                      <textarea
                        rows={2}
                        value={crit.data.reason}
                        onChange={(e) => {
                          if (isWriting) handleWritingChange(crit.key as any, 'reason', e.target.value);
                          else handleSpeakingChange(crit.key as any, 'reason', e.target.value);
                        }}
                        className="w-full text-xs p-2 bg-white border border-amber-200 rounded-md focus:ring-1 focus:ring-amber-500 outline-hidden"
                        placeholder="Explain why this band score was awarded..."
                      />
                    ) : (
                      <p className="text-[11px] text-amber-950 leading-relaxed font-normal">
                        {crit.data.reason || 'Sufficient performance shown for this level.'}
                      </p>
                    )}
                  </div>

                  {/* Advice Block */}
                  <div className="bg-emerald-50/60 rounded-lg p-2.5 border border-emerald-100 space-y-1">
                    <div className="flex items-center gap-1.5 text-emerald-900 font-bold text-[11px]">
                      <Lightbulb className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                      <span>Actionable Advice to Next Band:</span>
                    </div>
                    {editable ? (
                      <textarea
                        rows={2}
                        value={crit.data.advice}
                        onChange={(e) => {
                          if (isWriting) handleWritingChange(crit.key as any, 'advice', e.target.value);
                          else handleSpeakingChange(crit.key as any, 'advice', e.target.value);
                        }}
                        className="w-full text-xs p-2 bg-white border border-emerald-200 rounded-md focus:ring-1 focus:ring-emerald-500 outline-hidden"
                        placeholder="Provide specific coaching tips to reach the higher band..."
                      />
                    ) : (
                      <p className="text-[11px] text-emerald-950 leading-relaxed font-normal">
                        {crit.data.advice || 'Continue practicing complex structures and precise vocabulary.'}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Overall General Feedback Summary */}
        <div className="bg-indigo-50/50 rounded-xl p-4 border border-indigo-100 space-y-2">
          <div className="flex items-center gap-2 text-indigo-900 font-bold text-xs">
            <CheckCircle2 className="h-4 w-4 text-indigo-600" />
            <span>Overall Examiner / AI Summary:</span>
          </div>
          {editable ? (
            <textarea
              rows={2}
              value={activeEval.generalAdvice || ''}
              onChange={(e) => {
                if (isWriting) {
                  const updated = { ...wEval, generalAdvice: e.target.value };
                  setWEval(updated);
                  if (onSaveEvaluation) onSaveEvaluation(updated);
                } else {
                  const updated = { ...sEval, generalAdvice: e.target.value };
                  setSEval(updated);
                  if (onSaveEvaluation) onSaveEvaluation(updated);
                }
              }}
              className="w-full text-xs p-2.5 bg-white border border-indigo-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-hidden"
              placeholder="Provide overall coaching summary..."
            />
          ) : (
            <p className="text-xs text-indigo-950 leading-relaxed">
              {activeEval.generalAdvice || 'General diagnostic completed. Keep reviewing the detailed advice above to achieve your target IELTS score.'}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
