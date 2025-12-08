import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { ShopifyProduct, STOREFRONT_QUERY, storefrontApiRequest, formatPrice } from "@/lib/shopify";
import { useCartStore } from "@/stores/cartStore";
import { toast } from "sonner";
import { Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const ProductDetail = () => {
  const { handle } = useParams();
  const [product, setProduct] = useState<ShopifyProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedVariant, setSelectedVariant] = useState<any>(null);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const addItem = useCartStore(state => state.addItem);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const data = await storefrontApiRequest(STOREFRONT_QUERY, { first: 50 });
        const foundProduct = data.data.products.edges.find(
          (p: ShopifyProduct) => p.node.handle === handle
        );
        
        if (foundProduct) {
          setProduct(foundProduct);
          const firstVariant = foundProduct.node.variants.edges[0]?.node;
          setSelectedVariant(firstVariant);
          
          const initialOptions: Record<string, string> = {};
          firstVariant?.selectedOptions.forEach((opt: any) => {
            initialOptions[opt.name] = opt.value;
          });
          setSelectedOptions(initialOptions);
        }
      } catch (error) {
        console.error('Error fetching product:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [handle]);

  const handleOptionChange = (optionName: string, value: string) => {
    const newOptions = { ...selectedOptions, [optionName]: value };
    setSelectedOptions(newOptions);

    const variant = product?.node.variants.edges.find((v) => 
      v.node.selectedOptions.every((opt) => newOptions[opt.name] === opt.value)
    );
    
    if (variant) {
      setSelectedVariant(variant.node);
    }
  };

  const handleAddToCart = () => {
    if (!product || !selectedVariant) return;

    const cartItem = {
      product,
      variantId: selectedVariant.id,
      variantTitle: selectedVariant.title,
      price: selectedVariant.price,
      quantity: 1,
      selectedOptions: selectedVariant.selectedOptions || []
    };
    
    addItem(cartItem);
    toast.success("Добавлено в корзину", {
      description: product.node.title,
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container py-20 text-center">
          <p className="text-lg text-muted-foreground">Товар не найден</p>
        </div>
      </div>
    );
  }

  const { node } = product;
  const images = node.images.edges;
  const currentImage = images[selectedImageIndex]?.node.url || "/placeholder.svg";
  
  const price = parseFloat(selectedVariant?.price.amount || "0");
  const compareAtPrice = selectedVariant?.compareAtPrice?.amount 
    ? parseFloat(selectedVariant.compareAtPrice.amount) 
    : null;
  const hasDiscount = compareAtPrice && compareAtPrice > price;
  const discountPercent = hasDiscount ? Math.round((1 - price / compareAtPrice) * 100) : 0;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container py-4 md:py-8">
        <div className="grid md:grid-cols-2 gap-6 lg:gap-12">
          <div className="space-y-4">
            <div className="aspect-[3/4] rounded-lg overflow-hidden bg-secondary/20 relative">
              <img
                src={currentImage}
                alt={node.title}
                className="w-full h-full object-cover"
              />
              
              {hasDiscount && (
                <Badge className="absolute top-4 left-4 bg-destructive text-destructive-foreground text-lg px-3 py-1">
                  -{discountPercent}%
                </Badge>
              )}
              
              {/* Image navigation */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={() => setSelectedImageIndex(prev => (prev === 0 ? images.length - 1 : prev - 1))}
                    className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-background/80 hover:bg-background flex items-center justify-center transition-all"
                    aria-label="Предыдущее фото"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => setSelectedImageIndex(prev => (prev === images.length - 1 ? 0 : prev + 1))}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-background/80 hover:bg-background flex items-center justify-center transition-all"
                    aria-label="Следующее фото"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </>
              )}
            </div>
            
            {/* Thumbnail gallery */}
            {images.length > 1 && (
              <div className="grid grid-cols-5 gap-2">
                {images.map((image, idx) => (
                  <button
                    key={idx} 
                    onClick={() => setSelectedImageIndex(idx)}
                    className={`aspect-square rounded-md overflow-hidden bg-secondary/20 border-2 transition-all ${
                      idx === selectedImageIndex ? 'border-primary' : 'border-transparent hover:border-primary/50'
                    }`}
                  >
                    <img
                      src={image.node.url}
                      alt={`${node.title} ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold mb-2">{node.title}</h1>
              <div className="flex items-center gap-3">
                <p className="text-2xl md:text-3xl font-semibold text-primary">
                  {formatPrice(price)}
                </p>
                {hasDiscount && (
                  <p className="text-lg text-muted-foreground line-through">
                    {formatPrice(compareAtPrice)}
                  </p>
                )}
              </div>
            </div>

            {node.description && (
              <div>
                <h2 className="font-semibold mb-2">Описание</h2>
                <p className="text-muted-foreground">{node.description}</p>
              </div>
            )}

            {node.options.map((option) => (
              <div key={option.name}>
                <label className="block font-semibold mb-2">{option.name}</label>
                <div className="flex flex-wrap gap-2">
                  {option.values.map((value) => (
                    <button
                      key={value}
                      onClick={() => handleOptionChange(option.name, value)}
                      className={`px-4 py-2 rounded-md border transition-colors ${
                        selectedOptions[option.name] === value
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border hover:border-primary"
                      }`}
                    >
                      {value}
                    </button>
                  ))}
                </div>
              </div>
            ))}

            <Button
              onClick={handleAddToCart}
              size="lg"
              className="w-full"
              disabled={!selectedVariant?.availableForSale}
            >
              {selectedVariant?.availableForSale ? "Добавить в корзину" : "Нет в наличии"}
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProductDetail;
