import { Database } from '@/integrations/supabase/types';

type Order = Database['public']['Tables']['orders']['Row'];

export interface OrderStats {
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  ordersByStatus: {
    pending: number;
    processing: number;
    completed: number;
    cancelled: number;
  };
}

export interface SalesData {
  date: string;
  revenue: number;
  orders: number;
}

export interface TopProduct {
  title: string;
  quantity: number;
  revenue: number;
}

export const calculateOrderStats = (orders: Order[]): OrderStats => {
  const totalRevenue = orders.reduce((sum, order) => {
    if (order.status !== 'cancelled') {
      return sum + Number(order.total);
    }
    return sum;
  }, 0);

  const totalOrders = orders.filter(o => o.status !== 'cancelled').length;

  const ordersByStatus = orders.reduce((acc, order) => {
    acc[order.status as keyof typeof acc]++;
    return acc;
  }, {
    pending: 0,
    processing: 0,
    completed: 0,
    cancelled: 0
  });

  return {
    totalRevenue,
    totalOrders,
    averageOrderValue: totalOrders > 0 ? totalRevenue / totalOrders : 0,
    ordersByStatus
  };
};

export const groupSalesByDate = (orders: Order[], days: number = 30): SalesData[] => {
  const dateMap = new Map<string, { revenue: number; orders: number }>();
  
  const now = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    dateMap.set(dateStr, { revenue: 0, orders: 0 });
  }

  orders.forEach(order => {
    if (order.status !== 'cancelled') {
      const dateStr = new Date(order.created_at).toISOString().split('T')[0];
      const existing = dateMap.get(dateStr);
      if (existing) {
        existing.revenue += Number(order.total);
        existing.orders += 1;
      }
    }
  });

  return Array.from(dateMap.entries())
    .map(([date, data]) => ({
      date,
      revenue: data.revenue,
      orders: data.orders
    }))
    .sort((a, b) => a.date.localeCompare(b.date));
};

export const getTopProducts = (orders: Order[], limit: number = 10): TopProduct[] => {
  const productMap = new Map<string, { quantity: number; revenue: number }>();

  orders.forEach(order => {
    if (order.status !== 'cancelled' && Array.isArray(order.items)) {
      order.items.forEach((item: any) => {
        const title = item.title || item.product?.title || 'Unknown Product';
        const quantity = item.quantity || 1;
        const price = Number(item.price?.amount || item.price || 0);
        
        const existing = productMap.get(title);
        if (existing) {
          existing.quantity += quantity;
          existing.revenue += price * quantity;
        } else {
          productMap.set(title, {
            quantity,
            revenue: price * quantity
          });
        }
      });
    }
  });

  return Array.from(productMap.entries())
    .map(([title, data]) => ({
      title,
      quantity: data.quantity,
      revenue: data.revenue
    }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, limit);
};

export const formatCurrency = (amount: number, currency: string = 'RUB'): string => {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: currency
  }).format(amount);
};

export const formatDate = (date: string): string => {
  return new Intl.DateTimeFormat('ru-RU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(date));
};
