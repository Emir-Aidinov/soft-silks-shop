import { Link, useNavigate } from "react-router-dom";
import { Heart, LogOut, User } from "lucide-react";
import { CartDrawer } from "./CartDrawer";
import { Button } from "./ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { User as SupabaseUser, Session } from "@supabase/supabase-js";
import { toast } from "sonner";

export const Header = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
      }
    );

    // THEN check for existing session
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
  };

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
        
        <div className="flex items-center gap-4">
          <CartDrawer />
          
          {user ? (
            <Button variant="outline" size="sm" onClick={handleSignOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Выход
            </Button>
          ) : (
            <Button variant="outline" size="sm" asChild>
              <Link to="/auth">
                <User className="h-4 w-4 mr-2" />
                Вход
              </Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};
