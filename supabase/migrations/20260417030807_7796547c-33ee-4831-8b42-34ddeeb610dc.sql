-- 1. Sports catalog
CREATE TABLE public.sports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  icon TEXT,
  description TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.sports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Sports are viewable by everyone"
ON public.sports FOR SELECT
USING (active = true);

INSERT INTO public.sports (slug, name, icon, description, display_order) VALUES
  ('jiu-jitsu', 'Jiu-jitsu', 'Swords', 'Arte suave, técnica e estratégia no tatame', 1),
  ('surf', 'Surf', 'Waves', 'Conexão com o mar e leitura de ondas', 2),
  ('corrida', 'Corrida', 'Footprints', 'Resistência, ritmo e superação', 3),
  ('boxe', 'Boxe', 'Hand', 'Disciplina, reflexo e potência', 4),
  ('academia', 'Academia', 'Dumbbell', 'Musculação e hipertrofia', 5),
  ('funcional', 'Funcional', 'Activity', 'Movimentos integrados e mobilidade', 6),
  ('outdoor', 'Ao ar livre', 'Mountain', 'Treinos em parques, trilhas e praias', 7);

-- 2. Extend user_profiles for multi-sport
ALTER TABLE public.user_profiles
  ADD COLUMN IF NOT EXISTS modalidades TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS modalidade_principal TEXT,
  ADD COLUMN IF NOT EXISTS objetivo TEXT,
  ADD COLUMN IF NOT EXISTS bio TEXT,
  ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- 3. Posts
CREATE TABLE public.posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  sport_slug TEXT NOT NULL REFERENCES public.sports(slug),
  post_type TEXT NOT NULL DEFAULT 'treino',
  nivel TEXT,
  localizacao TEXT,
  image_url TEXT,
  description TEXT NOT NULL,
  likes_count INTEGER NOT NULL DEFAULT 0,
  comments_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_posts_sport ON public.posts(sport_slug, created_at DESC);
CREATE INDEX idx_posts_user ON public.posts(user_id, created_at DESC);

ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Posts are viewable by authenticated users"
ON public.posts FOR SELECT TO authenticated
USING (true);

CREATE POLICY "Users can create own posts"
ON public.posts FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own posts"
ON public.posts FOR UPDATE TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own posts"
ON public.posts FOR DELETE TO authenticated
USING (auth.uid() = user_id);

CREATE TRIGGER update_posts_updated_at
BEFORE UPDATE ON public.posts
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 4. Likes
CREATE TABLE public.post_likes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(post_id, user_id)
);

ALTER TABLE public.post_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Likes viewable by authenticated"
ON public.post_likes FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can like"
ON public.post_likes FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unlike"
ON public.post_likes FOR DELETE TO authenticated
USING (auth.uid() = user_id);

-- 5. Comments
CREATE TABLE public.post_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  content TEXT NOT NULL CHECK (char_length(content) BETWEEN 1 AND 1000),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_comments_post ON public.post_comments(post_id, created_at);

ALTER TABLE public.post_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Comments viewable by authenticated"
ON public.post_comments FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can comment"
ON public.post_comments FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own comment"
ON public.post_comments FOR DELETE TO authenticated
USING (auth.uid() = user_id);

-- 6. Triggers para counters
CREATE OR REPLACE FUNCTION public.bump_post_likes()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.posts SET likes_count = likes_count + 1 WHERE id = NEW.post_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.posts SET likes_count = GREATEST(likes_count - 1, 0) WHERE id = OLD.post_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END $$;

CREATE TRIGGER trg_post_likes_count
AFTER INSERT OR DELETE ON public.post_likes
FOR EACH ROW EXECUTE FUNCTION public.bump_post_likes();

CREATE OR REPLACE FUNCTION public.bump_post_comments()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.posts SET comments_count = comments_count + 1 WHERE id = NEW.post_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.posts SET comments_count = GREATEST(comments_count - 1, 0) WHERE id = OLD.post_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END $$;

CREATE TRIGGER trg_post_comments_count
AFTER INSERT OR DELETE ON public.post_comments
FOR EACH ROW EXECUTE FUNCTION public.bump_post_comments();

-- 7. Storage para imagens de post (público)
INSERT INTO storage.buckets (id, name, public) VALUES ('post-images', 'post-images', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Post images are publicly viewable"
ON storage.objects FOR SELECT
USING (bucket_id = 'post-images');

CREATE POLICY "Users upload own post images"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'post-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users delete own post images"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'post-images' AND auth.uid()::text = (storage.foldername(name))[1]);