import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, ShieldCheck, Trophy, BookOpen, Clock, Flame, 
  CheckCircle2, LogOut, GraduationCap
} from 'lucide-react';
import { StudentLead, UserProgress, AttemptHistory, TestCategory } from '../types';
import MetricCard from './MetricCard';

interface StudentProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: StudentLead | null;
  progress: UserProgress;
  recentAttempts: AttemptHistory[];
  streakIncremented: boolean;
  onClaimStreak: () => void;
  onLogout: () => void;
}

function CircularProgress({ 
  value, 
  target, 
  label, 
  strokeColor 
}: { 
  value: number; 
  target: number; 
  label: string; 
  strokeColor: string; 
}) {
  const percentage = (value / 9) * 100;
  const radius = 24;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="flex flex-col items-center text-center space-y-1.5">
      <div className="relative flex items-center justify-center h-14 w-14 sm:h-16 sm:w-16">
        <svg className="w-full h-full transform -rotate-90">
          <circle
            cx="50%"
            cy="50%"
            r={radius}
            className="stroke-gray-100 fill-transparent"
            strokeWidth="4"
          />
          <motion.circle
            cx="50%"
            cy="50%"
            r={radius}
            className={`fill-transparent ${strokeColor}`}
            strokeWidth="4"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1, ease: 'easeOut' }}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute flex items-center justify-center">
          <span className="text-xs sm:text-sm font-black text-gray-800 font-mono">{value.toFixed(1)}</span>
        </div>
      </div>
      <div>
        <h5 className="text-[10px] font-extrabold text-gray-700 uppercase tracking-wide leading-tight">{label}</h5>
        <p className="text-[9px] font-semibold text-gray-400">Target: {target.toFixed(1)}</p>
      </div>
    </div>
  );
}

