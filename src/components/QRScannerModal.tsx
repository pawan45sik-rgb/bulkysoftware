import React, { useState, useEffect, useRef } from 'react';
import { 
  Camera, 
  X, 
  Upload, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle, 
  ExternalLink, 
  Copy, 
  Check, 
  Sparkles,
  Zap,
  Volume2,
  VolumeX,
  FlipHorizontal
} from 'lucide-react';
import { scanQRFromCanvasOrVideo, scanQRFromImageFile, hasNativeBarcodeDetector } from '../utils/qrUtils';

interface QRScannerModalProps {
  visible: boolean;
  onClose: () => void;
  onScanResult?: (data: string) => void;
}

export function QRScannerModal({ visible, onClose, onScanResult }: QRScannerModalProps) {
  const [cameras, setCameras] = useState<MediaDeviceInfo[]>([]);
  const [selectedCameraId, setSelectedCameraId] = useState<string>('');
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [scannedResult, setScannedResult] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState<boolean>(true);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [copied, setCopied] = useState<boolean>(false);
  const [isProcessingFile, setIsProcessingFile] = useState<boolean>(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const playSuccessBeep = () => {
    if (!soundEnabled) return;
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1046.5, ctx.currentTime); // C6
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    } catch (e) {
      // Audio might be muted
    }
  };

  // Enumerate cameras in Google Chrome
  const getCameraDevices = async () => {
    try {
      if (!navigator.mediaDevices?.enumerateDevices) return;
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(d => d.kind === 'videoinput');
      setCameras(videoDevices);
      if (videoDevices.length > 0 && !selectedCameraId) {
        // Prefer rear/environment camera on phones, or first device
        const backCamera = videoDevices.find(d => 
          d.label.toLowerCase().includes('back') || 
          d.label.toLowerCase().includes('rear') || 
          d.label.toLowerCase().includes('environment')
        );
        setSelectedCameraId(backCamera ? backCamera.deviceId : videoDevices[0].deviceId);
      }
    } catch (e) {
      console.warn('Could not enumerate cameras:', e);
    }
  };

  // Start video stream
  const startCamera = async (deviceId?: string) => {
    stopCamera();
    setErrorMessage(null);

    if (!navigator.mediaDevices?.getUserMedia) {
      setErrorMessage('Camera access is not supported by your current browser. Please open in Google Chrome with HTTPS.');
      setHasPermission(false);
      return;
    }

    try {
      const constraints: MediaStreamConstraints = {
        video: deviceId 
          ? { deviceId: { exact: deviceId } }
          : { facingMode: { ideal: 'environment' } },
        audio: false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      setHasPermission(true);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true');
        await videoRef.current.play();
      }

      await getCameraDevices();
      setIsScanning(true);
      startScanLoop();
    } catch (err: any) {
      console.error('Camera access error:', err);
      setHasPermission(false);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setErrorMessage('Camera permission was blocked. In Google Chrome, tap the tune/lock icon in the address bar to allow Camera access.');
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setErrorMessage('No camera device detected on your system. You can still scan by uploading an image or screenshot below.');
      } else {
        setErrorMessage(err.message || 'Unable to access camera.');
      }
    }
  };

  const stopCamera = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  // Scan loop
  const startScanLoop = () => {
    const scanFrame = async () => {
      if (!isScanning) return;

      if (videoRef.current && canvasRef.current && videoRef.current.readyState >= 2) {
        try {
          const result = await scanQRFromCanvasOrVideo(videoRef.current, canvasRef.current);
          if (result) {
            handleFoundQR(result);
            return;
          }
        } catch (e) {
          // ignore frame scan glitch
        }
      }

      animationFrameRef.current = requestAnimationFrame(scanFrame);
    };

    animationFrameRef.current = requestAnimationFrame(scanFrame);
  };

  const handleFoundQR = (text: string) => {
    setIsScanning(false);
    setScannedResult(text);
    playSuccessBeep();
    if (onScanResult) {
      onScanResult(text);
    }
  };

  const handleResumeScanning = () => {
    setScannedResult(null);
    setIsScanning(true);
    startScanLoop();
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessingFile(true);
    setErrorMessage(null);
    try {
      const result = await scanQRFromImageFile(file);
      if (result) {
        handleFoundQR(result);
      } else {
        setErrorMessage('No QR code detected in the selected image. Please try a clearer or higher-contrast image.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to process image file.');
    } finally {
      setIsProcessingFile(false);
    }
  };

  const handleCopyResult = () => {
    if (!scannedResult) return;
    navigator.clipboard?.writeText(scannedResult);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  useEffect(() => {
    if (visible) {
      startCamera(selectedCameraId);
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [visible, selectedCameraId]);

  if (!visible) return null;

  // Determine QR Content Type
  const isUrl = scannedResult?.startsWith('http://') || scannedResult?.startsWith('https://');
  const isWhatsApp = scannedResult?.includes('wa.me') || scannedResult?.startsWith('whatsapp://') || scannedResult?.includes('2@');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4">
      {/* Hidden fallback canvas for processing video frames */}
      <canvas ref={canvasRef} className="hidden" />

      <div className="w-full max-w-lg rounded-3xl bg-zinc-950 border border-zinc-800 p-6 shadow-2xl space-y-5">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center text-green-500">
              <Camera className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>Google Chrome QR Scanner</span>
                {hasNativeBarcodeDetector() && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-green-400">
                    Chrome HW Engine
                  </span>
                )}
              </h3>
              <p className="text-xs text-zinc-400">Scan WhatsApp Web QR, Contact Codes, or Links</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-900"
              title={soundEnabled ? 'Mute beep' : 'Unmute beep'}
            >
              {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-900"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Camera Selector (if multiple devices) */}
        {cameras.length > 1 && (
          <div className="flex items-center justify-between bg-zinc-900/60 p-2.5 rounded-xl border border-zinc-800 text-xs">
            <span className="text-zinc-400 font-mono flex items-center gap-1.5">
              <FlipHorizontal className="h-3.5 w-3.5 text-green-400" /> Camera:
            </span>
            <select
              value={selectedCameraId}
              onChange={(e) => setSelectedCameraId(e.target.value)}
              className="bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1 text-white text-xs focus:outline-none focus:border-green-500 font-mono"
            >
              {cameras.map((cam, idx) => (
                <option key={cam.deviceId} value={cam.deviceId}>
                  {cam.label || `Camera ${idx + 1}`}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Viewfinder Canvas / Video Frame */}
        <div className="relative w-full aspect-square max-h-[340px] rounded-2xl overflow-hidden bg-black border border-zinc-800 flex items-center justify-center">
          {hasPermission === false && (
            <div className="p-6 text-center space-y-3">
              <AlertCircle className="h-10 w-10 text-amber-500 mx-auto" />
              <p className="text-xs text-zinc-300 leading-relaxed max-w-xs mx-auto">
                {errorMessage || 'Camera access is required to scan live QR codes.'}
              </p>
              <button
                type="button"
                onClick={() => startCamera(selectedCameraId)}
                className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-white transition-colors"
              >
                Retry Camera Access
              </button>
            </div>
          )}

          {/* Video Stream Element */}
          <video
            ref={videoRef}
            className={`w-full h-full object-cover ${hasPermission ? 'block' : 'hidden'}`}
            muted
            autoPlay
            playsInline
          />

          {/* Viewfinder Reticle Overlay */}
          {hasPermission && isScanning && (
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              {/* Shaded backdrop border */}
              <div className="relative w-56 h-56 rounded-2xl border-2 border-green-500/80 shadow-[0_0_20px_rgba(34,197,94,0.3)]">
                {/* 4 Corner Markers */}
                <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-green-400 rounded-tl-lg"></div>
                <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-green-400 rounded-tr-lg"></div>
                <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-green-400 rounded-bl-lg"></div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-green-400 rounded-br-lg"></div>

                {/* Animated Green Laser Scanline */}
                <div className="absolute inset-x-2 h-0.5 bg-gradient-to-r from-transparent via-green-400 to-transparent shadow-[0_0_12px_#4ade80] animate-bounce top-1/2"></div>
              </div>

              <div className="absolute bottom-4 bg-black/70 backdrop-blur-md px-3 py-1 rounded-full text-[11px] font-mono text-zinc-300">
                Point at QR code to scan
              </div>
            </div>
          )}

          {/* Scanned Result Banner Overlay */}
          {scannedResult && (
            <div className="absolute inset-0 bg-black/95 p-6 flex flex-col justify-between items-center text-center animate-fade-in z-20">
              <div className="space-y-2 pt-4">
                <div className="h-12 w-12 rounded-full bg-green-500/20 border border-green-500 flex items-center justify-center text-green-400 mx-auto">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <h4 className="text-base font-bold text-white">QR Code Detected!</h4>
                <p className="text-xs text-zinc-400 font-mono">Payload decoded with 100% parity</p>
              </div>

              {/* Decoded content box */}
              <div className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-left">
                <span className="text-[10px] uppercase font-mono text-zinc-500 block mb-1">Decoded Content</span>
                <p className="text-xs text-white font-mono break-all line-clamp-3 select-all">
                  {scannedResult}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="w-full space-y-2">
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleCopyResult}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-white transition-colors"
                  >
                    {copied ? <Check className="h-3.5 w-3.5 text-green-400" /> : <Copy className="h-3.5 w-3.5" />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>

                  {isUrl && (
                    <a
                      href={scannedResult}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-green-600 hover:bg-green-500 text-xs font-bold text-white transition-colors"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      <span>Open Link</span>
                    </a>
                  )}
                </div>

                <button
                  type="button"
                  onClick={handleResumeScanning}
                  className="w-full py-2 text-xs text-zinc-400 hover:text-white transition-colors flex items-center justify-center gap-1"
                >
                  <RefreshCw className="h-3 w-3" />
                  <span>Scan Another Code</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Upload Fallback for Screenshot / Photo Scan */}
        <div className="pt-2 border-t border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <span className="text-zinc-400">Can't use webcam?</span>
          <label className="cursor-pointer inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white hover:border-zinc-700 transition-colors">
            {isProcessingFile ? (
              <RefreshCw className="h-3.5 w-3.5 animate-spin text-green-400" />
            ) : (
              <Upload className="h-3.5 w-3.5 text-green-400" />
            )}
            <span>Scan QR from Image File</span>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
        </div>

      </div>
    </div>
  );
}
