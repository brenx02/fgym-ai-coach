import Navbar from "@/components/layout/Navbar";
import { User, Target, AlertTriangle, Calendar, Dumbbell, TrendingUp, FileText, Upload, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const Profile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const [{ data: p }, { data: up }] = await Promise.all([
        supabase.from("profiles").select("*").eq("user_id", user.id).single(),
        supabase.from("user_profiles").select("*").eq("user_id", user.id).single(),
      ]);
      setProfile(p);
      setUserProfile(up);
    };
    load();
  }, [user]);

  const name = profile?.name || user?.user_metadata?.name || "Atleta";

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-6 pt-24 pb-12 max-w-2xl">
        <div className="flex items-center gap-4 mb-8 animate-slide-up">
          <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center glow-primary-sm">
            <User className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">{name}</h1>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
          </div>
        </div>

        {userProfile && (
          <div className="grid grid-cols-3 gap-4 mb-8">
            {[
              { label: "Nível", value: userProfile.nivel || "—", icon: Dumbbell },
              { label: "Dias/sem", value: userProfile.dias_semana ? `${userProfile.dias_semana}x` : "—", icon: Calendar },
              { label: "Foco", value: userProfile.foco || "—", icon: TrendingUp },
            ].map((s) => (
              <div key={s.label} className="rounded-xl bg-card border border-border p-4 text-center">
                <s.icon className="w-5 h-5 text-primary mx-auto mb-1" />
                <p className="font-display font-bold text-foreground text-sm">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>
        )}

        <div className="space-y-6">
          {userProfile?.foco && (
            <div className="rounded-xl bg-card border border-border p-6">
              <h3 className="font-display font-semibold text-foreground mb-3 flex items-center gap-2">
                <Target className="w-5 h-5 text-primary" /> Objetivos
              </h3>
              <div className="flex flex-wrap gap-2">
                {[userProfile.foco, userProfile.local_treino, userProfile.tempo_treino].filter(Boolean).map((tag: string) => (
                  <span key={tag} className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {userProfile?.problema_saude && userProfile?.descricao_problema && (
            <div className="rounded-xl bg-card border border-border p-6">
              <h3 className="font-display font-semibold text-foreground mb-3 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-warning" /> Limitações
              </h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2 rounded-lg bg-warning/5 p-3">
                  <AlertTriangle className="w-4 h-4 text-warning shrink-0" />
                  <p className="text-sm text-foreground">{userProfile.descricao_problema}</p>
                </div>
                {userProfile.limitacoes && (
                  <div className="flex items-center gap-2 rounded-lg bg-warning/5 p-3">
                    <AlertTriangle className="w-4 h-4 text-warning shrink-0" />
                    <p className="text-sm text-foreground">{userProfile.limitacoes}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="rounded-xl bg-card border border-border p-6">
            <h3 className="font-display font-semibold text-foreground mb-3 flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" /> Laudos Médicos
            </h3>
            <p className="text-sm text-muted-foreground mb-3">
              Envie laudos para que a IA adapte seu treino automaticamente.
            </p>
            <Button variant="hero-outline" className="w-full" onClick={() => navigate("/onboarding")}>
              <Settings className="w-4 h-4 mr-2" /> Atualizar Perfil
            </Button>
          </div>
        </div>

        <p className="text-xs text-muted-foreground text-center mt-8">
          ⚠️ Este app não substitui médico ou fisioterapeuta.
        </p>
      </main>
    </div>
  );
};

export default Profile;
