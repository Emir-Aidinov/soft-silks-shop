import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

interface ContactData {
  fullName: string;
  email: string;
  phone: string;
}

interface ContactStepProps {
  data: ContactData;
  onChange: (data: ContactData) => void;
  onNext: () => void;
}

export const ContactStep = ({ data, onChange, onNext }: ContactStepProps) => {
  const isValid = data.fullName.trim() && data.email.trim() && data.phone.trim();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-4">Контактные данные</h2>
        <p className="text-muted-foreground text-sm mb-6">
          Укажите ваши данные для связи по заказу
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="fullName">Имя и фамилия *</Label>
          <Input
            id="fullName"
            placeholder="Иван Иванов"
            value={data.fullName}
            onChange={(e) => onChange({ ...data, fullName: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email *</Label>
          <Input
            id="email"
            type="email"
            placeholder="example@mail.com"
            value={data.email}
            onChange={(e) => onChange({ ...data, email: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Телефон *</Label>
          <Input
            id="phone"
            type="tel"
            placeholder="+996 XXX XXX XXX"
            value={data.phone}
            onChange={(e) => onChange({ ...data, phone: e.target.value })}
          />
        </div>
      </div>

      <Button 
        onClick={onNext} 
        disabled={!isValid}
        className="w-full"
        size="lg"
      >
        Продолжить
      </Button>
    </div>
  );
};
