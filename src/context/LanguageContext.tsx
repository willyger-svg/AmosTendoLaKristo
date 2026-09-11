import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Language, ThemeMode } from '../types';

interface Translations {
  [key: string]: {
    sw: string;
    en: string;
  };
}

export const translations: Translations = {
  // Navigation & Brand
  'brand.tagline': {
    sw: 'Vifaa vya Ofisi na Shule • Huduma za Chapisho • Serikali Mtandaoni • Tehama',
    en: 'Office & School Stationery • Printing Services • Online Portals • Digital Solutions'
  },
  'nav.home': { sw: 'Mwanzo', en: 'Home' },
  'nav.shop': { sw: 'Duka la Vifaa', en: 'Stationery Shop' },
  'nav.printing': { sw: 'Huduma za Chapisho', en: 'Printing Hub' },
  'nav.online_services': { sw: 'Huduma za Serikali (Portals)', en: 'Public Services' },
  'nav.digital_solutions': { sw: 'Mifumo & Software', en: 'Digital Solutions' },
  'nav.about': { sw: 'Kuhusu TK', en: 'About Us' },
  'nav.contact': { sw: 'Mawasiliano', en: 'Contact' },
  'nav.track': { sw: 'Fuatilia Oda / Tiketi', en: 'Track Order / Ticket' },
  'nav.account': { sw: 'Akaunti Yangu', en: 'My Account' },
  'nav.admin': { sw: 'Jopo la Usimamizi', en: 'Admin Portal' },
  'nav.cart': { sw: 'Kikapu cha Manunuzi', en: 'Shopping Cart' },

  // Hero Section
  'hero.badge': {
    sw: '📍 MWENGE / SHEKILANGO • DAR ES SALAAM • HUDUMA YA HARAKA',
    en: '📍 MWENGE / SHEKILANGO • DAR ES SALAAM • FAST SERVICE'
  },
  'hero.title_start': { sw: 'Kituo Kikuu cha', en: 'Your One-Stop Hub for' },
  'hero.title_highlight': { sw: 'Vifaa, Chapisho na Mifumo ya Kidijitali', en: 'Stationery, Printing & Digital Solutions' },
  'hero.subtitle': {
    sw: 'Pata vifaa bora vya ofisi na shule, chapisho la haraka la rangi na monochrome, usaidizi wa huduma za serikali mtandaoni (NIDA, TRA, RITA), na utengenezaji wa tovuti na mifumo ya biashara.',
    en: 'Get premium school & office supplies, instant high-speed printing, trusted public portal assistance (NIDA, TRA, RITA), and custom business software.'
  },
  'hero.cta_shop': { sw: 'Nunua Vifaa Mtandaoni', en: 'Shop Stationery' },
  'hero.cta_print': { sw: 'Tuma Kazi ya Chapisho', en: 'Fast Printing Wizard' },
  'hero.cta_portal': { sw: 'Huduma za Serikali Mtandaoni', en: 'Public Portals' },
  'hero.cta_quote': { sw: 'Omba Nukuu ya Software', en: 'Get Tech Quote' },

  // Manual Payment
  'payment.manual_title': { sw: 'Maelekezo ya Malipo (Manual Payment)', en: 'Manual Payment Instructions' },
  'payment.send_to_number': { sw: 'Namba ya Malipo / WhatsApp ya TK Stationery:', en: 'TK Stationery Payment & WhatsApp Number:' },
  'payment.method_mobile': { sw: 'Malipo ya Simu (M-Pesa / Tigo Pesa / Airtel Money)', en: 'Mobile Money (M-Pesa / Tigo Pesa / Airtel Money)' },
  'payment.method_cash': { sw: 'Taslimu Dukani / Wakati wa Kupokea', en: 'Cash at Store / On Delivery' },
  'payment.method_bank': { sw: 'Benki (CRDB / NMB)', en: 'Bank Transfer (CRDB / NMB)' },
  'payment.verify_notice': {
    sw: 'Baada ya kukamilisha malipo, tafadhali bofya kitufe cha WhatsApp kutuma uthibitisho au picha ya muamala ukiwa na namba ya oda yako.',
    en: 'After completing payment, click the WhatsApp confirmation button to send your transaction screenshot or reference.'
  },
  'payment.confirm_whatsapp': { sw: 'Thibitisha Malipo Kupitia WhatsApp', en: 'Confirm Payment on WhatsApp' },

  // Actions & Buttons
  'btn.add_to_cart': { sw: 'Weka Kwenye Kikapu', en: 'Add to Cart' },
  'btn.checkout': { sw: 'Kamilisha Oda', en: 'Proceed to Checkout' },
  'btn.view_details': { sw: 'Tazama Zaidi', en: 'View Details' },
  'btn.back': { sw: 'Rudi Nyuma', en: 'Go Back' },
  'btn.submit': { sw: 'Wasilisha', en: 'Submit' },
  'btn.save': { sw: 'Hifadhi', en: 'Save Changes' },
  'btn.cancel': { sw: 'Ghairi', en: 'Cancel' },
  'btn.call_now': { sw: 'Piga Simu Sasa', en: 'Call Now' },
  'btn.whatsapp': { sw: 'Wasiliana WhatsApp', en: 'Chat on WhatsApp' },
  'btn.track': { sw: 'Fuatilia', en: 'Track Status' },

  // Account & Profile Photo
  'account.title': { sw: 'Dashibodi ya Mteja', en: 'Customer Dashboard' },
  'account.orders_tab': { sw: 'Oda Zangu', en: 'My Orders' },
  'account.services_tab': { sw: 'Tiketi za Huduma', en: 'Service Requests' },
  'account.quotes_tab': { sw: 'Nukuu za Software', en: 'Tech Quotes' },
  'account.profile_tab': { sw: 'Taarifa Binafsi', en: 'Profile Details' },
  'account.payments_tab': { sw: 'Historia ya Malipo', en: 'Payment History' },
  'account.sign_out': { sw: 'Toka kwenye Akaunti', en: 'Sign Out' },
  'profile.photo_upload': { sw: 'Pakia Picha', en: 'Upload Photo' },
  'profile.photo_change': { sw: 'Badili Picha', en: 'Change Photo' },
  'profile.photo_remove': { sw: 'Ondoa Picha', en: 'Remove Photo' },
  'profile.photo_uploading': { sw: 'Inapakia...', en: 'Uploading...' },
  'profile.photo_complete': { sw: 'Upakiaji Umekamilika', en: 'Upload Complete' },
  'profile.photo_failed': { sw: 'Upakiaji Umeshindikana', en: 'Upload Failed' },
  'profile.photo_too_large': { sw: 'Faili Kubwa Mno (Isizidi 5MB)', en: 'File Too Large (Max 5MB)' },
  'profile.photo_unsupported': { sw: 'Faili Halikubaliki (JPG, PNG, WEBP tu)', en: 'Unsupported File (JPG, PNG, WEBP only)' },
  'profile.photo_success': { sw: 'Picha ya wasifu imesasishwa kikamilifu!', en: 'Profile photo updated successfully!' },
  'profile.photo_removed': { sw: 'Picha ya wasifu imeondolewa.', en: 'Profile photo removed.' },
  'profile.photo_hint': { sw: 'Inakubali JPG, PNG, au WEBP. Isizidi 5MB.', en: 'Accepts JPG, PNG, or WEBP. Max 5MB.' },

  // Statuses
  'status.submitted': { sw: 'Imepokelewa', en: 'Submitted' },
  'status.pending': { sw: 'Inasubiri Uhakiki', en: 'Pending Verification' },
  'status.confirmed': { sw: 'Imethibitishwa', en: 'Confirmed' },
  'status.processing': { sw: 'Inaandaliwa', en: 'Processing' },
  'status.ready': { sw: 'Tayari Kuchukuliwa', en: 'Ready for Pickup' },
  'status.out_for_delivery': { sw: 'Iko Njiani Kusafirishwa', en: 'Out for Delivery' },
  'status.completed': { sw: 'Imekamilika', en: 'Completed' },
  'status.cancelled': { sw: 'Imeghairiwa', en: 'Cancelled' },
  'status.paid': { sw: 'Imelipwa / Imethibitishwa', en: 'Paid / Verified' },
  'status.unpaid': { sw: 'Haijalipwa Bado', en: 'Unpaid' },

  // Admin Portal & Control Center
  'admin.brand_title': { sw: 'TK Stationery • Jopo la Usimamizi', en: 'TK Stationery • Admin Control Center' },
  'admin.tagline': { sw: 'Kituo Kikuu cha Uendeshaji & Mfumo wa Biashara', en: 'Operations Command & Management Hub' },
  
  // Admin Navigation Groups
  'admin.group.overview': { sw: 'Muhtasari', en: 'Overview' },
  'admin.group.commerce': { sw: 'Biashara & Vifaa', en: 'Commerce' },
  'admin.group.customers': { sw: 'Wateja & Huduma', en: 'Customers' },
  'admin.group.marketing': { sw: 'Masoko & Maudhui', en: 'Marketing & Content' },
  'admin.group.system': { sw: 'Mfumo & Usalama', en: 'System' },

  // Admin Navigation Routes
  'admin.nav.dashboard': { sw: 'Dashibodi Kuu', en: 'Dashboard' },
  'admin.nav.products': { sw: 'Bidhaa & Katalogi', en: 'Products' },
  'admin.nav.categories': { sw: 'Makundi ya Bidhaa', en: 'Categories' },
  'admin.nav.inventory': { sw: 'Stoo & Hesabu za Bidhaa', en: 'Inventory' },
  'admin.nav.orders': { sw: 'Oda za Wateja', en: 'Orders' },
  'admin.nav.payments': { sw: 'Malipo & Miamala', en: 'Payments' },
  'admin.nav.customers': { sw: 'Orodha ya Wateja', en: 'Customers' },
  'admin.nav.service_requests': { sw: 'Tiketi za Huduma (Print/Gov)', en: 'Service Requests' },
  'admin.nav.quotes': { sw: 'Nukuu za Tehama & Mifumo', en: 'Tech Quotes' },
  'admin.nav.documents': { sw: 'Hifadhi ya Nyaraka', en: 'Documents' },
  'admin.nav.advertisements': { sw: 'Matangazo & Mabango', en: 'Advertisements' },
  'admin.nav.content': { sw: 'Maudhui ya Tovuti', en: 'Homepage Content' },
  'admin.nav.services': { sw: 'Orodha ya Huduma', en: 'Services Catalog' },
  'admin.nav.notifications': { sw: 'Taarifa za Mfumo', en: 'Notifications' },
  'admin.nav.staff': { sw: 'Wafanyakazi & Majukumu', en: 'Staff & Roles' },
  'admin.nav.audit_logs': { sw: 'Kumbukumbu za Usalama (Audit)', en: 'Audit Logs' },
  'admin.nav.settings': { sw: 'Mipangilio ya Duka', en: 'Store Settings' },

  // Admin Metrics & Stats
  'admin.metric.gross_orders': { sw: 'Jumla ya Mauzo', en: 'Gross Orders' },
  'admin.metric.pending_orders': { sw: 'Oda Zinazosubiri', en: 'Pending Orders' },
  'admin.metric.pending_payments': { sw: 'Malipo Yasiyothibitishwa', en: 'Pending Payments' },
  'admin.metric.active_tickets': { sw: 'Tiketi Zinazoshughulikiwa', en: 'Active Service Tickets' },
  'admin.metric.new_quotes': { sw: 'Nukuu Mpya za Tehama', en: 'New Tech Leads' },
  'admin.metric.low_stock': { sw: 'Bidhaa Zenye Uhaba Stoo', en: 'Low Stock Alerts' },
  'admin.metric.total_products': { sw: 'Jumla ya Bidhaa', en: 'Total Products' },
  'admin.metric.registered_customers': { sw: 'Wateja Waliosajiliwa', en: 'Registered Customers' },

  // Admin Header, Search & Profile
  'admin.search.placeholder': { sw: 'Tafuta oda, bidhaa, wateja, tiketi...', en: 'Search orders, products, customers, tickets...' },
  'admin.search.quick': { sw: 'Utafutaji wa Haraka', en: 'Quick Search' },
  'admin.search.keyboard_hint': { sw: 'Bonyeza', en: 'Press' },
  'admin.quick_actions.title': { sw: 'Vitendo vya Haraka', en: 'Quick Actions' },
  'admin.notifications.title': { sw: 'Taarifa za Kiutendaji', en: 'Operational Alerts' },
  'admin.notifications.empty': { sw: 'Hakuna taarifa mpya kwa sasa.', en: 'No operational alerts right now.' },
  'admin.notifications.mark_all_read': { sw: 'Weka Zote Zimesomwa', en: 'Mark All Read' },
  'admin.profile.title': { sw: 'Wasifu wa Msimamizi', en: 'Admin Profile' },
  'admin.live_store': { sw: 'Tovuti Kuu (Storefront)', en: 'Live Storefront' },
  'admin.sync_firestore': { sw: 'Sawazisha Firestore', en: 'Sync Firestore' },
  'admin.syncing': { sw: 'Inasawazisha...', en: 'Syncing...' },
  'admin.signed_in_as': { sw: 'Umeingia kama', en: 'Signed in as' }
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, fallback?: string) => string;
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  isDark: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const LANGUAGE_STORAGE_KEY = 'tk_preferred_language_v1';
const THEME_STORAGE_KEY = 'tk_preferred_theme_v1';

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Default language: Kiswahili ('sw')
  const [language, setLanguageState] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem(LANGUAGE_STORAGE_KEY);
      return (saved === 'en' || saved === 'sw') ? saved : 'sw';
    } catch {
      return 'sw';
    }
  });

  // Default theme: Light ('light')
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    try {
      const saved = localStorage.getItem(THEME_STORAGE_KEY);
      return (saved === 'light' || saved === 'dark' || saved === 'system') ? saved : 'light';
    } catch {
      return 'light';
    }
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
    } catch {
      // ignore
    }
  };

  const setTheme = (mode: ThemeMode) => {
    setThemeState(mode);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, mode);
    } catch {
      // ignore
    }
  };

  const [isDark, setIsDark] = useState<boolean>(false);

  useEffect(() => {
    const root = document.documentElement;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const applyTheme = () => {
      let isDarkMode = false;
      if (theme === 'dark') {
        isDarkMode = true;
      } else if (theme === 'system') {
        isDarkMode = mediaQuery.matches;
      }
      setIsDark(isDarkMode);
      if (isDarkMode) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    };

    applyTheme();
    mediaQuery.addEventListener('change', applyTheme);
    return () => mediaQuery.removeEventListener('change', applyTheme);
  }, [theme]);

  const t = (key: string, fallback?: string): string => {
    const entry = translations[key];
    if (entry && entry[language]) {
      return entry[language];
    }
    return fallback || key;
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        t,
        theme,
        setTheme,
        isDark
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useTranslation = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useTranslation must be used within a LanguageProvider');
  }
  return context;
};
