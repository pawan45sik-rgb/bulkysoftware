import { WhatsAppAccount, Contact, MediaFile, DeliveryLogItem, PeriodStats, TimePeriod } from '../types';

export const INITIAL_ACCOUNTS: WhatsAppAccount[] = [
  {
    id: 'acc_1',
    name: 'Growth & VIP Sales Line',
    phoneNumber: '+1 (415) 890-2314',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    status: 'connected',
    dailyQuota: 1000,
    sentToday: 412,
    batteryLevel: 94,
    lastActive: 'Just now',
    isDefault: true,
  },
  {
    id: 'acc_2',
    name: 'Support & Onboarding Desk',
    phoneNumber: '+44 20 7946 0912',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    status: 'connected',
    dailyQuota: 750,
    sentToday: 184,
    batteryLevel: 81,
    lastActive: '3m ago',
  },
  {
    id: 'acc_3',
    name: 'Flash Promos Latin America',
    phoneNumber: '+55 11 98765-4321',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    status: 'connected',
    dailyQuota: 500,
    sentToday: 95,
    batteryLevel: 67,
    lastActive: '12m ago',
  }
];

export const INITIAL_CONTACTS: Contact[] = [
  {
    id: 'c_1',
    name: 'Sophia Martinez',
    phone: '+1 650 321 9840',
    company: 'Apex Logistics',
    offer: '25% Early Bird Discount',
    tags: ['VIP', 'Enterprise'],
    status: 'active'
  },
  {
    id: 'c_2',
    name: 'Liam Chen',
    phone: '+1 408 555 0192',
    company: 'Nova Digital Agency',
    offer: 'Free 14-Day Trial + Onboarding',
    tags: ['Leads', 'Q4 Campaign'],
    status: 'active'
  },
  {
    id: 'c_3',
    name: 'Amara Okafor',
    phone: '+44 7700 900451',
    company: 'Zenith Retail UK',
    offer: 'Buy 2 Get 1 Seasonal Pass',
    tags: ['Retail', 'Newsletter'],
    status: 'active'
  },
  {
    id: 'c_4',
    name: 'David Vance',
    phone: '+1 312 889 1044',
    company: 'Midwest Distribution',
    offer: 'Exclusive Wholesale Pricing',
    tags: ['Wholesale'],
    status: 'active'
  },
  {
    id: 'c_5',
    name: 'Elena Rostova',
    phone: '+49 151 23456789',
    company: 'Kinetix Labs Berlin',
    offer: 'API Access Token Upgrade',
    tags: ['Tech', 'VIP'],
    status: 'active'
  },
  {
    id: 'c_6',
    name: 'Mateo Morales',
    phone: '+52 55 1234 5678',
    company: 'Solaris Energia',
    offer: 'Complimentary Energy Audit',
    tags: ['B2B', 'Renewables'],
    status: 'active'
  },
  {
    id: 'c_7',
    name: 'Chloe Tremblay',
    phone: '+1 514 555 8821',
    company: 'Atelier Montreal',
    offer: 'Private Preview Invitation',
    tags: ['Design', 'Retail'],
    status: 'active'
  },
  {
    id: 'c_8',
    name: 'Tariq Al-Mansoor',
    phone: '+971 50 123 4567',
    company: 'Gulf Commerce Group',
    offer: '30% Enterprise Tier Voucher',
    tags: ['Enterprise', 'VIP'],
    status: 'active'
  }
];

