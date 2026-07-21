import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { 
  Search, SlidersHorizontal, BookOpen, Clock, 
  HelpCircle, Sparkles, User, Play, ChevronRight, 
  CheckCircle, ArrowUpRight
} from 'lucide-react';
import { IELTSTest, TestCategory, TestType } from '../types';

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
  const [yearFilter, setYearFilter] = useState<number | 'All'>('All');
  const [bookFilter, setBookFilter] = useState<number | 'All'>('All');
  const [testNoFilter, setTestNoFilter] = useState<number | 'All'>('All');
  const [passageNoFilter, setPassageNoFilter] = useState<number | 'All'>('All');
  const [qTypeFilter, setQTypeFilter] = useState<string | 'All'>('All');
  const [showFilters, setShowFilters] = useState(false);

  // Dynamic Options Extraction based on available tests
  const availableYears = useMemo(() => {
    const years = new Set<number>();
    tests.forEach(t => { 
      if (t.bookYear) years.add(t.bookYear); 
      else if (t.year) years.add(t.year); 
    });
    return Array.from(years).sort((a, b) => b - a);
  }, [tests]);

  const availableBooks = useMemo(() => {
    const books = new Set<number>();
    tests.forEach(t => { if (t.bookNumber) books.add(t.bookNumber); });
    return Array.from(books).sort((a, b) => b - a);
  }, [tests]);

  const availableTestNos = useMemo(() => {
    const nos = new Set<number>();
    tests.forEach(t => { if (t.testNumber) nos.add(t.testNumber); });
    return Array.from(nos).sort((a, b) => a - b);
  }, [tests]);

  const availableQTypes = useMemo(() => {
    const types = new Set<string>();
    tests.forEach(t => {
      if (t.questionTypes) {
        t.questionTypes.forEach(qt => types.add(qt));
      }
      t.questions?.forEach(q => {
        if (q.type) types.add(q.type);
      });
    });
    return Array.from(types).sort();
  }, [tests]);

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (yearFilter !== 'All') count++;
    if (bookFilter !== 'All') count++;
    if (testNoFilter !== 'All') count++;
    if (passageNoFilter !== 'All') count++;
    if (qTypeFilter !== 'All') count++;
    return count;
  }, [yearFilter, bookFilter, testNoFilter, passageNoFilter, qTypeFilter]);

  // Filter tests based on category, type, search query, year, book, test, passage, and question type
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

      // 4. Filter by Conduct Year
      if (yearFilter !== 'All') {
        const matchesBookYear = test.bookYear === yearFilter;
        const matchesYear = test.year === yearFilter;
        if (!matchesBookYear && !matchesYear) {
          return false;
        }
      }

      // 5. Filter by Cambridge Book Number
      if (bookFilter !== 'All' && test.bookNumber !== bookFilter) {
        return false;
      }

      // 6. Filter by Test Number
      if (testNoFilter !== 'All' && test.testNumber !== testNoFilter) {
        return false;
      }

      // 7. Filter by Passage Number
      if (passageNoFilter !== 'All') {
        const matchesTestPassage = test.passageNumber === passageNoFilter;
        const hasMatchingPassageQuestion = test.questions?.some(q => q.passageNumber === passageNoFilter);
        if (!matchesTestPassage && !hasMatchingPassageQuestion) {
          return false;
        }
      }

      // 8. Filter by Question Type
      if (qTypeFilter !== 'All') {
        const matchesTestQTypes = test.questionTypes?.includes(qTypeFilter as any);
        const hasMatchingQTypeQuestion = test.questions?.some(q => q.type === qTypeFilter);
        if (!matchesTestQTypes && !hasMatchingQTypeQuestion) {
          return false;
        }
      }

      // 9. Filter by search query (match title, description, or sections)
      if (searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase();
        const matchesTitle = test.title.toLowerCase().includes(query);
        const matchesDesc = test.description.toLowerCase().includes(query);
        const matchesSections = test.sections.some((s) => s.toLowerCase().includes(query));
        return matchesTitle || matchesDesc || matchesSections;
      }

      return true;
    });
  }, [tests, category, selectedType, searchQuery, yearFilter, bookFilter, testNoFilter, passageNoFilter, qTypeFilter]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 py-6" id="practice-tests-container">
      {/* 1. Sidebar Column (Takes 1 col on large screens, sticky positioned) */}
      <div className="lg:col-span-1">
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-xs space-y-5 lg:sticky lg:top-6">
          <div className="flex items-center justify-between border-b border-gray-50 pb-3">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="h-4.5 w-4.5 text-rose-600" />
              <h3 className="font-sans text-[11px] font-black text-gray-900 uppercase tracking-wider">Test Explorer</h3>
            </div>
            {activeFiltersCount > 0 && (
              <span className="text-[10px] font-bold text-rose-700 bg-rose-50 border border-rose-100 px-2 py-0.5 rounded-full">
                {activeFiltersCount} active
              </span>
            )}
          </div>

          <div className="space-y-4">
            {/* Year Filter */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">Book Publication Year</span>
              <select
                value={yearFilter}
                onChange={(e) => setYearFilter(e.target.value === 'All' ? 'All' : Number(e.target.value))}
                className="w-full text-xs font-semibold text-gray-700 border border-gray-200 rounded-xl p-2.5 bg-white outline-none focus:border-rose-500 transition-colors cursor-pointer"
              >
                <option value="All">All Years</option>
                {availableYears.map(yr => (
                  <option key={yr} value={yr}>{yr}</option>
                ))}
              </select>
            </div>

            {/* Cambridge Book Filter */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">Cambridge Book</span>
              <select
                value={bookFilter}
                onChange={(e) => setBookFilter(e.target.value === 'All' ? 'All' : Number(e.target.value))}
                className="w-full text-xs font-semibold text-gray-700 border border-gray-200 rounded-xl p-2.5 bg-white outline-none focus:border-rose-500 transition-colors cursor-pointer"
              >
                <option value="All">All Books</option>
                {availableBooks.map(bk => (
                  <option key={bk} value={bk}>Book {bk}</option>
                ))}
              </select>
            </div>

            {/* Test Number Filter */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">Test Number</span>
              <select
                value={testNoFilter}
                onChange={(e) => setTestNoFilter(e.target.value === 'All' ? 'All' : Number(e.target.value))}
                className="w-full text-xs font-semibold text-gray-700 border border-gray-200 rounded-xl p-2.5 bg-white outline-none focus:border-rose-500 transition-colors cursor-pointer"
              >
                <option value="All">All Tests</option>
                {availableTestNos.map(tn => (
                  <option key={tn} value={tn}>Test {tn}</option>
                ))}
              </select>
            </div>

            {/* Passage / Part Filter */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">Passage / Section Part</span>
              <select
                value={passageNoFilter}
                onChange={(e) => setPassageNoFilter(e.target.value === 'All' ? 'All' : Number(e.target.value))}
                className="w-full text-xs font-semibold text-gray-700 border border-gray-200 rounded-xl p-2.5 bg-white outline-none focus:border-rose-500 transition-colors cursor-pointer"
              >
                <option value="All">All Parts</option>
                <option value={1}>Passage 1 / Part 1</option>
                <option value={2}>Passage 2 / Part 2</option>
                <option value={3}>Passage 3 / Part 3</option>
                <option value={4}>Passage 4 / Part 4</option>
              </select>
            </div>

            {/* Question Type Filter */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">Question Type</span>
              <select
                value={qTypeFilter}
                onChange={(e) => setQTypeFilter(e.target.value)}
                className="w-full text-xs font-semibold text-gray-700 border border-gray-200 rounded-xl p-2.5 bg-white outline-none focus:border-rose-500 transition-colors cursor-pointer"
              >
                <option value="All">All Types</option>
                {availableQTypes.map(qt => {
                  const formattedLabel = 
                    qt === 'MCQ' ? 'Multiple Choice (MCQ)' :
                    qt === 'TrueFalseNotGiven' ? 'True/False/Not Given' :
                    qt === 'YesNoNotGiven' ? 'Yes/No/Not Given' :
                    qt === 'MatchingHeadings' ? 'Matching Headings' :
                    qt === 'MatchingInfo' ? 'Matching Info' :
                    qt === 'MatchingFeatures' ? 'Matching Features' :
                    qt === 'MatchingSentenceEndings' ? 'Sentence Endings' :
                    qt === 'SentenceCompletion' ? 'Sentence Completion' :
                    qt === 'SummaryCompletion' ? 'Summary Completion' :
                    qt === 'DiagramCompletion' ? 'Diagram/Flowchart' :
                    qt === 'ShortAnswer' ? 'Short Answer' :
                    qt === 'Blanks' ? 'Fill in the Blanks' : qt;

                  return (
                    <option key={qt} value={qt}>{formattedLabel}</option>
                  );
                })}
              </select>
            </div>
          </div>

          <div className="border-t border-gray-50 pt-3 flex flex-col gap-2">
            <div className="text-[10px] font-bold text-rose-700 bg-rose-50/60 border border-rose-100/50 px-2.5 py-1.5 rounded-xl flex items-center gap-1.5 justify-center">
              <Sparkles className="h-3.5 w-3.5 text-rose-500 animate-pulse" />
              <span>Hierarchical Tags Active</span>
            </div>
            {activeFiltersCount > 0 && (
              <button
                type="button"
                onClick={() => {
                  setYearFilter('All');
                  setBookFilter('All');
                  setTestNoFilter('All');
                  setPassageNoFilter('All');
                  setQTypeFilter('All');
                  setSearchQuery('');
                }}
                className="w-full text-center py-2 text-xs font-bold text-gray-400 hover:text-rose-600 border border-dashed border-gray-200 hover:border-rose-200 rounded-xl hover:bg-rose-50/10 transition-all cursor-pointer"
              >
                Reset Filters
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 2. Main Content Area */}
      <div className="lg:col-span-3 space-y-6">
        {/* Search Header Area */}
        <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-xs">
          <div className="relative flex-1">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3.5">
              <Search className="h-4.5 w-4.5 text-gray-400" />
            </span>
            <input
              type="text"
              placeholder={`Search mock tests by keyword or title...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-gray-50/50 py-2.5 pl-11 pr-4 text-sm text-gray-700 outline-none transition-all placeholder:text-gray-400 focus:border-rose-500 focus:bg-white focus:ring-1 focus:ring-rose-500"
            />
          </div>
        </div>

        {/* Tests Listing Summary Info */}
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-gray-800 uppercase tracking-widest">
            Available Practice Tests ({filteredTests.length})
          </h3>
          <p className="text-xs text-gray-400">
            Assessment Category: <span className="font-bold text-rose-600 uppercase">{category}</span>
          </p>
        </div>

        {/* Grid of Test Cards */}
        {filteredTests.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2">
          {filteredTests.map((test) => {
            const isCompleted = completedTestIds.includes(test.id);
            
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
                    {test.bookNumber && (
                      <span className="rounded-md border border-rose-200 bg-rose-50 px-2 py-0.5 text-[10px] font-black tracking-wider text-rose-700">
                        Book {test.bookNumber}
                      </span>
                    )}
                    {test.testNumber && (
                      <span className="rounded-md border border-rose-250 bg-rose-100/50 px-2 py-0.5 text-[10px] font-black tracking-wider text-rose-800">
                        Test {test.testNumber}
                      </span>
                    )}
                    {(test.bookYear || test.year) && (
                      <span className="rounded-md border border-gray-200 bg-gray-50 px-2 py-0.5 text-[10px] font-semibold text-gray-600">
                        {test.bookYear || test.year}
                      </span>
                    )}
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
              Try altering your keywords, choosing different skill modules, or resetting your filter criteria.
            </p>
          </div>
          <button
            onClick={() => {
              setYearFilter('All');
              setBookFilter('All');
              setTestNoFilter('All');
              setPassageNoFilter('All');
              setQTypeFilter('All');
              setSearchQuery('');
            }}
            className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-50 shadow-sm"
          >
            Clear Filters
          </button>
        </div>
      )}
      </div>
    </div>
  );
}
