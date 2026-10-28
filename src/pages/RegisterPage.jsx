import React, { useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useLanguage } from '../contexts/LanguageContext.jsx';
import { getGroupByCode, ALLOWED_GROUP_CODES } from '../services/groupService.js';
import { uploadStudentPhoto, registerStudent } from '../services/studentService.js';
import { FormInput } from '../components/forms/FormInput.jsx';
import { PhotoUploader } from '../components/forms/PhotoUploader.jsx';
import { EmojiPicker } from '../components/forms/EmojiPicker.jsx';
import { RegistrationSuccessModal } from '../components/student/RegistrationSuccessModal.jsx';
import { 
  GraduationCap, 
  Sparkles, 
  User, 
  Smile, 
  Users, 
  Calendar, 
  Lock, 
  Loader2, 
  AlertCircle 
} from 'lucide-react';

export const RegisterPage = () => {
  const { t } = useLanguage();
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState('');
  const [registeredStudent, setRegisteredStudent] = useState(null);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [submitError, setSubmitError] = useState('');

  // Validation Schema using Yup
  const validationSchema = Yup.object().shape({
    fullName: Yup.string()
      .trim()
      .min(3, t('valNameMin'))
      .required(t('valNameRequired')),
    nickname: Yup.string()
      .trim()
      .required(t('valNicknameRequired')),
    personalityEmoji: Yup.string().required(t('valEmojiRequired')),
    groupCode: Yup.string()
      .trim()
      .required(t('valGroupRequired'))
      .test('check-allowed-group-code', t('valGroupInvalid'), async (value) => {
        if (!value) return false;
        const normalized = value.trim().toUpperCase();
        if (!ALLOWED_GROUP_CODES.includes(normalized)) {
          return false;
        }
        try {
          const group = await getGroupByCode(normalized);
          return Boolean(group);
        } catch {
          return false;
        }
      }),
    courseStartDate: Yup.date().required(t('valStartRequired')),
    courseEndDate: Yup.date()
      .required(t('valEndRequired'))
      .min(Yup.ref('courseStartDate'), t('valEndBeforeStart')),
    pinCode: Yup.string()
      .required(t('valPinRequired'))
      .matches(/^[0-9]{6}$/, t('valPinDigits')),
    pinConfirm: Yup.string()
      .required(t('valPinConfirmRequired'))
      .oneOf([Yup.ref('pinCode')], t('valPinMismatch')),
  });

  const formik = useFormik({
    initialValues: {
      fullName: '',
      nickname: '',
      personalityEmoji: '🎓',
      groupCode: '',
      courseStartDate: '2025-10-01',
      courseEndDate: '2026-06-30',
      pinCode: '',
      pinConfirm: '',
    },
    validationSchema,
    validateOnChange: false,
    validateOnBlur: true,
    onSubmit: async (values, { setSubmitting }) => {
      setSubmitError('');

      // Manual check for photo
      if (!photoFile) {
        setSubmitError(t('valPhotoRequired'));
        setSubmitting(false);
        return;
      }

      try {
        // 1. Verify group again to retrieve its ID
        const group = await getGroupByCode(values.groupCode);
        if (!group) {
          setSubmitError(t('valGroupInvalid'));
          setSubmitting(false);
          return;
        }

        // 2. Upload photo
        const photoUrl = await uploadStudentPhoto(photoFile);

        // 3. Register student record in Supabase
        const createdStudent = await registerStudent({
          groupId: group.id,
          fullName: values.fullName,
          nickname: values.nickname,
          photoUrl: photoUrl,
          personalityEmoji: values.personalityEmoji,
          courseStartDate: values.courseStartDate,
          courseEndDate: values.courseEndDate,
          pinCode: values.pinCode,
        });

        // 4. Set state and open QR modal
        setRegisteredStudent({
          ...createdStudent,
          photoUrl,
        });
        setIsSuccessModalOpen(true);
      } catch (err) {
        console.error('Registration failed:', err);
        setSubmitError(err.message || 'An unexpected error occurred. Please check your data.');
      } finally {
        setSubmitting(false);
      }
    },
  });

  const handlePhotoSelected = (file, previewUrl) => {
    setPhotoFile(file);
    setPhotoPreview(previewUrl);
    setSubmitError('');
  };

  const handlePhotoCleared = () => {
    setPhotoFile(null);
    setPhotoPreview('');
  };

  const handleResetForm = () => {
    formik.resetForm();
    setPhotoFile(null);
    setPhotoPreview('');
    setRegisteredStudent(null);
    setSubmitError('');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      {/* Header Banner */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-card border border-purple-500/30 text-xs font-semibold text-purple-300 mb-4 shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Class Graduation Memories</span>
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-purple-200 bg-clip-text text-transparent">
          {t('regTitle')}
        </h1>
        <p className="mt-3 text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
          {t('regSubtitle')}
        </p>
      </div>

      {/* Main Registration Card */}
      <div className="glass-card rounded-3xl p-6 sm:p-10 border border-white/15 shadow-2xl relative">
        <form onSubmit={formik.handleSubmit} className="flex flex-col gap-8">
          
          {/* Section 1: Commemorative Photo */}
          <div>
            <PhotoUploader
              photoPreview={photoPreview}
              onPhotoSelected={handlePhotoSelected}
              onPhotoCleared={handlePhotoCleared}
              error={!photoFile && formik.submitCount > 0 ? t('valPhotoRequired') : ''}
              touched={formik.submitCount > 0}
            />
          </div>

          <div className="h-px bg-white/10 w-full" />

          {/* Section 2: Student Identity */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormInput
              id="fullName"
              name="fullName"
              label={t('fullNameLabel')}
              placeholder={t('fullNamePlaceholder')}
              icon={User}
              required
              value={formik.values.fullName}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.errors.fullName}
              touched={formik.touched.fullName}
            />

            <FormInput
              id="nickname"
              name="nickname"
              label={t('nicknameLabel')}
              placeholder={t('nicknamePlaceholder')}
              hint={t('nicknameHint')}
              icon={Smile}
              required
              value={formik.values.nickname}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.errors.nickname}
              touched={formik.touched.nickname}
            />
          </div>

          {/* Section 3: Personality Emoji Picker */}
          <div>
            <EmojiPicker
              selectedEmoji={formik.values.personalityEmoji}
              onSelectEmoji={(emoji) => formik.setFieldValue('personalityEmoji', emoji)}
              error={formik.errors.personalityEmoji}
              touched={formik.touched.personalityEmoji}
            />
          </div>

          <div className="h-px bg-white/10 w-full" />

          {/* Section 4: Group & Course Dates */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FormInput
              id="groupCode"
              name="groupCode"
              label={t('groupCodeLabel')}
              placeholder={t('groupCodePlaceholder')}
              hint={t('groupCodeHint')}
              icon={Users}
              required
              value={formik.values.groupCode}
              onChange={(e) => formik.setFieldValue('groupCode', e.target.value.toUpperCase())}
              onBlur={formik.handleBlur}
              error={formik.errors.groupCode}
              touched={formik.touched.groupCode}
            />

            <FormInput
              id="courseStartDate"
              name="courseStartDate"
              label={t('startDateLabel')}
              type="date"
              icon={Calendar}
              required
              value={formik.values.courseStartDate}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.errors.courseStartDate}
              touched={formik.touched.courseStartDate}
            />

            <FormInput
              id="courseEndDate"
              name="courseEndDate"
              label={t('endDateLabel')}
              type="date"
              icon={Calendar}
              required
              value={formik.values.courseEndDate}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.errors.courseEndDate}
              touched={formik.touched.courseEndDate}
            />
          </div>

          <div className="h-px bg-white/10 w-full" />

          {/* Section 5: Secret 6-Digit PIN */}
          <div className="p-5 rounded-2xl bg-purple-500/10 border border-purple-500/20">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormInput
                id="pinCode"
                name="pinCode"
                type="password"
                label={t('pinLabel')}
                placeholder={t('pinPlaceholder')}
                hint={t('pinHint')}
                icon={Lock}
                required
                maxLength={6}
                value={formik.values.pinCode}
                onChange={(e) => formik.setFieldValue('pinCode', e.target.value.replace(/\D/g, '').slice(0, 6))}
                onBlur={formik.handleBlur}
                error={formik.errors.pinCode}
                touched={formik.touched.pinCode}
              />

              <FormInput
                id="pinConfirm"
                name="pinConfirm"
                type="password"
                label={t('pinConfirmLabel')}
                placeholder={t('pinConfirmPlaceholder')}
                icon={Lock}
                required
                maxLength={6}
                value={formik.values.pinConfirm}
                onChange={(e) => formik.setFieldValue('pinConfirm', e.target.value.replace(/\D/g, '').slice(0, 6))}
                onBlur={formik.handleBlur}
                error={formik.errors.pinConfirm}
                touched={formik.touched.pinConfirm}
              />
            </div>
          </div>

          {/* Error Message Notification */}
          {submitError && (
            <div className="p-4 rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-center gap-3 text-rose-300 text-sm">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>{submitError}</span>
            </div>
          )}

          {/* Submit Action Button */}
          <button
            type="submit"
            disabled={formik.isSubmitting}
            className="w-full py-4 px-8 rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-500 text-white font-bold text-base shadow-xl shadow-purple-500/25 hover:shadow-purple-500/40 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {formik.isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>{t('registering')}</span>
              </>
            ) : (
              <>
                <GraduationCap className="w-5 h-5" />
                <span>{t('submitRegistration')}</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* Joyful Graduation Celebration Modal (No QR code shown to student) */}
      <RegistrationSuccessModal
        isOpen={isSuccessModalOpen}
        onClose={() => setIsSuccessModalOpen(false)}
        student={registeredStudent}
        onResetForm={handleResetForm}
      />
    </div>
  );
};
