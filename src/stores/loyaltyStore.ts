import { create } from 'zustand';
import { supabase } from '@/integrations/supabase/client';

interface LoyaltyPoints {
  id: string;
  points: number;
  total_earned: number;
  total_spent: number;
}

interface LoyaltyTransaction {
  id: string;
  points: number;
  type: string;
  description: string | null;
  created_at: string;
}

interface LoyaltyStore {
  points: LoyaltyPoints | null;
  transactions: LoyaltyTransaction[];
  loading: boolean;
  error: string | null;
  fetchLoyaltyData: () => Promise<void>;
  addPoints: (amount: number, description: string, orderId?: string) => Promise<boolean>;
  spendPoints: (amount: number, description: string) => Promise<boolean>;
}

// 1 сом = 1 балл (1% от суммы покупки)
export const POINTS_PER_SOM = 0.01;

export const useLoyaltyStore = create<LoyaltyStore>((set, get) => ({
  points: null,
  transactions: [],
  loading: false,
  error: null,

  fetchLoyaltyData: async () => {
    set({ loading: true, error: null });

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      set({ loading: false, points: null, transactions: [] });
      return;
    }

    // Fetch points
    const { data: pointsData, error: pointsError } = await supabase
      .from('loyalty_points')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (pointsError) {
      set({ loading: false, error: pointsError.message });
      return;
    }

    // Fetch transactions
    const { data: transactionsData, error: transError } = await supabase
      .from('loyalty_transactions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(20);

    if (transError) {
      set({ loading: false, error: transError.message });
      return;
    }

    set({
      loading: false,
      points: pointsData,
      transactions: transactionsData || [],
    });
  },

  addPoints: async (amount: number, description: string, orderId?: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const currentPoints = get().points;

    if (!currentPoints) {
      // Create new loyalty record
      const { data, error } = await supabase
        .from('loyalty_points')
        .insert({
          user_id: user.id,
          points: amount,
          total_earned: amount,
          total_spent: 0,
        })
        .select()
        .single();

      if (error) {
        set({ error: error.message });
        return false;
      }
    } else {
      // Update existing record
      const { error } = await supabase
        .from('loyalty_points')
        .update({
          points: currentPoints.points + amount,
          total_earned: currentPoints.total_earned + amount,
        })
        .eq('id', currentPoints.id);

      if (error) {
        set({ error: error.message });
        return false;
      }
    }

    // Add transaction record
    await supabase
      .from('loyalty_transactions')
      .insert({
        user_id: user.id,
        order_id: orderId || null,
        points: amount,
        type: 'earned',
        description,
      });

    await get().fetchLoyaltyData();
    return true;
  },

  spendPoints: async (amount: number, description: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const currentPoints = get().points;
    if (!currentPoints || currentPoints.points < amount) {
      set({ error: 'Недостаточно баллов' });
      return false;
    }

    const { error } = await supabase
      .from('loyalty_points')
      .update({
        points: currentPoints.points - amount,
        total_spent: currentPoints.total_spent + amount,
      })
      .eq('id', currentPoints.id);

    if (error) {
      set({ error: error.message });
      return false;
    }

    // Add transaction record
    await supabase
      .from('loyalty_transactions')
      .insert({
        user_id: user.id,
        points: -amount,
        type: 'spent',
        description,
      });

    await get().fetchLoyaltyData();
    return true;
  },
}));
