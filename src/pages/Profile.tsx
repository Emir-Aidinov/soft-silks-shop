import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Package, Gift } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ReferralProgram } from "@/components/ReferralProgram";
import { useReferralStore } from "@/stores/referralStore";

interface Profile {
  full_name: string | null;
  phone: string | null;
}

interface Order {
  id: string;
  created_at: string;
  status: string;
  total: number;
  items: any;
}

export default function Profile() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<Profile>({ full_name: "", phone: "" });
  const [orders, setOrders] = useState<Order[]>([]);
  const { applyReferralCode } = useReferralStore();

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      navigate("/auth");
      return;
    }

    await loadProfile();
    await loadOrders();
    
    // Apply pending referral code if exists
    const pendingRef = localStorage.getItem('pending_referral');
    if (pendingRef) {
      const success = await applyReferralCode(pendingRef);
      if (success) {
        toast.success('Реферальный код применён!');
      }
      localStorage.removeItem('pending_referral');
    }
    
    setLoading(false);
  };

  const loadProfile = async () => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", (await supabase.auth.getUser()).data.user?.id)
      .single();

    if (error) {
      toast.error("Ошибка загрузки профиля");
      return;
    }

    setProfile(data);
  };

  const loadOrders = async () => {
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Ошибка загрузки заказов");
      return;
    }

    setOrders(data || []);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: profile.full_name,
        phone: profile.phone,
      })
      .eq("id", (await supabase.auth.getUser()).data.user?.id);

    setSaving(false);

    if (error) {
      toast.error("Ошибка сохранения профиля");
      return;
    }

    toast.success("Профиль обновлен");
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      pending: "В ожидании",
      processing: "В обработке",
      completed: "Завершен",
      cancelled: "Отменен",
    };
    return labels[status] || status;
  };

  const getStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      pending: "secondary",
      processing: "default",
      completed: "outline",
      cancelled: "destructive",
    };
    return variants[status] || "default";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-8">
        <h1 className="text-3xl font-bold mb-6">Личный кабинет</h1>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="profile">Профиль</TabsTrigger>
            <TabsTrigger value="orders">Заказы</TabsTrigger>
            <TabsTrigger value="referral" className="flex items-center gap-1">
              <Gift className="h-4 w-4" />
              Рефералы
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Мои данные</CardTitle>
                <CardDescription>
                  Редактируйте свою личную информацию
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSaveProfile} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="full_name">Полное имя</Label>
                    <Input
                      id="full_name"
                      value={profile.full_name || ""}
                      onChange={(e) =>
                        setProfile({ ...profile, full_name: e.target.value })
                      }
                      placeholder="Введите ваше имя"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Телефон</Label>
                    <Input
                      id="phone"
                      value={profile.phone || ""}
                      onChange={(e) =>
                        setProfile({ ...profile, phone: e.target.value })
                      }
                      placeholder="+7 (___) ___-__-__"
                    />
                  </div>

                  <Button type="submit" disabled={saving}>
                    {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Сохранить изменения
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="orders">
            <Card>
              <CardHeader>
                <CardTitle>История заказов</CardTitle>
                <CardDescription>
                  Просмотр всех ваших заказов
                </CardDescription>
              </CardHeader>
              <CardContent>
                {orders.length === 0 ? (
                  <div className="text-center py-12">
                    <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">У вас пока нет заказов</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.map((order) => (
                      <div
                        key={order.id}
                        className="border rounded-lg p-4 space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-semibold">
                              Заказ от{" "}
                              {new Date(order.created_at).toLocaleDateString("ru-RU")}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              #{order.id.slice(0, 8)}
                            </p>
                          </div>
                          <Badge variant={getStatusVariant(order.status)}>
                            {getStatusLabel(order.status)}
                          </Badge>
                        </div>
                        <div className="flex justify-between items-center pt-2 border-t">
                          <span className="text-sm text-muted-foreground">
                            Товаров: {Array.isArray(order.items) ? order.items.length : 0}
                          </span>
                          <span className="font-bold">
                            {order.total.toLocaleString("ru-RU")} ₽
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="referral">
            <ReferralProgram />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
