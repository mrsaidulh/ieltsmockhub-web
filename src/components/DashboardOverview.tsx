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
      {/* 1. Interactive Search & Year Filters Controller */}
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
                  {/* Category Badge */}
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
