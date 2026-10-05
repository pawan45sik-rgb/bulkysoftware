import React from 'react';
import { Smartphone, Monitor, Send, BarChart3, Users, Clock, Camera, QrCode } from 'lucide-react';
import { WhatsAppAccount } from '../types';

export type NavTab = 'insights' | 'composer' | 'contacts' | 'scheduled' | 'accounts';

interface TopNavProps {
  currentTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  isMobileDeviceFrame: boolean;
  onToggleDeviceFrame: () => void;
  activeAccount: WhatsAppAccount;
  scheduledCount: number;
  onOpenScanner?: () => void;
  onOpenGenerator?: () => void;
}

export function TopNav({
  currentTab,
  onTabChange,
  isMobileDeviceFrame,
  onToggleDeviceFrame,
  activeAccount,
  scheduledCount,
  onOpenScanner,
  onOpenGenerator,
}: TopNavProps) {
  return (
    <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b border-zinc-800 bg-zinc-950 px-4 md:px-6">
      {/* Zone 1: Single text element wordmark (Frontend Constitution compliant) */}
      <div 
        onClick={() => onTabChange('insights')}
        className="cursor-pointer text-lg font-bold tracking-tight text-white select-none hover:text-green-400 transition-colors whitespace-nowrap"
      >
        WhatsApp Campaign Hub
      </div>

      {/* Zone 2: 4-5 clean text navigation links */}
      <nav className="hidden md:flex items-center gap-6 lg:gap-7 text-sm font-medium">
        <button
          type="button"
          onClick={() => onTabChange('insights')}
          className={`transition-colors pb-0.5 ${
            currentTab === 'insights'
              ? 'text-green-400 font-semibold border-b-2 border-green-500'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          Insights
        </button>

        <button
          type="button"
          onClick={() => onTabChange('composer')}
          className={`transition-colors pb-0.5 ${
            currentTab === 'composer'
              ? 'text-green-400 font-semibold border-b-2 border-green-500'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          Composer
        </button>

        <button
          type="button"
          onClick={() => onTabChange('contacts')}
          className={`transition-colors pb-0.5 ${
            currentTab === 'contacts'
              ? 'text-green-400 font-semibold border-b-2 border-green-500'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          Audience
        </button>

        <button
          type="button"
          onClick={() => onTabChange('scheduled')}
          className={`transition-colors pb-0.5 flex items-center gap-1.5 ${
            currentTab === 'scheduled'
              ? 'text-green-400 font-semibold border-b-2 border-green-500'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <span>Scheduled</span>
          {scheduledCount > 0 && (
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-red-950 text-red-400 border border-red-800">
              {scheduledCount}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => onTabChange('accounts')}
          className={`transition-colors pb-0.5 ${
            currentTab === 'accounts'
              ? 'text-green-400 font-semibold border-b-2 border-green-500'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          Accounts
        </button>
      </nav>

      {/* Zone 3: 1-2 primary actions */}
      <div className="flex items-center gap-2 sm:gap-2.5">
        {/* QR Scanner trigger */}
        {onOpenScanner && (
          <button
            type="button"
            onClick={onOpenScanner}
            className="flex items-center gap-1.5 rounded-xl border border-zinc-800 bg-zinc-900 px-2.5 sm:px-3 py-1.5 text-xs font-medium text-zinc-300 hover:border-zinc-700 hover:text-white transition-colors"
            title="Scan QR Code with Google Chrome Camera"
          >
            <Camera className="h-3.5 w-3.5 text-green-400" />
            <span className="hidden sm:inline">Scan QR</span>
          </button>
        )}

        {/* QR Generator trigger */}
        {onOpenGenerator && (
          <button
            type="button"
            onClick={onOpenGenerator}
            className="flex items-center gap-1.5 rounded-xl border border-zinc-800 bg-zinc-900 px-2.5 sm:px-3 py-1.5 text-xs font-medium text-zinc-300 hover:border-zinc-700 hover:text-white transition-colors"
            title="Generate WhatsApp QR Codes"
          >
            <QrCode className="h-3.5 w-3.5 text-green-400" />
            <span className="hidden sm:inline">Generate QR</span>
          </button>
        )}

        {/* Mobile / Desktop frame viewport switcher */}
        <button
          type="button"
          onClick={onToggleDeviceFrame}
          className="flex items-center gap-1.5 rounded-xl border border-zinc-800 bg-zinc-900 px-2.5 sm:px-3 py-1.5 text-xs font-medium text-zinc-300 hover:border-zinc-700 hover:text-white transition-colors"
          title={isMobileDeviceFrame ? "Switch to Wide Desktop View" : "Simulate Mobile Device Frame"}
        >
          {isMobileDeviceFrame ? (
            <>
              <Monitor className="h-3.5 w-3.5 text-green-400" />
              <span className="hidden md:inline">Desktop</span>
            </>
          ) : (
            <>
              <Smartphone className="h-3.5 w-3.5 text-green-400" />
              <span className="hidden md:inline">Mobile</span>
            </>
          )}
        </button>

        <button
          type="button"
          onClick={() => onTabChange('composer')}
          className="flex items-center gap-1.5 rounded-xl bg-green-600 px-3 sm:px-3.5 py-1.5 text-xs font-bold text-white hover:bg-green-500 transition-colors shadow-sm shadow-green-600/30 whitespace-nowrap"
        >
          <Send className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">New Broadcast</span>
        </button>
      </div>
    </header>
  );
}
