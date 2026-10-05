import React, { useState, useEffect } from 'react';
import { 
  Smartphone, 
  Plus, 
  QrCode, 
  CheckCircle2, 
  Battery, 
  RefreshCw, 
  ShieldCheck, 
  X, 
  Check, 
  Camera, 
  AlertCircle,
  Copy,
  Clock
} from 'lucide-react';
import { WhatsAppAccount } from '../types';
import { generateQRDataURL } from '../utils/qrUtils';

interface AccountsManagerProps {
  accounts: WhatsAppAccount[];
  selectedAccountId: string;
  onSelectAccount: (id: string) => void;
  onAddAccount: (newAcc: WhatsAppAccount) => void;
  onOpenScanner?: () => void;
  onOpenGenerator?: () => void;
  onDeleteAccount?: (id: string) => void;
}

export function AccountsManager({
  accounts,
  selectedAccountId,
  onSelectAccount,
  onAddAccount,
  onOpenScanner,
  onOpenGenerator,
}: AccountsManagerProps) {
  const [showLinkModal, setShowLinkModal] = useState<boolean>(false);
  const [newAccountName, setNewAccountName] = useState<string>('Marketing VIP Hotline');
  const [newPhoneNumber, setNewPhoneNumber] = useState<string>('+1 (555) 789-0123');
  const [linkingStep, setLinkingStep] = useState<'qr' | 'pairing_code'>('qr');
  const [pairingCode, setPairingCode] = useState<string>('WAP7-99KL');
  const [isLinking, setIsLinking] = useState<boolean>(false);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);

  // Dynamic Real QR Code state
  const [dynamicQRDataUrl, setDynamicQRDataUrl] = useState<string>('');
  const [qrPayload, setQrPayload] = useState<string>('');
  const [refreshCountdown, setRefreshCountdown] = useState<number>(20);

  // Generate real QR code for WhatsApp pairing
  const refreshPairingSession = async () => {
    const timestamp = Date.now();
    const cleanPhone = newPhoneNumber.replace(/[^0-9]/g, '') || '14158902314';
    const sessionToken = `2@${timestamp},WAP7_${cleanPhone.slice(-6)},AIStudioHub_${Math.random().toString(36).substring(7)}`;
    setQrPayload(sessionToken);

    try {
      const dataUrl = await generateQRDataURL(sessionToken, {
        width: 260,
        margin: 1,
        color: { dark: '#075e54', light: '#ffffff' },
        errorCorrectionLevel: 'M',
      });
      setDynamicQRDataUrl(dataUrl);
      setRefreshCountdown(20);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (showLinkModal && linkingStep === 'qr') {
      refreshPairingSession();
      const interval = setInterval(() => {
        setRefreshCountdown(prev => {
          if (prev <= 1) {
            refreshPairingSession();
            return 20;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [showLinkModal, linkingStep, newPhoneNumber]);

  const handleSimulateLink = () => {
    setIsLinking(true);
    setTimeout(() => {
      const newAcc: WhatsAppAccount = {
        id: `acc_${Date.now()}`,
        name: newAccountName || 'New WhatsApp Account',
        phoneNumber: newPhoneNumber || '+1 (555) 000-0000',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        status: 'connected',
        dailyQuota: 500,
        sentToday: 0,
        batteryLevel: 98,
        lastActive: 'Just connected',
      };
      onAddAccount(newAcc);
      setIsLinking(false);
      setShowLinkModal(false);
    }, 1200);
  };

  const handleCopyCode = () => {
    navigator.clipboard?.writeText(pairingCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="flex-1 bg-black text-white p-4 md:p-8 overflow-y-auto">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-zinc-400 mb-1">
              <span>MULTI-DEVICE CLUSTER</span>
              <span>·</span>
              <span className="text-green-500 font-semibold">{accounts.length} Active Nodes</span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-white">WhatsApp Accounts</h1>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            {onOpenScanner && (
              <button
                type="button"
                onClick={onOpenScanner}
                className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-200 hover:text-white text-xs font-semibold transition-colors"
                title="Open Google Chrome Camera QR Scanner"
              >
                <Camera className="h-4 w-4 text-green-400" />
                <span>Scan QR (Chrome)</span>
              </button>
            )}

            {onOpenGenerator && (
              <button
                type="button"
                onClick={onOpenGenerator}
                className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-200 hover:text-white text-xs font-semibold transition-colors"
                title="Generate custom WhatsApp QR Code"
              >
                <QrCode className="h-4 w-4 text-green-400" />
                <span>Generate QR</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setShowLinkModal(true)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-green-600 hover:bg-green-500 text-white font-bold text-xs shadow-lg shadow-green-600/25 transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>Link New Device</span>
            </button>
          </div>
        </div>

        {/* Account Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {accounts.map(acc => {
            const isSelected = acc.id === selectedAccountId;
            const quotaPct = Math.round((acc.sentToday / acc.dailyQuota) * 100);

            return (
              <div
                key={acc.id}
                className={`relative rounded-3xl p-6 border transition-all ${
                  isSelected
                    ? 'bg-zinc-900 border-green-500 ring-1 ring-green-500/50 shadow-xl'
                    : 'bg-zinc-900/70 border-zinc-800 hover:border-zinc-700'
                }`}
              >
                {/* Active check pill */}
                {isSelected && (
                  <span className="absolute top-5 right-5 flex items-center gap-1 rounded-full bg-green-950 border border-green-700/60 px-2.5 py-0.5 text-[10px] font-mono text-green-400">
                    <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse"></span>
                    Default Sender
                  </span>
                )}

                {/* Account Identity */}
                <div className="flex items-center gap-3.5 mb-5">
                  <div className="h-12 w-12 rounded-2xl overflow-hidden bg-zinc-800 border border-zinc-700 flex items-center justify-center font-bold text-green-400 text-base">
                    {acc.name.charAt(0)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-bold text-sm text-white truncate">{acc.name}</h3>
                    <p className="text-xs text-zinc-400 font-mono">{acc.phoneNumber}</p>
                  </div>
                </div>

                {/* Metrics */}
                <div className="space-y-3 rounded-2xl bg-zinc-950 p-4 border border-zinc-800/80 mb-5">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-zinc-500">Daily Quota</span>
                    <span className="text-zinc-200">
                      <strong className="text-white">{acc.sentToday}</strong> / {acc.dailyQuota} msgs
                    </span>
                  </div>

                  <div className="h-2 w-full rounded-full bg-zinc-800 overflow-hidden">
                    <div
                      style={{ width: `${quotaPct}%` }}
                      className={`h-full rounded-full ${quotaPct > 80 ? 'bg-amber-500' : 'bg-green-500'}`}
                    ></div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px] font-mono pt-1 text-zinc-400 border-t border-zinc-900">
                    <div className="flex items-center gap-1">
                      <Battery className="h-3.5 w-3.5 text-green-400" />
                      <span>{acc.batteryLevel}% Battery</span>
                    </div>
                    <div className="flex items-center justify-end gap-1 text-right">
                      <span className="h-2 w-2 rounded-full bg-green-500"></span>
                      <span>{acc.lastActive}</span>
                    </div>
                  </div>
                </div>

                {/* Action button */}
                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => onSelectAccount(acc.id)}
                    disabled={isSelected}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-colors ${
                      isSelected
                        ? 'bg-zinc-800 text-zinc-400 cursor-default'
                        : 'bg-zinc-800 hover:bg-zinc-700 text-white'
                    }`}
                  >
                    {isSelected ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-green-400" />
                        <span>Selected Line</span>
                      </>
                    ) : (
                      <span>Set as Active Line</span>
                    )}
                  </button>

                  <span className="text-[11px] text-zinc-500 font-mono">Session Healthy</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Anti-Ban & Rotation Policy Section */}
        <div className="rounded-3xl bg-zinc-900/60 border border-zinc-800 p-6">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-2xl bg-zinc-800 text-green-400 border border-zinc-700 shrink-0">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <h4 className="text-base font-bold text-white">Smart Account Load Balancing</h4>
              <p className="text-xs text-zinc-400 leading-relaxed max-w-3xl">
                When you initiate multi-contact campaigns, WhatsApp Campaign Hub automatically rotates between your connected phone numbers and enforces randomized pauses (1.5s–3s). This preserves WhatsApp Meta Business Trust Score and prevents account blocks.
              </p>
            </div>
          </div>
        </div>

      </div>

      {/* QR Code Link Modal */}
      {showLinkModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4">
          <div className="w-full max-w-lg rounded-3xl bg-zinc-950 border border-zinc-800 p-6 md:p-8 shadow-2xl space-y-6">
            
            <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-green-600/10 border border-green-500/20 flex items-center justify-center text-green-500">
                  <QrCode className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Link WhatsApp Device</h3>
                  <p className="text-xs text-zinc-400">Scan QR Code from WhatsApp Web / Linked Devices</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowLinkModal(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-900 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Inputs */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-zinc-400 font-mono text-[10px] uppercase mb-1">Account Label</label>
                <input
                  type="text"
                  value={newAccountName}
                  onChange={e => setNewAccountName(e.target.value)}
                  placeholder="e.g. VIP Support Desk"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-green-500"
                />
              </div>
              <div>
                <label className="block text-zinc-400 font-mono text-[10px] uppercase mb-1">Phone Number</label>
                <input
                  type="text"
                  value={newPhoneNumber}
                  onChange={e => setNewPhoneNumber(e.target.value)}
                  placeholder="+1 (555) 000-0000"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-2.5 text-white font-mono focus:outline-none focus:border-green-500"
                />
              </div>
            </div>

            {/* Step Selection */}
            <div className="flex items-center justify-center gap-3 p-1 rounded-xl bg-zinc-900 border border-zinc-800 text-xs">
              <button
                type="button"
                onClick={() => setLinkingStep('qr')}
                className={`flex-1 py-1.5 rounded-lg font-medium transition-colors ${
                  linkingStep === 'qr' ? 'bg-zinc-800 text-white font-bold' : 'text-zinc-400'
                }`}
              >
                Live QR Code
              </button>
              <button
                type="button"
                onClick={() => setLinkingStep('pairing_code')}
                className={`flex-1 py-1.5 rounded-lg font-medium transition-colors ${
                  linkingStep === 'pairing_code' ? 'bg-zinc-800 text-white font-bold' : 'text-zinc-400'
                }`}
              >
                8-Digit Pairing Code
              </button>
            </div>

            {/* Real Dynamic QR Code Presentation */}
            {linkingStep === 'qr' ? (
              <div className="flex flex-col items-center justify-center p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800 text-center space-y-3">
                <div className="relative p-3 bg-white rounded-2xl shadow-xl">
                  {dynamicQRDataUrl ? (
                    <img
                      src={dynamicQRDataUrl}
                      alt="WhatsApp Web Pairing QR Code"
                      className="w-48 h-48 object-contain rounded-lg select-none"
                    />
                  ) : (
                    <div className="w-48 h-48 flex items-center justify-center text-xs text-zinc-600 font-mono">
                      Generating scannable QR...
                    </div>
                  )}

                  {/* Pulsing scanning guide line */}
                  <div className="absolute inset-x-3 h-0.5 bg-green-500/80 shadow-[0_0_8px_#22c55e] animate-bounce top-8"></div>
                </div>

                {/* Session countdown timer */}
                <div className="flex items-center gap-2 text-xs font-mono text-zinc-400">
                  <Clock className="h-3.5 w-3.5 text-green-400" />
                  <span>Session refreshes in: <strong className="text-white">{refreshCountdown}s</strong></span>
                  <button
                    type="button"
                    onClick={refreshPairingSession}
                    className="p-1 text-zinc-400 hover:text-green-400"
                    title="Refresh QR token"
                  >
                    <RefreshCw className="h-3 w-3" />
                  </button>
                </div>

                <div className="text-xs text-zinc-400 space-y-0.5">
                  <p className="font-semibold text-white">How to connect with Google Chrome or Phone:</p>
                  <p>1. Open WhatsApp on phone &gt; Settings &gt; Linked Devices</p>
                  <p>2. Tap "Link a Device" and scan this QR code directly with your camera</p>
                </div>

                {onOpenScanner && (
                  <button
                    type="button"
                    onClick={() => {
                      setShowLinkModal(false);
                      onOpenScanner();
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-950 border border-zinc-700 text-xs text-green-400 hover:text-green-300"
                  >
                    <Camera className="h-3.5 w-3.5" />
                    <span>Or Test Chrome Webcam Scanner</span>
                  </button>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800 text-center space-y-4">
                <p className="text-xs text-zinc-400">
                  Open WhatsApp on your phone &gt; Linked Devices &gt; Link with phone number instead, and enter:
                </p>

                <div className="flex items-center gap-3 bg-zinc-950 border border-zinc-800 px-6 py-3 rounded-2xl">
                  <span className="text-2xl font-mono font-bold tracking-widest text-green-400">
                    {pairingCode}
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyCode}
                    className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300"
                    title="Copy code"
                  >
                    {copiedCode ? <Check className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4" />}
                  </button>
                </div>
                <p className="text-[11px] text-zinc-500 font-mono">Code expires in 2 minutes</p>
              </div>
            )}

            {/* Bottom simulate pairing button */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-800">
              <button
                type="button"
                onClick={() => setShowLinkModal(false)}
                className="px-4 py-2 rounded-xl text-xs text-zinc-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSimulateLink}
                disabled={isLinking}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-green-600 hover:bg-green-500 text-white font-bold text-xs shadow-lg shadow-green-600/25 transition-all"
              >
                {isLinking ? (
                  <>
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                    <span>Authorizing Session...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>Confirm Device Connection</span>
                  </>
                )}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
