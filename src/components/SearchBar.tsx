import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Search, X } from "lucide-react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { ShopifyProduct, STOREFRONT_QUERY, storefrontApiRequest, formatPrice } from "@/lib/shopify";

export const SearchBar = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<ShopifyProduct[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const searchProducts = async () => {
      if (query.length < 2) {
        setResults([]);
        return;
      }
      
      setLoading(true);
      try {
        const data = await storefrontApiRequest(STOREFRONT_QUERY, { 
          first: 10,
          query: `title:*${query}*`
        });
        setResults(data.data.products.edges);
        setIsOpen(true);
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setLoading(false);
      }
    };

    const debounce = setTimeout(searchProducts, 300);
    return () => clearTimeout(debounce);
  }, [query]);

  const handleSelect = (handle: string) => {
    setQuery("");
    setIsOpen(false);
    navigate(`/product/${handle}`);
  };

  return (
    <div ref={wrapperRef} className="relative w-full max-w-md">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Поиск товаров..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.length >= 2 && setIsOpen(true)}
          className="pl-10 pr-10 bg-secondary/50 border-0 focus-visible:ring-primary/50"
        />
        {query && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
            onClick={() => {
              setQuery("");
              setIsOpen(false);
            }}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {isOpen && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-card border rounded-lg shadow-hover overflow-hidden z-50 animate-fade-in">
          {results.map((product) => {
            const price = parseFloat(product.node.priceRange.minVariantPrice.amount);
            const image = product.node.images.edges[0]?.node.url;
            
            return (
              <button
                key={product.node.id}
                onClick={() => handleSelect(product.node.handle)}
                className="w-full flex items-center gap-3 p-3 hover:bg-secondary/50 transition-colors text-left"
              >
                <div className="w-12 h-12 rounded-md overflow-hidden bg-secondary/30 flex-shrink-0">
                  {image && (
                    <img src={image} alt={product.node.title} className="w-full h-full object-cover" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{product.node.title}</p>
                  <p className="text-sm text-primary font-semibold">{formatPrice(price)}</p>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {isOpen && query.length >= 2 && results.length === 0 && !loading && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-card border rounded-lg shadow-hover p-4 z-50">
          <p className="text-sm text-muted-foreground text-center">Ничего не найдено</p>
        </div>
      )}
    </div>
  );
};