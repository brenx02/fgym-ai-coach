import Navbar from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Send, Brain, User } from "lucide-react";
import { useState } from "react";

interface Message {
  role: "user" | "ai";
  content: string;
}

const initialMessages: Message[] = [
  {
    role: "ai",
    content:
      "Olá! 👋 Eu sou sua IA Personal Trainer do Fgym. Posso te ajudar a montar treinos personalizados, adaptar exercícios por lesões, analisar seu progresso e muito mais.\n\nComo posso te ajudar hoje?",
  },
];

const AICoach = () => {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (!input.trim()) return;
    const userMsg: Message = { role: "user", content: input.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");

    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          content:
            "Entendi! Vou analisar suas informações e montar o melhor plano para você. 💪\n\n⚠️ Lembre-se: este app não substitui médico ou fisioterapeuta.",
        },
      ]);
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-6 pt-24 pb-4 max-w-2xl flex flex-col">
        <div className="mb-4">
          <h1 className="font-display text-2xl font-bold text-foreground flex items-center gap-2">
            <Brain className="w-6 h-6 text-primary" /> IA Coach
          </h1>
          <p className="text-sm text-muted-foreground">Converse com sua personal trainer inteligente</p>
        </div>

        <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-1">
          {messages.map((msg, i) => (
            <div key={i} className={`flex gap-3 ${msg.role === "user" ? "justify-end" : ""} animate-slide-up`}>
              {msg.role === "ai" && (
                <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center shrink-0">
                  <Brain className="w-4 h-4 text-primary" />
                </div>
              )}
              <div
                className={`rounded-xl p-4 max-w-[80%] ${
                  msg.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-card border border-border text-foreground"
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
              </div>
              {msg.role === "user" && (
                <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                  <User className="w-4 h-4 text-foreground" />
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="flex gap-2 pb-2">
          <div className="flex-1 relative">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Ex: Monte um treino de perna para quem tem condromalácia..."
              className="w-full rounded-xl bg-card border border-border px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
          <Button variant="hero" size="icon" className="h-12 w-12 rounded-xl shrink-0" onClick={handleSend}>
            <Send className="w-5 h-5" />
          </Button>
        </div>

        <div className="flex gap-2 flex-wrap pb-4">
          {["Montar treino personalizado", "Adaptar por lesão", "Analisar progresso", "Enviar laudo"].map((q) => (
            <button
              key={q}
              onClick={() => setInput(q)}
              className="text-xs rounded-full border border-primary/30 bg-primary/5 px-3 py-1.5 text-primary hover:bg-primary/10 transition-colors"
            >
              {q}
            </button>
          ))}
        </div>
      </main>
    </div>
  );
};

export default AICoach;
