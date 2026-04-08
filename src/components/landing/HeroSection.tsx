import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Dumbbell, Brain, TrendingUp } from "lucide-react";
import heroBg from "@/assets/hero-bg.jpg";

const HeroSection = () => {
  const navigate = useNavigate();

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center opacity-40"
        style={{ backgroundImage: `url(${heroBg})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/60 to-background" />

      <div className="relative z-10 container mx-auto px-6 text-center animate-slide-up">
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 mb-8">
          <Brain className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium text-primary">Personal Trainer com IA</span>
        </div>

        <h1 className="font-display text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-6">
          <span className="text-foreground">F</span>
          <span className="text-primary glow-text">gym</span>
        </h1>

        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
          Seu personal trainer inteligente. Treinos personalizados, adaptação por lesões,
          análise de progresso e muito mais — tudo com o poder da IA.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
          <Button variant="hero" size="lg" className="px-10 py-6 text-lg" onClick={() => navigate("/dashboard")}>
            Começar Agora
          </Button>
          <Button variant="hero-outline" size="lg" className="px-10 py-6 text-lg" onClick={() => navigate("/ai-coach")}>
            Falar com a IA
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {[
            { icon: Brain, title: "IA Inteligente", desc: "Treinos adaptados ao seu corpo e objetivos" },
            { icon: Dumbbell, title: "Treinos Smart", desc: "Progressão automática com base no seu desempenho" },
            { icon: TrendingUp, title: "Análise Real", desc: "Gráficos e métricas para acompanhar sua evolução" },
          ].map((item) => (
            <div key={item.title} className="glass rounded-xl p-6 animate-fade-in hover:glow-primary-sm transition-shadow duration-500">
              <item.icon className="w-8 h-8 text-primary mb-3 mx-auto" />
              <h3 className="font-display font-semibold text-foreground mb-1">{item.title}</h3>
              <p className="text-sm text-muted-foreground">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
