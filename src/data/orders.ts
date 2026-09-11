import { Order, ServiceTicket, QuoteRequest, Testimonial } from '../types';

export const mockOrders: Order[] = [
  {
    id: 'TK-ORD-1042',
    customerName: 'Juma Ramadhani',
    customerPhone: '+255 712 345 678',
    customerEmail: 'juma.r@gmail.com',
    items: [
      {
        productId: 'prod-001',
        productName: 'Double A Premium Copy Paper A4 (80 GSM)',
        unitPrice: 14500,
        quantity: 3,
        totalPrice: 43500,
        image: 'https://images.unsplash.com/photo-1589330694653-ded6df03f754?auto=format&fit=crop&w=600&q=80'
      },
      {
        productId: 'prod-002',
        productName: 'BIC Cristal Medium Ballpoint Pens (Box of 50)',
        unitPrice: 13000,
        quantity: 1,
        totalPrice: 13000,
        image: 'https://images.unsplash.com/photo-1585336261026-77cc7c39299f?auto=format&fit=crop&w=600&q=80'
      }
    ],
    subtotal: 56500,
    deliveryFee: 5000,
    total: 61500,
    deliveryMethod: 'Dar es Salaam Delivery',
    deliveryDistrict: 'Kinondoni (Mwananyamala)',
    deliveryAddress: 'Near Mwananyamala Hospital, Block B',
    paymentMethod: 'Mobile Money (M-Pesa / Tigo Pesa / Airtel Money)',
    paymentStatus: 'Pending (Pay on Delivery/Pickup)',
    status: 'Out for Delivery',
    createdAt: '2026-08-29T10:15:00Z',
    updatedAt: '2026-08-30T07:30:00Z',
    notes: 'Please call before arrival.'
  },
  {
    id: 'TK-ORD-1043',
    customerName: 'Neema Mwamburi',
    customerPhone: '+255 754 889 900',
    customerEmail: 'neema.m@yahoo.com',
    items: [
      {
        productId: 'prod-005',
        productName: 'Casio FX-991EX ClassWiz Scientific Calculator',
        unitPrice: 65000,
        quantity: 1,
        totalPrice: 65000,
        image: 'https://images.unsplash.com/photo-1594980596870-8aa52a78d8cd?auto=format&fit=crop&w=600&q=80'
      },
      {
        productId: 'prod-003',
        productName: 'Helix Oxford Mathematical Instruments Set',
        unitPrice: 65000,
        quantity: 1,
        totalPrice: 6500,
        image: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=600&q=80'
      }
    ],
    subtotal: 71500,
    deliveryFee: 0,
    total: 71500,
    deliveryMethod: 'Store Pickup',
    paymentMethod: 'Cash / Pay at Store',
    paymentStatus: 'Pending (Pay on Delivery/Pickup)',
    status: 'Ready',
    createdAt: '2026-08-29T14:30:00Z',
    updatedAt: '2026-08-29T16:00:00Z',
    notes: 'Will pick up on Saturday morning.'
  },
  {
    id: 'TK-ORD-1044',
    customerName: 'Baraka Shadrack',
    customerPhone: '+255 786 112 233',
    items: [
      {
        productId: 'prod-004',
        productName: 'Deli Heavy-Duty Lever Arch File A4',
        unitPrice: 7500,
        quantity: 10,
        totalPrice: 75000,
        image: 'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?auto=format&fit=crop&w=600&q=80'
      }
    ],
    subtotal: 75000,
    deliveryFee: 5000,
    total: 80000,
    deliveryMethod: 'Dar es Salaam Delivery',
    deliveryDistrict: 'Ilala (Posta / CBD)',
    deliveryAddress: 'Samora Avenue, 3rd Floor Office 304',
    paymentMethod: 'Bank / Store payment',
    paymentStatus: 'Paid',
    status: 'Completed',
    createdAt: '2026-08-28T09:00:00Z',
    updatedAt: '2026-08-28T15:45:00Z'
  },
  {
    id: 'TK-ORD-1045',
    customerName: 'Amina Kassim',
    customerPhone: '+255 765 443 322',
    items: [
      {
        productId: 'prod-006',
        productName: 'Kasuku Premium Hardcover Counter Book (3 Quire)',
        unitPrice: 5500,
        quantity: 6,
        totalPrice: 33000,
        image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80'
      }
    ],
    subtotal: 33000,
    deliveryFee: 0,
    total: 33000,
    deliveryMethod: 'Store Pickup',
    paymentMethod: 'Cash / Pay at Store',
    paymentStatus: 'Pending (Pay on Delivery/Pickup)',
    status: 'Submitted',
    createdAt: '2026-08-30T06:10:00Z',
    updatedAt: '2026-08-30T06:10:00Z'
  }
];

