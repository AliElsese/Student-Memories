import React from 'react';
import { useLanguage } from '../../contexts/LanguageContext.jsx';
import { Sparkles, Mail, Eye, Award } from 'lucide-react';
import { Badge } from '../common/Badge.jsx';

export const StudentCard = ({
  student,
  isScannedOwner = false,
  onShowMessages,
  onSendMessage,
}) => {
  const { t } = useLanguage();

  const {
    id,
    full_name,
    nickname,
    photo_url,
    personality_emoji = '🎓',
  } = student;

  return (
    <div
      className={`rounded-3xl p-5 flex flex-col items-center text-center relative transition-all duration-300 ${
        isScannedOwner
          ? 'glass-card-owner ring-2 ring-purple-400/50 scale-[1.02] shadow-2xl shadow-purple-500/20'
          : 'glass-card glass-card-hover'
      }`}
    >
      {/* Special Badge for Scanned Card Owner */}
      {isScannedOwner ? (
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
          <Badge variant="gold" icon={Sparkles}>
            {t('scannedOwnerBadge')}
          </Badge>
        </div>
      ) : (
        <div className="absolute top-3.5 right-3.5 rtl:right-auto rtl:left-3.5 opacity-60 hover:opacity-100 transition-opacity">
          <Badge variant="neutral">
            {t('classmateBadge')}
          </Badge>
        </div>
      )}

      {/* Student Photo with Personality Emoji floating badge */}
      <div className="relative mt-2 mb-4 group">
        <div className={`w-28 h-28 sm:w-32 sm:h-32 rounded-2xl overflow-hidden bg-slate-900 shadow-xl transition-transform duration-300 group-hover:scale-105 ${
          isScannedOwner 
            ? 'border-2 border-purple-400 shadow-purple-500/30' 
            : 'border border-white/20'
        }`}>
          <img
            src={photo_url}
            alt={full_name}
            loading="lazy"
            className="w-full h-full object-cover object-center"
            onError={(e) => {
              // Graceful fallback avatar if image fails to load
              e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                full_name
              )}&background=1e1b4b&color=c7d2fe&size=256`;
            }}
          />
        </div>

        {/* Central/Floating Personality Emoji Badge */}
        <div 
          className="absolute -bottom-2 -right-2 rtl:-right-auto rtl:-left-2 w-10 h-10 rounded-xl bg-slate-900/90 border border-white/25 shadow-lg flex items-center justify-center text-xl backdrop-blur-md transition-transform group-hover:scale-110"
          title={`Personality Emoji: ${personality_emoji}`}
        >
          {personality_emoji}
        </div>
      </div>

      {/* Student Info */}
      <div className="flex flex-col items-center mb-5 w-full px-2">
        <h3 className="font-bold text-base sm:text-lg text-white tracking-tight line-clamp-1">
          {full_name}
        </h3>

        {nickname ? (
          <p className="text-xs text-purple-300 font-medium italic mt-0.5 line-clamp-1">
            "{nickname}"
          </p>
        ) : (
          <span className="text-xs text-slate-400 font-normal mt-0.5 opacity-50">
            &nbsp;
          </span>
        )}
      </div>

      {/* Dynamic Action Button Requirement:
          - Scanned student -> "Show Messages"
          - Classmate -> "Send Message"
      */}
      <div className="w-full mt-auto pt-2">
        {isScannedOwner ? (
          <button
            type="button"
            onClick={() => onShowMessages?.(student)}
            className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 via-pink-500 to-purple-600 text-white font-semibold text-xs sm:text-sm shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Eye className="w-4 h-4" />
            <span>{t('showMessagesBtn')}</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={() => onSendMessage?.(student)}
            className="w-full py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/20 text-slate-100 hover:text-white font-semibold text-xs sm:text-sm border border-white/15 hover:border-purple-400/40 shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer group"
          >
            <Mail className="w-4 h-4 text-purple-400 group-hover:scale-110 transition-transform" />
            <span>{t('sendMessageBtn')}</span>
          </button>
        )}
      </div>
    </div>
  );
};
