import { BaseService } from '../types';

export const printingServices: BaseService[] = [
  {
    id: 'prt-001',
    slug: 'black-and-white-printing',
    title: 'High-Speed Black & White Printing & Photocopying',
    category: 'Printing',
    shortDescription: 'Crisp, high-contrast monochrome printing for reports, exam papers, legal contracts, and manuals.',
    description: 'Using high-speed commercial production copiers, we deliver crisp text and sharp line art at 120 pages per minute. Available on standard 80 GSM, 100 GSM, and cardstock with single or double-sided printing.',
    turnaroundTime: 'Instant / Same-Day',
    pricingLabel: 'From TSh 100 / page',
    startingPrice: 100,
    iconName: 'Printer',
    features: [
      'Crisp 1200 DPI laser monochrome clarity',
      'High-speed batch processing for bulk orders (up to 5,000+ pages)',
      'Double-sided (duplex) automatic alignment',
      'Stapling and collating options available'
    ]
  },
  {
    id: 'prt-002',
    slug: 'full-color-digital-printing',
    title: 'Vibrant Full-Color Digital Printing',
    category: 'Printing',
    shortDescription: 'High-definition color output for presentations, brochures, certificates, and student projects.',
    description: 'True-color digital output with rich color saturation and balanced skin tones. Perfect for project submissions, company profiles, graphic portfolios, and visual handouts.',
    turnaroundTime: '15 - 30 Minutes',
    pricingLabel: 'From TSh 500 / page',
    startingPrice: 500,
    iconName: 'Palette',
    features: [
      'Rich CMYK true-color laser printing',
      'Glossy and semi-gloss paper choices available',
      'Edge-to-edge borderless printing on photo papers',
      'Volume discounts on corporate multi-page presentations'
    ]
  },
  {
    id: 'prt-003',
    slug: 'document-scanning-digitization',
    title: 'High-Resolution Document Scanning & Digitization',
    category: 'Printing',
    shortDescription: 'Convert paper records, certificates, and books into searchable PDF, JPEG, or TIFF digital files.',
    description: 'Preserve and digitize your vital documents, academic certificates, NIDA receipts, and title deeds. We scan directly to USB, email, Google Drive, or WhatsApp with OCR optical text enhancement.',
    turnaroundTime: 'Instant while you wait',
    pricingLabel: 'From TSh 300 / page',
    startingPrice: 300,
    iconName: 'Scan',
    features: [
      'Multi-page automatic document feeder (ADF) for quick processing',
      'Up to 1200 DPI color scanning resolution',
      'OCR conversion to editable Microsoft Word files upon request',
      'Direct WhatsApp and email dispatch'
    ]
  },
  {
    id: 'prt-004',
    slug: 'typing-and-document-formatting',
    title: 'Fast Typing & Professional Document Formatting',
    category: 'Printing',
    shortDescription: 'Accurate Swahili and English typing, thesis formatting, tabular reports, and legal agreements.',
    description: 'Bring your handwritten notes, university research drafts, or business proposals. Our professional typists ensure 100% spelling precision, correct Tanzanian legal layout standards, and APA/Harvard academic citations.',
    turnaroundTime: '1 - 4 Hours depending on length',
    pricingLabel: 'From TSh 1,500 / page',
    startingPrice: 1500,
    iconName: 'FileText',
    features: [
      'Bilingual typing in fluent Kiswahili and English',
      'Academic thesis & research paper formatting to university standards',
      'Equations, mathematical formulas, and spreadsheet tables',
      'Confidentiality guaranteed for legal documents'
    ]
  },
  {
    id: 'prt-005',
    slug: 'spiral-tape-hardcover-binding',
    title: 'Spiral, Thermal Tape & Hardcover Thesis Binding',
    category: 'Printing',
    shortDescription: 'Professional finishing for reports, project work, tenders, user manuals, and school books.',
    description: 'Transform loose printed sheets into elegant, durable books. We offer clear PVC front covers, textured leatherette back covers, durable plastic or wire combs, and gold-foil embossed hardcovers for academic dissertations.',
    turnaroundTime: '15 Mins (Spiral) / 24 Hours (Gold Embossed Hardcover)',
    pricingLabel: 'From TSh 2,500 / book',
    startingPrice: 2500,
    iconName: 'BookOpen',
    features: [
      'Plastic coil and double-loop wire-o spiral binding',
      'Thermal cloth tape spine binding for proposals',
      'Gold and silver foil lettering on leatherette hardcovers',
      'Clear protective acetate front covers included'
    ]
  },
  {
    id: 'prt-006',
    slug: 'hot-pouch-lamination-a4-a3',
    title: 'Heavy-Duty Hot Pouch Lamination (A4, A3, ID Size)',
    category: 'Printing',
    shortDescription: 'Waterproof, tear-proof, high-gloss protective lamination for certificates, IDs, and menus.',
    description: 'Protect your irreplaceable documents from spills, dirt, and wear. We use heavy 125-micron to 250-micron high-clarity pouches with heat-sealed borders that never peel or cloud over time.',
    turnaroundTime: 'Instant (2 Minutes)',
    pricingLabel: 'From TSh 1,000 / page',
    startingPrice: 1000,
    iconName: 'ShieldCheck',
    features: [
      'A4, A3, A5, and Pocket ID card sizes',
      'High-clarity 150-micron crystal clear thermal seal',
      '100% waterproof and UV fade-resistant',
      'Bubble-free automated thermal rollers'
    ]
  },
  {
    id: 'prt-007',
    slug: 'instant-passport-size-photos',
    title: 'Instant Studio Passport-Size Photos (Print & Soft Copy)',
    category: 'Printing',
    shortDescription: 'Biometric standard passport photos for Passports, Visas, Driving License, NIDA, and School IDs.',
    description: 'Professional mini-studio lighting setup with crisp white, blue, or red backdrop. Includes minor retouching, print strip of 4 or 8 physical photos on glossy photo paper, and compressed digital copy sent to your phone.',
    turnaroundTime: '5 - 10 Minutes',
    pricingLabel: 'TSh 5,000 / set of 4 pcs',
    startingPrice: 5000,
    iconName: 'Camera',
    features: [
      'Strict adherence to Tanzanian Immigration and international Visa specs',
      'Choice of white, sky blue, or crimson red backdrop',
      'Glossy photo paper with scratch-resistant coating',
      'Free soft-copy sent via WhatsApp or email'
    ]
  },
  {
    id: 'prt-008',
    slug: 'professional-cv-and-cover-letter',
    title: 'Modern CV Preparation & ATS Resume Writing',
    category: 'Printing',
    shortDescription: 'Stand out to employers with modern layout, impactful phrasing, and ATS-friendly digital CVs.',
    description: 'Our career document specialists restructure your work experience and academic achievements into a compelling, professional CV. Includes an editable Word copy and print-ready PDF.',
    turnaroundTime: 'Same-Day / 3 Hours',
    pricingLabel: 'From TSh 10,000',
    startingPrice: 10000,
    iconName: 'Award',
    features: [
      'Clean modern templates tailored to your industry',
      'Keyword optimization for automated applicant tracking systems (ATS)',
      'Customized professional Cover Letter add-on',
      'Delivered in PDF + editable Microsoft Word (.docx)'
    ]
  }
];

