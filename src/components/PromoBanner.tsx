import { useState } from "react";
import { X, Copy, Check, Gift } from "lucide-react";
import { Button } from "./ui/button";
import { toast } from "sonner";

interface PromoBannerProps {
  code: string;
  discount: string;
  description?: string;
}

export const PromoBanner = ({ code, discount, description }: PromoBannerProps) => {
  const [isVisible, setIsVisible] = useState(true);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      toast.success("Промокод скопирован!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Не удалось скопировать");
    }
  };

  if (!isVisible) return null;

  return (
    <div className="relative bg-gradient-to-r from-primary via-primary/90 to-accent text-primary-foreground overflow-hidden">
      {/* Animated background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `repeating-linear-gradient(
            45deg,
            transparent,
            transparent 10px,
            rgba(255,255,255,0.1) 10px,
            rgba(255,255,255,0.1) 20px
          )`
        }} />
      </div>
      
      <div className="container px-4 py-3 md:py-4 relative">
        <div className="flex items-center justify-center gap-3 md:gap-6 flex-wrap">
          <div className="flex items-center gap-2">
            <Gift className="h-5 w-5 animate-bounce" />
            <span className="font-bold text-lg">{discount}</span>
          </div>
          
          <span className="hidden md:inline text-sm opacity-90">
            {description || "Используйте промокод при оформлении заказа"}
          </span>
          
          <button
            onClick={handleCopy}
            className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-background/20 hover:bg-background/30 transition-colors font-mono font-bold text-sm border border-primary-foreground/20"
          >
            {code}
            {copied ? (
              <Check className="h-4 w-4 text-green-300" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </button>
        </div>
        
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 text-primary-foreground/70 hover:text-primary-foreground hover:bg-primary-foreground/10"
          onClick={() => setIsVisible(false)}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
