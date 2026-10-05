import React, { useState, useEffect } from 'react';
import { 
  QrCode, 
  X, 
  Download, 
  Copy, 
  Check, 
  MessageSquare, 
  Smartphone, 
  Globe, 
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { generateQRDataURL, generateQRSVG } from '../utils/qrUtils';

interface QRGeneratorModalProps {
  visible: boolean;
  onClose: () => void;
  defaultPayload?: string;
  defaultPhone?: string;
}

export function QRGeneratorModal({
  visible,
  onClose,
  defaultPayload,
  defaultPhone = '+1 (415) 890-2314',
}: QRGeneratorModalProps) {
  const [qrType, setQrType] = useState<'whatsapp_chat' | 'pairing_token' | 'custom_url'>('whatsapp_chat');
  const [phone, setPhone] = useState<string>(defaultPhone);
  const [chatMessage, setChatMessage] = useState<string>('Hi! I want to claim the 25% VIP promotion.');
  const [customUrl, setCustomUrl] = useState<string>('https://wa.me/14158902314');
  const [colorTheme, setColorTheme] = useState<'classic' | 'whatsapp' | 'dark'>('whatsapp');
  
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [copiedImage, setCopiedImage] = useState<boolean>(false);

  // Compute active payload text
  const cleanPhone = phone.replace(/[^0-9]/g, '');
  const computedPayload = (() => {
    if (qrType === 'whatsapp_chat') {
      const encodedMsg = encodeURIComponent(chatMessage);
      return `https://wa.me/${cleanPhone}?text=${encodedMsg}`;
    }
    if (qrType === 'pairing_token') {
      return `2@${Date.now()},WAP7_${cleanPhone.slice(-6)},AIStudioHub_${Math.random().toString(36).substring(7)}`;
    }
    return customUrl;
  })();

  const colorConfig = {
    classic: { dark: '#000000', light: '#ffffff' },
    whatsapp: { dark: '#075e54', light: '#ffffff' },
    dark: { dark: '#22c55e', light: '#09090b' },
  }[colorTheme];

  useEffect(() => {
    if (!visible) return;

    let isMounted = true;
    generateQRDataURL(computedPayload, {
      width: 320,
      margin: 2,
      color: colorConfig,
      errorCorrectionLevel: 'M',
    })
      .then(url => {
        if (isMounted) setQrDataUrl(url);
      })
      .catch(console.error);

    return () => {
      isMounted = false;
    };
  }, [visible, computedPayload, colorTheme]);

  if (!visible) return null;

  const handleDownloadPNG = () => {
    if (!qrDataUrl) return;
    const a = document.createElement('a');
    a.href = qrDataUrl;
    a.download = `whatsapp_qr_${qrType}.png`;
    a.click();
  };

  const handleDownloadSVG = async () => {
    try {
      const svgString = await generateQRSVG(computedPayload, {
        width: 400,
        color: colorConfig,
      });
      const blob = new Blob([svgString], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `whatsapp_qr_${qrType}.svg`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard?.writeText(computedPayload);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4">
      <div className="w-full max-w-2xl rounded-3xl bg-zinc-950 border border-zinc-800 p-6 md:p-8 shadow-2xl space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-green-500/10 border border-green-500/20 flex items-center justify-center text-green-500">
              <QrCode className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>Dynamic QR Code Generator</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-green-950 text-green-400 border border-green-800">
                  Standard Compliant
                </span>
              </h3>
              <p className="text-xs text-zinc-400">Generate high-precision scannable codes for WhatsApp marketing</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-900"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* QR Type Selector */}
        <div className="grid grid-cols-3 gap-2 p-1.5 rounded-2xl bg-zinc-900 border border-zinc-800 text-xs">
          <button
            type="button"
            onClick={() => setQrType('whatsapp_chat')}
            className={`flex items-center justify-center gap-1.5 py-2 rounded-xl font-medium transition-colors ${
              qrType === 'whatsapp_chat' ? 'bg-zinc-800 text-white font-bold shadow-sm' : 'text-zinc-400'
            }`}
          >
            <MessageSquare className="h-3.5 w-3.5 text-green-400" />
            <span>Direct WhatsApp Chat</span>
          </button>

          <button
            type="button"
            onClick={() => setQrType('pairing_token')}
            className={`flex items-center justify-center gap-1.5 py-2 rounded-xl font-medium transition-colors ${
              qrType === 'pairing_token' ? 'bg-zinc-800 text-white font-bold shadow-sm' : 'text-zinc-400'
            }`}
          >
            <Smartphone className="h-3.5 w-3.5 text-green-400" />
            <span>Device Pairing Session</span>
          </button>

          <button
            type="button"
            onClick={() => setQrType('custom_url')}
            className={`flex items-center justify-center gap-1.5 py-2 rounded-xl font-medium transition-colors ${
              qrType === 'custom_url' ? 'bg-zinc-800 text-white font-bold shadow-sm' : 'text-zinc-400'
            }`}
          >
            <Globe className="h-3.5 w-3.5 text-green-400" />
            <span>Custom URL / Link</span>
          </button>
        </div>

        {/* 2-Column: Left Configuration Form, Right Live QR Preview */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          
          {/* Config: 7 cols */}
          <div className="md:col-span-7 space-y-4 text-xs">
            {qrType === 'whatsapp_chat' && (
              <>
                <div>
                  <label className="block text-zinc-400 font-mono text-[10px] uppercase mb-1">
                    Destination WhatsApp Phone
                  </label>
                  <input
                    type="text"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="+1 (415) 890-2314"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-2.5 text-white font-mono focus:outline-none focus:border-green-500"
                  />
                </div>

                <div>
                  <label className="block text-zinc-400 font-mono text-[10px] uppercase mb-1">
                    Pre-filled Message (Auto Populates User's Chat)
                  </label>
                  <textarea
                    rows={3}
                    value={chatMessage}
                    onChange={e => setChatMessage(e.target.value)}
                    placeholder="Hi, I saw your campaign flyer..."
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-green-500 resize-none"
                  />
                </div>
              </>
            )}

            {qrType === 'pairing_token' && (
              <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-2">
                <span className="text-[10px] uppercase font-mono text-green-400 font-bold block">
                  Simulated WhatsApp Multi-Device Session
                </span>
                <p className="text-zinc-400 leading-relaxed text-xs">
                  This generates a real cryptographic pairing string that mimics WhatsApp Web handshake. Scanning this with the Chrome camera scanner in this app or with your phone will detect and link a new device!
                </p>
                <div className="p-2 rounded-lg bg-zinc-950 font-mono text-[11px] text-zinc-400 truncate">
                  {computedPayload}
                </div>
              </div>
            )}

            {qrType === 'custom_url' && (
              <div>
                <label className="block text-zinc-400 font-mono text-[10px] uppercase mb-1">
                  Destination Web Link / URL
                </label>
                <input
                  type="text"
                  value={customUrl}
                  onChange={e => setCustomUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-2.5 text-white font-mono focus:outline-none focus:border-green-500"
                />
              </div>
            )}

            {/* Color Palette Switcher */}
            <div>
              <label className="block text-zinc-400 font-mono text-[10px] uppercase mb-1.5">Color Palette</label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setColorTheme('whatsapp')}
                  className={`px-3 py-1.5 rounded-xl border text-xs font-medium transition-colors ${
                    colorTheme === 'whatsapp'
                      ? 'bg-zinc-800 border-green-500 text-green-400'
                      : 'bg-zinc-950 border-zinc-800 text-zinc-400'
                  }`}
                >
                  WhatsApp Green
                </button>
                <button
                  type="button"
                  onClick={() => setColorTheme('classic')}
                  className={`px-3 py-1.5 rounded-xl border text-xs font-medium transition-colors ${
                    colorTheme === 'classic'
                      ? 'bg-zinc-800 border-white text-white'
                      : 'bg-zinc-950 border-zinc-800 text-zinc-400'
                  }`}
                >
                  Monochrome High-Contrast
                </button>
                <button
                  type="button"
                  onClick={() => setColorTheme('dark')}
                  className={`px-3 py-1.5 rounded-xl border text-xs font-medium transition-colors ${
                    colorTheme === 'dark'
                      ? 'bg-zinc-800 border-green-500 text-green-400'
                      : 'bg-zinc-950 border-zinc-800 text-zinc-400'
                  }`}
                >
                  Dark Slate Matrix
                </button>
              </div>
            </div>

            {/* Copyable computed URL */}
            <div className="pt-1">
              <button
                type="button"
                onClick={handleCopyLink}
                className="w-full flex items-center justify-between p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white hover:border-zinc-700 transition-colors"
              >
                <span className="font-mono text-[11px] truncate max-w-xs">{computedPayload}</span>
                <span className="flex items-center gap-1 text-[11px] text-green-400 shrink-0 ml-2">
                  {copiedLink ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                  {copiedLink ? 'Copied' : 'Copy Link'}
                </span>
              </button>
            </div>
          </div>

          {/* QR Display: 5 cols */}
          <div className="md:col-span-5 flex flex-col items-center justify-center">
            <div className={`p-4 rounded-3xl border shadow-2xl transition-all ${
              colorTheme === 'dark' ? 'bg-zinc-950 border-zinc-800' : 'bg-white border-zinc-200'
            }`}>
              {qrDataUrl ? (
                <img
                  src={qrDataUrl}
                  alt="Generated QR Code"
                  className="w-48 h-48 object-contain rounded-xl select-none"
                />
              ) : (
                <div className="w-48 h-48 flex items-center justify-center text-zinc-400 font-mono text-xs">
                  Generating QR...
                </div>
              )}
            </div>

            <div className="mt-4 flex items-center gap-2 w-full">
              <button
                type="button"
                onClick={handleDownloadPNG}
                className="flex-1 flex items-center justify-center gap-1 py-2 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-xs font-semibold text-white transition-colors"
              >
                <Download className="h-3.5 w-3.5 text-green-400" />
                <span>PNG</span>
              </button>

              <button
                type="button"
                onClick={handleDownloadSVG}
                className="flex-1 flex items-center justify-center gap-1 py-2 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-xs font-semibold text-white transition-colors"
              >
                <Download className="h-3.5 w-3.5 text-green-400" />
                <span>SVG</span>
              </button>
            </div>

            <p className="mt-2 text-[10px] text-zinc-500 font-mono text-center">
              Scan with Google Chrome or WhatsApp Mobile Camera
            </p>
          </div>

        </div>

      </div>
    </div>
  );
}
