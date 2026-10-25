import React, { useRef, useState } from 'react';
import { Camera, Upload, Trash2, Image as ImageIcon, Sparkles, AlertCircle } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext.jsx';
import { MAX_PHOTO_SIZE_BYTES, ALLOWED_IMAGE_TYPES } from '../../utils/constants.js';

export const PhotoUploader = ({
  photoPreview,
  onPhotoSelected,
  onPhotoCleared,
  error,
  touched,
}) => {
  const { t } = useLanguage();
  const fileInputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [localError, setLocalError] = useState('');

  const handleFile = (file) => {
    setLocalError('');
    if (!file) return;

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setLocalError(t('valPhotoType'));
      return;
    }

    if (file.size > MAX_PHOTO_SIZE_BYTES) {
      setLocalError(t('valPhotoSize'));
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    onPhotoSelected(file, previewUrl);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const displayError = localError || (touched && error);

  return (
    <div className="w-full flex flex-col gap-2">
      {/* Label and Clear Explanation Requirement */}
      <div className="flex flex-col gap-1">
        <label className="text-xs sm:text-sm font-semibold text-slate-200 flex items-center gap-1.5">
          <Camera className="w-4 h-4 text-purple-400" />
          <span>{t('photoLabel')}</span>
          <span className="text-pink-400">*</span>
        </label>
        
        {/* Prominent explanation box as requested in requirements */}
        <div className="p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-start gap-2.5">
          <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <p className="text-xs text-indigo-200/90 leading-relaxed">
            {t('photoNotice')}
          </p>
        </div>
      </div>

      {/* Upload Zone & Preview */}
      <div className="mt-1">
        {photoPreview ? (
          <div className="relative group w-full max-w-sm mx-auto sm:mx-0 p-2 rounded-3xl glass-card border-2 border-purple-500/30 overflow-hidden flex items-center gap-4">
            <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-2xl overflow-hidden shrink-0 border border-white/20 bg-slate-900 shadow-inner">
              <img
                src={photoPreview}
                alt="Commemorative Card Preview"
                className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
              />
            </div>
            
            <div className="flex flex-col gap-2 flex-grow pr-2 rtl:pr-0 rtl:pl-2">
              <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1">
                <span>✓</span>
                <span>{t('photoLabel')}</span>
              </span>
              <p className="text-xs text-slate-300 font-normal">
                {t('photoRequirements')}
              </p>
              
              <div className="flex items-center gap-2 mt-1">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-1.5 rounded-xl text-xs font-medium bg-white/10 text-white hover:bg-white/20 transition-all cursor-pointer border border-white/10"
                >
                  {t('photoChange')}
                </button>
                <button
                  type="button"
                  onClick={onPhotoCleared}
                  className="p-1.5 rounded-xl text-xs font-medium text-rose-400 hover:bg-rose-500/10 transition-all cursor-pointer"
                  title="Remove photo"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div
            onClick={() => fileInputRef.current?.click()}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`w-full border-2 border-dashed rounded-3xl p-6 sm:p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300 ${
              isDragging
                ? 'border-purple-400 bg-purple-500/15 scale-[1.01]'
                : displayError
                ? 'border-rose-400/60 bg-rose-500/5 hover:bg-rose-500/10'
                : 'border-white/15 bg-white/[0.03] hover:border-purple-400/50 hover:bg-white/[0.06]'
            }`}
          >
            <div className="w-14 h-14 rounded-2xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400 mb-3 shadow-lg shadow-purple-500/10 group-hover:scale-110 transition-transform">
              <Upload className="w-6 h-6 animate-bounce" />
            </div>
            
            <p className="text-sm font-semibold text-white mb-1">
              {t('photoDragText')}
            </p>
            <p className="text-xs text-slate-400">
              {t('photoRequirements')}
            </p>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept={ALLOWED_IMAGE_TYPES.join(',')}
          className="hidden"
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              handleFile(e.target.files[0]);
            }
          }}
        />
      </div>

      {displayError && (
        <p className="text-xs text-rose-400 font-medium flex items-center gap-1.5 animate-fade-in mt-1">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{displayError}</span>
        </p>
      )}
    </div>
  );
};