// SVG Poster for Image media preview
const PROMO_IMAGE_SVG = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg width="800" height="600" viewBox="0 0 800 600" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#092015" />
      <stop offset="50%" stop-color="#0d3b24" />
      <stop offset="100%" stop-color="#05140c" />
    </linearGradient>
    <linearGradient id="accent" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#22c55e" />
      <stop offset="100%" stop-color="#4ade80" />
    </linearGradient>
    <filter id="shadow">
      <feDropShadow dx="0" dy="12" stdDeviation="16" flood-color="#000" flood-opacity="0.6"/>
    </filter>
  </defs>
  <rect width="800" height="600" fill="url(#bg)"/>
  <circle cx="700" cy="100" r="220" fill="#22c55e" opacity="0.08"/>
  <circle cx="100" cy="500" r="180" fill="#16a34a" opacity="0.06"/>
  <g transform="translate(60, 80)">
    <rect x="0" y="0" width="160" height="32" rx="16" fill="#166534" opacity="0.8"/>
    <text x="80" y="21" fill="#86efac" font-family="system-ui, sans-serif" font-size="13" font-weight="bold" text-anchor="middle" letter-spacing="1">SPECIAL CAMPAIGN</text>
    <text x="0" y="90" fill="#ffffff" font-family="system-ui, sans-serif" font-size="44" font-weight="800">EXCLUSIVE FLASH OFFER</text>
    <text x="0" y="140" fill="#a1a1aa" font-family="system-ui, sans-serif" font-size="18">Upgrade your workflow with 25% off this week only.</text>
    
    <!-- Card visual -->
    <g transform="translate(0, 180)" filter="url(#shadow)">
      <rect width="680" height="200" rx="20" fill="#18181b" stroke="#27272a" stroke-width="2"/>
      <circle cx="60" cy="60" r="30" fill="#22c55e" opacity="0.2"/>
      <text x="60" y="68" fill="#22c55e" font-family="system-ui, sans-serif" font-size="28" text-anchor="middle">⚡</text>
      <text x="110" y="55" fill="#ffffff" font-family="system-ui, sans-serif" font-size="20" font-weight="700">Priority WhatsApp Dispatch</text>
      <text x="110" y="80" fill="#71717a" font-family="system-ui, sans-serif" font-size="14">Instant message delivery · Automated smart placeholders · Anti-spam delays</text>
      
      <line x1="40" y1="120" x2="640" y2="120" stroke="#27272a" stroke-width="1"/>
      <text x="40" y="160" fill="#a1a1aa" font-family="system-ui, sans-serif" font-size="14">PROMO CODE:</text>
      <text x="150" y="162" fill="#22c55e" font-family="monospace" font-size="20" font-weight="700">WHATSAPP25</text>
      <text x="640" y="160" fill="#e4e4e7" font-family="system-ui, sans-serif" font-size="14" text-anchor="end">Valid through Oct 2026</text>
    </g>
  </g>
</svg>
`)}`;

export const SAMPLE_MEDIA_FILES: MediaFile[] = [
  {
    id: 'med_img_1',
    name: 'summer_flash_sale_flyer.png',
    type: 'image',
    mimeType: 'image/png',
    size: 284720,
    uri: PROMO_IMAGE_SVG,
  },
  {
    id: 'med_vid_1',
    name: 'product_walkthrough_demo.mp4',
    type: 'video',
    mimeType: 'video/mp4',
    size: 3942000,
    duration: '0:34',
    uri: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
  },
  {
    id: 'med_pdf_1',
    name: 'Q4_Product_Catalog_Offer.pdf',
    type: 'pdf',
    mimeType: 'application/pdf',
    size: 1482000,
    pageCount: 6,
    uri: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
  }
];

export const PERIOD_DATA: Record<TimePeriod, PeriodStats> = {
  Today: {
    sent: 450,
    delivered: 412,
    scheduled: 18,
    rate: '91.5%',
    failed: 20,
    read: 388,
  },
  'This week': {
    sent: 2840,
    delivered: 2690,
    scheduled: 85,
    rate: '94.7%',
    failed: 65,
    read: 2480,
  },
  'This month': {
    sent: 11420,
    delivered: 10830,
    scheduled: 210,
    rate: '94.8%',
    failed: 380,
    read: 9940,
  },
  'All time': {
    sent: 68900,
    delivered: 65120,
    scheduled: 340,
    rate: '94.5%',
    failed: 3440,
    read: 59700,
  },
};

