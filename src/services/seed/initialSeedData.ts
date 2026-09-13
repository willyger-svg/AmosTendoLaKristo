import { Product, BaseService, PublicServiceItem, Testimonial } from '../../types';

export const initialProducts: Product[] = [
  {
    id: 'prod-001',
    slug: 'double-a-copy-paper-a4-80gsm-ream',
    name: 'Double A Premium Copy Paper A4 (80 GSM, 500 Sheets)',
    category: 'Paper & Printing',
    price: 14500,
    originalPrice: 16000,
    inStock: true,
    stockCount: 142,
    sku: 'TK-PAP-001',
    brand: 'Double A',
    rating: 4.9,
    reviewCount: 38,
    featured: true,
    isBestSeller: true,
    shortDescription: 'High-opacity, smooth 80 GSM multipurpose copy paper. Ideal for laser and inkjet printing.',
    description: 'Double A is premium quality paper renowned for its excellent performance and environmental friendliness. 80 GSM thickness prevents paper jams and ensures crisp, vibrant printing with no bleed-through on both sides.',
    specifications: {
      'Size': 'A4 (210 x 297 mm)',
      'Grammage': '80 GSM',
      'Sheets/Ream': '500 Sheets',
      'Brightness': '102-104% CIE',
      'Suitability': 'Laser, Inkjet, High-Speed Copiers, Fax'
    },
    image: 'https://images.unsplash.com/photo-1589330694653-ded6df03f754?auto=format&fit=crop&w=600&q=80',
    tags: ['Paper', 'Ream', 'A4', 'Double A', 'Office'],
    unit: 'Ream'
  },
  {
    id: 'prod-002',
    slug: 'bic-cristal-ballpoint-pens-box-50-blue',
    name: 'BIC Cristal Medium Ballpoint Pens (Box of 50, Blue)',
    category: 'Writing Materials',
    price: 13000,
    originalPrice: 15000,
    inStock: true,
    stockCount: 65,
    sku: 'TK-WRT-002',
    brand: 'BIC',
    rating: 4.8,
    reviewCount: 27,
    featured: true,
    isBestSeller: true,
    shortDescription: 'Classic hexagonal barrel pen with smooth 1.0mm point. Writes for over 2 kilometers.',
    description: 'The world’s most trusted writing pen. Features a clear barrel for visible ink supply and long-lasting tungsten carbide ball for consistent ink flow without smudging.',
    specifications: {
      'Point Size': '1.0 mm Medium Point',
      'Ink Color': 'Blue',
      'Packaging': 'Pack of 50 Pens',
      'Origin': 'Original BIC Genuine Stock'
    },
    image: 'https://images.unsplash.com/photo-1585336261026-77cc7c39299f?auto=format&fit=crop&w=600&q=80',
    tags: ['Pens', 'BIC', 'Office', 'School', 'Writing'],
    unit: 'Box (50 pcs)'
  },
  {
    id: 'prod-003',
    slug: 'oxford-helix-oxford-mathematical-set',
    name: 'Helix Oxford Complete Mathematical Instruments Set',
    category: 'School Supplies',
    price: 6500,
    inStock: true,
    stockCount: 88,
    sku: 'TK-SCH-003',
    brand: 'Helix Oxford',
    rating: 4.9,
    reviewCount: 45,
    featured: true,
    shortDescription: 'Essential 9-piece geometry set in traditional embossed metal tin. Approved for national exams.',
    description: 'The world-renowned Helix Oxford Maths Set. Contains a metal self-centering compass, 9cm pencil, 15cm ruler, 180° protractor, 45° and 60° set squares, sharpener, and PVC-free eraser inside a durable tin case.',
    specifications: {
      'Components': '9 Essential Geometric Tools',
      'Case': 'Embossed Metal Storage Tin',
      'Safety': 'Safety point compass & shatter-resistant plastics',
      'Curriculum': 'Standard NECTA & Cambridge compliant'
    },
    image: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=600&q=80',
    tags: ['Math Set', 'School', 'Geometry', 'Oxford', 'Students'],
    unit: 'Set'
  },
  {
    id: 'prod-004',
    slug: 'deli-heavy-duty-lever-arch-file-a4-75mm',
    name: 'Deli Heavy-Duty Lever Arch File A4 (75mm Spine)',
    category: 'Files & Folders',
    price: 7500,
    originalPrice: 8500,
    inStock: true,
    stockCount: 110,
    sku: 'TK-FIL-004',
    brand: 'Deli',
    rating: 4.7,
    reviewCount: 19,
    featured: true,
    shortDescription: 'Rigid polypropylene coated board with metal shoe reinforcement and finger pull ring.',
    description: 'Keep your contracts, receipts, and public agency documents organized. Built with heavy gauge lever arch mechanism and replaceable spine label pocket for easy office classification.',
    specifications: {
      'Capacity': 'Up to 500 A4 Sheets (75mm spine)',
      'Material': 'Reinforced laminated hardboard with metal edges',
      'Colors': 'Classic Navy Blue, Black, Crimson Red',
      'Mechanism': 'Nickel-plated steel lever lock'
    },
    image: 'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?auto=format&fit=crop&w=600&q=80',
    tags: ['Files', 'Folders', 'Office', 'Filing', 'Deli'],
    unit: 'Piece'
  },
  {
    id: 'prod-005',
    slug: 'casio-fx-991ex-classwiz-scientific-calculator',
    name: 'Casio FX-991EX ClassWiz Scientific Calculator (Genuine)',
    category: 'School Supplies',
    price: 65000,
    originalPrice: 72000,
    inStock: true,
    stockCount: 18,
    sku: 'TK-ACC-005',
    brand: 'Casio',
    rating: 5.0,
    reviewCount: 31,
    featured: true,
    isBestSeller: true,
    shortDescription: 'High-resolution natural textbook display with 552 mathematical and scientific functions.',
    description: 'The preferred calculator for A-Level, University, Engineering, and Accounting students. Features high-res LCD screen, spreadsheet calculations, matrix operations, equation solvers, and solar dual power.',
    specifications: {
      'Display': 'Natural Textbook High-Resolution LCD (192 x 63 dots)',
      'Power Source': 'Solar Cell + LR44 Backup Battery',
      'Functions': '552 Advanced Scientific & Matrix Functions',
      'Warranty': '1 Year TK Stationery Quality Guarantee'
    },
    image: 'https://images.unsplash.com/photo-1594980596870-8aa52a78d8cd?auto=format&fit=crop&w=600&q=80',
    tags: ['Calculator', 'Casio', 'Scientific', 'Engineering', 'School'],
    unit: 'Unit'
  },
  {
    id: 'prod-006',
    slug: 'kasuku-a4-counter-book-3-quire-384-pages',
    name: 'Kasuku Premium Hardcover Counter Book (3 Quire / 384 Pages)',
    category: 'School Supplies',
    price: 5500,
    inStock: true,
    stockCount: 220,
    sku: 'TK-SCH-006',
    brand: 'Kasuku',
    rating: 4.8,
    reviewCount: 52,
    featured: false,
    isBestSeller: true,
    shortDescription: 'Sturdy hardcover counter notebook with feint ruled margins. Built for intense daily note taking.',
    description: 'Kasuku is East Africa’s iconic student notebook brand. Sewn binding ensures pages never fall out even with heavy school and college use throughout the academic year.',
    specifications: {
      'Page Count': '3 Quire (384 Pages / 192 Leaves)',
      'Ruling': 'Single Feint with Margin Line',
      'Cover': 'Heavy Laminated Hardcover in Traditional Kasuku Marble Design',
      'Binding': 'Thread Sewn with Reinforced Spine'
    },
    image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80',
    tags: ['Counter Book', 'Notebook', 'Kasuku', 'School', '3 Quire'],
    unit: 'Book'
  },
  {
    id: 'prod-007',
    slug: 'sandisk-cruzer-blade-32gb-usb-flash-drive',
    name: 'SanDisk Cruzer Blade 32GB USB 2.0 Flash Drive',
    category: 'Computer Accessories',
    price: 18000,
    originalPrice: 22000,
    inStock: true,
    stockCount: 40,
    sku: 'TK-ACC-007',
    brand: 'SanDisk',
    rating: 4.9,
    reviewCount: 22,
    featured: true,
    shortDescription: 'Compact, portable plug-and-play USB drive for storing print documents, projects, and backups.',
    description: 'Original SanDisk USB storage. Essential for bringing your PDFs, designs, CVs, and documents to TK Stationery for instant fast printing and scanning services.',
    specifications: {
      'Storage Capacity': '32 GB',
      'Interface': 'USB 2.0 High-Speed',
      'Compatibility': 'Windows, Mac, Linux, Copiers, Printers',
      'Security': 'SanDisk SecureAccess 128-bit AES Encryption support'
    },
    image: 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?auto=format&fit=crop&w=600&q=80',
    tags: ['Flash Drive', 'USB', 'SanDisk', 'Computer Accessories', 'Storage'],
    unit: 'Piece'
  },
  {
    id: 'prod-008',
    slug: 'deli-desktop-stapler-with-1000-staples',
    name: 'Deli Metal Desktop Stapler (25-Sheet Capacity + Pack of 1000 Staples)',
    category: 'Office Supplies',
    price: 8500,
    inStock: true,
    stockCount: 54,
    sku: 'TK-OFC-008',
    brand: 'Deli',
    rating: 4.6,
    reviewCount: 14,
    featured: false,
    shortDescription: 'Durable steel construction with anti-skid rubber base and integrated staple remover.',
    description: 'Smooth stapling performance for offices, schools, and document filing. Handles up to 25 sheets of 80 GSM paper without jamming. Includes 1 full box of 24/6 Deli staples.',
    specifications: {
      'Stapling Capacity': '25 Sheets (80 GSM)',
      'Staple Type': 'Standard 24/6 or 26/6',
      'Throat Depth': '65 mm',
      'Includes': '1x Stapler + 1x Box of 1,000 Staples'
    },
    image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80',
    tags: ['Stapler', 'Office Supplies', 'Deli', 'Desk Tools'],
    unit: 'Set'
  },
  {
    id: 'prod-009',
    slug: 'staedtler-noris-hb-graphite-pencils-pack-12',
    name: 'Staedtler Noris 2B / HB Graphite Pencils (Pack of 12)',
    category: 'Writing Materials',
    price: 7000,
    inStock: true,
    stockCount: 95,
    sku: 'TK-WRT-009',
    brand: 'Staedtler',
    rating: 4.9,
    reviewCount: 33,
    featured: false,
    shortDescription: 'German break-resistant graphite pencil. Iconic yellow and black striped finish.',
    description: 'High break-resistance through special lead formulation and super-bonded lead. Ideal for school drawing, drafting, exam answer sheets, and sketching.',
    specifications: {
      'Lead Grade': 'HB / 2B Standard',
      'Pack Size': '12 Pencils in Box',
      'Wood Source': 'Certified sustainably managed forests',
      'Manufacturing': 'Made in Germany'
    },
    image: 'https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?auto=format&fit=crop&w=600&q=80',
    tags: ['Pencils', 'Staedtler', 'School', 'Writing', 'Art'],
    unit: 'Pack (12 pcs)'
  },
  {
    id: 'prod-010',
    slug: 'transparent-clear-document-envelopes-pack-10',
    name: 'Transparent Button Document Sleeves / Envelopes A4 (Pack of 10)',
    category: 'Files & Folders',
    price: 5000,
    inStock: true,
    stockCount: 130,
    sku: 'TK-FIL-010',
    brand: 'TK Select',
    rating: 4.7,
    reviewCount: 16,
    featured: false,
    shortDescription: 'Waterproof polypropylene folders with press-stud closure for certificates and official papers.',
    description: 'Protect your NIDA IDs, TRA receipts, academic certificates, and CV copies from dust, moisture, and tearing during travel and interviews.',
    specifications: {
      'Size': 'A4 Plus (Fits standard A4 certificates and contracts)',
      'Material': '0.18mm Water-resistant Polypropylene (PP)',
      'Closure': 'Durable Snap Button',
      'Pack': '10 Assorted Colors (Clear, Blue, Yellow, Green, Pink)'
    },
    image: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=600&q=80',
    tags: ['Folders', 'Envelopes', 'Plastic Sleeves', 'Office', 'Document Protection'],
    unit: 'Pack (10 pcs)'
  },
  {
    id: 'prod-011',
    slug: 'thermal-receipt-paper-rolls-80x80mm-pack-5',
    name: 'POS Thermal Receipt Paper Rolls 80x80mm (Pack of 5)',
    category: 'Paper & Printing',
    price: 12000,
    inStock: true,
    stockCount: 75,
    sku: 'TK-PAP-011',
    brand: 'TK Select',
    rating: 4.8,
    reviewCount: 20,
    featured: false,
    shortDescription: 'High-sensitivity thermal paper for retail POS printers, restaurant counters, and EFD billing.',
    description: 'Lint-free white thermal paper rolls that provide clean, dark, smudge-free receipts. Compatible with all 80mm thermal receipt printers.',
    specifications: {
      'Dimensions': '80mm Width x 80mm Diameter (Approx 55 meters length)',
      'Core Size': '12mm standard plastic core',
      'Quantity': 'Pack of 5 shrink-wrapped rolls',
      'Shelf Life': '5-year image preservation under standard indoor storage'
    },
    image: 'https://images.unsplash.com/photo-1589330694653-ded6df03f754?auto=format&fit=crop&w=600&q=80',
    tags: ['POS', 'Thermal Paper', 'Receipt Rolls', 'Business', 'EFD'],
    unit: 'Pack (5 rolls)'
  },
  {
    id: 'prod-012',
    slug: 'logitech-m170-wireless-optical-mouse',
    name: 'Logitech M170 Reliable Wireless Mouse (2.4GHz with Nano USB)',
    category: 'Computer Accessories',
    price: 32000,
    originalPrice: 38000,
    inStock: true,
    stockCount: 28,
    sku: 'TK-ACC-012',
    brand: 'Logitech',
    rating: 4.9,
    reviewCount: 41,
    featured: true,
    shortDescription: '10-meter wireless range, 12-month battery life, ambidextrous ergonomic design.',
    description: 'Work comfortably all day. Logitech plug-and-forget wireless nano receiver provides strong 2.4 GHz connection with zero delays. Essential for laptop users, office desks, and digital designers.',
    specifications: {
      'Connectivity': '2.4 GHz Wireless (10m range)',
      'Sensor': 'Smooth Optical Tracking 1000 DPI',
      'Battery': '1x AA Battery (Included, up to 12 months life)',
      'Compatibility': 'Windows 10/11, macOS, ChromeOS, Linux'
    },
    image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=600&q=80',
    tags: ['Mouse', 'Logitech', 'Wireless', 'Computer Accessories', 'Hardware'],
    unit: 'Piece'
  }
];

