import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { ShopifyProduct } from "@/lib/shopify";
import { useCartStore } from "@/stores/cartStore";
import { toast } from "sonner";

interface ProductCardProps {
  product: ShopifyProduct;
}

export const ProductCard = ({ product }: ProductCardProps) => {
  const addItem = useCartStore(state => state.addItem);
  const { node } = product;

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

  const imageUrl = node.images.edges[0]?.node.url || "/placeholder.svg";
  const price = parseFloat(node.priceRange.minVariantPrice.amount);
  const currency = node.priceRange.minVariantPrice.currencyCode;

  return (
    <Card className="group overflow-hidden transition-all hover:shadow-hover animate-fade-in">
      <Link to={`/product/${node.handle}`}>
        <div className="aspect-[3/4] overflow-hidden bg-secondary/20">
          <img
            src={imageUrl}
            alt={node.title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>
      </Link>
      <CardContent className="p-4">
        <Link to={`/product/${node.handle}`}>
          <h3 className="font-medium mb-2 line-clamp-2 hover:text-primary transition-colors">
            {node.title}
          </h3>
        </Link>
        <p className="text-lg font-semibold text-primary">
          {currency} {price.toFixed(2)}
        </p>
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
