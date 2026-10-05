import QRCode from 'qrcode';
import jsQR from 'jsqr';

// Detect whether Google Chrome's native BarcodeDetector is available
export const hasNativeBarcodeDetector = (): boolean => {
  return typeof window !== 'undefined' && 'BarcodeDetector' in window;
};

// Generate QR Code as Data URL
export async function generateQRDataURL(
  text: string,
  options?: {
    width?: number;
    margin?: number;
    color?: {
      dark?: string;
      light?: string;
    };
    errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
  }
): Promise<string> {
  try {
    return await QRCode.toDataURL(text, {
      width: options?.width || 300,
      margin: options?.margin ?? 2,
      color: {
        dark: options?.color?.dark || '#000000',
        light: options?.color?.light || '#ffffff',
      },
      errorCorrectionLevel: options?.errorCorrectionLevel || 'M',
    });
  } catch (err) {
    console.error('Error generating QR code:', err);
    throw err;
  }
}

// Generate QR Code as SVG String
export async function generateQRSVG(
  text: string,
  options?: {
    width?: number;
    margin?: number;
    color?: {
      dark?: string;
      light?: string;
    };
  }
): Promise<string> {
  try {
    return await QRCode.toString(text, {
      type: 'svg',
      width: options?.width || 300,
      margin: options?.margin ?? 2,
      color: {
        dark: options?.color?.dark || '#000000',
        light: options?.color?.light || '#ffffff',
      },
    });
  } catch (err) {
    console.error('Error generating QR SVG:', err);
    throw err;
  }
}

// Scan QR from an HTML Video element or Canvas
export async function scanQRFromCanvasOrVideo(
  videoOrCanvas: HTMLVideoElement | HTMLCanvasElement,
  fallbackCanvas: HTMLCanvasElement
): Promise<string | null> {
  // 1. Try Chrome native BarcodeDetector API if available
  if (hasNativeBarcodeDetector()) {
    try {
      const barcodeDetector = new (window as any).BarcodeDetector({
        formats: ['qr_code'],
      });
      const barcodes = await barcodeDetector.detect(videoOrCanvas);
      if (barcodes && barcodes.length > 0 && barcodes[0].rawValue) {
        return barcodes[0].rawValue;
      }
    } catch (e) {
      // Fallback to jsQR below if native detector encounters frame issues
    }
  }

  // 2. Universal jsQR fallback using canvas 2d image data
  try {
    const ctx = fallbackCanvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return null;

    let width = 0;
    let height = 0;

    if (videoOrCanvas instanceof HTMLVideoElement) {
      if (videoOrCanvas.readyState !== videoOrCanvas.HAVE_ENOUGH_DATA) {
        return null;
      }
      width = videoOrCanvas.videoWidth;
      height = videoOrCanvas.videoHeight;
    } else {
      width = videoOrCanvas.width;
      height = videoOrCanvas.height;
    }

    if (width === 0 || height === 0) return null;

    fallbackCanvas.width = width;
    fallbackCanvas.height = height;

    ctx.drawImage(videoOrCanvas, 0, 0, width, height);
    const imageData = ctx.getImageData(0, 0, width, height);

    const code = jsQR(imageData.data, imageData.width, imageData.height, {
      inversionAttempts: 'dontInvert',
    });

    if (code && code.data) {
      return code.data;
    }
  } catch (err) {
    // Frame extraction error
  }

  return null;
}

// Scan QR code from an image file (e.g. uploaded screenshot)
export async function scanQRFromImageFile(file: File): Promise<string | null> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = async () => {
        // Try native BarcodeDetector first
        if (hasNativeBarcodeDetector()) {
          try {
            const barcodeDetector = new (window as any).BarcodeDetector({
              formats: ['qr_code'],
            });
            const barcodes = await barcodeDetector.detect(img);
            if (barcodes && barcodes.length > 0 && barcodes[0].rawValue) {
              resolve(barcodes[0].rawValue);
              return;
            }
          } catch (err) {
            // continue to fallback
          }
        }

        // jsQR fallback
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (!ctx) {
          resolve(null);
          return;
        }

        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, img.width, img.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height);
        if (code && code.data) {
          resolve(code.data);
        } else {
          resolve(null);
        }
      };
      img.onerror = () => reject(new Error('Failed to load image file.'));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error('Failed to read file.'));
    reader.readAsDataURL(file);
  });
}
