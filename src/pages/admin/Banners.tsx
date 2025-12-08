import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Loader2, Calendar } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { formatDate } from "@/lib/admin-utils";

interface PromoBanner {
  id: string;
  title: string;
  description: string | null;
  code: string | null;
  discount: string;
  background_color: string | null;
  is_active: boolean;
  start_date: string | null;
  end_date: string | null;
  created_at: string;
}

export default function Banners() {
  const [banners, setBanners] = useState<PromoBanner[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<PromoBanner | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    code: "",
    discount: "",
    is_active: true,
    end_date: "",
  });

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    try {
      const { data, error } = await supabase
        .from("promo_banners")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setBanners(data || []);
    } catch (error) {
      console.error("Error fetching banners:", error);
      toast.error("Ошибка загрузки баннеров");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const bannerData = {
        title: formData.title,
        description: formData.description || null,
        code: formData.code || null,
        discount: formData.discount,
        is_active: formData.is_active,
        end_date: formData.end_date ? new Date(formData.end_date).toISOString() : null,
      };

      if (editingBanner) {
        const { error } = await supabase
          .from("promo_banners")
          .update(bannerData)
          .eq("id", editingBanner.id);

        if (error) throw error;
        toast.success("Баннер обновлён");
      } else {
        const { error } = await supabase
          .from("promo_banners")
          .insert(bannerData);

        if (error) throw error;
        toast.success("Баннер создан");
      }

      setDialogOpen(false);
      resetForm();
      fetchBanners();
    } catch (error) {
      console.error("Error saving banner:", error);
      toast.error("Ошибка сохранения баннера");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Удалить этот баннер?")) return;

    try {
      const { error } = await supabase
        .from("promo_banners")
        .delete()
        .eq("id", id);

      if (error) throw error;
      toast.success("Баннер удалён");
      fetchBanners();
    } catch (error) {
      console.error("Error deleting banner:", error);
      toast.error("Ошибка удаления баннера");
    }
  };

  const handleToggleActive = async (id: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from("promo_banners")
        .update({ is_active: isActive })
        .eq("id", id);

      if (error) throw error;
      toast.success(isActive ? "Баннер включён" : "Баннер выключен");
      fetchBanners();
    } catch (error) {
      console.error("Error toggling banner:", error);
      toast.error("Ошибка обновления баннера");
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      code: "",
      discount: "",
      is_active: true,
      end_date: "",
    });
    setEditingBanner(null);
  };

  const openEditDialog = (banner: PromoBanner) => {
    setEditingBanner(banner);
    setFormData({
      title: banner.title,
      description: banner.description || "",
      code: banner.code || "",
      discount: banner.discount,
      is_active: banner.is_active,
      end_date: banner.end_date ? banner.end_date.split("T")[0] : "",
    });
    setDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold">Баннеры и акции</h2>
        <Dialog open={dialogOpen} onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Добавить баннер
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingBanner ? "Редактировать баннер" : "Новый баннер"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="title">Название</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="discount">Скидка (текст)</Label>
                <Input
                  id="discount"
                  value={formData.discount}
                  onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
                  placeholder="-15% на первый заказ"
                  required
                />
              </div>
              <div>
                <Label htmlFor="code">Промокод</Label>
                <Input
                  id="code"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  placeholder="WELCOME15"
                />
              </div>
              <div>
                <Label htmlFor="description">Описание</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Используйте промокод при оформлении заказа"
                />
              </div>
              <div>
                <Label htmlFor="end_date">Дата окончания (для таймера)</Label>
                <Input
                  id="end_date"
                  type="datetime-local"
                  value={formData.end_date}
                  onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                />
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
                <Label htmlFor="is_active">Активен</Label>
              </div>
              <Button type="submit" className="w-full">
                {editingBanner ? "Сохранить" : "Создать"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {banners.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">Баннеров пока нет</p>
            </CardContent>
          </Card>
        ) : (
          banners.map((banner) => (
            <Card key={banner.id} className={!banner.is_active ? "opacity-60" : ""}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{banner.title}</CardTitle>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={banner.is_active}
                      onCheckedChange={(checked) => handleToggleActive(banner.id, checked)}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openEditDialog(banner)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(banner.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Скидка</p>
                    <p className="font-semibold text-primary">{banner.discount}</p>
                  </div>
                  {banner.code && (
                    <div>
                      <p className="text-muted-foreground">Промокод</p>
                      <p className="font-mono font-semibold">{banner.code}</p>
                    </div>
                  )}
                  {banner.end_date && (
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-muted-foreground">До</p>
                        <p className="font-medium">{formatDate(banner.end_date)}</p>
                      </div>
                    </div>
                  )}
                </div>
                {banner.description && (
                  <p className="text-sm text-muted-foreground mt-3">{banner.description}</p>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
