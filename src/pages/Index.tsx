import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/ProductCard";
import { ShopifyProduct, STOREFRONT_QUERY, storefrontApiRequest } from "@/lib/shopify";
import { ArrowRight, Sparkles } from "lucide-react";

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
      
      {/* Hero Section */}
      <section className="relative bg-gradient-hero py-20 md:py-32">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center space-y-6 animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
              <Sparkles className="h-4 w-4" />
              Новая коллекция
            </div>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
              Элегантность и комфорт
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground">
              Откройте для себя изысканную коллекцию женского белья, созданную с любовью к деталям
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button asChild size="lg" className="shadow-soft">
                <Link to="/catalog">
                  Смотреть каталог
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 bg-secondary/30">
        <div className="container">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-12">Категории</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { name: "Сорочки", emoji: "👗" },
              { name: "Трусы", emoji: "💝" },
              { name: "Бюстгальтеры", emoji: "🎀" },
              { name: "Наборы", emoji: "✨" },
            ].map((category) => (
              <Link
                key={category.name}
                to="/catalog"
                className="group p-6 rounded-lg bg-card border hover:shadow-soft transition-all"
              >
                <div className="text-4xl mb-2">{category.emoji}</div>
                <h3 className="font-semibold group-hover:text-primary transition-colors">
                  {category.name}
                </h3>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16">
        <div className="container">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl md:text-3xl font-bold">Популярные товары</h2>
            <Button asChild variant="outline">
              <Link to="/catalog">Все товары</Link>
            </Button>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="aspect-[3/4] bg-secondary/20 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-12 bg-muted/30 rounded-lg">
              <p className="text-muted-foreground mb-4">Товары еще не добавлены</p>
              <p className="text-sm text-muted-foreground">
                Создайте первый товар, написав в чат название товара и его цену
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {products.map((product) => (
                <ProductCard key={product.node.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Index;
