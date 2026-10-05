import React, { useState } from 'react';
import { 
  Paperclip, 
  Send, 
  Calendar, 
  Clock, 
  Smartphone, 
  Image as ImageIcon, 
  Film, 
  FileText, 
  Trash2, 
  Eye, 
  Check, 
  Users, 
  ChevronDown, 
  Sparkles,
  Info,
  CheckCheck,
  AlertTriangle
} from 'lucide-react';
import { WhatsAppAccount, Contact, MediaFile } from '../types';
import { SAMPLE_MEDIA_FILES } from '../data/mockData';
import { MediaPreviewModal } from './MediaPreviewModal';

interface CampaignComposerProps {
  accounts: WhatsAppAccount[];
  selectedAccountId: string;
  onSelectAccount: (id: string) => void;
  contacts: Contact[];
  onStartCampaign: (campaignData: {
    title: string;
    accountId: string;
    recipients: Contact[];
    message: string;
    mediaFile: MediaFile | null;
    isScheduled: boolean;
    scheduledDate: Date | null;
  }) => void;
}

export function CampaignComposer({
  accounts,
  selectedAccountId,
  onSelectAccount,
  contacts,
  onStartCampaign,
}: CampaignComposerProps) {
  // Campaign State
  const [campaignTitle, setCampaignTitle] = useState('VIP Autumn Promotion Broadcast');
  const [message, setMessage] = useState(
    'Hi {name},\n\nWe have prepared an exclusive update for {company}. Use your personalized code for {offer} valid until the end of this week.\n\nReply directly to this message to claim your priority activation!\n\nBest regards,\nCustomer Success Team'
  );

  // Selected Audience State
  const [selectedTag, setSelectedTag] = useState<string>('All');
  const [selectedContactIds, setSelectedContactIds] = useState<string[]>(contacts.map(c => c.id));

  // Attached Media State
  const [attachedMedia, setAttachedMedia] = useState<MediaFile | null>(SAMPLE_MEDIA_FILES[0]);
  const [previewMediaFile, setPreviewMediaFile] = useState<MediaFile | null>(null);
  const [showMediaPicker, setShowMediaPicker] = useState<boolean>(false);

  // Auto Send / Schedule Logic (Direct implementation of user's requirements)
  const [isScheduled, setIsScheduled] = useState<boolean>(false);
  const [scheduledDate, setScheduledDate] = useState<Date>(() => {
    const d = new Date();
    d.setHours(d.getHours() + 2);
    d.setMinutes(0);
    return d;
  });
  const [showCustomDatePicker, setShowCustomDatePicker] = useState<boolean>(false);

  // Active account
  const activeAccount = accounts.find(a => a.id === selectedAccountId) || accounts[0];

  // Recipient selection
  const filteredContacts = contacts.filter(c => {
    if (selectedTag === 'All') return true;
    return c.tags.includes(selectedTag);
  });

  const availableTags = ['All', ...Array.from(new Set(contacts.flatMap(c => c.tags)))];

  const handleToggleSelectAll = () => {
    if (selectedContactIds.length === filteredContacts.length) {
      setSelectedContactIds([]);
    } else {
      setSelectedContactIds(filteredContacts.map(c => c.id));
    }
  };

  const handleToggleContact = (id: string) => {
    setSelectedContactIds(prev => 
      prev.includes(id) ? prev.filter(cId => cId !== id) : [...prev, id]
    );
  };

  // Insert template tag into message
  const insertTag = (tag: string) => {
    setMessage(prev => prev + ` ${tag} `);
  };

  // Custom media upload simulation
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    let mediaType: 'image' | 'video' | 'pdf' = 'image';
    if (file.type.includes('video')) mediaType = 'video';
    else if (file.type.includes('pdf')) mediaType = 'pdf';

    const newMedia: MediaFile = {
      id: `upload_${Date.now()}`,
      name: file.name,
      type: mediaType,
      mimeType: file.type || 'application/octet-stream',
      size: file.size,
      uri: URL.createObjectURL(file),
      pageCount: mediaType === 'pdf' ? 4 : undefined,
      duration: mediaType === 'video' ? '0:45' : undefined,
    };

    setAttachedMedia(newMedia);
    setShowMediaPicker(false);
  };

  // Preview formatting for phone screen
  const sampleContact = contacts[0] || {
    name: 'Sophia Martinez',
    company: 'Apex Logistics',
    offer: '25% Early Bird Discount',
  };

  const formattedPreviewMessage = message
    .replace(/{name}/g, sampleContact.name)
    .replace(/{company}/g, sampleContact.company)
    .replace(/{offer}/g, sampleContact.offer)
    .replace(/{due_date}/g, 'Friday at 6:00 PM');

  const selectedRecipients = contacts.filter(c => selectedContactIds.includes(c.id));

  // Quick schedule presets
  const handleSetPresetDate = (hoursFromNow: number) => {
    const target = new Date();
    target.setHours(target.getHours() + hoursFromNow);
    setScheduledDate(target);
    setShowCustomDatePicker(false);
  };

  const handleSetTomorrowMorning = () => {
    const target = new Date();
    target.setDate(target.getDate() + 1);
    target.setHours(9, 0, 0, 0);
    setScheduledDate(target);
    setShowCustomDatePicker(false);
  };

  const handleLaunch = () => {
    if (selectedRecipients.length === 0) {
      alert('Please select at least one recipient contact.');
      return;
    }
    if (!message.trim()) {
      alert('Please provide a message body.');
      return;
    }

    onStartCampaign({
      title: campaignTitle || 'Broadcast Campaign',
      accountId: activeAccount.id,
      recipients: selectedRecipients,
      message,
      mediaFile: attachedMedia,
      isScheduled,
      scheduledDate: isScheduled ? scheduledDate : null,
    });
  };

  return (
    <div className="flex-1 bg-black text-white p-4 md:p-8 overflow-y-auto">
      {/* Full-Screen Media Preview Modal */}
      <MediaPreviewModal
        visible={!!previewMediaFile}
        file={previewMediaFile}
        onClose={() => setPreviewMediaFile(null)}
      />

      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-zinc-400 mb-1">
              <span>CAMPAIGN DISPATCH ENGINE</span>
              <span>·</span>
              <span className="text-green-500 font-semibold">WHATSAPP CLOUD PROTOCOL</span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-white">Broadcast Composer</h1>
          </div>

          {/* Sender Account Switcher */}
          <div className="flex items-center gap-3">
            <span className="text-xs text-zinc-400 font-medium">Sending From:</span>
            <div className="relative">
              <select
                value={selectedAccountId}
                onChange={e => onSelectAccount(e.target.value)}
                className="appearance-none bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2 pr-9 text-xs font-semibold text-white focus:outline-none focus:border-green-500 hover:border-zinc-700 transition-colors cursor-pointer"
              >
                {accounts.map(acc => (
                  <option key={acc.id} value={acc.id}>
                    {acc.name} ({acc.phoneNumber})
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-2.5 h-3.5 w-3.5 pointer-events-none text-zinc-400" />
            </div>
          </div>
        </div>

        {/* 2-Column Layout: Left Composer Form, Right WhatsApp Phone Mockup */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Form: 7 cols */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Campaign Title Input */}
            <div className="bg-zinc-900/80 rounded-2xl p-5 border border-zinc-800">
              <label className="block text-xs uppercase font-mono tracking-wider text-zinc-400 mb-2">
                Campaign Identifier
              </label>
              <input
                type="text"
                value={campaignTitle}
                onChange={e => setCampaignTitle(e.target.value)}
                placeholder="e.g. VIP Fall Product Drop"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-green-500"
              />
            </div>

            {/* Recipient Audience Selection */}
            <div className="bg-zinc-900/80 rounded-2xl p-5 border border-zinc-800">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-green-500" />
                  <span className="text-xs uppercase font-mono tracking-wider text-zinc-400">
                    Target Contacts ({selectedRecipients.length} Selected)
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleToggleSelectAll}
                  className="text-xs font-semibold text-green-400 hover:text-green-300 transition-colors"
                >
                  {selectedContactIds.length === filteredContacts.length ? 'Deselect All' : 'Select All Filtered'}
                </button>
              </div>

              {/* Tag Filter Chips */}
              <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-3 scrollbar-none">
                {availableTags.map(tag => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => setSelectedTag(tag)}
                    className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                      selectedTag === tag
                        ? 'bg-zinc-800 text-white border border-zinc-700'
                        : 'bg-zinc-950 text-zinc-400 border border-zinc-800/80 hover:text-zinc-200'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>

              {/* Scrollable Mini Contact Checklist */}
              <div className="max-h-36 overflow-y-auto rounded-xl bg-zinc-950 border border-zinc-800/80 p-2 divide-y divide-zinc-900">
                {filteredContacts.map(c => {
                  const isChecked = selectedContactIds.includes(c.id);
                  return (
                    <label
                      key={c.id}
                      className="flex items-center justify-between px-3 py-1.5 hover:bg-zinc-900/50 rounded-lg cursor-pointer text-xs"
                    >
                      <div className="flex items-center gap-2.5">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleToggleContact(c.id)}
                          className="h-3.5 w-3.5 rounded border-zinc-700 bg-zinc-800 text-green-600 focus:ring-0 focus:ring-offset-0"
                        />
                        <span className="font-medium text-zinc-200">{c.name}</span>
                        <span className="text-zinc-500 font-mono text-[11px]">{c.phone}</span>
                      </div>
                      <span className="text-[11px] text-zinc-400">{c.company}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Message Body & Variable Injectors */}
            <div className="bg-zinc-900/80 rounded-2xl p-5 border border-zinc-800">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                <label className="text-xs uppercase font-mono tracking-wider text-zinc-400">
                  Message Content & Variables
                </label>
                
                {/* Template Chips for Quick Insert */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[11px] text-zinc-500">Insert tag:</span>
                  {['{name}', '{company}', '{offer}', '{due_date}'].map(tag => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => insertTag(tag)}
                      className="px-2 py-0.5 rounded-md bg-zinc-800 hover:bg-green-600/30 hover:border-green-500 border border-zinc-700 text-xs font-mono text-zinc-300 transition-colors"
                      title={`Click to insert ${tag}`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              <textarea
                rows={7}
                value={message}
                onChange={e => setMessage(e.target.value)}
                placeholder="Type your WhatsApp message here. Use {name} to personalize..."
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-4 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-green-500 resize-y font-sans leading-relaxed"
              />

              <div className="mt-2 flex items-center justify-between text-xs text-zinc-500 font-mono">
                <span>{message.length} characters</span>
                <span>~{Math.ceil(message.length / 160)} SMS segments</span>
              </div>
            </div>

            {/* Media Attachment Section */}
            <div className="bg-zinc-900/80 rounded-2xl p-5 border border-zinc-800">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Paperclip className="h-4 w-4 text-green-500" />
                  <span className="text-xs uppercase font-mono tracking-wider text-zinc-400">
                    Media Attachment
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowMediaPicker(!showMediaPicker)}
                    className="text-xs font-semibold text-zinc-300 hover:text-white transition-colors"
                  >
                    {showMediaPicker ? 'Hide Options' : 'Select from Library'}
                  </button>
                </div>
              </div>

              {/* Currently Attached Media Banner */}
              {attachedMedia ? (
                <div className="flex items-center justify-between rounded-xl bg-zinc-950 border border-zinc-800 p-3">
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Media Type Icon */}
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-zinc-900 text-green-400 border border-zinc-800">
                      {attachedMedia.type === 'image' && <ImageIcon className="h-5 w-5" />}
                      {attachedMedia.type === 'video' && <Film className="h-5 w-5" />}
                      {attachedMedia.type === 'pdf' && <FileText className="h-5 w-5" />}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="truncate text-xs font-semibold text-white max-w-[200px] sm:max-w-xs">
                          {attachedMedia.name}
                        </span>
                        <span className="text-[10px] font-mono text-zinc-400">
                          ({(attachedMedia.size / 1024).toFixed(0)} KB)
                        </span>
                      </div>
                      <span className="text-[11px] text-green-400 font-mono">
                        Ready to send · Tap "Inspect Preview" to verify full screen
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {/* Full-Screen Media Preview Trigger Button */}
                    <button
                      type="button"
                      onClick={() => setPreviewMediaFile(attachedMedia)}
                      className="flex items-center gap-1.5 rounded-lg bg-zinc-900 border border-zinc-700 px-3 py-1.5 text-xs font-semibold text-zinc-200 hover:bg-zinc-800 hover:text-white transition-colors"
                    >
                      <Eye className="h-3.5 w-3.5 text-green-400" />
                      <span>Inspect Preview</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setAttachedMedia(null)}
                      className="p-1.5 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-zinc-900 transition-colors"
                      title="Remove Attachment"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-zinc-800 p-4 text-center">
                  <p className="text-xs text-zinc-400 mb-2">No media file attached to this message.</p>
                  <button
                    type="button"
                    onClick={() => setShowMediaPicker(true)}
                    className="text-xs font-semibold text-green-400 hover:underline"
                  >
                    + Attach Flyer, Demo Video, or PDF
                  </button>
                </div>
              )}

              {/* Sample Media Picker Drawer */}
              {showMediaPicker && (
                <div className="mt-4 pt-4 border-t border-zinc-800 space-y-3">
                  <span className="text-[11px] text-zinc-400 block font-medium">Choose from verified sample media or upload:</span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {SAMPLE_MEDIA_FILES.map(file => (
                      <div
                        key={file.id}
                        onClick={() => {
                          setAttachedMedia(file);
                          setShowMediaPicker(false);
                        }}
                        className={`cursor-pointer p-3 rounded-xl border text-left transition-colors ${
                          attachedMedia?.id === file.id
                            ? 'bg-zinc-800/90 border-green-500'
                            : 'bg-zinc-950 border-zinc-800 hover:border-zinc-700'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-semibold text-zinc-200 uppercase font-mono">{file.type}</span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setPreviewMediaFile(file);
                            }}
                            className="text-zinc-400 hover:text-green-400"
                            title="Preview file"
                          >
                            <Eye className="h-3 w-3" />
                          </button>
                        </div>
                        <p className="text-xs text-zinc-300 truncate">{file.name}</p>
                        <span className="text-[10px] text-zinc-500 font-mono">{(file.size / 1024).toFixed(0)} KB</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-950 border border-zinc-800 text-xs text-zinc-300 hover:text-white hover:border-zinc-700 transition-colors">
                      <Paperclip className="h-3 w-3 text-zinc-400" />
                      <span>Upload Custom File from Computer</span>
                      <input
                        type="file"
                        accept="image/*,video/*,application/pdf"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              )}
            </div>

            {/* Implementing the "Auto Send" Logic (Direct Match to User Spec) */}
            <div className="bg-zinc-900/80 rounded-2xl p-5 border border-zinc-800">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Clock className="h-4 w-4 text-green-500" />
                    <span>Auto Send Scheduler</span>
                  </h3>
                  <p className="text-xs text-zinc-400">Queue message to dispatch automatically at a designated time</p>
                </div>

                {/* Switch for "Schedule this send" */}
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isScheduled}
                    onChange={e => setIsScheduled(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                </label>
              </div>

              {/* Inside the JSX, after the Switch (User Spec Implementation) */}
              {isScheduled && (
                <div className="space-y-3 pt-2 border-t border-zinc-800/80">
                  <div 
                    onClick={() => setShowCustomDatePicker(!showCustomDatePicker)}
                    className="cursor-pointer bg-zinc-950 p-4 rounded-2xl border border-zinc-800 hover:border-zinc-700 transition-colors flex items-center justify-between"
                  >
                    <div>
                      <span className="text-zinc-400 text-xs uppercase font-mono block mb-1">Run at:</span>
                      <span className="text-green-500 text-lg font-bold font-mono">
                        {scheduledDate.toLocaleString()}
                      </span>
                    </div>
                    <Calendar className="h-5 w-5 text-zinc-500" />
                  </div>

                  {/* Preset Buttons */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs text-zinc-500">Quick set:</span>
                    <button
                      type="button"
                      onClick={() => handleSetPresetDate(1)}
                      className="px-2.5 py-1 rounded-lg bg-zinc-950 border border-zinc-800 text-xs text-zinc-300 hover:text-white hover:border-zinc-700"
                    >
                      In 1 hour
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSetPresetDate(3)}
                      className="px-2.5 py-1 rounded-lg bg-zinc-950 border border-zinc-800 text-xs text-zinc-300 hover:text-white hover:border-zinc-700"
                    >
                      In 3 hours
                    </button>
                    <button
                      type="button"
                      onClick={handleSetTomorrowMorning}
                      className="px-2.5 py-1 rounded-lg bg-zinc-950 border border-zinc-800 text-xs text-zinc-300 hover:text-white hover:border-zinc-700"
                    >
                      Tomorrow 09:00
                    </button>
                  </div>

                  {/* Date Time Picker Form */}
                  {showCustomDatePicker && (
                    <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-3">
                      <div className="flex items-center justify-between text-xs text-zinc-400 mb-1">
                        <span>Select Date & Time:</span>
                      </div>
                      <input
                        type="datetime-local"
                        value={new Date(scheduledDate.getTime() - (scheduledDate.getTimezoneOffset() * 60000)).toISOString().slice(0, 16)}
                        onChange={(e) => {
                          if (e.target.value) {
                            setScheduledDate(new Date(e.target.value));
                          }
                        }}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-green-500 font-mono"
                      />
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Launch Campaign Action Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleLaunch}
                className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-green-600 hover:bg-green-500 text-white font-bold text-base shadow-xl shadow-green-600/25 transition-all active:scale-[0.99]"
              >
                {isScheduled ? (
                  <>
                    <Calendar className="h-5 w-5" />
                    <span>Schedule Broadcast ({selectedRecipients.length} Contacts)</span>
                  </>
                ) : (
                  <>
                    <Send className="h-5 w-5" />
                    <span>Send Broadcast Now ({selectedRecipients.length} Contacts)</span>
                  </>
                )}
              </button>
            </div>

          </div>

          {/* Right Column: WhatsApp Phone Simulation Mockup (5 cols) */}
          <div className="lg:col-span-5 sticky top-8">
            <div className="rounded-3xl border-4 border-zinc-800 bg-zinc-950 shadow-2xl overflow-hidden max-w-sm mx-auto">
              
              {/* Phone Top Notch / Speaker Bar */}
              <div className="bg-zinc-900 px-6 py-2 flex items-center justify-between text-[11px] text-zinc-400 font-mono border-b border-zinc-800">
                <span>9:41</span>
                <div className="h-3.5 w-16 bg-black rounded-full mx-auto"></div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px]">5G</span>
                  <div className="h-2 w-4 border border-zinc-400 rounded-xs flex items-center p-0.5">
                    <div className="h-full w-2.5 bg-green-500"></div>
                  </div>
                </div>
              </div>

              {/* WhatsApp App Chat Header */}
              <div className="bg-[#1f2c34] px-4 py-3 flex items-center gap-3 border-b border-[#2a3942]">
                <div className="h-9 w-9 rounded-full bg-green-700/80 flex items-center justify-center text-white font-bold text-sm">
                  {sampleContact.name.charAt(0)}
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="text-sm font-semibold text-zinc-100 truncate">{sampleContact.name}</h4>
                  <p className="text-[11px] text-green-400 font-mono truncate">{sampleContact.phone} · Online</p>
                </div>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-[#111b21] text-zinc-400">
                  Recipient View
                </span>
              </div>

              {/* WhatsApp Chat Body Wallpaper Area */}
              <div 
                className="p-4 min-h-[460px] max-h-[520px] overflow-y-auto space-y-3 flex flex-col justify-end"
                style={{
                  backgroundColor: '#0b141a',
                  backgroundImage: 'radial-gradient(#1f2c34 1px, transparent 1px)',
                  backgroundSize: '20px 20px'
                }}
              >
                {/* Date bubble */}
                <div className="text-center my-2">
                  <span className="bg-[#182229] text-[#8696a0] text-[10px] px-3 py-1 rounded-md shadow-xs">
                    Today
                  </span>
                </div>

                {/* Sent Message Bubble (Green WhatsApp bubble) */}
                <div className="self-end max-w-[88%] rounded-xl bg-[#005c4b] text-white p-3 shadow-md space-y-2">
                  
                  {/* Media attachment render in bubble if present */}
                  {attachedMedia && (
                    <div 
                      onClick={() => setPreviewMediaFile(attachedMedia)}
                      className="cursor-pointer overflow-hidden rounded-lg bg-black/40 border border-[#005c4b] group relative"
                    >
                      {attachedMedia.type === 'image' && (
                        <div className="relative">
                          <img
                            src={attachedMedia.uri}
                            alt="Media flyer"
                            referrerPolicy="no-referrer"
                            className="max-h-40 w-full object-cover rounded-lg group-hover:opacity-90 transition-opacity"
                          />
                          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                            <span className="rounded-lg bg-black/70 px-2 py-1 text-[11px] text-white flex items-center gap-1 font-mono">
                              <Eye className="h-3 w-3" /> Fullscreen
                            </span>
                          </div>
                        </div>
                      )}

                      {attachedMedia.type === 'video' && (
                        <div className="relative h-32 w-full bg-zinc-900 flex items-center justify-center">
                          <Film className="h-8 w-8 text-green-400 opacity-80" />
                          <div className="absolute bottom-2 left-2 text-[10px] font-mono bg-black/70 px-1.5 py-0.5 rounded text-zinc-300">
                            VIDEO · {attachedMedia.duration || '0:34'}
                          </div>
                          <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                            <div className="h-8 w-8 rounded-full bg-green-600/90 flex items-center justify-center text-white">
                              ▶
                            </div>
                          </div>
                        </div>
                      )}

                      {attachedMedia.type === 'pdf' && (
                        <div className="p-3 bg-[#111b21] flex items-center gap-2.5 rounded-lg">
                          <FileText className="h-6 w-6 text-red-400 shrink-0" />
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-semibold text-white truncate">{attachedMedia.name}</p>
                            <span className="text-[10px] text-zinc-400 font-mono">PDF Document · Tap to view</span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Text content with white/emojis & whitespace */}
                  <div className="text-xs whitespace-pre-wrap leading-relaxed text-[#e9edef]">
                    {formattedPreviewMessage}
                  </div>

                  {/* Time and Blue double checkmarks */}
                  <div className="flex items-center justify-end gap-1 text-[10px] text-[#8696a0] font-mono pt-1">
                    <span>14:22</span>
                    <CheckCheck className="h-3.5 w-3.5 text-[#53bdeb]" />
                  </div>
                </div>

                <div className="text-center pt-2">
                  <p className="text-[10px] text-zinc-500 font-mono">
                    Previewing personalized replacement for <span className="text-green-400">{sampleContact.name}</span>
                  </p>
                </div>
              </div>

              {/* Phone bottom input placeholder */}
              <div className="bg-[#1f2c34] px-4 py-2.5 flex items-center gap-2 border-t border-[#2a3942]">
                <div className="flex-1 bg-[#2a3942] rounded-full px-3 py-1.5 text-xs text-zinc-400">
                  Message
                </div>
                <div className="h-8 w-8 rounded-full bg-[#00a884] flex items-center justify-center text-white">
                  <Send className="h-3.5 w-3.5" />
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
