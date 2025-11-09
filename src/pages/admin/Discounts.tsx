import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface PriceRule {
  id: number;
  title: string;
  value_type: string;
  value: string;
  starts_at: string | null;
  ends_at: string | null;
  usage_limit: number | null;
}

interface DiscountCode {
  id: number;
  code: string;
  usage_count: number;
}

export default function Discounts() {
  const [priceRules, setPriceRules] = useState<PriceRule[]>([]);
  const [discountCodes, setDiscountCodes] = useState<Record<number, DiscountCode[]>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedPriceRule, setSelectedPriceRule] = useState<number | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [valueType, setValueType] = useState<'percentage' | 'fixed_amount'>('percentage');
  const [value, setValue] = useState('');
  const [prerequisiteSubtotal, setPrerequisiteSubtotal] = useState('');
  const [startsAt, setStartsAt] = useState('');
  const [endsAt, setEndsAt] = useState('');
  const [newCodeInput, setNewCodeInput] = useState('');

  useEffect(() => {
    fetchPriceRules();
  }, []);

  const fetchPriceRules = async () => {
    try {
      setIsLoading(true);
      // TODO: Implement Shopify API call to fetch price rules
      // This is a placeholder - you'll need to call your Shopify API endpoint
      toast.info('Функция управления скидками требует интеграции с Shopify API');
      setPriceRules([]);
    } catch (error) {
      console.error('Error fetching price rules:', error);
      toast.error('Ошибка при загрузке скидок');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDiscountCodes = async (priceRuleId: number) => {
    try {
      // TODO: Implement Shopify API call to fetch discount codes
      setDiscountCodes(prev => ({ ...prev, [priceRuleId]: [] }));
    } catch (error) {
      console.error('Error fetching discount codes:', error);
    }
  };

  const createPriceRule = async () => {
    try {
      if (!title || !value) {
        toast.error('Заполните все обязательные поля');
        return;
      }

      // TODO: Implement Shopify API call to create price rule
      toast.success('Скидка создана (требуется интеграция с Shopify API)');
      setIsCreateOpen(false);
      resetForm();
      fetchPriceRules();
    } catch (error) {
      console.error('Error creating price rule:', error);
      toast.error('Ошибка при создании скидки');
    }
  };

  const createDiscountCode = async (priceRuleId: number) => {
    try {
      if (!newCodeInput) {
        toast.error('Введите промокод');
        return;
      }

      // TODO: Implement Shopify API call to create discount code
      toast.success('Промокод создан (требуется интеграция с Shopify API)');
      setNewCodeInput('');
      fetchDiscountCodes(priceRuleId);
    } catch (error) {
      console.error('Error creating discount code:', error);
      toast.error('Ошибка при создании промокода');
    }
  };

  const deletePriceRule = async (id: number) => {
    try {
      // TODO: Implement Shopify API call to delete price rule
      toast.success('Скидка удалена (требуется интеграция с Shopify API)');
      fetchPriceRules();
    } catch (error) {
      console.error('Error deleting price rule:', error);
      toast.error('Ошибка при удалении скидки');
    }
  };

  const resetForm = () => {
    setTitle('');
    setValueType('percentage');
    setValue('');
    setPrerequisiteSubtotal('');
    setStartsAt('');
    setEndsAt('');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold">Скидки и промокоды</h2>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Создать скидку
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Создать новую скидку</DialogTitle>
              <DialogDescription>
                Настройте параметры скидки и создайте промокоды для нее
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Название скидки</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Летняя распродажа"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="valueType">Тип скидки</Label>
                  <Select value={valueType} onValueChange={(v: any) => setValueType(v)}>
                    <SelectTrigger id="valueType">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">Процент</SelectItem>
                      <SelectItem value="fixed_amount">Фиксированная сумма</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="value">Значение</Label>
                  <Input
                    id="value"
                    type="number"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    placeholder={valueType === 'percentage' ? '20' : '1000'}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="prerequisiteSubtotal">
                  Минимальная сумма заказа (необязательно)
                </Label>
                <Input
                  id="prerequisiteSubtotal"
                  type="number"
                  value={prerequisiteSubtotal}
                  onChange={(e) => setPrerequisiteSubtotal(e.target.value)}
                  placeholder="5000"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startsAt">Дата начала (необязательно)</Label>
                  <Input
                    id="startsAt"
                    type="datetime-local"
                    value={startsAt}
                    onChange={(e) => setStartsAt(e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="endsAt">Дата окончания (необязательно)</Label>
                  <Input
                    id="endsAt"
                    type="datetime-local"
                    value={endsAt}
                    onChange={(e) => setEndsAt(e.target.value)}
                  />
                </div>
              </div>

              <Button onClick={createPriceRule} className="w-full">
                Создать скидку
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Активные скидки</CardTitle>
        </CardHeader>
        <CardContent>
          {priceRules.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">
                Скидки не найдены
              </p>
              <p className="text-sm text-muted-foreground">
                Для работы с Shopify API скидок требуется дополнительная настройка интеграции
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Название</TableHead>
                  <TableHead>Скидка</TableHead>
                  <TableHead>Период</TableHead>
                  <TableHead>Промокоды</TableHead>
                  <TableHead>Действия</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {priceRules.map((rule) => (
                  <TableRow key={rule.id}>
                    <TableCell className="font-medium">{rule.title}</TableCell>
                    <TableCell>
                      {rule.value_type === 'percentage'
                        ? `${Math.abs(Number(rule.value))}%`
                        : `${Math.abs(Number(rule.value))} ₽`}
                    </TableCell>
                    <TableCell className="text-sm">
                      {rule.starts_at && rule.ends_at
                        ? `${new Date(rule.starts_at).toLocaleDateString()} - ${new Date(rule.ends_at).toLocaleDateString()}`
                        : 'Без ограничений'}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedPriceRule(rule.id);
                          fetchDiscountCodes(rule.id);
                        }}
                      >
                        Управление
                      </Button>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deletePriceRule(rule.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {selectedPriceRule && (
        <Card>
          <CardHeader>
            <CardTitle>Промокоды</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex gap-2">
                <Input
                  value={newCodeInput}
                  onChange={(e) => setNewCodeInput(e.target.value.toUpperCase())}
                  placeholder="SUMMER2025"
                />
                <Button onClick={() => createDiscountCode(selectedPriceRule)}>
                  Добавить промокод
                </Button>
              </div>

              {discountCodes[selectedPriceRule]?.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">
                  Промокоды не созданы
                </p>
              ) : (
                <div className="space-y-2">
                  {discountCodes[selectedPriceRule]?.map((code) => (
                    <div
                      key={code.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div>
                        <p className="font-mono font-semibold">{code.code}</p>
                        <p className="text-sm text-muted-foreground">
                          Использований: {code.usage_count}
                        </p>
                      </div>
                      <Button variant="ghost" size="sm">
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
