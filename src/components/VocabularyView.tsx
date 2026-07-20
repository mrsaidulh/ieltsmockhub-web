import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BookOpen, Plus, Search, Trash2, CheckCircle2, 
  HelpCircle, AlertCircle, Bookmark, BookmarkCheck,
  RotateCw, Sparkles, Filter, Check, ListFilter, ArrowRight
} from 'lucide-react';
import { VocabularyWord } from '../types';

interface VocabularyViewProps {
  vocabularyList: VocabularyWord[];
  onAddWord: (wordData: { word: string; definition: string; exampleSentence?: string; sourceTestId?: string; sourceTestTitle?: string }) => void;
  onToggleMastery: (id: string) => void;
  onDeleteWord: (id: string) => void;
}

export default function VocabularyView({
  vocabularyList,
  onAddWord,
  onToggleMastery,
  onDeleteWord
}: VocabularyViewProps) {
  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'reviewing' | 'mastered'>('all');
  
  // Custom manual word form state
  const [isAdding, setIsAdding] = useState(false);
  const [word, setWord] = useState('');
  const [definition, setDefinition] = useState('');
  const [example, setExample] = useState('');
  const [formError, setFormError] = useState('');

  // Flashcards state
  const [showFlashcards, setShowFlashcards] = useState(false);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  // Filtered vocabulary list
  const filteredList = vocabularyList.filter((item) => {
    const matchesSearch = item.word.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          item.definition.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || 
                          (statusFilter === 'mastered' && item.mastered) || 
                          (statusFilter === 'reviewing' && !item.mastered);
    return matchesSearch && matchesStatus;
  });

  // Calculate statistics
  const totalWords = vocabularyList.length;
  const masteredWords = vocabularyList.filter(w => w.mastered).length;
  const masteryPercentage = totalWords > 0 ? Math.round((masteredWords / totalWords) * 100) : 0;

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!word.trim() || !definition.trim()) {
      setFormError('Please enter both the word and its definition.');
      return;
    }
    onAddWord({
      word: word.trim(),
      definition: definition.trim(),
      exampleSentence: example.trim() || undefined,
    });
    setWord('');
    setDefinition('');
    setExample('');
    setIsAdding(false);
    setFormError('');
  };

  const handleNextCard = () => {
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentCardIndex((prev) => (prev + 1) % filteredList.length);
    }, 150);
  };

  const handlePrevCard = () => {
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentCardIndex((prev) => (prev - 1 + filteredList.length) % filteredList.length);
    }, 150);
  };

  return (
    <div className="space-y-6" id="vocabulary-bank-container">
      {/* 1. Vocabulary Overview & Statistics Header */}
      <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1.5 text-left">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-rose-50 text-rose-600 rounded-xl">
              <BookOpen className="h-5 w-5" />
            </span>
            <h2 className="text-xl font-bold text-gray-900 font-sans">IELTS Vocabulary Bank</h2>
          </div>
          <p className="text-xs text-gray-500 max-w-xl">
            Retain high-band lexical resources and academic phrases encountered during mock exams. Review definitions, context, and quiz your retention.
          </p>
        </div>

        {/* Stats widget */}
        <div className="flex items-center gap-6 border-l border-gray-100 pl-6 h-full">
          <div className="text-left">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Saved Phrases</p>
            <p className="text-2xl font-black text-gray-900 font-mono">{totalWords}</p>
          </div>
          <div className="text-left">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Mastered</p>
            <p className="text-2xl font-black text-emerald-600 font-mono">{masteredWords}</p>
          </div>
          <div className="text-left">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Retention</p>
            <div className="flex items-center gap-1.5">
              <p className="text-2xl font-black text-rose-600 font-mono">{masteryPercentage}%</p>
              <div className="w-12 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-rose-500" style={{ width: `${masteryPercentage}%` }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Interactive Search & Toggle Panel */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-gray-100 shadow-sm">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search words or definitions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-gray-50/50 rounded-xl border border-gray-200 pl-10 pr-4 py-2 text-xs outline-none focus:border-rose-500 focus:bg-white transition-all text-gray-700"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          {/* Filters */}
          <div className="flex items-center gap-1.5 bg-gray-50 p-1 rounded-lg border border-gray-200">
            {(['all', 'reviewing', 'mastered'] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => setStatusFilter(filter)}
                className={`px-3 py-1 text-[10px] font-bold uppercase rounded-md transition-all ${
                  statusFilter === filter
                    ? 'bg-white text-rose-600 shadow-sm'
                    : 'text-gray-500 hover:text-gray-800'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>

          <button
            onClick={() => {
              if (filteredList.length > 0) {
                setShowFlashcards(!showFlashcards);
                setCurrentCardIndex(0);
                setIsFlipped(false);
              }
            }}
            disabled={filteredList.length === 0}
            className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold border transition-all ${
              showFlashcards
                ? 'bg-rose-50 border-rose-200 text-rose-700'
                : 'bg-white hover:bg-gray-50 text-gray-700 border-gray-200'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <RotateCw className="h-3.5 w-3.5" />
            <span>Flashcards</span>
          </button>

          <button
            onClick={() => setIsAdding(!isAdding)}
            className="flex items-center gap-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 px-3.5 py-1.5 text-xs font-bold text-white transition-all shadow-sm shadow-rose-100"
          >
            <Plus className="h-4 w-4" />
            <span>Add Word</span>
          </button>
        </div>
      </div>

      {/* 3. Inline manual entry form */}
      <AnimatePresence>
        {isAdding && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <form onSubmit={handleFormSubmit} className="bg-white rounded-3xl border border-rose-100 p-5 space-y-4 shadow-sm text-left">
              <div className="flex items-center justify-between border-b border-gray-50 pb-2">
                <span className="text-xs font-bold text-rose-600 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4" /> Add Word Manually
                </span>
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="text-gray-400 hover:text-gray-600 text-xs"
                >
                  Cancel
                </button>
              </div>

              {formError && (
                <div className="flex items-center gap-2 p-2.5 bg-red-50 rounded-xl border border-red-100 text-[11px] text-red-700">
                  <AlertCircle className="h-3.5 w-3.5" />
                  <span>{formError}</span>
                </div>
              )}

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Word / Academic Term</label>
                  <input
                    type="text"
                    value={word}
                    onChange={(e) => setWord(e.target.value)}
                    placeholder="e.g., Ubiquitous"
                    className="w-full rounded-xl border border-gray-200 bg-gray-50/50 p-2.5 text-xs text-gray-700 outline-none focus:border-rose-500 focus:bg-white transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Definition</label>
                  <input
                    type="text"
                    value={definition}
                    onChange={(e) => setDefinition(e.target.value)}
                    placeholder="e.g., Present, appearing, or found everywhere."
                    className="w-full rounded-xl border border-gray-200 bg-gray-50/50 p-2.5 text-xs text-gray-700 outline-none focus:border-rose-500 focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Contextual Example Sentence (Optional)</label>
                <textarea
                  value={example}
                  onChange={(e) => setExample(e.target.value)}
                  placeholder="e.g., Mobile phones are now ubiquitous in modern society."
                  rows={2}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50/50 p-2.5 text-xs text-gray-700 outline-none focus:border-rose-500 focus:bg-white transition-all resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="submit"
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl text-xs shadow-sm shadow-rose-100 transition-all"
                >
                  Save to Vocabulary Bank
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 4. Active Flashcards Mode */}
      <AnimatePresence>
        {showFlashcards && filteredList.length > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="bg-gray-900 rounded-3xl p-6 text-white text-center shadow-lg relative overflow-hidden"
          >
            {/* Visual background sparkle */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-rose-500/10 to-transparent rounded-full blur-2xl pointer-events-none" />

            <div className="flex justify-between items-center mb-6">
              <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="h-4 w-4" /> Active Retention Recall Deck
              </span>
              <button
                onClick={() => setShowFlashcards(false)}
                className="text-gray-400 hover:text-white text-xs border border-gray-850 bg-gray-800 px-2 py-1 rounded-lg"
              >
                Exit Recall
              </button>
            </div>

            {/* Flashcard container */}
            <div className="min-h-52 flex items-center justify-center py-4">
              <motion.div
                key={currentCardIndex}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-sm"
              >
                <div 
                  onClick={() => setIsFlipped(!isFlipped)}
                  className="bg-gray-800/80 hover:bg-gray-800 border border-gray-750 p-6 rounded-2xl min-h-44 flex flex-col justify-between cursor-pointer transition-all active:scale-[0.99] select-none"
                >
                  <div className="flex justify-between items-start text-left">
                    <span className="text-[9px] font-bold text-gray-500 uppercase font-mono">
                      Card {currentCardIndex + 1} of {filteredList.length}
                    </span>
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                      filteredList[currentCardIndex].mastered 
                        ? 'bg-emerald-900/40 text-emerald-400 border border-emerald-800' 
                        : 'bg-amber-900/40 text-amber-400 border border-amber-800'
                    }`}>
                      {filteredList[currentCardIndex].mastered ? 'Mastered' : 'Reviewing'}
                    </span>
                  </div>

                  <div className="my-4 text-center">
                    {!isFlipped ? (
                      <h3 className="text-2xl font-extrabold text-white tracking-tight">
                        {filteredList[currentCardIndex].word}
                      </h3>
                    ) : (
                      <div className="space-y-2">
                        <p className="text-xs text-gray-300 leading-normal font-sans italic">
                          "{filteredList[currentCardIndex].definition}"
                        </p>
                        {filteredList[currentCardIndex].exampleSentence && (
                          <p className="text-[11px] text-gray-400 font-serif leading-relaxed italic bg-gray-850/40 p-2.5 rounded-lg border border-gray-700/50">
                            "{filteredList[currentCardIndex].exampleSentence}"
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="text-center text-[10px] text-gray-500 font-bold tracking-widest flex items-center justify-center gap-1">
                    <RotateCw className="h-3 w-3 animate-spin-slow" />
                    <span>TAP TO FLIP</span>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Pagination / Cards navigation */}
            <div className="flex items-center justify-center gap-4 border-t border-gray-800 pt-4 mt-2">
              <button
                onClick={handlePrevCard}
                className="px-4 py-2 border border-gray-800 hover:border-gray-700 bg-gray-850 hover:bg-gray-800 text-xs rounded-xl font-bold transition-all"
              >
                Previous Card
              </button>
              <button
                onClick={() => onToggleMastery(filteredList[currentCardIndex].id)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  filteredList[currentCardIndex].mastered
                    ? 'bg-emerald-950 border border-emerald-900 text-emerald-400'
                    : 'bg-rose-950 border border-rose-900 text-rose-400'
                }`}
              >
                {filteredList[currentCardIndex].mastered ? <BookmarkCheck className="h-3.5 w-3.5" /> : <Bookmark className="h-3.5 w-3.5" />}
                <span>{filteredList[currentCardIndex].mastered ? 'Mastered!' : 'Mark Mastered'}</span>
              </button>
              <button
                onClick={handleNextCard}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-xs text-white rounded-xl font-bold transition-all shadow-md shadow-rose-900/30"
              >
                Next Card
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 5. Words List & Grid */}
      {filteredList.length === 0 ? (
        <div className="bg-white rounded-3xl border border-gray-150 p-12 text-center text-gray-400 space-y-3">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-50 text-gray-400">
            <HelpCircle className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-800">No Vocabulary Words Found</p>
            <p className="text-[10px] text-gray-400 mt-1">
              {searchTerm || statusFilter !== 'all' 
                ? 'Try adjusting your search query or filter settings.' 
                : 'Any difficult words you save during IELTS practice tests will appear here!'}
            </p>
          </div>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {filteredList.map((item) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm flex flex-col justify-between hover:border-gray-200 hover:shadow-md transition-all text-left"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-sm font-extrabold text-gray-900 tracking-tight flex items-center gap-1.5">
                        {item.word}
                      </h3>
                      {item.sourceTestTitle && (
                        <p className="text-[9px] text-gray-400 font-medium">
                          From: <span className="text-gray-500 font-semibold">{item.sourceTestTitle}</span>
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => onToggleMastery(item.id)}
                        className={`p-1.5 rounded-lg border transition-all ${
                          item.mastered
                            ? 'bg-emerald-50 border-emerald-100 text-emerald-600'
                            : 'bg-white border-gray-200 text-gray-400 hover:text-rose-500 hover:bg-rose-50/20'
                        }`}
                        title={item.mastered ? 'Mark reviewing' : 'Mark mastered'}
                      >
                        <Check className="h-3.5 w-3.5 stroke-[3]" />
                      </button>
                      
                      <button
                        onClick={() => onDeleteWord(item.id)}
                        className="p-1.5 rounded-lg border border-gray-200 text-gray-400 hover:text-red-500 hover:bg-red-50/50 transition-all"
                        title="Delete word"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-gray-600 font-sans leading-normal">
                    {item.definition}
                  </p>

                  {item.exampleSentence && (
                    <div className="bg-gray-50/85 p-2 rounded-lg border border-gray-100/50 text-[11px] text-gray-500 italic font-serif leading-relaxed">
                      "{item.exampleSentence}"
                    </div>
                  )}
                </div>

                <div className="border-t border-gray-50 pt-2.5 mt-3 flex items-center justify-between text-[10px] text-gray-400 font-medium font-mono">
                  <span>Added {item.dateAdded}</span>
                  <span className={`font-bold ${item.mastered ? 'text-emerald-600' : 'text-amber-500'}`}>
                    {item.mastered ? '● Mastered' : '○ Reviewing'}
                  </span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
