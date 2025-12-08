import { create } from 'zustand';
import { supabase } from '@/integrations/supabase/client';

interface ReferralData {
  id: string;
  referral_code: string;
  bonus_earned: number;
  referral_count: number;
}

interface ReferralStore {
  referralData: ReferralData | null;
  loading: boolean;
  error: string | null;
  fetchReferralData: () => Promise<void>;
  createReferralCode: () => Promise<string | null>;
  applyReferralCode: (code: string) => Promise<boolean>;
}

const generateReferralCode = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = 'BSC';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

export const useReferralStore = create<ReferralStore>((set, get) => ({
  referralData: null,
  loading: false,
  error: null,

  fetchReferralData: async () => {
    set({ loading: true, error: null });
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      set({ loading: false, referralData: null });
      return;
    }

    const { data, error } = await supabase
      .from('referrals')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (error) {
      set({ loading: false, error: error.message });
      return;
    }

    set({ loading: false, referralData: data });
  },

  createReferralCode: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const code = generateReferralCode();
    
    const { data, error } = await supabase
      .from('referrals')
      .insert({
        user_id: user.id,
        referral_code: code,
      })
      .select()
      .single();

    if (error) {
      set({ error: error.message });
      return null;
    }

    set({ referralData: data });
    return code;
  },

  applyReferralCode: async (code: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    // Find referrer by code
    const { data: referrer, error: findError } = await supabase
      .from('referrals')
      .select('*')
      .eq('referral_code', code.toUpperCase())
      .maybeSingle();

    if (findError || !referrer) {
      set({ error: 'Реферальный код не найден' });
      return false;
    }

    // Can't use own code
    if (referrer.user_id === user.id) {
      set({ error: 'Нельзя использовать собственный код' });
      return false;
    }

    // Check if user already has a referral record
    const { data: existing } = await supabase
      .from('referrals')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (existing?.referred_by) {
      set({ error: 'Вы уже использовали реферальный код' });
      return false;
    }

    // Create or update user's referral record with referred_by
    const newCode = generateReferralCode();
    
    if (existing) {
      await supabase
        .from('referrals')
        .update({ referred_by: referrer.id })
        .eq('id', existing.id);
    } else {
      await supabase
        .from('referrals')
        .insert({
          user_id: user.id,
          referral_code: newCode,
          referred_by: referrer.id,
        });
    }

    // Update referrer's count and bonus
    await supabase
      .from('referrals')
      .update({
        referral_count: (referrer.referral_count || 0) + 1,
        bonus_earned: (Number(referrer.bonus_earned) || 0) + 100, // 100 сом бонус
      })
      .eq('id', referrer.id);

    await get().fetchReferralData();
    return true;
  },
}));
