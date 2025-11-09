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
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);

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

  // Extract all unique colors and sizes from products
  const allColors = Array.from(new Set(
    products.flatMap(p => 
      p.node.variants.edges.map(v => 
        v.node.selectedOptions.find(opt => opt.name === "Цвет")?.value
      ).filter(Boolean)
    )
  )).sort();

  const allSizes = Array.from(new Set(
    products.flatMap(p => 
      p.node.variants.edges.map(v => 
        v.node.selectedOptions.find(opt => opt.name === "Размер")?.value
      ).filter(Boolean)
    )
  )).sort();

  const toggleColor = (color: string) => {
    setSelectedColors(prev => 
      prev.includes(color) ? prev.filter(c => c !== color) : [...prev, color]
    );
  };

  const toggleSize = (size: string) => {
    setSelectedSizes(prev => 
      prev.includes(size) ? prev.filter(s => s !== size) : [...prev, size]
    );
  };

  const clearFilters = () => {
    setSelectedCategory("");
    setSelectedColors([]);
    setSelectedSizes([]);
  };

  const filteredProducts = products.filter(p => {
    // Category filter
    if (selectedCategory && 
        !p.node.title.toLowerCase().includes(selectedCategory.toLowerCase()) &&
        !p.node.description.toLowerCase().includes(selectedCategory.toLowerCase())) {
      return false;
    }

    // Color and size filters - product must have at least one variant matching the filters
    if (selectedColors.length > 0 || selectedSizes.length > 0) {
      const hasMatchingVariant = p.node.variants.edges.some(variant => {
        const variantColor = variant.node.selectedOptions.find(opt => opt.name === "Цвет")?.value;
        const variantSize = variant.node.selectedOptions.find(opt => opt.name === "Размер")?.value;

        const colorMatch = selectedColors.length === 0 || (variantColor && selectedColors.includes(variantColor));
        const sizeMatch = selectedSizes.length === 0 || (variantSize && selectedSizes.includes(variantSize));

        return colorMatch && sizeMatch;
      });

      if (!hasMatchingVariant) return false;
    }

    return true;
  });

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold">Каталог</h1>
            {(selectedCategory || selectedColors.length > 0 || selectedSizes.length > 0) && (
              <button
                onClick={clearFilters}
                className="text-sm text-muted-foreground hover:text-foreground underline"
              >
                Сбросить все фильтры
              </button>
            )}
          </div>
          
          {/* Category filters */}
          <div className="mb-4">
            <h3 className="text-sm font-semibold mb-2">Категория</h3>
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

          {/* Color filters */}
          {allColors.length > 0 && (
            <div className="mb-4">
              <h3 className="text-sm font-semibold mb-2">Цвет</h3>
              <div className="flex flex-wrap gap-2">
                {allColors.map((color) => (
                  <button
                    key={color}
                    onClick={() => toggleColor(color!)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                      selectedColors.includes(color!)
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                    }`}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Size filters */}
          {allSizes.length > 0 && (
            <div className="mb-4">
              <h3 className="text-sm font-semibold mb-2">Размер</h3>
              <div className="flex flex-wrap gap-2">
                {allSizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => toggleSize(size!)}
                    className={`px-3 py-2 rounded-full text-sm font-medium transition-colors ${
                      selectedSizes.includes(size!)
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}
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
