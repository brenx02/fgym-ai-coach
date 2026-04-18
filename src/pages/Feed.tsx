import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { SPORTS, ALL_SPORT, getSport } from "@/lib/sports";
import { Heart, MessageCircle, MapPin, Plus, TrendingUp, Sparkles, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Post {
  id: string;
  user_id: string;
  sport_slug: string;
  nivel: string | null;
  localizacao: string | null;
  image_url: string | null;
  description: string;
  likes_count: number;
  comments_count: number;
  created_at: string;
  author_name?: string;
  liked_by_me?: boolean;
}

const Feed = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeSlug = searchParams.get("sport") || "todos";
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  const loadPosts = async () => {
    setLoading(true);
    let q = supabase
      .from("posts")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);
    if (activeSlug !== "todos") q = q.eq("sport_slug", activeSlug);
    const { data: postsData, error } = await q;
    if (error) {
      toast({ title: "Erro ao carregar feed", description: error.message, variant: "destructive" });
      setLoading(false);
      return;
    }
    const ids = (postsData || []).map((p) => p.user_id);
    const postIds = (postsData || []).map((p) => p.id);
    const [{ data: profs }, { data: myLikes }] = await Promise.all([
      ids.length
        ? supabase.from("profiles").select("user_id, name").in("user_id", ids)
        : Promise.resolve({ data: [] as any[] }),
      user && postIds.length
        ? supabase.from("post_likes").select("post_id").eq("user_id", user.id).in("post_id", postIds)
        : Promise.resolve({ data: [] as any[] }),
    ]);
    const nameMap = new Map((profs || []).map((p: any) => [p.user_id, p.name]));
    const likedSet = new Set((myLikes || []).map((l: any) => l.post_id));
    setPosts(
      (postsData || []).map((p) => ({
        ...p,
        author_name: nameMap.get(p.user_id) || "Atleta",
        liked_by_me: likedSet.has(p.id),
      }))
    );
    setLoading(false);
  };

  useEffect(() => {
    loadPosts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSlug]);

  const toggleLike = async (post: Post) => {
    if (!user) return;
    if (post.liked_by_me) {
      setPosts((prev) =>
        prev.map((p) => (p.id === post.id ? { ...p, liked_by_me: false, likes_count: p.likes_count - 1 } : p))
      );
      await supabase.from("post_likes").delete().eq("post_id", post.id).eq("user_id", user.id);
    } else {
      setPosts((prev) =>
        prev.map((p) => (p.id === post.id ? { ...p, liked_by_me: true, likes_count: p.likes_count + 1 } : p))
      );
      await supabase.from("post_likes").insert({ post_id: post.id, user_id: user.id });
    }
  };

  const tabs = [ALL_SPORT, ...SPORTS];
  const activeSport = getSport(activeSlug);

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <Navbar />

      <main className="container mx-auto px-4 pt-20 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-[260px_minmax(0,1fr)_280px] gap-8 max-w-7xl mx-auto">
          {/* Left sidebar — Modalidades (desktop) */}
          <aside className="hidden lg:block">
            <div className="sticky top-20 space-y-6">
              <div>
                <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-3">
                  Modalidades
                </h2>
                <nav className="space-y-1">
                  {tabs.map((t) => {
                    const Icon = t.icon;
                    const active = activeSlug === t.slug;
                    return (
                      <button
                        key={t.slug}
                        onClick={() => setSearchParams(t.slug === "todos" ? {} : { sport: t.slug })}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                          active
                            ? "bg-primary/15 text-primary"
                            : "text-muted-foreground hover:bg-card hover:text-foreground"
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        {t.name}
                      </button>
                    );
                  })}
                </nav>
              </div>

              <Link to="/post/new" className="block">
                <Button className="w-full gap-2" size="lg">
                  <Plus className="w-4 h-4" /> Novo Post
                </Button>
              </Link>
            </div>
          </aside>

          {/* Center column — Feed */}
          <section className="max-w-2xl w-full mx-auto lg:mx-0">
            {/* Mobile sport selector */}
            <div className="lg:hidden sticky top-16 z-30 -mx-4 px-4 py-3 bg-background/95 backdrop-blur border-b border-border mb-6">
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                {tabs.map((t) => {
                  const Icon = t.icon;
                  const active = activeSlug === t.slug;
                  return (
                    <button
                      key={t.slug}
                      onClick={() => setSearchParams(t.slug === "todos" ? {} : { sport: t.slug })}
                      className={`shrink-0 flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-all border ${
                        active
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-card text-muted-foreground border-border hover:border-primary/50"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {t.name}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Section header */}
            <header className="hidden lg:flex items-center justify-between mb-6">
              <div>
                <h1 className="font-display text-2xl font-bold text-foreground">
                  {activeSport ? activeSport.name : "Feed Geral"}
                </h1>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {activeSport ? activeSport.description : "O que a comunidade está treinando agora"}
                </p>
              </div>
            </header>

            {loading && (
              <div className="space-y-4">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="rounded-2xl bg-card border border-border p-4 animate-pulse">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-full bg-muted" />
                      <div className="flex-1 space-y-2">
                        <div className="h-3 w-32 bg-muted rounded" />
                        <div className="h-2 w-20 bg-muted rounded" />
                      </div>
                    </div>
                    <div className="h-48 bg-muted rounded-lg" />
                  </div>
                ))}
              </div>
            )}

            {!loading && posts.length === 0 && (
              <div className="text-center py-16 rounded-2xl border border-dashed border-border animate-fade-in">
                <Sparkles className="w-10 h-10 text-primary mx-auto mb-3" />
                <p className="font-display text-lg font-semibold text-foreground mb-1">Sem posts por aqui</p>
                <p className="text-sm text-muted-foreground mb-4">Seja o primeiro a compartilhar um treino.</p>
                <Link to="/post/new">
                  <Button>
                    <Plus className="w-4 h-4 mr-1" /> Criar post
                  </Button>
                </Link>
              </div>
            )}

            <div className="space-y-4">
              {posts.map((post) => {
                const sport = getSport(post.sport_slug);
                const SportIcon = sport?.icon;
                return (
                  <article
                    key={post.id}
                    className="rounded-2xl bg-card border border-border overflow-hidden hover:border-primary/30 transition-colors animate-fade-in"
                  >
                    <header className="flex items-center justify-between p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground font-display font-semibold text-sm">
                          {post.author_name?.charAt(0).toUpperCase() || "?"}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-foreground leading-tight">{post.author_name}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(post.created_at), { addSuffix: true, locale: ptBR })}
                          </p>
                        </div>
                      </div>
                      {sport && SportIcon && (
                        <button
                          onClick={() => setSearchParams({ sport: sport.slug })}
                          className="flex items-center gap-1 rounded-full bg-primary/10 text-primary px-2.5 py-1 text-xs font-medium hover:bg-primary/20 transition-colors"
                        >
                          <SportIcon className="w-3 h-3" />
                          {sport.name}
                        </button>
                      )}
                    </header>

                    {post.image_url && (
                      <img
                        src={post.image_url}
                        alt=""
                        className="w-full max-h-[560px] object-cover"
                        loading="lazy"
                      />
                    )}

                    <div className="p-4 space-y-3">
                      <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">{post.description}</p>

                      <div className="flex flex-wrap gap-2">
                        {post.nivel && (
                          <span className="rounded-full bg-accent/15 text-accent px-2.5 py-0.5 text-xs font-medium">
                            {post.nivel}
                          </span>
                        )}
                        {post.localizacao && (
                          <span className="flex items-center gap-1 rounded-full bg-muted text-muted-foreground px-2.5 py-0.5 text-xs">
                            <MapPin className="w-3 h-3" /> {post.localizacao}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-5 pt-3 border-t border-border">
                        <button
                          onClick={() => toggleLike(post)}
                          className={`flex items-center gap-1.5 text-sm transition-colors ${
                            post.liked_by_me ? "text-primary" : "text-muted-foreground hover:text-primary"
                          }`}
                        >
                          <Heart className={`w-5 h-5 ${post.liked_by_me ? "fill-current" : ""}`} />
                          <span className="font-medium">{post.likes_count}</span>
                        </button>
                        <button className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
                          <MessageCircle className="w-5 h-5" />
                          <span className="font-medium">{post.comments_count}</span>
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>

          {/* Right sidebar — Em alta (desktop) */}
          <aside className="hidden lg:block">
            <div className="sticky top-20 space-y-6">
              <div className="rounded-2xl bg-card border border-border p-5">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp className="w-4 h-4 text-primary" />
                  <h3 className="font-display font-semibold text-foreground">Em alta</h3>
                </div>
                <div className="space-y-3">
                  {SPORTS.slice(0, 5).map((s) => {
                    const Icon = s.icon;
                    return (
                      <button
                        key={s.slug}
                        onClick={() => setSearchParams({ sport: s.slug })}
                        className="w-full flex items-center gap-3 text-left group"
                      >
                        <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary/20 transition-colors">
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">#{s.name.toLowerCase()}</p>
                          <p className="text-xs text-muted-foreground truncate">{s.description}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="rounded-2xl bg-gradient-to-br from-primary/15 to-accent/10 border border-primary/20 p-5">
                <Users className="w-5 h-5 text-primary mb-2" />
                <h3 className="font-display font-semibold text-foreground mb-1">Comunidade Fgym</h3>
                <p className="text-xs text-muted-foreground mb-3">
                  Conecte-se com atletas, profissionais e apaixonados pelo seu esporte.
                </p>
                <Link to="/explore">
                  <Button variant="outline" size="sm" className="w-full">
                    Explorar esportes
                  </Button>
                </Link>
              </div>

              <p className="text-[10px] text-muted-foreground text-center px-3 leading-relaxed">
                ⚠️ Este app não substitui médico ou fisioterapeuta.
              </p>
            </div>
          </aside>
        </div>
      </main>

      {/* Floating action button (mobile) */}
      <Link
        to="/post/new"
        className="lg:hidden fixed bottom-20 right-6 z-40 w-14 h-14 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/30 text-primary-foreground hover:scale-105 transition-transform"
        aria-label="Criar post"
      >
        <Plus className="w-6 h-6" />
      </Link>
    </div>
  );
};

export default Feed;
