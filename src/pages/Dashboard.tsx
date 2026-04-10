import Navbar from "@/components/layout/Navbar";
import { Dumbbell, Flame, Trophy, TrendingUp, Calendar, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";

const todayWorkout = {
  name: "Treino A — Peito e Tríceps",
  exercises: [
    { name: "Supino Reto", sets: 4, reps: "10-12", weight: "60kg" },
    { name: "Supino Inclinado", sets: 3, reps: "10-12", weight: "50kg" },
    { name: "Crossover", sets: 3, reps: "12-15", weight: "25kg" },
    { name: "Tríceps Corda", sets: 4, reps: "12-15", weight: "30kg" },
    { name: "Tríceps Testa", sets: 3, reps: "10-12", weight: "20kg" },
  ],
};

const stats = [
  { label: "Treinos esta semana", value: "4", icon: Dumbbell, color: "text-primary" },
  { label: "Streak", value: "12 dias", icon: Flame, color: "text-warning" },
  { label: "Ranking", value: "#3", icon: Trophy, color: "text-primary" },
  { label: "Progresso", value: "+8%", icon: TrendingUp, color: "text-success" },
];

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [name, setName] = useState("Atleta");
  const [onboardingDone, setOnboardingDone] = useState(true);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const [{ data: p }, { data: up }] = await Promise.all([
        supabase.from("profiles").select("name").eq("user_id", user.id).single(),
        supabase.from("user_profiles").select("onboarding_completed").eq("user_id", user.id).single(),
      ]);
      if (p?.name) setName(p.name);
      if (up && !up.onboarding_completed) setOnboardingDone(false);
    };
    load();
  }, [user]);

  useEffect(() => {
    if (!onboardingDone) navigate("/onboarding");
  }, [onboardingDone, navigate]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-6 pt-24 pb-12">
        <div className="mb-8 animate-slide-up">
          <h1 className="font-display text-3xl font-bold text-foreground mb-1">Olá, {name} 💪</h1>
          <p className="text-muted-foreground">Vamos treinar hoje?</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((s) => (
            <div key={s.label} className="rounded-xl bg-card border border-border p-4 hover:border-primary/30 transition-colors">
              <s.icon className={`w-5 h-5 ${s.color} mb-2`} />
              <p className="font-display text-2xl font-bold text-foreground">{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 rounded-xl bg-card border border-border p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="font-display text-xl font-semibold text-foreground">{todayWorkout.name}</h2>
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <Calendar className="w-3 h-3" /> Hoje
                </p>
              </div>
              <Button variant="hero" size="sm" onClick={() => navigate("/workout")}>
                <Zap className="w-4 h-4 mr-1" /> Iniciar
              </Button>
            </div>

            <div className="space-y-3">
              {todayWorkout.exercises.map((ex, i) => (
                <div key={i} className="flex items-center justify-between rounded-lg bg-secondary/50 p-3">
                  <div>
                    <p className="font-medium text-foreground text-sm">{ex.name}</p>
                    <p className="text-xs text-muted-foreground">{ex.sets}x{ex.reps}</p>
                  </div>
                  <span className="text-sm font-semibold text-primary">{ex.weight}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-xl bg-card border border-border p-6">
              <h3 className="font-display font-semibold text-foreground mb-4">Progresso Semanal</h3>
              <div className="space-y-3">
                {["Seg", "Ter", "Qua", "Qui", "Sex"].map((day, i) => (
                  <div key={day} className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground w-8">{day}</span>
                    <Progress value={i < 4 ? 100 : 0} className="h-2 flex-1" />
                  </div>
                ))}
              </div>
              <p className="text-sm text-muted-foreground mt-4">4/5 treinos completos</p>
            </div>

            <div className="rounded-xl bg-card border border-border p-6 glow-primary-sm">
              <h3 className="font-display font-semibold text-foreground mb-2">🏆 Top 3 — Grupo</h3>
              {["Lucas — 85 pts", "Ana — 72 pts", "Você — 68 pts"].map((item, i) => (
                <div key={i} className="flex items-center gap-2 py-1.5">
                  <span className="text-xs font-bold text-primary w-5">{i + 1}.</span>
                  <span className="text-sm text-foreground">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
