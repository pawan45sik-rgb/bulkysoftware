import React, { useState } from 'react';
import { 
  Download, 
  X, 
  FileSpreadsheet, 
  Check, 
  Copy, 
  Filter, 
  CheckCircle2, 
  AlertCircle,
  Clock,
  Layers,
  Table
} from 'lucide-react';
import { DeliveryLogItem, TimePeriod, WhatsAppAccount } from '../types';

interface CSVExportModalProps {
  visible: boolean;
  onClose: () => void;
  logs: DeliveryLogItem[];
  accounts: WhatsAppAccount[];
  currentPeriod: TimePeriod;
}

export function CSVExportModal({
  visible,
  onClose,
  logs,
  accounts,
  currentPeriod,
}: CSVExportModalProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<string>('current');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedAccount, setSelectedAccount] = useState<string>('all');
  const [copied, setCopied] = useState<boolean>(false);
  const [downloadSuccess, setDownloadSuccess] = useState<boolean>(false);

  // Column toggles
  const [columns, setColumns] = useState({
    id: true,
    recipientName: true,
    recipientPhone: true,
    campaignName: true,
    accountName: true,
    status: true,
    timestamp: true,
    errorMessage: true,
  });

  if (!visible) return null;

  // Filter logs based on modal criteria
  const exportableLogs = logs.filter(log => {
    // Status
    if (selectedStatus !== 'all' && log.status !== selectedStatus) return false;
    // Account
    if (selectedAccount !== 'all' && log.accountName !== selectedAccount) return false;
    return true;
  });

  const toggleColumn = (key: keyof typeof columns) => {
    setColumns(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // Build RFC 4180 CSV with UTF-8 BOM for Excel / Google Sheets compatibility
  const generateCSVContent = (): string => {
    const activeHeaders: string[] = [];
    if (columns.id) activeHeaders.push('Log ID');
    if (columns.campaignName) activeHeaders.push('Campaign Title');
    if (columns.recipientName) activeHeaders.push('Recipient Name');
    if (columns.recipientPhone) activeHeaders.push('Phone Number');
    if (columns.accountName) activeHeaders.push('Sender WhatsApp Account');
    if (columns.status) activeHeaders.push('Delivery Status');
    if (columns.timestamp) activeHeaders.push('Dispatch Time');
    if (columns.errorMessage) activeHeaders.push('Diagnostics / Error Detail');

    const escapeCSV = (val: string | undefined): string => {
      if (!val) return '""';
      const clean = val.replace(/"/g, '""');
      return `"${clean}"`;
    };

    const rows = exportableLogs.map(log => {
      const rowValues: string[] = [];
      if (columns.id) rowValues.push(escapeCSV(log.id));
      if (columns.campaignName) rowValues.push(escapeCSV(log.campaignName));
      if (columns.recipientName) rowValues.push(escapeCSV(log.recipientName));
      // Prefix with tab or quotes to prevent Excel from removing '+' sign
      if (columns.recipientPhone) rowValues.push(`"\t${log.recipientPhone}"`);
      if (columns.accountName) rowValues.push(escapeCSV(log.accountName));
      if (columns.status) rowValues.push(escapeCSV(log.status.toUpperCase()));
      if (columns.timestamp) rowValues.push(escapeCSV(log.timestamp));
      if (columns.errorMessage) rowValues.push(escapeCSV(log.errorMessage || 'None (Delivered Normal)'));
      return rowValues.join(',');
    });

    return [activeHeaders.join(','), ...rows].join('\r\n');
  };

  const handleDownload = () => {
    const csvData = generateCSVContent();
    // \uFEFF is UTF-8 Byte Order Mark for Excel
    const blob = new Blob(['\uFEFF' + csvData], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const dateStr = new Date().toISOString().slice(0, 10);
    a.download = `whatsapp_delivery_logs_${currentPeriod.toLowerCase().replace(/\s+/g, '_')}_${dateStr}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setDownloadSuccess(true);
    setTimeout(() => {
      setDownloadSuccess(false);
      onClose();
    }, 1500);
  };

  const handleCopyClipboard = () => {
    const csvData = generateCSVContent();
    navigator.clipboard?.writeText(csvData);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const estimatedBytes = new Blob([generateCSVContent()]).size;
  const estimatedSize = estimatedBytes < 1024 
    ? `${estimatedBytes} B` 
    : `${(estimatedBytes / 1024).toFixed(1)} KB`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-fade-in">
      <div className="w-full max-w-2xl rounded-3xl bg-zinc-950 border border-zinc-800 p-6 md:p-8 shadow-2xl space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-green-500/10 border border-green-500/20 flex items-center justify-center text-green-500">
              <FileSpreadsheet className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>Export Delivery Logs for External Reporting</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-green-400">
                  CSV / RFC 4180
                </span>
              </h3>
              <p className="text-xs text-zinc-400">Export audited campaign delivery events for Excel, BI tools, or client reporting</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-900 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Filter Configuration */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block text-zinc-400 font-mono text-[10px] uppercase mb-1.5">Filter by Status</label>
            <select
              value={selectedStatus}
              onChange={e => setSelectedStatus(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-green-500 font-sans"
            >
              <option value="all">All Delivery Statuses ({logs.length} records)</option>
              <option value="delivered">Delivered Only</option>
              <option value="read">Confirmed Read Only</option>
              <option value="failed">Failed / Undelivered Only (Diagnostics)</option>
              <option value="scheduled">Scheduled Pending Only</option>
            </select>
          </div>

          <div>
            <label className="block text-zinc-400 font-mono text-[10px] uppercase mb-1.5">Sender Line Filter</label>
            <select
              value={selectedAccount}
              onChange={e => setSelectedAccount(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-green-500 font-sans"
            >
              <option value="all">All Sender Accounts</option>
              {accounts.map(acc => (
                <option key={acc.id} value={acc.name}>
                  {acc.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Column Selectors */}
        <div>
          <label className="block text-zinc-400 font-mono text-[10px] uppercase mb-2">Include Columns in CSV Export</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            {[
              { key: 'recipientName', label: 'Recipient' },
              { key: 'recipientPhone', label: 'Phone' },
              { key: 'campaignName', label: 'Campaign' },
              { key: 'status', label: 'Status' },
              { key: 'accountName', label: 'Sender Line' },
              { key: 'timestamp', label: 'Timestamp' },
              { key: 'errorMessage', label: 'Diagnostics' },
              { key: 'id', label: 'Log ID' },
            ].map(col => {
              const active = columns[col.key as keyof typeof columns];
              return (
                <button
                  key={col.key}
                  type="button"
                  onClick={() => toggleColumn(col.key as keyof typeof columns)}
                  className={`flex items-center gap-2 p-2 rounded-xl border text-left transition-colors ${
                    active
                      ? 'bg-zinc-900 border-green-500 text-white font-medium'
                      : 'bg-zinc-950 border-zinc-800 text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  <div className={`h-3.5 w-3.5 rounded flex items-center justify-center border text-[9px] ${
                    active ? 'bg-green-600 border-green-500 text-white' : 'border-zinc-700'
                  }`}>
                    {active && <Check className="h-3 w-3 stroke-[3]" />}
                  </div>
                  <span className="truncate">{col.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Live Preview Box */}
        <div className="rounded-2xl bg-zinc-900/70 border border-zinc-800 p-4 space-y-2">
          <div className="flex items-center justify-between text-xs text-zinc-400 font-mono">
            <span>Export Dataset Summary</span>
            <span className="text-green-400">
              {exportableLogs.length} rows · ~{estimatedSize}
            </span>
          </div>

          <div className="overflow-x-auto rounded-xl bg-zinc-950 border border-zinc-800/80 p-2 text-[11px] font-mono text-zinc-400 max-h-28 overflow-y-auto">
            {exportableLogs.length === 0 ? (
              <p className="text-zinc-600 italic py-2 text-center">No rows match the selected filter criteria.</p>
            ) : (
              exportableLogs.slice(0, 3).map((item, idx) => (
                <div key={item.id} className="py-1 border-b border-zinc-900 last:border-0 truncate">
                  <span className="text-zinc-500">#{idx + 1}</span> {item.recipientName} ({item.recipientPhone}) · <span className="text-white">{item.status.toUpperCase()}</span> · {item.campaignName}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-zinc-800">
          <button
            type="button"
            onClick={handleCopyClipboard}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-xs font-semibold text-zinc-300 hover:text-white transition-colors"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-green-400" /> : <Copy className="h-3.5 w-3.5" />}
            <span>{copied ? 'Copied to Clipboard' : 'Copy CSV Raw Text'}</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs text-zinc-400 hover:text-white transition-colors"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleDownload}
              disabled={exportableLogs.length === 0}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white font-bold text-xs shadow-lg shadow-green-600/25 transition-all"
            >
              {downloadSuccess ? (
                <>
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>Report Downloaded!</span>
                </>
              ) : (
                <>
                  <Download className="h-3.5 w-3.5" />
                  <span>Download CSV ({exportableLogs.length} Records)</span>
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
