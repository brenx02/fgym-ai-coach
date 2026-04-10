import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { ArrowRight, ArrowLeft, Upload } from "lucide-react";
import logo from "@/assets/logo.png";

const STEPS = [
  "experiencia",
  "dados_pessoais",
  "nivel",
  "saude",
  "foco",
  "treino",
  "preferencias",
] as const;

const Onboarding = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);

  const [data, setData] = useState({
    experiencia_academia: "",
    idade: "",
    sexo: "",
    nivel: "",
    problema_saude: false,
    descricao_problema: "",
    possui_laudo: false,
    laudo_file: null as File | null,
    foco: "",
    dias_semana: "",
    tempo_treino: "",
    local_treino: "",
    limitacoes: "",
    exercicios_evitar: "",
  });

  const update = (key: string, value: any) => setData((prev) => ({ ...prev, [key]: value }));

  const canNext = () => {
    switch (STEPS[step]) {
      case "experiencia": return !!data.experiencia_academia;
      case "dados_pessoais": return !!data.idade && !!data.sexo;
      case "nivel": return !!data.nivel;
      case "saude": return true;
      case "foco": return !!data.foco;
      case "treino": return !!data.dias_semana && !!data.tempo_treino && !!data.local_treino;
      case "preferencias": return true;
      default: return true;
    }
  };

  const handleFinish = async () => {
    if (!user) return;
    setSaving(true);
    try {
      let laudo_url = null;
      if (data.laudo_file) {
        const ext = data.laudo_file.name.split(".").pop();
        const path = `${user.id}/laudo_${Date.now()}.${ext}`;
        const { error: uploadError } = await supabase.storage.from("laudos").upload(path, data.laudo_file);
        if (!uploadError) laudo_url = path;
      }

      const { error } = await supabase.from("user_profiles").update({
        experiencia_academia: data.experiencia_academia,
        idade: parseInt(data.idade) || null,
        sexo: data.sexo,
        nivel: data.nivel,
        problema_saude: data.problema_saude,
        descricao_problema: data.descricao_problema || null,
        possui_laudo: data.possui_laudo,
        laudo_url,
        foco: data.foco,
        dias_semana: parseInt(data.dias_semana) || null,
        tempo_treino: data.tempo_treino,
        local_treino: data.local_treino,
        limitacoes: data.limitacoes || null,
        exercicios_evitar: data.exercicios_evitar || null,
        onboarding_completed: true,
      }).eq("user_id", user.id);

      if (error) throw error;
      toast({ title: "Perfil salvo!", description: "Bem-vindo ao Fgym 💪" });
      navigate("/dashboard");
    } catch (err: any) {
      toast({ title: "Erro ao salvar", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const renderStep = () => {
    switch (STEPS[step]) {
      case "experiencia":
        return (
          <div className="space-y-4">
            <h2 className="font-display text-xl font-semibold text-foreground">Você já frequentou academia?</h2>
            <RadioGroup value={data.experiencia_academia} onValueChange={(v) => update("experiencia_academia", v)}>
              {["Nunca", "Já frequentei", "Frequento atualmente"].map((opt) => (
                <div key={opt} className="flex items-center gap-3 rounded-lg bg-secondary/50 p-3">
                  <RadioGroupItem value={opt} id={opt} />
                  <Label htmlFor={opt} className="cursor-pointer text-foreground">{opt}</Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        );

      case "dados_pessoais":
        return (
          <div className="space-y-4">
            <h2 className="font-display text-xl font-semibold text-foreground">Seus dados</h2>
            <div>
              <Label>Idade</Label>
              <Input type="number" value={data.idade} onChange={(e) => update("idade", e.target.value)} placeholder="Ex: 28" className="mt-1" />
            </div>
            <div>
              <Label>Sexo</Label>
              <RadioGroup value={data.sexo} onValueChange={(v) => update("sexo", v)} className="mt-1">
                {["Masculino", "Feminino", "Outro"].map((opt) => (
                  <div key={opt} className="flex items-center gap-3 rounded-lg bg-secondary/50 p-3">
                    <RadioGroupItem value={opt} id={`sexo-${opt}`} />
                    <Label htmlFor={`sexo-${opt}`} className="cursor-pointer text-foreground">{opt}</Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          </div>
        );

      case "nivel":
        return (
          <div className="space-y-4">
            <h2 className="font-display text-xl font-semibold text-foreground">Qual seu nível?</h2>
            <RadioGroup value={data.nivel} onValueChange={(v) => update("nivel", v)}>
              {[
                { v: "Iniciante", desc: "Pouca ou nenhuma experiência" },
                { v: "Intermediário", desc: "Treina há alguns meses" },
                { v: "Avançado", desc: "Treina há mais de 1 ano" },
              ].map((opt) => (
                <div key={opt.v} className="flex items-center gap-3 rounded-lg bg-secondary/50 p-3">
                  <RadioGroupItem value={opt.v} id={`nivel-${opt.v}`} />
                  <div>
                    <Label htmlFor={`nivel-${opt.v}`} className="cursor-pointer text-foreground font-medium">{opt.v}</Label>
                    <p className="text-xs text-muted-foreground">{opt.desc}</p>
                  </div>
                </div>
              ))}
            </RadioGroup>
          </div>
        );

      case "saude":
        return (
          <div className="space-y-4">
            <h2 className="font-display text-xl font-semibold text-foreground">Saúde e limitações</h2>
            <div>
              <Label>Você tem algum problema de saúde?</Label>
              <RadioGroup value={data.problema_saude ? "sim" : "nao"} onValueChange={(v) => update("problema_saude", v === "sim")} className="mt-1">
                <div className="flex items-center gap-3 rounded-lg bg-secondary/50 p-3">
                  <RadioGroupItem value="sim" id="saude-sim" />
                  <Label htmlFor="saude-sim" className="cursor-pointer text-foreground">Sim</Label>
                </div>
                <div className="flex items-center gap-3 rounded-lg bg-secondary/50 p-3">
                  <RadioGroupItem value="nao" id="saude-nao" />
                  <Label htmlFor="saude-nao" className="cursor-pointer text-foreground">Não</Label>
                </div>
              </RadioGroup>
            </div>
            {data.problema_saude && (
              <>
                <div>
                  <Label>Qual problema?</Label>
                  <Textarea value={data.descricao_problema} onChange={(e) => update("descricao_problema", e.target.value)} placeholder="Ex: condromalácia patelar, dor lombar..." className="mt-1" />
                </div>
                <div>
                  <Label>Possui laudo médico?</Label>
                  <RadioGroup value={data.possui_laudo ? "sim" : "nao"} onValueChange={(v) => update("possui_laudo", v === "sim")} className="mt-1">
                    <div className="flex items-center gap-3 rounded-lg bg-secondary/50 p-3">
                      <RadioGroupItem value="sim" id="laudo-sim" />
                      <Label htmlFor="laudo-sim" className="cursor-pointer text-foreground">Sim</Label>
                    </div>
                    <div className="flex items-center gap-3 rounded-lg bg-secondary/50 p-3">
                      <RadioGroupItem value="nao" id="laudo-nao" />
                      <Label htmlFor="laudo-nao" className="cursor-pointer text-foreground">Não</Label>
                    </div>
                  </RadioGroup>
                </div>
                {data.possui_laudo && (
                  <div>
                    <Label>Enviar laudo (opcional)</Label>
                    <label className="mt-1 flex items-center gap-2 rounded-lg bg-secondary/50 p-3 cursor-pointer hover:bg-secondary/70 transition-colors">
                      <Upload className="w-4 h-4 text-primary" />
                      <span className="text-sm text-foreground">{data.laudo_file ? data.laudo_file.name : "Selecionar arquivo (PDF/Imagem)"}</span>
                      <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        className="hidden"
                        onChange={(e) => update("laudo_file", e.target.files?.[0] || null)}
                      />
                    </label>
                  </div>
                )}
              </>
            )}
          </div>
        );

      case "foco":
        return (
          <div className="space-y-4">
            <h2 className="font-display text-xl font-semibold text-foreground">Qual seu foco principal?</h2>
            <RadioGroup value={data.foco} onValueChange={(v) => update("foco", v)}>
              {["Academia", "Natação", "Alongamento", "Emagrecimento", "Fortalecimento muscular", "Reabilitação", "Mobilidade"].map((opt) => (
                <div key={opt} className="flex items-center gap-3 rounded-lg bg-secondary/50 p-3">
                  <RadioGroupItem value={opt} id={`foco-${opt}`} />
                  <Label htmlFor={`foco-${opt}`} className="cursor-pointer text-foreground">{opt}</Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        );

      case "treino":
        return (
          <div className="space-y-4">
            <h2 className="font-display text-xl font-semibold text-foreground">Sobre seu treino</h2>
            <div>
              <Label>Quantos dias por semana pode treinar?</Label>
              <RadioGroup value={data.dias_semana} onValueChange={(v) => update("dias_semana", v)} className="mt-1 grid grid-cols-3 gap-2">
                {["2", "3", "4", "5", "6", "7"].map((d) => (
                  <div key={d} className="flex items-center gap-2 rounded-lg bg-secondary/50 p-3">
                    <RadioGroupItem value={d} id={`dias-${d}`} />
                    <Label htmlFor={`dias-${d}`} className="cursor-pointer text-foreground">{d}x</Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
            <div>
              <Label>Tempo disponível por treino</Label>
              <RadioGroup value={data.tempo_treino} onValueChange={(v) => update("tempo_treino", v)} className="mt-1">
                {["30 min", "45 min", "1 hora", "1h30", "2 horas"].map((t) => (
                  <div key={t} className="flex items-center gap-3 rounded-lg bg-secondary/50 p-3">
                    <RadioGroupItem value={t} id={`tempo-${t}`} />
                    <Label htmlFor={`tempo-${t}`} className="cursor-pointer text-foreground">{t}</Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
            <div>
              <Label>Onde treina?</Label>
              <RadioGroup value={data.local_treino} onValueChange={(v) => update("local_treino", v)} className="mt-1">
                {["Academia", "Casa", "Ar livre", "Misto"].map((l) => (
                  <div key={l} className="flex items-center gap-3 rounded-lg bg-secondary/50 p-3">
                    <RadioGroupItem value={l} id={`local-${l}`} />
                    <Label htmlFor={`local-${l}`} className="cursor-pointer text-foreground">{l}</Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          </div>
        );

      case "preferencias":
        return (
          <div className="space-y-4">
            <h2 className="font-display text-xl font-semibold text-foreground">Preferências (opcional)</h2>
            <div>
              <Label>Possui limitações físicas?</Label>
              <Textarea value={data.limitacoes} onChange={(e) => update("limitacoes", e.target.value)} placeholder="Ex: não consigo fazer agachamento profundo..." className="mt-1" />
            </div>
            <div>
              <Label>Exercícios que não gosta?</Label>
              <Textarea value={data.exercicios_evitar} onChange={(e) => update("exercicios_evitar", e.target.value)} placeholder="Ex: burpee, leg press..." className="mt-1" />
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-md animate-slide-up">
        <div className="text-center mb-6">
          <img src={logo} alt="Fgym" className="w-12 h-12 mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">Passo {step + 1} de {STEPS.length}</p>
          <div className="w-full h-1 bg-secondary rounded-full mt-2">
            <div className="h-1 bg-primary rounded-full transition-all" style={{ width: `${((step + 1) / STEPS.length) * 100}%` }} />
          </div>
        </div>

        <div className="rounded-xl bg-card border border-border p-6">
          {renderStep()}

          <div className="flex gap-3 mt-6">
            {step > 0 && (
              <Button variant="ghost" onClick={() => setStep((s) => s - 1)} className="gap-1">
                <ArrowLeft className="w-4 h-4" /> Voltar
              </Button>
            )}
            <div className="flex-1" />
            {step < STEPS.length - 1 ? (
              <Button variant="hero" onClick={() => setStep((s) => s + 1)} disabled={!canNext()} className="gap-1">
                Próximo <ArrowRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button variant="hero" onClick={handleFinish} disabled={saving} className="gap-1">
                {saving ? "Salvando..." : "Concluir 🚀"}
              </Button>
            )}
          </div>
        </div>

        <p className="text-xs text-muted-foreground text-center mt-4">
          ⚠️ Este app não substitui médico ou fisioterapeuta.
        </p>
      </div>
    </div>
  );
};

export default Onboarding;
