import { Shield, MessageCircle, Users, FileText, Activity, Video } from "lucide-react";

const features = [
  { icon: Shield, title: "Adaptação por Lesões", desc: "Informe suas limitações e a IA adapta automaticamente seu treino, removendo exercícios perigosos." },
  { icon: MessageCircle, title: "WhatsApp Integrado", desc: "Receba lembretes, registre treinos e tire dúvidas direto pelo WhatsApp." },
  { icon: Users, title: "Ranking Social", desc: "Compita com amigos em rankings semanais e mensais estilo Gym Rats." },
  { icon: FileText, title: "Laudos Médicos", desc: "Envie laudos e a IA interpreta e adapta seu treino automaticamente." },
  { icon: Activity, title: "Progresso Completo", desc: "Gráficos de evolução, carga, frequência e consistência." },
  { icon: Video, title: "Análise de Vídeo", desc: "Em breve: envie vídeos e a IA corrige sua execução." },
];

const FeaturesSection = () => (
  <section className="py-24 relative">
    <div className="container mx-auto px-6">
      <div className="text-center mb-16">
        <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
          Tudo que você precisa para <span className="text-primary">evoluir</span>
        </h2>
        <p className="text-muted-foreground max-w-xl mx-auto">
          Funcionalidades projetadas para maximizar seus resultados com segurança e inteligência.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((f, i) => (
          <div
            key={f.title}
            className="group rounded-xl bg-card border border-border p-6 hover:border-primary/40 hover:glow-primary-sm transition-all duration-500"
            style={{ animationDelay: `${i * 100}ms` }}
          >
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
              <f.icon className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-display font-semibold text-foreground mb-2">{f.title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default FeaturesSection;
