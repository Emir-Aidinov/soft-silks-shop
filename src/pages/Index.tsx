import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/ProductCard";
import { ProductCardSkeleton } from "@/components/ProductCardSkeleton";
import { HeroCarousel, SaleProducts } from "@/components/HeroCarousel";
import { PromoBanner } from "@/components/PromoBanner";
import { ShopifyProduct, STOREFRONT_QUERY, storefrontApiRequest } from "@/lib/shopify";
import { ArrowRight, Sparkles, Star, TrendingUp } from "lucide-react";

const Index = () => {
  const [products, setProducts] = useState<ShopifyProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await storefrontApiRequest(STOREFRONT_QUERY, { first: 8 });
        setProducts(data.data.products.edges);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Promo Banner */}
      <PromoBanner 
        code="WELCOME15" 
        discount="-15% на первый заказ" 
        description="Используйте промокод при оформлении заказа"
      />
      
      <Header />
      
      {/* Hero Carousel */}
      <HeroCarousel />

      {/* Sale Products Section */}
      <SaleProducts />

      {/* Categories Section */}
      <section className="py-10 md:py-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-secondary/50 via-background to-accent/20" />
        <div className="container px-4 relative">
          <div className="text-center mb-8 md:mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
              <Star className="h-4 w-4" />
              Категории
            </div>
            <h2 className="text-2xl md:text-4xl font-bold">Выберите категорию</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {[
              { name: "Сорочки", value: "сорочки", emoji: "👗", color: "from-pink-500/20 to-rose-500/10" },
              { name: "Трусы", value: "трусы", emoji: "💝", color: "from-purple-500/20 to-pink-500/10" },
              { name: "Бюстгальтеры", value: "бюстгальтеры", emoji: "🎀", color: "from-red-500/20 to-orange-500/10" },
              { name: "Наборы", value: "наборы", emoji: "✨", color: "from-amber-500/20 to-yellow-500/10" },
            ].map((category) => (
              <Link
                key={category.name}
                to={`/catalog?category=${encodeURIComponent(category.value)}`}
                className={`group relative p-6 md:p-8 rounded-2xl bg-gradient-to-br ${category.color} border border-border/50 hover:border-primary/50 hover:shadow-hover transition-all overflow-hidden`}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-background/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative">
                  <div className="text-4xl md:text-5xl mb-3 group-hover:scale-110 transition-transform">
                    {category.emoji}
                  </div>
                  <h3 className="font-bold text-base md:text-lg group-hover:text-primary transition-colors">
                    {category.name}
                  </h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-10 md:py-16 relative">
        <div className="absolute top-0 right-0 w-80 h-80 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-60 h-60 bg-accent/10 rounded-full blur-3xl" />
        
        <div className="container px-4 relative">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary text-sm font-medium mb-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                Хиты продаж
              </div>
              <h2 className="text-2xl md:text-4xl font-bold">Популярные товары</h2>
            </div>
            <Button asChild variant="outline" className="w-fit hover:bg-primary hover:text-primary-foreground">
              <Link to="/catalog">
                Все товары
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {[...Array(4)].map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-12 bg-muted/30 rounded-xl border border-dashed">
              <Sparkles className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">Товары еще не добавлены</p>
              <p className="text-sm text-muted-foreground">
                Создайте первый товар, написав в чат название товара и его цену
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {products.map((product, idx) => (
                <div 
                  key={product.node.id} 
                  className="animate-fade-in"
                  style={{ animationDelay: `${idx * 100}ms` }}
                >
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-secondary/30 py-10 md:py-14">
        <div className="container px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            {/* Brand */}
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">💝</span>
                <span className="font-bold text-lg">Бесценки</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Магазин женского белья с любовью к каждой клиентке
              </p>
            </div>

            {/* Navigation */}
            <div>
              <h4 className="font-semibold mb-4">Каталог</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link to="/catalog?category=сорочки" className="text-muted-foreground hover:text-primary transition-colors">
                    Сорочки
                  </Link>
                </li>
                <li>
                  <Link to="/catalog?category=трусы" className="text-muted-foreground hover:text-primary transition-colors">
                    Трусы
                  </Link>
                </li>
                <li>
                  <Link to="/catalog?category=бюстгальтеры" className="text-muted-foreground hover:text-primary transition-colors">
                    Бюстгальтеры
                  </Link>
                </li>
                <li>
                  <Link to="/catalog?category=наборы" className="text-muted-foreground hover:text-primary transition-colors">
                    Наборы
                  </Link>
                </li>
              </ul>
            </div>

            {/* Info */}
            <div>
              <h4 className="font-semibold mb-4">Информация</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link to="/about" className="text-muted-foreground hover:text-primary transition-colors">
                    О нас
                  </Link>
                </li>
                <li>
                  <Link to="/delivery" className="text-muted-foreground hover:text-primary transition-colors">
                    Доставка и оплата
                  </Link>
                </li>
                <li>
                  <Link to="/returns" className="text-muted-foreground hover:text-primary transition-colors">
                    Возврат и обмен
                  </Link>
                </li>
                <li>
                  <Link to="/contacts" className="text-muted-foreground hover:text-primary transition-colors">
                    Контакты
                  </Link>
                </li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="font-semibold mb-4">Контакты</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a href="tel:+996555123456" className="hover:text-primary transition-colors">
                    +996 555 123 456
                  </a>
                </li>
                <li>
                  <a href="https://wa.me/996555123456" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
                    WhatsApp
                  </a>
                </li>
                <li>
                  <a href="https://t.me/bescenki" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
                    Telegram
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">
              © 2024 Бесценки. Все права защищены.
            </p>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <Link to="/about" className="hover:text-primary transition-colors">О нас</Link>
              <Link to="/contacts" className="hover:text-primary transition-colors">Контакты</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;