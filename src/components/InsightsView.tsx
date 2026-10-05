import React, { useState } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Clock, 
  CheckCheck, 
  AlertCircle, 
  Send, 
  ArrowUpRight, 
  RefreshCw, 
  Download, 
  FileSpreadsheet,
  Filter, 
  Search, 
  Calendar, 
  Smartphone,
  CheckCircle2,
  SlidersHorizontal
} from 'lucide-react';
import { TimePeriod, DeliveryLogItem, WhatsAppAccount } from '../types';
import { PERIOD_DATA, TREND_CHART_DATA, INITIAL_DELIVERY_LOGS } from '../data/mockData';
import { CSVExportModal } from './CSVExportModal';

const PERIODS: TimePeriod[] = ['Today', 'This week', 'This month', 'All time'];

export interface InsightsViewProps {
  accounts: WhatsAppAccount[];
  onComposeClick: () => void;
  onViewScheduled: () => void;
  logs?: DeliveryLogItem[];
  deliveryLogs?: DeliveryLogItem[];
}

export function InsightsView({ 
  accounts, 
  onComposeClick, 
  onViewScheduled, 
  logs,
  deliveryLogs
}: InsightsViewProps) {
  // Use deliveryLogs or logs prop or fallback to default initial logs
  const activeDeliveryLogs = deliveryLogs || logs || INITIAL_DELIVERY_LOGS;

  const [activePeriod, setActivePeriod] = useState<TimePeriod>('Today');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [hoveredPoint, setHoveredPoint] = useState<number | null>(null);
  const [showExportModal, setShowExportModal] = useState<boolean>(false);
  const [downloadSuccess, setDownloadSuccess] = useState<boolean>(false);

  const stats = PERIOD_DATA[activePeriod];
  const chartData = TREND_CHART_DATA[activePeriod];

  // Maximum value for SVG scaling
  const maxSent = Math.max(...chartData.map(d => d.sent), 1);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 600);
  };

  const filteredLogs = activeDeliveryLogs.filter(log => {
    const matchesStatus = statusFilter === 'all' || log.status === statusFilter;
    const matchesSearch = 
      log.recipientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.recipientPhone.includes(searchQuery) ||
      log.campaignName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  /**
   * Triggers a download of the current deliveryLogs as a properly formatted CSV file.
   * RFC 4180 compliant with UTF-8 BOM for Microsoft Excel / Google Sheets compatibility.
   */
  const handleExportCSV = () => {
    const headers = [
      'Log ID',
      'Campaign Name',
      'Recipient Name',
      'Recipient Phone',
      'Sender Account',
      'Delivery Status',
      'Timestamp',
      'Diagnostics Detail'
    ];

    const escapeCSV = (val: string | undefined | null): string => {
      if (val === undefined || val === null) return '""';
      const clean = String(val).replace(/"/g, '""');
      return `"${clean}"`;
    };

    // Use current active logs (or filtered logs if search/status filter is applied)
    const recordsToExport = filteredLogs.length > 0 ? filteredLogs : activeDeliveryLogs;

    const rows = recordsToExport.map(item => [
      escapeCSV(item.id),
      escapeCSV(item.campaignName),
      escapeCSV(item.recipientName),
      // Tab prefix or quoted literal preserves '+' in international numbers in Excel
      `"\t${item.recipientPhone}"`,
      escapeCSV(item.accountName),
      escapeCSV(item.status ? item.status.toUpperCase() : 'UNKNOWN'),
      escapeCSV(item.timestamp),
      escapeCSV(item.errorMessage || 'Delivered OK (No Errors)')
    ].join(','));

    // UTF-8 BOM (\uFEFF) ensures proper character rendering in Excel across operating systems
    const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    
    const formattedDate = new Date().toISOString().slice(0, 10);
    const periodSlug = activePeriod.toLowerCase().replace(/\s+/g, '_');
    link.download = `whatsapp_delivery_logs_${periodSlug}_${formattedDate}.csv`;
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 2500);
  };

  return (
    <div className="flex-1 bg-black text-white p-4 md:p-8 overflow-y-auto">
      
      {/* Comprehensive CSV Export Dialog */}
      <CSVExportModal
        visible={showExportModal}
        onClose={() => setShowExportModal(false)}
        logs={activeDeliveryLogs}
        accounts={accounts}
        currentPeriod={activePeriod}
      />

      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header with Title and Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-zinc-400 mb-1">
              <span>WHATSAPP ANALYTICS</span>
              <span>·</span>
              <span className="text-green-500 font-semibold flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse"></span>
                LIVE PIPELINE
              </span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-white">Delivery Insights</h1>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              type="button"
              onClick={handleRefresh}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs font-medium text-zinc-300 hover:text-white hover:border-zinc-700 transition-colors"
              title="Refresh Stats"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin text-green-500' : ''}`} />
              <span>Sync</span>
            </button>

            {/* Export CSV Button - Direct download of current deliveryLogs */}
            <button
              type="button"
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-zinc-900 border border-zinc-700 hover:border-zinc-600 hover:bg-zinc-800 text-xs font-semibold text-zinc-100 hover:text-white transition-all shadow-sm"
              title="Download current deliveryLogs as a properly formatted CSV file"
            >
              {downloadSuccess ? (
                <>
                  <CheckCircle2 className="h-3.5 w-3.5 text-green-400" />
                  <span className="text-green-400">Exported!</span>
                </>
              ) : (
                <>
                  <Download className="h-3.5 w-3.5 text-green-400" />
                  <span>Export CSV</span>
                </>
              )}
            </button>

            {/* Advanced Export options modal trigger */}
            <button
              type="button"
              onClick={() => setShowExportModal(true)}
              className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700 transition-colors"
              title="Configure custom columns and filters for CSV export"
            >
              <SlidersHorizontal className="h-3.5 w-3.5" />
            </button>

            <button
              type="button"
              onClick={onComposeClick}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-green-600 hover:bg-green-500 text-xs font-bold text-white transition-colors shadow-lg shadow-green-600/20"
            >
              <Send className="h-3.5 w-3.5" />
              <span>New Campaign</span>
            </button>
          </div>
        </div>

        {/* Filter Chips - Direct implementation matching user's spec */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {PERIODS.map((period) => (
            <button
              key={period}
              type="button"
              onClick={() => setActivePeriod(period)}
              className={`px-6 py-2.5 rounded-full text-sm font-semibold transition-all whitespace-nowrap border ${
                activePeriod === period
                  ? 'bg-green-600 border-green-600 text-white shadow-lg shadow-green-600/25'
                  : 'bg-transparent border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
              }`}
            >
              {period}
            </button>
          ))}
        </div>

        {/* 4 Summary Cards - Matching user's exact colors, borders, and typography */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Sent */}
          <div className="bg-zinc-900/90 border border-zinc-800/80 p-6 rounded-3xl shadow-sm hover:border-zinc-700 transition-colors">
            <div className="flex items-center justify-between text-zinc-500 text-xs uppercase font-medium tracking-wider mb-2">
              <span>Total Sent</span>
              <Send className="h-4 w-4 text-zinc-400" />
            </div>
            <div className="text-white text-3xl font-bold font-mono tabular-nums tracking-tight">
              {stats.sent.toLocaleString()}
            </div>
            <div className="mt-3 flex items-center text-xs text-zinc-400 font-mono">
              <span className="text-green-400 font-medium">100%</span>
              <span className="mx-1.5 text-zinc-600">·</span>
              <span>Dispatched via active nodes</span>
            </div>
          </div>

          {/* Delivered with green border-b-4 */}
          <div className="bg-zinc-900/90 border border-zinc-800/80 p-6 rounded-3xl border-b-4 border-b-green-500 shadow-sm hover:border-zinc-700 transition-colors">
            <div className="flex items-center justify-between text-zinc-500 text-xs uppercase font-medium tracking-wider mb-2">
              <span>Delivered</span>
              <CheckCheck className="h-4 w-4 text-green-500" />
            </div>
            <div className="text-green-500 text-3xl font-bold font-mono tabular-nums tracking-tight">
              {stats.delivered.toLocaleString()}
            </div>
            <div className="mt-3 flex items-center text-xs text-zinc-400 font-mono">
              <span className="text-green-400 font-medium">{stats.read.toLocaleString()}</span>
              <span className="mx-1.5 text-zinc-600">·</span>
              <span>Confirmed read (double blue)</span>
            </div>
          </div>

          {/* Scheduled with red/amber border-b-4 */}
          <div 
            onClick={onViewScheduled}
            className="cursor-pointer bg-zinc-900/90 border border-zinc-800/80 p-6 rounded-3xl border-b-4 border-b-red-500 shadow-sm hover:border-zinc-700 transition-colors group"
          >
            <div className="flex items-center justify-between text-zinc-500 text-xs uppercase font-medium tracking-wider mb-2">
              <span className="group-hover:text-red-400 transition-colors">Scheduled</span>
              <Clock className="h-4 w-4 text-red-500" />
            </div>
            <div className="text-red-500 text-3xl font-bold font-mono tabular-nums tracking-tight">
              {stats.scheduled.toLocaleString()}
            </div>
            <div className="mt-3 flex items-center justify-between text-xs text-zinc-400 font-mono">
              <span>Queued auto-sends</span>
              <span className="text-zinc-500 group-hover:text-white flex items-center">
                View <ArrowUpRight className="h-3 w-3 ml-0.5" />
              </span>
            </div>
          </div>

          {/* Success Rate */}
          <div className="bg-zinc-900/90 border border-zinc-800/80 p-6 rounded-3xl shadow-sm hover:border-zinc-700 transition-colors">
            <div className="flex items-center justify-between text-zinc-500 text-xs uppercase font-medium tracking-wider mb-2">
              <span>Success Rate</span>
              <TrendingUp className="h-4 w-4 text-emerald-400" />
            </div>
            <div className="text-white text-3xl font-bold font-mono tabular-nums tracking-tight">
              {stats.rate}
            </div>
            <div className="mt-3 flex items-center text-xs text-zinc-400 font-mono">
              <span className="text-red-400 font-medium">{stats.failed} failed</span>
              <span className="mx-1.5 text-zinc-600">·</span>
              <span>Bounce rate &lt; 2.5%</span>
            </div>
          </div>
        </div>

        {/* Activity Trend Graph Card */}
        <div className="bg-zinc-900/90 rounded-3xl p-6 border border-zinc-800 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-green-500" />
                <span>Delivery Activity: {activePeriod}</span>
              </h2>
              <p className="text-xs text-zinc-400 mt-1">
                Comparative volume of messages sent versus verified delivered across this timeframe
              </p>
            </div>

            {/* Legend */}
            <div className="flex items-center gap-4 text-xs font-mono">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-sm bg-green-500"></span>
                <span className="text-zinc-300">Delivered</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-sm bg-zinc-700"></span>
                <span className="text-zinc-400">Total Sent</span>
              </div>
            </div>
          </div>

          {/* Chart Canvas */}
          <div className="relative h-60 w-full pt-4 pb-2">
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
              <div className="border-b border-zinc-800/80 w-full h-0"></div>
              <div className="border-b border-zinc-800/80 w-full h-0"></div>
              <div className="border-b border-zinc-800/80 w-full h-0"></div>
              <div className="border-b border-zinc-800/80 w-full h-0"></div>
            </div>

            <div className="relative h-full flex items-end justify-between gap-2 sm:gap-4 px-2">
              {chartData.map((d, index) => {
                const totalHeightPct = Math.max(12, Math.round((d.sent / maxSent) * 88));
                const deliveredHeightPct = Math.max(8, Math.round((d.delivered / maxSent) * 88));
                const isHovered = hoveredPoint === index;

                return (
                  <div
                    key={d.label}
                    onMouseEnter={() => setHoveredPoint(index)}
                    onMouseLeave={() => setHoveredPoint(null)}
                    className="relative flex-1 flex flex-col items-center h-full justify-end group cursor-pointer"
                  >
                    {isHovered && (
                      <div className="absolute -top-14 z-20 rounded-xl bg-zinc-950 border border-zinc-700 px-3 py-1.5 shadow-xl text-center pointer-events-none whitespace-nowrap">
                        <p className="text-[11px] font-bold text-white">{d.label}</p>
                        <p className="text-[10px] text-green-400 font-mono">
                          {d.delivered} / {d.sent} ({Math.round((d.delivered / d.sent) * 100)}%)
                        </p>
                      </div>
                    )}

                    <div className="w-full max-w-[48px] flex items-end justify-center gap-1 h-full">
                      <div
                        style={{ height: `${totalHeightPct}%` }}
                        className={`w-1/2 rounded-t-md transition-all duration-300 ${
                          isHovered ? 'bg-zinc-600' : 'bg-zinc-800'
                        }`}
                      ></div>
                      <div
                        style={{ height: `${deliveredHeightPct}%` }}
                        className={`w-1/2 rounded-t-md transition-all duration-300 ${
                          isHovered ? 'bg-green-400' : 'bg-green-500'
                        }`}
                      ></div>
                    </div>

                    <span className="text-[11px] font-mono text-zinc-500 mt-2.5 group-hover:text-zinc-200 transition-colors">
                      {d.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Multi-Account Performance Breakdown & Delivery Audit Log */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 bg-zinc-900/90 rounded-3xl p-6 border border-zinc-800 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Smartphone className="h-4 w-4 text-green-500" />
                  <span>Sender Node Quotas</span>
                </h3>
                <span className="text-xs text-zinc-500 font-mono">{accounts.length} Linked</span>
              </div>
              <p className="text-xs text-zinc-400 mb-4">
                Real-time usage breakdown of active WhatsApp sender lines to maintain healthy deliverability and avoid account flagging.
              </p>

              <div className="space-y-4">
                {accounts.map(acc => {
                  const quotaUsedPct = Math.round((acc.sentToday / acc.dailyQuota) * 100);
                  return (
                    <div key={acc.id} className="p-3 rounded-2xl bg-zinc-950/70 border border-zinc-800/80">
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <span className="font-semibold text-zinc-200 truncate max-w-[160px]">{acc.name}</span>
                        <span className="font-mono text-zinc-400">{acc.sentToday} / {acc.dailyQuota}</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-zinc-800 overflow-hidden">
                        <div
                          style={{ width: `${quotaUsedPct}%` }}
                          className={`h-full rounded-full ${
                            quotaUsedPct > 80 ? 'bg-amber-500' : 'bg-green-500'
                          }`}
                        ></div>
                      </div>
                      <div className="flex justify-between items-center text-[10px] text-zinc-500 mt-1 font-mono">
                        <span>{acc.phoneNumber}</span>
                        <span>{quotaUsedPct}% used</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-zinc-800/80 flex items-center justify-between text-xs text-zinc-400">
              <span>Automatic anti-ban throttling</span>
              <span className="text-green-400 font-mono font-medium">Active (2-4s delay)</span>
            </div>
          </div>

          {/* Delivery Audit Log Table */}
          <div className="lg:col-span-2 bg-zinc-900/90 rounded-3xl p-6 border border-zinc-800 shadow-sm flex flex-col">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div>
                <h3 className="text-base font-bold text-white">Live Delivery Logs</h3>
                <p className="text-xs text-zinc-400">Detailed recipient dispatch statuses & read receipts</p>
              </div>

              {/* Status Filter buttons & Quick Export */}
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 bg-zinc-950 p-1 rounded-xl border border-zinc-800 text-xs">
                  {['all', 'delivered', 'read', 'scheduled', 'failed'].map(status => (
                    <button
                      key={status}
                      type="button"
                      onClick={() => setStatusFilter(status)}
                      className={`px-2.5 py-1 rounded-lg capitalize transition-colors ${
                        statusFilter === status
                          ? 'bg-zinc-800 text-white font-medium shadow-sm'
                          : 'text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>

                {/* Table Header Export CSV Button */}
                <button
                  type="button"
                  onClick={handleExportCSV}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-zinc-950 border border-zinc-800 hover:border-zinc-700 text-zinc-300 hover:text-white text-xs font-semibold transition-colors"
                  title="Export current deliveryLogs to CSV"
                >
                  <Download className="h-3.5 w-3.5 text-green-400" />
                  <span>Export CSV</span>
                </button>
              </div>
            </div>

            {/* Search filter */}
            <div className="relative mb-3">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-zinc-500" />
              <input
                type="text"
                placeholder="Filter by contact name, phone, or campaign..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full rounded-xl bg-zinc-950/80 border border-zinc-800 pl-9 pr-4 py-2 text-xs text-white placeholder-zinc-500 focus:border-green-500 focus:outline-none"
              />
            </div>

            {/* Table */}
            <div className="flex-1 overflow-x-auto overflow-y-auto max-h-72 rounded-2xl border border-zinc-800/80 bg-zinc-950/60">
              <table className="w-full text-left text-xs">
                <thead className="sticky top-0 bg-zinc-950 border-b border-zinc-800 text-zinc-500 font-mono">
                  <tr>
                    <th className="py-2.5 px-4 font-normal">Recipient</th>
                    <th className="py-2.5 px-3 font-normal">Campaign</th>
                    <th className="py-2.5 px-3 font-normal">Sender Line</th>
                    <th className="py-2.5 px-3 font-normal">Status</th>
                    <th className="py-2.5 px-4 font-normal text-right">Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60">
                  {filteredLogs.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-zinc-500 italic">
                        No delivery entries matching filter criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredLogs.map(log => (
                      <tr key={log.id} className="hover:bg-zinc-900/60 transition-colors">
                        <td className="py-2.5 px-4">
                          <div className="font-semibold text-zinc-200">{log.recipientName}</div>
                          <div className="text-[11px] text-zinc-500 font-mono">{log.recipientPhone}</div>
                        </td>
                        <td className="py-2.5 px-3 text-zinc-300 font-medium">
                          {log.campaignName}
                        </td>
                        <td className="py-2.5 px-3 text-zinc-400 font-mono text-[11px]">
                          {log.accountName.split(' ')[0]}...
                        </td>
                        <td className="py-2.5 px-3">
                          {log.status === 'delivered' && (
                            <span className="inline-flex items-center gap-1 text-green-400 font-mono text-[11px]">
                              <CheckCheck className="h-3 w-3" /> Delivered
                            </span>
                          )}
                          {log.status === 'read' && (
                            <span className="inline-flex items-center gap-1 text-sky-400 font-mono text-[11px]">
                              <CheckCheck className="h-3 w-3 text-sky-400" /> Read
                            </span>
                          )}
                          {log.status === 'scheduled' && (
                            <span className="inline-flex items-center gap-1 text-red-400 font-mono text-[11px]">
                              <Clock className="h-3 w-3" /> Scheduled
                            </span>
                          )}
                          {log.status === 'failed' && (
                            <span className="inline-flex items-center gap-1 text-red-500 font-mono text-[11px]" title={log.errorMessage}>
                              <AlertCircle className="h-3 w-3" /> Failed
                            </span>
                          )}
                          {log.status === 'sending' && (
                            <span className="inline-flex items-center gap-1 text-amber-400 font-mono text-[11px] animate-pulse">
                              <RefreshCw className="h-3 w-3 animate-spin" /> In Flight
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 px-4 text-right text-zinc-500 font-mono text-[11px]">
                          {log.timestamp}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="mt-3 flex items-center justify-between text-[11px] text-zinc-500 font-mono">
              <span>Showing {filteredLogs.length} delivery transactions</span>
              <button 
                type="button" 
                onClick={handleExportCSV}
                className="text-green-500 hover:text-green-400 transition-colors flex items-center gap-1.5 font-semibold"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Export CSV ({filteredLogs.length} Records)</span>
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
