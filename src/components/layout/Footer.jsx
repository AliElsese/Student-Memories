import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext.jsx';
import { Sparkles, ShieldCheck } from 'lucide-react';

export const Footer = () => {
  const { t } = useLanguage();

  return (
    <footer className="w-full border-t border-white/5 py-10 mt-20 relative z-10 text-center">
      <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
        <div className="flex items-center gap-1.5 justify-center">
          <span>{t('footerText')}</span>
        </div>
        <div className="flex items-center gap-4 justify-center">
          <Link
            to="/admin/dashboard"
            className="text-slate-500 hover:text-purple-300 transition-colors inline-flex items-center gap-1.5"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
            <span>{t('adminNav')}</span>
          </Link>
          <div className="flex items-center gap-1.5 text-slate-500">
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span>Class of 2026 Memories</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
