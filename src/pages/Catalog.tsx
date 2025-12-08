import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Header } from "@/components/Header";
import { ProductCard } from "@/components/ProductCard";
import { ShopifyProduct, STOREFRONT_QUERY, storefrontApiRequest, PRODUCT_INVENTORY } from "@/lib/shopify";
import { Loader2, SlidersHorizontal, X, ArrowUpDown } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type SortOption = "default" | "price-asc" | "price-desc" | "newest";
type StockFilter = "all" | "in-stock" | "out-of-stock";

const categories = [
  { name: "Все", value: "" },
  { name: "Сорочки", value: "сорочки" },
  { name: "Трусы", value: "трусы" },
  { name: "Бюстгальтеры", value: "бюстгальтеры" },
  { name: "Наборы", value: "наборы" },
  { name: "Другое", value: "другое" },
];

const stockOptions = [
  { name: "Все товары", value: "all" },
  { name: "В наличии", value: "in-stock" },
  { name: "Нет в наличии", value: "out-of-stock" },
];

const Catalog = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<ShopifyProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const isMobile = useIsMobile();

  // Read filters from URL
  const selectedCategory = searchParams.get("category") || "";
  const selectedColors = searchParams.get("colors")?.split(",").filter(Boolean) || [];
  const selectedSizes = searchParams.get("sizes")?.split(",").filter(Boolean) || [];
  const sortBy = (searchParams.get("sort") as SortOption) || "default";
  const stockFilter = (searchParams.get("stock") as StockFilter) || "all";

  // Update URL with filters
  const updateFilters = (updates: Record<string, string | string[] | null>) => {
    const newParams = new URLSearchParams(searchParams);
    
    Object.entries(updates).forEach(([key, value]) => {
      if (value === null || value === "" || (Array.isArray(value) && value.length === 0)) {
        newParams.delete(key);
      } else if (Array.isArray(value)) {
        newParams.set(key, value.join(","));
      } else {
        newParams.set(key, value);
      }
    });
    
    setSearchParams(newParams, { replace: true });
  };

  const setSelectedCategory = (value: string) => updateFilters({ category: value });
  const setSortBy = (value: SortOption) => updateFilters({ sort: value === "default" ? null : value });
  const setStockFilter = (value: StockFilter) => updateFilters({ stock: value === "all" ? null : value });

  const toggleColor = (color: string) => {
    const newColors = selectedColors.includes(color)
      ? selectedColors.filter(c => c !== color)
      : [...selectedColors, color];
    updateFilters({ colors: newColors });
  };

  const toggleSize = (size: string) => {
    const newSizes = selectedSizes.includes(size)
      ? selectedSizes.filter(s => s !== size)
      : [...selectedSizes, size];
    updateFilters({ sizes: newSizes });
  };

  const clearFilters = () => {
    setSearchParams({}, { replace: true });
  };

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await storefrontApiRequest(STOREFRONT_QUERY, { first: 50 });
        setProducts(data.data.products.edges);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

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

  const activeFiltersCount = (selectedCategory ? 1 : 0) + selectedColors.length + selectedSizes.length + (stockFilter !== "all" ? 1 : 0);

  const filteredProducts = products.filter(p => {
    const categoryMatch = !selectedCategory || 
      p.node.productType.toLowerCase() === selectedCategory.toLowerCase();

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

    // Stock filter
    const inventory = PRODUCT_INVENTORY[p.node.handle];
    const isInStock = inventory === undefined || inventory > 0;
    const stockMatch = stockFilter === "all" || 
      (stockFilter === "in-stock" && isInStock) ||
      (stockFilter === "out-of-stock" && !isInStock);

    return categoryMatch && colorMatch && sizeMatch && stockMatch;
  });

  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case "price-asc":
        return parseFloat(a.node.priceRange.minVariantPrice.amount) - parseFloat(b.node.priceRange.minVariantPrice.amount);
      case "price-desc":
        return parseFloat(b.node.priceRange.minVariantPrice.amount) - parseFloat(a.node.priceRange.minVariantPrice.amount);
      case "newest":
        return b.node.id.localeCompare(a.node.id);
      default:
        return 0;
    }
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
              onClick={() => {
                setSelectedCategory(category.value);
                if (isMobile) setIsFilterOpen(false);
              }}
              className={`px-3 py-1.5 md:px-4 md:py-2 rounded-full text-sm font-medium transition-colors ${
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

      {/* Stock availability */}
      <div>
        <h3 className="font-semibold mb-3 text-foreground">Наличие</h3>
        <div className="flex flex-wrap gap-2">
          {stockOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => setStockFilter(option.value as StockFilter)}
              className={`px-3 py-1.5 md:px-4 md:py-2 rounded-full text-sm font-medium transition-colors ${
                stockFilter === option.value
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              }`}
            >
              {option.name}
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
                className={`px-3 py-1.5 md:px-4 md:py-2 rounded-full text-sm font-medium transition-colors ${
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
                className={`px-3 py-1.5 md:px-4 md:py-2 rounded-full text-sm font-medium transition-colors ${
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
      
      <main className="container py-4 md:py-8 px-4">
        <div className="mb-6 md:mb-8">
          <div className="flex items-center justify-between mb-4 md:mb-6">
            <h1 className="text-2xl md:text-3xl font-bold">Каталог</h1>
            
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

          {/* Sorting and count */}
          <div className="flex items-center justify-between mb-4">
            {sortedProducts.length > 0 && (
              <p className="text-sm text-muted-foreground">
                Найдено товаров: {sortedProducts.length}
              </p>
            )}
            <div className="flex items-center gap-2">
              <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
              <Select value={sortBy} onValueChange={(value: SortOption) => setSortBy(value)}>
                <SelectTrigger className="w-[160px] md:w-[180px]">
                  <SelectValue placeholder="Сортировка" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">По умолчанию</SelectItem>
                  <SelectItem value="price-asc">Сначала дешевые</SelectItem>
                  <SelectItem value="price-desc">Сначала дорогие</SelectItem>
                  <SelectItem value="newest">Новинки</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : sortedProducts.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-muted-foreground text-lg">Товары не найдены</p>
            <p className="text-sm text-muted-foreground mt-2">
              Попробуйте выбрать другую категорию
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-6">
            {sortedProducts.map((product) => (
              <ProductCard key={product.node.id} product={product} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Catalog;