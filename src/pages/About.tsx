import { Header } from "@/components/Header";
import { Heart, Award, Truck, Shield, Sparkles } from "lucide-react";

const About = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container py-8 md:py-12 px-4">
        {/* Hero Section */}
        <section className="text-center mb-12 md:mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            <Sparkles className="h-4 w-4" />
            О нас
          </div>
          <h1 className="text-3xl md:text-5xl font-bold mb-4">
            Добро пожаловать в{" "}
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Бесценки
            </span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Мы создаём магазин женского белья, где каждая женщина найдёт что-то особенное для себя
          </p>
        </section>

        {/* Values */}
        <section className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12 md:mb-16">
          {[
            {
              icon: Heart,
              title: "С любовью",
              description: "Мы тщательно отбираем каждый товар, заботясь о вашем комфорте"
            },
            {
              icon: Award,
              title: "Качество",
              description: "Только проверенные материалы и надёжные производители"
            },
            {
              icon: Truck,
              title: "Быстрая доставка",
              description: "Доставляем заказы по всему Кыргызстану"
            },
            {
              icon: Shield,
              title: "Гарантия",
              description: "Гарантируем возврат или обмен товара"
            }
          ].map((value) => (
            <div 
              key={value.title}
              className="p-6 rounded-2xl bg-card border border-border/50 hover:border-primary/50 hover:shadow-hover transition-all text-center"
            >
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <value.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">{value.title}</h3>
              <p className="text-sm text-muted-foreground">{value.description}</p>
            </div>
          ))}
        </section>

        {/* Story */}
        <section className="max-w-3xl mx-auto">
          <div className="bg-gradient-to-br from-primary/5 to-accent/5 rounded-2xl p-8 md:p-12 border border-border/50">
            <h2 className="text-2xl md:text-3xl font-bold mb-6 text-center">Наша история</h2>
            <div className="space-y-4 text-muted-foreground">
              <p>
                <strong className="text-foreground">Бесценки</strong> — это магазин женского белья, 
                созданный с любовью и заботой о каждой женщине. Мы верим, что красивое и комфортное 
                бельё — это не роскошь, а необходимость для каждой современной женщины.
              </p>
              <p>
                Наша миссия — сделать качественное женское бельё доступным для всех. 
                Мы тщательно отбираем товары, следим за трендами и всегда прислушиваемся 
                к пожеланиям наших клиенток.
              </p>
              <p>
                Благодарим вас за то, что выбираете нас! 💝
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default About;
