import { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { LayoutDashboard, ShoppingBag, Tag, ArrowLeft, Megaphone, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AdminLayoutProps {
  children: ReactNode;
}

const navItems = [
  { path: '/admin', label: 'Дашборд', icon: LayoutDashboard },
  { path: '/admin/products', label: 'Товары', icon: Package },
  { path: '/admin/orders', label: 'Заказы', icon: ShoppingBag },
  { path: '/admin/discounts', label: 'Скидки', icon: Tag },
  { path: '/admin/banners', label: 'Баннеры', icon: Megaphone },
];

export const AdminLayout = ({ children }: AdminLayoutProps) => {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  На сайт
                </Button>
              </Link>
              <h1 className="text-2xl font-bold">Административная панель</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <div className="flex gap-6">
          <aside className="w-64 flex-shrink-0">
            <nav className="space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-accent text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </aside>

          <main className="flex-1">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
};
