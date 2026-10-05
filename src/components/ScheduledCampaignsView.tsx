import React from 'react';
import { 
  Clock, 
  Calendar, 
  Send, 
  Trash2, 
  CheckCircle2, 
  FileText, 
  Image as ImageIcon, 
  Film, 
  AlertCircle,
  Play,
  ArrowRight
} from 'lucide-react';
import { Campaign, WhatsAppAccount, MediaFile } from '../types';

interface ScheduledCampaignsViewProps {
  campaigns: Campaign[];
  accounts: WhatsAppAccount[];
  onTriggerNow: (campaign: Campaign) => void;
  onCancelCampaign: (campaignId: string) => void;
  onNewCampaign: () => void;
  onPreviewMedia: (file: MediaFile) => void;
}

export function ScheduledCampaignsView({
  campaigns,
  accounts,
  onTriggerNow,
  onCancelCampaign,
  onNewCampaign,
  onPreviewMedia,
}: ScheduledCampaignsViewProps) {
  const scheduledList = campaigns.filter(c => c.status === 'scheduled');

  const getAccount = (accId: string) => accounts.find(a => a.id === accId) || accounts[0];

  return (
    <div className="flex-1 bg-black text-white p-4 md:p-8 overflow-y-auto">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-zinc-400 mb-1">
              <span>AUTOMATION CRON</span>
              <span>·</span>
              <span className="text-red-400 font-semibold">{scheduledList.length} In Queue</span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-white">Scheduled Dispatches</h1>
          </div>

          <button
            type="button"
            onClick={onNewCampaign}
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-green-600 hover:bg-green-500 text-white font-bold text-xs shadow-lg shadow-green-600/25 transition-colors"
          >
            <Send className="h-3.5 w-3.5" />
            <span>Schedule New Send</span>
          </button>
        </div>

        {/* Campaign List */}
        {scheduledList.length === 0 ? (
          <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-12 text-center space-y-4">
            <div className="h-16 w-16 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto text-zinc-600">
              <Clock className="h-8 w-8" />
            </div>
            <h3 className="text-lg font-bold text-white">No Scheduled Broadcasts in Queue</h3>
            <p className="text-xs text-zinc-400 max-w-sm mx-auto">
              When you toggle "Schedule this send" in the Broadcast Composer, your campaign and anti-ban delay configuration will wait here.
            </p>
            <button
              type="button"
              onClick={onNewCampaign}
              className="px-5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-white transition-colors"
            >
              Compose Broadcast
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {scheduledList.map(campaign => {
              const acc = getAccount(campaign.accountId);
              return (
                <div
                  key={campaign.id}
                  className="rounded-3xl border border-zinc-800 bg-zinc-900/80 p-6 transition-colors hover:border-zinc-700 space-y-4 shadow-sm"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-2xl bg-red-950/60 border border-red-800/60 flex items-center justify-center text-red-400">
                        <Clock className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-white">{campaign.title}</h3>
                        <p className="text-xs text-zinc-400 font-mono">
                          Sender Line: <strong className="text-zinc-200">{acc.name}</strong> ({acc.phoneNumber})
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => onTriggerNow(campaign)}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-green-600 hover:bg-green-500 text-white font-bold text-xs shadow-md shadow-green-600/20 transition-colors"
                      >
                        <Play className="h-3.5 w-3.5 fill-current" />
                        <span>Trigger Now</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => onCancelCampaign(campaign.id)}
                        className="p-2 rounded-xl text-zinc-400 hover:text-red-400 hover:bg-zinc-800 transition-colors"
                        title="Cancel Scheduled Broadcast"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* Scheduled Date Highlight Box */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="p-3.5 rounded-2xl bg-zinc-950 border border-zinc-800/80">
                      <span className="text-[10px] uppercase font-mono text-zinc-500 block">Run at Scheduled Time</span>
                      <span className="text-red-400 font-bold font-mono text-sm block mt-0.5">
                        {campaign.scheduledAt ? new Date(campaign.scheduledAt).toLocaleString() : 'Pending'}
                      </span>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-zinc-950 border border-zinc-800/80">
                      <span className="text-[10px] uppercase font-mono text-zinc-500 block">Target Audience</span>
                      <span className="text-white font-bold font-mono text-sm block mt-0.5">
                        {campaign.recipientCount} Recipients
                      </span>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-zinc-950 border border-zinc-800/80">
                      <span className="text-[10px] uppercase font-mono text-zinc-500 block">Attachment Payload</span>
                      {campaign.mediaFile ? (
                        <div 
                          onClick={() => onPreviewMedia(campaign.mediaFile!)}
                          className="cursor-pointer text-green-400 hover:text-green-300 font-medium text-xs flex items-center gap-1 mt-1 truncate"
                        >
                          {campaign.mediaFile.type === 'image' && <ImageIcon className="h-3.5 w-3.5" />}
                          {campaign.mediaFile.type === 'video' && <Film className="h-3.5 w-3.5" />}
                          {campaign.mediaFile.type === 'pdf' && <FileText className="h-3.5 w-3.5" />}
                          <span className="truncate">{campaign.mediaFile.name} (Preview)</span>
                        </div>
                      ) : (
                        <span className="text-zinc-500 text-xs block mt-1">Plain Text Only</span>
                      )}
                    </div>
                  </div>

                  {/* Message body preview */}
                  <div className="p-3 rounded-2xl bg-zinc-950/60 border border-zinc-800/60 text-xs text-zinc-300 font-mono line-clamp-2">
                    {campaign.messageTemplate}
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
}
