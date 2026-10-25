import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext.jsx';
import { isAdminAuthenticated, logoutAdmin } from '../services/adminAuthService.js';
import { getAllStudentsAdmin, deleteStudentAdmin } from '../services/studentService.js';
import { downloadQrCode, getStudentCardUrl } from '../services/qrService.js';
import { QrCodeViewer } from '../components/qr/QrCodeViewer.jsx';
import { Modal } from '../components/common/Modal.jsx';
import { LoadingSpinner } from '../components/common/LoadingSpinner.jsx';
import { EmptyState } from '../components/common/EmptyState.jsx';
import { Badge } from '../components/common/Badge.jsx';
import { 
  Users, 
  Layers, 
  Mail, 
  Search, 
  Download, 
  QrCode, 
  ExternalLink, 
  Trash2, 
  LogOut, 
  ShieldCheck, 
  Sparkles, 
  Eye, 
  EyeOff, 
  KeyRound,
  Filter,
  Calendar
} from 'lucide-react';

export const AdminDashboardPage = () => {
  const { t, isRTL, language } = useLanguage();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('ALL');
  const [showPins, setShowPins] = useState({});
  const [selectedQrStudent, setSelectedQrStudent] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  // Protect route: redirect to login if not authenticated
  useEffect(() => {
    if (!isAdminAuthenticated()) {
      navigate('/admin/login', { replace: true });
      return;
    }

    loadStudents();
  }, [navigate]);

  const loadStudents = async () => {
    try {
      setLoading(true);
      const data = await getAllStudentsAdmin();
      setStudents(data || []);
    } catch (err) {
      console.error('Failed to load students for admin:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logoutAdmin();
    navigate('/admin/login', { replace: true });
  };

  const togglePinVisibility = (studentId) => {
    setShowPins((prev) => ({
      ...prev,
      [studentId]: !prev[studentId],
    }));
  };

  const handleDeleteStudent = async (studentId, studentName) => {
    if (!window.confirm(`${t('deleteConfirm')} (${studentName})`)) {
      return;
    }

    try {
      setDeletingId(studentId);
      await deleteStudentAdmin(studentId);
      setStudents((prev) => prev.filter((s) => s.id !== studentId));
    } catch (err) {
      console.error('Failed to delete student:', err);
      alert('Could not delete student: ' + err.message);
    } finally {
      setDeletingId(null);
    }
  };

  // Extract unique groups for filtering
  const uniqueGroups = Array.from(
    new Set(students.map((s) => s.group_code).filter(Boolean))
  );

  // Filter and search logic
  const filteredStudents = students.filter((s) => {
    const matchesSearch =
      (s.full_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.nickname || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.group_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.group_code || '').toLowerCase().includes(searchQuery.toLowerCase());

    const matchesGroup =
      selectedGroup === 'ALL' || s.group_code === selectedGroup;

    return matchesSearch && matchesGroup;
  });

  // Calculate statistics
  const totalStudents = students.length;
  const totalBatches = uniqueGroups.length;
  const totalMessages = students.reduce(
    (sum, s) => sum + (s.messages_count || 0),
    0
  );

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    try {
      const locale = language === 'ar' ? 'ar-EG' : 'en-US';
      return new Intl.DateTimeFormat(locale, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }).format(new Date(dateStr));
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Top Header & Admin Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 pb-6 border-b border-white/10">
        <div>
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-purple-500/15 border border-purple-500/30 text-xs font-semibold text-purple-300 mb-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Super Admin: ali.elsese104@gmail.com</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            {t('adminDashboardTitle')}
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-300">
            {t('adminDashboardSubtitle')}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/register"
            className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-slate-200 hover:text-white font-medium text-xs border border-white/10 transition-all flex items-center gap-2"
          >
            <span>{t('registerNav')}</span>
          </Link>

          <button
            type="button"
            onClick={handleLogout}
            className="px-4 py-2.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 hover:text-rose-200 font-medium text-xs border border-rose-500/30 transition-all flex items-center gap-2 cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>{t('logoutAdmin')}</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
        <div className="glass-card rounded-3xl p-5 flex items-center gap-4 border border-white/10">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <span className="text-2xl sm:text-3xl font-extrabold text-white">
              {totalStudents}
            </span>
            <p className="text-xs text-slate-400 font-medium mt-0.5">
              {t('statTotalStudents')}
            </p>
          </div>
        </div>

        <div className="glass-card rounded-3xl p-5 flex items-center gap-4 border border-white/10">
          <div className="w-12 h-12 rounded-2xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400 shrink-0">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <span className="text-2xl sm:text-3xl font-extrabold text-white">
              {totalBatches}
            </span>
            <p className="text-xs text-slate-400 font-medium mt-0.5">
              {t('statTotalBatches')}
            </p>
          </div>
        </div>

        <div className="glass-card rounded-3xl p-5 flex items-center gap-4 border border-white/10">
          <div className="w-12 h-12 rounded-2xl bg-pink-500/20 border border-pink-500/30 flex items-center justify-center text-pink-400 shrink-0">
            <Mail className="w-6 h-6" />
          </div>
          <div>
            <span className="text-2xl sm:text-3xl font-extrabold text-white">
              {totalMessages}
            </span>
            <p className="text-xs text-slate-400 font-medium mt-0.5">
              {t('statTotalMessages')}
            </p>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="glass-card rounded-2xl p-4 mb-6 flex flex-col sm:flex-row items-center justify-between gap-4 border border-white/10">
        <div className="relative w-full sm:max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 rtl:left-auto rtl:right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder={t('searchPlaceholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 rtl:pl-4 rtl:pr-10 pr-4 py-2.5 rounded-xl glass-input text-xs sm:text-sm text-white placeholder-slate-400"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl glass-input text-xs text-slate-300 w-full sm:w-auto">
            <Filter className="w-3.5 h-3.5 text-purple-400 shrink-0" />
            <select
              value={selectedGroup}
              onChange={(e) => setSelectedGroup(e.target.value)}
              className="bg-transparent border-none outline-none text-white cursor-pointer w-full text-xs font-semibold"
            >
              <option value="ALL" className="bg-slate-900 text-white">
                {t('filterAllGroups')} ({totalStudents})
              </option>
              {uniqueGroups.map((grp) => (
                <option key={grp} value={grp} className="bg-slate-900 text-white">
                  {grp}
                </option>
              ))}
            </select>
          </div>

          <span className="text-xs text-slate-400 shrink-0 hidden md:block">
            {t('totalStudentsListed')}: <strong className="text-white">{filteredStudents.length}</strong>
          </span>
        </div>
      </div>

      {/* Main Student Data Table */}
      {loading ? (
        <div className="py-20">
          <LoadingSpinner label={t('loading')} size="large" />
        </div>
      ) : filteredStudents.length === 0 ? (
        <EmptyState
          icon={Users}
          title={t('noStudentsFound')}
          description="Try modifying your search query or batch filter."
        />
      ) : (
        <div className="glass-card rounded-3xl border border-white/10 overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left rtl:text-right text-xs sm:text-sm">
              <thead className="bg-white/5 border-b border-white/10 text-slate-300 font-semibold uppercase text-[11px] tracking-wider">
                <tr>
                  <th className="p-4 pl-6 rtl:pl-4 rtl:pr-6">{t('studentColumn')}</th>
                  <th className="p-4">{t('groupColumn')}</th>
                  <th className="p-4">{t('datesColumn')}</th>
                  <th className="p-4">{t('pinColumn')}</th>
                  <th className="p-4 text-center">{t('messagesColumn')}</th>
                  <th className="p-4 text-center">{t('qrColumn')}</th>
                  <th className="p-4 pr-6 rtl:pr-4 rtl:pl-6 text-center">{t('actionsColumn')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredStudents.map((student) => {
                  const isPinRevealed = Boolean(showPins[student.id]);
                  return (
                    <tr
                      key={student.id}
                      className="hover:bg-white/[0.04] transition-colors"
                    >
                      {/* Student Identity */}
                      <td className="p-4 pl-6 rtl:pl-4 rtl:pr-6">
                        <div className="flex items-center gap-3">
                          <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-slate-900 border border-white/15 shrink-0 shadow-md">
                            <img
                              src={student.photo_url}
                              alt={student.full_name}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute bottom-0 right-0 w-4 h-4 rounded-tl bg-slate-900/90 text-[10px] flex items-center justify-center">
                              {student.personality_emoji || '🎓'}
                            </div>
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-white truncate text-sm">
                                {student.full_name}
                              </span>
                              <span className="text-sm">
                                {student.personality_emoji || '🎓'}
                              </span>
                            </div>
                            {student.nickname ? (
                              <p className="text-xs text-purple-300 italic truncate">
                                "{student.nickname}"
                              </p>
                            ) : (
                              <span className="text-[11px] text-slate-400">
                                {formatDate(student.created_at)}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Group & Code */}
                      <td className="p-4">
                        <div className="flex flex-col gap-1">
                          <span className="font-semibold text-slate-200 text-xs">
                            {student.group_name}
                          </span>
                          <span className="inline-flex w-fit px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-300 font-mono text-[11px] font-bold border border-purple-500/30">
                            {student.group_code}
                          </span>
                        </div>
                      </td>

                      {/* Course Dates */}
                      <td className="p-4">
                        <div className="flex flex-col text-xs text-slate-300 gap-0.5">
                          <span className="text-slate-400 text-[11px]">
                            {student.course_start_date}
                          </span>
                          <span className="font-medium text-slate-200">
                            {student.course_end_date}
                          </span>
                        </div>
                      </td>

                      {/* 6-Digit PIN (Super Admin Inspection) */}
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-1 rounded-lg bg-slate-900/80 font-mono font-bold text-amber-300 border border-white/10 text-xs tracking-wider">
                            {isPinRevealed ? student.pin_code : '••••••'}
                          </span>
                          <button
                            type="button"
                            onClick={() => togglePinVisibility(student.id)}
                            className="p-1 rounded-md text-slate-400 hover:text-white transition-colors cursor-pointer"
                            title={isPinRevealed ? 'Hide PIN' : 'Reveal PIN'}
                          >
                            {isPinRevealed ? (
                              <EyeOff className="w-3.5 h-3.5" />
                            ) : (
                              <Eye className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </td>

                      {/* Secret Messages Count */}
                      <td className="p-4 text-center">
                        <Link
                          to={`/messages/${student.id}`}
                          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-pink-500/15 border border-pink-500/30 text-pink-300 text-xs font-bold hover:bg-pink-500/25 transition-colors"
                          title="Open Student Inbox"
                        >
                          <Mail className="w-3 h-3" />
                          <span>{student.messages_count}</span>
                        </Link>
                      </td>

                      {/* Printable QR Code Preview & Instant Download */}
                      <td className="p-4 text-center">
                        <div className="inline-flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setSelectedQrStudent(student)}
                            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 hover:text-white transition-colors cursor-pointer border border-white/10"
                            title={t('previewQr')}
                          >
                            <QrCode className="w-4 h-4 text-purple-400" />
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              downloadQrCode(
                                student.id,
                                student.full_name,
                                student.personality_emoji,
                                1200
                              )
                            }
                            className="p-2 rounded-xl bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-200 hover:text-white transition-colors cursor-pointer border border-indigo-500/30"
                            title={t('downloadQr')}
                          >
                            <Download className="w-4 h-4" />
                          </button>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="p-4 pr-6 rtl:pr-4 rtl:pl-6 text-center">
                        <div className="inline-flex items-center gap-2">
                          <Link
                            to={`/cards/${student.id}`}
                            className="p-2 rounded-xl bg-white/5 hover:bg-white/15 text-slate-300 hover:text-white transition-colors"
                            title={t('openCards')}
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Link>

                          <button
                            type="button"
                            onClick={() =>
                              handleDeleteStudent(student.id, student.full_name)
                            }
                            disabled={deletingId === student.id}
                            className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/25 text-rose-300 hover:text-rose-200 transition-colors cursor-pointer"
                            title="Delete Student Record"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* QR Code Modal for Selected Student */}
      {selectedQrStudent && (
        <Modal
          isOpen={Boolean(selectedQrStudent)}
          onClose={() => setSelectedQrStudent(null)}
          title={selectedQrStudent.full_name}
          subtitle={`Batch: ${selectedQrStudent.group_name} (${selectedQrStudent.group_code})`}
          maxWidth="max-w-md"
        >
          <div className="flex flex-col items-center gap-6 py-2">
            <QrCodeViewer
              studentId={selectedQrStudent.id}
              studentName={selectedQrStudent.full_name}
              personalityEmoji={selectedQrStudent.personality_emoji}
              size={360}
              exportSize={1200}
            />

            <div className="w-full flex items-center justify-between text-xs text-slate-300 p-3 rounded-2xl glass-card">
              <span>Student PIN:</span>
              <span className="font-mono font-bold text-amber-300 text-sm">
                {selectedQrStudent.pin_code}
              </span>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