export const documentServices = printingServices;

export const graphicDesignServices: BaseService[] = [
  {
    id: 'des-001',
    slug: 'brand-logo-and-visual-identity',
    title: 'Custom Brand Logo & Corporate Visual Identity',
    category: 'Graphic Design',
    shortDescription: 'Unique, memorable logo marks, typography pairings, color palettes, and brand guidelines.',
    description: 'We build visual identities that command respect in the Tanzanian and international marketplace. You receive scalable vector source files (AI, SVG, EPS, PDF, PNG) ready for billboards, websites, and embroidery.',
    turnaroundTime: '2 - 4 Business Days',
    pricingLabel: 'From TSh 50,000',
    startingPrice: 50000,
    iconName: 'Sparkles',
    features: [
      '3 Distinct creative concepts to choose from',
      'Unlimited revisions on the chosen concept',
      'Full master vector files (AI, SVG, PDF, high-res PNG)',
      'Social media profile avatars and favicon assets included'
    ]
  },
  {
    id: 'des-002',
    slug: 'posters-flyers-and-event-banners',
    title: 'Promotional Posters, Flyers & Digital Social Graphics',
    category: 'Graphic Design',
    shortDescription: 'High-converting graphics for product launches, church conferences, sales offers, and WhatsApp status.',
    description: 'Eye-catching layouts optimized both for physical print distribution and smartphone social media feeds (Instagram, Facebook, WhatsApp flyers).',
    turnaroundTime: '24 - 48 Hours',
    pricingLabel: 'From TSh 25,000',
    startingPrice: 25000,
    iconName: 'Image',
    features: [
      'High-impact modern typography and photographic composition',
      'Formatted for A5/A4 print and 1:1 / 9:16 social media resolutions',
      'Print-ready PDF with bleed crop marks',
      'Fast turnaround for urgent promotional events'
    ]
  },
  {
    id: 'des-003',
    slug: 'premium-business-cards-and-stationery-suite',
    title: 'Executive Business Cards & Corporate Letterheads',
    category: 'Graphic Design',
    shortDescription: 'Impress partners and clients with bespoke stationery suites and QR-code enabled business cards.',
    description: 'Complete stationery design including business cards (matte lamination, spot UV, rounded corners), official letterheads with TIN details, and branded presentation envelopes.',
    turnaroundTime: '1 - 2 Days',
    pricingLabel: 'From TSh 20,000 (Design) / TSh 35,000 (With 100 Printed Cards)',
    startingPrice: 20000,
    iconName: 'CreditCard',
    features: [
      'Modern double-sided layout with scannable digital vCard QR code',
      'Matching Microsoft Word letterhead template for office typing',
      'Compliant with Tanzanian corporate TIN/VRN layout rules',
      'Package deals with in-house TK Stationery high-gsm printing'
    ]
  }
];

