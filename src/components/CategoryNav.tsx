import React from 'react';
import { LayoutGrid, Headphones, BookOpen, SquarePen, Mic, BarChart3 } from 'lucide-react';
import { TestCategory, TestType } from '../types';

interface CategoryNavProps {
  activeCategory: TestCategory;
  onSelectCategory: (category: TestCategory) => void;
  activeType: TestType | 'All' | 'Analytics';
  onSelectType: (type: TestType | 'All' | 'Analytics') => void;
}

export default function CategoryNav({
  activeCategory,
  onSelectCategory,
  activeType,
  onSelectType,
}: CategoryNavProps) {
  
  const categories = [
    { id: 'all' as TestCategory, label: 'IELTS Mock Test', icon: LayoutGrid },
    { id: 'listening' as TestCategory, label: 'Listening', icon: Headphones },
    { id: 'reading' as TestCategory, label: 'Reading', icon: BookOpen },
    { id: 'writing' as TestCategory, label: 'Writing', icon: SquarePen },
    { id: 'speaking' as TestCategory, label: 'Speaking', icon: Mic },
  ];

  return (
    <div className="w-full bg-white border-b border-gray-100 shadow-sm" id="category-navigation">
      {/* Primary Category Menu */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-14 items-center overflow-x-auto scrollbar-none">
          <nav className="flex space-x-8">
            {categories.map((cat) => {
              const IconComponent = cat.icon;
              const isActive = activeCategory === cat.id;
              
              return (
                <button
                  key={cat.id}
                  onClick={() => {
                    onSelectCategory(cat.id);
                    // Reset to All unless it's analytics
                    if (activeType === 'Analytics') {
                      onSelectType('All');
                    }
                  }}
                  className={`relative flex h-14 items-center gap-2 border-b-2 px-1 text-sm font-medium transition-all active:scale-95 whitespace-nowrap ${
                    isActive
                      ? 'border-rose-600 text-rose-600 font-semibold'
                      : 'border-transparent text-gray-500 hover:border-gray-200 hover:text-gray-700'
                  }`}
                >
                  <IconComponent className={`h-4.5 w-4.5 ${isActive ? 'text-rose-600' : 'text-gray-400 group-hover:text-gray-500'}`} />
                  <span>{cat.label}</span>
                  {isActive && (
                    <div className="absolute bottom-0 left-0 h-[2px] w-full bg-rose-600" />
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Secondary Bar - Filters & Sub-categories */}
      <div className="border-t border-gray-50 bg-gray-50/50 py-2.5">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-wrap items-center justify-between gap-3">
          
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-none">
            {/* All Tests Badge */}
            <button
              onClick={() => onSelectType('All')}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                activeType === 'All'
                  ? 'bg-white text-gray-950 shadow-sm border border-gray-200'
                  : 'text-gray-500 hover:bg-gray-100'
              }`}
            >
              All Tests
            </button>

            {/* Academic Tests Badge */}
            <button
              onClick={() => onSelectType('Academic')}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                activeType === 'Academic'
                  ? 'bg-white text-gray-950 shadow-sm border border-gray-200'
                  : 'text-gray-500 hover:bg-gray-100'
              }`}
            >
              Academic
            </button>

            {/* General Training Badge */}
            <button
              onClick={() => onSelectType('General')}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                activeType === 'General'
                  ? 'bg-white text-gray-950 shadow-sm border border-gray-200'
                  : 'text-gray-500 hover:bg-gray-100'
              }`}
            >
              General Training
            </button>
          </div>

          {/* Right aligned action - Analytics Toggle */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => onSelectType('Analytics')}
              className={`flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all ${
                activeType === 'Analytics'
                  ? 'bg-rose-50 border border-rose-200 text-rose-700 shadow-sm'
                  : 'bg-white hover:bg-gray-100 text-gray-600 border border-gray-200'
              }`}
            >
              <BarChart3 className="h-3.5 w-3.5" />
              <span>Performance Analytics</span>
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
