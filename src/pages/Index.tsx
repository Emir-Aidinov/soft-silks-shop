import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/ProductCard";
import { HeroCarousel, SaleProducts } from "@/components/HeroCarousel";
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
              { name: "Сорочки", emoji: "👗", color: "from-pink-500/20 to-rose-500/10" },
              { name: "Трусы", emoji: "💝", color: "from-purple-500/20 to-pink-500/10" },
              { name: "Бюстгальтеры", emoji: "🎀", color: "from-red-500/20 to-orange-500/10" },
              { name: "Наборы", emoji: "✨", color: "from-amber-500/20 to-yellow-500/10" },
            ].map((category) => (
              <Link
                key={category.name}
                to="/catalog"
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
                <div key={i} className="aspect-[3/4] bg-secondary/20 rounded-xl animate-pulse" />
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
      <footer className="border-t bg-secondary/30 py-8 md:py-12">
        <div className="container px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-2xl">💝</span>
              <span className="font-bold text-lg">Бесценки</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2024 Бесценки. Все права защищены.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;