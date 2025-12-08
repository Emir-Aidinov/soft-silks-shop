import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ShopifyProduct, STOREFRONT_QUERY, storefrontApiRequest, formatPrice, PRODUCT_DISCOUNTS } from "@/lib/shopify";
import { ProductCard } from "./ProductCard";
import { Flame, ChevronRight } from "lucide-react";
import { Button } from "./ui/button";
import { Skeleton } from "./ui/skeleton";

// Hardcoded bestseller handles - в реальном проекте это можно хранить в БД
const BESTSELLER_HANDLES = [
  "кружевная-сорочка",
  "комплект-классический",
  "бюстгальтер-пуш-ап",
  "трусики-бразилиано"
];

export const Bestsellers = () => {
  const [products, setProducts] = useState<ShopifyProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBestsellers = async () => {
      try {
        const data = await storefrontApiRequest(STOREFRONT_QUERY, { first: 50 });
        const allProducts = data.data.products.edges as ShopifyProduct[];
        
        // Filter and sort by bestseller handles
        const bestsellers = BESTSELLER_HANDLES
          .map(handle => allProducts.find(p => p.node.handle === handle))
          .filter(Boolean) as ShopifyProduct[];
        
        setProducts(bestsellers);
      } catch (error) {
        console.error('Error fetching bestsellers:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBestsellers();
  }, []);

  if (!loading && products.length === 0) return null;

  return (
    <section className="py-10 md:py-16 bg-gradient-to-b from-background via-secondary/20 to-background">
      <div className="container px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-500/10 text-orange-600 text-sm font-medium mb-2">
              <Flame className="h-4 w-4" />
              Бестселлеры
            </div>
            <h2 className="text-2xl md:text-3xl font-bold">Хиты продаж</h2>
          </div>
          <Button asChild variant="outline" className="hidden md:flex">
            <Link to="/catalog">
              Все товары
              <ChevronRight className="h-4 w-4 ml-1" />
            </Link>
          </Button>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="aspect-[3/4] rounded-xl" />
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-6 w-20" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
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

        <div className="mt-6 text-center md:hidden">
          <Button asChild variant="outline">
            <Link to="/catalog">
              Смотреть все товары
              <ChevronRight className="h-4 w-4 ml-1" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};