export const TREND_CHART_DATA: Record<TimePeriod, { label: string; sent: number; delivered: number }[]> = {
  Today: [
    { label: '08:00', sent: 35, delivered: 33 },
    { label: '10:00', sent: 92, delivered: 86 },
    { label: '12:00', sent: 120, delivered: 110 },
    { label: '14:00', sent: 84, delivered: 78 },
    { label: '16:00', sent: 68, delivered: 61 },
    { label: '18:00', sent: 41, delivered: 38 },
    { label: '20:00', sent: 10, delivered: 6 },
  ],
  'This week': [
    { label: 'Mon', sent: 390, delivered: 372 },
    { label: 'Tue', sent: 480, delivered: 455 },
    { label: 'Wed', sent: 520, delivered: 498 },
    { label: 'Thu', sent: 410, delivered: 388 },
    { label: 'Fri', sent: 590, delivered: 565 },
    { label: 'Sat', sent: 260, delivered: 242 },
    { label: 'Sun', sent: 190, delivered: 170 },
  ],
  'This month': [
    { label: 'Week 1', sent: 2650, delivered: 2510 },
    { label: 'Week 2', sent: 3100, delivered: 2940 },
    { label: 'Week 3', sent: 2880, delivered: 2740 },
    { label: 'Week 4', sent: 2790, delivered: 2640 },
  ],
  'All time': [
    { label: 'May', sent: 11200, delivered: 10500 },
    { label: 'Jun', sent: 13400, delivered: 12700 },
    { label: 'Jul', sent: 14100, delivered: 13350 },
    { label: 'Aug', sent: 14800, delivered: 14020 },
    { label: 'Sep', sent: 15400, delivered: 14550 },
  ],
};

export const INITIAL_DELIVERY_LOGS: DeliveryLogItem[] = [
  {
    id: 'log_1',
    campaignId: 'cmp_101',
    campaignName: 'Flash VIP Autumn Promo',
    recipientName: 'Sophia Martinez',
    recipientPhone: '+1 650 321 9840',
    accountName: 'Growth & VIP Sales Line',
    status: 'delivered',
    timestamp: '14:22:05',
  },
  {
    id: 'log_2',
    campaignId: 'cmp_101',
    campaignName: 'Flash VIP Autumn Promo',
    recipientName: 'Liam Chen',
    recipientPhone: '+1 408 555 0192',
    accountName: 'Growth & VIP Sales Line',
    status: 'read',
    timestamp: '14:21:48',
  },
  {
    id: 'log_3',
    campaignId: 'cmp_101',
    campaignName: 'Flash VIP Autumn Promo',
    recipientName: 'Amara Okafor',
    recipientPhone: '+44 7700 900451',
    accountName: 'Support & Onboarding Desk',
    status: 'delivered',
    timestamp: '14:20:12',
  },
  {
    id: 'log_4',
    campaignId: 'cmp_102',
    campaignName: 'Weekly Newsletter Re-engagement',
    recipientName: 'David Vance',
    recipientPhone: '+1 312 889 1044',
    accountName: 'Growth & VIP Sales Line',
    status: 'read',
    timestamp: '13:58:30',
  },
  {
    id: 'log_5',
    campaignId: 'cmp_102',
    campaignName: 'Weekly Newsletter Re-engagement',
    recipientName: 'Elena Rostova',
    recipientPhone: '+49 151 23456789',
    accountName: 'Growth & VIP Sales Line',
    status: 'failed',
    timestamp: '13:57:11',
    errorMessage: 'Destination network unreachable (error 404)'
  },
  {
    id: 'log_6',
    campaignId: 'cmp_103',
    campaignName: 'Product Demo Followup',
    recipientName: 'Mateo Morales',
    recipientPhone: '+52 55 1234 5678',
    accountName: 'Flash Promos Latin America',
    status: 'scheduled',
    timestamp: 'Tomorrow at 09:00',
  },
  {
    id: 'log_7',
    campaignId: 'cmp_103',
    campaignName: 'Product Demo Followup',
    recipientName: 'Chloe Tremblay',
    recipientPhone: '+1 514 555 8821',
    accountName: 'Growth & VIP Sales Line',
    status: 'scheduled',
    timestamp: 'Tomorrow at 09:00',
  }
];
