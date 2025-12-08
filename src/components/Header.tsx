import { Link, useNavigate } from "react-router-dom";
import { Heart, LogOut, User, Shield, Menu, Search } from "lucide-react";
import { CartDrawer } from "./CartDrawer";
import { SearchBar } from "./SearchBar";
import { Button } from "./ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { User as SupabaseUser, Session } from "@supabase/supabase-js";
import { toast } from "sonner";
import { useAdminCheck } from "@/hooks/useAdminCheck";
import { useFavoritesStore } from "@/stores/favoritesStore";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";

export const Header = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const { isAdmin } = useAdminCheck();
  const { favorites } = useFavoritesStore();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error("Ошибка выхода");
    } else {
      toast.success("Вы вышли из аккаунта");
      navigate("/");
    }
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between gap-4">
        <Link to="/" className="flex items-center space-x-2 flex-shrink-0">
          <div className="relative">
            <Heart className="h-7 w-7 text-primary fill-primary" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-accent rounded-full animate-pulse" />
          </div>
          <span className="font-bold text-xl bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Бесценки
          </span>
        </Link>

        {/* Desktop Search */}
        <div className="hidden md:flex flex-1 max-w-md mx-4">
          <SearchBar />
        </div>
        
        {/* Desktop navigation */}
        <nav className="hidden lg:flex items-center space-x-6 text-sm font-medium">
          <Link to="/" className="transition-colors hover:text-primary">
            Главная
          </Link>
          <Link to="/catalog" className="transition-colors hover:text-primary">
            Каталог
          </Link>
          {isAdmin && (
            <Link to="/admin" className="transition-colors hover:text-primary flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Админ
            </Link>
          )}
        </nav>
        
        {/* Desktop actions */}
        <div className="hidden md:flex items-center gap-3">
          <Link to="/favorites" className="relative p-2 hover:bg-secondary rounded-full transition-colors">
            <Heart className={`h-5 w-5 ${favorites.length > 0 ? "fill-destructive text-destructive" : "text-muted-foreground"}`} />
            {favorites.length > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-destructive text-destructive-foreground text-xs rounded-full flex items-center justify-center font-medium">
                {favorites.length}
              </span>
            )}
          </Link>
          <CartDrawer />
          
          {user ? (
            <>
              <Button variant="ghost" size="sm" asChild className="hover:bg-primary/10">
                <Link to="/profile">
                  <User className="h-4 w-4 mr-2" />
                  Профиль
                </Link>
              </Button>
              <Button variant="outline" size="sm" onClick={handleSignOut} className="hover:bg-destructive/10 hover:text-destructive hover:border-destructive/50">
                <LogOut className="h-4 w-4 mr-2" />
                Выход
              </Button>
            </>
          ) : (
            <Button variant="default" size="sm" asChild className="shadow-soft">
              <Link to="/auth">
                <User className="h-4 w-4 mr-2" />
                Вход
              </Link>
            </Button>
          )}
        </div>

        {/* Mobile actions */}
        <div className="flex md:hidden items-center gap-2">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => setShowMobileSearch(!showMobileSearch)}
          >
            <Search className="h-5 w-5" />
          </Button>
          <Link to="/favorites" className="relative p-2">
            <Heart className={`h-5 w-5 ${favorites.length > 0 ? "fill-destructive text-destructive" : "text-muted-foreground"}`} />
            {favorites.length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-destructive text-destructive-foreground text-xs rounded-full flex items-center justify-center font-medium">
                {favorites.length}
              </span>
            )}
          </Link>
          <CartDrawer />
          
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[280px]">
              <nav className="flex flex-col gap-4 mt-8">
                <Link 
                  to="/" 
                  className="text-lg font-medium hover:text-primary transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Главная
                </Link>
                <Link 
                  to="/catalog" 
                  className="text-lg font-medium hover:text-primary transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Каталог
                </Link>
                <Link 
                  to="/favorites" 
                  className="text-lg font-medium hover:text-primary transition-colors flex items-center gap-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Heart className={`h-4 w-4 ${favorites.length > 0 ? "fill-destructive text-destructive" : ""}`} />
                  Избранное {favorites.length > 0 && `(${favorites.length})`}
                </Link>
                {isAdmin && (
                  <Link 
                    to="/admin" 
                    className="text-lg font-medium hover:text-primary transition-colors flex items-center gap-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Shield className="h-4 w-4" />
                    Админ-панель
                  </Link>
                )}
                
                <div className="border-t pt-4 mt-4">
                  {user ? (
                    <>
                      <Link 
                        to="/profile"
                        className="flex items-center gap-2 text-lg font-medium hover:text-primary transition-colors mb-4"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <User className="h-4 w-4" />
                        Профиль
                      </Link>
                      <Button variant="outline" className="w-full" onClick={handleSignOut}>
                        <LogOut className="h-4 w-4 mr-2" />
                        Выход
                      </Button>
                    </>
                  ) : (
                    <Button variant="default" className="w-full" asChild>
                      <Link to="/auth" onClick={() => setMobileMenuOpen(false)}>
                        <User className="h-4 w-4 mr-2" />
                        Вход
                      </Link>
                    </Button>
                  )}
                </div>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Mobile search bar */}
      {showMobileSearch && (
        <div className="md:hidden border-t p-3 animate-fade-in">
          <SearchBar />
        </div>
      )}
    </header>
  );
};