import Navbar from "@/components/layout/Navbar";
import { Trophy, Users, Flame, TrendingUp, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

const ranking = [
  { name: "Lucas", pts: 85, streak: 14, trend: "+12" },
  { name: "Ana", pts: 72, streak: 9, trend: "+8" },
  { name: "Você", pts: 68, streak: 12, trend: "+15" },
  { name: "Pedro", pts: 55, streak: 6, trend: "+3" },
  { name: "Maria", pts: 42, streak: 4, trend: "+7" },
];

const medals = ["🥇", "🥈", "🥉"];

const Groups = () => (
  <div className="min-h-screen bg-background">
    <Navbar />
    <main className="container mx-auto px-6 pt-24 pb-12 max-w-2xl">
      <div className="flex items-center justify-between mb-8 animate-slide-up">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">Grupos & Ranking</h1>
          <p className="text-muted-foreground text-sm">Compita com seus amigos</p>
        </div>
        <Button variant="hero" size="sm">
          <Plus className="w-4 h-4 mr-1" /> Criar Grupo
        </Button>
      </div>

      <div className="rounded-xl bg-card border border-border p-6 mb-6 glow-primary-sm">
        <div className="flex items-center gap-2 mb-4">
          <Trophy className="w-5 h-5 text-primary" />
          <h2 className="font-display font-semibold text-foreground">Ranking Semanal — Grupo Alpha</h2>
        </div>

        <div className="space-y-3">
          {ranking.map((r, i) => (
            <div
              key={r.name}
              className={`flex items-center justify-between rounded-lg p-3 transition-colors ${
                r.name === "Você" ? "bg-primary/10 border border-primary/30" : "bg-secondary/50"
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-lg w-8 text-center">{i < 3 ? medals[i] : `${i + 1}.`}</span>
                <div>
                  <p className="font-medium text-foreground text-sm">{r.name}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Flame className="w-3 h-3 text-warning" /> {r.streak} dias
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="font-display font-bold text-primary">{r.pts} pts</p>
                <p className="text-xs text-success flex items-center gap-0.5">
                  <TrendingUp className="w-3 h-3" /> {r.trend}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-xl bg-card border border-border p-6">
        <h3 className="font-display font-semibold text-foreground mb-3 flex items-center gap-2">
          <Users className="w-5 h-5 text-primary" /> Seus Grupos
        </h3>
        {["Grupo Alpha", "Musculação UFMG"].map((g) => (
          <div key={g} className="flex items-center justify-between py-3 border-b border-border last:border-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Users className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-medium text-foreground text-sm">{g}</p>
                <p className="text-xs text-muted-foreground">5 membros</p>
              </div>
            </div>
            <Button variant="ghost" size="sm">Ver</Button>
          </div>
        ))}
      </div>

      <div className="mt-6 rounded-xl bg-secondary/30 border border-border p-4">
        <h4 className="font-display text-sm font-semibold text-foreground mb-2">Pontuação</h4>
        <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
          <span>+10 treino feito</span>
          <span>+5 treino completo</span>
          <span>+5 aumento de carga</span>
          <span>+3 aumento reps</span>
        </div>
      </div>
    </main>
  </div>
);

export default Groups;
