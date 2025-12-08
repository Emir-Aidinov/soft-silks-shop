import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { ShopifyProduct, formatPrice } from "@/lib/shopify";
import { useCartStore } from "@/stores/cartStore";
import { toast } from "sonner";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ProductCardProps {
  product: ShopifyProduct;
}

export const ProductCard = ({ product }: ProductCardProps) => {
  const addItem = useCartStore(state => state.addItem);
  const { node } = product;
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const handleAddToCart = () => {
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

  return (
    <Card className="group overflow-hidden transition-all hover:shadow-hover animate-fade-in">
      <Link to={`/product/${node.handle}`}>
        <div className="aspect-[3/4] overflow-hidden bg-secondary/20 relative">
          <img
            src={currentImage}
            alt={node.title}
            className="h-full w-full object-cover transition-all duration-300 group-hover:scale-105"
          />
          
          {/* Discount badge */}
          {hasDiscount && (
            <Badge className="absolute top-2 left-2 bg-destructive text-destructive-foreground">
              -{discountPercent}%
            </Badge>
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
      </Link>
      <CardContent className="p-4">
        <Link to={`/product/${node.handle}`}>
          <h3 className="font-medium mb-2 line-clamp-2 hover:text-primary transition-colors">
            {node.title}
          </h3>
        </Link>
        <div className="flex items-center gap-2">
          <p className="text-lg font-semibold text-primary">
            {formatPrice(price)}
          </p>
          {hasDiscount && (
            <p className="text-sm text-muted-foreground line-through">
              {formatPrice(compareAtPrice)}
            </p>
          )}
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Button 
          onClick={handleAddToCart}
          className="w-full"
          variant="default"
        >
          В корзину
        </Button>
      </CardFooter>
    </Card>
  );
};
