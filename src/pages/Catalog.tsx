import { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { ProductCard } from "@/components/ProductCard";
import { ShopifyProduct, STOREFRONT_QUERY, storefrontApiRequest } from "@/lib/shopify";
import { Loader2, SlidersHorizontal, X } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";

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
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const isMobile = useIsMobile();

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
  const allColors = Array.from(
    new Set(
      products.flatMap(p => 
        p.node.variants.edges.map(v => v.node.selectedOptions.find(o => o.name === "Цвет")?.value).filter(Boolean)
      )
    )
  ).filter(Boolean) as string[];

  const allSizes = Array.from(
    new Set(
      products.flatMap(p => 
        p.node.variants.edges.map(v => v.node.selectedOptions.find(o => o.name === "Размер")?.value).filter(Boolean)
      )
    )
  ).filter(Boolean) as string[];

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

  const activeFiltersCount = (selectedCategory ? 1 : 0) + selectedColors.length + selectedSizes.length;

  const filteredProducts = products.filter(p => {
    const categoryMatch = !selectedCategory || 
      p.node.title.toLowerCase().includes(selectedCategory.toLowerCase()) ||
      p.node.description.toLowerCase().includes(selectedCategory.toLowerCase());

    const colorMatch = selectedColors.length === 0 || 
      p.node.variants.edges.some(v => 
        v.node.selectedOptions.some(o => 
          o.name === "Цвет" && selectedColors.includes(o.value)
        )
      );

    const sizeMatch = selectedSizes.length === 0 || 
      p.node.variants.edges.some(v => 
        v.node.selectedOptions.some(o => 
          o.name === "Размер" && selectedSizes.includes(o.value)
        )
      );

    return categoryMatch && colorMatch && sizeMatch;
  });

  const FilterContent = () => (
    <div className="space-y-6">
      {/* Categories */}
      <div>
        <h3 className="font-semibold mb-3 text-foreground">Категории</h3>
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

      {/* Colors */}
      {allColors.length > 0 && (
        <div>
          <h3 className="font-semibold mb-3 text-foreground">Цвета</h3>
          <div className="flex flex-wrap gap-2">
            {allColors.map((color) => (
              <button
                key={color}
                onClick={() => toggleColor(color)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedColors.includes(color)
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

      {/* Sizes */}
      {allSizes.length > 0 && (
        <div>
          <h3 className="font-semibold mb-3 text-foreground">Размеры</h3>
          <div className="flex flex-wrap gap-2">
            {allSizes.map((size) => (
              <button
                key={size}
                onClick={() => toggleSize(size)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedSizes.includes(size)
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

      {/* Clear filters */}
      {activeFiltersCount > 0 && (
        <Button 
          variant="outline" 
          onClick={clearFilters}
          className="w-full"
        >
          <X className="h-4 w-4 mr-2" />
          Сбросить фильтры
        </Button>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold">Каталог</h1>
            
            {/* Mobile filter button */}
            {isMobile && (
              <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" size="default" className="relative">
                    <SlidersHorizontal className="h-4 w-4 mr-2" />
                    Фильтры
                    {activeFiltersCount > 0 && (
                      <Badge 
                        variant="default" 
                        className="ml-2 h-5 min-w-5 px-1.5"
                      >
                        {activeFiltersCount}
                      </Badge>
                    )}
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[300px] sm:w-[400px] overflow-y-auto">
                  <SheetHeader>
                    <SheetTitle>Фильтры</SheetTitle>
                  </SheetHeader>
                  <div className="mt-6">
                    <FilterContent />
                  </div>
                </SheetContent>
              </Sheet>
            )}
          </div>

          {/* Desktop filters */}
          {!isMobile && (
            <div className="bg-card border rounded-lg p-6 mb-6">
              <FilterContent />
            </div>
          )}

          {/* Active filters count */}
          {filteredProducts.length > 0 && (
            <p className="text-sm text-muted-foreground mb-4">
              Найдено товаров: {filteredProducts.length}
            </p>
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
