import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { ShopifyProduct, STOREFRONT_QUERY, storefrontApiRequest } from "@/lib/shopify";
import { useCartStore } from "@/stores/cartStore";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

const ProductDetail = () => {
  const { handle } = useParams();
  const [product, setProduct] = useState<ShopifyProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedVariant, setSelectedVariant] = useState<any>(null);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
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
          
          // Initialize selected options
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

    // Find matching variant
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
  const mainImage = node.images.edges[0]?.node.url || "/placeholder.svg";

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container py-8">
        <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
          <div className="space-y-4">
            <div className="aspect-[3/4] rounded-lg overflow-hidden bg-secondary/20">
              <img
                src={mainImage}
                alt={node.title}
                className="w-full h-full object-cover"
              />
            </div>
            
            {node.images.edges.length > 1 && (
              <div className="grid grid-cols-4 gap-4">
                {node.images.edges.slice(1, 5).map((image, idx) => (
                  <div key={idx} className="aspect-square rounded-md overflow-hidden bg-secondary/20">
                    <img
                      src={image.node.url}
                      alt={`${node.title} ${idx + 2}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">{node.title}</h1>
              <p className="text-2xl font-semibold text-primary">
                {selectedVariant?.price.currencyCode} {parseFloat(selectedVariant?.price.amount).toFixed(2)}
              </p>
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
