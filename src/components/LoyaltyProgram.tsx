import { useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useLoyaltyStore, POINTS_PER_SOM } from '@/stores/loyaltyStore';
import { Coins, TrendingUp, TrendingDown, History, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export const LoyaltyProgram = () => {
  const { points, transactions, loading, fetchLoyaltyData } = useLoyaltyStore();

  useEffect(() => {
    fetchLoyaltyData();
  }, [fetchLoyaltyData]);

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'earned':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'spent':
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      case 'bonus':
        return <Sparkles className="h-4 w-4 text-amber-500" />;
      case 'referral':
        return <Sparkles className="h-4 w-4 text-purple-500" />;
      default:
        return <Coins className="h-4 w-4" />;
    }
  };

  const getTransactionLabel = (type: string) => {
    switch (type) {
      case 'earned':
        return 'Начислено';
      case 'spent':
        return 'Списано';
      case 'bonus':
        return 'Бонус';
      case 'referral':
        return 'Реферал';
      default:
        return type;
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
            <Coins className="h-5 w-5 text-amber-500" />
            Программа лояльности
          </CardTitle>
          <CardDescription>
            Накапливайте баллы с каждой покупки! 1% от суммы заказа = бонусные баллы.
            Используйте их для скидок на следующие покупки.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Current balance */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <Card className="bg-gradient-to-br from-amber-500/10 to-orange-500/10">
              <CardContent className="pt-6">
                <div className="text-center">
                  <Coins className="h-8 w-8 text-amber-500 mx-auto mb-2" />
                  <p className="text-3xl font-bold text-amber-600">
                    {points?.points || 0}
                  </p>
                  <p className="text-sm text-muted-foreground">Баллов</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <TrendingUp className="h-6 w-6 text-green-500 mx-auto mb-2" />
                  <p className="text-xl font-bold">{points?.total_earned || 0}</p>
                  <p className="text-sm text-muted-foreground">Всего начислено</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <TrendingDown className="h-6 w-6 text-muted-foreground mx-auto mb-2" />
                  <p className="text-xl font-bold">{points?.total_spent || 0}</p>
                  <p className="text-sm text-muted-foreground">Использовано</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* How it works */}
          <div className="bg-muted/50 rounded-lg p-4 mb-6">
            <h4 className="font-semibold mb-2">Как это работает?</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• За каждые 100 сом покупки вы получаете 1 балл</li>
              <li>• 1 балл = 1 сом скидки на следующий заказ</li>
              <li>• Баллы можно использовать при оформлении заказа</li>
              <li>• Приглашайте друзей и получайте дополнительные баллы!</li>
            </ul>
          </div>

          {/* Transaction history */}
          <div>
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <History className="h-4 w-4" />
              История операций
            </h4>
            {transactions.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                У вас пока нет операций с баллами
              </p>
            ) : (
              <div className="space-y-2">
                {transactions.map((tx) => (
                  <div
                    key={tx.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/30"
                  >
                    <div className="flex items-center gap-3">
                      {getTransactionIcon(tx.type)}
                      <div>
                        <p className="text-sm font-medium">
                          {tx.description || getTransactionLabel(tx.type)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(tx.created_at).toLocaleDateString('ru-RU')}
                        </p>
                      </div>
                    </div>
                    <Badge
                      variant={tx.points > 0 ? 'default' : 'secondary'}
                      className={tx.points > 0 ? 'bg-green-500' : ''}
                    >
                      {tx.points > 0 ? '+' : ''}{tx.points}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
