import { Link } from "react-router-dom";
import { useRecentlyViewedStore } from "@/stores/recentlyViewedStore";
import { formatPrice } from "@/lib/shopify";
import { Clock, ChevronLeft, ChevronRight } from "lucide-react";
import { useRef } from "react";
import { Button } from "./ui/button";

export const RecentlyViewed = () => {
  const { products } = useRecentlyViewedStore();
  const scrollRef = useRef<HTMLDivElement>(null);

  if (products.length === 0) return null;

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 200;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <section className="py-8 md:py-12">
      <div className="container px-4">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            <h2 className="text-xl md:text-2xl font-bold">Недавно просмотренные</h2>
          </div>
          
          {products.length > 4 && (
            <div className="hidden md:flex gap-2">
              <Button variant="outline" size="icon" onClick={() => scroll('left')}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={() => scroll('right')}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
        
        <div 
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto scrollbar-hide pb-2 -mx-4 px-4"
          style={{ scrollSnapType: 'x mandatory' }}
        >
          {products.map((product) => (
            <Link
              key={product.handle}
              to={`/product/${product.handle}`}
              className="flex-shrink-0 w-36 md:w-44 group"
              style={{ scrollSnapAlign: 'start' }}
            >
              <div className="aspect-[3/4] rounded-xl overflow-hidden bg-secondary/20 mb-2">
                <img
                  src={product.image}
                  alt={product.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <h3 className="text-sm font-medium truncate group-hover:text-primary transition-colors">
                {product.title}
              </h3>
              <p className="text-sm font-bold text-primary">
                {formatPrice(product.price)}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};
