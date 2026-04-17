import { Link, useLocation, useNavigate } from "react-router-dom";
import { Home, Compass, PlusSquare, Brain, User, Menu, X, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import logo from "@/assets/logo.png";

const navItems = [
  { to: "/feed", label: "Feed", icon: Home },
  { to: "/explore", label: "Explorar", icon: Compass },
  { to: "/post/new", label: "Postar", icon: PlusSquare },
  { to: "/ai-coach", label: "IA Coach", icon: Brain },
  { to: "/profile", label: "Perfil", icon: User },
];

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [open, setOpen] = useState(false);

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass">
      <div className="container mx-auto px-6 h-16 flex items-center justify-between">
        <Link to={user ? "/feed" : "/"} className="flex items-center gap-2">
          <img src={logo} alt="Fgym" className="w-8 h-8" />
          <span className="font-display font-bold text-xl text-foreground">
            F<span className="text-primary">gym</span>
          </span>
        </Link>

        {user && (
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <Link key={item.to} to={item.to}>
                <Button
                  variant={location.pathname === item.to ? "default" : "ghost"}
                  size="sm"
                  className="gap-2"
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </Button>
              </Link>
            ))}
            <Button variant="ghost" size="sm" onClick={handleLogout} className="gap-2 text-muted-foreground">
              <LogOut className="w-4 h-4" /> Sair
            </Button>
          </div>
        )}

        {!user && (
          <Link to="/auth">
            <Button size="sm">Entrar</Button>
          </Link>
        )}

        {user && (
          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setOpen(!open)}>
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        )}
      </div>

      {open && user && (
        <div className="md:hidden glass border-t border-border p-4 space-y-1">
          {navItems.map((item) => (
            <Link key={item.to} to={item.to} onClick={() => setOpen(false)}>
              <Button
                variant={location.pathname === item.to ? "default" : "ghost"}
                className="w-full justify-start gap-2"
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </Button>
            </Link>
          ))}
          <Button variant="ghost" className="w-full justify-start gap-2 text-muted-foreground" onClick={handleLogout}>
            <LogOut className="w-4 h-4" /> Sair
          </Button>
        </div>
      )}

      {/* Mobile bottom nav */}
      {user && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 glass border-t border-border">
          <div className="flex items-center justify-around h-16">
            {navItems.map((item) => {
              const active = location.pathname === item.to;
              return (
                <Link key={item.to} to={item.to} className="flex-1 flex flex-col items-center justify-center gap-0.5">
                  <item.icon className={`w-5 h-5 ${active ? "text-primary" : "text-muted-foreground"}`} />
                  <span className={`text-[10px] ${active ? "text-primary font-medium" : "text-muted-foreground"}`}>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
