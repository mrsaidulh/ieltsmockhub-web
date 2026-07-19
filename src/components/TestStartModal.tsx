import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, Check, AlertCircle, Clock, HelpCircle, 
  Sparkles, FileText, Play, CheckCircle2, Award 
} from 'lucide-react';
import { IELTSTest } from '../types';

interface TestStartModalProps {
  test: IELTSTest | null;
  onClose: () => void;
  onConfirmStart: (test: IELTSTest, mode: 'Practice' | 'Exam') => void;
}

export default function TestStartModal({
  test,
  onClose,
  onConfirmStart,
}: TestStartModalProps) {
  const [selectedMode, setSelectedMode] = useState<'Practice' | 'Exam'>('Practice');
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulatedScore, setSimulatedScore] = useState<number | null>(null);

  if (!test) return null;

  const handleStart = () => {
    setIsSimulating(true);
    // Simulate a brief testing sequence
    setTimeout(() => {
      // Pick a random realistic score centered around their target
      const scores = [6.0, 6.5, 7.0, 7.5, 8.0, 8.5];
      const randomScore = scores[Math.floor(Math.random() * scores.length)];
      setSimulatedScore(randomScore);
    }, 2000);
  };

  const handleCompleteSimulation = () => {
    if (simulatedScore !== null) {
      onConfirmStart(test, selectedMode);
      setIsSimulating(false);
      setSimulatedScore(null);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-950/40 backdrop-blur-sm">
      {/* Modal Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="relative w-full max-w-xl overflow-hidden rounded-3xl border border-gray-100 bg-white p-6 shadow-2xl"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 rounded-full p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
        >
          <X className="h-5 w-5" />
        </button>

        {!isSimulating ? (
          <div className="space-y-6">
            {/* Header */}
            <div className="space-y-2">
              <span className="rounded-md bg-rose-50 border border-rose-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-rose-700">
                {test.category} Practice
              </span>
              <h3 className="font-sans text-lg font-bold text-gray-900 leading-snug pr-8">
                {test.title}
              </h3>
              <p className="text-xs text-gray-500">
                {test.description}
              </p>
            </div>

            {/* Test Details Grid */}
            <div className="grid grid-cols-2 gap-3 bg-gray-50 p-4 rounded-2xl border border-gray-100/50">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-gray-500 shadow-sm">
                  <Clock className="h-4.5 w-4.5 text-rose-500" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Timing</p>
                  <p className="text-xs font-semibold text-gray-800">{test.durationMinutes} Minutes</p>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-gray-500 shadow-sm">
                  <HelpCircle className="h-4.5 w-4.5 text-blue-500" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Questions</p>
                  <p className="text-xs font-semibold text-gray-800">{test.questionsCount} Item Drill</p>
                </div>
              </div>
            </div>

            {/* Mode Selectors */}
            <div className="space-y-2.5">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Select Practice Mode</label>
              
              <div className="grid gap-3 sm:grid-cols-2">
                {/* Practice Mode Choice */}
                <button
                  type="button"
                  onClick={() => setSelectedMode('Practice')}
                  className={`flex flex-col text-left p-4 rounded-2xl border transition-all relative ${
                    selectedMode === 'Practice'
                      ? 'border-rose-600 bg-rose-50/20'
                      : 'border-gray-200 bg-white hover:bg-gray-50'
                  }`}
                >
                  {selectedMode === 'Practice' && (
                    <div className="absolute top-3 right-3 flex h-4 w-4 items-center justify-center rounded-full bg-rose-600 text-white">
                      <Check className="h-3 w-3 stroke-[3]" />
                    </div>
                  )}
                  <span className="text-xs font-bold text-gray-800">Practice Mode (Untimed)</span>
                  <span className="text-[10px] text-gray-400 mt-1 leading-normal">
                    Perfect for initial reviews. Explanations and answer guides are displayed immediately after each response.
                  </span>
                </button>

                {/* Exam Mode Choice */}
                <button
                  type="button"
                  onClick={() => setSelectedMode('Exam')}
                  className={`flex flex-col text-left p-4 rounded-2xl border transition-all relative ${
                    selectedMode === 'Exam'
                      ? 'border-rose-600 bg-rose-50/20'
                      : 'border-gray-200 bg-white hover:bg-gray-50'
                  }`}
                >
                  {selectedMode === 'Exam' && (
                    <div className="absolute top-3 right-3 flex h-4 w-4 items-center justify-center rounded-full bg-rose-600 text-white">
                      <Check className="h-3 w-3 stroke-[3]" />
                    </div>
                  )}
                  <span className="text-xs font-bold text-gray-800">Exam Mode (Real-time Simulation)</span>
                  <span className="text-[10px] text-gray-400 mt-1 leading-normal">
                    Emulates actual IELTS specifications. Strict timers run, with results and expert breakdowns visible only upon completion.
                  </span>
                </button>
              </div>
            </div>

            {/* General Guidelines Note */}
            <div className="flex gap-2.5 items-start p-3 bg-amber-50/50 rounded-xl border border-amber-100/50 text-[11px] text-amber-800 leading-normal">
              <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
              <span>
                Please ensure a quiet environment and reliable connectivity. In Exam Mode, leaving or refreshing the page will pause your timer, but we strongly advise simulating a full, unbroken session.
              </span>
            </div>

            {/* Launch Action */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 border border-gray-200 text-gray-500 font-bold rounded-xl text-xs hover:bg-gray-50 transition-all active:scale-[0.98]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleStart}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl text-xs shadow-md shadow-rose-100 transition-all active:scale-[0.98] flex items-center justify-center gap-1.5"
              >
                <Play className="h-3.5 w-3.5 fill-current" />
                <span>Begin Test Simulation</span>
              </button>
            </div>
          </div>
        ) : (
          /* Active Simulation state */
          <div className="py-8 text-center space-y-6">
            {simulatedScore === null ? (
              <div className="space-y-4">
                <div className="flex justify-center">
                  <div className="h-14 w-14 rounded-full border-4 border-rose-600 border-t-transparent animate-spin" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Simulating Live Test Environment...</h4>
                  <p className="text-xs text-gray-400 max-w-xs mx-auto mt-1 leading-relaxed">
                    Analyzing active questions, grading reading patterns, and formulating examiner metrics. This simulates the student's exam experience.
                  </p>
                </div>
                <div className="max-w-xs mx-auto bg-gray-50 rounded-full h-1.5 overflow-hidden border border-gray-100">
                  <div className="h-full bg-rose-500 animate-pulse" style={{ width: '100%' }} />
                </div>
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-6"
              >
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                  <CheckCircle2 className="h-8 w-8 animate-bounce" />
                </div>
                
                <div>
                  <h4 className="text-base font-bold text-gray-900">Simulation Complete!</h4>
                  <p className="text-xs text-gray-400 max-w-xs mx-auto mt-1 leading-relaxed">
                    You have successfully completed <span className="font-semibold text-gray-800">{test.title}</span>. Your performance metrics have been computed.
                  </p>
                </div>

                <div className="inline-flex items-center gap-3 bg-rose-50 border border-rose-100 px-6 py-4 rounded-2xl">
                  <Award className="h-8 w-8 text-rose-600" />
                  <div className="text-left">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Achieved Score</p>
                    <p className="text-xl font-black text-rose-700">Band {simulatedScore.toFixed(1)}</p>
                  </div>
                </div>

                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 text-xs text-gray-600 leading-normal max-w-sm mx-auto text-left">
                  <span className="font-bold text-gray-700 block mb-1">Simulated Examiner Advice:</span>
                  Outstanding attempt! Your time-management in this module fits criteria for high band results. Review the detailed category dashboard indicators to address minor structural points.
                </div>

                <button
                  type="button"
                  onClick={handleCompleteSimulation}
                  className="w-full max-w-xs py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl text-xs shadow-md shadow-rose-100 transition-all active:scale-[0.98]"
                >
                  Record Result & Return Home
                </button>
              </motion.div>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
}
