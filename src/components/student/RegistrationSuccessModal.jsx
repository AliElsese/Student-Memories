import React, { useEffect } from 'react';
import { Modal } from '../common/Modal.jsx';
import { useLanguage } from '../../contexts/LanguageContext.jsx';
import confetti from 'canvas-confetti';
import { GraduationCap, Sparkles, CheckCircle2 } from 'lucide-react';

export const RegistrationSuccessModal = ({
  isOpen,
  onClose,
  student,
  onResetForm,
}) => {
  const { t } = useLanguage();

  useEffect(() => {
    if (isOpen) {
      // Celebratory multi-color confetti burst
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#fbbf24', '#a855f7', '#ec4899', '#6366f1', '#34d399'],
        });
      } catch {
        // Safe fallback
      }
    }
  }, [isOpen]);

  if (!student) return null;

  const handleDone = () => {
    onClose?.();
    onResetForm?.();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleDone}
      maxWidth="max-w-md"
    >
      <div className="flex flex-col items-center text-center py-2 relative">
        
        {/* Floating Celebration Animation Icon */}
        <div className="relative mb-5">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-amber-400 via-pink-500 to-purple-600 p-1 shadow-2xl shadow-purple-500/40 animate-scale-up">
            <div className="w-full h-full bg-slate-950/90 rounded-[22px] flex items-center justify-center">
              <GraduationCap className="w-10 h-10 text-amber-300 animate-pulse" />
            </div>
          </div>
          {/* Floating animated sparkles */}
          <div className="absolute -top-2 -right-2 text-xl animate-bounce">
            ✨
          </div>
          <div className="absolute -bottom-1 -left-2 text-xl animate-bounce delay-150">
            🎉
          </div>
        </div>

        {/* Celebratory Title & Subtitle */}
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold mb-3 shadow-sm">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          <span>Class of 2026</span>
        </div>

        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-amber-100 to-purple-200 bg-clip-text text-transparent mb-2">
          {t('regSuccessTitle')}
        </h2>

        <p className="text-xs sm:text-sm text-slate-300 max-w-sm mb-6 leading-relaxed">
          {t('regSuccessSubtitle')}
        </p>

        {/* Student Commemorative Card Preview Showcase */}
        <div className="w-full p-4 rounded-3xl glass-card-owner border border-purple-400/40 shadow-xl mb-6 flex flex-col items-center text-center relative overflow-hidden">
          {/* Student Photo & Personality Emoji Badge */}
          <div className="relative mt-1 mb-3">
            <div className="w-24 h-24 rounded-2xl overflow-hidden border-2 border-purple-400 shadow-xl bg-slate-900">
              <img
                src={student.photo_url || student.photoUrl}
                alt={student.full_name || student.fullName}
                className="w-full h-full object-cover object-center"
              />
            </div>
            <div 
              className="absolute -bottom-2 -right-2 rtl:-right-auto rtl:-left-2 w-8 h-8 rounded-xl bg-slate-900/90 border border-white/20 shadow flex items-center justify-center text-base backdrop-blur-md"
              title="Personality Emoji"
            >
              {student.personality_emoji || student.personalityEmoji || '🎓'}
            </div>
          </div>

          {/* Student Full Name & Nickname */}
          <h3 className="font-extrabold text-white text-lg tracking-tight">
            {student.full_name || student.fullName}
          </h3>

          {(student.nickname) && (
            <p className="text-xs text-purple-300 font-medium italic mt-0.5">
              "{student.nickname}"
            </p>
          )}

          {/* Warm graduation invitation message */}
          <div className="mt-4 py-3 px-4 rounded-2xl bg-gradient-to-r from-purple-500/15 via-pink-500/15 to-amber-500/15 border border-purple-400/30 text-sm font-semibold text-amber-200 text-center shadow-inner tracking-wide">
            <p>{t('regCelebrationMessage')}</p>
          </div>
        </div>

        {/* Single "Done" Action Button - No Diverging Options */}
        <button
          type="button"
          onClick={handleDone}
          className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-500 text-white font-bold text-sm shadow-xl shadow-purple-500/25 hover:shadow-purple-500/40 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <Sparkles className="w-4 h-4 text-amber-300" />
          <span>{t('doneBtn')}</span>
        </button>

      </div>
    </Modal>
  );
};