export default function StudentProfileModal({
  isOpen,
  onClose,
  currentUser,
  progress,
  recentAttempts,
  streakIncremented,
  onClaimStreak,
  onLogout
}: StudentProfileModalProps) {
  if (!isOpen || !currentUser) return null;

  const averageBand = useMemo(() => {
    if (recentAttempts.length > 0) {
      return parseFloat(
        (recentAttempts.reduce((sum, att) => sum + att.bandScore, 0) / recentAttempts.length).toFixed(2)
      );
    }
    return 6.88;
  }, [recentAttempts]);

  const moduleAverages = useMemo(() => {
    const categories: TestCategory[] = ['listening', 'reading', 'writing', 'speaking'];
    const averages: Record<string, number> = {
      listening: 7.0,
      reading: 7.5,
      writing: 6.5,
      speaking: 6.5,
    };

    categories.forEach((cat) => {
      const attempts = recentAttempts.filter((a) => a.category === cat);
      if (attempts.length > 0) {
        const sum = attempts.reduce((s, a) => s + a.bandScore, 0);
        averages[cat] = parseFloat((sum / attempts.length).toFixed(1));
      }
    });

    return averages;
  }, [recentAttempts]);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-xs overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-3xl rounded-3xl bg-white p-6 shadow-2xl border border-gray-100 space-y-6 max-h-[90vh] overflow-y-auto"
        >
          {/* Header Bar */}
          <div className="flex items-center justify-between border-b border-gray-100 pb-4">
            <div className="flex items-center gap-2 text-left">
              <div className="h-9 w-9 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center font-bold">
                <GraduationCap className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-gray-900">Student Profile & Performance</h3>
                <p className="text-xs text-gray-400">Verified IELTS candidate account overview</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  onLogout();
                  onClose();
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-gray-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer border border-gray-200"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span>Logout</span>
              </button>
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Welcome and Verification Banner */}
          <div className="rounded-2xl border border-rose-100 bg-gradient-to-r from-rose-500 to-pink-600 p-5 text-white shadow-md shadow-rose-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4 text-left">
              <div className="h-12 w-12 rounded-full bg-white/20 ring-4 ring-white/10 flex items-center justify-center text-white font-black text-sm uppercase shrink-0">
                {currentUser.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
              </div>
              <div className="space-y-0.5">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-base sm:text-lg font-extrabold tracking-tight">Welcome, {currentUser.name}!</h2>
                  <span className="text-[9px] font-bold text-emerald-600 bg-white px-1.5 py-0.5 rounded-md flex items-center gap-0.5 shadow-sm uppercase tracking-wider">
                    <ShieldCheck className="h-3 w-3 text-emerald-500" />
                    Verified Student
                  </span>
                </div>
                <p className="text-xs text-rose-100 leading-normal">
                  Registered Mobile: <strong>{currentUser.phone}</strong> | Email: <strong>{currentUser.email}</strong>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-xl border border-white/10 self-stretch sm:self-auto justify-center shrink-0">
              <div className="text-center sm:text-right">
                <p className="text-[9px] font-bold uppercase tracking-wider text-rose-100">Student ID</p>
                <p className="font-mono text-xs font-black tracking-widest text-white">
                  IMH-2026-{currentUser.phone.slice(-4)}
                </p>
              </div>
            </div>
          </div>

          {/* Metric Cards Row */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <MetricCard
              title="Average Band Score"
              value={averageBand.toFixed(2)}
              subtext={`Target Band: ${progress.targetBand}`}
              icon={Trophy}
              trend="+0.38 this month"
              color="rose"
            />
            <MetricCard
              title="Mock Tests Taken"
              value={progress.completedTestsCount}
              subtext="Tests completed"
              icon={BookOpen}
              color="indigo"
            />
            <MetricCard
              title="Practice Time"
              value={`${progress.practiceTimeHours} hrs`}
              subtext="Total duration"
              icon={Clock}
              color="blue"
            />
            <MetricCard
              title="Daily Habit Streak"
              value={`${progress.streakDays} Days`}
              subtext="Complete a test to maintain!"
              icon={Flame}
              trend={streakIncremented ? 'Claimed' : 'Ready'}
              color="orange"
            />
          </div>

          {/* Module Band Breakdowns & Streak Row */}
          <div className="grid gap-6 sm:grid-cols-3">
            <div className="sm:col-span-2 rounded-2xl border border-gray-150 bg-white p-4 space-y-4">
              <div className="flex items-center justify-between text-left">
                <div>
                  <h4 className="text-xs font-extrabold text-gray-900">Module Band Breakdowns</h4>
                  <p className="text-[10px] text-gray-400">Average scores computed across mock practices</p>
                </div>
                <span className="text-[9px] font-black tracking-widest text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-100 uppercase">
                  IELTS Academic
                </span>
              </div>

              <div className="grid grid-cols-4 gap-2 pt-2">
                <CircularProgress
                  value={moduleAverages.listening}
                  target={progress.targetBand}
                  label="Listening"
                  strokeColor="stroke-blue-500"
                />
                <CircularProgress
                  value={moduleAverages.reading}
                  target={progress.targetBand}
                  label="Reading"
                  strokeColor="stroke-rose-500"
                />
                <CircularProgress
                  value={moduleAverages.writing}
                  target={progress.targetBand}
                  label="Writing"
                  strokeColor="stroke-amber-500"
                />
                <CircularProgress
                  value={moduleAverages.speaking}
                  target={progress.targetBand}
                  label="Speaking"
                  strokeColor="stroke-emerald-500"
                />
              </div>
            </div>

            <div className="rounded-2xl border border-gray-150 bg-white p-4 flex flex-col justify-between space-y-3">
              <div className="text-left">
                <h4 className="text-xs font-extrabold text-gray-900">Daily Preparation Goals</h4>
                <p className="text-[10px] text-gray-400">Build learning habits</p>
              </div>

              <div className="flex flex-col items-center justify-center text-center py-1">
                <div className="h-10 w-10 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center ring-4 ring-orange-500/10 mb-2">
                  <Flame className="h-5 w-5" />
                </div>
                <h5 className="text-xs font-extrabold text-gray-900">Practice Streak</h5>
              </div>

              <button
                onClick={onClaimStreak}
                disabled={streakIncremented}
                className={`w-full py-2 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 shadow-sm cursor-pointer ${
                  streakIncremented
                    ? 'bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed shadow-none'
                    : 'bg-gradient-to-r from-orange-500 to-rose-600 hover:from-orange-600 hover:to-rose-700 text-white shadow-orange-100 active:scale-98'
                }`}
              >
                {streakIncremented ? (
                  <>
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                    <span>Streak Claimed (+1)</span>
                  </>
                ) : (
                  <>
                    <Flame className="h-3.5 w-3.5" />
                    <span>Claim Daily Streak +1</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
