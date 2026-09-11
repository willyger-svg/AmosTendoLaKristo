import { PublicServiceItem } from '../types';

export const publicServicesData: PublicServiceItem[] = [
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
