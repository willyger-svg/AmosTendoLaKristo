/**
 * Format numerical amount to Tanzanian Shillings (e.g. TSh 14,500)
 */
export function formatTSh(amount: number | string): string {
  if (typeof amount === 'string') {
    if (amount.startsWith('TSh') || amount.includes('-')) return amount;
    const parsed = parseFloat(amount.replace(/[^0-9.-]+/g, ''));
    if (isNaN(parsed)) return amount;
    return `TSh ${Math.round(parsed).toLocaleString('en-US')}`;
  }
  return `TSh ${Math.round(amount).toLocaleString('en-US')}`;
}

export const formatPrice = formatTSh;

/**
 * Format relative elapsed time (e.g. '5m ago', '2h ago', '3d ago')
 */
export function formatTimeAgo(isoString: string): string {
  try {
    const past = new Date(isoString).getTime();
    const now = Date.now();
    const diffSec = Math.floor((now - past) / 1000);

    if (diffSec < 60) return 'Just now';
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHr = Math.floor(diffMin / 60);
    if (diffHr < 24) return `${diffHr}h ago`;
    const diffDay = Math.floor(diffHr / 24);
    if (diffDay < 30) return `${diffDay}d ago`;
    return formatDate(isoString);
  } catch {
    return isoString;
  }
}

/**
 * Format ISO date string into readable local format (e.g. 29 Aug 2026, 14:30)
 */
export function formatDate(dateInput: string | Date | undefined | null): string {
  if (!dateInput) return 'N/A';
  try {
    const date = dateInput instanceof Date ? dateInput : new Date(dateInput);
    if (isNaN(date.getTime())) return String(dateInput);
    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return String(dateInput);
  }
}

/**
 * Generate unique tracking code for frontend orders / tickets
 */
export function generateId(prefix: 'TK-ORD' | 'TK-PRT' | 'TK-GOV' | 'TK-QTE' | 'TK-IT' | 'TK-DES' | 'TK-SRV' | string): string {
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}-${randomNum}`;
}
