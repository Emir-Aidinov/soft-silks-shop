-- Create table for promo banners
CREATE TABLE public.promo_banners (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  code TEXT,
  discount TEXT NOT NULL,
  background_color TEXT DEFAULT 'primary',
  is_active BOOLEAN DEFAULT true,
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.promo_banners ENABLE ROW LEVEL SECURITY;

-- Public can view active banners
CREATE POLICY "Anyone can view active banners"
ON public.promo_banners
FOR SELECT
USING (is_active = true);

-- Admins can manage all banners
CREATE POLICY "Admins can manage banners"
ON public.promo_banners
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for updated_at
CREATE TRIGGER update_promo_banners_updated_at
BEFORE UPDATE ON public.promo_banners
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- Insert default banner
INSERT INTO public.promo_banners (title, description, code, discount, is_active)
VALUES ('Первый заказ', 'Используйте промокод при оформлении заказа', 'WELCOME15', '-15% на первый заказ', true);