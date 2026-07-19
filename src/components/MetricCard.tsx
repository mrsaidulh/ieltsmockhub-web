import React from 'react';
import { motion } from 'motion/react';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtext: string;
  icon: LucideIcon;
  trend?: string;
  color: 'rose' | 'orange' | 'amber' | 'blue' | 'indigo';
}

export default function MetricCard({
  title,
  value,
  subtext,
  icon: IconComponent,
  trend,
  color,
}: MetricCardProps) {
  const colorStyles = {
    rose: {
      bg: 'bg-rose-50/70',
      text: 'text-rose-600',
      border: 'border-rose-100',
      accent: 'from-rose-500 to-pink-600',
      shadow: 'shadow-rose-100',
    },
    orange: {
      bg: 'bg-orange-50/70',
      text: 'text-orange-600',
      border: 'border-orange-100',
      accent: 'from-orange-500 to-amber-600',
      shadow: 'shadow-orange-100',
    },
    amber: {
      bg: 'bg-amber-50/70',
      text: 'text-amber-600',
      border: 'border-amber-100',
      accent: 'from-amber-500 to-yellow-600',
      shadow: 'shadow-amber-100',
    },
    blue: {
      bg: 'bg-blue-50/70',
      text: 'text-blue-600',
      border: 'border-blue-100',
      accent: 'from-blue-500 to-sky-600',
      shadow: 'shadow-blue-100',
    },
    indigo: {
      bg: 'bg-indigo-50/70',
      text: 'text-indigo-600',
      border: 'border-indigo-100',
      accent: 'from-indigo-500 to-violet-600',
      shadow: 'shadow-indigo-100',
    },
  };

  const style = colorStyles[color] || colorStyles.rose;

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className={`relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-shadow hover:shadow-md`}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{title}</p>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold tracking-tight text-gray-900">{value}</span>
            {trend && (
              <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                {trend}
              </span>
            )}
          </div>
          <p className="text-xs text-gray-400">{subtext}</p>
        </div>

        <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${style.bg} ${style.text}`}>
          <IconComponent className="h-5 w-5" />
        </div>
      </div>

      {/* Aesthetic bottom color strip */}
      <div className={`absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r ${style.accent}`} />
    </motion.div>
  );
}
