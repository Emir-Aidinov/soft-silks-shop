import { useEffect, useState } from "react";
import { ShopifyProduct, STOREFRONT_QUERY, storefrontApiRequest } from "@/lib/shopify";
import { ProductCard } from "./ProductCard";

interface RelatedProductsProps {
  currentProductId: string;
  currentProductType?: string;
}

export const RelatedProducts = ({ currentProductId, currentProductType }: RelatedProductsProps) => {
  const [products, setProducts] = useState<ShopifyProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRelated = async () => {
      try {
        const data = await storefrontApiRequest(STOREFRONT_QUERY, { first: 12 });
        const allProducts = data.data.products.edges as ShopifyProduct[];
        
        // Filter out current product and prioritize same type
        const filtered = allProducts
          .filter(p => p.node.id !== currentProductId)
          .sort((a, b) => {
            if (currentProductType) {
              const aMatch = a.node.productType === currentProductType;
              const bMatch = b.node.productType === currentProductType;
              if (aMatch && !bMatch) return -1;
              if (!aMatch && bMatch) return 1;
            }
            return 0;
          })
          .slice(0, 4);
        
        setProducts(filtered);
      } catch (error) {
        console.error('Error fetching related products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRelated();
  }, [currentProductId, currentProductType]);

  if (loading) {
    return (
      <div className="space-y-6">
        <h3 className="text-xl font-bold">Вам может понравиться</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="aspect-[3/4] bg-secondary/20 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (products.length === 0) return null;

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-bold flex items-center gap-2">
        <span className="text-2xl">💝</span> Вам может понравиться
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {products.map((product) => (
          <ProductCard key={product.node.id} product={product} />
        ))}
      </div>
    </div>
  );
};