export const itSupportServices: BaseService[] = [
  {
    id: 'it-001',
    slug: 'pc-diagnostics-and-hardware-repair',
    title: 'Computer Diagnostics & Hardware Troubleshooting',
    category: 'IT Support',
    shortDescription: 'Laptop and desktop motherboard diagnostics, RAM/SSD upgrades, screen replacements, and cleaning.',
    description: 'Speed up sluggish computers. We perform deep hardware checks, thermal paste reapplication, fan dust removal, failing hard drive recovery, and high-speed Solid State Drive (SSD) installations.',
    turnaroundTime: 'Same-Day / 24 Hours',
    pricingLabel: 'Diagnostics from TSh 10,000',
    startingPrice: 10000,
    iconName: 'Cpu',
    features: [
      'Fast diagnosis of blue-screen crashes and boot failures',
      'SSD speed upgrades that make old laptops 5x faster',
      'Original replacement chargers, batteries, and keyboards',
      '30-Day service warranty on all hardware installations'
    ]
  },
  {
    id: 'it-002',
    slug: 'operating-system-and-software-setup',
    title: 'Windows/Mac OS Installation & Genuine Software Setup',
    category: 'IT Support',
    shortDescription: 'Clean OS installations, Microsoft Office activation, antivirus protection, and data migration.',
    description: 'Get your machine running fresh and secure. We install Windows 10/11 Pro or macOS with full driver optimization, genuine Microsoft Office suites, PDF editors, and active endpoint security.',
    turnaroundTime: '2 - 3 Hours',
    pricingLabel: 'From TSh 25,000',
    startingPrice: 25000,
    iconName: 'Laptop',
    features: [
      'Complete data backup and preservation prior to installation',
      'Driver package updates for smooth WiFi, audio, and graphics',
      'Licensed antivirus and malware eradication',
      'Essential utility bundle setup (Chrome, Acrobat, VLC, WinRAR)'
    ]
  },
  {
    id: 'it-003',
    slug: 'office-networking-and-printer-sharing',
    title: 'Office WiFi, LAN Networking & Network Printer Setup',
    category: 'IT Support',
    shortDescription: 'Seamless network configuration so all office computers can share internet, files, and copiers.',
    description: 'Ensure smooth operations across your workplace. We configure wireless routers, crimp ethernet cables, set up shared network folders, and link your office copiers to all staff PCs.',
    turnaroundTime: 'Onsite Booking (1 - 2 Days)',
    pricingLabel: 'Consultation / Onsite quote',
    startingPrice: 40000,
    iconName: 'Network',
    features: [
      'Ethernet structured cabling and WiFi signal extender setup',
      'Network printer driver installation across multiple staff PCs',
      'Secure shared file drive and automated backup system',
      'Onsite technician visits in Dar es Salaam'
    ]
  }
];
