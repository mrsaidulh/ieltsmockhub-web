import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Trophy, BookOpen, Clock, Flame, 
  Sparkles, CheckCircle2, ChevronRight,
  TrendingUp, Compass, Target, ArrowRight
} from 'lucide-react';
import { UserProgress, AttemptHistory, TestCategory } from '../types';
import MetricCard from './MetricCard';

interface DashboardOverviewProps {
  progress: UserProgress;
  recentAttempts: AttemptHistory[];
  onSelectCategory: (category: TestCategory) => void;
  onSelectType: (type: any) => void;
  streakIncremented: boolean;
  onClaimStreak: () => void;
}

export default function DashboardOverview({
  progress,
  recentAttempts,
  onSelectCategory,
  onSelectType,
  streakIncremented,
  onClaimStreak,
}: DashboardOverviewProps) {
  const [claimedReward, setClaimedReward] = useState(false);

  // Calculate current average band from mock history
  const averageBand = parseFloat(
    (recentAttempts.reduce((sum, att) => sum + att.bandScore, 0) / recentAttempts.length).toFixed(2)
  ) || 6.88;

  // Percentage of progress towards target
  const progressPercent = Math.min(Math.round((averageBand / progress.targetBand) * 100), 100);

  const skillAverages = {
    listening: 7.0,
    reading: 7.5,
    writing: 6.5,
    speaking: 6.5,
  };

  const handleClaim = () => {
    if (!streakIncremented) {
      onClaimStreak();
      setClaimedReward(true);
      setTimeout(() => setClaimedReward(false), 3000);
    }
  };

  return (
    <div className="space-y-8 py-6" id="dashboard-overview-container">
      
      {/* 1. Hero Welcome & Goal Tracker Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-gray-900 via-gray-800 to-rose-950 p-6 text-white shadow-xl sm:p-8">
        {/* Background Ambient Glows */}
        <div className="absolute top-0 right-0 h-64 w-64 rounded-full bg-rose-500/10 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-48 w-48 rounded-full bg-pink-500/10 blur-3xl" />

        <div className="relative z-10 flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-rose-500/20 px-3 py-1 text-xs font-semibold text-rose-300 border border-rose-500/30">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Aiming for Excellence</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Hello, Jane Doe! Ready to achieve your band {progress.targetBand}?
            </h1>
            <p className="max-w-xl text-sm text-gray-300 leading-relaxed">
              Welcome back to <span className="font-semibold text-rose-300">IELTS Mock Hub</span>. Your consistent effort pays off. Today, we recommend taking a Listening or Reading mock drill to boost your score!
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <button
                onClick={() => onSelectCategory('listening')}
                className="inline-flex items-center gap-1.5 rounded-xl bg-rose-600 px-4 py-2 text-xs font-semibold text-white transition-all hover:bg-rose-500 active:scale-95 shadow-lg shadow-rose-900/30"
              >
                Start Listening Drill
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => onSelectType('Analytics')}
                className="inline-flex items-center gap-1.5 rounded-xl bg-white/10 px-4 py-2 text-xs font-semibold text-white border border-white/10 transition-all hover:bg-white/15 active:scale-95"
              >
                View Target Roadmap
              </button>
            </div>
          </div>

          {/* Goal Tracker Dashboard Circle */}
          <div className="flex items-center gap-4 rounded-2xl bg-white/5 p-4 sm:p-5 backdrop-blur border border-white/10 self-start lg:self-center">
            <div className="relative flex h-20 w-20 items-center justify-center">
              <svg className="absolute top-0 left-0 h-full w-full -rotate-90">
                <circle
                  cx="40"
                  cy="40"
                  r="34"
                  className="stroke-white/10"
                  strokeWidth="6"
                  fill="transparent"
                />
                <circle
                  cx="40"
                  cy="40"
                  r="34"
                  className="stroke-rose-500"
                  strokeWidth="6"
                  fill="transparent"
                  strokeDasharray={2 * Math.PI * 34}
                  strokeDashoffset={2 * Math.PI * 34 * (1 - progressPercent / 100)}
                  strokeLinecap="round"
                />
              </svg>
              <div className="text-center">
                <span className="text-xl font-extrabold">{averageBand}</span>
                <span className="block text-[9px] text-gray-400 font-semibold tracking-wider">BAND</span>
              </div>
            </div>
            <div className="space-y-1">
              <span className="text-xs font-bold text-rose-300">Goal Target Tracker</span>
              <p className="text-[11px] text-gray-300">
                You are at <span className="font-semibold text-white">{progressPercent}%</span> of your band <span className="font-semibold text-white">{progress.targetBand}</span> objective.
              </p>
              <div className="flex items-center gap-1 text-[10px] text-gray-400">
                <Target className="h-3 w-3 text-rose-400" />
                <span>Target: {progress.targetBand} • Current Avg: {averageBand}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. KPIs Metrics Cards Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Average Band Score"
          value={averageBand.toFixed(2)}
          subtext={`Target Band: ${progress.targetBand}`}
          icon={Trophy}
          color="rose"
          trend="+0.38 this month"
        />
        <MetricCard
          title="Mock Tests Taken"
          value={progress.completedTestsCount}
          subtext="Tests completed successfully"
          icon={BookOpen}
          color="indigo"
        />
        <MetricCard
          title="Practice Time"
          value={`${progress.practiceTimeHours} hrs`}
          subtext="Total duration elapsed"
          icon={Clock}
          color="blue"
        />
        <MetricCard
          title="Daily Habit Streak"
          value={`${progress.streakDays} Days`}
          subtext={streakIncremented ? "Practice registered today!" : "Complete a test to maintain!"}
          icon={Flame}
          color="orange"
          trend={streakIncremented ? "Claimed" : "Ready"}
        />
      </div>

      {/* 3. Skill Radar Breakdown and Streak claim container */}
      <div className="grid gap-6 lg:grid-cols-3">
        
        {/* Core Skill Progress Ring Panel */}
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-gray-900">Module Band Breakdowns</h2>
              <p className="text-xs text-gray-400">Average scores computed across mock practices</p>
            </div>
            <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full uppercase tracking-wider">
              IELTS Academic
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {Object.entries(skillAverages).map(([skill, score]) => {
              const capSkill = skill.charAt(0).toUpperCase() + skill.slice(1);
              const percent = Math.min((score / 9.0) * 100, 100);
              
              // Custom colors based on skill
              const skillColor = 
                skill === 'listening' ? 'text-blue-600 stroke-blue-500 bg-blue-50/50' :
                skill === 'reading' ? 'text-rose-600 stroke-rose-500 bg-rose-50/50' :
                skill === 'writing' ? 'text-amber-600 stroke-amber-500 bg-amber-50/50' :
                'text-emerald-600 stroke-emerald-500 bg-emerald-50/50';

              return (
                <div 
                  key={skill} 
                  onClick={() => onSelectCategory(skill as TestCategory)}
                  className="group flex flex-col items-center p-3 rounded-xl hover:bg-gray-55/60 border border-transparent hover:border-gray-100 transition-all cursor-pointer"
                >
                  <div className="relative flex h-16 w-16 items-center justify-center">
                    <svg className="absolute top-0 left-0 h-full w-full -rotate-90">
                      <circle cx="32" cy="32" r="26" className="stroke-gray-100" strokeWidth="4" fill="transparent" />
                      <circle
                        cx="32"
                        cy="32"
                        r="26"
                        className={`${skillColor}`}
                        strokeWidth="4"
                        fill="transparent"
                        strokeDasharray={2 * Math.PI * 26}
                        strokeDashoffset={2 * Math.PI * 26 * (1 - percent / 100)}
                        strokeLinecap="round"
                      />
                    </svg>
                    <span className="text-sm font-bold text-gray-800">{score.toFixed(1)}</span>
                  </div>
                  <span className="mt-2 text-xs font-semibold text-gray-700 group-hover:text-rose-600 transition-colors">
                    {capSkill}
                  </span>
                  <span className="text-[10px] text-gray-400">Target: {progress.targetBand}</span>
                </div>
              );
            })}
          </div>

          <div className="rounded-xl bg-gray-50 p-3.5 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Compass className="h-4 w-4 text-rose-500" />
              <span>Looking to test a specific section? Get immediate bands in 15 mins.</span>
            </div>
            <button 
              onClick={() => onSelectCategory('all')} 
              className="text-xs font-bold text-rose-600 hover:text-rose-700 inline-flex items-center gap-0.5"
            >
              Explore Sectional Tests
              <ChevronRight className="h-3 w-3" />
            </button>
          </div>
        </div>

        {/* Dynamic Streak Panel */}
        <div className="flex flex-col justify-between rounded-2xl border border-gray-100 bg-white p-5 shadow-sm space-y-4">
          <div className="space-y-1">
            <h2 className="text-base font-bold text-gray-900">Daily Preparation Goals</h2>
            <p className="text-xs text-gray-400">Build daily learning habits to boost scores</p>
          </div>

          <div className="flex flex-col items-center py-2 text-center space-y-3">
            <div className={`relative flex h-14 w-14 items-center justify-center rounded-full ${
              streakIncremented ? 'bg-orange-100 text-orange-600' : 'bg-gray-100 text-gray-400'
            }`}>
              <Flame className={`h-8 w-8 ${streakIncremented ? 'fill-orange-500 animate-pulse' : ''}`} />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-800">
                {streakIncremented ? 'Daily Habit Secured!' : 'Register Today\'s Practice'}
              </p>
              <p className="text-xs text-gray-500 max-w-[200px] mx-auto mt-1">
                {streakIncremented 
                  ? `Outstanding! You have checked in for ${progress.streakDays} consecutive days.` 
                  : 'Maintain your streak! Claim your standard practice bonus point now.'}
              </p>
            </div>
          </div>

          <button
            onClick={handleClaim}
            disabled={streakIncremented}
            className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all ${
              streakIncremented
                ? 'bg-orange-50 text-orange-600 border border-orange-100 cursor-default'
                : 'bg-orange-500 text-white hover:bg-orange-600 active:scale-[0.98] shadow-sm shadow-orange-100 cursor-pointer'
            }`}
          >
            {streakIncremented ? 'Streak Claimed ✓' : 'Claim Daily Streak +1'}
          </button>

          <AnimatePresence>
            {claimedReward && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="text-center text-[10px] font-semibold text-orange-600 flex items-center justify-center gap-1"
              >
                <Sparkles className="h-3 w-3 animate-spin" />
                <span>Habit Reward Claimed! Streak is now {progress.streakDays} days!</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>

      {/* 4. Recent Test Attempts & Examiner Feedback */}
      <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-gray-900">Recent Practice History & Feedback</h2>
            <p className="text-xs text-gray-400">Explore diagnostic examiner commentary on your attempts</p>
          </div>
          <button 
            onClick={() => onSelectType('Analytics')}
            className="text-xs font-bold text-rose-600 hover:text-rose-700"
          >
            View Full Analysis
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-500">
            <thead className="bg-gray-50 text-[10px] font-bold uppercase tracking-wider text-gray-400">
              <tr>
                <th className="px-4 py-3 rounded-l-xl">Practice Test</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Date Taken</th>
                <th className="px-4 py-3">Accuracy / Time</th>
                <th className="px-4 py-3">Band Score</th>
                <th className="px-4 py-3 rounded-r-xl">Examiner Recommendation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {recentAttempts.map((att) => {
                const isListening = att.category === 'listening';
                const isReading = att.category === 'reading';
                const isWriting = att.category === 'writing';
                
                const catColor = 
                  isListening ? 'bg-blue-50 text-blue-600' :
                  isReading ? 'bg-rose-50 text-rose-600' :
                  isWriting ? 'bg-amber-50 text-amber-600' :
                  'bg-emerald-50 text-emerald-600';

                return (
                  <tr key={att.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3.5 font-semibold text-gray-900 max-w-xs truncate">{att.testTitle}</td>
                    <td className="px-4 py-3.5">
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${catColor}`}>
                        {att.category}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-gray-500 whitespace-nowrap">{att.date}</td>
                    <td className="px-4 py-3.5 text-gray-600">
                      {att.correctAnswers ? (
                        <div className="flex flex-col">
                          <span className="font-semibold text-gray-800">{att.correctAnswers}/{att.totalQuestions} Right</span>
                          <span className="text-[10px] text-gray-400">{att.timeSpentMinutes} mins spent</span>
                        </div>
                      ) : (
                        <span className="font-medium text-gray-700">{att.timeSpentMinutes} mins elapsed</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 font-bold text-rose-600 text-sm whitespace-nowrap">
                      Band {att.bandScore.toFixed(1)}
                    </td>
                    <td className="px-4 py-3.5 text-gray-600 max-w-md">
                      <div className="flex items-start gap-1">
                        <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-emerald-500" />
                        <span className="text-[11px] leading-relaxed line-clamp-2" title={att.examinerFeedback}>
                          {att.examinerFeedback}
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
