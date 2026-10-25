import QRCode from 'qrcode';

/**
 * Builds the canonical QR destination URL for a student card
 */
export const getStudentCardUrl = (studentId) => {
  const envUrl = import.meta.env.VITE_APP_BASE_URL;
  const baseUrl = envUrl && !envUrl.includes('your-production-domain')
    ? envUrl.replace(/\/+$/, '')
    : window.location.origin;

  return `${baseUrl}/cards/${studentId}`;
};

/**
 * Draws the QR code and overlays the personality emoji onto a canvas
 */
export const renderQrToCanvas = async (canvas, url, emoji = '🎓', size = 800) => {
  if (!canvas) return;

  // Set high-resolution canvas dimensions
  canvas.width = size;
  canvas.height = size;

  // 1. Render QR with High ('H') error correction level (recovers up to 30% data loss)
  await QRCode.toCanvas(canvas, url, {
    errorCorrectionLevel: 'H',
    margin: 3,
    width: size,
    color: {
      dark: '#0f172a', // Deep slate for crisp scanning
      light: '#ffffff', // Pure white quiet zone & background
    },
  });

  const ctx = canvas.getContext('2d');
  const centerX = size / 2;
  const centerY = size / 2;
  // Keep the overlay badge at ~22% of total QR size to strictly maintain scannability
  const badgeRadius = size * 0.11;

  // 2. Draw contrast circular white badge in center
  ctx.save();
  ctx.beginPath();
  ctx.arc(centerX, centerY, badgeRadius, 0, 2 * Math.PI);
  ctx.fillStyle = '#ffffff';
  ctx.shadowColor = 'rgba(0, 0, 0, 0.25)';
  ctx.shadowBlur = size * 0.015;
  ctx.fill();

  // Subtle border around the center badge
  ctx.lineWidth = Math.max(3, size * 0.006);
  ctx.strokeStyle = '#e2e8f0';
  ctx.stroke();
  ctx.restore();

  // 3. Draw the student's personality emoji centered in the badge
  const fontSize = Math.floor(badgeRadius * 1.25);
  ctx.save();
  ctx.font = `${fontSize}px "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  // Slight vertical offset for emoji typography alignment
  ctx.fillText(emoji || '🎓', centerX, centerY + (fontSize * 0.04));
  ctx.restore();
};

/**
 * Generates a high-res Data URL string of the QR Code with Emoji overlay
 */
export const generateQrDataUrl = async (studentId, emoji = '🎓', size = 1200) => {
  const url = getStudentCardUrl(studentId);
  const tempCanvas = document.createElement('canvas');
  await renderQrToCanvas(tempCanvas, url, emoji, size);
  return tempCanvas.toDataURL('image/png');
};

/**
 * Initiates an instant download of the high-res QR code suitable for print
 */
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
