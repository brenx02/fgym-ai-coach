import { Swords, Waves, Footprints, Hand, Dumbbell, Activity, Mountain, LucideIcon, LayoutGrid } from "lucide-react";

export interface Sport {
  slug: string;
  name: string;
  icon: LucideIcon;
  description: string;
  accent: string; // tailwind text/bg accent class
}

export const SPORTS: Sport[] = [
  { slug: "jiu-jitsu", name: "Jiu-jitsu", icon: Swords, description: "Arte suave, técnica e estratégia no tatame", accent: "from-primary/30 to-accent/20" },
  { slug: "surf", name: "Surf", icon: Waves, description: "Conexão com o mar e leitura de ondas", accent: "from-accent/30 to-primary/20" },
  { slug: "corrida", name: "Corrida", icon: Footprints, description: "Resistência, ritmo e superação", accent: "from-primary/30 to-accent/20" },
  { slug: "boxe", name: "Boxe", icon: Hand, description: "Disciplina, reflexo e potência", accent: "from-accent/30 to-primary/20" },
  { slug: "academia", name: "Academia", icon: Dumbbell, description: "Musculação e hipertrofia", accent: "from-primary/30 to-accent/20" },
  { slug: "funcional", name: "Funcional", icon: Activity, description: "Movimentos integrados e mobilidade", accent: "from-accent/30 to-primary/20" },
  { slug: "outdoor", name: "Ao ar livre", icon: Mountain, description: "Treinos em parques, trilhas e praias", accent: "from-primary/30 to-accent/20" },
];

export const ALL_SPORT: { slug: "todos"; name: string; icon: LucideIcon } = {
  slug: "todos",
  name: "Todos",
  icon: LayoutGrid,
};

export const getSport = (slug: string) => SPORTS.find((s) => s.slug === slug);
