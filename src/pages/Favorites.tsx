import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { ProductCard } from "@/components/ProductCard";
import { useFavoritesStore } from "@/stores/favoritesStore";
import { ShopifyProduct, STOREFRONT_QUERY, storefrontApiRequest } from "@/lib/shopify";
import { Heart, ShoppingBag, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const Favorites = () => {
  const navigate = useNavigate();
  const { favorites } = useFavoritesStore();
  const [products, setProducts] = useState<ShopifyProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      if (favorites.length === 0) {
        setProducts([]);
        setLoading(false);
        return;
      }

      try {
        const data = await storefrontApiRequest(STOREFRONT_QUERY, { first: 50 });
        const allProducts = data.data.products.edges as ShopifyProduct[];
        const favoriteProducts = allProducts.filter(p => 
          favorites.includes(p.node.handle)
        );
        setProducts(favoriteProducts);
      } catch (error) {
        console.error('Error fetching favorites:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [favorites]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-8 px-4">
        <Button 
          variant="ghost" 
          onClick={() => navigate(-1)}
          className="mb-4 -ml-2 hover:bg-secondary/50"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Назад
        </Button>

        <div className="flex items-center gap-3 mb-8">
          <Heart className="h-8 w-8 text-destructive fill-destructive" />
          <h1 className="text-3xl font-bold">Избранное</h1>
          <span className="text-muted-foreground">({favorites.length})</span>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="aspect-[3/4] bg-secondary/20 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {products.map((product) => (
              <ProductCard key={product.node.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Heart className="h-16 w-16 text-muted-foreground/30 mb-4" />
            <h2 className="text-xl font-semibold mb-2">В избранном пусто</h2>
            <p className="text-muted-foreground mb-6">
              Добавляйте понравившиеся товары, нажимая на сердечко
            </p>
            <Button asChild>
              <Link to="/catalog">
                <ShoppingBag className="mr-2 h-4 w-4" />
                Перейти в каталог
              </Link>
            </Button>
          </div>
        )}
      </main>
    </div>
  );
};

export default Favorites;
