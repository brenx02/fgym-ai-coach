import Navbar from "@/components/layout/Navbar";
import { User, Target, AlertTriangle, Calendar, Dumbbell, TrendingUp, FileText, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";

const Profile = () => (
  <div className="min-h-screen bg-background">
    <Navbar />
    <main className="container mx-auto px-6 pt-24 pb-12 max-w-2xl">
      <div className="flex items-center gap-4 mb-8 animate-slide-up">
        <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center glow-primary-sm">
          <User className="w-8 h-8 text-primary" />
        </div>
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Atleta</h1>
          <p className="text-sm text-muted-foreground">Membro desde Abr 2026</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: "Treinos", value: "48", icon: Dumbbell },
          { label: "Streak Max", value: "14 dias", icon: Calendar },
          { label: "Evolução", value: "+23%", icon: TrendingUp },
        ].map((s) => (
          <div key={s.label} className="rounded-xl bg-card border border-border p-4 text-center">
            <s.icon className="w-5 h-5 text-primary mx-auto mb-1" />
            <p className="font-display font-bold text-foreground">{s.value}</p>
            <p className="text-xs text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="space-y-6">
        <div className="rounded-xl bg-card border border-border p-6">
          <h3 className="font-display font-semibold text-foreground mb-3 flex items-center gap-2">
            <Target className="w-5 h-5 text-primary" /> Objetivos
          </h3>
          <div className="flex flex-wrap gap-2">
            {["Hipertrofia", "Força", "5x por semana"].map((tag) => (
              <span key={tag} className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                {tag}
              </span>
            ))}
          </div>
        </div>

        <div className="rounded-xl bg-card border border-border p-6">
          <h3 className="font-display font-semibold text-foreground mb-3 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-warning" /> Limitações
          </h3>
          <div className="space-y-2">
            {["Condromalácia patelar grau II", "Sensibilidade lombar"].map((item) => (
              <div key={item} className="flex items-center gap-2 rounded-lg bg-warning/5 p-3">
                <AlertTriangle className="w-4 h-4 text-warning shrink-0" />
                <p className="text-sm text-foreground">{item}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl bg-card border border-border p-6">
          <h3 className="font-display font-semibold text-foreground mb-3 flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" /> Laudos Médicos
          </h3>
          <p className="text-sm text-muted-foreground mb-3">
            Envie laudos para que a IA adapte seu treino automaticamente.
          </p>
          <Button variant="hero-outline" className="w-full">
            <Upload className="w-4 h-4 mr-2" /> Enviar Laudo
          </Button>
          <p className="text-xs text-muted-foreground mt-3 text-center">
            Aceita: PDF, imagem ou texto. A IA não diagnostica — apenas adapta treinos.
          </p>
        </div>
      </div>

      <p className="text-xs text-muted-foreground text-center mt-8">
        ⚠️ Este app não substitui médico ou fisioterapeuta.
      </p>
    </main>
  </div>
);

export default Profile;
