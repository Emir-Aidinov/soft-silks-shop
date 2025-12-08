import { supabase } from "@/integrations/supabase/client";

const VAPID_PUBLIC_KEY = 'BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjBJuBkr3qBUYIHBQFLXYp5Nksh8U';

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) {
    console.log('This browser does not support notifications');
    return false;
  }

  if (!('serviceWorker' in navigator)) {
    console.log('Service workers are not supported');
    return false;
  }

  const permission = await Notification.requestPermission();
  return permission === 'granted';
}

export async function subscribeToPushNotifications(): Promise<PushSubscription | null> {
  try {
    const permission = await requestNotificationPermission();
    if (!permission) return null;

    const registration = await navigator.serviceWorker.register('/sw.js');
    await navigator.serviceWorker.ready;

    const applicationServerKey = urlBase64ToUint8Array(VAPID_PUBLIC_KEY);
    
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: applicationServerKey as BufferSource,
    });

    // Save subscription to database
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const subscriptionData = {
        user_id: user.id,
        subscription: JSON.stringify(subscription),
        endpoint: subscription.endpoint,
      };
      
      // Check if subscription exists
      const { data: existing } = await supabase
        .from('push_subscriptions')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (existing) {
        await supabase
          .from('push_subscriptions')
          .update(subscriptionData)
          .eq('user_id', user.id);
      } else {
        await supabase
          .from('push_subscriptions')
          .insert(subscriptionData);
      }
    }

    return subscription;
  } catch (error) {
    console.error('Failed to subscribe to push notifications:', error);
    return null;
  }
}

export async function unsubscribeFromPushNotifications(): Promise<boolean> {
  try {
    const registration = await navigator.serviceWorker.getRegistration();
    if (!registration) return false;

    const subscription = await registration.pushManager.getSubscription();
    if (!subscription) return false;

    await subscription.unsubscribe();

    // Remove from database
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase
        .from('push_subscriptions')
        .delete()
        .eq('user_id', user.id);
    }

    return true;
  } catch (error) {
    console.error('Failed to unsubscribe from push notifications:', error);
    return false;
  }
}

export async function checkPushSubscription(): Promise<boolean> {
  try {
    const registration = await navigator.serviceWorker.getRegistration();
    if (!registration) return false;

    const subscription = await registration.pushManager.getSubscription();
    return !!subscription;
  } catch {
    return false;
  }
}

// Show local notification (for testing or immediate feedback)
export function showLocalNotification(title: string, body: string) {
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification(title, {
      body,
      icon: '/favicon.ico',
      badge: '/favicon.ico',
    });
  }
}
