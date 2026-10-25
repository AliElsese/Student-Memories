import React, { useEffect, useRef, useState } from 'react';
import { renderQrToCanvas, downloadQrCode, getStudentCardUrl } from '../../services/qrService.js';
import { useLanguage } from '../../contexts/LanguageContext.jsx';
import { Download, ExternalLink, Check, Copy, Sparkles, QrCode } from 'lucide-react';

export const QrCodeViewer = ({
  studentId,
  studentName = 'Student',
  personalityEmoji = '🎓',
  showDownloadButton = true,
  size = 400,
  exportSize = 1200,
}) => {
  const { t } = useLanguage();
  const canvasRef = useRef(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const cardUrl = getStudentCardUrl(studentId);

  useEffect(() => {
    if (canvasRef.current && studentId) {
      renderQrToCanvas(canvasRef.current, cardUrl, personalityEmoji, size);
    }
  }, [studentId, personalityEmoji, cardUrl, size]);

  const handleDownload = async () => {
    try {
      setIsDownloading(true);
      await downloadQrCode(studentId, studentName, personalityEmoji, exportSize);
    } catch (err) {
      console.error('Download error:', err);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(cardUrl);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2500);
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

  return (
    <div className="flex flex-col items-center gap-5 w-full">
      {/* QR Canvas Container with Frosted Glow Border */}
      <div className="relative p-4 rounded-3xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl group flex flex-col items-center">
        {/* Subtle decorative corner markers */}
        <div className="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-purple-400 rounded-tl-sm pointer-events-none" />
        <div className="absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 border-purple-400 rounded-tr-sm pointer-events-none" />
        <div className="absolute bottom-2 left-2 w-3 h-3 border-b-2 border-l-2 border-purple-400 rounded-bl-sm pointer-events-none" />
        <div className="absolute bottom-2 right-2 w-3 h-3 border-b-2 border-r-2 border-purple-400 rounded-br-sm pointer-events-none" />

        <div className="overflow-hidden rounded-2xl bg-white p-2 shadow-inner">
          <canvas
            ref={canvasRef}
            className="w-56 h-56 sm:w-64 sm:h-64 object-contain rounded-xl block"
          />
        </div>

        {/* Small floating badge */}
        <div className="mt-3 flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/80 border border-white/10 text-[11px] text-slate-300">
          <Sparkles className="w-3 h-3 text-amber-400" />
          <span>High-Res Scannable QR Code</span>
        </div>
      </div>

      {/* URL Transparency & Copy Box */}
      <div className="w-full max-w-sm flex items-center justify-between gap-2 p-2.5 rounded-2xl glass-input text-xs">
        <span className="truncate text-slate-300 font-mono select-all">
          {cardUrl}
        </span>
        <button
          type="button"
          onClick={handleCopyUrl}
          className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 transition-colors shrink-0 cursor-pointer"
          title={t('copyLink')}
        >
          {isCopied ? (
            <Check className="w-4 h-4 text-emerald-400" />
          ) : (
            <Copy className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Download Action Button */}
      {showDownloadButton && (
        <button
          type="button"
          onClick={handleDownload}
          disabled={isDownloading}
          className="w-full max-w-sm py-3.5 px-6 rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-500 text-white font-semibold text-sm shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 hover:scale-[1.02] active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
        >
          <Download className="w-4 h-4" />
          <span>{isDownloading ? t('downloading') : t('downloadQrPng')}</span>
        </button>
      )}
    </div>
  );
};
