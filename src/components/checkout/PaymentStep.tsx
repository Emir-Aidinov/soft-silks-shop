import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ArrowLeft, CreditCard, Banknote } from "lucide-react";
import { cn } from "@/lib/utils";

type PaymentMethod = 'online' | 'cash';

interface PaymentStepProps {
  value: PaymentMethod;
  onChange: (value: PaymentMethod) => void;
  onNext: () => void;
  onBack: () => void;
}

export const PaymentStep = ({ value, onChange, onNext, onBack }: PaymentStepProps) => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-4">Способ оплаты</h2>
        <p className="text-muted-foreground text-sm mb-6">
          Выберите удобный способ оплаты
        </p>
      </div>

      <RadioGroup value={value} onValueChange={(v) => onChange(v as PaymentMethod)}>
        <div className="space-y-3">
          <Label
            htmlFor="online"
            className={cn(
              "flex items-center gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all",
              value === 'online' 
                ? "border-primary bg-primary/5" 
                : "border-border hover:border-primary/50"
            )}
          >
            <RadioGroupItem value="online" id="online" />
            <div className="flex items-center gap-3 flex-1">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-medium">Онлайн оплата</p>
                <p className="text-sm text-muted-foreground">
                  Оплата картой через Shopify
                </p>
              </div>
            </div>
          </Label>

          <Label
            htmlFor="cash"
            className={cn(
              "flex items-center gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all",
              value === 'cash' 
                ? "border-primary bg-primary/5" 
                : "border-border hover:border-primary/50"
            )}
          >
            <RadioGroupItem value="cash" id="cash" />
            <div className="flex items-center gap-3 flex-1">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Banknote className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-medium">При получении</p>
                <p className="text-sm text-muted-foreground">
                  Наличными или картой курьеру
                </p>
              </div>
            </div>
          </Label>
        </div>
      </RadioGroup>

      <div className="flex gap-3">
        <Button 
          variant="outline" 
          onClick={onBack}
          className="flex-1"
          size="lg"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Назад
        </Button>
        <Button 
          onClick={onNext}
          className="flex-1"
          size="lg"
        >
          Продолжить
        </Button>
      </div>
    </div>
  );
};
