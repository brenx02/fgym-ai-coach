import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import logo from "@/assets/logo.png";
import { Eye, EyeOff } from "lucide-react";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signUp, signIn } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;

    if (!isLogin) {
      if (password.length < 6) {
        toast({ title: "Senha fraca", description: "Mínimo 6 caracteres.", variant: "destructive" });
        return;
      }
      if (password !== confirmPassword) {
        toast({ title: "Senhas não coincidem", description: "Verifique a confirmação.", variant: "destructive" });
        return;
      }
      if (!name.trim()) {
        toast({ title: "Nome obrigatório", description: "Informe seu nome.", variant: "destructive" });
        return;
      }
    }

    setLoading(true);
    try {
      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) {
          toast({ title: "Erro no login", description: error.message, variant: "destructive" });
        } else {
          navigate("/dashboard");
        }
      } else {
        const { error } = await signUp(email, password, name.trim());
        if (error) {
          toast({ title: "Erro no cadastro", description: error.message, variant: "destructive" });
        } else {
          toast({ title: "Conta criada!", description: "Verifique seu email para confirmar." });
        }
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6">
      <div className="w-full max-w-sm animate-slide-up">
        <div className="text-center mb-8">
          <img src={logo} alt="Fgym" className="w-16 h-16 mx-auto mb-4" />
          <h1 className="font-display text-3xl font-bold text-foreground">
            F<span className="text-primary">gym</span>
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Personal Trainer com IA</p>
        </div>

        <div className="rounded-xl bg-card border border-border p-6">
          <h2 className="font-display text-xl font-semibold text-foreground mb-6 text-center">
            {isLogin ? "Entrar" : "Criar Conta"}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <Label htmlFor="name">Nome</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Seu nome"
                  className="mt-1"
                />
              </div>
            )}

            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="password">Senha</Label>
              <div className="relative mt-1">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {!isLogin && (
              <div>
                <Label htmlFor="confirm">Confirmar Senha</Label>
                <Input
                  id="confirm"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="mt-1"
                />
              </div>
            )}

            <Button type="submit" variant="hero" className="w-full" disabled={loading}>
              {loading ? "Aguarde..." : isLogin ? "Entrar" : "Criar Conta"}
            </Button>
          </form>

          <p className="text-sm text-muted-foreground text-center mt-4">
            {isLogin ? "Não tem conta?" : "Já tem conta?"}{" "}
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-primary hover:underline font-medium"
            >
              {isLogin ? "Criar conta" : "Entrar"}
            </button>
          </p>
        </div>

        <p className="text-xs text-muted-foreground text-center mt-6">
          ⚠️ Este app não substitui médico ou fisioterapeuta.
        </p>
      </div>
    </div>
  );
};

export default Auth;
