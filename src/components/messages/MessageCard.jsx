import React, { useState } from 'react';
import { useLanguage } from '../../contexts/LanguageContext.jsx';
import { Copy, Check, MessageSquareQuote, Clock } from 'lucide-react';

export const MessageCard = ({ message, index = 0 }) => {
  const { language, isRTL } = useLanguage();
  const [copied, setCopied] = useState(false);

  // Subtle accent variations based on index
  const accentGradients = [
    'from-indigo-500/20 via-purple-500/10 to-transparent',
    'from-purple-500/20 via-pink-500/10 to-transparent',
    'from-pink-500/20 via-amber-500/10 to-transparent',
    'from-cyan-500/20 via-indigo-500/10 to-transparent',
  ];
  const accentClass = accentGradients[index % accentGradients.length];

  // Format timestamp nicely
  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat(language === 'ar' ? 'ar-EG' : 'en-US', {
        dateStyle: 'medium',
        timeStyle: 'short',
      }).format(date);
    } catch {
      return dateString;
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.message_text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  return (
    <div className={`glass-card rounded-3xl p-6 relative overflow-hidden transition-all duration-300 hover:scale-[1.01] hover:border-white/20 bg-gradient-to-br ${accentClass}`}>
      {/* Decorative quote icon */}
      <div className="absolute top-4 right-4 rtl:right-auto rtl:left-4 text-white/10 pointer-events-none">
        <MessageSquareQuote className="w-10 h-10" />
      </div>

      {/* Message content */}
      <div className="relative z-10">
        <p className="text-white text-base sm:text-lg leading-relaxed whitespace-pre-wrap break-words font-normal">
          "{message.message_text}"
        </p>
      </div>

      {/* Card Footer: Timestamp & Copy action */}
      <div className="mt-5 pt-3 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-purple-400" />
          <span>{formatDate(message.created_at)}</span>
        </div>

        <button
          type="button"
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer"
          title="Copy message"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-[11px] text-emerald-400">Copied</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span className="text-[11px]">Copy</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
