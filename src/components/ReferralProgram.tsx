import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useReferralStore } from '@/stores/referralStore';
import { Gift, Copy, Users, Coins, Check } from 'lucide-react';
import { toast } from 'sonner';

export const ReferralProgram = () => {
  const { referralData, loading, error, fetchReferralData, createReferralCode, applyReferralCode } = useReferralStore();
  const [inputCode, setInputCode] = useState('');
  const [applying, setApplying] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchReferralData();
  }, [fetchReferralData]);

  const handleCreateCode = async () => {
    const code = await createReferralCode();
    if (code) {
      toast.success('Реферальный код создан!');
    }
  };

  const handleApplyCode = async () => {
    if (!inputCode.trim()) return;
    
    setApplying(true);
    const success = await applyReferralCode(inputCode.trim());
    setApplying(false);

    if (success) {
      toast.success('Реферальный код применён! Вы получили скидку.');
      setInputCode('');
    } else {
      toast.error(error || 'Не удалось применить код');
    }
  };

  const handleCopyCode = () => {
    if (referralData?.referral_code) {
      navigator.clipboard.writeText(referralData.referral_code);
      setCopied(true);
      toast.success('Код скопирован!');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleCopyLink = () => {
    if (referralData?.referral_code) {
      const link = `${window.location.origin}?ref=${referralData.referral_code}`;
      navigator.clipboard.writeText(link);
      toast.success('Ссылка скопирована!');
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          Загрузка...
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gift className="h-5 w-5 text-primary" />
            Реферальная программа
          </CardTitle>
          <CardDescription>
            Приглашайте друзей и получайте бонусы! За каждого приглашённого друга вы получаете 100 сом на счёт.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {!referralData ? (
            <div className="text-center py-4">
              <p className="text-muted-foreground mb-4">
                У вас ещё нет реферального кода. Создайте его, чтобы начать приглашать друзей!
              </p>
              <Button onClick={handleCreateCode}>
                <Gift className="mr-2 h-4 w-4" />
                Создать реферальный код
              </Button>
            </div>
          ) : (
            <>
              {/* Stats */}
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                        <Users className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold">{referralData.referral_count}</p>
                        <p className="text-sm text-muted-foreground">Приглашено</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-500/10">
                        <Coins className="h-5 w-5 text-green-500" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold">{referralData.bonus_earned} сом</p>
                        <p className="text-sm text-muted-foreground">Заработано</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Referral Code */}
              <div className="space-y-3">
                <Label>Ваш реферальный код</Label>
                <div className="flex gap-2">
                  <Input
                    value={referralData.referral_code}
                    readOnly
                    className="font-mono text-lg tracking-wider"
                  />
                  <Button variant="outline" onClick={handleCopyCode}>
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
                <Button variant="secondary" className="w-full" onClick={handleCopyLink}>
                  Скопировать пригласительную ссылку
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Apply code section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Есть код от друга?</CardTitle>
          <CardDescription>
            Введите реферальный код друга и получите скидку на первый заказ
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              placeholder="Введите код"
              value={inputCode}
              onChange={(e) => setInputCode(e.target.value.toUpperCase())}
              className="font-mono uppercase"
            />
            <Button onClick={handleApplyCode} disabled={applying || !inputCode.trim()}>
              {applying ? 'Применяем...' : 'Применить'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
