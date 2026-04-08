import Navbar from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Check, ChevronDown, ChevronUp, AlertTriangle } from "lucide-react";
import { useState } from "react";

interface Exercise {
  name: string;
  sets: number;
  reps: string;
  weight: string;
  note?: string;
  done: boolean;
}

const initialExercises: Exercise[] = [
  { name: "Supino Reto", sets: 4, reps: "10-12", weight: "60kg", done: false },
  { name: "Supino Inclinado", sets: 3, reps: "10-12", weight: "50kg", done: false },
  { name: "Crossover", sets: 3, reps: "12-15", weight: "25kg", done: false },
  { name: "Tríceps Corda", sets: 4, reps: "12-15", weight: "30kg", done: false },
  { name: "Tríceps Testa", sets: 3, reps: "10-12", weight: "20kg", note: "Adaptado — evitar extensão total (condromalácia)", done: false },
];

const Workout = () => {
  const [exercises, setExercises] = useState(initialExercises);
  const [expanded, setExpanded] = useState<number | null>(0);

  const toggleDone = (i: number) => {
    setExercises((prev) => prev.map((ex, idx) => (idx === i ? { ...ex, done: !ex.done } : ex)));
  };

  const doneCount = exercises.filter((e) => e.done).length;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-6 pt-24 pb-12 max-w-2xl">
        <div className="mb-8 animate-slide-up">
          <h1 className="font-display text-3xl font-bold text-foreground mb-1">Treino A — Peito e Tríceps</h1>
          <p className="text-muted-foreground">
            {doneCount}/{exercises.length} exercícios completos
          </p>
          <div className="w-full bg-secondary rounded-full h-2 mt-3">
            <div
              className="bg-primary h-2 rounded-full transition-all duration-500"
              style={{ width: `${(doneCount / exercises.length) * 100}%` }}
            />
          </div>
        </div>

        <div className="space-y-3">
          {exercises.map((ex, i) => (
            <div
              key={i}
              className={`rounded-xl border transition-all duration-300 ${
                ex.done ? "bg-primary/5 border-primary/30" : "bg-card border-border"
              }`}
            >
              <div
                className="flex items-center justify-between p-4 cursor-pointer"
                onClick={() => setExpanded(expanded === i ? null : i)}
              >
                <div className="flex items-center gap-3">
                  <button
                    onClick={(e) => { e.stopPropagation(); toggleDone(i); }}
                    className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all ${
                      ex.done ? "bg-primary border-primary" : "border-muted-foreground/30"
                    }`}
                  >
                    {ex.done && <Check className="w-4 h-4 text-primary-foreground" />}
                  </button>
                  <div>
                    <p className={`font-medium text-sm ${ex.done ? "line-through text-muted-foreground" : "text-foreground"}`}>
                      {ex.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {ex.sets}x{ex.reps} · {ex.weight}
                    </p>
                  </div>
                </div>
                {expanded === i ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
              </div>

              {expanded === i && (
                <div className="px-4 pb-4 space-y-3 animate-slide-up">
                  {ex.note && (
                    <div className="flex items-start gap-2 rounded-lg bg-warning/10 p-3">
                      <AlertTriangle className="w-4 h-4 text-warning mt-0.5" />
                      <p className="text-xs text-warning">{ex.note}</p>
                    </div>
                  )}
                  <div className="grid grid-cols-3 gap-2">
                    <div className="rounded-lg bg-secondary p-3 text-center">
                      <p className="text-xs text-muted-foreground">Séries</p>
                      <p className="font-display font-bold text-foreground">{ex.sets}</p>
                    </div>
                    <div className="rounded-lg bg-secondary p-3 text-center">
                      <p className="text-xs text-muted-foreground">Reps</p>
                      <p className="font-display font-bold text-foreground">{ex.reps}</p>
                    </div>
                    <div className="rounded-lg bg-secondary p-3 text-center">
                      <p className="text-xs text-muted-foreground">Carga</p>
                      <p className="font-display font-bold text-primary">{ex.weight}</p>
                    </div>
                  </div>
                  <Button variant="hero" className="w-full" onClick={() => toggleDone(i)}>
                    {ex.done ? "Desmarcar" : "Marcar como feito"}
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-6 text-center">
          <p className="text-xs text-muted-foreground">
            ⚠️ Este app não substitui médico ou fisioterapeuta.
          </p>
        </div>
      </main>
    </div>
  );
};

export default Workout;
