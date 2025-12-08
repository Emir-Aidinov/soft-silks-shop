import { useState, useEffect } from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Bell, BellOff, Loader2 } from "lucide-react";
import { 
  subscribeToPushNotifications, 
  unsubscribeFromPushNotifications, 
  checkPushSubscription 
} from "@/lib/pushNotifications";
import { toast } from "sonner";

export const PushNotificationToggle = () => {
  const [isEnabled, setIsEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSupported, setIsSupported] = useState(true);

  useEffect(() => {
    const checkStatus = async () => {
      if (!('Notification' in window) || !('serviceWorker' in navigator)) {
        setIsSupported(false);
        setIsLoading(false);
        return;
      }

      const subscribed = await checkPushSubscription();
      setIsEnabled(subscribed);
      setIsLoading(false);
    };

    checkStatus();
  }, []);

  const handleToggle = async (enabled: boolean) => {
    setIsLoading(true);

    try {
      if (enabled) {
        const subscription = await subscribeToPushNotifications();
        if (subscription) {
          setIsEnabled(true);
          toast.success('Push-уведомления включены');
        } else {
          toast.error('Не удалось включить уведомления');
        }
      } else {
        const success = await unsubscribeFromPushNotifications();
        if (success) {
          setIsEnabled(false);
          toast.success('Push-уведомления отключены');
        }
      }
    } catch (error) {
      console.error('Toggle error:', error);
      toast.error('Ошибка при изменении настроек');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isSupported) {
    return (
      <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
        <BellOff className="w-5 h-5 text-muted-foreground" />
        <div className="flex-1">
          <p className="text-sm font-medium">Push-уведомления</p>
          <p className="text-xs text-muted-foreground">
            Не поддерживается вашим браузером
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
      <div className="flex items-center gap-3">
        {isEnabled ? (
          <Bell className="w-5 h-5 text-primary" />
        ) : (
          <BellOff className="w-5 h-5 text-muted-foreground" />
        )}
        <div>
          <Label htmlFor="push-toggle" className="text-sm font-medium cursor-pointer">
            Push-уведомления
          </Label>
          <p className="text-xs text-muted-foreground">
            Получайте уведомления о статусе заказа
          </p>
        </div>
      </div>
      
      {isLoading ? (
        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
      ) : (
        <Switch
          id="push-toggle"
          checked={isEnabled}
          onCheckedChange={handleToggle}
        />
      )}
    </div>
  );
};
