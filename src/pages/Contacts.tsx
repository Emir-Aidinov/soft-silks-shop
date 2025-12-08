import { Header } from "@/components/Header";
import { Phone, Mail, MapPin, Clock, MessageCircle, Send } from "lucide-react";
import { Button } from "@/components/ui/button";

const Contacts = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container py-8 md:py-12 px-4">
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Контакты</h1>
          <p className="text-muted-foreground">Свяжитесь с нами любым удобным способом</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Contact Info */}
          <div className="space-y-6">
            <div className="bg-card rounded-2xl p-6 border border-border/50 hover:shadow-hover transition-shadow">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Phone className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Телефон</h3>
                  <a href="tel:+996555123456" className="text-primary hover:underline">
                    +996 555 123 456
                  </a>
                  <p className="text-sm text-muted-foreground mt-1">
                    Звоните с 9:00 до 21:00
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-card rounded-2xl p-6 border border-border/50 hover:shadow-hover transition-shadow">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <MessageCircle className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">WhatsApp</h3>
                  <a 
                    href="https://wa.me/996555123456" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    +996 555 123 456
                  </a>
                  <p className="text-sm text-muted-foreground mt-1">
                    Быстрые ответы в мессенджере
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-card rounded-2xl p-6 border border-border/50 hover:shadow-hover transition-shadow">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Send className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Telegram</h3>
                  <a 
                    href="https://t.me/bescenki" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    @bescenki
                  </a>
                  <p className="text-sm text-muted-foreground mt-1">
                    Наш канал с новинками
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-card rounded-2xl p-6 border border-border/50 hover:shadow-hover transition-shadow">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Mail className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Email</h3>
                  <a href="mailto:info@bescenki.kg" className="text-primary hover:underline">
                    info@bescenki.kg
                  </a>
                  <p className="text-sm text-muted-foreground mt-1">
                    Для деловых предложений
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Address & Hours */}
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-primary/5 to-accent/5 rounded-2xl p-6 border border-border/50">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <MapPin className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Адрес</h3>
                  <p className="text-muted-foreground">
                    г. Бишкек, ул. Примерная, 123
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Пункт выдачи заказов
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Clock className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Режим работы</h3>
                  <div className="text-muted-foreground space-y-1">
                    <p>Пн-Пт: 10:00 - 20:00</p>
                    <p>Сб-Вс: 11:00 - 18:00</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-card rounded-2xl p-6 border border-border/50">
              <h3 className="font-semibold mb-4">Быстрая связь</h3>
              <div className="space-y-3">
                <Button asChild className="w-full" size="lg">
                  <a href="https://wa.me/996555123456" target="_blank" rel="noopener noreferrer">
                    <MessageCircle className="h-5 w-5 mr-2" />
                    Написать в WhatsApp
                  </a>
                </Button>
                <Button asChild variant="outline" className="w-full" size="lg">
                  <a href="tel:+996555123456">
                    <Phone className="h-5 w-5 mr-2" />
                    Позвонить
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Contacts;