export const initialPrintingServices: BaseService[] = [
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

export const initialPublicServices: PublicServiceItem[] = [
  {
    id: 'gov-001',
    slug: 'nida-assistance',
    code: 'NIDA',
    title: 'NIDA National ID Registration & NIN Lookup Assistance',
    agencyName: 'National Identification Authority (NIDA)',
    officialPortalUrlPlaceholder: 'https://www.nida.go.tz',
    shortDescription: 'Guidance with online NIDA pre-registration forms, National Identification Number (NIN) retrieval, and bio-data status verification.',
    fullDescription: 'TK Stationery provides private document guidance and internet assistance to help citizens and residents navigate the online NIDA portal smoothly. We assist in filling pre-registration forms, printing applicant tracking slips, and formatting required verification attachments.',
    typicalRequirements: [
      'Original Birth Certificate or RITA Verification Certificate',
      'Parents National ID Numbers (NIN) or Certified Voter ID / Birth Certificates',
      'Local Ward / Mwenyekiti wa Mtaa introduction letter (where applicable)',
      'Active mobile phone number registered in the applicant\'s legal name'
    ],
    estimatedAssistanceTime: '15 - 30 Minutes desk session',
    tkAssistanceFeeNote: 'Nominal typing, printing, and portal navigation assistance fee: TSh 3,000 - 5,000 (depending on pages printed).',
    officialGovFeeNote: 'NIDA initial registration is an official statutory process. Official government replacement fees (if any) are paid exclusively via official GePG Control Numbers provided directly by NIDA.',
    importantDisclaimer: 'TK Stationery is an independent private business offering digital typing, internet access, and document formatting assistance. TK Stationery is NOT an official office, agent, or representative of NIDA.',
    features: [
      'NIN status lookup and verification portal navigation',
      'Pre-registration form completion & high-quality barcode printout',
      'Document scanning and resolution resizing for portal uploads',
      'Replacement guidance and lost slip documentation'
    ],
    icon: 'IdCard'
  },
  {
    id: 'gov-002',
    slug: 'tra-tax-assistance',
    code: 'TRA',
    title: 'TRA Taxpayer Identification Number (TIN) & Tax Return Guidance',
    agencyName: 'Tanzania Revenue Authority (TRA)',
    officialPortalUrlPlaceholder: 'https://www.tra.go.tz',
    shortDescription: 'Assistance with Individual TIN registration, Motor Vehicle / Driving License tax filing portal, and Return submission typing.',
    fullDescription: 'Save time and avoid filing errors. Our experienced document specialists help entrepreneurs, employees, and motor vehicle owners navigate the TRA e-Services system, prepare individual TIN application data, and print certified tax clearance confirmations.',
    typicalRequirements: [
      'Applicant National Identification Number (NIN from NIDA)',
      'Active personal phone number and valid email address',
      'For business TIN: Business name registration certificate from BRELA (if applicable)',
      'Premises lease agreement or physical address details'
    ],
    estimatedAssistanceTime: '20 - 45 Minutes',
    tkAssistanceFeeNote: 'Application data preparation, typing, and certificate printing assistance: TSh 5,000 - 10,000.',
    officialGovFeeNote: 'All statutory taxes, motor vehicle licenses, and stamp duties are payable directly to the Tanzania Revenue Authority through official GePG Control Numbers.',
    importantDisclaimer: 'TK Stationery is not the Tanzania Revenue Authority (TRA). We only assist clients with typing, data entry, scanning, and public portal internet navigation.',
    features: [
      'Individual Taxpayer Identification Number (TIN) online portal form guidance',
      'Motor vehicle road license tax payment control number generation',
      'Presumptive income tax return schedule preparation',
      'High-grade color printing and lamination of TIN certificates'
    ],
    icon: 'FileSpreadsheet'
  },
  {
    id: 'gov-003',
    slug: 'police-loss-report-assistance',
    code: 'POLICE',
    title: 'Police Loss Report (Ripoti ya Upotevu) Online Application Support',
    agencyName: 'Tanzania Police Force (e-Loss Reporting)',
    officialPortalUrlPlaceholder: 'https://www.polisi.go.tz',
    shortDescription: 'Step-by-step assistance in filing official loss declarations online for lost IDs, SIM cards, academic certificates, and electronics.',
    fullDescription: 'If you have lost your NIDA ID, academic certificates, driving license, bank card, or smartphone, you need an official Police Loss Report to process replacements. We assist you in drafting clear lost-item declarations, entering serial numbers, generating the official control number, and printing your validated certificate.',
    typicalRequirements: [
      'Details of the lost item (e.g. Phone IMEI, ID number, Certificate index number, Bank card last 4 digits)',
      'Date, approximate time, and location where the loss occurred',
      'Valid identity verification of the applicant',
      'Active phone number to receive SMS confirmation'
    ],
    estimatedAssistanceTime: '10 - 20 Minutes',
    tkAssistanceFeeNote: 'Assistance, typing, and high-grade printout fee: TSh 2,500 - 4,000.',
    officialGovFeeNote: 'The statutory Police Loss Report fee (typically TSh 1,000 via GePG) is paid directly by the citizen using the generated government control number via M-Pesa / Tigo Pesa / Airtel Money.',
    importantDisclaimer: 'TK Stationery does NOT issue police reports. The legal certificate is generated strictly by the Tanzania Police Force online portal upon payment of the official control number.',
    features: [
      'Fast document drafting and loss incident detail typing',
      'Instant GePG control number payment guidance on mobile phone',
      'High-clarity printout and plastic protective sleeve included',
      'Soft copy backup sent to your email or WhatsApp'
    ],
    icon: 'ShieldAlert'
  },
  {
    id: 'gov-004',
    slug: 'rita-assistance',
    code: 'RITA',
    title: 'RITA Birth, Marriage & Death Certificate Portal Assistance',
    agencyName: 'Registration Insolvency and Trusteeship Agency (RITA)',
    officialPortalUrlPlaceholder: 'https://www.rita.go.tz',
    shortDescription: 'Assistance with the e-RITA online management system for new birth certificate applications, verification, and corrections.',
    fullDescription: 'We help families, parents, and students navigate the RITA online portal (eRITA) for registering newborns, verifying existing birth records, applying for certified copies, and uploading supporting maternal clinic cards and hospital birth notifications.',
    typicalRequirements: [
      'Hospital Birth Notification (Kadi ya Kliniki / Taarifa ya Uzazi)',
      'National ID (NIN) of father and mother',
      'Passport size photos of the applicant (can be taken in-store at TK)',
      'Old birth certificate or affidavit (for verification / correction cases)'
    ],
    estimatedAssistanceTime: '20 - 40 Minutes',
    tkAssistanceFeeNote: 'Application typing, document formatting, and scanning fee: TSh 5,000 - 8,000.',
    officialGovFeeNote: 'Official RITA verification and certification statutory fees are paid directly via official government control numbers issued on the eRITA portal.',
    importantDisclaimer: 'TK Stationery is an independent digital bureau. All official verifications and certifications are solely administered by RITA.',
    features: [
      'eRITA portal profile creation and application tracking',
      'High-resolution scanning of clinic cards and affidavits',
      'Passport photo alignment to RITA biometric guidelines',
      'Status tracking and notification alerts'
    ],
    icon: 'FileCheck'
  },
  {
    id: 'gov-005',
    slug: 'napa-assistance',
    code: 'NAPA',
    title: 'NAPA & Public Sector Recruitment Portal Application Support',
    agencyName: 'Public Service Recruitment Secretariats (Ajira / NAPA)',
    officialPortalUrlPlaceholder: 'https://portal.ajira.go.tz',
    shortDescription: 'Assistance for job seekers with Ajira portal profile creation, CV uploading, certificate merging, and application submission.',
    fullDescription: 'Applying for public sector vacancies requires strict adherence to document formatting, PDF compression rules, and certificate indexing. We format your academic transcripts, convert certificates to the required MB sizes, and ensure your profile is 100% compliant with public recruitment criteria.',
    typicalRequirements: [
      'NECTA Form IV & Form VI Index Numbers',
      'College / University Degree Certificate and Academic Transcripts',
      'Updated Curriculum Vitae (CV) formatted in PDF',
      'NIDA National ID Number (NIN)'
    ],
    estimatedAssistanceTime: '30 - 60 Minutes',
    tkAssistanceFeeNote: 'Profile setup, PDF merging, document compression, and submission support: TSh 5,000 - 10,000.',
    officialGovFeeNote: 'Public recruitment applications through official government secretariats are free of official fees unless stated otherwise by the recruitment agency.',
    importantDisclaimer: 'TK Stationery does not offer jobs or guarantee employment. We provide digital typing, file optimization, and internet portal navigation services only.',
    features: [
      'Academic certificate verification and PDF size optimization (< 500KB)',
      'Detailed employment history data entry and letter formatting',
      'Application receipt generation and printed backup portfolio',
      'Notification alerts for shortlisted applicant announcements'
    ],
    icon: 'Briefcase'
  },
  {
    id: 'gov-006',
    slug: 'other-public-services',
    code: 'OTHER',
    title: 'BRELA, HESLB & Tertiary Education Admission Assistance',
    agencyName: 'BRELA / HESLB / TCU / NACTE',
    officialPortalUrlPlaceholder: 'https://ors.brela.go.tz',
    shortDescription: 'Support for Business Name registration (ORS), Higher Education Students Loans (OLAMS), and College admissions.',
    fullDescription: 'Comprehensive internet bureau support for entrepreneurs registering business names on BRELA ORS, secondary school graduates applying for university loans through HESLB, and students applying for college admissions via CAS/NACTE.',
    typicalRequirements: [
      'NIDA National Identification Number (NIN)',
      'NECTA Index Numbers (CSEE / ACSEE)',
      'Proposed business name options (for BRELA)',
      'Guarantor details and local government introduction letters'
    ],
    estimatedAssistanceTime: '30 - 45 Minutes',
    tkAssistanceFeeNote: 'Consultation, data entry, and scanning fee: TSh 5,000 - 15,000.',
    officialGovFeeNote: 'All official registration and loan processing fees are paid exclusively via official GePG Control Numbers.',
    importantDisclaimer: 'TK Stationery provides third-party document typing and digital access facilitation. We do not represent BRELA, HESLB, TCU, or any higher learning institution.',
    features: [
      'BRELA Business Name availability search and online submission',
      'HESLB loan application document scanning and indexing',
      'University and college online admission forms support',
      'Complete printed copies of all submitted documents'
    ],
    icon: 'GraduationCap'
  }
];

export const initialTestimonials: Testimonial[] = [
  {
    id: 't-1',
    name: 'Josephine Kimaro',
    role: 'Mkurugenzi Mtendaji',
    organization: 'Kimaro Logistics Ltd',
    rating: 5,
    comment: 'TK Stationery walichapa vitabu vyetu vya ankara, fomu na risiti kwa haraka na kiwango cha juu sana. Huduma yao ya uwasilishaji Dar es Salaam ni ya kuaminika.',
    serviceUsed: 'Huduma ya Uchapishaji & Vifaa vya Ofisi',
    isDemo: false
  },
  {
    id: 't-2',
    name: 'Dr. Michael S. Mremi',
    role: 'Mhadhiri Mwandamizi',
    organization: 'Chuo Kikuu Dar es Salaam',
    rating: 5,
    comment: 'Kila mara idara yetu inapohitaji vitini vya mitihani, ripoti zilizofungwa kwa hardcover au karatasi za ream, TK Stationery wanatoa ubora wa hali ya juu bila makosa.',
    serviceUsed: 'Uchapishaji na Hardcover Binding',
    isDemo: false
  },
  {
    id: 't-3',
    name: 'Aisha J. Mussa',
    role: 'Mfanyabiashara',
    organization: 'Mteja wa Huduma za TRA & NIDA',
    rating: 5,
    comment: 'Nilipata msaada mkubwa sana wa kutengenezewa TIN yangu ya biashara na kusajili maombi kwenye Ajira Portal. Wafanyakazi wao wana uelewa mkubwa na subira.',
    serviceUsed: 'Huduma za Serikali Mtandaoni',
    isDemo: false
  }
];
