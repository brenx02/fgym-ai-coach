import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { SPORTS, ALL_SPORT, getSport } from "@/lib/sports";
import { Heart, MessageCircle, MapPin, Plus } from "lucide-react";
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

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <Navbar />
      <main className="container mx-auto px-4 pt-20 pb-12 max-w-2xl">
        {/* Sport selector */}
        <div className="sticky top-16 z-30 -mx-4 px-4 py-3 bg-background/95 backdrop-blur border-b border-border mb-6">
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
                      ? "bg-primary text-primary-foreground border-primary glow-primary-sm"
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

        {loading && <p className="text-center text-muted-foreground py-12">Carregando...</p>}

        {!loading && posts.length === 0 && (
          <div className="text-center py-16 animate-fade-in">
            <p className="text-muted-foreground mb-4">Nada por aqui ainda.</p>
            <Link to="/post/new">
              <Button>
                <Plus className="w-4 h-4 mr-1" /> Criar primeiro post
              </Button>
            </Link>
          </div>
        )}

        <div className="space-y-4">
          {posts.map((post) => {
            const sport = getSport(post.sport_slug);
            const SportIcon = sport?.icon;
            return (
              <article key={post.id} className="rounded-2xl bg-card border border-border overflow-hidden animate-fade-in">
                <header className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/15 flex items-center justify-center text-primary font-display font-semibold">
                      {post.author_name?.charAt(0).toUpperCase() || "?"}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{post.author_name}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(post.created_at), { addSuffix: true, locale: ptBR })}
                      </p>
                    </div>
                  </div>
                  {sport && SportIcon && (
                    <span className="flex items-center gap-1 rounded-full bg-primary/10 text-primary px-2.5 py-1 text-xs font-medium">
                      <SportIcon className="w-3 h-3" />
                      {sport.name}
                    </span>
                  )}
                </header>

                {post.image_url && (
                  <img src={post.image_url} alt="" className="w-full max-h-[500px] object-cover" loading="lazy" />
                )}

                <div className="p-4 space-y-3">
                  <p className="text-sm text-foreground whitespace-pre-wrap">{post.description}</p>

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

                  <div className="flex items-center gap-4 pt-2 border-t border-border">
                    <button
                      onClick={() => toggleLike(post)}
                      className={`flex items-center gap-1.5 text-sm transition-colors ${
                        post.liked_by_me ? "text-primary" : "text-muted-foreground hover:text-primary"
                      }`}
                    >
                      <Heart className={`w-5 h-5 ${post.liked_by_me ? "fill-current" : ""}`} />
                      {post.likes_count}
                    </button>
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <MessageCircle className="w-5 h-5" />
                      {post.comments_count}
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </main>

      {/* Floating action button */}
      <Link
        to="/post/new"
        className="fixed bottom-20 md:bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center glow-primary text-primary-foreground hover:scale-105 transition-transform"
        aria-label="Criar post"
      >
        <Plus className="w-6 h-6" />
      </Link>
    </div>
  );
};

export default Feed;
