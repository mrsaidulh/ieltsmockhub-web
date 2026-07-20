import React, { useState, useEffect, useRef } from 'react';
import { Clock, AlertCircle, Play, PauseCircle, FastForward } from 'lucide-react';
import { motion } from 'motion/react';

interface CountdownTimerProps {
  durationSeconds: number;
  isPaused: boolean;
  onPauseToggle: () => void;
  onTimeout: () => void;
  isUnlimited?: boolean;
}

export default function CountdownTimer({
  durationSeconds,
  isPaused,
  onPauseToggle,
  onTimeout,
  isUnlimited = false,
}: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState(durationSeconds);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Sync state if durationSeconds changes initially
  useEffect(() => {
    if (!isUnlimited) {
      setTimeLeft(durationSeconds);
    }
  }, [durationSeconds, isUnlimited]);

  // Handle timer countdown ticking
  useEffect(() => {
    if (isUnlimited) return;

    timerRef.current = setInterval(() => {
      if (!isPaused) {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            if (timerRef.current) clearInterval(timerRef.current);
            onTimeout();
            return 0;
          }
          return prev - 1;
        });
      }
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPaused, isUnlimited, onTimeout]);

  // Fast forward helper for demonstration purposes
  const handleWarpTime = () => {
    if (!isUnlimited) {
      setTimeLeft(10); // set to 10 seconds remaining to witness the auto-submit trigger quickly!
    }
  };

  const isTimeCritical = !isUnlimited && timeLeft < 300; // Under 5 minutes remaining
  const progressPercent = isUnlimited ? 100 : (timeLeft / durationSeconds) * 100;

  const formatTime = (seconds: number) => {
    if (isUnlimited) return '∞ Unlimited';
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-3 w-full" id="ielts-countdown-timer">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className={`inline-flex h-2.5 w-2.5 rounded-full ${isPaused ? 'bg-amber-400' : 'bg-emerald-500 animate-ping-slow'}`} />
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
            {isPaused ? 'Timer Paused' : 'Exam In Progress'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Pause / Play Trigger Button */}
          {!isUnlimited && (
            <button
              type="button"
              onClick={onPauseToggle}
              className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-rose-600 transition-all"
              title={isPaused ? 'Resume exam session' : 'Pause exam session'}
            >
              {isPaused ? <Play className="h-4.5 w-4.5 fill-current text-rose-600" /> : <PauseCircle className="h-5 w-5" />}
            </button>
          )}

          {/* Countdown Clock Face */}
          <div className={`flex items-center gap-1.5 rounded-full px-3 py-1 border text-xs font-bold tracking-wider font-mono transition-all ${
            isTimeCritical
              ? 'bg-red-50 text-red-600 border-red-200 animate-pulse'
              : 'bg-rose-50 text-rose-700 border-rose-100'
          }`}>
            <Clock className={`h-4 w-4 ${isTimeCritical ? 'animate-bounce text-red-500' : 'text-rose-500'}`} />
            <span>{formatTime(timeLeft)}</span>
          </div>
        </div>
      </div>

      {/* Real-time fluid progress bar */}
      {!isUnlimited && (
        <div className="space-y-1">
          <div className="h-2 w-full rounded-full bg-gray-100 overflow-hidden relative shadow-inner">
            <motion.div
              className={`h-full rounded-full ${
                isTimeCritical ? 'bg-red-500' : progressPercent < 30 ? 'bg-amber-500' : 'bg-emerald-500'
              }`}
              initial={{ width: '100%' }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ ease: 'linear', duration: 1 }}
            />
          </div>
          <div className="flex justify-between items-center text-[8px] text-gray-400 font-bold font-mono tracking-wide uppercase">
            <span>Progress timeline</span>
            <span>{Math.round(100 - progressPercent)}% complete</span>
          </div>
        </div>
      )}

      {/* Critical Warnings drawer */}
      {isTimeCritical && timeLeft > 0 && (
        <div className="flex gap-2 items-start p-3 bg-red-50 rounded-xl border border-red-100 text-[10px] text-red-800 leading-normal font-medium animate-pulse text-left">
          <AlertCircle className="h-4.5 w-4.5 text-red-600 flex-shrink-0" />
          <div>
            <span className="font-extrabold">⚠️ TIME IS RUNNING OUT:</span> Only {formatTime(timeLeft)} minutes remaining! Work quickly to finalize your answers. The test will automatically submit when the clock hits zero.
          </div>
        </div>
      )}

      {/* Accelerate countdown for previewers */}
      {!isUnlimited && timeLeft > 10 && (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={handleWarpTime}
            className="text-[9px] font-bold text-gray-400 hover:text-rose-600 hover:border-rose-200 flex items-center gap-1 border border-gray-150 bg-gray-50 px-2 py-0.5 rounded-lg transition-all"
            title="Accelerate timer to test automatic submission on countdown expiry"
          >
            <FastForward className="h-2.5 w-2.5" />
            <span>Accelerate Timer (10s Left Demo)</span>
          </button>
        </div>
      )}
    </div>
  );
}
