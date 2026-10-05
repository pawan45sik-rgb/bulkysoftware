import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Pause, 
  Square, 
  CheckCheck, 
  Clock, 
  AlertCircle, 
  CheckCircle2, 
  Smartphone, 
  ArrowRight,
  ShieldCheck,
  Zap,
  Volume2,
  VolumeX
} from 'lucide-react';
import { Contact, MediaFile, DeliveryLogItem, WhatsAppAccount } from '../types';

interface ActiveCampaignRunnerProps {
  campaignTitle: string;
  account: WhatsAppAccount;
  recipients: Contact[];
  messageTemplate: string;
  mediaFile: MediaFile | null;
  onFinish: (newLogs: DeliveryLogItem[]) => void;
  onCancel: () => void;
}

export function ActiveCampaignRunner({
  campaignTitle,
  account,
  recipients,
  messageTemplate,
  mediaFile,
  onFinish,
  onCancel
}: ActiveCampaignRunnerProps) {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [statuses, setStatuses] = useState<Record<string, 'pending' | 'sending' | 'delivered' | 'failed'>>(() => {
    const map: Record<string, 'pending' | 'sending' | 'delivered' | 'failed'> = {};
    recipients.forEach(r => { map[r.id] = 'pending'; });
    return map;
  });
  const [completedLogs, setCompletedLogs] = useState<DeliveryLogItem[]>([]);
  const isFinished = currentIndex >= recipients.length;

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Play subtle web audio beep when message sends
  const playBeep = () => {
    if (!soundEnabled) return;
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.12);
    } catch (e) {
      // AudioContext might be muted or not allowed without user gesture
    }
  };

  useEffect(() => {
    if (isPaused || isFinished) return;

    const currentContact = recipients[currentIndex];
    if (!currentContact) return;

    // Set sending state
    setStatuses(prev => ({ ...prev, [currentContact.id]: 'sending' }));

    // Randomized delay between 1200ms and 2400ms to simulate real WhatsApp anti-spam safety
    const delay = Math.floor(Math.random() * 1000) + 1400;

    timerRef.current = setTimeout(() => {
      // 95% delivery success rate
      const isSuccess = Math.random() > 0.05;
      const statusResult = isSuccess ? 'delivered' : 'failed';

      setStatuses(prev => ({ ...prev, [currentContact.id]: statusResult }));
      if (isSuccess) playBeep();

      const newLog: DeliveryLogItem = {
        id: `run_${Date.now()}_${currentIndex}`,
        campaignId: `cmp_${Date.now()}`,
        campaignName: campaignTitle,
        recipientName: currentContact.name,
        recipientPhone: currentContact.phone,
        accountName: account.name,
        status: isSuccess ? 'delivered' : 'failed',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        errorMessage: isSuccess ? undefined : 'Handshake timeout on subscriber network'
      };

      setCompletedLogs(prev => [newLog, ...prev]);
      setCurrentIndex(prev => prev + 1);
    }, delay);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [currentIndex, isPaused, isFinished, recipients, campaignTitle, account]);

  const deliveredCount = Object.values(statuses).filter(s => s === 'delivered').length;
  const failedCount = Object.values(statuses).filter(s => s === 'failed').length;
  const progressPct = Math.round((currentIndex / recipients.length) * 100);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4">
      <div className="w-full max-w-2xl rounded-3xl bg-zinc-950 border border-zinc-800 p-6 md:p-8 shadow-2xl space-y-6">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-green-500/10 border border-green-500/20 flex items-center justify-center text-green-500">
              <Zap className="h-5 w-5 animate-pulse" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <span>{isFinished ? 'Broadcast Finished' : 'Live WhatsApp Dispatch'}</span>
                {!isFinished && (
                  <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-green-950 text-green-400 border border-green-800">
                    Running
                  </span>
                )}
              </h2>
              <p className="text-xs text-zinc-400 font-mono">
                {campaignTitle} · Via {account.name} ({account.phoneNumber})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white transition-colors"
              title={soundEnabled ? 'Mute dispatch audio' : 'Unmute dispatch audio'}
            >
              {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Live Progress Bar and Metrics */}
        <div className="space-y-3 bg-zinc-900/70 p-5 rounded-2xl border border-zinc-800/80">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-zinc-400">
              Progress: <strong className="text-white">{currentIndex}</strong> of <strong className="text-white">{recipients.length}</strong> recipients
            </span>
            <span className="text-green-400 font-bold">{progressPct}%</span>
          </div>

          <div className="h-3 w-full rounded-full bg-zinc-800 overflow-hidden">
            <div
              style={{ width: `${progressPct}%` }}
              className="h-full bg-gradient-to-r from-green-600 to-green-400 transition-all duration-300 rounded-full"
            ></div>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-2 text-center text-xs font-mono">
            <div className="p-2 rounded-xl bg-zinc-950/80 border border-zinc-800">
              <span className="text-zinc-500 block text-[10px] uppercase">Delivered</span>
              <span className="text-green-400 text-base font-bold">{deliveredCount}</span>
            </div>
            <div className="p-2 rounded-xl bg-zinc-950/80 border border-zinc-800">
              <span className="text-zinc-500 block text-[10px] uppercase">Failed</span>
              <span className="text-red-400 text-base font-bold">{failedCount}</span>
            </div>
            <div className="p-2 rounded-xl bg-zinc-950/80 border border-zinc-800">
              <span className="text-zinc-500 block text-[10px] uppercase">Remaining</span>
              <span className="text-zinc-300 text-base font-bold">{recipients.length - currentIndex}</span>
            </div>
          </div>
        </div>

        {/* Real-time Recipient Stream */}
        <div>
          <div className="flex items-center justify-between text-xs text-zinc-400 mb-2 font-mono">
            <span>Recipient Dispatch Stream</span>
            <span className="flex items-center gap-1 text-[11px] text-zinc-500">
              <ShieldCheck className="h-3.5 w-3.5 text-green-500" /> WhatsApp Anti-Ban Throttling Engaged
            </span>
          </div>

          <div className="max-h-52 overflow-y-auto space-y-2 rounded-2xl bg-zinc-950 p-3 border border-zinc-800/80">
            {recipients.map((contact, idx) => {
              const status = statuses[contact.id];
              return (
                <div
                  key={contact.id}
                  className={`flex items-center justify-between p-2.5 rounded-xl border text-xs transition-colors ${
                    status === 'sending'
                      ? 'bg-zinc-900 border-green-500/50'
                      : status === 'delivered'
                      ? 'bg-zinc-950/80 border-zinc-800/60'
                      : status === 'failed'
                      ? 'bg-red-950/20 border-red-900/50'
                      : 'bg-zinc-950/30 border-transparent opacity-60'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono text-[10px] text-zinc-500 w-5">#{idx + 1}</span>
                    <span className="font-semibold text-zinc-200">{contact.name}</span>
                    <span className="text-zinc-500 font-mono text-[11px]">{contact.phone}</span>
                  </div>

                  <div className="flex items-center gap-2 font-mono text-[11px]">
                    {status === 'pending' && (
                      <span className="text-zinc-500 flex items-center gap-1">
                        <Clock className="h-3 w-3" /> Queued
                      </span>
                    )}
                    {status === 'sending' && (
                      <span className="text-green-400 flex items-center gap-1 animate-pulse font-medium">
                        Sending payload...
                      </span>
                    )}
                    {status === 'delivered' && (
                      <span className="text-green-500 flex items-center gap-1 font-medium">
                        <CheckCheck className="h-3.5 w-3.5" /> Sent & Delivered
                      </span>
                    )}
                    {status === 'failed' && (
                      <span className="text-red-400 flex items-center gap-1">
                        <AlertCircle className="h-3.5 w-3.5" /> Failed
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Runner Controls */}
        <div className="flex items-center justify-between pt-2 border-t border-zinc-800">
          {!isFinished ? (
            <>
              <button
                type="button"
                onClick={onCancel}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs font-semibold text-red-400 hover:bg-zinc-800 transition-colors"
              >
                <Square className="h-3.5 w-3.5" />
                <span>Abort Dispatch</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsPaused(!isPaused)}
                  className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-white transition-colors"
                >
                  {isPaused ? <Play className="h-3.5 w-3.5" /> : <Pause className="h-3.5 w-3.5" />}
                  <span>{isPaused ? 'Resume Send' : 'Pause'}</span>
                </button>
              </div>
            </>
          ) : (
            <div className="w-full flex items-center justify-between">
              <div className="text-xs text-green-400 font-mono flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4" />
                <span>All {recipients.length} messages processed successfully.</span>
              </div>
              <button
                type="button"
                onClick={() => onFinish(completedLogs)}
                className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-green-600 hover:bg-green-500 text-xs font-bold text-white transition-colors shadow-lg shadow-green-600/25"
              >
                <span>View Updated Insights</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
