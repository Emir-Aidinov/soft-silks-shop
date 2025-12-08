import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { CheckoutSteps } from "@/components/checkout/CheckoutSteps";
import { ContactStep } from "@/components/checkout/ContactStep";
import { AddressStep } from "@/components/checkout/AddressStep";
import { PaymentStep } from "@/components/checkout/PaymentStep";
import { ReviewStep } from "@/components/checkout/ReviewStep";
import { useCartStore } from "@/stores/cartStore";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useLoyaltyStore, POINTS_PER_SOM } from "@/stores/loyaltyStore";

const STEPS = ["Контакты", "Адрес", "Оплата", "Проверка"];

interface ContactData {
  fullName: string;
  email: string;
  phone: string;
}

interface AddressData {
  city: string;
  address: string;
  notes: string;
}

export default function Checkout() {
  const navigate = useNavigate();
  const { items, clearCart, createCheckout, checkoutUrl, isLoading, setLoading } = useCartStore();
  
  const [currentStep, setCurrentStep] = useState(0);
  const [contact, setContact] = useState<ContactData>({ fullName: "", email: "", phone: "" });
  const [address, setAddress] = useState<AddressData>({ city: "", address: "", notes: "" });
  const [paymentMethod, setPaymentMethod] = useState<'online' | 'cash'>('online');

  // Load profile data for logged-in users
  useEffect(() => {
    const loadProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("full_name, phone")
          .eq("id", user.id)
          .single();
        
        if (profile) {
          setContact((prev) => ({
            ...prev,
            fullName: profile.full_name || prev.fullName,
            email: user.email || prev.email,
            phone: profile.phone || prev.phone,
          }));
        } else {
          setContact((prev) => ({
            ...prev,
            email: user.email || prev.email,
          }));
        }
      }
    };
    loadProfile();
  }, []);

  const handleSubmit = async (promoCode: string | null, totalDiscount: number, loyaltyPointsUsed: number) => {
    setLoading(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const subtotal = items.reduce(
        (sum, item) => sum + parseFloat(item.price.amount) * item.quantity,
        0
      );
      const totalPrice = subtotal - totalDiscount;

      const orderItems = items.map((item) => ({
        productId: item.product.node.id,
        title: item.product.node.title,
        variantId: item.variantId,
        variantTitle: item.variantTitle,
        price: item.price.amount,
        quantity: item.quantity,
        options: item.selectedOptions,
        image: item.product.node.images?.edges?.[0]?.node?.url || null,
      }));

      const shippingAddress = `${address.city}, ${address.address}`;

      // Create order in Supabase
      const { data: order, error } = await supabase
        .from("orders")
        .insert({
          user_id: user?.id || "00000000-0000-0000-0000-000000000000",
          total: totalPrice,
          items: orderItems,
          shipping_address: shippingAddress,
          notes: address.notes ? `${address.notes}${promoCode ? ` | Промокод: ${promoCode}` : ''}${loyaltyPointsUsed > 0 ? ` | Баллы: ${loyaltyPointsUsed}` : ''}` : (promoCode ? `Промокод: ${promoCode}` : null),
          payment_method: paymentMethod,
          email: contact.email,
          status: "pending",
        })
        .select()
        .single();

      if (error) throw error;

      // Spend loyalty points if used
      if (user && loyaltyPointsUsed > 0) {
        const { spendPoints } = useLoyaltyStore.getState();
        await spendPoints(loyaltyPointsUsed, `Заказ #${order.id.slice(0, 8)}`);
      }

      // Add loyalty points (1% of order total)
      if (user) {
        const pointsToAdd = Math.floor(totalPrice * POINTS_PER_SOM);
        if (pointsToAdd > 0) {
          const { addPoints } = useLoyaltyStore.getState();
          await addPoints(pointsToAdd, `Заказ #${order.id.slice(0, 8)}`, order.id);
        }
      }

      // Send order confirmation email
      try {
        await supabase.functions.invoke('send-order-email', {
          body: {
            orderId: order.id,
            email: contact.email,
            type: 'created',
            total: totalPrice,
          },
        });
      } catch (emailError) {
        console.error('Failed to send confirmation email:', emailError);
        // Don't fail the order if email fails
      }

      if (paymentMethod === 'online') {
        // Create Shopify checkout and redirect
        await createCheckout();
        const url = useCartStore.getState().checkoutUrl;
        if (url) {
          clearCart();
          window.open(url, '_blank');
          navigate(`/checkout/success?orderId=${order.id}&payment=online`);
        }
      } else {
        // Cash on delivery - just show success
        clearCart();
        navigate(`/checkout/success?orderId=${order.id}&payment=cash`);
      }
    } catch (error) {
      console.error("Order error:", error);
      toast.error("Ошибка при оформлении заказа");
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container max-w-lg mx-auto px-4 py-16 text-center">
          <ShoppingBag className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <h1 className="text-2xl font-semibold mb-2">Корзина пуста</h1>
          <p className="text-muted-foreground mb-6">
            Добавьте товары в корзину для оформления заказа
          </p>
          <Button asChild>
            <Link to="/catalog">Перейти в каталог</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container max-w-lg mx-auto px-4 py-8">
        <CheckoutSteps currentStep={currentStep} steps={STEPS} />

        <div className="bg-card rounded-xl p-6 shadow-sm border">
          {currentStep === 0 && (
            <ContactStep
              data={contact}
              onChange={setContact}
              onNext={() => setCurrentStep(1)}
            />
          )}

          {currentStep === 1 && (
            <AddressStep
              data={address}
              onChange={setAddress}
              onNext={() => setCurrentStep(2)}
              onBack={() => setCurrentStep(0)}
            />
          )}

          {currentStep === 2 && (
            <PaymentStep
              value={paymentMethod}
              onChange={setPaymentMethod}
              onNext={() => setCurrentStep(3)}
              onBack={() => setCurrentStep(1)}
            />
          )}

          {currentStep === 3 && (
            <ReviewStep
              contact={contact}
              address={address}
              paymentMethod={paymentMethod}
              items={items}
              isLoading={isLoading}
              onSubmit={handleSubmit}
              onBack={() => setCurrentStep(2)}
            />
          )}
        </div>
      </div>
    </div>
  );
}
