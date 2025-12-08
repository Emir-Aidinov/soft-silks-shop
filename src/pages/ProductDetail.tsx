import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { ShopifyProduct, STOREFRONT_QUERY, storefrontApiRequest, formatPrice, SALE_PRODUCT_HANDLES, PRODUCT_INVENTORY } from "@/lib/shopify";
import { useCartStore } from "@/stores/cartStore";
import { toast } from "sonner";
import { Loader2, ChevronLeft, ChevronRight, ShoppingBag, Check, ArrowLeft, Package } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ProductReviews } from "@/components/ProductReviews";
import { RelatedProducts } from "@/components/RelatedProducts";

const ProductDetail = () => {
  const { handle } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState<ShopifyProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedVariant, setSelectedVariant] = useState<any>(null);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [addedToCart, setAddedToCart] = useState(false);
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
    setAddedToCart(false);
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
    setAddedToCart(true);
    toast.success("Добавлено в корзину", {
      description: product.node.title,
    });
    
    setTimeout(() => setAddedToCart(false), 2000);
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
  const isHit = SALE_PRODUCT_HANDLES.includes(node.handle);
  
  // Use hardcoded inventory from PRODUCT_INVENTORY
  const inventory = PRODUCT_INVENTORY[node.handle];
  const showLowStock = inventory !== undefined && inventory > 0;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container py-4 md:py-8">
        {/* Back button */}
        <Button 
          variant="ghost" 
          onClick={() => navigate(-1)}
          className="mb-4 -ml-2 hover:bg-secondary/50"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Назад
        </Button>

        <div className="grid md:grid-cols-2 gap-6 lg:gap-12">
          <div className="space-y-4">
            <div className="aspect-[3/4] rounded-2xl overflow-hidden bg-secondary/20 relative group">
              <img
                src={currentImage}
                alt={node.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              
              {hasDiscount && (
                <Badge className="absolute top-4 left-4 bg-destructive text-destructive-foreground text-lg px-3 py-1 animate-pulse">
                  -{discountPercent}%
                </Badge>
              )}
              {isHit && (
                <Badge className="absolute top-4 right-4 bg-yellow-500 text-yellow-950 text-sm px-2 py-1">
                  🔥 ХИТ
                </Badge>
              )}
              
              {/* Image navigation */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={() => setSelectedImageIndex(prev => (prev === 0 ? images.length - 1 : prev - 1))}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-background/90 hover:bg-background shadow-soft flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
                    aria-label="Предыдущее фото"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => setSelectedImageIndex(prev => (prev === images.length - 1 ? 0 : prev + 1))}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-background/90 hover:bg-background shadow-soft flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
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
                    className={`aspect-square rounded-lg overflow-hidden bg-secondary/20 border-2 transition-all hover:scale-105 ${
                      idx === selectedImageIndex ? 'border-primary ring-2 ring-primary/30' : 'border-transparent hover:border-primary/50'
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
              <h1 className="text-2xl md:text-4xl font-bold mb-3">{node.title}</h1>
              <div className="flex items-center gap-3">
                <p className="text-3xl md:text-4xl font-bold text-primary">
                  {formatPrice(price)}
                </p>
                {hasDiscount && (
                  <p className="text-xl text-muted-foreground line-through">
                    {formatPrice(compareAtPrice)}
                  </p>
                )}
              </div>
              {/* Low stock indicator */}
              {showLowStock && (
                <div className="mt-3">
                  <span className="inline-flex items-center gap-1.5 bg-orange-500 text-orange-950 text-sm font-bold px-3 py-1.5 rounded-full">
                    <Package className="h-4 w-4" />
                    Осталось {inventory} шт.
                  </span>
                </div>
              )}
            </div>

            {node.description && (
              <div className="bg-secondary/30 rounded-xl p-4">
                <h2 className="font-semibold mb-2">Описание</h2>
                <p className="text-muted-foreground">{node.description}</p>
              </div>
            )}

            {node.options.map((option) => (
              <div key={option.name}>
                <label className="block font-semibold mb-3">{option.name}</label>
                <div className="flex flex-wrap gap-2">
                  {option.values.map((value) => (
                    <button
                      key={value}
                      onClick={() => handleOptionChange(option.name, value)}
                      className={`px-5 py-3 rounded-xl border-2 font-medium transition-all ${
                        selectedOptions[option.name] === value
                          ? "border-primary bg-primary text-primary-foreground shadow-soft"
                          : "border-border hover:border-primary hover:bg-primary/5"
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
              className={`w-full h-14 text-lg shadow-hover transition-all ${addedToCart ? 'bg-green-500 hover:bg-green-600' : ''}`}
              disabled={!selectedVariant?.availableForSale}
            >
              {addedToCart ? (
                <>
                  <Check className="mr-2 h-5 w-5" />
                  Добавлено!
                </>
              ) : selectedVariant?.availableForSale ? (
                <>
                  <ShoppingBag className="mr-2 h-5 w-5" />
                  Добавить в корзину
                </>
              ) : (
                "Нет в наличии"
              )}
            </Button>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="mt-12 md:mt-16">
          <ProductReviews productId={node.id} />
        </div>

        {/* Related Products */}
        <div className="mt-12 md:mt-16">
          <RelatedProducts 
            currentProductId={node.id} 
            currentProductType={node.productType}
          />
        </div>
      </main>
    </div>
  );
};

export default ProductDetail;