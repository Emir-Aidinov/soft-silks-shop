import { Header } from "@/components/Header";
import { Truck, Clock, MapPin, CreditCard, Package, CheckCircle } from "lucide-react";

const Delivery = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container py-8 md:py-12 px-4 max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Доставка и оплата</h1>
          <p className="text-muted-foreground">Удобные способы получить и оплатить ваш заказ</p>
        </div>

        {/* Delivery Section */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Truck className="h-5 w-5 text-primary" />
            </div>
            <h2 className="text-2xl font-bold">Доставка</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-card rounded-xl p-6 border border-border/50">
              <div className="flex items-center gap-3 mb-4">
                <MapPin className="h-5 w-5 text-primary" />
                <h3 className="font-semibold">По Бишкеку</h3>
              </div>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Доставка курьером — <strong className="text-foreground">200 сом</strong></span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Бесплатно при заказе от <strong className="text-foreground">3000 сом</strong></span>
                </li>
                <li className="flex items-start gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <span>Срок: 1-2 рабочих дня</span>
                </li>
              </ul>
            </div>

            <div className="bg-card rounded-xl p-6 border border-border/50">
              <div className="flex items-center gap-3 mb-4">
                <Package className="h-5 w-5 text-primary" />
                <h3 className="font-semibold">По Кыргызстану</h3>
              </div>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Доставка почтой — <strong className="text-foreground">от 150 сом</strong></span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Бесплатно при заказе от <strong className="text-foreground">5000 сом</strong></span>
                </li>
                <li className="flex items-start gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <span>Срок: 3-7 рабочих дней</span>
                </li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-primary/5 to-accent/5 rounded-xl p-6 border border-border/50 md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <MapPin className="h-5 w-5 text-primary" />
                <h3 className="font-semibold">Самовывоз</h3>
              </div>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span><strong className="text-foreground">Бесплатно</strong> — забрать заказ можно по адресу: г. Бишкек, ул. Примерная, 123</span>
                </li>
                <li className="flex items-start gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <span>Заказ готов к выдаче в день оформления (если до 16:00)</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Payment Section */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <CreditCard className="h-5 w-5 text-primary" />
            </div>
            <h2 className="text-2xl font-bold">Оплата</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-card rounded-xl p-6 border border-border/50">
              <h3 className="font-semibold mb-4">💳 Онлайн оплата</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Банковские карты (Visa, MasterCard, Элкарт)</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Мобильные кошельки (O!Деньги, Balance, MegaPay)</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Безопасная оплата через Shopify</span>
                </li>
              </ul>
            </div>

            <div className="bg-card rounded-xl p-6 border border-border/50">
              <h3 className="font-semibold mb-4">💵 Наличными</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Оплата курьеру при получении</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Оплата в пункте выдачи</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Возможна примерка перед оплатой</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-6 p-4 bg-secondary/50 rounded-xl border border-border/50">
            <p className="text-sm text-muted-foreground text-center">
              💡 <strong className="text-foreground">Совет:</strong> При онлайн оплате ваш заказ будет обработан быстрее
            </p>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Delivery;
