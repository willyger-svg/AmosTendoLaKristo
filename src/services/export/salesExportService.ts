import { Order, Product } from '../../types';
import { formatTSh, formatDate } from '../../utils/formatters';

export interface SalesReportFilter {
  period?: 'today' | 'week' | 'month' | 'all';
  status?: string;
  startDate?: string;
  endDate?: string;
}

export const salesExportService = {
  /**
   * Filter orders by period or custom date range
   */
  filterOrders(orders: Order[], filter: SalesReportFilter): Order[] {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const sevenDaysAgo = startOfToday - 7 * 24 * 60 * 60 * 1000;
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();

    return orders.filter(order => {
      // Status filter
      if (filter.status && filter.status !== 'all') {
        if (order.status !== filter.status) return false;
      }

      // Date filtering
      const orderDate = new Date(order.createdAt).getTime();

      if (filter.startDate) {
        const start = new Date(filter.startDate).getTime();
        if (orderDate < start) return false;
      }

      if (filter.endDate) {
        const end = new Date(filter.endDate).setHours(23, 59, 59, 999);
        if (orderDate > end) return false;
      }

      if (filter.period === 'today') {
        return orderDate >= startOfToday;
      }
      if (filter.period === 'week') {
        return orderDate >= sevenDaysAgo;
      }
      if (filter.period === 'month') {
        return orderDate >= startOfMonth;
      }

      return true;
    });
  },

  /**
   * Converts orders list into CSV format and downloads it directly to client
   */
  exportOrdersToCsv(orders: Order[], filenamePrefix = 'Ripoti_ya_Mauzo_TK_Stationery'): void {
    const headers = [
      'Namba ya Oda (Order ID)',
      'Tarehe ya Oda',
      'Jina la Mteja',
      'Namba ya Simu',
      'Barua Pepe',
      'Idadi ya Bidhaa',
      'Maelezo ya Vitu Vilivyonunuliwa',
      'Njia ya Uwasilishaji',
      'Anuani / Eneo',
      'Njia ya Malipo',
      'Kumbukumbu ya Malipo',
      'Hali ya Malipo',
      'Gharama ya Usafirishaji (TZS)',
      'Jumla ya Malipo (TZS)',
      'Hali ya Oda'
    ];

    const escapeCsv = (val: any) => {
      if (val === null || val === undefined) return '""';
      const str = String(val).replace(/"/g, '""');
      return `"${str}"`;
    };

    const rows = orders.map(order => {
      const itemsDetail = (order.items || [])
        .map(
          i =>
            `${i.quantity}x ${
              (i as any).productName ||
              (i as any).product?.name ||
              (i as any).product?.title ||
              'Bidhaa'
            } @ TZS ${formatTSh(Number((i as any).unitPrice) || Number((i as any).price) || 0)}`
        )
        .join('; ');

      const totalAmount = order.totalAmount || order.total || 0;
      const deliveryFee = order.deliveryFee || 0;

      return [
        escapeCsv(order.id),
        escapeCsv(formatDate(order.createdAt)),
        escapeCsv(order.customerName || 'Mteja'),
        escapeCsv(order.customerPhone || 'N/A'),
        escapeCsv(order.customerEmail || ''),
        escapeCsv(order.items?.length || 0),
        escapeCsv(itemsDetail),
        escapeCsv(order.deliveryMethod || 'Dukani'),
        escapeCsv(order.deliveryAddress || 'Dukani Manzese'),
        escapeCsv(order.paymentMethod || 'M-Pesa / Tigo / Airtel'),
        escapeCsv((order as any).paymentReference || 'N/A'),
        escapeCsv(order.paymentStatus || 'Inasubiri'),
        escapeCsv(deliveryFee),
        escapeCsv(totalAmount),
        escapeCsv(order.status || 'Submitted')
      ].join(',');
    });

    const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const dateStr = new Date().toISOString().split('T')[0];
    link.setAttribute('href', url);
    link.setAttribute('download', `${filenamePrefix}_${dateStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  },

  /**
   * Exports inventory list to CSV for physical auditing & stocktaking
   */
  exportInventoryToCsv(products: Product[], filenamePrefix = 'Orodha_ya_Stoo_TK_Stationery'): void {
    const headers = [
      'Namba ya Bidhaa (ID)',
      'Jina la Bidhaa',
      'Kategoria (Category)',
      'SKU / Msimbo',
      'Idadi Iliyopo Stoo (Stock Count)',
      'Hali ya Stoo (Status)',
      'Bei ya Kuuza (TZS)',
      'Jumla ya Thamani Iliyopo Stoo (TZS)'
    ];

    const escapeCsv = (val: any) => {
      if (val === null || val === undefined) return '""';
      const str = String(val).replace(/"/g, '""');
      return `"${str}"`;
    };

    const rows = products.map(p => {
      const stock = p.stockCount || 0;
      const status = stock === 0 ? 'Imeisha Kabisa' : stock <= 5 ? 'Uhaba Mkubwa' : 'Ipo Salama';
      const stockVal = (p.price || 0) * stock;

      return [
        escapeCsv(p.id),
        escapeCsv(p.title),
        escapeCsv(p.category),
        escapeCsv(p.sku || 'N/A'),
        escapeCsv(stock),
        escapeCsv(status),
        escapeCsv(p.price || 0),
        escapeCsv(stockVal)
      ].join(',');
    });

    const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const dateStr = new Date().toISOString().split('T')[0];
    link.setAttribute('href', url);
    link.setAttribute('download', `${filenamePrefix}_${dateStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
};