export const mockServiceTickets: ServiceTicket[] = [
  {
    id: 'TK-PRT-4091',
    serviceType: 'Printing',
    serviceTitle: 'University Thesis Hardcover Gold-Foil Binding (3 Copies)',
    customerName: 'Emmanuel Lyimo',
    customerPhone: '+255 713 990 011',
    customerEmail: 'e.lyimo@udsm.ac.tz',
    status: 'Processing',
    estimatedCost: 75000,
    details: {
      pagesPerCopy: 145,
      copies: 3,
      colorType: 'Mixed (B&W + 20 Color pages)',
      binding: 'Hardcover Gold Lettering (Navy Blue)',
      targetPickup: 'Today by 4:00 PM'
    },
    createdAt: '2026-08-30T02:00:00Z',
    updatedAt: '2026-08-30T05:00:00Z',
    fileName: 'Final_Thesis_Lyimo_Emmanuel_2026.pdf'
  },
  {
    id: 'TK-GOV-2088',
    serviceType: 'Public Service',
    serviceTitle: 'Police Loss Report (Lost NIDA ID & Driving License)',
    customerName: 'Fatma Said',
    customerPhone: '+255 777 554 433',
    status: 'Ready',
    estimatedCost: 3500,
    details: {
      portal: 'Tanzania Police Force e-Loss System',
      itemsReported: 'NIDA Card, National Driving License',
      incidentDate: '2026-08-28',
      gepgControlNumber: '991200384721',
      officialGovFeePaid: true
    },
    createdAt: '2026-08-29T11:20:00Z',
    updatedAt: '2026-08-29T12:00:00Z'
  },
  {
    id: 'TK-IT-3012',
    serviceType: 'IT Support',
    serviceTitle: 'HP ProBook 450 G8 SSD Upgrade + Windows 11 Clean Install',
    customerName: 'Rashid Bakari',
    customerPhone: '+255 762 119 988',
    status: 'Completed',
    estimatedCost: 85000,
    details: {
      device: 'HP ProBook 450 G8 Laptop',
      hardwareInstalled: '512GB NVMe M.2 SSD',
      os: 'Windows 11 Pro 64-bit + Office 2024 Suite',
      dataBackup: 'Completed (85GB restored to Desktop)'
    },
    createdAt: '2026-08-27T08:00:00Z',
    updatedAt: '2026-08-28T16:00:00Z'
  }
];

export const mockQuoteRequests: QuoteRequest[] = [
  {
    id: 'TK-QTE-7714',
    projectType: 'Business POS & System',
    businessScale: 'Growing SME',
    features: [
      'Barcode Scanning & Thermal Receipt Print',
      'Multi-cashier permissions',
      'Daily WhatsApp sales summary to owner',
      'Offline sync capability'
    ],
    timeline: '2 - 4 Weeks',
    estimatedRange: 'TSh 1,200,000 - 1,800,000',
    customerName: 'Goodluck Mtei',
    customerCompany: 'Mtei Hardware & Building Supplies',
    customerPhone: '+255 784 556 778',
    customerEmail: 'info@mteihardware.co.tz',
    projectNotes: 'We have 2 branches in Kariakoo and Tegeta and want stock synchronized between both shops.',
    status: 'In Review',
    createdAt: '2026-08-29T08:30:00Z'
  },
  {
    id: 'TK-QTE-7715',
    projectType: 'Website Development',
    businessScale: 'Corporate / Multi-Branch',
    features: [
      'Mobile-responsive showcase website',
      'Online inquiry lead capture forms',
      'SEO & Google Business Profile mapping',
      'Staff company email setup (@domain.co.tz)'
    ],
    timeline: '1 - 2 Weeks',
    estimatedRange: 'TSh 650,000 - 950,000',
    customerName: 'Advocate Sarah Mwakipesile',
    customerCompany: 'Apex Legal & Advisory Chambers',
    customerPhone: '+255 755 223 344',
    customerEmail: 'sarah@apexlegal.co.tz',
    projectNotes: 'Need a crisp, credible legal firm website with partner profiles and case enquiry booking.',
    status: 'New',
    createdAt: '2026-08-30T04:15:00Z'
  }
];

export const mockTestimonials: Testimonial[] = [
  {
    id: 't-1',
    name: 'Josephine Kimaro',
    role: 'Managing Director',
    organization: 'Kimaro Logistics Ltd (DEMO)',
    rating: 5,
    comment: 'TK Stationery built our company website and custom dispatch logging system. Their team is fast, professional, and understood our local business needs right from the start.',
    serviceUsed: 'Website & Digital System',
    isDemo: true
  },
  {
    id: 't-2',
    name: 'Dr. Michael S. Mremi',
    role: 'Senior Lecturer',
    organization: 'Higher Learning Institute (DEMO)',
    rating: 5,
    comment: 'Whenever our department needs 500+ examination booklets printed, bound, and stamped, TK Stationery delivers with zero errors and top-tier confidentiality.',
    serviceUsed: 'High-Volume Document Printing',
    isDemo: true
  },
  {
    id: 't-3',
    name: 'Aisha J. Mussa',
    role: 'Entrepreneur',
    organization: 'Ajira / TRA Services Client (DEMO)',
    rating: 5,
    comment: 'I went to TK Stationery when I was applying for my individual TIN and had trouble with my certificate scans. The staff explained every step and printed everything in minutes.',
    serviceUsed: 'Public Services Assistance',
    isDemo: true
  }
];
