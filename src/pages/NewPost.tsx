import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import Navbar from "@/components/layout/Navbar";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { SPORTS } from "@/lib/sports";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { ImagePlus, Loader2, MapPin, X } from "lucide-react";

const NIVEIS = ["Iniciante", "Intermediário", "Avançado"];

const PostSchema = z.object({
  sport_slug: z.string().min(1, "Escolha uma modalidade"),
  description: z.string().trim().min(3, "Descrição muito curta").max(2000, "Máx. 2000 caracteres"),
  nivel: z.string().optional(),
  localizacao: z.string().trim().max(120).optional(),
});

const NewPost = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [sportSlug, setSportSlug] = useState("");
  const [description, setDescription] = useState("");
  const [nivel, setNivel] = useState("");
  const [localizacao, setLocalizacao] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const onPickImage = (file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "Imagem grande", description: "Máximo 5MB.", variant: "destructive" });
      return;
    }
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const submit = async () => {
    if (!user) return;
    const parsed = PostSchema.safeParse({ sport_slug: sportSlug, description, nivel, localizacao });
    if (!parsed.success) {
      toast({
        title: "Verifique o formulário",
        description: parsed.error.issues[0].message,
        variant: "destructive",
      });
      return;
    }
    setSubmitting(true);
    try {
      let image_url: string | null = null;
      if (imageFile) {
        const ext = imageFile.name.split(".").pop() || "jpg";
        const path = `${user.id}/${crypto.randomUUID()}.${ext}`;
        const { error: upErr } = await supabase.storage.from("post-images").upload(path, imageFile, {
          cacheControl: "3600",
          upsert: false,
          contentType: imageFile.type,
        });
        if (upErr) throw upErr;
        const { data: pub } = supabase.storage.from("post-images").getPublicUrl(path);
        image_url = pub.publicUrl;
      }

      const { error } = await supabase.from("posts").insert({
        user_id: user.id,
        sport_slug: sportSlug,
        description: description.trim(),
        nivel: nivel || null,
        localizacao: localizacao.trim() || null,
        image_url,
      });
      if (error) throw error;

      toast({ title: "Post publicado!" });
      navigate(`/feed?sport=${sportSlug}`);
    } catch (err: any) {
      toast({ title: "Erro ao publicar", description: err.message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <Navbar />
      <main className="container mx-auto px-6 pt-24 pb-12 max-w-xl">
        <h1 className="font-display text-2xl font-bold text-foreground mb-6">Novo post</h1>

        <div className="space-y-5">
          {/* Sport */}
          <div>
            <Label className="mb-2 block">Modalidade</Label>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {SPORTS.map((s) => {
                const Icon = s.icon;
                const active = sportSlug === s.slug;
                return (
                  <button
                    key={s.slug}
                    type="button"
                    onClick={() => setSportSlug(s.slug)}
                    className={`flex flex-col items-center gap-1 rounded-xl border p-3 transition-all ${
                      active
                        ? "border-primary bg-primary/10 text-primary glow-primary-sm"
                        : "border-border bg-card text-muted-foreground hover:border-primary/40"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="text-[11px] font-medium">{s.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="desc" className="mb-2 block">Descrição</Label>
            <Textarea
              id="desc"
              placeholder="Conte como foi seu treino, dica, evento, condições do mar, rota..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={2000}
              rows={5}
            />
            <p className="text-xs text-muted-foreground mt-1 text-right">{description.length}/2000</p>
          </div>

          {/* Image */}
          <div>
            <Label className="mb-2 block">Imagem (opcional)</Label>
            {imagePreview ? (
              <div className="relative rounded-xl overflow-hidden border border-border">
                <img src={imagePreview} alt="" className="w-full max-h-80 object-cover" />
                <button
                  type="button"
                  onClick={() => {
                    setImageFile(null);
                    setImagePreview(null);
                  }}
                  className="absolute top-2 right-2 w-8 h-8 rounded-full bg-background/80 backdrop-blur flex items-center justify-center text-foreground hover:bg-background"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <label className="flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border p-6 cursor-pointer hover:border-primary/50 transition-colors text-muted-foreground">
                <ImagePlus className="w-5 h-5" />
                <span className="text-sm">Adicionar imagem (até 5MB)</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && onPickImage(e.target.files[0])}
                />
              </label>
            )}
          </div>

          {/* Nível */}
          <div>
            <Label className="mb-2 block">Nível (opcional)</Label>
            <div className="flex gap-2">
              {NIVEIS.map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setNivel(nivel === n ? "" : n)}
                  className={`rounded-full px-4 py-1.5 text-sm border transition-all ${
                    nivel === n
                      ? "bg-accent text-accent-foreground border-accent"
                      : "bg-card text-muted-foreground border-border hover:border-accent/50"
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          {/* Localização */}
          <div>
            <Label htmlFor="loc" className="mb-2 block flex items-center gap-1">
              <MapPin className="w-4 h-4" /> Localização (opcional)
            </Label>
            <Input
              id="loc"
              placeholder="Ex: Praia da Joaquina, Floripa"
              value={localizacao}
              onChange={(e) => setLocalizacao(e.target.value)}
              maxLength={120}
            />
          </div>

          <Button onClick={submit} disabled={submitting || !sportSlug || !description.trim()} className="w-full" size="lg">
            {submitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
            {submitting ? "Publicando..." : "Publicar"}
          </Button>
        </div>
      </main>
    </div>
  );
};

export default NewPost;
