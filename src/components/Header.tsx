import { Link, useNavigate } from "react-router-dom";
import { Heart, LogOut, User, Shield, Menu } from "lucide-react";
import { CartDrawer } from "./CartDrawer";
import { Button } from "./ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { User as SupabaseUser, Session } from "@supabase/supabase-js";
import { toast } from "sonner";
import { useAdminCheck } from "@/hooks/useAdminCheck";
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
  const { isAdmin } = useAdminCheck();

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
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center space-x-2">
          <Heart className="h-6 w-6 text-primary fill-primary" />
          <span className="font-semibold text-xl">Бесценки</span>
        </Link>
        
        {/* Desktop navigation */}
        <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
          <Link to="/" className="transition-colors hover:text-primary">
            Главная
          </Link>
          <Link to="/catalog" className="transition-colors hover:text-primary">
            Каталог
          </Link>
          {isAdmin && (
            <Link to="/admin" className="transition-colors hover:text-primary flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Админ-панель
            </Link>
          )}
        </nav>
        
        {/* Desktop actions */}
        <div className="hidden md:flex items-center gap-4">
          <CartDrawer />
          
          {user ? (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/profile">
                  <User className="h-4 w-4 mr-2" />
                  Профиль
                </Link>
              </Button>
              <Button variant="outline" size="sm" onClick={handleSignOut}>
                <LogOut className="h-4 w-4 mr-2" />
                Выход
              </Button>
            </>
          ) : (
            <Button variant="outline" size="sm" asChild>
              <Link to="/auth">
                <User className="h-4 w-4 mr-2" />
                Вход
              </Link>
            </Button>
          )}
        </div>

        {/* Mobile actions */}
        <div className="flex md:hidden items-center gap-2">
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
    </header>
  );
};
