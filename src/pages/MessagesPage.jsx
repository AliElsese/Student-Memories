import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext.jsx';
import { 
  getStudentById, 
  isStudentVerifiedInBrowser, 
  clearStudentVerificationInBrowser 
} from '../services/studentService.js';
import { getMessagesForStudent } from '../services/messageService.js';
import { MessageCard } from '../components/messages/MessageCard.jsx';
import { PinVerificationModal } from '../components/messages/PinVerificationModal.jsx';
import { EmptyState } from '../components/common/EmptyState.jsx';
import { LoadingSpinner } from '../components/common/LoadingSpinner.jsx';
import { 
  Mail, 
  Lock, 
  Sparkles, 
  ArrowLeft, 
  ArrowRight, 
  ShieldCheck, 
  Share2, 
  AlertCircle,
  Inbox
} from 'lucide-react';

export const MessagesPage = () => {
  const { studentId } = useParams();
  const navigate = useNavigate();
  const { t, isRTL } = useLanguage();

  const [student, setStudent] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Verification state
  const [isVerified, setIsVerified] = useState(() => isStudentVerifiedInBrowser(studentId));
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [verifiedPin, setVerifiedPin] = useState('');

  // 1. Fetch student info
  useEffect(() => {
    const fetchStudent = async () => {
      try {
        setLoading(true);
        setError(null);

        const studentData = await getStudentById(studentId);
        if (!studentData) {
          setError(t('groupNotFound'));
          setLoading(false);
          return;
        }
        setStudent(studentData);

        // Check verification in browser
        const verified = isStudentVerifiedInBrowser(studentId);
        setIsVerified(verified);

        if (!verified) {
          setIsPinModalOpen(true);
          setLoading(false);
        } else {
          // If already verified, fetch messages
          await loadMessages(studentId);
        }
      } catch (err) {
        console.error('Error fetching messages inbox:', err);
        setError(err.message || 'Could not load messages');
        setLoading(false);
      }
    };

    if (studentId) {
      fetchStudent();
    }
  }, [studentId, t]);

  const loadMessages = async (id, pin = '') => {
    try {
      setLoading(true);
      const data = await getMessagesForStudent(id, pin);
      setMessages(data || []);
    } catch (err) {
      console.error('Error loading messages list:', err);
      setError(err.message || 'Failed to load secret messages');
    } finally {
      setLoading(false);
    }
  };

  const handleVerified = async (pin) => {
    setIsVerified(true);
    setVerifiedPin(pin);
    setIsPinModalOpen(false);
    await loadMessages(studentId, pin);
  };

  const handleLockInbox = () => {
    clearStudentVerificationInBrowser(studentId);
    setIsVerified(false);
    setMessages([]);
    setIsPinModalOpen(true);
  };

  if (loading && !student) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20">
        <LoadingSpinner label={t('loading')} size="large" />
      </div>
    );
  }

  if (error || !student) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <EmptyState
          icon={AlertCircle}
          title={t('error')}
          description={error || t('groupNotFound')}
          actionButton={
            <Link
              to="/register"
              className="py-3 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm transition-all inline-flex items-center gap-2"
            >
              <span>{t('backToRegister')}</span>
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      {/* Top Navigation & Controls */}
      <div className="flex items-center justify-between gap-4 mb-8">
        <Link
          to={`/cards/${studentId}`}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl glass-card text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/10 transition-all border border-white/10"
        >
          {isRTL ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4 text-purple-400" />}
          <span>{t('backToCardsBtn')}</span>
        </Link>

        {isVerified && (
          <button
            type="button"
            onClick={handleLockInbox}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 hover:text-rose-200 text-xs font-semibold border border-rose-500/20 transition-all cursor-pointer"
            title="Lock session and require PIN on next visit"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>{t('lockSessionBtn')}</span>
          </button>
        )}
      </div>

      {/* Recipient Profile & Inbox Header */}
      <div className="glass-card-owner rounded-3xl p-6 sm:p-8 mb-10 flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left sm:rtl:text-right">
        {/* Recipient Photo with Personality Emoji */}
        <div className="relative shrink-0">
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden border-2 border-purple-400 shadow-xl bg-slate-900">
            <img
              src={student.photo_url}
              alt={student.full_name}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="absolute -bottom-2 -right-2 rtl:-right-auto rtl:-left-2 w-9 h-9 rounded-xl bg-slate-900/90 border border-white/20 shadow flex items-center justify-center text-lg">
            {student.personality_emoji || '🎓'}
          </div>
        </div>

        {/* Info */}
        <div className="flex flex-col flex-grow">
          <div className="inline-flex items-center justify-center sm:justify-start gap-1.5 text-xs text-purple-300 font-semibold mb-1">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>{t('inboxTitle')}</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            {student.full_name}
          </h1>

          {student.nickname && (
            <p className="text-sm text-purple-200 italic mt-0.5">
              "{student.nickname}"
            </p>
          )}

          <p className="text-xs text-slate-300 mt-2 max-w-lg leading-relaxed">
            {t('inboxSubtitle')}
          </p>
        </div>

        {/* Message Counter Pill */}
        <div className="p-4 rounded-2xl glass-card border border-white/15 flex flex-col items-center justify-center shrink-0 min-w-[120px]">
          <span className="text-3xl font-extrabold bg-gradient-to-r from-amber-400 to-pink-400 bg-clip-text text-transparent">
            {messages.length}
          </span>
          <span className="text-xs text-slate-300 font-medium mt-1">
            {t('totalNotesReceived')}
          </span>
        </div>
      </div>

      {/* Messages List Area */}
      {!isVerified ? (
        <div className="text-center py-12">
          <EmptyState
            icon={Lock}
            title={t('pinLockedTitle')}
            description={t('pinLockedSubtitle')}
            actionButton={
              <button
                type="button"
                onClick={() => setIsPinModalOpen(true)}
                className="py-3 px-6 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold text-sm shadow-lg hover:scale-105 transition-all cursor-pointer"
              >
                {t('unlockInboxBtn')}
              </button>
            }
          />
        </div>
      ) : loading ? (
        <div className="py-12">
          <LoadingSpinner label={t('loading')} />
        </div>
      ) : messages.length === 0 ? (
        <EmptyState
          icon={Inbox}
          title={t('noMessagesTitle')}
          description={t('noMessagesDesc')}
          actionButton={
            <Link
              to={`/cards/${studentId}`}
              className="py-3 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm transition-all inline-flex items-center gap-2"
            >
              <span>{t('backToCardsBtn')}</span>
            </Link>
          }
        />
      ) : (
        <div className="flex flex-col gap-4">
          {messages.map((message, idx) => (
            <MessageCard key={message.id || idx} message={message} index={idx} />
          ))}
        </div>
      )}

      {/* PIN Verification Modal */}
      <PinVerificationModal
        isOpen={isPinModalOpen}
        onClose={() => {
          setIsPinModalOpen(false);
          // If modal closed without verification, navigate back to group cards
          if (!isVerified) {
            navigate(`/cards/${studentId}`);
          }
        }}
        studentId={studentId}
        studentName={student?.full_name}
        onVerified={handleVerified}
      />
    </div>
  );
};
