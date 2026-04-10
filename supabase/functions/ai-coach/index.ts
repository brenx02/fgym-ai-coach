import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.102.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_PUBLISHABLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) throw new Error("Unauthorized");

    const { messages } = await req.json();

    // Fetch user profile for context
    const { data: profile } = await supabase
      .from("user_profiles")
      .select("*")
      .eq("user_id", user.id)
      .single();

    const { data: nameData } = await supabase
      .from("profiles")
      .select("name")
      .eq("user_id", user.id)
      .single();

    let userContext = "";
    if (profile) {
      const parts = [];
      if (nameData?.name) parts.push(`Nome: ${nameData.name}`);
      if (profile.idade) parts.push(`Idade: ${profile.idade} anos`);
      if (profile.sexo) parts.push(`Sexo: ${profile.sexo}`);
      if (profile.nivel) parts.push(`Nível: ${profile.nivel}`);
      if (profile.experiencia_academia) parts.push(`Experiência: ${profile.experiencia_academia}`);
      if (profile.foco) parts.push(`Foco: ${profile.foco}`);
      if (profile.dias_semana) parts.push(`Dias por semana: ${profile.dias_semana}`);
      if (profile.tempo_treino) parts.push(`Tempo por treino: ${profile.tempo_treino}`);
      if (profile.local_treino) parts.push(`Local: ${profile.local_treino}`);
      if (profile.problema_saude && profile.descricao_problema) parts.push(`Problema de saúde: ${profile.descricao_problema}`);
      if (profile.limitacoes) parts.push(`Limitações: ${profile.limitacoes}`);
      if (profile.exercicios_evitar) parts.push(`Exercícios a evitar: ${profile.exercicios_evitar}`);
      userContext = parts.join("\n");
    }

    const systemPrompt = `Você é o Personal Trainer IA do Fgym. Seu nome é Coach Fgym.

DADOS DO USUÁRIO:
${userContext || "Nenhum dado cadastrado ainda."}

REGRAS:
- Fale em português do Brasil, de forma natural e amigável
- Use emojis com moderação (💪🏋️‍♂️🔥)
- Monte treinos PERSONALIZADOS baseados nos dados do usuário acima
- NUNCA use respostas fixas ou genéricas
- Se o usuário mencionar dor ou lesão, ADAPTE o treino imediatamente
- Se o usuário pedir para trocar exercício, substitua mantendo o objetivo
- Gere treinos A/B/C quando solicitado, com exercícios, séries, reps e descanso
- Explique a execução de exercícios quando perguntado
- Sugira progressão de carga quando apropriado
- Considere o nível, limitações e foco do usuário em TODAS as respostas
- Se o usuário não tiver dados cadastrados, pergunte o necessário antes de montar treino
- SEMPRE inclua ao final de recomendações: "⚠️ Lembre-se: este app não substitui médico ou fisioterapeuta."
- Formate treinos de forma clara usando markdown (negrito, listas)`;

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Muitas requisições. Aguarde um momento." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Créditos de IA esgotados." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "Erro na IA" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("ai-coach error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
