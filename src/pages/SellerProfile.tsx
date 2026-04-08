import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuthStore } from "@/stores/authStore";
import PageWrapper from "@/components/layout/PageWrapper";
import ListingCard from "@/components/listing/ListingCard";
import ListingCardSkeleton from "@/components/listing/ListingCardSkeleton";
import KYCBadge from "@/components/auth/KYCBadge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Star, MapPin, Calendar, MessageCircle, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { useSEO } from "@/hooks/useSEO";
import type { Listing } from "@/types";

const SellerProfile = () => {
  const { userId } = useParams<{ userId: string }>();
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [hoverRating, setHoverRating] = useState(0);

  const { data: seller, isLoading: sellerLoading } = useQuery({
    queryKey: ["seller-profile", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", userId!)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });

  useSEO({
    title: seller ? `${seller.full_name} — Vendeur sur Expat-Congo` : "Profil vendeur",
    description: seller
      ? `Consultez le profil de ${seller.full_name} à ${seller.city || "Brazzaville"} et ses annonces sur Expat-Congo.`
      : "Profil vendeur Expat-Congo",
  });

  const { data: listings = [], isLoading: listingsLoading } = useQuery({
    queryKey: ["seller-listings", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("listings")
        .select(`*, profiles!listings_user_id_fkey(full_name, kyc_status, avatar_url, kyc_level), categories!category_id(name, slug)`)
        .eq("user_id", userId!)
        .eq("status", "active")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data || []).map((item: any): Listing => ({
        id: item.id,
        user_id: item.user_id,
        title: item.title,
        description: item.description,
        price: item.price || 0,
        is_free: item.is_free,
        isFree: item.is_free,
        city: item.city,
        neighborhood: item.neighborhood,
        category: item.categories?.name || "Autres",
        category_id: item.category_id,
        imageUrl: item.cover_image || "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400&h=300&fit=crop",
        cover_image: item.cover_image,
        images: item.images,
        isSponsored: item.is_sponsored || false,
        createdAt: new Date(item.created_at).toLocaleDateString(),
        created_at: item.created_at,
        userName: item.profiles?.full_name || "Utilisateur",
        isVerified: item.profiles?.kyc_status === "approved",
        priceNegotiable: item.price_negotiable || false,
        status: item.status,
        views_count: item.views_count,
        specs: item.specs as any,
      }));
    },
    enabled: !!userId,
  });

  const { data: reviews = [], isLoading: reviewsLoading } = useQuery({
    queryKey: ["seller-reviews", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("reviews")
        .select("*, profiles!reviews_reviewer_id_fkey(full_name, avatar_url)")
        .eq("seller_id", userId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!userId,
  });

  const avgRating = reviews.length > 0
    ? (reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : null;

  const submitReview = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Connectez-vous pour laisser un avis");
      const { error } = await supabase.from("reviews").insert({
        reviewer_id: user.id,
        seller_id: userId!,
        rating,
        comment: comment.trim() || null,
      });
      if (error) {
        if (error.code === "23505") throw new Error("Vous avez déjà donné un avis à ce vendeur");
        throw error;
      }
    },
    onSuccess: () => {
      toast.success("Avis publié !");
      setComment("");
      setRating(5);
      queryClient.invalidateQueries({ queryKey: ["seller-reviews", userId] });
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const memberSince = seller?.created_at
    ? new Date(seller.created_at).toLocaleDateString("fr-FR", { month: "long", year: "numeric" })
    : "";

  if (sellerLoading) {
    return (
      <PageWrapper>
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="flex items-center gap-4">
              <div className="h-20 w-20 rounded-full bg-muted" />
              <div className="space-y-2">
                <div className="h-6 w-48 rounded bg-muted" />
                <div className="h-4 w-32 rounded bg-muted" />
              </div>
            </div>
          </div>
        </div>
      </PageWrapper>
    );
  }

  if (!seller) {
    return (
      <PageWrapper>
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold text-foreground">Vendeur introuvable</h1>
          <Link to="/" className="mt-4 inline-block text-primary hover:underline">Retour à l'accueil</Link>
        </div>
      </PageWrapper>
    );
  }

  const canReview = user && user.id !== userId;

  return (
    <PageWrapper>
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Seller Header */}
        <div className="flex flex-col sm:flex-row items-start gap-6">
          <Avatar className="h-20 w-20 ring-2 ring-primary/20">
            <AvatarImage src={seller.avatar_url || undefined} alt={seller.full_name} />
            <AvatarFallback className="text-2xl font-bold bg-primary/10 text-primary">
              {seller.full_name?.charAt(0)?.toUpperCase() || "?"}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-bold text-foreground">{seller.full_name}</h1>
              <KYCBadge level={seller.kyc_level || 0} status={seller.kyc_status || "none"} />
            </div>
            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1"><MapPin className="h-4 w-4" />{seller.city || "Brazzaville"}</span>
              <span className="flex items-center gap-1"><Calendar className="h-4 w-4" />Membre depuis {memberSince}</span>
              {avgRating && (
                <span className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-accent text-accent" />
                  {avgRating}/5 ({reviews.length} avis)
                </span>
              )}
            </div>
            {seller.bio && <p className="text-sm text-muted-foreground max-w-lg">{seller.bio}</p>}
            <div className="flex gap-3 text-sm">
              <span className="bg-primary/10 text-primary px-3 py-1 rounded-full font-medium">
                {listings.length} annonce{listings.length !== 1 ? "s" : ""}
              </span>
              {seller.response_rate != null && seller.response_rate > 0 && (
                <span className="bg-accent/10 text-accent px-3 py-1 rounded-full font-medium flex items-center gap-1">
                  <MessageCircle className="h-3.5 w-3.5" />
                  {seller.response_rate}% réponse
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Listings */}
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-4">
            Annonces de {seller.full_name}
          </h2>
          {listingsLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => <ListingCardSkeleton key={i} />)}
            </div>
          ) : listings.length === 0 ? (
            <p className="text-muted-foreground py-8 text-center">Aucune annonce active pour le moment.</p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {listings.map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>
          )}
        </section>

        {/* Reviews */}
        <section className="space-y-6">
          <h2 className="text-xl font-semibold text-foreground">
            Avis ({reviews.length})
          </h2>

          {/* Submit Review */}
          {canReview && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Laisser un avis</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="transition-transform hover:scale-110"
                    >
                      <Star
                        className={`h-6 w-6 ${
                          star <= (hoverRating || rating)
                            ? "fill-accent text-accent"
                            : "text-muted-foreground/30"
                        }`}
                      />
                    </button>
                  ))}
                  <span className="ml-2 text-sm text-muted-foreground">{hoverRating || rating}/5</span>
                </div>
                <Textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Partagez votre expérience avec ce vendeur..."
                  className="min-h-[80px]"
                />
                <Button
                  onClick={() => submitReview.mutate()}
                  disabled={submitReview.isPending}
                  className="bg-primary hover:bg-primary/90"
                >
                  {submitReview.isPending ? "Envoi..." : "Publier l'avis"}
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Reviews list */}
          {reviewsLoading ? (
            <div className="space-y-4">
              {[1, 2].map((i) => (
                <div key={i} className="animate-pulse p-4 rounded-lg border bg-card space-y-2">
                  <div className="h-4 w-32 bg-muted rounded" />
                  <div className="h-3 w-full bg-muted rounded" />
                </div>
              ))}
            </div>
          ) : reviews.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              Aucun avis pour le moment. {canReview ? "Soyez le premier !" : ""}
            </p>
          ) : (
            <div className="space-y-4">
              {reviews.map((review: any) => (
                <Card key={review.id}>
                  <CardContent className="pt-4 pb-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={review.profiles?.avatar_url || undefined} />
                          <AvatarFallback className="text-xs bg-primary/10 text-primary">
                            {review.profiles?.full_name?.charAt(0)?.toUpperCase() || "?"}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium text-sm text-foreground">
                          {review.profiles?.full_name || "Utilisateur"}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`h-3.5 w-3.5 ${
                              i < review.rating ? "fill-accent text-accent" : "text-muted-foreground/20"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    {review.comment && (
                      <p className="text-sm text-muted-foreground">{review.comment}</p>
                    )}
                    <p className="text-xs text-muted-foreground/60">
                      {new Date(review.created_at).toLocaleDateString("fr-FR", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>
      </div>
    </PageWrapper>
  );
};

export default SellerProfile;
