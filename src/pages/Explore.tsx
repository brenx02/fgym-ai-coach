import Navbar from "@/components/layout/Navbar";
import { Link } from "react-router-dom";
import { SPORTS } from "@/lib/sports";

const Explore = () => {
  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <Navbar />
      <main className="container mx-auto px-6 pt-24 pb-12 max-w-4xl">
        <header className="mb-8 animate-slide-up">
          <h1 className="font-display text-3xl font-bold text-foreground mb-1">Explorar esportes</h1>
          <p className="text-muted-foreground">Escolha uma modalidade para ver o feed da comunidade</p>
        </header>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {SPORTS.map((sport, i) => {
            const Icon = sport.icon;
            return (
              <Link
                key={sport.slug}
                to={`/feed?sport=${sport.slug}`}
                className="group relative overflow-hidden rounded-2xl bg-card border border-border p-6 hover:border-primary/50 transition-all hover:scale-[1.02] animate-slide-up"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${sport.accent} opacity-30 group-hover:opacity-60 transition-opacity`} />
                <div className="relative">
                  <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center mb-4 glow-primary-sm">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-display text-lg font-semibold text-foreground mb-1">{sport.name}</h3>
                  <p className="text-xs text-muted-foreground line-clamp-2">{sport.description}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </main>
    </div>
  );
};

export default Explore;
