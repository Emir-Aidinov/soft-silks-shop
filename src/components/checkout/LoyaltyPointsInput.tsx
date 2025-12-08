import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Coins, Check, X, Info } from "lucide-react";
import { useLoyaltyStore } from "@/stores/loyaltyStore";
import { supabase } from "@/integrations/supabase/client";

interface LoyaltyPointsInputProps {
  maxDiscount: number;
  onApply: (pointsUsed: number, discount: number) => void;
  onRemove: () => void;
  appliedPoints: number;
  appliedDiscount: number;
}

export const LoyaltyPointsInput = ({
  maxDiscount,
  onApply,
  onRemove,
  appliedPoints,
  appliedDiscount,
}: LoyaltyPointsInputProps) => {
  const { points, fetchLoyaltyData } = useLoyaltyStore();
  const [pointsToUse, setPointsToUse] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setIsLoggedIn(!!user);
      if (user) {
        fetchLoyaltyData();
      }
    };
    checkAuth();
  }, [fetchLoyaltyData]);

  const availablePoints = points?.points || 0;
  // 1 балл = 1 сом скидки
  const maxUsablePoints = Math.min(availablePoints, Math.floor(maxDiscount));

  const handleApply = () => {
    const pts = parseInt(pointsToUse);
    if (isNaN(pts) || pts <= 0) return;
    
    const actualPoints = Math.min(pts, maxUsablePoints);
    if (actualPoints > 0) {
      onApply(actualPoints, actualPoints); // 1 балл = 1 сом
      setPointsToUse("");
    }
  };

  const handleUseAll = () => {
    if (maxUsablePoints > 0) {
      onApply(maxUsablePoints, maxUsablePoints);
      setPointsToUse("");
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="p-3 rounded-lg bg-muted/30 border border-dashed">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Info className="w-4 h-4" />
          <span>Войдите, чтобы использовать баллы лояльности</span>
        </div>
      </div>
    );
  }

  if (availablePoints === 0) {
    return (
      <div className="p-3 rounded-lg bg-muted/30 border border-dashed">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Coins className="w-4 h-4" />
          <span>У вас пока нет баллов лояльности</span>
        </div>
      </div>
    );
  }

  if (appliedPoints > 0) {
    return (
      <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">
              Использовано {appliedPoints} баллов
            </span>
            <Badge variant="secondary" className="text-xs">
              -{appliedDiscount} сом
            </Badge>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onRemove}
            className="h-7 px-2"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Coins className="w-4 h-4 text-amber-500" />
          <span className="text-sm font-medium">Баллы лояльности</span>
        </div>
        <Badge variant="outline" className="text-xs">
          Доступно: {availablePoints} баллов
        </Badge>
      </div>
      
      <div className="flex gap-2">
        <Input
          type="number"
          placeholder={`Макс. ${maxUsablePoints}`}
          value={pointsToUse}
          onChange={(e) => setPointsToUse(e.target.value)}
          className="flex-1"
          min={1}
          max={maxUsablePoints}
        />
        <Button
          variant="outline"
          size="sm"
          onClick={handleApply}
          disabled={!pointsToUse || parseInt(pointsToUse) <= 0}
        >
          Применить
        </Button>
        <Button
          variant="secondary"
          size="sm"
          onClick={handleUseAll}
          disabled={maxUsablePoints <= 0}
        >
          Все
        </Button>
      </div>
      
      <p className="text-xs text-muted-foreground">
        1 балл = 1 сом скидки. Макс. скидка: {Math.floor(maxDiscount * 0.5)} сом (50% от заказа)
      </p>
    </div>
  );
};
