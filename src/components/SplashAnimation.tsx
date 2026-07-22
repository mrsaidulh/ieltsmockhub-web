import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Target, BookOpen, Award, Zap } from 'lucide-react';

interface SplashAnimationProps {
  onComplete: () => void;
}

export default function SplashAnimation({ onComplete }: SplashAnimationProps) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    // Step progression timer
    const timer1 = setTimeout(() => setStep(1), 300);   // Words start appearing
    const timer2 = setTimeout(() => setStep(2), 1100);  // Highlighting final word & badge
    const timer3 = setTimeout(() => setStep(3), 2200);  // Trigger fade out
    const timer4 = setTimeout(() => onComplete(), 2700); // Complete splash

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
    };
  }, [onComplete]);

  const words = [
    { text: "Learn,", color: "text-blue-400", icon: BookOpen, delay: 0.1 },
    { text: "Practice,", color: "text-teal-400", icon: Zap, delay: 0.35 },
    { text: "Test", color: "text-indigo-400", icon: Target, delay: 0.6 },
    { text: "& Score", color: "text-amber-400 font-black", icon: Award, delay: 0.85 }
  ];

  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.03, transition: { duration: 0.5, ease: "easeInOut" } }}
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-gray-950 text-white overflow-hidden select-none"
    >
      {/* Background Animated Gradient Orbs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.15, 0.3, 0.15],
            x: [-30, 30, -30],
            y: [-20, 20, -20]
          }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-rose-600/30 blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1, 1.25, 1],
            opacity: [0.15, 0.3, 0.15],
            x: [40, -20, 40],
            y: [30, -30, 30]
          }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-indigo-600/30 blur-3xl"
        />
      </div>

      <div className="relative z-10 max-w-2xl w-full px-6 text-center space-y-8">
        {/* Main Headline Animated Words */}
        <div className="py-2 space-y-4">
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight leading-tight flex flex-wrap items-center justify-center gap-x-3 gap-y-2">
            {words.map((item, idx) => {
              const IconComp = item.icon;
              return (
                <motion.span
                  key={idx}
                  initial={{ opacity: 0, y: 25, filter: 'blur(8px)' }}
                  animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  transition={{ duration: 0.5, delay: item.delay, ease: [0.215, 0.61, 0.355, 1] }}
                  className={`inline-flex items-center gap-2 ${item.color}`}
                >
                  <span>{item.text}</span>
                </motion.span>
              );
            })}
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: step >= 1 ? 1 : 0, y: step >= 1 ? 0 : 10 }}
            transition={{ duration: 0.6, delay: 1.0 }}
            className="text-xs sm:text-sm text-gray-400 font-medium max-w-md mx-auto"
          >
            Your comprehensive preparation hub for Academic & General Training Band 9 success.
          </motion.p>
        </div>

        {/* Dynamic Interactive Stage Pills */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: step >= 1 ? 1 : 0, scale: step >= 1 ? 1 : 0.95 }}
          transition={{ duration: 0.5, delay: 1.1 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 max-w-lg mx-auto pt-2"
        >
          {[
            { title: "Learn", detail: "Band 9 Models", activeColor: "border-blue-500/40 bg-blue-500/10 text-blue-300" },
            { title: "Practice", detail: "All 4 Modules", activeColor: "border-teal-500/40 bg-teal-500/10 text-teal-300" },
            { title: "Test", detail: "Real Exam Timers", activeColor: "border-indigo-500/40 bg-indigo-500/10 text-indigo-300" },
            { title: "Score", detail: "Detailed Criteria", activeColor: "border-amber-500/40 bg-amber-500/10 text-amber-300" }
          ].map((pill, pIdx) => (
            <motion.div
              key={pIdx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2 + pIdx * 0.1 }}
              className={`p-2.5 rounded-xl border backdrop-blur-xs text-left transition-all ${pill.activeColor}`}
            >
              <p className="text-xs font-bold">{pill.title}</p>
              <p className="text-[10px] opacity-75">{pill.detail}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Animated Loading Bar */}
        <div className="pt-6 max-w-xs mx-auto">
          <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden p-0.5">
            <motion.div
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ duration: 2.3, ease: "linear" }}
              className="h-full bg-gradient-to-r from-blue-500 via-rose-500 to-amber-400 rounded-full"
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
