import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { 
  Calendar, Clock, Headphones, BookOpen, SquarePen, Mic, 
  Sparkles, Play, Search, GraduationCap, Star, ArrowRight,
  HelpCircle, SlidersHorizontal, Trophy, Flame, Award, 
  TrendingUp, User, Smartphone, Mail, CheckCircle2, ShieldCheck, Compass
} from 'lucide-react';
import { UserProgress, AttemptHistory, TestCategory, IELTSTest, StudentLead } from '../types';
import MetricCard from './MetricCard';

interface DashboardOverviewProps {
  progress: UserProgress;
  recentAttempts: AttemptHistory[];
  onSelectCategory: (category: TestCategory) => void;
  onSelectType: (type: any) => void;
  streakIncremented: boolean;
  onClaimStreak: () => void;
  tests: IELTSTest[];
  onStartTest: (test: IELTSTest) => void;
  currentUser: StudentLead | null;
  onOpenAuth: () => void;
}

function CircularProgress({ 
  value, 
  target, 
  label, 
  colorClass, 
  strokeColor 
}: { 
  value: number; 
  target: number; 
  label: string; 
  colorClass: string; 
  strokeColor: string; 
}) {
  const percentage = (value / 9) * 100;
  const radius = 24;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="flex flex-col items-center text-center space-y-1.5">
      <div className="relative flex items-center justify-center h-14 w-14 sm:h-16 sm:w-16">
        {/* Progress SVG */}
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

export default function DashboardOverview({
  progress,
  recentAttempts,
  onSelectCategory,
  onSelectType,
  streakIncremented,
  onClaimStreak,
  tests,
  onStartTest,
  currentUser,
  onOpenAuth,
}: DashboardOverviewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedYear, setSelectedYear] = useState<string>('All');

  // Calculate average band score
  const averageBand = useMemo(() => {
    if (recentAttempts.length > 0) {
      return parseFloat(
        (recentAttempts.reduce((sum, att) => sum + att.bandScore, 0) / recentAttempts.length).toFixed(2)
      );
    }
    return 6.88;
  }, [recentAttempts]);

  // Module breakdowns computed dynamically from history, falling back to realistic starting stats
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

  // Extract all unique years present in tests to populate filter options dynamically
  const availableYears = useMemo(() => {
    const yearsSet = new Set<string>();
    tests.forEach((test) => {
      if (test.year) {
        yearsSet.add(test.year.toString());
      }
    });
    return Array.from(yearsSet).sort((a, b) => b.localeCompare(a)); // Sort desc (recent first)
  }, [tests]);

  // Filter tests by search keyword and selected year
  const filteredTests = useMemo(() => {
    return tests.filter((test) => {
      const matchesSearch = 
        test.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        test.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        test.category.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesYear = 
        selectedYear === 'All' || 
        (test.year && test.year.toString() === selectedYear);

      return matchesSearch && matchesYear;
    });
  }, [tests, searchQuery, selectedYear]);

  // Helper icons for categories
  const categoryIcons = {
    listening: Headphones,
    reading: BookOpen,
    writing: SquarePen,
    speaking: Mic,
    all: GraduationCap
  };

  const catBadgeColors = {
    listening: 'bg-blue-50 text-blue-700 border-blue-100',
    reading: 'bg-rose-50 text-rose-700 border-rose-100',
    writing: 'bg-amber-50 text-amber-700 border-amber-100',
    speaking: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    all: 'bg-gray-50 text-gray-700 border-gray-100'
  };

  return (
    <div className="space-y-6 py-6" id="dashboard-overview-container">

      {/* 1. Student Dashboard Metrics & Goals Block */}
      {currentUser ? (
        <div className="space-y-6">
          {/* Welcome and Verification Banner */}
          <div className="rounded-2xl border border-rose-100 bg-gradient-to-r from-rose-500 to-pink-600 p-5 text-white shadow-md shadow-rose-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4 text-left">
              <div className="h-12 w-12 rounded-full bg-white/20 ring-4 ring-white/10 flex items-center justify-center text-white font-black text-sm uppercase">
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
                  Your student account is active. Practicing IELTS with verified mobile number: <strong>{currentUser.phone}</strong>
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-xl border border-white/10 self-stretch sm:self-auto justify-center">
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
              subtext="Complete a test to maintain!"
              icon={Flame}
              trend={streakIncremented ? 'Claimed' : 'Ready'}
              color="orange"
            />
          </div>

          {/* Module Band Breakdowns & Daily Preparation Goals Row */}
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Module Band Breakdowns Box */}
            <div className="lg:col-span-2 rounded-2xl border border-gray-150 bg-white p-5 shadow-xs space-y-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <div className="text-left">
                    <h3 className="text-sm font-extrabold text-gray-900">Module Band Breakdowns</h3>
                    <p className="text-xs text-gray-400">Average scores computed across mock practices</p>
                  </div>
                  <span className="text-[10px] font-black tracking-widest text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-100 uppercase">
                    IELTS Academic
                  </span>
                </div>

                <div className="grid grid-cols-4 gap-2 pt-6 pb-2">
                  <CircularProgress
                    value={moduleAverages.listening}
                    target={progress.targetBand}
                    label="Listening"
                    colorClass="text-blue-600 bg-blue-50"
                    strokeColor="stroke-blue-500"
                  />
                  <CircularProgress
                    value={moduleAverages.reading}
                    target={progress.targetBand}
                    label="Reading"
                    colorClass="text-rose-600 bg-rose-50"
                    strokeColor="stroke-rose-500"
                  />
                  <CircularProgress
                    value={moduleAverages.writing}
                    target={progress.targetBand}
                    label="Writing"
                    colorClass="text-amber-600 bg-amber-50"
                    strokeColor="stroke-amber-500"
                  />
                  <CircularProgress
                    value={moduleAverages.speaking}
                    target={progress.targetBand}
                    label="Speaking"
                    colorClass="text-emerald-600 bg-emerald-50"
                    strokeColor="stroke-emerald-500"
                  />
                </div>
              </div>

              <div className="bg-gray-50 border border-gray-100 rounded-xl p-3 flex flex-col sm:flex-row items-center justify-between gap-3 text-left">
                <span className="text-[11px] text-gray-500 flex items-center gap-1.5 font-medium">
                  <Compass className="h-4 w-4 text-rose-500 shrink-0" />
                  Looking to test a specific section? Get immediate bands in 15 mins.
                </span>
                <button
                  onClick={() => onSelectCategory('reading')}
                  className="text-[11px] font-bold text-rose-600 hover:text-rose-700 transition-colors inline-flex items-center gap-1 cursor-pointer"
                >
                  <span>Explore Sectional Tests</span>
                  <ArrowRight className="h-3 w-3" />
                </button>
              </div>
            </div>

            {/* Daily Preparation Goals Box */}
            <div className="rounded-2xl border border-gray-150 bg-white p-5 shadow-xs flex flex-col justify-between space-y-4">
              <div className="text-left">
                <h3 className="text-sm font-extrabold text-gray-900">Daily Preparation Goals</h3>
                <p className="text-xs text-gray-400">Build daily learning habits to boost scores</p>
              </div>

              <div className="flex flex-col items-center justify-center text-center py-2 space-y-3.5">
                <div className="h-12 w-12 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center ring-4 ring-orange-500/10">
                  <Flame className="h-6 w-6" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-xs sm:text-sm font-extrabold text-gray-900">Register Today's Practice</h4>
                  <p className="text-xs text-gray-500 max-w-xs leading-normal">
                    Maintain your streak! Claim your standard practice bonus point now.
                  </p>
                </div>
              </div>

              <button
                onClick={onClaimStreak}
                disabled={streakIncremented}
                className={`w-full py-2.5 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 shadow-sm cursor-pointer ${
                  streakIncremented
                    ? 'bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed shadow-none'
                    : 'bg-gradient-to-r from-orange-500 to-rose-600 hover:from-orange-600 hover:to-rose-700 text-white shadow-orange-100 active:scale-98'
                }`}
              >
                {streakIncremented ? (
                  <>
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    <span>Streak Claimed Today (+1)</span>
                  </>
                ) : (
                  <>
                    <Flame className="h-4 w-4" />
                    <span>Claim Daily Streak +1</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* LOCK STATE: GUEST USER ACCESS TO STUDENT DASHBOARD PREVIEW */
        <div className="space-y-6">
          <div className="relative overflow-hidden rounded-2xl border border-rose-100 bg-gradient-to-br from-rose-50/50 to-pink-50/20 p-6 sm:p-8 shadow-xs text-center space-y-4">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-100 text-rose-600 shadow-md shadow-rose-100">
              <GraduationCap className="h-7 w-7" />
            </div>
            <div className="max-w-md mx-auto space-y-2">
              <h3 className="text-base sm:text-lg font-extrabold text-gray-900 tracking-tight">🔒 Personal Student Dashboard</h3>
              <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">
                Log in or verify your mobile number to view personal band averages, dynamic circular progress indicators, and claim your daily habit streak.
              </p>
            </div>
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={onOpenAuth}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white px-5 py-2.5 text-xs sm:text-sm font-extrabold transition-all active:scale-95 cursor-pointer shadow-md shadow-rose-100"
              >
                <User className="h-4 w-4" />
                <span>Login / Register Student</span>
              </button>
            </div>
          </div>

          {/* BLURRED/PREVIEW STATS FOR THE GUEST (ENGAGING UI) */}
          <div className="relative">
            <div className="absolute inset-0 bg-white/40 backdrop-blur-[1px] z-10 flex items-center justify-center rounded-2xl border border-gray-150/30" />
            
            <div className="space-y-6 opacity-30 select-none pointer-events-none">
              {/* Dummy Metric Cards */}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <MetricCard
                  title="Average Band Score"
                  value="6.88"
                  subtext="Target Band: 7.5"
                  icon={Trophy}
                  trend="+0.38"
                  color="rose"
                />
                <MetricCard
                  title="Mock Tests Taken"
                  value="12"
                  subtext="Tests completed successfully"
                  icon={BookOpen}
                  color="indigo"
                />
                <MetricCard
                  title="Practice Time"
                  value="18.5 hrs"
                  subtext="Total duration elapsed"
                  icon={Clock}
                  color="blue"
                />
                <MetricCard
                  title="Daily Habit Streak"
                  value="5 Days"
                  subtext="Complete a test to maintain!"
                  icon={Flame}
                  trend="Ready"
                  color="orange"
                />
              </div>

              {/* Dummy breakdowns row */}
              <div className="grid gap-6 lg:grid-cols-3">
                <div className="lg:col-span-2 rounded-2xl border border-gray-100 bg-white p-5 shadow-xs space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-extrabold text-gray-900">Module Band Breakdowns</h3>
                      <p className="text-xs text-gray-400">Average scores computed across mock practices</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-4 gap-2 pt-4">
                    <CircularProgress value={7.0} target={7.5} label="Listening" colorClass="text-blue-600" strokeColor="stroke-blue-500" />
                    <CircularProgress value={7.5} target={7.5} label="Reading" colorClass="text-rose-600" strokeColor="stroke-rose-500" />
                    <CircularProgress value={6.5} target={7.5} label="Writing" colorClass="text-amber-600" strokeColor="stroke-amber-500" />
                    <CircularProgress value={6.5} target={7.5} label="Speaking" colorClass="text-emerald-600" strokeColor="stroke-emerald-500" />
                  </div>
                </div>

                <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-xs flex flex-col justify-between">
                  <div>
                    <h3 className="text-sm font-extrabold text-gray-900">Daily Preparation Goals</h3>
                    <p className="text-xs text-gray-400">Build daily learning habits to boost scores</p>
                  </div>
                  <div className="flex flex-col items-center justify-center text-center py-4">
                    <Flame className="h-8 w-8 text-orange-500" />
                  </div>
                  <button className="w-full py-2.5 bg-orange-500 text-white text-xs font-bold rounded-xl">
                    Claim Daily Streak
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. Interactive Search & Year Filters Controller */}
      <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm flex flex-col gap-4 sm:flex-row sm:items-center justify-between">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3">
            <Search className="h-4.5 w-4.5 text-gray-400" />
          </span>
          <input
            type="text"
            placeholder="Search recent tests by name, keyword, or module..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-gray-200 bg-gray-50/50 py-2.5 pl-10 pr-4 text-xs sm:text-sm text-gray-700 outline-none transition-all placeholder:text-gray-400 focus:border-rose-500 focus:bg-white focus:ring-1 focus:ring-rose-500"
          />
        </div>

        {/* Year Filter Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1.5 mr-1">
            <Calendar className="h-3.5 w-3.5 text-gray-400" />
            <span>Select Year:</span>
          </span>
          <button
            onClick={() => setSelectedYear('All')}
            className={`rounded-lg px-3 py-1.5 text-xs font-bold border transition-all cursor-pointer ${
              selectedYear === 'All'
                ? 'border-rose-600 bg-rose-600 text-white shadow-xs'
                : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            All Years
          </button>
          {availableYears.map((year) => (
            <button
              key={year}
              onClick={() => setSelectedYear(year)}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold border transition-all cursor-pointer ${
                selectedYear === year
                  ? 'border-rose-600 bg-rose-600 text-white shadow-xs'
                  : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              {year}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Catalog Title */}
      <div className="flex items-center justify-between">
        <h3 className="text-xs sm:text-sm font-extrabold text-gray-800 uppercase tracking-wider">
          Available Recent Mock Tests ({filteredTests.length})
        </h3>
        {selectedYear !== 'All' && (
          <span className="text-xs font-bold text-rose-600 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-100">
            Year: {selectedYear}
          </span>
        )}
      </div>

      {/* 4. Grid of Test Cards */}
      {filteredTests.length > 0 ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filteredTests.map((test) => {
            const IconComponent = categoryIcons[test.category] || GraduationCap;
            
            return (
              <motion.div
                key={test.id}
                whileHover={{ y: -4 }}
                className="flex flex-col justify-between rounded-2xl border border-gray-150 bg-white p-5 shadow-xs hover:shadow-md transition-all relative overflow-hidden group"
              >
                {/* Year Label Tag top-right */}
                <div className="absolute top-4 right-4 flex items-center gap-1.5">
                  <span className="text-[10px] font-black uppercase tracking-widest text-white bg-gray-900/90 px-2 py-0.5 rounded-md shadow-xs flex items-center gap-1">
                    <Calendar className="h-3 w-3 text-rose-500" />
                    <span>{test.year || 2026}</span>
                  </span>
                </div>

                <div className="space-y-3.5">
                  {/* Category Badge & Difficulty */}
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className={`rounded-md border px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider flex items-center gap-1 ${catBadgeColors[test.category]}`}>
                      <IconComponent className="h-3 w-3" />
                      <span>{test.category}</span>
                    </span>
                    <span className="rounded-md border border-gray-100 bg-gray-50 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-gray-500">
                      {test.type}
                    </span>
                  </div>

                  {/* Test Title & Description */}
                  <div className="space-y-1 text-left">
                    <h4 className="font-sans text-xs sm:text-sm font-extrabold text-gray-900 group-hover:text-rose-600 transition-colors line-clamp-2 leading-snug">
                      {test.title}
                    </h4>
                    <p className="text-[11px] text-gray-500 line-clamp-2 leading-relaxed">
                      {test.description}
                    </p>
                  </div>

                  {/* Sections Preview List */}
                  <div className="rounded-xl bg-gray-50/70 p-3 space-y-1.5 border border-gray-100 text-left">
                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block">Sections Included</span>
                    <div className="space-y-1">
                      {test.sections.slice(0, 2).map((section, idx) => (
                        <div key={idx} className="flex items-center gap-1.5 text-[10px] text-gray-600">
                          <div className="h-1 w-1 rounded-full bg-rose-500 flex-shrink-0" />
                          <span className="truncate">{section}</span>
                        </div>
                      ))}
                      {test.sections.length > 2 && (
                        <span className="text-[9px] text-rose-500 font-bold italic block pl-2.5">
                          + {test.sections.length - 2} more sections
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Footer specs & Start CTA */}
                <div className="border-t border-gray-50 mt-4 pt-3 flex items-center justify-between">
                  <div className="flex items-center gap-2.5 text-[10px] text-gray-400 font-semibold">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5 text-gray-400" />
                      {test.durationMinutes} min
                    </span>
                    <span className="flex items-center gap-1">
                      <HelpCircle className="h-3.5 w-3.5 text-gray-400" />
                      {test.questionsCount} Qs
                    </span>
                  </div>

                  <button
                    onClick={() => onStartTest(test)}
                    className="inline-flex items-center gap-1 rounded-xl bg-rose-600 hover:bg-rose-500 text-white px-3 py-1.5 text-xs font-bold transition-all active:scale-95 cursor-pointer shadow-sm shadow-rose-100"
                  >
                    <span>Take Practice</span>
                    <Play className="h-2.5 w-2.5 fill-current ml-0.5" />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-10 text-center space-y-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-rose-50 text-rose-600 mx-auto">
            <Search className="h-6 w-6" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-gray-900">No Mock Tests Found</h4>
            <p className="text-xs text-gray-400 max-w-xs mx-auto mt-1">
              We couldn't find any practice tests matching your search terms or year criteria. Please try again.
            </p>
          </div>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedYear('All');
            }}
            className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-50 shadow-sm cursor-pointer"
          >
            Clear Filters
          </button>
        </div>
      )}

    </div>
  );
}
