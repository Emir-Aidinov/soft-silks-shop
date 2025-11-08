import { Link } from "react-router-dom";
import { Heart } from "lucide-react";
import { CartDrawer } from "./CartDrawer";

export const Header = () => {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center space-x-2">
          <Heart className="h-6 w-6 text-primary fill-primary" />
          <span className="font-semibold text-xl">Silk & Rose</span>
        </Link>
        
        <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
          <Link to="/" className="transition-colors hover:text-primary">
            Главная
          </Link>
          <Link to="/catalog" className="transition-colors hover:text-primary">
            Каталог
          </Link>
        </nav>
        
        <CartDrawer />
      </div>
    </header>
  );
};
