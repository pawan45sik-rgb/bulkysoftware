export type AccountStatus = 'connected' | 'connecting' | 'disconnected' | 'rate_limited';

export interface WhatsAppAccount {
  id: string;
  name: string;
  phoneNumber: string;
  avatar: string;
  status: AccountStatus;
  dailyQuota: number;
  sentToday: number;
  batteryLevel: number;
  lastActive: string;
  isDefault?: boolean;
}

export interface Contact {
  id: string;
  name: string;
  phone: string;
  company: string;
  offer: string;
  tags: string[];
  status: 'active' | 'unsubscribed' | 'bounced';
}

export type MediaType = 'image' | 'video' | 'pdf' | 'document';

export interface MediaFile {
  id: string;
  name: string;
  type: MediaType;
  mimeType: string;
  size: number; // in bytes
  uri: string; // url or data uri
  duration?: string; // for video
  pageCount?: number; // for pdf
}

export interface Campaign {
  id: string;
  title: string;
  accountId: string;
  recipientCount: number;
  sentCount: number;
  deliveredCount: number;
  failedCount: number;
  scheduledAt?: string | null;
  status: 'draft' | 'scheduled' | 'running' | 'completed' | 'paused';
  messageTemplate: string;
  mediaFile?: MediaFile | null;
  createdAt: string;
}

export interface DeliveryLogItem {
  id: string;
  campaignId: string;
  campaignName: string;
  recipientName: string;
  recipientPhone: string;
  accountName: string;
  status: 'delivered' | 'read' | 'scheduled' | 'failed' | 'sending';
  timestamp: string;
  errorMessage?: string;
}

export type TimePeriod = 'Today' | 'This week' | 'This month' | 'All time';

export interface PeriodStats {
  sent: number;
  delivered: number;
  scheduled: number;
  rate: string;
  failed: number;
  read: number;
}
