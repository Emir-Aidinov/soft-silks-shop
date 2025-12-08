-- Create payment_method enum
CREATE TYPE public.payment_method AS ENUM ('online', 'cash');

-- Add payment_method and email columns to orders table
ALTER TABLE public.orders 
ADD COLUMN payment_method payment_method NOT NULL DEFAULT 'online',
ADD COLUMN email text;