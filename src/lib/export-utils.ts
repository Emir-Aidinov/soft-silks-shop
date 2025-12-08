import { Database } from '@/integrations/supabase/types';

type Order = Database['public']['Tables']['orders']['Row'];

const STATUS_LABELS: Record<string, string> = {
  pending: 'В ожидании',
  processing: 'Обрабатывается',
  completed: 'Завершен',
  cancelled: 'Отменен'
};

const PAYMENT_LABELS: Record<string, string> = {
  online: 'Онлайн',
  cash: 'При получении'
};

export const exportOrdersToCSV = (orders: Order[]): void => {
  const headers = [
    'ID заказа',
    'Дата создания',
    'Статус',
    'Способ оплаты',
    'Email',
    'Адрес доставки',
    'Товары',
    'Примечания',
    'Сумма'
  ];

  const rows = orders.map(order => {
    const items = Array.isArray(order.items) 
      ? order.items.map((item: any) => `${item.title || 'Товар'} x${item.quantity || 1}`).join('; ')
      : '';

    return [
      order.id,
      new Date(order.created_at).toLocaleString('ru-RU'),
      STATUS_LABELS[order.status] || order.status,
      PAYMENT_LABELS[order.payment_method] || order.payment_method,
      order.email || '',
      order.shipping_address || '',
      items,
      order.notes || '',
      order.total.toString()
    ];
  });

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
  ].join('\n');

  const BOM = '\uFEFF';
  const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `orders_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const exportOrdersToJSON = (orders: Order[]): void => {
  const exportData = orders.map(order => ({
    id: order.id,
    created_at: order.created_at,
    status: STATUS_LABELS[order.status] || order.status,
    payment_method: PAYMENT_LABELS[order.payment_method] || order.payment_method,
    email: order.email,
    shipping_address: order.shipping_address,
    items: order.items,
    notes: order.notes,
    total: order.total
  }));

  const jsonContent = JSON.stringify(exportData, null, 2);
  const blob = new Blob([jsonContent], { type: 'application/json' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `orders_${new Date().toISOString().split('T')[0]}.json`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
