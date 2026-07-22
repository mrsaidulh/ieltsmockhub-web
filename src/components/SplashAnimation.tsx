import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { BookOpen, Award, Zap } from 'lucide-react';

interface SplashAnimationProps {
  onComplete: () => void;
}

export default function SplashAnimation({ onComplete }: SplashAnimationProps) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    // Step progression timer
    const timer1 = setTimeout(() => setStep(1), 300);   // Words start appearing
    const timer2 = setTimeout(() => setStep(2), 1100);  // Highlighting final word
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
    { text: "Learn,", color: "text-rose-400 font-extrabold", icon: BookOpen, delay: 0.1 },
    { text: "Practice,", color: "text-amber-400 font-extrabold", icon: Zap, delay: 0.35 },
    { text: "and Score", color: "text-emerald-400 font-black", icon: Award, delay: 0.6 }
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
            opacity: [0.2, 0.4, 0.2],
            x: [-30, 30, -30],
            y: [-20, 20, -20]
          }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-rose-600/40 blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1, 1.25, 1],
            opacity: [0.2, 0.35, 0.2],
            x: [40, -20, 40],
            y: [30, -30, 30]
          }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-pink-600/35 blur-3xl"
        />
      </div>

      <div className="relative z-10 max-w-2xl w-full px-6 text-center space-y-8">
        {/* Main Headline Animated Words */}
        <div className="py-2 space-y-4">
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold tracking-tight leading-tight flex flex-nowrap whitespace-nowrap items-center justify-center gap-x-2 sm:gap-x-3">
            {words.map((item, idx) => {
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
            transition={{ duration: 0.6, delay: 0.8 }}
            className="text-xs sm:text-sm text-gray-400 font-medium max-w-md mx-auto"
          >
            Your comprehensive preparation hub for Academic & General Training Band 9 success.
          </motion.p>
        </div>

        {/* Dynamic Interactive Stage Pills */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: step >= 1 ? 1 : 0, scale: step >= 1 ? 1 : 0.95 }}
          transition={{ duration: 0.5, delay: 0.9 }}
          className="grid grid-cols-3 gap-2.5 max-w-md mx-auto pt-2"
        >
          {[
            { title: "Learn", detail: "Band 9 Models", activeColor: "border-rose-500/40 bg-rose-500/10 text-rose-300" },
            { title: "Practice", detail: "All 4 Modules", activeColor: "border-amber-500/40 bg-amber-500/10 text-amber-300" },
            { title: "Score", detail: "Detailed Criteria", activeColor: "border-emerald-500/40 bg-emerald-500/10 text-emerald-300" }
          ].map((pill, pIdx) => (
            <motion.div
              key={pIdx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.0 + pIdx * 0.1 }}
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
              className="h-full bg-gradient-to-r from-rose-500 via-pink-500 to-amber-400 rounded-full"
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
