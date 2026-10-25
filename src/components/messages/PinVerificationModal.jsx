import React, { useState, useRef, useEffect } from 'react';
import { Modal } from '../common/Modal.jsx';
import { useLanguage } from '../../contexts/LanguageContext.jsx';
import { verifyStudentPin, saveStudentVerificationInBrowser } from '../../services/studentService.js';
import { Lock, KeyRound, AlertCircle, Loader2, Sparkles } from 'lucide-react';

export const PinVerificationModal = ({
  isOpen,
  onClose,
  studentId,
  studentName = 'Student',
  onVerified,
}) => {
  const { t } = useLanguage();
  const [pinDigits, setPinDigits] = useState(['', '', '', '', '', '']);
  const [isVerifying, setIsVerifying] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const inputRefs = useRef([]);

  useEffect(() => {
    if (isOpen) {
      setPinDigits(['', '', '', '', '', '']);
      setErrorMsg('');
      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 150);
    }
  }, [isOpen]);

  const handleChange = (index, value) => {
    const cleanDigit = value.replace(/\D/g, '').slice(-1);
    const newDigits = [...pinDigits];
    newDigits[index] = cleanDigit;
    setPinDigits(newDigits);
    setErrorMsg('');

    if (cleanDigit && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !pinDigits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pasted) return;

    const newDigits = [...pinDigits];
    for (let i = 0; i < 6; i++) {
      newDigits[i] = pasted[i] || '';
    }
    setPinDigits(newDigits);
    setErrorMsg('');

    const nextIndex = Math.min(pasted.length, 5);
    inputRefs.current[nextIndex]?.focus();
  };

  const fullPin = pinDigits.join('');
  const isPinComplete = fullPin.length === 6;

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!isPinComplete || isVerifying) return;

    try {
      setIsVerifying(true);
      setErrorMsg('');

      const isValid = await verifyStudentPin(studentId, fullPin);

      if (isValid) {
        saveStudentVerificationInBrowser(studentId);
        onVerified?.(fullPin);
        onClose?.();
      } else {
        setErrorMsg(t('pinErrorIncorrect'));
        // Focus first box for easy retry
        inputRefs.current[0]?.focus();
      }
    } catch (err) {
      console.error('PIN verification error:', err);
      setErrorMsg(t('pinErrorIncorrect'));
    } finally {
      setIsVerifying(false);
    }
  };

  // Auto-submit when all 6 digits are filled
  useEffect(() => {
    if (isPinComplete && !isVerifying) {
      handleSubmit();
    }
  }, [fullPin]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t('pinLockedTitle')}
      subtitle={t('pinLockedSubtitle')}
      maxWidth="max-w-md"
    >
      <div className="flex flex-col items-center gap-6 py-2">
        {/* Glowing Lock Badge */}
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-purple-500/20 to-pink-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400 shadow-xl shadow-purple-500/10">
          <KeyRound className="w-8 h-8 animate-pulse" />
        </div>

        <p className="text-xs text-slate-300 text-center max-w-xs">
          {t('enterPinPrompt')} ({studentName})
        </p>

        {/* 6 Digit Passcode Input Cells */}
        <div 
          className="flex items-center justify-center gap-2 sm:gap-3 w-full"
          onPaste={handlePaste}
          dir="ltr"
        >
          {pinDigits.map((digit, idx) => (
            <input
              key={idx}
              ref={(el) => (inputRefs.current[idx] = el)}
              type="password"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(idx, e.target.value)}
              onKeyDown={(e) => handleKeyDown(idx, e)}
              disabled={isVerifying}
              className={`w-11 h-14 sm:w-12 sm:h-16 text-center text-xl font-bold rounded-2xl glass-input text-white transition-all ${
                errorMsg
                  ? 'glass-input-error'
                  : digit
                  ? 'border-purple-400 bg-purple-500/20 shadow-sm shadow-purple-500/20 scale-105'
                  : 'hover:border-white/30'
              }`}
            />
          ))}
        </div>

        {errorMsg && (
          <p className="text-xs text-rose-400 font-medium flex items-center gap-1.5 animate-shake">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>{errorMsg}</span>
          </p>
        )}

        <p className="text-[11px] text-slate-400 text-center max-w-xs leading-relaxed">
          {t('pinHintRemembered')}
        </p>

        {/* Submit Button */}
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!isPinComplete || isVerifying}
          className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-500 text-white font-semibold text-sm shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isVerifying ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>{t('verifyingPin')}</span>
            </>
          ) : (
            <>
              <Lock className="w-4 h-4" />
              <span>{t('unlockInboxBtn')}</span>
            </>
          )}
        </button>
      </div>
    </Modal>
  );
};
