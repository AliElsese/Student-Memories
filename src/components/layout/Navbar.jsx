import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext.jsx';
import { GraduationCap, Languages, Sparkles } from 'lucide-react';

export const Navbar = () => {
  const { t, language, toggleLanguage, isRTL } = useLanguage();
  const location = useLocation();

  const isRegisterActive = location.pathname === '/' || location.pathname === '/register';

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-slate-950/70 border-b border-white/10 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        
        {/* Brand / Logo */}
        <Link 
          to="/register" 
          className="flex items-center gap-3 group focus:outline-none"
        >
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 p-0.5 shadow-lg shadow-indigo-500/25 group-hover:scale-105 transition-transform duration-300">
            <div className="w-full h-full bg-slate-950/90 rounded-[14px] flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-indigo-400 group-hover:text-pink-400 transition-colors" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
                {t('appTitle')}
              </span>
              <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            </div>
            <p className="text-xs text-slate-400 font-normal hidden sm:block">
              {t('appSubtitle')}
            </p>
          </div>
        </Link>

        {/* Action Controls & Navigation */}
        <div className="flex items-center gap-3">
          {/* Navigation link to Register */}
          <Link
            to="/register"
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              isRegisterActive
                ? 'bg-white/10 text-white shadow-sm border border-white/15'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            {t('registerNav')}
          </Link>

          {/* Bilingual Language Switcher */}
          <button
            type="button"
            onClick={toggleLanguage}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl glass-input text-xs font-semibold text-slate-200 hover:text-white hover:border-purple-400/50 hover:bg-white/10 transition-all cursor-pointer shadow-sm group"
            title={language === 'en' ? 'التحويل إلى العربية' : 'Switch to English'}
          >
            <Languages className="w-4 h-4 text-purple-400 group-hover:rotate-12 transition-transform duration-300" />
            <span>{language === 'en' ? 'العربية' : 'English'}</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-emerald-400/30" />
          </button>
        </div>

      </div>
    </header>
  );
};
