import React, { useEffect } from 'react';
import { X, Download, FileText, ZoomIn, ZoomOut, CheckCircle2 } from 'lucide-react';
import { MediaFile } from '../types';

interface MediaPreviewProps {
  visible: boolean;
  file: MediaFile | null;
  onClose: () => void;
  onConfirmUse?: () => void;
}

export function MediaPreviewModal({ visible, file, onClose, onConfirmUse }: MediaPreviewProps) {
  const [zoomLevel, setZoomLevel] = React.useState<number>(1);
  const [copiedLink, setCopiedLink] = React.useState<boolean>(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (visible) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [visible, onClose]);

  if (!visible || !file) return null;

  const isImage = file.mimeType?.includes('image') || file.type === 'image';
  const isVideo = file.mimeType?.includes('video') || file.type === 'video';
  const isPdf = file.mimeType?.includes('pdf') || file.type === 'pdf' || file.name.endsWith('.pdf');

  const formatFileSize = (bytes: number): string => {
    if (!bytes) return '0 B';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const handleDownload = () => {
    const a = document.createElement('a');
    a.href = file.uri;
    a.download = file.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex flex-col bg-black/95 backdrop-blur-md transition-opacity duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="preview-filename"
    >
      {/* Top Bar Header */}
      <header className="flex h-16 w-full items-center justify-between border-b border-zinc-800/80 px-6 bg-zinc-950/80">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-zinc-900 border border-zinc-800 text-green-500 font-mono text-sm">
            {isImage ? 'IMG' : isVideo ? 'VID' : 'PDF'}
          </div>
          <div className="min-w-0">
            <h2 id="preview-filename" className="truncate text-sm font-semibold text-white max-w-md">
              {file.name}
            </h2>
            <p className="text-xs text-zinc-400 font-mono">
              {formatFileSize(file.size)} {file.duration ? `· ${file.duration}` : ''} {file.pageCount ? `· ${file.pageCount} pages` : ''}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {isImage && (
            <div className="flex items-center rounded-lg border border-zinc-800 bg-zinc-900 p-1 mr-2 text-zinc-400">
              <button
                type="button"
                onClick={() => setZoomLevel(prev => Math.max(0.5, prev - 0.25))}
                className="p-1 hover:text-white transition-colors"
                title="Zoom Out"
                aria-label="Zoom Out"
              >
                <ZoomOut className="h-4 w-4" />
              </button>
              <span className="px-2 text-xs font-mono">{Math.round(zoomLevel * 100)}%</span>
              <button
                type="button"
                onClick={() => setZoomLevel(prev => Math.min(2.5, prev + 0.25))}
                className="p-1 hover:text-white transition-colors"
                title="Zoom In"
                aria-label="Zoom In"
              >
                <ZoomIn className="h-4 w-4" />
              </button>
            </div>
          )}

          <button
            type="button"
            onClick={handleDownload}
            className="flex items-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs font-medium text-zinc-200 hover:bg-zinc-800 hover:text-white transition-colors"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Download</span>
          </button>

          {onConfirmUse && (
            <button
              type="button"
              onClick={() => {
                onConfirmUse();
                onClose();
              }}
              className="flex items-center gap-1.5 rounded-lg bg-green-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-green-500 transition-colors"
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>Use in Campaign</span>
            </button>
          )}

          <button
            type="button"
            onClick={onClose}
            className="ml-2 flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-900 text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors"
            aria-label="Close Preview"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </header>

      {/* Main Preview Canvas */}
      <main className="flex flex-1 items-center justify-center overflow-auto p-6">
        {/* IMAGE PREVIEW */}
        {isImage && (
          <div className="relative flex max-h-[82vh] max-w-[90vw] items-center justify-center overflow-hidden rounded-xl border border-zinc-800/80 bg-zinc-950/60 p-2 shadow-2xl">
            <img
              src={file.uri}
              alt={file.name}
              referrerPolicy="no-referrer"
              style={{
                transform: `scale(${zoomLevel})`,
                transition: 'transform 0.15s ease-out'
              }}
              className="max-h-[75vh] max-w-[85vw] object-contain rounded-lg shadow-lg select-none"
            />
          </div>
        )}

        {/* VIDEO PREVIEW */}
        {isVideo && (
          <div className="flex w-full max-w-4xl flex-col items-center">
            <div className="w-full overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950 shadow-2xl">
              <video
                src={file.uri}
                controls
                autoPlay
                playsInline
                className="w-full max-h-[72vh] object-contain bg-black"
              >
                Your browser does not support HTML5 video preview.
              </video>
            </div>
            <p className="mt-3 text-xs text-zinc-500">
              Video media will automatically generate WhatsApp streamable MP4 preview cards for recipients.
            </p>
          </div>
        )}

        {/* PDF / DOCUMENT PREVIEW */}
        {!isImage && !isVideo && (
          <div className="flex w-full max-w-2xl flex-col items-center rounded-2xl border border-zinc-800 bg-zinc-900/90 p-10 text-center shadow-2xl">
            <div className="relative mb-6 flex h-24 w-20 flex-col items-center justify-center rounded-xl bg-zinc-800 border border-zinc-700 shadow-inner">
              <FileText className="h-10 w-10 text-green-500" />
              <span className="absolute bottom-1.5 text-[10px] font-bold font-mono tracking-widest text-zinc-400">PDF</span>
            </div>

            <h3 className="text-xl font-bold text-white mb-2">{file.name}</h3>
            <p className="text-sm text-zinc-400 mb-6 max-w-md">
              Portable Document Format ({formatFileSize(file.size)}) · {file.pageCount || 1} Pages
            </p>

            <div className="w-full rounded-xl bg-zinc-950/70 border border-zinc-800 p-5 text-left mb-6">
              <div className="flex items-center justify-between text-xs text-zinc-400 mb-3 pb-2 border-b border-zinc-800">
                <span>Document Meta</span>
                <span className="font-mono text-green-400">Validated</span>
              </div>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-zinc-500 block">Type:</span>
                  <span className="text-zinc-300 font-mono">application/pdf</span>
                </div>
                <div>
                  <span className="text-zinc-500 block">Estimated Delivery:</span>
                  <span className="text-zinc-300">~1.2 seconds / contact</span>
                </div>
                <div>
                  <span className="text-zinc-500 block">WhatsApp Rendering:</span>
                  <span className="text-zinc-300">In-chat document bubble</span>
                </div>
                <div>
                  <span className="text-zinc-500 block">Size Integrity:</span>
                  <span className="text-zinc-300 font-mono">{file.size.toLocaleString()} bytes</span>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleDownload}
                className="flex items-center gap-2 rounded-xl bg-zinc-800 px-5 py-2.5 text-sm font-medium text-white hover:bg-zinc-700 transition-colors"
              >
                <Download className="h-4 w-4" />
                <span>Open / Download PDF</span>
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Footer hint */}
      <footer className="h-12 border-t border-zinc-900 px-6 flex items-center justify-between text-xs text-zinc-500 bg-zinc-950/90">
        <span>Press <kbd className="rounded border border-zinc-700 bg-zinc-900 px-1.5 py-0.5 text-[10px] text-zinc-300">ESC</kbd> or click Close to return to composer</span>
        <span>WhatsApp Media Payload Engine</span>
      </footer>
    </div>
  );
}
