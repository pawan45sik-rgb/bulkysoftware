import React, { useState } from 'react';
import { TopNav, NavTab } from './components/TopNav';
import { InsightsView } from './components/InsightsView';
import { CampaignComposer } from './components/CampaignComposer';
import { ContactsManager } from './components/ContactsManager';
import { AccountsManager } from './components/AccountsManager';
import { ScheduledCampaignsView } from './components/ScheduledCampaignsView';
import { ActiveCampaignRunner } from './components/ActiveCampaignRunner';
import { MediaPreviewModal } from './components/MediaPreviewModal';
import { QRScannerModal } from './components/QRScannerModal';
import { QRGeneratorModal } from './components/QRGeneratorModal';
import { 
  WhatsAppAccount, 
  Contact, 
  MediaFile, 
  Campaign, 
  DeliveryLogItem 
} from './types';
import { 
  INITIAL_ACCOUNTS, 
  INITIAL_CONTACTS, 
  INITIAL_DELIVERY_LOGS,
  SAMPLE_MEDIA_FILES 
} from './data/mockData';
import { BarChart3, Send, Users, Clock, Smartphone, CheckCircle2, Camera, QrCode } from 'lucide-react';

export default function App() {
  const [currentTab, setCurrentTab] = useState<NavTab>('insights');
  const [isMobileDeviceFrame, setIsMobileDeviceFrame] = useState<boolean>(false);

  // Core state
  const [accounts, setAccounts] = useState<WhatsAppAccount[]>(INITIAL_ACCOUNTS);
  const [selectedAccountId, setSelectedAccountId] = useState<string>(INITIAL_ACCOUNTS[0].id);
  const [contacts, setContacts] = useState<Contact[]>(INITIAL_CONTACTS);
  const [deliveryLogs, setDeliveryLogs] = useState<DeliveryLogItem[]>(INITIAL_DELIVERY_LOGS);

  // Scheduled & Active campaigns
  const [campaigns, setCampaigns] = useState<Campaign[]>([
    {
      id: 'cmp_sch_1',
      title: 'Q4 Enterprise Demo Invitations',
      accountId: 'acc_1',
      recipientCount: 18,
      sentCount: 0,
      deliveredCount: 0,
      failedCount: 0,
      scheduledAt: new Date(Date.now() + 3600 * 1000 * 14).toISOString(),
      status: 'scheduled',
      messageTemplate: 'Hi {name},\n\nWe have unlocked private beta access for {company}. Use your access code to book our engineering team.',
      mediaFile: SAMPLE_MEDIA_FILES[2], // PDF
      createdAt: new Date().toISOString(),
    }
  ]);

  // Live Runner State
  const [activeRunningPayload, setActiveRunningPayload] = useState<{
    campaignTitle: string;
    account: WhatsAppAccount;
    recipients: Contact[];
    messageTemplate: string;
    mediaFile: MediaFile | null;
  } | null>(null);

  // Full Screen Media Preview
  const [previewMedia, setPreviewMedia] = useState<MediaFile | null>(null);

  // QR Modals
  const [showQRScanner, setShowQRScanner] = useState<boolean>(false);
  const [showQRGenerator, setShowQRGenerator] = useState<boolean>(false);

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const activeAccount = accounts.find(a => a.id === selectedAccountId) || accounts[0];
  const scheduledCount = campaigns.filter(c => c.status === 'scheduled').length;

  // Handle scanned QR code result from Google Chrome camera or file
  const handleScanResult = (scannedData: string) => {
    // If it's a WhatsApp session pairing payload
    if (scannedData.startsWith('2@') || scannedData.includes('WAP7_') || scannedData.includes('AIStudioHub')) {
      const newLinkedAcc: WhatsAppAccount = {
        id: `acc_qr_${Date.now()}`,
        name: `Paired Node (${scannedData.slice(0, 10)}...)`,
        phoneNumber: '+1 (415) 555-8910',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        status: 'connected',
        dailyQuota: 800,
        sentToday: 0,
        batteryLevel: 96,
        lastActive: 'Just connected via QR',
      };
      setAccounts(prev => [newLinkedAcc, ...prev]);
      setSelectedAccountId(newLinkedAcc.id);
      showToast('WhatsApp device successfully authorized via QR code!');
      setCurrentTab('accounts');
      setShowQRScanner(false);
      return;
    }

    // If it's a wa.me chat link
    if (scannedData.includes('wa.me/')) {
      showToast(`Detected WhatsApp direct chat: ${scannedData}`);
      return;
    }

    showToast(`QR Code decoded: ${scannedData.slice(0, 45)}...`);
  };

  // Handlers
  const handleStartCampaign = (data: {
    title: string;
    accountId: string;
    recipients: Contact[];
    message: string;
    mediaFile: MediaFile | null;
    isScheduled: boolean;
    scheduledDate: Date | null;
  }) => {
    const sender = accounts.find(a => a.id === data.accountId) || activeAccount;

    if (data.isScheduled && data.scheduledDate) {
      const newScheduled: Campaign = {
        id: `cmp_${Date.now()}`,
        title: data.title,
        accountId: sender.id,
        recipientCount: data.recipients.length,
        sentCount: 0,
        deliveredCount: 0,
        failedCount: 0,
        scheduledAt: data.scheduledDate.toISOString(),
        status: 'scheduled',
        messageTemplate: data.message,
        mediaFile: data.mediaFile,
        createdAt: new Date().toISOString(),
      };
      setCampaigns(prev => [newScheduled, ...prev]);
      showToast(`Campaign scheduled for ${data.scheduledDate.toLocaleString()}`);
      setCurrentTab('scheduled');
    } else {
      // Immediate run
      setActiveRunningPayload({
        campaignTitle: data.title,
        account: sender,
        recipients: data.recipients,
        messageTemplate: data.message,
        mediaFile: data.mediaFile,
      });
    }
  };

  const handleFinishRunner = (newLogs: DeliveryLogItem[]) => {
    setDeliveryLogs(prev => [...newLogs, ...prev]);

    // Update account daily usage count
    setAccounts(prev => prev.map(acc => {
      if (acc.id === selectedAccountId) {
        return {
          ...acc,
          sentToday: acc.sentToday + newLogs.length,
          lastActive: 'Just now'
        };
      }
      return acc;
    }));

    setActiveRunningPayload(null);
    showToast(`Broadcast completed: ${newLogs.length} messages dispatched!`);
    setCurrentTab('insights');
  };

  const handleTriggerScheduledNow = (campaign: Campaign) => {
    const sender = accounts.find(a => a.id === campaign.accountId) || activeAccount;
    const recipients = contacts.slice(0, campaign.recipientCount);

    // Remove from scheduled
    setCampaigns(prev => prev.filter(c => c.id !== campaign.id));

    setActiveRunningPayload({
      campaignTitle: campaign.title,
      account: sender,
      recipients: recipients.length > 0 ? recipients : contacts.slice(0, 3),
      messageTemplate: campaign.messageTemplate,
      mediaFile: campaign.mediaFile || null,
    });
  };

  const handleCancelScheduled = (campaignId: string) => {
    setCampaigns(prev => prev.filter(c => c.id !== campaignId));
    showToast('Scheduled broadcast removed from queue');
  };

  const handleAddAccount = (newAcc: WhatsAppAccount) => {
    setAccounts(prev => [...prev, newAcc]);
    setSelectedAccountId(newAcc.id);
    showToast(`WhatsApp device linked: ${newAcc.name}`);
  };

  const handleAddContact = (contact: Contact) => {
    setContacts(prev => [contact, ...prev]);
    showToast(`Added ${contact.name} to audience`);
  };

  const handleImportContacts = (newContacts: Contact[]) => {
    setContacts(prev => [...newContacts, ...prev]);
    showToast(`Imported ${newContacts.length} contacts successfully`);
  };

  const handleDeleteContact = (id: string) => {
    setContacts(prev => prev.filter(c => c.id !== id));
    showToast('Contact removed');
  };

  const handleComposeToContacts = (selectedIds: string[]) => {
    setCurrentTab('composer');
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col font-sans selection:bg-green-500 selection:text-black">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 rounded-2xl bg-zinc-900 border border-green-500/50 px-5 py-3 text-xs font-semibold text-white shadow-2xl animate-fade-in">
          <CheckCircle2 className="h-4 w-4 text-green-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Global Media Preview Modal (Accessible from anywhere) */}
      <MediaPreviewModal
        visible={!!previewMedia}
        file={previewMedia}
        onClose={() => setPreviewMedia(null)}
      />

      {/* Google Chrome Live Camera QR Scanner Modal */}
      <QRScannerModal
        visible={showQRScanner}
        onClose={() => setShowQRScanner(false)}
        onScanResult={handleScanResult}
      />

      {/* Dynamic QR Code Generator Modal */}
      <QRGeneratorModal
        visible={showQRGenerator}
        onClose={() => setShowQRGenerator(false)}
        defaultPhone={activeAccount.phoneNumber}
      />

      {/* Live Campaign Runner Modal Overlay */}
      {activeRunningPayload && (
        <ActiveCampaignRunner
          campaignTitle={activeRunningPayload.campaignTitle}
          account={activeRunningPayload.account}
          recipients={activeRunningPayload.recipients}
          messageTemplate={activeRunningPayload.messageTemplate}
          mediaFile={activeRunningPayload.mediaFile}
          onFinish={handleFinishRunner}
          onCancel={() => {
            setActiveRunningPayload(null);
            showToast('Broadcast dispatch stopped.');
          }}
        />
      )}

      {/* Top Bar Navigation */}
      <TopNav
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        isMobileDeviceFrame={isMobileDeviceFrame}
        onToggleDeviceFrame={() => setIsMobileDeviceFrame(!isMobileDeviceFrame)}
        activeAccount={activeAccount}
        scheduledCount={scheduledCount}
        onOpenScanner={() => setShowQRScanner(true)}
        onOpenGenerator={() => setShowQRGenerator(true)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col justify-start">
        {isMobileDeviceFrame ? (
          /* Mobile Device Frame Simulation Container (Matching React Native code environment) */
          <div className="flex-1 flex items-center justify-center p-4 bg-zinc-950/90 py-6">
            <div className="w-full max-w-[420px] h-[840px] rounded-[44px] border-[8px] border-zinc-800 bg-black shadow-2xl flex flex-col overflow-hidden relative">
              {/* Dynamic Island / Speaker */}
              <div className="h-7 w-full bg-black flex items-center justify-between px-7 pt-2 shrink-0 z-20">
                <span className="text-[11px] font-mono text-zinc-400">9:41</span>
                <div className="h-4 w-28 bg-zinc-900 rounded-full mx-auto"></div>
                <div className="flex items-center gap-1 text-[10px] text-zinc-400 font-mono">
                  <span>100%</span>
                </div>
              </div>

              {/* Scrollable Mobile Viewport */}
              <div className="flex-1 overflow-y-auto flex flex-col scrollbar-none">
                {currentTab === 'insights' && (
                  <InsightsView
                    accounts={accounts}
                    onComposeClick={() => setCurrentTab('composer')}
                    onViewScheduled={() => setCurrentTab('scheduled')}
                    deliveryLogs={deliveryLogs}
                    logs={deliveryLogs}
                  />
                )}
                {currentTab === 'composer' && (
                  <CampaignComposer
                    accounts={accounts}
                    selectedAccountId={selectedAccountId}
                    onSelectAccount={setSelectedAccountId}
                    contacts={contacts}
                    onStartCampaign={handleStartCampaign}
                  />
                )}
                {currentTab === 'contacts' && (
                  <ContactsManager
                    contacts={contacts}
                    onAddContact={handleAddContact}
                    onImportContacts={handleImportContacts}
                    onDeleteContact={handleDeleteContact}
                    onComposeToContacts={handleComposeToContacts}
                  />
                )}
                {currentTab === 'scheduled' && (
                  <ScheduledCampaignsView
                    campaigns={campaigns}
                    accounts={accounts}
                    onTriggerNow={handleTriggerScheduledNow}
                    onCancelCampaign={handleCancelScheduled}
                    onNewCampaign={() => setCurrentTab('composer')}
                    onPreviewMedia={setPreviewMedia}
                  />
                )}
                {currentTab === 'accounts' && (
                  <AccountsManager
                    accounts={accounts}
                    selectedAccountId={selectedAccountId}
                    onSelectAccount={setSelectedAccountId}
                    onAddAccount={handleAddAccount}
                    onOpenScanner={() => setShowQRScanner(true)}
                    onOpenGenerator={() => setShowQRGenerator(true)}
                  />
                )}
              </div>

              {/* Mobile Bottom Tab Bar (React Native style) */}
              <nav className="h-16 bg-zinc-950 border-t border-zinc-800/80 flex items-center justify-around px-2 shrink-0 z-20">
                <button
                  type="button"
                  onClick={() => setCurrentTab('insights')}
                  className={`flex flex-col items-center gap-1 text-[10px] font-medium transition-colors ${
                    currentTab === 'insights' ? 'text-green-500 font-bold' : 'text-zinc-500'
                  }`}
                >
                  <BarChart3 className="h-4 w-4" />
                  <span>Insights</span>
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentTab('composer')}
                  className={`flex flex-col items-center gap-1 text-[10px] font-medium transition-colors ${
                    currentTab === 'composer' ? 'text-green-500 font-bold' : 'text-zinc-500'
                  }`}
                >
                  <Send className="h-4 w-4" />
                  <span>Composer</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowQRScanner(true)}
                  className="flex flex-col items-center gap-1 text-[10px] font-medium text-green-400 hover:text-green-300 transition-colors"
                >
                  <Camera className="h-4 w-4" />
                  <span>Scan</span>
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentTab('contacts')}
                  className={`flex flex-col items-center gap-1 text-[10px] font-medium transition-colors ${
                    currentTab === 'contacts' ? 'text-green-500 font-bold' : 'text-zinc-500'
                  }`}
                >
                  <Users className="h-4 w-4" />
                  <span>Audience</span>
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentTab('accounts')}
                  className={`flex flex-col items-center gap-1 text-[10px] font-medium transition-colors ${
                    currentTab === 'accounts' ? 'text-green-500 font-bold' : 'text-zinc-500'
                  }`}
                >
                  <Smartphone className="h-4 w-4" />
                  <span>Accounts</span>
                </button>
              </nav>

              {/* Bottom Home Indicator */}
              <div className="h-4 w-full bg-zinc-950 flex items-center justify-center pb-1">
                <div className="h-1 w-32 bg-zinc-700 rounded-full"></div>
              </div>
            </div>
          </div>
        ) : (
          /* Desktop Wide SaaS Viewport */
          <div className="flex-1 flex flex-col">
            {currentTab === 'insights' && (
              <InsightsView
                accounts={accounts}
                onComposeClick={() => setCurrentTab('composer')}
                onViewScheduled={() => setCurrentTab('scheduled')}
                deliveryLogs={deliveryLogs}
                logs={deliveryLogs}
              />
            )}
            {currentTab === 'composer' && (
              <CampaignComposer
                accounts={accounts}
                selectedAccountId={selectedAccountId}
                onSelectAccount={setSelectedAccountId}
                contacts={contacts}
                onStartCampaign={handleStartCampaign}
              />
            )}
            {currentTab === 'contacts' && (
              <ContactsManager
                contacts={contacts}
                onAddContact={handleAddContact}
                onImportContacts={handleImportContacts}
                onDeleteContact={handleDeleteContact}
                onComposeToContacts={handleComposeToContacts}
              />
            )}
            {currentTab === 'scheduled' && (
              <ScheduledCampaignsView
                campaigns={campaigns}
                accounts={accounts}
                onTriggerNow={handleTriggerScheduledNow}
                onCancelCampaign={handleCancelScheduled}
                onNewCampaign={() => setCurrentTab('composer')}
                onPreviewMedia={setPreviewMedia}
              />
            )}
            {currentTab === 'accounts' && (
              <AccountsManager
                accounts={accounts}
                selectedAccountId={selectedAccountId}
                onSelectAccount={setSelectedAccountId}
                onAddAccount={handleAddAccount}
                onOpenScanner={() => setShowQRScanner(true)}
                onOpenGenerator={() => setShowQRGenerator(true)}
              />
            )}
          </div>
        )}
      </div>

    </div>
  );
}
