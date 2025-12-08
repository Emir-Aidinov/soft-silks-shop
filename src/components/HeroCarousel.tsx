import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Sparkles, Flame, Gift, Package } from "lucide-react";
import { Button } from "./ui/button";
import { ShopifyProduct, STOREFRONT_QUERY, storefrontApiRequest, formatPrice, SALE_PRODUCT_HANDLES, PRODUCT_INVENTORY, PRODUCT_DISCOUNTS } from "@/lib/shopify";
const heroSlides = [{
  title: "Новая коллекция",
  subtitle: "Элегантность в каждой детали",
  icon: Sparkles,
  gradient: "from-primary/20 via-accent/10 to-secondary/20",
  accent: "primary"
}, {
  title: "Летняя распродажа",
  subtitle: "Скидки до 50% на избранные товары",
  icon: Flame,
  gradient: "from-destructive/20 via-accent/10 to-primary/20",
  accent: "destructive"
}, {
  title: "Подарочные наборы",
  subtitle: "Идеальный подарок для неё",
  icon: Gift,
  gradient: "from-accent/30 via-primary/10 to-secondary/20",
  accent: "accent"
}];
export const HeroCarousel = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [products, setProducts] = useState<ShopifyProduct[]>([]);
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await storefrontApiRequest(STOREFRONT_QUERY, {
          first: 6
        });
        setProducts(data.data.products.edges);
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };
    fetchProducts();
  }, []);
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);
  const currentHero = heroSlides[currentSlide];
  const Icon = currentHero.icon;
  const featuredProduct = products[currentSlide];
  return <section className="relative overflow-hidden">
      <div className={`bg-gradient-to-br ${currentHero.gradient} transition-all duration-700`}>
        <div className="container py-8 md:py-16">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            {/* Text content */}
            <div className="space-y-4 md:space-y-6 animate-fade-in px-4 md:px-0" key={currentSlide}>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-background/60 backdrop-blur text-sm font-medium">
                <Icon className="h-4 w-4 text-primary" />
                {currentHero.title}
              </div>
              <h1 className="text-3xl md:text-5xl font-bold tracking-tight">
                {currentHero.subtitle}
              </h1>
              <p className="text-muted-foreground text-lg">
                Откройте для себя изысканную коллекцию женского белья
              </p>
              <div className="flex gap-4">
                <Button asChild size="lg" className="shadow-hover">
                  <Link to="/catalog">Смотреть каталог</Link>
                </Button>
              </div>
            </div>

            {/* Featured product */}
            {featuredProduct && <Link to={`/product/${featuredProduct.node.handle}`} className="relative group" key={featuredProduct.node.id}>
                <div className="aspect-[4/5] rounded-2xl overflow-hidden bg-card shadow-hover group-hover:shadow-soft transition-all">
                  <img src={featuredProduct.node.images.edges[0]?.node.url} alt={featuredProduct.node.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <p className="text-lg font-bold">{featuredProduct.node.title}</p>
                    <p className="text-primary font-semibold">
                      {formatPrice(parseFloat(featuredProduct.node.priceRange.minVariantPrice.amount))}
                    </p>
                  </div>
                </div>
              </Link>}
          </div>

          {/* Navigation dots */}
          <div className="flex justify-center gap-2 mt-8">
            {heroSlides.map((_, idx) => <button key={idx} onClick={() => setCurrentSlide(idx)} className={`w-3 h-3 rounded-full transition-all ${idx === currentSlide ? "bg-primary w-8" : "bg-primary/30 hover:bg-primary/50"}`} />)}
          </div>
        </div>
      </div>
    </section>;
};
export const SaleProducts = () => {
  const [products, setProducts] = useState<ShopifyProduct[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await storefrontApiRequest(STOREFRONT_QUERY, {
          first: 20
        });
        const allProducts = data.data.products.edges as ShopifyProduct[];

        // Get sale products based on handles
        const saleProducts = allProducts.filter(p => SALE_PRODUCT_HANDLES.includes(p.node.handle));
        setProducts(saleProducts);
      } catch (error) {
        console.error('Error fetching sale products:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);
  if (loading) {
    return <section className="py-10 md:py-16 bg-gradient-to-br from-destructive/5 via-background to-accent/5">
        <div className="container px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">
            <Flame className="inline-block h-8 w-8 text-destructive mr-2" />
            Акции
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => <div key={i} className="aspect-[3/4] bg-secondary/20 rounded-lg animate-pulse" />)}
          </div>
        </div>
      </section>;
  }
  return <section className="py-10 md:py-16 bg-gradient-to-br from-destructive/5 via-background to-accent/5 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-40 h-40 bg-destructive/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-0 w-60 h-60 bg-primary/10 rounded-full blur-3xl" />
      
      <div className="container px-4 relative">
        <div className="text-center mb-8 md:mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-destructive/10 text-destructive text-sm font-medium mb-4">
            <Flame className="h-4 w-4" />
            Ограниченное предложение
          </div>
          <h2 className="text-2xl md:text-4xl font-bold">
            Горячие скидки 🔥
          </h2>
          <p className="text-muted-foreground mt-2">Не упустите выгодные предложения!</p>
        </div>

        {products.length > 0 ? <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {products.map(product => {
          // Use hardcoded discounts for specific products
          const discount = PRODUCT_DISCOUNTS[product.node.handle];
          const price = discount ? discount.discountedPrice : parseFloat(product.node.priceRange.minVariantPrice.amount);
          const originalPrice = discount ? discount.originalPrice : null;
          const hasDiscount = !!discount;
          const discountPercent = hasDiscount ? Math.round((1 - price / originalPrice!) * 100) : 0;
          const image = product.node.images.edges[0]?.node.url;

          // Use hardcoded inventory from PRODUCT_INVENTORY - only show if less than 15
          const inventory = PRODUCT_INVENTORY[product.node.handle];
          const showLowStock = inventory !== undefined && inventory > 0 && inventory < 15;
          return <Link key={product.node.id} to={`/product/${product.node.handle}`} className="group relative bg-card rounded-xl overflow-hidden shadow-soft hover:shadow-hover transition-all border-2 border-destructive/20 text-center">
                  <div className="aspect-[3/4] overflow-hidden relative">
                    <img src={image} alt={product.node.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-t from-destructive/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  {hasDiscount && <div className="absolute top-3 left-3">
                      <span className="bg-destructive text-destructive-foreground text-sm font-bold px-3 py-1 rounded-full animate-pulse shadow-lg">
                        -{discountPercent}%
                      </span>
                    </div>}
                  <div className="absolute top-3 right-3">
                    <span className="bg-yellow-500 text-yellow-950 text-xs font-bold px-2 py-1 rounded-full">
                      🔥 ХИТ
                    </span>
                  </div>
                  {/* Low stock badge */}
                  {showLowStock && <div className={`absolute ${hasDiscount ? 'top-12' : 'top-3'} left-3`}>
                      <span className="bg-orange-500 text-orange-950 text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
                        <Package className="h-3 w-3" />
                        Осталось {inventory} шт.
                      </span>
                    </div>}
                  <div className="p-4 bg-gradient-to-t from-card to-card/80">
                    <h3 className="font-semibold truncate">{product.node.title}</h3>
                    <div className="flex items-center justify-center gap-2 mt-1">
                      {hasDiscount && originalPrice && <span className="text-sm text-muted-foreground line-through">{formatPrice(originalPrice)}</span>}
                      <span className={`text-lg font-bold ${hasDiscount ? 'text-destructive' : 'text-primary'}`}>{formatPrice(price)}</span>
                    </div>
                  </div>
                </Link>;
        })}
          </div> : <p className="text-center text-muted-foreground py-8">
            Скоро здесь появятся акционные товары!
          </p>}

        <div className="text-center mt-8">
          <Button asChild variant="outline" size="lg">
            <Link to="/catalog">Смотреть все товары</Link>
          </Button>
        </div>
      </div>
    </section>;
};