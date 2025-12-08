import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { StatsCard } from '@/components/admin/StatsCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  DollarSign, 
  ShoppingCart, 
  TrendingUp, 
  TrendingDown,
  Users,
  Loader2,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line,
  AreaChart,
  Area
} from 'recharts';
import { 
  calculateOrderStats, 
  groupSalesByDate, 
  groupSalesByWeek,
  getTopProducts,
  formatCurrency,
  comparePeriods
} from '@/lib/admin-utils';
import { Database } from '@/integrations/supabase/types';

type Order = Database['public']['Tables']['orders']['Row'];

const STATUS_COLORS = {
  pending: '#fbbf24',
  processing: '#3b82f6',
  completed: '#10b981',
  cancelled: '#ef4444'
};

const STATUS_LABELS = {
  pending: 'В ожидании',
  processing: 'Обрабатывается',
  completed: 'Завершен',
  cancelled: 'Отменен'
};

export default function Dashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [chartPeriod, setChartPeriod] = useState<'daily' | 'weekly'>('daily');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const stats = calculateOrderStats(orders);
  const salesData = groupSalesByDate(orders, 30);
  const weeklySalesData = groupSalesByWeek(orders, 8);
  const topProducts = getTopProducts(orders, 5);
  const periodComparison = comparePeriods(orders, 30);

  const statusChartData = Object.entries(stats.ordersByStatus).map(([status, count]) => ({
    name: STATUS_LABELS[status as keyof typeof STATUS_LABELS],
    value: count,
    color: STATUS_COLORS[status as keyof typeof STATUS_COLORS]
  }));

  const formatChange = (change: number) => {
    const sign = change >= 0 ? '+' : '';
    return `${sign}${change.toFixed(1)}%`;
  };

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold">Дашборд</h2>

      {/* Period Comparison Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Выручка (30 дней)"
          value={formatCurrency(periodComparison.currentRevenue)}
          icon={DollarSign}
          description={
            <span className={`flex items-center gap-1 ${periodComparison.revenueChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {periodComparison.revenueChange >= 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
              {formatChange(periodComparison.revenueChange)} vs пред. период
            </span>
          }
        />
        <StatsCard
          title="Заказы (30 дней)"
          value={periodComparison.currentOrders}
          icon={ShoppingCart}
          description={
            <span className={`flex items-center gap-1 ${periodComparison.ordersChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {periodComparison.ordersChange >= 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
              {formatChange(periodComparison.ordersChange)} vs пред. период
            </span>
          }
        />
        <StatsCard
          title="Средний чек"
          value={formatCurrency(stats.averageOrderValue)}
          icon={TrendingUp}
          description="На заказ"
        />
        <StatsCard
          title="В обработке"
          value={stats.ordersByStatus.processing}
          icon={Users}
          description="Требуют внимания"
        />
      </div>

      {/* Sales Chart with Period Toggle */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Динамика продаж</CardTitle>
          <Tabs value={chartPeriod} onValueChange={(v) => setChartPeriod(v as 'daily' | 'weekly')}>
            <TabsList>
              <TabsTrigger value="daily">По дням</TabsTrigger>
              <TabsTrigger value="weekly">По неделям</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>
        <CardContent>
          {chartPeriod === 'daily' ? (
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={salesData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(value) => new Date(value).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' })}
                  className="text-xs"
                />
                <YAxis tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`} className="text-xs" />
                <Tooltip 
                  formatter={(value: number) => formatCurrency(value)}
                  labelFormatter={(label) => new Date(label).toLocaleDateString('ru-RU')}
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="hsl(var(--primary))" 
                  fillOpacity={1} 
                  fill="url(#colorRevenue)" 
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={weeklySalesData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  dataKey="week" 
                  tickFormatter={(value) => `Нед. ${new Date(value).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' })}`}
                  className="text-xs"
                />
                <YAxis tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`} className="text-xs" />
                <Tooltip 
                  formatter={(value: number, name: string) => {
                    if (name === 'revenue') return [formatCurrency(value), 'Выручка'];
                    if (name === 'orders') return [value, 'Заказы'];
                    return [formatCurrency(value), 'Средний чек'];
                  }}
                  labelFormatter={(label) => `Неделя от ${new Date(label).toLocaleDateString('ru-RU')}`}
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
                />
                <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">

      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Статусы заказов</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => value > 0 ? `${name}: ${value}` : ''}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Топ-5 товаров</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {topProducts.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">Пока нет данных о продажах</p>
            ) : (
              topProducts.map((product, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center font-semibold text-primary">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium">{product.title}</p>
                      <p className="text-sm text-muted-foreground">
                        Продано: {product.quantity} шт.
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{formatCurrency(product.revenue)}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
