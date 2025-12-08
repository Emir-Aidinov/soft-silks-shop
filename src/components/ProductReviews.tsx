import { useState, useEffect } from "react";
import { Star, User } from "lucide-react";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Review {
  id: string;
  user_id: string;
  product_id: string;
  rating: number;
  comment: string | null;
  user_name: string | null;
  created_at: string;
}

interface ProductReviewsProps {
  productId: string;
}

export const ProductReviews = ({ productId }: ProductReviewsProps) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);

  useEffect(() => {
    fetchReviews();
    checkUser();
  }, [productId]);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUserId(user?.id ?? null);
    
    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .single();
      setUserName(profile?.full_name ?? user.email?.split('@')[0] ?? null);
    }
  };

  const fetchReviews = async () => {
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .eq('product_id', productId)
      .order('created_at', { ascending: false });
    
    if (!error && data) {
      setReviews(data);
    }
    setLoading(false);
  };

  const handleSubmit = async () => {
    if (!userId) {
      toast.error("Войдите, чтобы оставить отзыв");
      return;
    }

    setSubmitting(true);
    const { error } = await supabase.from('reviews').insert({
      user_id: userId,
      product_id: productId,
      rating: newRating,
      comment: newComment.trim() || null,
      user_name: userName
    });

    if (error) {
      toast.error("Ошибка при отправке отзыва");
    } else {
      toast.success("Отзыв добавлен!");
      setNewComment("");
      setNewRating(5);
      fetchReviews();
    }
    setSubmitting(false);
  };

  const averageRating = reviews.length > 0
    ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length
    : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold">Отзывы</h3>
        {reviews.length > 0 && (
          <div className="flex items-center gap-2">
            <div className="flex">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`h-5 w-5 ${
                    star <= Math.round(averageRating)
                      ? "text-yellow-400 fill-yellow-400"
                      : "text-muted-foreground"
                  }`}
                />
              ))}
            </div>
            <span className="text-sm text-muted-foreground">
              {averageRating.toFixed(1)} ({reviews.length} отзывов)
            </span>
          </div>
        )}
      </div>

      {/* Add review form */}
      <div className="bg-secondary/30 rounded-xl p-4 space-y-4">
        <p className="font-medium">Оставить отзыв</p>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onClick={() => setNewRating(star)}
              className="p-1 transition-transform hover:scale-110"
            >
              <Star
                className={`h-7 w-7 transition-colors ${
                  star <= newRating
                    ? "text-yellow-400 fill-yellow-400"
                    : "text-muted-foreground hover:text-yellow-300"
                }`}
              />
            </button>
          ))}
        </div>
        <Textarea
          placeholder="Напишите ваш отзыв..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          className="min-h-[80px]"
        />
        <Button onClick={handleSubmit} disabled={submitting}>
          {submitting ? "Отправка..." : "Отправить отзыв"}
        </Button>
      </div>

      {/* Reviews list */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="bg-secondary/20 rounded-lg h-24 animate-pulse" />
          ))}
        </div>
      ) : reviews.length === 0 ? (
        <p className="text-center text-muted-foreground py-8">
          Пока нет отзывов. Будьте первым!
        </p>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review.id} className="bg-card border rounded-xl p-4 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                    <User className="h-4 w-4 text-primary" />
                  </div>
                  <span className="font-medium">{review.user_name || "Пользователь"}</span>
                </div>
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-4 w-4 ${
                        star <= review.rating
                          ? "text-yellow-400 fill-yellow-400"
                          : "text-muted-foreground"
                      }`}
                    />
                  ))}
                </div>
              </div>
              {review.comment && (
                <p className="text-muted-foreground">{review.comment}</p>
              )}
              <p className="text-xs text-muted-foreground">
                {new Date(review.created_at).toLocaleDateString('ru-RU')}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Component to show rating on product cards
export const ProductRating = ({ productId }: { productId: string }) => {
  const [avgRating, setAvgRating] = useState<number | null>(null);
  const [count, setCount] = useState(0);

  useEffect(() => {
    const fetchRating = async () => {
      const { data } = await supabase
        .from('reviews')
        .select('rating')
        .eq('product_id', productId);
      
      if (data && data.length > 0) {
        const avg = data.reduce((acc, r) => acc + r.rating, 0) / data.length;
        setAvgRating(avg);
        setCount(data.length);
      }
    };
    fetchRating();
  }, [productId]);

  if (avgRating === null) return null;

  return (
    <div className="flex items-center gap-1">
      <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
      <span className="text-sm font-medium">{avgRating.toFixed(1)}</span>
      <span className="text-xs text-muted-foreground">({count})</span>
    </div>
  );
};