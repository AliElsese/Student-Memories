import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext.jsx';
import { 
  getStudentById, 
  getStudentsByGroupId, 
  isStudentVerifiedInBrowser 
} from '../services/studentService.js';
import { getGroupById } from '../services/groupService.js';
import { StudentCard } from '../components/student/StudentCard.jsx';
import { StudentCardSkeleton } from '../components/student/StudentCardSkeleton.jsx';
import { MessageModal } from '../components/messages/MessageModal.jsx';
import { PinVerificationModal } from '../components/messages/PinVerificationModal.jsx';
import { EmptyState } from '../components/common/EmptyState.jsx';
import { 
  GraduationCap, 
  Sparkles, 
  Users, 
  Calendar, 
  AlertCircle, 
  ArrowLeft, 
  ArrowRight,
  UserCheck
} from 'lucide-react';

export const GroupCardsPage = () => {
  const { studentId } = useParams();
  const navigate = useNavigate();
  const { t, isRTL, language } = useLanguage();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [scannedStudent, setScannedStudent] = useState(null);
  const [group, setGroup] = useState(null);
  const [students, setStudents] = useState([]);

  // Modals state
  const [selectedRecipient, setSelectedRecipient] = useState(null);
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);

  useEffect(() => {
    const loadGroupData = async () => {
      try {
        setLoading(true);
        setError(null);

        // 1. Retrieve the student identified by studentId from URL
        const student = await getStudentById(studentId);
        if (!student) {
          setError(t('groupNotFound'));
          setLoading(false);
          return;
        }
        setScannedStudent(student);

        // 2. Determine which group that student belongs to
        const groupData = await getGroupById(student.group_id);
        setGroup(groupData);

        // 3. Load students belonging to this group only
        const groupStudents = await getStudentsByGroupId(student.group_id);
        
        // Put the scanned student first in the list for immediate prominence
        const sortedStudents = [...groupStudents].sort((a, b) => {
          if (a.id === studentId) return -1;
          if (b.id === studentId) return 1;
          return 0;
        });

        setStudents(sortedStudents);
      } catch (err) {
        console.error('Error loading group cards:', err);
        setError(err.message || t('groupNotFound'));
      } finally {
        setLoading(false);
      }
    };

    if (studentId) {
      loadGroupData();
    }
  }, [studentId, t]);

  // Handle "Show Messages" click on scanned student card
  const handleShowMessages = (student) => {
    if (isStudentVerifiedInBrowser(student.id)) {
      navigate(`/messages/${student.id}`);
    } else {
      setIsPinModalOpen(true);
    }
  };

  // Handle "Send Message" click on classmate card
  const handleSendMessage = (classmate) => {
    setSelectedRecipient(classmate);
    setIsMessageModalOpen(true);
  };

  const handlePinVerified = () => {
    setIsPinModalOpen(false);
    navigate(`/messages/${studentId}`);
  };

  const formatDateRange = (start, end) => {
    if (!start || !end) return '';
    try {
      const locale = language === 'ar' ? 'ar-EG' : 'en-US';
      const s = new Intl.DateTimeFormat(locale, { month: 'short', year: 'numeric' }).format(new Date(start));
      const e = new Intl.DateTimeFormat(locale, { month: 'short', year: 'numeric' }).format(new Date(end));
      return `${s} — ${e}`;
    } catch {
      return `${start} - ${end}`;
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="flex flex-col items-center mb-10 animate-pulse">
          <div className="h-8 w-64 bg-slate-800 rounded-xl mb-3" />
          <div className="h-4 w-96 bg-slate-800/60 rounded-lg" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <StudentCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (error || !scannedStudent) {
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
              {isRTL ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      {/* Group Header Banner */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-card border border-purple-500/30 text-xs font-semibold text-purple-300 mb-3 shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>{group?.name || t('groupCardsTitle')}</span>
        </div>

        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-purple-200 bg-clip-text text-transparent">
          {t('groupCardsTitle')}
        </h1>

        <p className="mt-2 text-sm sm:text-base text-slate-300 max-w-2xl mx-auto">
          {t('groupCardsSubtitle')}
        </p>

        {/* Group Stats Chips */}
        <div className="flex flex-wrap items-center justify-center gap-4 mt-5 text-xs text-slate-300">
          <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full glass-card border border-white/10">
            <Users className="w-3.5 h-3.5 text-purple-400" />
            <span>
              {students.length} {t('totalStudents')}
            </span>
          </div>

          {scannedStudent.course_start_date && scannedStudent.course_end_date && (
            <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full glass-card border border-white/10">
              <Calendar className="w-3.5 h-3.5 text-pink-400" />
              <span>
                {formatDateRange(scannedStudent.course_start_date, scannedStudent.course_end_date)}
              </span>
            </div>
          )}

          <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full glass-card border border-white/10">
            <UserCheck className="w-3.5 h-3.5 text-amber-400" />
            <span>
              {t('scannedOwnerBadge')}: {scannedStudent.full_name}
            </span>
          </div>
        </div>
      </div>

      {/* Student Cards Grid */}
      {students.length === 0 ? (
        <EmptyState
          icon={Users}
          title={t('noStudentsInGroup')}
          description={t('beFirstToRegister')}
          actionButton={
            <Link
              to="/register"
              className="py-3 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm transition-all inline-flex items-center gap-2"
            >
              <span>{t('registerNav')}</span>
            </Link>
          }
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {students.map((student) => {
            const isScannedOwner = student.id === studentId;
            return (
              <StudentCard
                key={student.id}
                student={student}
                isScannedOwner={isScannedOwner}
                onShowMessages={handleShowMessages}
                onSendMessage={handleSendMessage}
              />
            );
          })}
        </div>
      )}

      {/* Anonymous Message Send Modal */}
      <MessageModal
        isOpen={isMessageModalOpen}
        onClose={() => setIsMessageModalOpen(false)}
        recipient={selectedRecipient}
      />

      {/* Secret PIN Verification Modal for Owner */}
      <PinVerificationModal
        isOpen={isPinModalOpen}
        onClose={() => setIsPinModalOpen(false)}
        studentId={studentId}
        studentName={scannedStudent?.full_name}
        onVerified={handlePinVerified}
      />
    </div>
  );
};
