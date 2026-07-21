import React from 'react';
import { 
  Search, GraduationCap, LogOut, User, Sparkles
} from 'lucide-react';
import { UserProgress, StudentLead } from '../types';

interface HeaderProps {
  progress: UserProgress;
  onChangeTarget: (newTarget: number) => void;
  streakIncremented: boolean;
  onClaimStreak: () => void;
  currentUser: StudentLead | null;
  onLogout: () => void;
  onVerifyUser: (lead: StudentLead) => void;
  showAuthModal: boolean;
  setShowAuthModal: (show: boolean) => void;
}

export default function Header({
  currentUser,
  onLogout,
  setShowAuthModal,
}: HeaderProps) {
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
          <div className="hidden lg:flex items-center gap-1.5 px-3 py-1 bg-rose-50 border border-rose-100/70 rounded-full text-[10px] font-black text-rose-700 uppercase tracking-widest ml-3">
            <Sparkles className="h-3 w-3 text-rose-500 animate-pulse" />
            <span>Learn, Practice, Test & Score</span>
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

        {/* Right Section - User Profile */}
        <div className="flex items-center gap-4">
          
          {/* Profile Badge */}
          <div className="flex items-center gap-2">
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
                  className="p-1.5 rounded-lg text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition-colors ml-1 cursor-pointer"
                  title="Log out of Mock Hub"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => setShowAuthModal(true)}
                className="flex items-center gap-1.5 cursor-pointer transition-all bg-rose-600 hover:bg-rose-500 px-3.5 py-1.5 rounded-xl text-white font-bold text-xs shadow-sm shadow-rose-100"
              >
                <User className="h-3.5 w-3.5" />
                <span>Login</span>
              </button>
            )}
          </div>

        </div>
      </div>
    </header>
  );
}
