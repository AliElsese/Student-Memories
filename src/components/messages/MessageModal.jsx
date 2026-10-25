import React, { useState } from 'react';
import { Modal } from '../common/Modal.jsx';
import { useLanguage } from '../../contexts/LanguageContext.jsx';
import { sendAnonymousMessage } from '../../services/messageService.js';
import { MAX_MESSAGE_LENGTH } from '../../utils/constants.js';
import { Send, ShieldCheck, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import confetti from 'canvas-confetti';

export const MessageModal = ({
  isOpen,
  onClose,
  recipient,
}) => {
  const { t } = useLanguage();
  const [messageText, setMessageText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!recipient) return null;

  const charactersRemaining = MAX_MESSAGE_LENGTH - messageText.length;
  const isTooLong = charactersRemaining < 0;
  const isEmpty = !messageText.trim();

  const handleSend = async (e) => {
    e.preventDefault();
    if (isEmpty || isTooLong || isSubmitting) return;

    try {
      setIsSubmitting(true);
      setErrorMsg('');

      await sendAnonymousMessage({
        recipientStudentId: recipient.id,
        messageText: messageText.trim(),
      });

      setIsSuccess(true);
      setMessageText('');

      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 },
        });
      } catch {
        // Confetti fallback
      }
    } catch (err) {
      console.error('Error sending message:', err);
      setErrorMsg(err.message || 'Failed to send message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setIsSuccess(false);
    setMessageText('');
    setErrorMsg('');
    onClose?.();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={isSuccess ? t('messageSentSuccess') : t('sendModalTitle')}
      subtitle={isSuccess ? t('messageSentDesc') : t('sendModalSubtitle')}
      maxWidth="max-w-md"
    >
      {isSuccess ? (
        <div className="flex flex-col items-center text-center py-4">
          <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 mb-4 animate-bounce">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <p className="text-sm text-slate-300 max-w-xs mb-6">
            {t('messageSentDesc')}
          </p>
          <div className="flex items-center gap-3 w-full">
            <button
              type="button"
              onClick={() => setIsSuccess(false)}
              className="flex-1 py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/15 text-slate-200 text-xs font-semibold transition-colors cursor-pointer"
            >
              {t('sendAnother')}
            </button>
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 py-2.5 px-4 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-md transition-colors cursor-pointer"
            >
              {t('closeBtn')}
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSend} className="flex flex-col gap-4">
          {/* Recipient Profile Card Preview */}
          <div className="flex items-center gap-3 p-3 rounded-2xl glass-card border border-white/10">
            <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-900 border border-white/15 shrink-0">
              <img
                src={recipient.photo_url}
                alt={recipient.full_name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-[11px] text-slate-400">{t('recipientLabel')}</span>
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-bold text-white truncate">
                  {recipient.full_name}
                </span>
                <span>{recipient.personality_emoji || '🎓'}</span>
              </div>
            </div>
          </div>

          {/* Anonymous Disclaimer */}
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-purple-500/10 border border-purple-500/20 text-[11px] text-purple-200">
            <ShieldCheck className="w-4 h-4 text-purple-400 shrink-0" />
            <span>{t('anonymousNotice')}</span>
          </div>

          {/* Chat-inspired Textarea */}
          <div className="relative">
            <textarea
              rows={5}
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              placeholder={t('messagePlaceholder')}
              maxLength={MAX_MESSAGE_LENGTH + 50}
              disabled={isSubmitting}
              className={`w-full p-4 rounded-2xl glass-input text-sm text-white placeholder-slate-400/60 transition-all resize-none ${
                isTooLong ? 'glass-input-error' : ''
              }`}
            />

            {/* Character Counter */}
            <div className="flex items-center justify-end mt-1 px-1">
              <span
                className={`text-[11px] font-mono ${
                  isTooLong
                    ? 'text-rose-400 font-bold'
                    : charactersRemaining < 100
                    ? 'text-amber-400'
                    : 'text-slate-400'
                }`}
              >
                {messageText.length} / {MAX_MESSAGE_LENGTH} {t('charsCount')}
              </span>
            </div>
          </div>

          {errorMsg && (
            <p className="text-xs text-rose-400 font-medium flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{errorMsg}</span>
            </p>
          )}

          {/* Action Buttons */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="flex-1 py-3 px-4 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white font-medium text-xs sm:text-sm border border-white/10 transition-colors cursor-pointer"
            >
              {t('cancelBtn')}
            </button>

            <button
              type="submit"
              disabled={isEmpty || isTooLong || isSubmitting}
              className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-500 text-white font-semibold text-xs sm:text-sm shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{t('sendingMessage')}</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>{t('sendMessageAction')}</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
};
