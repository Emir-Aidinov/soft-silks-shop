import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ShopifyProduct, formatPrice, SALE_PRODUCT_HANDLES, PRODUCT_INVENTORY } from "@/lib/shopify";
import { useCartStore } from "@/stores/cartStore";
import { useFavoritesStore } from "@/stores/favoritesStore";
import { toast } from "sonner";
import { ChevronLeft, ChevronRight, Heart, Star, Package } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface ProductCardProps {
  product: ShopifyProduct;
}

export const ProductCard = ({ product }: ProductCardProps) => {
  const addItem = useCartStore(state => state.addItem);
  const { toggleFavorite, favorites } = useFavoritesStore();
  const isFavorite = favorites.includes(product.node.handle);
  const { node } = product;
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [rating, setRating] = useState<{ avg: number; count: number } | null>(null);

  useEffect(() => {
    const fetchRating = async () => {
      const { data } = await supabase
        .from('reviews')
        .select('rating')
        .eq('product_id', node.handle);
      
      if (data && data.length > 0) {
        const avg = data.reduce((sum, r) => sum + r.rating, 0) / data.length;
        setRating({ avg: Math.round(avg * 10) / 10, count: data.length });
      }
    };
    fetchRating();
  }, [node.handle]);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const firstVariant = node.variants.edges[0]?.node;
    if (!firstVariant) return;

    const cartItem = {
      product,
      variantId: firstVariant.id,
      variantTitle: firstVariant.title,
      price: firstVariant.price,
      quantity: 1,
      selectedOptions: firstVariant.selectedOptions || []
    };
    
    addItem(cartItem);
    toast.success("Добавлено в корзину", {
      description: node.title,
    });
  };

  const images = node.images.edges.map(edge => edge.node.url);
  const hasMultipleImages = images.length > 1;
  const currentImage = images[currentImageIndex] || "/placeholder.svg";
  
  const price = parseFloat(node.priceRange.minVariantPrice.amount);
  const compareAtPrice = node.compareAtPriceRange?.minVariantPrice?.amount 
    ? parseFloat(node.compareAtPriceRange.minVariantPrice.amount) 
    : null;
  const hasDiscount = compareAtPrice && compareAtPrice > price;
  const discountPercent = hasDiscount ? Math.round((1 - price / compareAtPrice) * 100) : 0;
  const isHit = SALE_PRODUCT_HANDLES.includes(node.handle);
  
  // Use hardcoded inventory from PRODUCT_INVENTORY
  const inventory = PRODUCT_INVENTORY[node.handle];
  const showLowStock = inventory !== undefined && inventory > 0;

  const handlePrevImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex(prev => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNextImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex(prev => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const handleDotClick = (e: React.MouseEvent, index: number) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex(index);
  };

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite(node.handle);
    toast.success(isFavorite ? "Удалено из избранного" : "Добавлено в избранное");
  };

  return (
    <Link
      to={`/product/${node.handle}`}
      className="group relative bg-card rounded-xl overflow-hidden shadow-soft hover:shadow-hover transition-all border border-border/50 animate-fade-in"
    >
      <div className="aspect-[3/4] overflow-hidden relative">
        {/* Favorite button */}
        <button
          onClick={handleFavoriteClick}
          className="absolute top-3 right-3 z-10 w-9 h-9 rounded-full bg-background/80 hover:bg-background flex items-center justify-center transition-all"
          aria-label={isFavorite ? "Удалить из избранного" : "Добавить в избранное"}
        >
          <Heart 
            className={`h-5 w-5 transition-colors ${isFavorite ? "fill-destructive text-destructive" : "text-muted-foreground hover:text-destructive"}`} 
          />
        </button>
        
        <img
          src={currentImage}
          alt={node.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        
        <div className="absolute inset-0 bg-gradient-to-t from-background/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        
        {/* Discount badge */}
        {hasDiscount && (
          <div className="absolute top-3 left-3">
            <span className="bg-destructive text-destructive-foreground text-sm font-bold px-3 py-1 rounded-full shadow-lg">
              -{discountPercent}%
            </span>
          </div>
        )}
        
        {/* Hit badge */}
        {isHit && (
          <div className={`absolute ${hasDiscount ? 'top-12' : 'top-3'} left-3`}>
            <span className="bg-yellow-500 text-yellow-950 text-xs font-bold px-2 py-1 rounded-full">
              🔥 ХИТ
            </span>
          </div>
        )}
        
        {/* Low stock badge */}
        {showLowStock && (
          <div className={`absolute ${hasDiscount && isHit ? 'top-20' : hasDiscount || isHit ? 'top-12' : 'top-3'} left-3`}>
            <span className="bg-orange-500 text-orange-950 text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
              <Package className="h-3 w-3" />
              Осталось {inventory} шт.
            </span>
          </div>
        )}
        
        {/* Navigation arrows */}
        {hasMultipleImages && (
          <>
            <button
              onClick={handlePrevImage}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-background/80 hover:bg-background flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
              aria-label="Предыдущее фото"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={handleNextImage}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-background/80 hover:bg-background flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
              aria-label="Следующее фото"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </>
        )}
        
        {/* Dots indicator */}
        {hasMultipleImages && (
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={(e) => handleDotClick(e, index)}
                className={`h-2 rounded-full transition-all ${
                  index === currentImageIndex 
                    ? "bg-primary w-4" 
                    : "bg-background/60 w-2 hover:bg-background/80"
                }`}
                aria-label={`Фото ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>
      
      <div className="p-4 bg-gradient-to-t from-card to-card/80">
        <h3 className="font-semibold truncate group-hover:text-primary transition-colors">
          {node.title}
        </h3>
        
        {/* Rating */}
        {rating && (
          <div className="flex items-center gap-1 mt-1">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span className="text-sm font-medium">{rating.avg}</span>
            <span className="text-xs text-muted-foreground">({rating.count})</span>
          </div>
        )}
        
        <div className="flex items-center gap-2 mt-2">
          {hasDiscount && (
            <span className="text-sm text-muted-foreground line-through">{formatPrice(compareAtPrice)}</span>
          )}
          <span className={`text-lg font-bold ${hasDiscount ? 'text-destructive' : 'text-primary'}`}>{formatPrice(price)}</span>
        </div>
        
        <Button 
          onClick={handleAddToCart}
          className="w-full mt-3"
          variant="default"
          size="sm"
        >
          В корзину
        </Button>
      </div>
    </Link>
  );
};
