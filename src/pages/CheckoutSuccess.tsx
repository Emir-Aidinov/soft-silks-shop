import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { CheckCircle, Package, CreditCard, Banknote } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface OrderDetails {
  id: string;
  total: number;
  status: string;
  payment_method: string;
  shipping_address: string;
  items: any[];
}

export default function CheckoutSuccess() {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get("orderId");
  const payment = searchParams.get("payment");
  const [order, setOrder] = useState<OrderDetails | null>(null);

  useEffect(() => {
    const loadOrder = async () => {
      if (!orderId) return;
      
      const { data } = await supabase
        .from("orders")
        .select("*")
        .eq("id", orderId)
        .single();
      
      if (data) {
        setOrder(data as OrderDetails);
      }
    };
    loadOrder();
  }, [orderId]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container max-w-lg mx-auto px-4 py-16">
        <div className="text-center mb-8">
          <div className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Заказ оформлен!</h1>
          <p className="text-muted-foreground">
            {payment === 'online' 
              ? 'Завершите оплату в открывшемся окне Shopify' 
              : 'Спасибо за ваш заказ. Мы скоро свяжемся с вами.'}
          </p>
        </div>

        {order && (
          <div className="bg-card rounded-xl p-6 shadow-sm border space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Номер заказа</span>
              <span className="font-mono text-sm">{order.id.slice(0, 8).toUpperCase()}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Способ оплаты</span>
              <span className="flex items-center gap-2">
                {order.payment_method === 'online' ? (
                  <>
                    <CreditCard className="w-4 h-4" />
                    Онлайн
                  </>
                ) : (
                  <>
                    <Banknote className="w-4 h-4" />
                    При получении
                  </>
                )}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Адрес доставки</span>
              <span className="text-right max-w-[200px] truncate">{order.shipping_address}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Товаров</span>
              <span>{order.items?.length || 0} шт.</span>
            </div>

            <div className="flex items-center justify-between text-lg font-semibold pt-2 border-t">
              <span>Итого</span>
              <span>{order.total?.toFixed(0)} сом</span>
            </div>
          </div>
        )}

        <div className="flex flex-col gap-3 mt-8">
          <Button asChild size="lg">
            <Link to="/profile">
              <Package className="w-4 h-4 mr-2" />
              Мои заказы
            </Link>
          </Button>
          <Button variant="outline" asChild size="lg">
            <Link to="/catalog">Продолжить покупки</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
