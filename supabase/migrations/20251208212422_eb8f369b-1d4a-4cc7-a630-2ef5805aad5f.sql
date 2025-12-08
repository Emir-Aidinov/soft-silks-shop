-- Create referrals table for referral program
CREATE TABLE public.referrals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  referral_code TEXT NOT NULL UNIQUE,
  referred_by UUID REFERENCES public.referrals(id),
  bonus_earned NUMERIC DEFAULT 0,
  referral_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

-- Users can view their own referral info
CREATE POLICY "Users can view their own referral"
ON public.referrals
FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own referral
CREATE POLICY "Users can create their own referral"
ON public.referrals
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own referral
CREATE POLICY "Users can update their own referral"
ON public.referrals
FOR UPDATE
USING (auth.uid() = user_id);

-- Admins can view all referrals
CREATE POLICY "Admins can view all referrals"
ON public.referrals
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for updated_at
CREATE TRIGGER update_referrals_updated_at
BEFORE UPDATE ON public.referrals
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();