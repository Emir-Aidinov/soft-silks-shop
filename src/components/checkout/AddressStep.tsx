import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft } from "lucide-react";

interface AddressData {
  city: string;
  address: string;
  notes: string;
}

interface AddressStepProps {
  data: AddressData;
  onChange: (data: AddressData) => void;
  onNext: () => void;
  onBack: () => void;
}

export const AddressStep = ({ data, onChange, onNext, onBack }: AddressStepProps) => {
  const isValid = data.city.trim() && data.address.trim();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-4">Адрес доставки</h2>
        <p className="text-muted-foreground text-sm mb-6">
          Укажите адрес, куда доставить заказ
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="city">Город *</Label>
          <Input
            id="city"
            placeholder="Бишкек"
            value={data.city}
            onChange={(e) => onChange({ ...data, city: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="address">Адрес доставки *</Label>
          <Textarea
            id="address"
            placeholder="Улица, дом, квартира"
            value={data.address}
            onChange={(e) => onChange({ ...data, address: e.target.value })}
            rows={3}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="notes">Комментарий к заказу</Label>
          <Textarea
            id="notes"
            placeholder="Дополнительная информация для курьера"
            value={data.notes}
            onChange={(e) => onChange({ ...data, notes: e.target.value })}
            rows={2}
          />
        </div>
      </div>

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
          disabled={!isValid}
          className="flex-1"
          size="lg"
        >
          Продолжить
        </Button>
      </div>
    </div>
  );
};
