import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useLanguage } from '../contexts/LanguageContext.jsx';
import { loginAdmin, isAdminAuthenticated } from '../services/adminAuthService.js';
import { FormInput } from '../components/forms/FormInput.jsx';
import { ShieldCheck, Lock, Mail, ArrowRight, ArrowLeft, AlertCircle, Loader2, Sparkles } from 'lucide-react';

export const AdminLoginPage = () => {
  const { t, isRTL } = useLanguage();
  const navigate = useNavigate();
  const [authError, setAuthError] = useState('');

  // If already logged in, redirect immediately to dashboard
  React.useEffect(() => {
    if (isAdminAuthenticated()) {
      navigate('/admin/dashboard', { replace: true });
    }
  }, [navigate]);

  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
    },
    validationSchema: Yup.object().shape({
      email: Yup.string()
        .email('Invalid email address')
        .required('Email is required'),
      password: Yup.string()
        .required('Password is required'),
    }),
    onSubmit: async (values, { setSubmitting }) => {
      setAuthError('');
      try {
        const success = loginAdmin(values.email, values.password);
        if (success) {
          navigate('/admin/dashboard', { replace: true });
        } else {
          setAuthError(t('adminInvalidCredentials'));
        }
      } catch (err) {
        console.error('Login error:', err);
        setAuthError(t('adminInvalidCredentials'));
      } finally {
        setSubmitting(false);
      }
    },
  });

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        
        {/* Glowing Shield Icon Header */}
        <div className="text-center mb-8">
          <div className="inline-flex w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 p-0.5 shadow-xl shadow-purple-500/20 mb-4 animate-scale-up">
            <div className="w-full h-full bg-slate-950/90 rounded-[14px] flex items-center justify-center">
              <ShieldCheck className="w-8 h-8 text-purple-400" />
            </div>
          </div>
          
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            {t('adminLoginTitle')}
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-slate-300 max-w-sm mx-auto leading-relaxed">
            {t('adminLoginSubtitle')}
          </p>
        </div>

        {/* Glassmorphism Login Card */}
        <div className="glass-card rounded-3xl p-6 sm:p-8 border border-white/15 shadow-2xl relative">
          <form onSubmit={formik.handleSubmit} className="flex flex-col gap-5">
            
            <FormInput
              id="email"
              name="email"
              type="email"
              label={t('adminEmailLabel')}
              placeholder="ali.elsese104@gmail.com"
              icon={Mail}
              required
              value={formik.values.email}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.errors.email}
              touched={formik.touched.email}
            />

            <FormInput
              id="password"
              name="password"
              type="password"
              label={t('adminPasswordLabel')}
              placeholder="••••••••"
              icon={Lock}
              required
              value={formik.values.password}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.errors.password}
              touched={formik.touched.password}
            />

            {authError && (
              <div className="p-3 rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-start gap-2.5 text-rose-300 text-xs animate-shake">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{authError}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={formik.isSubmitting}
              className="w-full mt-2 py-3.5 px-6 rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-500 text-white font-bold text-sm shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {formik.isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{t('adminSigningIn')}</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>{t('adminLoginBtn')}</span>
                  {isRTL ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
                </>
              )}
            </button>
          </form>

          {/* Quick Credential Hint Box for evaluation */}
          <div className="mt-6 pt-4 border-t border-white/10 text-center">
            <p className="text-[11px] text-slate-400">
              Super Admin: <span className="text-purple-300 font-mono">ali.elsese104@gmail.com</span>
            </p>
          </div>
        </div>

        {/* Back Link */}
        <div className="text-center mt-6">
          <Link
            to="/register"
            className="text-xs text-slate-400 hover:text-white transition-colors inline-flex items-center gap-1.5"
          >
            {isRTL ? <ArrowRight className="w-3.5 h-3.5" /> : <ArrowLeft className="w-3.5 h-3.5" />}
            <span>{t('backToRegister')}</span>
          </Link>
        </div>

      </div>
    </div>
  );
};
