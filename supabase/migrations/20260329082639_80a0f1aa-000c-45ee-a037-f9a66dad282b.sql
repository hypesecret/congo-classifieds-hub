
-- Categories table
CREATE TABLE public.categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  icon text NOT NULL,
  color text,
  parent_id uuid REFERENCES public.categories(id),
  sort_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  listings_count integer DEFAULT 0
);
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Categories are viewable by everyone" ON public.categories FOR SELECT TO public USING (true);

-- Listings table
CREATE TABLE public.listings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  price bigint,
  price_negotiable boolean DEFAULT false,
  is_free boolean DEFAULT false,
  category_id uuid REFERENCES public.categories(id),
  subcategory_id uuid REFERENCES public.categories(id),
  city text NOT NULL DEFAULT 'Brazzaville',
  neighborhood text,
  images text[] DEFAULT '{}',
  cover_image text,
  status text DEFAULT 'pending_moderation',
  rejection_reason text,
  is_sponsored boolean DEFAULT false,
  sponsor_level text,
  sponsor_expires_at timestamptz,
  views_count integer DEFAULT 0,
  contact_count integer DEFAULT 0,
  expires_at timestamptz DEFAULT now() + interval '60 days',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  specs jsonb DEFAULT '{}'
);
ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Active listings are viewable by everyone" ON public.listings FOR SELECT TO public USING (status = 'active' OR user_id = auth.uid());
CREATE POLICY "Users can insert their own listings" ON public.listings FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own listings" ON public.listings FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own listings" ON public.listings FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Trigger for updated_at on listings
CREATE TRIGGER update_listings_updated_at BEFORE UPDATE ON public.listings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Favorites table
CREATE TABLE public.favorites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  listing_id uuid REFERENCES public.listings(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, listing_id)
);
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own favorites" ON public.favorites FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own favorites" ON public.favorites FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own favorites" ON public.favorites FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Messages table
CREATE TABLE public.messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL,
  sender_id uuid NOT NULL,
  receiver_id uuid NOT NULL,
  listing_id uuid REFERENCES public.listings(id) ON DELETE SET NULL,
  content text NOT NULL,
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own messages" ON public.messages FOR SELECT TO authenticated USING (auth.uid() = sender_id OR auth.uid() = receiver_id);
CREATE POLICY "Users can send messages" ON public.messages FOR INSERT TO authenticated WITH CHECK (auth.uid() = sender_id);
CREATE POLICY "Users can mark messages as read" ON public.messages FOR UPDATE TO authenticated USING (auth.uid() = receiver_id);

-- Enable realtime for messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;

-- Reports table
CREATE TABLE public.reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id uuid NOT NULL,
  listing_id uuid REFERENCES public.listings(id) ON DELETE CASCADE NOT NULL,
  reason text NOT NULL,
  details text,
  status text DEFAULT 'pending',
  reviewed_by uuid,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can insert reports" ON public.reports FOR INSERT TO authenticated WITH CHECK (auth.uid() = reporter_id);
CREATE POLICY "Users can view their own reports" ON public.reports FOR SELECT TO authenticated USING (auth.uid() = reporter_id);

-- Transactions table
CREATE TABLE public.transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  listing_id uuid REFERENCES public.listings(id) ON DELETE SET NULL,
  amount bigint NOT NULL,
  currency text DEFAULT 'FCFA',
  type text,
  status text DEFAULT 'initiated',
  provider text,
  provider_reference text,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own transactions" ON public.transactions FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own transactions" ON public.transactions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Create storage bucket for listing images
INSERT INTO storage.buckets (id, name, public) VALUES ('listing-images', 'listing-images', true) ON CONFLICT DO NOTHING;
CREATE POLICY "Anyone can view listing images" ON storage.objects FOR SELECT TO public USING (bucket_id = 'listing-images');
CREATE POLICY "Authenticated users can upload listing images" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'listing-images');
CREATE POLICY "Users can update their own listing images" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'listing-images');
CREATE POLICY "Users can delete their own listing images" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'listing-images');

-- Seed categories
INSERT INTO public.categories (name, slug, icon, color, sort_order, listings_count) VALUES
  ('Immobilier', 'immobilier', 'Home', '#E8F5ED', 1, 3420),
  ('Véhicules', 'vehicules', 'Car', '#FFF3E0', 2, 1850),
  ('Emploi', 'emploi', 'Briefcase', '#E3F2FD', 3, 2100),
  ('Services', 'services', 'Wrench', '#F3E5F5', 4, 980),
  ('Électronique', 'electronique', 'Smartphone', '#E0F7FA', 5, 1540),
  ('Mode & Beauté', 'mode-beaute', 'Shirt', '#FCE4EC', 6, 870),
  ('Maison & Jardin', 'maison-jardin', 'Sofa', '#F1F8E9', 7, 620),
  ('Loisirs', 'loisirs', 'Music', '#FFF8E1', 8, 340),
  ('Agriculture', 'agriculture', 'Leaf', '#E8F5E9', 9, 210),
  ('Animaux', 'animaux', 'PawPrint', '#FBE9E7', 10, 180),
  ('Matériaux BTP', 'materiaux-btp', 'Building', '#ECEFF1', 11, 290),
  ('Autres', 'autres', 'Grid3X3', '#F5F5F5', 12, 150);
