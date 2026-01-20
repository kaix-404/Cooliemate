import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, Quote, TrendingUp, Users } from "lucide-react";

const HomepageReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState({ avgRating: 0, totalReviews: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const response = await fetch('https://cooliemate.onrender.com/api/reviews/public');
      const data = await response.json();

      if (data.success) {
        setReviews(data.reviews || []);
        setStats({
          avgRating: data.stats?.avgRating ?? 0,
          totalReviews: data.stats?.totalReviews ?? 0
        });
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const getExperienceBadge = (experience) => {
    const badges = {
      excellent: { label: 'Excellent', color: 'bg-green-100 text-green-700' },
      good: { label: 'Good', color: 'bg-blue-100 text-blue-700' },
      average: { label: 'Average', color: 'bg-yellow-100 text-yellow-700' },
      poor: { label: 'Poor', color: 'bg-red-100 text-red-700' }
    };
    return badges[experience] || badges.good;
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      month: 'short',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="py-16 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
      </div>
    );
  }

  return (
    <section className="py-16 bg-gradient-to-b from-background to-primary/5">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <Badge className="mb-4 text-sm px-4 py-1">
            <Star className="w-3 h-3 mr-1 fill-current" />
            Customer Reviews
          </Badge>
          <h2 className="text-4xl font-bold mb-4">
            What Our Customers Say
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-6">
            Real experiences from passengers who used CooliMate
          </p>

          {/* Stats */}
          <div className="flex items-center justify-center gap-8 mb-8">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Star className="w-8 h-8 fill-yellow-400 text-yellow-400" />
                <span className="text-4xl font-bold text-primary">
                  {stats.avgRating != null ? stats.avgRating.toFixed(1) : "0.0"}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">Average Rating</p>
            </div>
            <div className="h-12 w-px bg-border" />
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Users className="w-8 h-8 text-primary" />
                <span className="text-4xl font-bold text-primary">
                  {stats.totalReviews ?? 0}+
                </span>
              </div>
              <p className="text-sm text-muted-foreground">Happy Customers</p>
            </div>
          </div>
        </div>

        {/* Reviews Grid */}
        {reviews.length === 0 ? (
          <div className="text-center py-12">
            <Star className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground">No reviews yet. Be the first to review!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
            {reviews.map((review, index) => {
              const experienceBadge = getExperienceBadge(review.experience);
              return (
                <Card 
                  key={review._id || index}
                  className="shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 border-t-4 border-primary relative overflow-hidden"
                >
                  <CardContent className="pt-6">
                    <Quote className="absolute top-4 right-4 w-8 h-8 text-primary/10" />

                    <div className="flex items-center gap-1 mb-3">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-5 h-5 ${
                            i < review.rating
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>

                    <Badge className={`${experienceBadge.color} mb-3`}>
                      {experienceBadge.label}
                    </Badge>

                    <p className="text-muted-foreground leading-relaxed mb-4 line-clamp-4">
                      "{review.comment}"
                    </p>

                    <div className="flex items-center justify-between pt-4 border-t">
                      <div>
                        <p className="font-semibold text-sm">{review.userName}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(review.createdAt)}
                        </p>
                      </div>
                      {review.porterName && (
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground">Porter</p>
                          <p className="text-sm font-medium">{review.porterName}</p>
                        </div>
                      )}
                    </div>

                    <div className="absolute bottom-4 right-4">
                      <Badge variant="outline" className="text-xs bg-white">
                        ✓ Verified
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        <div className="mt-12 text-center">
          <div className="flex items-center justify-center gap-2 text-muted-foreground">
            <TrendingUp className="w-5 h-5 text-green-600" />
            <p className="text-sm">
              Join thousands of satisfied customers using CooliMate
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HomepageReviews;
