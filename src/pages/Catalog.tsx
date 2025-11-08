import { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { ProductCard } from "@/components/ProductCard";
import { ShopifyProduct, STOREFRONT_QUERY, storefrontApiRequest } from "@/lib/shopify";
import { Loader2 } from "lucide-react";

const categories = [
  { name: "Все", value: "" },
  { name: "Сорочки", value: "сорочки" },
  { name: "Трусы", value: "трусы" },
  { name: "Бюстгальтеры", value: "бюстгальтеры" },
  { name: "Наборы", value: "наборы" },
  { name: "Другое", value: "другое" },
];

const Catalog = () => {
  const [products, setProducts] = useState<ShopifyProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("");

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await storefrontApiRequest(STOREFRONT_QUERY, { first: 20 });
        setProducts(data.data.products.edges);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const filteredProducts = selectedCategory
    ? products.filter(p => 
        p.node.title.toLowerCase().includes(selectedCategory.toLowerCase()) ||
        p.node.description.toLowerCase().includes(selectedCategory.toLowerCase())
      )
    : products;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-6">Каталог</h1>
          
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category.value}
                onClick={() => setSelectedCategory(category.value)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === category.value
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-muted-foreground text-lg">Товары не найдены</p>
            <p className="text-sm text-muted-foreground mt-2">
              Попробуйте выбрать другую категорию
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard key={product.node.id} product={product} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Catalog;
