import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { 
  Search, SlidersHorizontal, BookOpen, Clock, 
  HelpCircle, Sparkles, User, Play, ChevronRight, 
  CheckCircle, ArrowUpRight
} from 'lucide-react';
import { IELTSTest, TestCategory, TestType, DifficultyLevel } from '../types';

interface TestListProps {
  tests: IELTSTest[];
  category: TestCategory;
  selectedType: TestType | 'All' | 'Analytics';
  onStartTest: (test: IELTSTest) => void;
  completedTestIds: string[];
}

export default function TestList({
  tests,
  category,
  selectedType,
  onStartTest,
  completedTestIds,
}: TestListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState<DifficultyLevel | 'All'>('All');
  const [showFilters, setShowFilters] = useState(false);

  // Filter tests based on category, type, search query, and difficulty
  const filteredTests = useMemo(() => {
    return tests.filter((test) => {
      // 1. Filter by category
      if (category !== 'all' && test.category !== category) {
        return false;
      }
      
      // 2. Filter by type (Academic/General)
      if (selectedType !== 'All' && selectedType !== 'Analytics' && test.type !== selectedType) {
        return false;
      }

      // 3. Filter by difficulty
      if (difficultyFilter !== 'All' && test.difficulty !== difficultyFilter) {
        return false;
      }

      // 4. Filter by search query (match title, description, or sections)
      if (searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase();
        const matchesTitle = test.title.toLowerCase().includes(query);
        const matchesDesc = test.description.toLowerCase().includes(query);
        const matchesSections = test.sections.some((s) => s.toLowerCase().includes(query));
        return matchesTitle || matchesDesc || matchesSections;
      }

      return true;
    });
  }, [tests, category, selectedType, difficultyFilter, searchQuery]);

  return (
    <div className="space-y-6 py-6" id="practice-tests-container">
      {/* Search and Filters Controller */}
      <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3">
              <Search className="h-4.5 w-4.5 text-gray-400" />
            </span>
            <input
              type="text"
              placeholder={`Search ${category === 'all' ? 'IELTS Mock' : category} tests...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-gray-50/50 py-2.5 pl-10 pr-4 text-sm text-gray-700 outline-none transition-all placeholder:text-gray-400 focus:border-rose-500 focus:bg-white focus:ring-1 focus:ring-rose-500"
            />
          </div>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-xs font-semibold transition-all active:scale-95 ${
              showFilters || difficultyFilter !== 'All'
                ? 'border-rose-200 bg-rose-50/50 text-rose-700'
                : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            <SlidersHorizontal className="h-4 w-4" />
            <span>Filters {difficultyFilter !== 'All' ? '• 1' : ''}</span>
          </button>
        </div>

        {/* Extended Filters Toggle Panel */}
        {showFilters && (
          <div className="border-t border-gray-50 pt-4 flex flex-wrap items-center gap-4 animate-in fade-in duration-200">
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Difficulty Level</span>
              <div className="flex gap-2">
                {['All', 'Easy', 'Medium', 'Hard'].map((diff) => (
                  <button
                    key={diff}
                    onClick={() => setDifficultyFilter(diff as any)}
                    className={`rounded-lg px-3 py-1 text-xs font-semibold border transition-all ${
                      difficultyFilter === diff
                        ? 'border-rose-600 bg-rose-600 text-white shadow-sm'
                        : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {diff}
                  </button>
                ))}
              </div>
            </div>

            <div className="ml-auto flex items-center gap-3 self-end">
              <button
                onClick={() => {
                  setDifficultyFilter('All');
                  setSearchQuery('');
                }}
                className="text-xs font-bold text-gray-400 hover:text-gray-600"
              >
                Reset All Filters
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Tests Listing Summary Info */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider">
          Available Practice Tests ({filteredTests.length})
        </h3>
        <p className="text-xs text-gray-400">
          Selected Category: <span className="font-semibold text-rose-600 uppercase">{category}</span>
        </p>
      </div>

      {/* Grid of Test Cards */}
      {filteredTests.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredTests.map((test) => {
            const isCompleted = completedTestIds.includes(test.id);
            
            const diffColors = {
              Easy: 'text-emerald-700 bg-emerald-50 border-emerald-100',
              Medium: 'text-amber-700 bg-amber-50 border-amber-100',
              Hard: 'text-rose-700 bg-rose-50 border-rose-100',
            };

            const catBadgeColors = {
              listening: 'bg-blue-50 text-blue-700 border-blue-100',
              reading: 'bg-rose-50 text-rose-700 border-rose-100',
              writing: 'bg-amber-50 text-amber-700 border-amber-100',
              speaking: 'bg-emerald-50 text-emerald-700 border-emerald-100',
              all: 'bg-gray-50 text-gray-700 border-gray-100',
            };

            return (
              <motion.div
                key={test.id}
                whileHover={{ y: -4 }}
                className="flex flex-col justify-between rounded-2xl border border-gray-100 bg-white p-5 shadow-sm hover:shadow-md transition-all relative overflow-hidden group"
              >
                {/* Completed Badge Indicator Overlay */}
                {isCompleted && (
                  <div className="absolute top-0 right-0 bg-gradient-to-l from-emerald-500 to-emerald-400 text-white px-3 py-1 rounded-bl-xl text-[10px] font-bold flex items-center gap-1 shadow-sm shadow-emerald-100">
                    <CheckCircle className="h-3 w-3" />
                    <span>Completed</span>
                  </div>
                )}

                <div className="space-y-4">
                  {/* Category, Type, Difficulty Header */}
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${catBadgeColors[test.category]}`}>
                      {test.category}
                    </span>
                    <span className="rounded-md border border-gray-100 bg-gray-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-gray-500">
                      {test.type}
                    </span>
                    <span className={`rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${diffColors[test.difficulty]}`}>
                      {test.difficulty}
                    </span>
                  </div>

                  {/* Title and Description */}
                  <div className="space-y-1">
                    <h4 className="font-sans text-sm font-bold text-gray-900 group-hover:text-rose-600 transition-colors line-clamp-2">
                      {test.title}
                    </h4>
                    <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed">
                      {test.description}
                    </p>
                  </div>

                  {/* Test Sections Breakdown */}
                  <div className="rounded-xl bg-gray-50/50 p-3 space-y-2 border border-gray-100/50">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Content Scope</span>
                    <div className="space-y-1.5">
                      {test.sections.slice(0, 2).map((section, idx) => (
                        <div key={idx} className="flex items-center gap-1.5 text-xs text-gray-600">
                          <div className="h-1 w-1 rounded-full bg-rose-500" />
                          <span className="truncate">{section}</span>
                        </div>
                      ))}
                      {test.sections.length > 2 && (
                        <span className="text-[10px] text-rose-500 font-semibold italic">
                          + {test.sections.length - 2} more sections included
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Footer and Launch CTA */}
                <div className="border-t border-gray-50 mt-4 pt-4 flex items-center justify-between">
                  <div className="flex items-center gap-3 text-[11px] text-gray-400">
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
                    className={`inline-flex items-center gap-1 rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all active:scale-95 ${
                      isCompleted
                        ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                        : 'bg-rose-600 text-white hover:bg-rose-500 shadow-sm hover:shadow active:bg-rose-700'
                    }`}
                  >
                    <span>{isCompleted ? 'Retry Test' : 'Take Practice'}</span>
                    <Play className="h-3 w-3 fill-current ml-0.5" />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-12 text-center space-y-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-rose-50 text-rose-600 mx-auto">
            <Search className="h-6 w-6" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-gray-900">No Mock Tests Match Your Filters</h4>
            <p className="text-xs text-gray-400 max-w-sm mx-auto mt-1">
              Try altering your keywords, choosing different skill modules, or setting the difficulty criteria to "All".
            </p>
          </div>
          <button
            onClick={() => {
              setDifficultyFilter('All');
              setSearchQuery('');
            }}
            className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-50 shadow-sm"
          >
            Clear Filters
          </button>
        </div>
      )}
    </div>
  );
}
