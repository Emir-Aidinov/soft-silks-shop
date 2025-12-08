import { Header } from "@/components/Header";
import { RefreshCcw, CheckCircle, XCircle, AlertCircle, HelpCircle } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const Returns = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container py-8 md:py-12 px-4 max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Возврат и обмен</h1>
          <p className="text-muted-foreground">Мы гарантируем простой возврат и обмен товаров</p>
        </div>

        {/* Main Info */}
        <section className="mb-10">
          <div className="bg-gradient-to-br from-primary/5 to-accent/5 rounded-2xl p-6 md:p-8 border border-border/50">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <RefreshCcw className="h-5 w-5 text-primary" />
              </div>
              <h2 className="text-xl font-bold">Условия возврата</h2>
            </div>
            
            <ul className="space-y-3 text-muted-foreground">
              <li className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Возврат возможен в течение <strong className="text-foreground">14 дней</strong> с момента получения</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Товар должен быть в <strong className="text-foreground">оригинальной упаковке</strong> с сохранёнными бирками</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Товар не должен иметь следов использования</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Деньги возвращаются в течение <strong className="text-foreground">3-5 рабочих дней</strong></span>
              </li>
            </ul>
          </div>
        </section>

        {/* What can/cannot be returned */}
        <section className="grid md:grid-cols-2 gap-6 mb-10">
          <div className="bg-card rounded-xl p-6 border border-green-500/20">
            <h3 className="font-semibold mb-4 flex items-center gap-2 text-green-600">
              <CheckCircle className="h-5 w-5" />
              Можно вернуть
            </h3>
            <ul className="space-y-2 text-muted-foreground text-sm">
              <li>• Сорочки и пижамы</li>
              <li>• Халаты и пеньюары</li>
              <li>• Корсеты и боди</li>
              <li>• Комплекты белья (в оригинальной упаковке)</li>
              <li>• Товары с заводским браком</li>
            </ul>
          </div>

          <div className="bg-card rounded-xl p-6 border border-destructive/20">
            <h3 className="font-semibold mb-4 flex items-center gap-2 text-destructive">
              <XCircle className="h-5 w-5" />
              Нельзя вернуть
            </h3>
            <ul className="space-y-2 text-muted-foreground text-sm">
              <li>• Трусы и плавки (по гигиеническим причинам)</li>
              <li>• Товары со следами носки или стирки</li>
              <li>• Товары без бирок или этикеток</li>
              <li>• Повреждённые по вине покупателя товары</li>
            </ul>
          </div>
        </section>

        {/* How to return */}
        <section className="mb-10">
          <h2 className="text-xl font-bold mb-6">Как оформить возврат?</h2>
          
          <div className="space-y-4">
            {[
              {
                step: "1",
                title: "Свяжитесь с нами",
                description: "Напишите в WhatsApp или позвоните по телефону +996 555 123 456"
              },
              {
                step: "2",
                title: "Укажите причину",
                description: "Расскажите, почему хотите вернуть товар — не подошёл размер, цвет или другая причина"
              },
              {
                step: "3",
                title: "Отправьте товар",
                description: "Упакуйте товар и отправьте его по указанному адресу или передайте курьеру"
              },
              {
                step: "4",
                title: "Получите деньги",
                description: "После проверки товара мы вернём деньги на вашу карту или кошелёк"
              }
            ].map((item) => (
              <div key={item.step} className="flex gap-4 items-start">
                <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold flex-shrink-0">
                  {item.step}
                </div>
                <div>
                  <h3 className="font-semibold">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section>
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <HelpCircle className="h-5 w-5 text-primary" />
            Частые вопросы
          </h2>
          
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger>Можно ли обменять товар на другой размер?</AccordionTrigger>
              <AccordionContent>
                Да, вы можете обменять товар на другой размер бесплатно. Свяжитесь с нами, 
                и мы организуем обмен. Доставка нового товара за наш счёт.
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-2">
              <AccordionTrigger>Кто оплачивает доставку при возврате?</AccordionTrigger>
              <AccordionContent>
                Если товар имеет заводской брак или мы допустили ошибку — доставка за наш счёт. 
                В остальных случаях стоимость обратной доставки оплачивает покупатель.
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-3">
              <AccordionTrigger>Как быстро вернут деньги?</AccordionTrigger>
              <AccordionContent>
                После получения и проверки товара деньги возвращаются в течение 3-5 рабочих дней. 
                Срок зачисления зависит от вашего банка.
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-4">
              <AccordionTrigger>Что делать, если товар пришёл с браком?</AccordionTrigger>
              <AccordionContent>
                Сфотографируйте дефект и отправьте нам в WhatsApp. Мы организуем бесплатный 
                возврат и отправим новый товар или вернём деньги — на ваш выбор.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </section>

        {/* Contact reminder */}
        <div className="mt-10 p-6 bg-secondary/50 rounded-xl border border-border/50 text-center">
          <AlertCircle className="h-6 w-6 text-primary mx-auto mb-3" />
          <p className="font-medium mb-1">Остались вопросы?</p>
          <p className="text-sm text-muted-foreground">
            Напишите нам в{" "}
            <a href="https://wa.me/996555123456" className="text-primary hover:underline">
              WhatsApp
            </a>
            {" "}или позвоните по телефону{" "}
            <a href="tel:+996555123456" className="text-primary hover:underline">
              +996 555 123 456
            </a>
          </p>
        </div>
      </main>
    </div>
  );
};

export default Returns;
