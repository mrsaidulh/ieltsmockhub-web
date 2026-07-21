import React from 'react';
import { Check, X, AlertCircle, HelpCircle } from 'lucide-react';
import { IELTSQuestion, QuestionType } from '../types';

interface QuestionRendererProps {
  question: IELTSQuestion;
  value: string;
  onChange: (val: string) => void;
  showFeedback?: boolean;
  disabled?: boolean;
}

export default function QuestionRenderer({
  question,
  value,
  onChange,
  showFeedback = false,
  disabled = false
}: QuestionRendererProps) {
  const isCorrect = showFeedback && value?.trim().toLowerCase() === question.correctAnswer?.trim().toLowerCase();
  const hasAnswer = !!value;

  // Render check / error badges in feedback mode
  const renderFeedbackStatus = () => {
    if (!showFeedback) return null;
    return isCorrect ? (
      <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-lg mt-2 animate-in fade-in zoom-in-95">
        <Check className="h-4 w-4 stroke-[3]" />
        <span>Correct — Answer: {question.correctAnswer}</span>
      </div>
    ) : (
      <div className="flex flex-col gap-1.5 mt-2 animate-in fade-in duration-150">
        <div className="flex items-center gap-1.5 text-xs font-bold text-rose-600 bg-rose-50 border border-rose-100 px-2.5 py-1 rounded-lg">
          <X className="h-4 w-4 stroke-[3]" />
          <span>Incorrect {value ? `(Your answer: "${value}")` : '(No answer supplied)'}</span>
        </div>
        <div className="p-2.5 rounded-lg bg-emerald-50/50 border border-emerald-100/60 text-[11px] text-gray-700 leading-normal">
          <strong className="text-emerald-800">Correct Answer:</strong> <span className="font-mono font-bold text-emerald-700">{question.correctAnswer}</span>
          {question.explanation && (
            <p className="mt-1 text-gray-500 italic">"{question.explanation}"</p>
          )}
        </div>
      </div>
    );
  };

  switch (question.type) {
    case 'MCQ': {
      const options = question.options || ['A. Option A', 'B. Option B', 'C. Option C', 'D. Option D'];
      return (
        <div className="space-y-2">
          <div className="grid gap-2">
            {options.map((opt) => {
              const optCode = opt.substring(0, 1); // A, B, C, D
              const isSelected = value === optCode;

              return (
                <button
                  key={opt}
                  type="button"
                  disabled={disabled}
                  onClick={() => onChange(optCode)}
                  className={`w-full text-left p-3 rounded-xl text-xs border transition-all flex items-center gap-3 cursor-pointer ${
                    isSelected
                      ? 'bg-rose-50/70 border-rose-400 text-rose-900 font-semibold shadow-2xs'
                      : 'bg-white border-gray-100 text-gray-600 hover:bg-gray-50/70 hover:border-gray-300'
                  } ${disabled ? 'opacity-80 cursor-not-allowed' : ''}`}
                >
                  <div className={`h-6 w-6 shrink-0 rounded-full border flex items-center justify-center font-bold text-xs transition-colors ${
                    isSelected
                      ? 'bg-rose-600 border-rose-600 text-white shadow-xs'
                      : 'bg-gray-50 border-gray-200 text-gray-500'
                  }`}>
                    {optCode}
                  </div>
                  <span className="leading-tight">{opt.includes('. ') ? opt.split('. ').slice(1).join('. ') : opt}</span>
                </button>
              );
            })}
          </div>
          {renderFeedbackStatus()}
        </div>
      );
    }

    case 'TrueFalseNotGiven':
    case 'YesNoNotGiven': {
      const choices = question.type === 'TrueFalseNotGiven' 
        ? ['True', 'False', 'Not Given'] 
        : ['Yes', 'No', 'Not Given'];

      return (
        <div className="space-y-2">
          <div className="grid grid-cols-3 gap-2">
            {choices.map((opt) => {
              const isSelected = value === opt;
              return (
                <button
                  key={opt}
                  type="button"
                  disabled={disabled}
                  onClick={() => onChange(opt)}
                  className={`py-2.5 rounded-xl text-xs font-bold border transition-all text-center cursor-pointer ${
                    isSelected
                      ? 'bg-rose-600 border-rose-600 text-white shadow-md'
                      : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-100'
                  } ${disabled ? 'opacity-80 cursor-not-allowed' : ''}`}
                >
                  {opt}
                </button>
              );
            })}
          </div>
          {renderFeedbackStatus()}
        </div>
      );
    }

    case 'MatchingHeadings': {
      const headingOptions = question.headingOptions || ['i. Heading 1', 'ii. Heading 2', 'iii. Heading 3'];
      return (
        <div className="space-y-2 text-left">
          <span className="text-[9px] font-bold text-gray-400 uppercase block tracking-wider mb-1">Select paragraph heading:</span>
          <div className="grid gap-2">
            {headingOptions.map((heading) => {
              const headingCode = heading.split('.')[0].trim(); // i, ii, iii
              const isSelected = value === headingCode;

              return (
                <button
                  key={heading}
                  type="button"
                  disabled={disabled}
                  onClick={() => onChange(headingCode)}
                  className={`w-full text-left p-2.5 rounded-xl text-xs border transition-all flex items-center justify-between cursor-pointer ${
                    isSelected
                      ? 'bg-rose-50 border-rose-400 text-rose-800 font-bold'
                      : 'bg-white border-gray-150 text-gray-600 hover:bg-gray-50'
                  } ${disabled ? 'opacity-80 cursor-not-allowed' : ''}`}
                >
                  <span className="leading-snug">{heading}</span>
                  <div className={`h-4.5 w-4.5 rounded-full border flex items-center justify-center shrink-0 ml-2 ${
                    isSelected ? 'bg-rose-600 border-rose-600 text-white' : 'border-gray-200 bg-gray-50'
                  }`}>
                    {isSelected && <Check className="h-2.5 w-2.5 stroke-[3]" />}
                  </div>
                </button>
              );
            })}
          </div>
          {renderFeedbackStatus()}
        </div>
      );
    }

    case 'MatchingInfo': {
      const options = question.options || ['A', 'B', 'C', 'D'];
      return (
        <div className="space-y-2 text-left">
          <span className="text-[9px] font-bold text-gray-400 uppercase block tracking-wider mb-1">Select paragraph letter:</span>
          <div className="flex flex-wrap gap-2">
            {options.map((opt) => {
              const letter = opt.substring(0, 1);
              const label = opt.includes('. ') ? opt.split('. ').slice(1).join('. ') : opt;
              const isSelected = value === letter;
              return (
                <button
                  key={opt}
                  type="button"
                  disabled={disabled}
                  onClick={() => onChange(letter)}
                  className={`h-9 min-w-9 px-2 rounded-xl text-xs font-extrabold border transition-all flex items-center justify-center cursor-pointer ${
                    isSelected
                      ? 'bg-rose-600 border-rose-600 text-white shadow-md'
                      : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                  } ${disabled ? 'opacity-80 cursor-not-allowed' : ''}`}
                  title={label}
                >
                  {letter}
                </button>
              );
            })}
          </div>
          {renderFeedbackStatus()}
        </div>
      );
    }

    case 'MatchingFeatures':
    case 'MatchingSentenceEndings': {
      const options = question.options || ['A. Option A', 'B. Option B', 'C. Option C'];
      return (
        <div className="space-y-2 text-left">
          <span className="text-[9px] font-bold text-gray-400 uppercase block tracking-wider">
            {question.type === 'MatchingFeatures' ? 'Select the matching feature:' : 'Choose correct sentence ending:'}
          </span>
          <div className="grid gap-2">
            {options.map((opt) => {
              const code = opt.substring(0, 1);
              const label = opt.includes('. ') ? opt.split('. ').slice(1).join('. ') : opt;
              const isSelected = value === code;
              return (
                <button
                  key={opt}
                  type="button; shadow-2xs"
                  disabled={disabled}
                  onClick={() => onChange(code)}
                  className={`text-left p-3 rounded-xl text-xs border transition-all flex items-start gap-2.5 cursor-pointer ${
                    isSelected
                      ? 'bg-rose-50 border-rose-400 text-rose-900 font-semibold'
                      : 'bg-white border-gray-150 text-gray-600 hover:bg-gray-50'
                  } ${disabled ? 'opacity-80 cursor-not-allowed' : ''}`}
                >
                  <div className={`h-5 w-5 shrink-0 rounded-full flex items-center justify-center font-bold text-[10px] mt-0.5 ${
                    isSelected ? 'bg-rose-600 text-white shadow-xs' : 'bg-gray-100 text-gray-500'
                  }`}>
                    {code}
                  </div>
                  <span className="leading-relaxed">{label}</span>
                </button>
              );
            })}
          </div>
          {renderFeedbackStatus()}
        </div>
      );
    }

    case 'SentenceCompletion':
    case 'SummaryCompletion':
    case 'DiagramCompletion':
    case 'ShortAnswer':
    case 'Blanks':
    default: {
      const options = question.options || [];
      return (
        <div className="space-y-2.5 text-left">
          {/* Word bank pill selections if options are configured */}
          {options.length > 0 && (
            <div className="space-y-1">
              <span className="text-[8px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Click to select word bank:</span>
              <div className="flex flex-wrap gap-1.5 p-2 rounded-lg border border-gray-100 bg-gray-50/50">
                {options.map((opt) => {
                  const label = opt.includes('. ') ? opt.split('. ').slice(1).join('. ') : opt;
                  const code = opt.substring(0, 1);
                  // Check if selected by checking both direct code and actual text
                  const isSelected = value?.toLowerCase().trim() === label.toLowerCase().trim() || value === code;

                  return (
                    <button
                      key={opt}
                      type="button"
                      disabled={disabled}
                      onClick={() => onChange(label)}
                      className={`px-2.5 py-1 rounded-md text-[10px] font-bold border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-rose-600 border-rose-600 text-white shadow-xs'
                          : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-100'
                      } ${disabled ? 'opacity-80 cursor-not-allowed' : ''}`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="relative">
            <input
              type="text"
              disabled={disabled}
              value={value || ''}
              onChange={(e) => onChange(e.target.value)}
              placeholder={
                question.type === 'SentenceCompletion' ? "Complete the sentence gap (maximum 2 words)..." :
                question.type === 'SummaryCompletion' ? "Fill in the summary blank gap..." :
                question.type === 'DiagramCompletion' ? "Type corresponding diagram label..." :
                question.type === 'ShortAnswer' ? "Write your short response..." :
                "Type your missing answer here..."
              }
              className="w-full rounded-xl border border-gray-200 bg-gray-50/50 p-3 pr-10 text-xs text-gray-800 outline-none transition-all focus:bg-white focus:border-rose-500 focus:ring-1 focus:ring-rose-500 shadow-inner font-sans font-bold"
            />
            {hasAnswer && (
              <span className="absolute inset-y-0 right-3 flex items-center text-emerald-500">
                <Check className="h-4 w-4 stroke-[3]" />
              </span>
            )}
          </div>
          {renderFeedbackStatus()}
        </div>
      );
    }
  }
}
