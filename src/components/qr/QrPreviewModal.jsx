import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Modal } from '../common/Modal.jsx';
import { QrCodeViewer } from './QrCodeViewer.jsx';
import { useLanguage } from '../../contexts/LanguageContext.jsx';
import confetti from 'canvas-confetti';
import { ArrowRight, ArrowLeft, PlusCircle, CheckCircle2 } from 'lucide-react';

export const QrPreviewModal = ({
  isOpen,
  onClose,
  student,
  onResetForm,
}) => {
  const { t, isRTL } = useLanguage();
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      // Trigger joyful celebration confetti
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#6366f1', '#a855f7', '#ec4899', '#fbbf24', '#34d399'],
        });
      } catch {
        // Safe fallback
      }
    }
  }, [isOpen]);

  if (!student) return null;

  const handleGoToCards = () => {
    onClose?.();
    navigate(`/cards/${student.id}`);
  };

  const handleRegisterAnother = () => {
    onClose?.();
    onResetForm?.();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t('regSuccessTitle')}
      subtitle={t('regSuccessSubtitle')}
      maxWidth="max-w-md"
    >
      <div className="flex flex-col items-center gap-6">
        {/* Student Mini Profile Header */}
        <div className="flex items-center gap-3 p-3 rounded-2xl glass-card w-full">
          <div className="w-14 h-14 rounded-xl overflow-hidden border border-white/20 bg-slate-900 shrink-0">
            <img
              src={student.photo_url || student.photoUrl}
              alt={student.full_name || student.fullName}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-2">
              <h4 className="font-bold text-white text-base truncate">
                {student.full_name || student.fullName}
              </h4>
              <span className="text-lg">
                {student.personality_emoji || student.personalityEmoji || '🎓'}
              </span>
            </div>
            {(student.nickname) && (
              <p className="text-xs text-purple-300 truncate">
                "{student.nickname}"
              </p>
            )}
          </div>
        </div>

        {/* High-Res QR Code Preview & Download */}
        <QrCodeViewer
          studentId={student.id}
          studentName={student.full_name || student.fullName}
          personalityEmoji={student.personality_emoji || student.personalityEmoji}
          size={360}
          exportSize={1200}
        />

        {/* Navigation Action Buttons */}
        <div className="w-full flex flex-col gap-2.5 pt-2">
          <button
            type="button"
            onClick={handleGoToCards}
            className="w-full py-3 px-5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>{t('viewMyGroupCards')}</span>
            {isRTL ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
          </button>

          <button
            type="button"
            onClick={handleRegisterAnother}
            className="w-full py-2.5 px-4 rounded-2xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white font-medium text-xs transition-all flex items-center justify-center gap-2 cursor-pointer border border-white/10"
          >
            <PlusCircle className="w-4 h-4" />
            <span>{t('registerAnother')}</span>
          </button>
        </div>
      </div>
    </Modal>
  );
};
