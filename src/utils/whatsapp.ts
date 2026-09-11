/**
 * TK Stationery WhatsApp & Manual Payment Communication Helper
 * Configurable number default: 0787754202 (+255 787 754 202)
 */
export const DEFAULT_TK_PHONE_DISPLAY = '0787754202';
export const DEFAULT_TK_WHATSAPP_NUMBER = '255787754202';
export const TK_PHONE_DISPLAY = DEFAULT_TK_PHONE_DISPLAY;

export function sanitizePhoneForWhatsApp(phone?: string): string {
  if (!phone) return DEFAULT_TK_WHATSAPP_NUMBER;
  const clean = phone.replace(/[^0-9]/g, '');
  if (clean.startsWith('0')) {
    return '255' + clean.slice(1);
  }
  if (clean.startsWith('255')) {
    return clean;
  }
  if (clean.length === 9) {
    return '255' + clean;
  }
  return clean || DEFAULT_TK_WHATSAPP_NUMBER;
}

export function createWhatsAppUrl(message: string, customNumber?: string): string {
  const phone = sanitizePhoneForWhatsApp(customNumber);
  const encoded = encodeURIComponent(message);
  return `https://wa.me/${phone}?text=${encoded}`;
}

export function getProductWhatsAppUrl(productName: string, price: number, sku: string, customNumber?: string): string {
  const message = `Hello TK Stationery! 👋\n\nI am interested in purchasing:\n📌 *${productName}*\n💰 Price: TSh ${price.toLocaleString()}\n🔖 SKU: ${sku}\n\nPlease confirm availability and delivery to my location.`;
  return createWhatsAppUrl(message, customNumber);
}

export function getOrderWhatsAppUrl(
  orderId: string,
  total: number,
  customerName: string,
  itemsCount: number,
  paymentMethod?: string,
  customNumber?: string
): string {
  const message = `Habari TK Stationery! 👋\n\nNimekamilisha oda kwenye tovuti yenu:\n🧾 *Namba ya Oda: ${orderId}*\n👤 Mteja: ${customerName}\n📦 Idadi ya Bidhaa: ${itemsCount} items\n💰 Jumla Kuu: TSh ${total.toLocaleString()}\n💳 Njia ya Malipo: ${paymentMethod || 'Manual Payment / Mobile Money'}\n\nNaomba kuthibitisha oda hii na maelekezo ya malipo/risiti. Asante!`;
  return createWhatsAppUrl(message, customNumber);
}

export function getPrintServiceWhatsAppUrl(serviceTitle: string, details?: string, customNumber?: string): string {
  const message = `Habari TK Stationery! 👋\n\nNahitaji msaada wa Huduma ya Printing / Document Services:\n🖨️ *Huduma: ${serviceTitle}*\n${details ? `📝 Maelezo: ${details}\n` : ''}\nNaomba mnifahamishe gharama na muda wa kukamilika.`;
  return createWhatsAppUrl(message, customNumber);
}

export function getPublicServiceWhatsAppUrl(serviceTitle: string, customNumber?: string): string {
  const message = `Habari TK Stationery! 👋\n\nNahitaji usaidizi wa Huduma za Serikali Mtandaoni (Public / Online Portal):\n🏛️ *Huduma: ${serviceTitle}*\n\nNaomba kujua nyaraka zinazohitajika na upatikanaji wa huduma.`;
  return createWhatsAppUrl(message, customNumber);
}

export function getQuoteWhatsAppUrl(projectType: string, businessScale: string, customNumber?: string): string {
  const message = `Habari TK Digital Solutions team! 👋\n\nNingependa kupata ushauri wa kitaalamu na nukuu (Quote) ya mradi:\n💻 *Mradi: ${projectType}*\n🏢 *Kiwango: ${businessScale}*\n\nNaomba mwasiliane nami kwa mazungumzo zaidi.`;
  return createWhatsAppUrl(message, customNumber);
}

