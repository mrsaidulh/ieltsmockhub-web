import React, { useState } from 'react';
import { Search, Bell, Flame, Target, User, Sparkles, GraduationCap, LogOut } from 'lucide-react';
import { UserProgress, StudentLead } from '../types';

interface HeaderProps {
  progress: UserProgress;
  onChangeTarget: (newTarget: number) => void;
  streakIncremented: boolean;
  onClaimStreak: () => void;
  currentUser: StudentLead | null;
  onLogout: () => void;
}

export default function Header({
  progress,
  onChangeTarget,
  streakIncremented,
  onClaimStreak,
  currentUser,
  onLogout,
}: HeaderProps) {
  const [showNotification, setShowNotification] = useState(false);
  const [showTargetDropdown, setShowTargetDropdown] = useState(false);

  const targets = [6.0, 6.5, 7.0, 7.5, 8.0, 8.5, 9.0];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-gray-100 bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8" id="main-header">
        
        {/* Left Section - Branding */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-rose-500 to-pink-600 text-white shadow-md shadow-rose-100">
            <GraduationCap className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <span className="font-sans text-lg font-bold tracking-tight text-gray-900 sm:text-xl">
              IELTS<span className="text-rose-600">Mock</span>Hub
            </span>
            <span className="font-mono text-[10px] font-semibold text-gray-400 tracking-wider uppercase">
              IELTSmockhub.com
            </span>
          </div>
        </div>

        {/* Middle Section - Search Bar */}
        <div className="hidden max-w-md flex-1 px-8 md:block">
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3">
              <Search className="h-4 w-4 text-gray-400" />
            </span>
            <input
              type="text"
              placeholder="Search mock tests, sections, or topics..."
              className="w-full rounded-full border border-gray-200 bg-gray-50/50 py-2 pl-10 pr-4 text-sm text-gray-700 outline-none transition-all placeholder:text-gray-400 focus:border-rose-500 focus:bg-white focus:ring-1 focus:ring-rose-500"
            />
          </div>
        </div>

        {/* Right Section - User Stats & Profile */}
        <div className="flex items-center gap-4">
          
          {/* Streak tracker */}
          <button
            onClick={onClaimStreak}
            disabled={streakIncremented}
            className={`group relative flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-all ${
              streakIncremented
                ? 'bg-orange-50 text-orange-600 cursor-default'
                : 'bg-gradient-to-r from-amber-50 to-orange-50 text-orange-600 hover:from-amber-100 hover:to-orange-100 cursor-pointer shadow-sm hover:shadow active:scale-95'
            }`}
            title={streakIncremented ? "Today's practice recorded!" : "Click to claim today's streak reward!"}
          >
            <Flame className={`h-4 w-4 ${streakIncremented ? 'fill-orange-500 animate-pulse' : 'group-hover:animate-bounce'}`} />
            <span>{progress.streakDays} Day Streak</span>
            {!streakIncremented && (
              <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-rose-500"></span>
              </span>
            )}
          </button>

          {/* Target Band Selector */}
          <div className="relative">
            <button
              onClick={() => setShowTargetDropdown(!showTargetDropdown)}
              className="flex items-center gap-1.5 rounded-full bg-rose-50/50 px-3 py-1.5 text-xs font-semibold text-rose-600 transition-all hover:bg-rose-50 active:scale-95"
            >
              <Target className="h-4 w-4 text-rose-500" />
              <span>Target Band: {progress.targetBand.toFixed(1)}</span>
            </button>
            {showTargetDropdown && (
              <div className="absolute right-0 mt-2 w-48 rounded-2xl border border-gray-100 bg-white p-2 shadow-xl ring-1 ring-black/5 animate-in fade-in slide-in-from-top-2 duration-150">
                <p className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-400">Set Target Band</p>
                <div className="grid grid-cols-3 gap-1 p-1">
                  {targets.map((t) => (
                    <button
                      key={t}
                      onClick={() => {
                        onChangeTarget(t);
                        setShowTargetDropdown(false);
                      }}
                      className={`rounded-lg py-1 text-xs font-medium transition-all ${
                        progress.targetBand === t
                          ? 'bg-rose-600 text-white shadow-sm'
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      {t.toFixed(1)}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setShowNotification(!showNotification)}
              className="relative rounded-full p-2 text-gray-500 hover:bg-gray-50 active:scale-95"
            >
              <Bell className="h-5 w-5" />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-rose-500"></span>
            </button>
            
            {showNotification && (
              <div className="absolute right-0 mt-2 w-80 rounded-2xl border border-gray-100 bg-white shadow-xl ring-1 ring-black/5 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="border-b border-gray-100 px-4 py-3">
                  <h3 className="text-xs font-bold text-gray-900">Notifications</h3>
                </div>
                <div className="divide-y divide-gray-50">
                  <div className="p-4 hover:bg-gray-55">
                    <div className="flex gap-2.5">
                      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-rose-50 text-rose-600">
                        <Sparkles className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-800">New Practice Test Available!</p>
                        <p className="text-[10px] text-gray-500">IELTS Academic Volume 16 has just been added.</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 hover:bg-gray-55">
                    <div className="flex gap-2.5">
                      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-orange-50 text-orange-600">
                        <Flame className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-800">Streak Maintained!</p>
                        <p className="text-[10px] text-gray-500">Fantastic job. Keep practicing to hit your {progress.targetBand} target.</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="border-t border-gray-100 p-2 text-center">
                  <button className="text-[11px] font-semibold text-rose-600 hover:underline">Mark all as read</button>
                </div>
              </div>
            )}
          </div>

          {/* Profile Badge */}
          <div className="flex items-center gap-2 border-l border-gray-100 pl-3">
            {currentUser && currentUser.verified ? (
              <>
                <div className="relative h-8 w-8 rounded-full bg-rose-100 ring-2 ring-rose-500/20 flex items-center justify-center text-rose-700 font-bold text-xs uppercase" title={currentUser.name}>
                  {currentUser.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </div>
                <div className="hidden flex-col md:flex text-left">
                  <span className="text-xs font-semibold text-gray-900 max-w-[100px] truncate">{currentUser.name}</span>
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1 py-0.2 rounded border border-emerald-100">Verified Student</span>
                </div>
                <button 
                  onClick={onLogout}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition-colors ml-1"
                  title="Log out of Mock Hub"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </>
            ) : (
              <>
                <div className="relative h-8 w-8 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-500">
                  <User className="h-4 w-4" />
                </div>
                <div className="hidden flex-col md:flex text-left">
                  <span className="text-xs font-semibold text-gray-600">Guest User</span>
                  <span className="text-[10px] font-semibold text-rose-500 animate-pulse">Verification Pending</span>
                </div>
              </>
            )}
          </div>

        </div>
      </div>
    </header>
  );
}
