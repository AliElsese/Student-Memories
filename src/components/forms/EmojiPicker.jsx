import React from 'react';
import { PERSONALITY_EMOJIS } from '../../utils/constants.js';
import { useLanguage } from '../../contexts/LanguageContext.jsx';
import { Smile } from 'lucide-react';

export const EmojiPicker = ({
  selectedEmoji,
  onSelectEmoji,
  error,
  touched,
}) => {
  const { t } = useLanguage();
  const hasError = Boolean(touched && error);

  return (
    <div className="w-full flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <label className="text-xs sm:text-sm font-semibold text-slate-200 flex items-center gap-1.5">
          <Smile className="w-4 h-4 text-amber-400" />
          <span>{t('personalityEmojiLabel')}</span>
          <span className="text-pink-400">*</span>
        </label>
        
        {/* Selected badge preview */}
        {selectedEmoji && (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-500/40 text-xs text-purple-200">
            <span>Selected:</span>
            <span className="text-base">{selectedEmoji}</span>
          </div>
        )}
      </div>

      <p className="text-[11px] text-slate-400">
        {t('personalityEmojiHint')}
      </p>

      {/* Grid of emojis */}
      <div className="p-3 rounded-2xl glass-input border border-white/10 grid grid-cols-6 sm:grid-cols-8 md:grid-cols-12 gap-2">
        {PERSONALITY_EMOJIS.map((emoji) => {
          const isSelected = selectedEmoji === emoji;
          return (
            <button
              key={emoji}
              type="button"
              onClick={() => onSelectEmoji(emoji)}
              className={`h-11 sm:h-12 rounded-xl text-2xl flex items-center justify-center transition-all cursor-pointer transform active:scale-95 ${
                isSelected
                  ? 'bg-purple-600/50 border-2 border-purple-400 shadow-md shadow-purple-500/30 scale-110 -translate-y-0.5'
                  : 'hover:bg-white/10 hover:scale-105 border border-transparent'
              }`}
              title={`Choose ${emoji}`}
            >
              {emoji}
            </button>
          );
        })}
      </div>

      {hasError && (
        <p className="text-xs text-rose-400 font-medium flex items-center gap-1 animate-fade-in">
          <span>⚠️</span>
          <span>{error}</span>
        </p>
      )}
    </div>
  );
};
