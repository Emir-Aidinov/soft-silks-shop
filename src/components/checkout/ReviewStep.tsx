import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Loader2, CreditCard, Banknote, MapPin, User } from "lucide-react";
import { CartItem } from "@/stores/cartStore";
import { PromoCodeInput } from "./PromoCodeInput";
import { LoyaltyPointsInput } from "./LoyaltyPointsInput";

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

interface ReviewStepProps {
  contact: ContactData;
  address: AddressData;
  paymentMethod: 'online' | 'cash';
  items: CartItem[];
  isLoading: boolean;
  onSubmit: (promoCode: string | null, discount: number, loyaltyPointsUsed: number) => void;
  onBack: () => void;
}

export const ReviewStep = ({
  contact,
  address,
  paymentMethod,
  items,
  isLoading,
  onSubmit,
  onBack,
}: ReviewStepProps) => {
  const [promoCode, setPromoCode] = useState<string | null>(null);
  const [promoDiscount, setPromoDiscount] = useState(0);
  const [loyaltyPointsUsed, setLoyaltyPointsUsed] = useState(0);
  const [loyaltyDiscount, setLoyaltyDiscount] = useState(0);

  const subtotal = items.reduce(
    (sum, item) => sum + parseFloat(item.price.amount) * item.quantity,
    0
  );
  
  const totalPrice = subtotal - promoDiscount - loyaltyDiscount;
  const maxLoyaltyDiscount = (subtotal - promoDiscount) * 0.5; // Max 50% discount with points

  const handleApplyPromo = (discount: number, code: string) => {
    setPromoCode(code);
    setPromoDiscount(discount);
    // Reset loyalty if it exceeds new max
    if (loyaltyDiscount > (subtotal - discount) * 0.5) {
      setLoyaltyPointsUsed(0);
      setLoyaltyDiscount(0);
    }
  };

  const handleRemovePromo = () => {
    setPromoCode(null);
    setPromoDiscount(0);
  };

  const handleApplyLoyalty = (points: number, discount: number) => {
    setLoyaltyPointsUsed(points);
    setLoyaltyDiscount(discount);
  };

  const handleRemoveLoyalty = () => {
    setLoyaltyPointsUsed(0);
    setLoyaltyDiscount(0);
  };

  const handleSubmit = () => {
    onSubmit(promoCode, promoDiscount + loyaltyDiscount, loyaltyPointsUsed);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-4">Проверьте заказ</h2>
        <p className="text-muted-foreground text-sm mb-6">
          Убедитесь, что все данные верны
        </p>
      </div>

      {/* Contact Info */}
      <div className="p-4 rounded-lg bg-muted/50 space-y-2">
        <div className="flex items-center gap-2 text-sm font-medium">
          <User className="w-4 h-4" />
          Контактные данные
        </div>
        <div className="text-sm space-y-1 pl-6">
          <p>{contact.fullName}</p>
          <p className="text-muted-foreground">{contact.email}</p>
          <p className="text-muted-foreground">{contact.phone}</p>
        </div>
      </div>

      {/* Address */}
      <div className="p-4 rounded-lg bg-muted/50 space-y-2">
        <div className="flex items-center gap-2 text-sm font-medium">
          <MapPin className="w-4 h-4" />
          Адрес доставки
        </div>
        <div className="text-sm space-y-1 pl-6">
          <p>{address.city}</p>
          <p className="text-muted-foreground">{address.address}</p>
          {address.notes && (
            <p className="text-muted-foreground italic">"{address.notes}"</p>
          )}
        </div>
      </div>

      {/* Payment */}
      <div className="p-4 rounded-lg bg-muted/50 space-y-2">
        <div className="flex items-center gap-2 text-sm font-medium">
          {paymentMethod === 'online' ? (
            <CreditCard className="w-4 h-4" />
          ) : (
            <Banknote className="w-4 h-4" />
          )}
          Способ оплаты
        </div>
        <p className="text-sm pl-6">
          {paymentMethod === 'online' ? 'Онлайн оплата картой' : 'Оплата при получении'}
        </p>
      </div>

      <Separator />

      {/* Items */}
      <div className="space-y-3">
        <h3 className="font-medium">Товары ({items.length})</h3>
        {items.map((item) => (
          <div key={item.variantId} className="flex gap-3">
            <div className="w-16 h-16 bg-muted rounded-md overflow-hidden flex-shrink-0">
              {item.product.node.images?.edges?.[0]?.node && (
                <img
                  src={item.product.node.images.edges[0].node.url}
                  alt={item.product.node.title}
                  className="w-full h-full object-cover"
                />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">{item.product.node.title}</p>
              <p className="text-xs text-muted-foreground">
                {item.selectedOptions.map((o) => o.value).join(' • ')}
              </p>
              <p className="text-sm">
                {item.quantity} × {parseFloat(item.price.amount).toFixed(0)} сом
              </p>
            </div>
          </div>
        ))}
      </div>

      <Separator />

      {/* Promo Code */}
      <PromoCodeInput
        subtotal={subtotal}
        onApply={handleApplyPromo}
        onRemove={handleRemovePromo}
        appliedCode={promoCode}
        appliedDiscount={promoDiscount}
      />

      {/* Loyalty Points */}
      <LoyaltyPointsInput
        maxDiscount={maxLoyaltyDiscount}
        onApply={handleApplyLoyalty}
        onRemove={handleRemoveLoyalty}
        appliedPoints={loyaltyPointsUsed}
        appliedDiscount={loyaltyDiscount}
      />

      <Separator />

      {/* Total */}
      <div className="space-y-2">
        <div className="flex justify-between items-center text-sm text-muted-foreground">
          <span>Подытог</span>
          <span>{subtotal.toFixed(0)} сом</span>
        </div>
        {promoDiscount > 0 && (
          <div className="flex justify-between items-center text-sm text-green-600">
            <span>Скидка ({promoCode})</span>
            <span>-{promoDiscount} сом</span>
          </div>
        )}
        {loyaltyDiscount > 0 && (
          <div className="flex justify-between items-center text-sm text-amber-600">
            <span>Баллы лояльности</span>
            <span>-{loyaltyDiscount} сом</span>
          </div>
        )}
        <div className="flex justify-between items-center text-lg font-semibold">
          <span>Итого</span>
          <span>{totalPrice.toFixed(0)} сом</span>
        </div>
      </div>

      <div className="flex gap-3">
        <Button
          variant="outline"
          onClick={onBack}
          disabled={isLoading}
          className="flex-1"
          size="lg"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Назад
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={isLoading}
          className="flex-1"
          size="lg"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Оформление...
            </>
          ) : paymentMethod === 'online' ? (
            'Перейти к оплате'
          ) : (
            'Оформить заказ'
          )}
        </Button>
      </div>
    </div>
  );
};
