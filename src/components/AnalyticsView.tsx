import React, { useState } from 'react';
import { 
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, 
  CartesianGrid, Tooltip, Legend, BarChart, Bar 
} from 'recharts';
import { 
  TrendingUp, Award, Clock, CheckCircle2, AlertTriangle, 
  Lightbulb, Sparkles, Star, ChevronRight, HelpCircle,
  Volume2, BookOpen, PenTool, Mic, X, Eye, Sliders
} from 'lucide-react';
import { BandProgressPoint, AttemptHistory, UserProgress } from '../types';
import AssessmentScorecard from './AssessmentScorecard';

interface AnalyticsViewProps {
  progress: UserProgress;
  recentAttempts: AttemptHistory[];
  progressData: BandProgressPoint[];
}

export default function AnalyticsView({
  progress,
  recentAttempts,
  progressData,
}: AnalyticsViewProps) {
  const [selectedAttemptForModal, setSelectedAttemptForModal] = useState<AttemptHistory | null>(null);

  // Calculate average band
  const averageBand = parseFloat(
    (recentAttempts.reduce((sum, att) => sum + att.bandScore, 0) / recentAttempts.length).toFixed(2)
  ) || 6.88;

  // Custom tooltips styling
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-xl border border-gray-100 bg-white p-3 shadow-lg ring-1 ring-black/5">
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">{label}</p>
          <div className="mt-1.5 space-y-1">
            {payload.map((entry: any, index: number) => (
              <div key={index} className="flex items-center gap-2 text-xs">
                <div className="h-2 w-2 rounded-full" style={{ backgroundColor: entry.color }} />
                <span className="text-gray-500 font-medium">{entry.name}:</span>
                <span className="font-bold text-gray-900">{entry.value.toFixed(1)}</span>
              </div>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  // Strengths and weaknesses calculation
  const skillAnalysis = [
    { name: 'Listening', score: 7.0, status: 'Strong', description: 'Excellent at registration spelling, conversation flow. Practice Part 4 fast lectures.' },
    { name: 'Reading', score: 7.5, status: 'Exceptional', description: 'Exceptional reading speed, passage-scanning. Fine-tune True/False questions.' },
    { name: 'Writing', score: 6.5, status: 'Needs Focus', description: 'Clear grammatical structures. Needs variation in complex cohesive vocabulary.' },
    { name: 'Speaking', score: 6.5, status: 'Needs Focus', description: 'Outstanding conversational flow. Focus on maintaining tense consistency in Cue Cards.' },
  ];

  // Category averages (Last 5 attempts)
  const categoryConfig = [
    { id: 'listening', title: 'Listening', icon: Volume2, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100' },
    { id: 'reading', title: 'Reading', icon: BookOpen, color: 'text-indigo-600', bg: 'bg-indigo-50', border: 'border-indigo-100' },
    { id: 'writing', title: 'Writing', icon: PenTool, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100' },
    { id: 'speaking', title: 'Speaking', icon: Mic, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100' }
  ];

  const categoryAverages = categoryConfig.map(config => {
    const attempts = recentAttempts.filter(a => a.category === config.id);
    const sorted = [...attempts].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    const last5 = sorted.slice(0, 5);
    const avg = last5.length > 0 ? (last5.reduce((sum, a) => sum + a.bandScore, 0) / last5.length) : 0;
    return {
      ...config,
      average: avg,
      count: last5.length
    };
  });

  return (
    <div className="space-y-8 py-6" id="analytics-view-container">
      {/* 1. Header & Summary Row */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Performance & Growth Analytics</h2>
          <p className="text-xs text-gray-400">Detailed visual analytics tracking your journey towards IELTS band {progress.targetBand}</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <div className="rounded-xl bg-rose-50/50 border border-rose-100 px-4 py-2.5 flex items-center gap-3">
            <Award className="h-5 w-5 text-rose-600" />
            <div>
              <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Current Avg</p>
              <p className="text-sm font-bold text-rose-700">Band {averageBand.toFixed(2)}</p>
            </div>
          </div>
          <div className="rounded-xl bg-blue-50/50 border border-blue-100 px-4 py-2.5 flex items-center gap-3">
            <Clock className="h-5 w-5 text-blue-600" />
            <div>
              <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Time Invested</p>
              <p className="text-sm font-bold text-blue-700">{progress.practiceTimeHours} Hours</p>
            </div>
          </div>
        </div>
      </div>

      {/* Category Averages */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {categoryAverages.map((cat) => {
          const Icon = cat.icon;
          return (
            <div key={cat.id} className={`rounded-xl border ${cat.border} bg-white p-4 shadow-sm flex flex-col items-center justify-center text-center space-y-2`}>
              <div className={`rounded-full ${cat.bg} ${cat.color} p-2`}>
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500">{cat.title}</p>
                <div className="flex items-end justify-center gap-1">
                  <span className={`text-xl font-bold ${cat.color}`}>{cat.average > 0 ? cat.average.toFixed(1) : '-'}</span>
                </div>
                <p className="text-[9px] text-gray-400 mt-0.5">Last {cat.count} attempts</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* 2. Primary Charts Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        
        {/* Band Scores Growth Line Chart */}
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm space-y-4">
          <div>
            <h3 className="text-sm font-bold text-gray-900">Band Score Progression</h3>
            <p className="text-xs text-gray-400">Track your mock score growth across individual modules</p>
          </div>

          <div className="h-80 w-full text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={progressData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" stroke="#94a3b8" />
                <YAxis domain={[4.5, 9.0]} ticks={[5.0, 6.0, 7.0, 8.0, 9.0]} stroke="#94a3b8" />
                <Tooltip content={<CustomTooltip />} />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '10px' }} />
                <Line type="monotone" dataKey="Average" stroke="#e11d48" strokeWidth={3} name="Overall Average" activeDot={{ r: 8 }} />
                <Line type="monotone" dataKey="Listening" stroke="#3b82f6" strokeWidth={2} name="Listening" />
                <Line type="monotone" dataKey="Reading" stroke="#6366f1" strokeWidth={2} name="Reading" />
                <Line type="monotone" dataKey="Writing" stroke="#f59e0b" strokeWidth={2} name="Writing" />
                <Line type="monotone" dataKey="Speaking" stroke="#10b981" strokeWidth={2} name="Speaking" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Skill Completion Frequencies */}
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm space-y-4">
          <div>
            <h3 className="text-sm font-bold text-gray-900">Practice Distribution</h3>
            <p className="text-xs text-gray-400">Total successful mock tests completed by module</p>
          </div>

          <div className="h-80 w-full text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={[
                { name: 'Listening', completed: 4, target: 10, fill: '#3b82f6' },
                { name: 'Reading', completed: 6, target: 10, fill: '#6366f1' },
                { name: 'Writing', completed: 2, target: 10, fill: '#f59e0b' },
                { name: 'Speaking', completed: 1, target: 10, fill: '#10b981' }
              ]} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip cursor={{ fill: '#f8fafc' }} />
                <Bar dataKey="completed" name="Completed Drills" fill="#e11d48" radius={[8, 8, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* 3. Strengths & Weaknesses Matrix */}
      <div className="grid gap-6 md:grid-cols-2">
        
        {/* Module Performance Table */}
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm space-y-4">
          <div>
            <h3 className="text-sm font-bold text-gray-900">Detailed Skill Evaluation</h3>
            <p className="text-xs text-gray-400">Module specific status and recommendation comments</p>
          </div>

          <div className="space-y-3.5">
            {skillAnalysis.map((skill) => {
              const percent = Math.min((skill.score / 9.0) * 100, 100);
              const isStrong = skill.status === 'Strong' || skill.status === 'Exceptional';
              
              const barColor = 
                skill.name === 'Listening' ? 'bg-blue-500' :
                skill.name === 'Reading' ? 'bg-indigo-500' :
                skill.name === 'Writing' ? 'bg-amber-500' :
                'bg-emerald-500';

              return (
                <div key={skill.name} className="space-y-1.5 p-3 rounded-xl bg-gray-50/50 border border-gray-100/50 hover:bg-gray-50 transition-all">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-800">{skill.name}</span>
                    <div className="flex items-center gap-1.5">
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                        isStrong ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                      }`}>
                        {skill.status}
                      </span>
                      <span className="text-xs font-bold text-gray-900">Band {skill.score.toFixed(1)}</span>
                    </div>
                  </div>
                  
                  {/* Progress bar */}
                  <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                    <div className={`h-full ${barColor}`} style={{ width: `${percent}%` }} />
                  </div>

                  <p className="text-[11px] text-gray-500 leading-normal">{skill.description}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Personalized AI Tutor Tips */}
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-rose-50 text-rose-600">
                <Lightbulb className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-900">Simulated AI Tutor Tips</h3>
                <p className="text-[10px] text-gray-400">Coaching strategies generated based on your scores</p>
              </div>
            </div>

            <div className="divide-y divide-gray-50">
              <div className="py-3 flex gap-2.5 items-start">
                <div className="mt-0.5 h-4 w-4 text-rose-500 bg-rose-50 rounded flex items-center justify-center text-[10px] font-bold">1</div>
                <div>
                  <h4 className="text-xs font-bold text-gray-800">Improve Writing Band (Task 2 Essays)</h4>
                  <p className="text-[11px] text-gray-500 leading-relaxed mt-0.5">
                    Your essay structures are grammatically robust. To boost past 6.5, replace generic cohesive links (e.g. "On the other hand") with academic equivalents (e.g. "In stark contrast", "Alternatively").
                  </p>
                </div>
              </div>
              <div className="py-3 flex gap-2.5 items-start">
                <div className="mt-0.5 h-4 w-4 text-rose-500 bg-rose-50 rounded flex items-center justify-center text-[10px] font-bold">2</div>
                <div>
                  <h4 className="text-xs font-bold text-gray-800">Perfect Reading Section 3 Scanning</h4>
                  <p className="text-[11px] text-gray-500 leading-relaxed mt-0.5">
                    Your reading score of 7.5 is highly impressive. The remaining missed questions are in deep academic passage interpretations. Prioritize skimming noun-verb pairs in paragraph introductions first.
                  </p>
                </div>
              </div>
              <div className="py-3 flex gap-2.5 items-start">
                <div className="mt-0.5 h-4 w-4 text-rose-500 bg-rose-50 rounded flex items-center justify-center text-[10px] font-bold">3</div>
                <div>
                  <h4 className="text-xs font-bold text-gray-800">Speaking Part 2 Cue-Card Timing</h4>
                  <p className="text-[11px] text-gray-500 leading-relaxed mt-0.5">
                    Record your speaking answers! Ensure you continue speaking for the full 2 minutes by structures of: "Past Event" ➔ "Current Thoughts" ➔ "Future Impact".
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-tr from-rose-500 to-pink-600 rounded-xl p-4 text-white text-xs space-y-2.5 relative overflow-hidden shadow-md shadow-rose-100">
            <div className="absolute right-0 top-0 h-24 w-24 bg-white/10 rounded-full blur-xl translate-x-4 -translate-y-4" />
            <div className="flex items-center gap-1.5 font-bold">
              <Sparkles className="h-4 w-4 animate-spin" />
              <span>Full Diagnostic Assessment</span>
            </div>
            <p className="text-[11px] text-rose-100 leading-relaxed">
              Unlock a full comprehensive 3-hour evaluation to receive formal simulated assessments matching official IELTS test guidelines.
            </p>
            <button className="bg-white text-rose-700 font-bold px-3 py-1.5 rounded-lg active:scale-95 transition-all w-full text-center">
              Register Diagnostic Exam
            </button>
          </div>
        </div>
      </div>

      {/* 4. Recent Attempt Diagnostic Reports with 4-Criteria Breakdown */}
      <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <div>
            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <Sliders className="h-4 w-4 text-rose-600" />
              <span>Recent Mock Test Diagnostic Reports & Criteria Breakdown</span>
            </h3>
            <p className="text-xs text-gray-400">Click any Writing or Speaking attempt to view the complete 4-criteria assessment breakdown with reasons and advice.</p>
          </div>
          <span className="text-xs text-gray-400 font-mono">{recentAttempts.length} Total Records</span>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {recentAttempts.map((attempt) => {
            const isWriting = attempt.category === 'writing';
            const isSpeaking = attempt.category === 'speaking';
            const hasCriteria = !!(attempt.writingEvaluation || attempt.speakingEvaluation);

            return (
              <div 
                key={attempt.id}
                onClick={() => setSelectedAttemptForModal(attempt)}
                className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between space-y-3 ${
                  hasCriteria ? 'border-indigo-200 bg-indigo-50/20 hover:border-indigo-400 hover:shadow-xs' : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded ${
                      attempt.category === 'listening' ? 'bg-blue-100 text-blue-800' :
                      attempt.category === 'reading' ? 'bg-indigo-100 text-indigo-800' :
                      attempt.category === 'writing' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {attempt.category}
                    </span>
                    <span className="text-[10px] font-mono text-gray-400">{attempt.date}</span>
                  </div>
                  <h4 className="text-xs font-bold text-gray-900 line-clamp-2 mt-1">{attempt.testTitle}</h4>
                </div>

                <div className="space-y-2 pt-2 border-t border-gray-100">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500 font-medium">Achieved Score:</span>
                    <span className="font-extrabold text-rose-600">Band {attempt.bandScore.toFixed(1)}</span>
                  </div>

                  {hasCriteria ? (
                    <button className="w-full text-center text-[10px] font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 py-1.5 rounded-lg flex items-center justify-center gap-1">
                      <Eye className="h-3 w-3" />
                      <span>View 4-Criteria Assessment</span>
                    </button>
                  ) : (
                    <span className="block text-[10px] text-gray-400 font-medium text-center italic">
                      Standard Module Score
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Attempt Diagnostic Report Modal */}
      {selectedAttemptForModal && (
        <div 
          className="fixed inset-0 z-50 overflow-y-auto bg-gray-900/60 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setSelectedAttemptForModal(null)}
        >
          <div 
            className="bg-white rounded-3xl max-w-3xl w-full p-6 border border-gray-100 shadow-2xl space-y-4 my-8 text-left animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <span className="text-[10px] font-extrabold uppercase bg-rose-50 text-rose-700 border border-rose-100 px-2 py-0.5 rounded">
                  Diagnostic Report
                </span>
                <h3 className="text-base font-bold text-gray-900 mt-1">{selectedAttemptForModal.testTitle}</h3>
                <p className="text-xs text-gray-400">Attempted on {selectedAttemptForModal.date} • Duration {selectedAttemptForModal.timeSpentMinutes} mins</p>
              </div>

              <button
                onClick={() => setSelectedAttemptForModal(null)}
                className="p-1.5 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {selectedAttemptForModal.category === 'writing' && (
              <AssessmentScorecard
                module="writing"
                writingEval={selectedAttemptForModal.writingEvaluation}
                editable={false}
              />
            )}

            {selectedAttemptForModal.category === 'speaking' && (
              <AssessmentScorecard
                module="speaking"
                speakingEval={selectedAttemptForModal.speakingEvaluation}
                editable={false}
              />
            )}

            {(selectedAttemptForModal.category === 'listening' || selectedAttemptForModal.category === 'reading') && (
              <div className="bg-gray-50 rounded-2xl p-6 text-center space-y-3">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                  <Award className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-gray-900">Objective Answer Module Result</h4>
                  <p className="text-xs text-gray-500 max-w-md mx-auto mt-1">
                    {selectedAttemptForModal.category === 'listening' ? 'Listening' : 'Reading'} scores are generated automatically based on raw accuracy out of 40 standard questions.
                  </p>
                </div>
                <div className="inline-block bg-white p-3 rounded-xl border border-gray-200 shadow-2xs font-mono text-xs text-gray-800">
                  Correct Answers: <strong>{selectedAttemptForModal.correctAnswers}</strong> / {selectedAttemptForModal.totalQuestions || 40} ➔ <strong className="text-rose-600">Band {selectedAttemptForModal.bandScore}</strong>
                </div>
              </div>
            )}

            {selectedAttemptForModal.examinerFeedback && (
              <div className="bg-amber-50/80 rounded-xl p-4 border border-amber-200/60 space-y-1">
                <span className="text-[10px] font-bold uppercase text-amber-800 tracking-wider">Examiner Note:</span>
                <p className="text-xs text-amber-950 font-medium leading-relaxed">{selectedAttemptForModal.examinerFeedback}</p>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
