export interface DigitalSolutionItem {
  id: string;
  slug: string;
  title: string;
  categoryTag: string;
  shortDescription: string;
  fullDescription: string;
  idealFor: string[];
  startingEstimate: string;
  deliveryTimeline: string;
  coreFeatures: string[];
  techStack: string[];
  iconName: string;
}

export const digitalSolutionsData: DigitalSolutionItem[] = [
  {
    id: 'tech-001',
    slug: 'business-website-development',
    title: 'Modern Business Websites & Company Portals',
    categoryTag: 'Web Development',
    shortDescription: 'High-performance, mobile-first responsive corporate websites that establish trust and turn visitors into paying clients.',
    fullDescription: 'Custom-designed websites built for Tanzanian enterprises, schools, legal practices, clinics, NGOs, and service businesses. Optimized for fast loading on smartphone data networks, featuring integrated WhatsApp chat buttons, Google Maps location indexing, and SEO to rank at the top of local searches.',
    idealFor: [
      'Corporate companies & professional service firms',
      'Private schools, academies & training institutes',
      'Hotels, tour operators & safari agencies',
      'Clinics, dispensaries & healthcare providers'
    ],
    startingEstimate: 'TSh 450,000 - 1,200,000',
    deliveryTimeline: '1 - 3 Weeks',
    coreFeatures: [
      'Mobile-first responsive layout (Looks flawless on all phones and desktops)',
      'Direct WhatsApp inquiry floating button & contact lead forms',
      'Fast loading speed optimized for 3G/4G networks',
      'Google Maps listing and search engine optimization (SEO)',
      'Custom company domain (.co.tz or .com) and professional staff emails',
      'Easy content management so you can update text and photos anytime'
    ],
    techStack: ['React / Next.js', 'Tailwind CSS', 'TypeScript', 'Node.js', 'Vercel / Cloud Run'],
    iconName: 'Globe'
  },
  {
    id: 'tech-002',
    slug: 'pos-and-retail-inventory-systems',
    title: 'Smart Point-of-Sale (POS) & Multi-Store Inventory Systems',
    categoryTag: 'Business Systems',
    shortDescription: 'Effortless barcode scanning, daily sales tracking, automated stock alerts, and cashier receipt printing.',
    fullDescription: 'Stop losing stock and unrecorded sales. Our custom retail systems run on touchscreen PCs, tablets, or phones. Supports 80mm thermal receipt printing, barcode generation, multi-user cashier permissions, daily profit-and-loss reports, and low-stock SMS notifications.',
    idealFor: [
      'Supermarkets, minimarts & grocery stores',
      'Pharmacies & drug stores (with expiry date tracking)',
      'Stationery & hardware wholesale/retail shops',
      'Boutiques, electronics shops & spare parts centers'
    ],
    startingEstimate: 'TSh 800,000 - 2,500,000',
    deliveryTimeline: '2 - 4 Weeks',
    coreFeatures: [
      'Ultra-fast barcode scanning and instant thermal receipt printing',
      'Automatic stock level deduction and low-inventory reorder alerts',
      'User roles: Cashier (sales only) vs. Manager (prices and stock control)',
      'Daily, weekly, and monthly sales summary sent to owner via WhatsApp/Email',
      'Offline resilience — works smoothly even during internet drops',
      'Customer credit/debt tracking with payment history'
    ],
    techStack: ['React', 'Electron / Web', 'SQLite / PostgreSQL', 'Thermal Printer ESC/POS'],
    iconName: 'Store'
  },
  {
    id: 'tech-003',
    slug: 'mobile-app-development',
    title: 'Native Android & Cross-Platform Mobile Applications',
    categoryTag: 'Mobile Apps',
    shortDescription: 'Custom mobile apps with push notifications, M-Pesa mobile money payments, and offline storage.',
    fullDescription: 'We engineer intuitive mobile applications for Android and iOS that solve real-world problems. Whether you need a customer-facing delivery app, field technician dispatch tool, or member portal, we build clean apps with fast performance and reliable backend APIs.',
    idealFor: [
      'On-demand delivery & logistics services',
      'Micro-finance SACCOS & member loan trackers',
      'E-commerce stores with in-app mobile money checkout',
      'Community, church & organization member directories'
    ],
    startingEstimate: 'TSh 1,500,000 - 4,500,000',
    deliveryTimeline: '4 - 8 Weeks',
    coreFeatures: [
      'Tanzanian Mobile Money integration (M-Pesa, Tigo Pesa, Airtel Money)',
      'Push notifications for orders, promotions, and status updates',
      'Google Maps GPS live delivery tracking',
      'Google Play Store listing, asset design, and publication guidance',
      'Clean UI tested on budget and flagship Android devices'
    ],
    techStack: ['Flutter / React Native', 'Firebase', 'Node.js', 'REST APIs'],
    iconName: 'Smartphone'
  },
  {
    id: 'tech-004',
    slug: 'business-monitoring-and-analytics-dashboards',
    title: 'Business Performance & Live Monitoring Dashboards',
    categoryTag: 'Analytics & Monitoring',
    shortDescription: 'Real-time executive dashboards summarizing branch sales, staff attendance, stock levels, and expenses.',
    fullDescription: 'Empower business owners to oversee operations from their phone anywhere in the world. We consolidate data from multiple branches, cash registers, and warehouses into crystal-clear visual graphs, profit-and-loss trackers, and automated morning briefing reports.',
    idealFor: [
      'Multi-branch business owners & entrepreneurs',
      'Factory managers, distribution hubs & warehouses',
      'Service businesses tracking technician billable hours',
      'Executive boards needing clean monthly KPI visualizers'
    ],
    startingEstimate: 'TSh 950,000 - 3,000,000',
    deliveryTimeline: '2 - 5 Weeks',
    coreFeatures: [
      'Live sales and expense feed updating in real time',
      'Interactive visual charts (Revenue trends, top selling items, peak hours)',
      'Multi-branch comparison and inventory transfer oversight',
      'Role-based granular access (Branch managers see only their location)',
      'Automated daily PDF report dispatch directly to director\'s WhatsApp'
    ],
    techStack: ['React', 'D3 / Recharts', 'Tailwind CSS', 'PostgreSQL', 'Express API'],
    iconName: 'BarChart3'
  },
  {
    id: 'tech-005',
    slug: 'custom-web-applications-and-portals',
    title: 'Custom Web Applications & Workflow Automation',
    categoryTag: 'Custom Software',
    shortDescription: 'Tailor-made software systems designed around your unique operational procedures and paperwork.',
    fullDescription: 'Replace slow, error-prone paper registers and messy Excel spreadsheets with a streamlined web portal. We model your exact business workflows into structured digital forms, approval hierarchies, and automated invoice generators.',
    idealFor: [
      'School management (Student grading, report cards, fees tracking)',
      'Rental property & apartment tenant management',
      'Car rental, garage & workshop job-card systems',
      'Law firm case file management and document indexing'
    ],
    startingEstimate: 'TSh 1,200,000 - 5,000,000',
    deliveryTimeline: '3 - 8 Weeks',
    coreFeatures: [
      'Completely custom database architecture matching your exact paperwork',
      'Multi-step workflow approvals (e.g. Clerk drafts $\\rightarrow$ Supervisor approves)',
      'Automated PDF invoice, receipt, and report card generation',
      'Audit log tracking every user edit and delete action',
      'Automated daily cloud backups'
    ],
    techStack: ['TypeScript', 'Next.js / React', 'Node.js', 'PostgreSQL / Firestore', 'Tailwind CSS'],
    iconName: 'Cpu'
  }
];
