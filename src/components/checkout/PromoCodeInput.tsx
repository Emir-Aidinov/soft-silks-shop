import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tag, Check, X, Loader2 } from "lucide-react";
import { toast } from "sonner";

// Hardcoded promo codes - в реальном проекте можно подключить к Shopify Discounts API
const PROMO_CODES: Record<string, { discount: number; type: 'percent' | 'fixed'; minOrder?: number }> = {
  'WELCOME15': { discount: 15, type: 'percent' },
  'SALE10': { discount: 10, type: 'percent' },
  'DISCOUNT500': { discount: 500, type: 'fixed', minOrder: 3000 },
};

interface PromoCodeInputProps {
  subtotal: number;
  onApply: (discount: number, code: string) => void;
  onRemove: () => void;
  appliedCode: string | null;
  appliedDiscount: number;
}

export const PromoCodeInput = ({ 
  subtotal, 
  onApply, 
  onRemove, 
  appliedCode, 
  appliedDiscount 
}: PromoCodeInputProps) => {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleApply = async () => {
    if (!code.trim()) return;
    
    setLoading(true);
    setError(null);

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    const promo = PROMO_CODES[code.toUpperCase()];
    
    if (!promo) {
      setError("Промокод не найден");
      setLoading(false);
      return;
    }

    if (promo.minOrder && subtotal < promo.minOrder) {
      setError(`Минимальный заказ ${promo.minOrder} сом`);
      setLoading(false);
      return;
    }

    const discountAmount = promo.type === 'percent' 
      ? Math.round(subtotal * promo.discount / 100)
      : promo.discount;

    onApply(discountAmount, code.toUpperCase());
    toast.success(`Промокод применён! Скидка ${discountAmount} сом`);
    setCode("");
    setLoading(false);
  };

  const handleRemove = () => {
    onRemove();
    toast.info("Промокод удалён");
  };

  if (appliedCode) {
    return (
      <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Check className="h-5 w-5 text-green-600" />
            <div>
              <p className="font-medium text-green-700">{appliedCode}</p>
              <p className="text-sm text-green-600">Скидка: -{appliedDiscount} сом</p>
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={handleRemove}
            className="text-muted-foreground hover:text-destructive"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Введите промокод"
            value={code}
            onChange={(e) => {
              setCode(e.target.value.toUpperCase());
              setError(null);
            }}
            className="pl-10"
            onKeyDown={(e) => e.key === 'Enter' && handleApply()}
          />
        </div>
        <Button 
          onClick={handleApply} 
          disabled={loading || !code.trim()}
          variant="secondary"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            "Применить"
          )}
        </Button>
      </div>
      {error && (
        <p className="text-sm text-destructive flex items-center gap-1">
          <X className="h-3 w-3" />
          {error}
        </p>
      )}
    </div>
  );
};
