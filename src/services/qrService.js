import QRCode from 'qrcode';

export const getStudentCardUrl = (studentId) => {
  const envUrl = import.meta.env.VITE_APP_BASE_URL;
  const baseUrl = envUrl && !envUrl.includes('your-production-domain')
    ? envUrl.replace(/\/+$/, '')
    : window.location.origin;

  return `${baseUrl}/cards/${studentId}`;
};

export const renderQrToCanvas = async (canvas, url, emoji = '🎓', size = 800) => {
  if (!canvas) return;

  canvas.width = size;
  canvas.height = size;

  await QRCode.toCanvas(canvas, url, {
    errorCorrectionLevel: 'H',
    margin: 3,
    width: size,
    color: {
      dark: '#0f172a',
      light: '#ffffff',
    },
  });

  const ctx = canvas.getContext('2d');
  const centerX = size / 2;
  const centerY = size / 2;
  const badgeRadius = size * 0.11;

  ctx.save();
  ctx.beginPath();
  ctx.arc(centerX, centerY, badgeRadius, 0, 2 * Math.PI);
  ctx.fillStyle = '#ffffff';
  ctx.shadowColor = 'rgba(0, 0, 0, 0.25)';
  ctx.shadowBlur = size * 0.015;
  ctx.fill();

  ctx.lineWidth = Math.max(3, size * 0.006);
  ctx.strokeStyle = '#e2e8f0';
  ctx.stroke();
  ctx.restore();

  const fontSize = Math.floor(badgeRadius * 1.25);
  ctx.save();
  ctx.font = `${fontSize}px "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(emoji || '🎓', centerX, centerY + (fontSize * 0.04));
  ctx.restore();
};

export const generateQrDataUrl = async (studentId, emoji = '🎓', size = 1200) => {
  const url = getStudentCardUrl(studentId);
  const tempCanvas = document.createElement('canvas');
  await renderQrToCanvas(tempCanvas, url, emoji, size);
  return tempCanvas.toDataURL('image/png');
};

export const downloadQrCode = async (studentId, studentName = 'Student', emoji = '🎓', size = 1200) => {
  try {
    const dataUrl = await generateQrDataUrl(studentId, emoji, size);
    const link = document.createElement('a');
    const safeName = (studentName || 'Student').replace(/[^a-zA-Z0-9_-]/g, '_');
    link.download = `${safeName}_Commemorative_QR_${size}px.png`;
    link.href = dataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    return true;
  } catch (error) {
    console.error('Failed to download QR code:', error);
    throw error;
  }
};
