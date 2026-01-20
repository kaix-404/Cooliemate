import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  Star,
  Send,
  ThumbsUp,
  Smile,
  Meh,
  Frown,
  CheckCircle2
} from "lucide-react";

const ReviewModal = ({ bookingId, porterName, porterId, onClose, onSubmit }) => {
  const { toast } = useToast();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [experience, setExperience] = useState("");
  const [porterRating, setPorterRating] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const experienceOptions = [
    { value: 'excellent', label: 'Excellent', icon: Smile, color: 'text-green-600', bg: 'bg-green-100' },
    { value: 'good', label: 'Good', icon: Smile, color: 'text-blue-600', bg: 'bg-blue-100' },
    { value: 'average', label: 'Average', icon: Meh, color: 'text-yellow-600', bg: 'bg-yellow-100' },
    { value: 'poor', label: 'Poor', icon: Frown, color: 'text-red-600', bg: 'bg-red-100' }
  ];

  const handleSubmit = async () => {
    if (rating === 0) {
      toast({
        title: "Rating Required",
        description: "Please rate your experience",
        variant: "destructive"
      });
      return;
    }

    if (!comment.trim()) {
      toast({
        title: "Comment Required",
        description: "Please share your feedback",
        variant: "destructive"
      });
      return;
    }

    if (!experience) {
      toast({
        title: "Experience Required",
        description: "Please select your overall experience",
        variant: "destructive"
      });
      return;
    }

    setSubmitting(true);

    try {
      const reviewData = {
        bookingId,
        userName: "Guest User", // Replace with actual user name from context
        rating,
        comment: comment.trim(),
        experience,
        porterRating: porterRating || rating,
        porterId,
        porterName
      };

      const response = await fetch('http://localhost:5000/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reviewData)
      });

      const data = await response.json();

      if (data.success) {
        setSubmitted(true);
        toast({
          title: "Thank You! 🎉",
          description: "Your review has been submitted successfully"
        });
        
        if (onSubmit) onSubmit(data.review);
        
        setTimeout(() => {
          if (onClose) onClose();
        }, 2000);
      } else {
        throw new Error(data.error || 'Failed to submit review');
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      toast({
        title: "Submission Failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <Card className="w-full max-w-2xl mx-auto shadow-2xl">
        <CardContent className="py-12 text-center">
          <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-12 h-12 text-green-600" />
          </div>
          <h2 className="text-3xl font-bold mb-3">Thank You!</h2>
          <p className="text-lg text-muted-foreground mb-2">
            Your review has been submitted successfully
          </p>
          {rating >= 4 && (
            <p className="text-sm text-green-600">
              ⭐ Your review will be featured on our homepage!
            </p>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-2xl">
      <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5">
        <CardTitle className="text-2xl">Rate Your Experience</CardTitle>
        <p className="text-sm text-muted-foreground">
          Help us improve by sharing your feedback
        </p>
      </CardHeader>
      <CardContent className="pt-6 space-y-6">
        {/* Overall Rating */}
        <div className="text-center">
          <label className="block text-lg font-semibold mb-4">
            How was your overall experience?
          </label>
          <div className="flex items-center justify-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                className="transition-transform hover:scale-110"
              >
                <Star
                  className={`w-12 h-12 ${
                    star <= (hoverRating || rating)
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-gray-300'
                  }`}
                />
              </button>
            ))}
          </div>
          {rating > 0 && (
            <p className="mt-3 text-sm text-muted-foreground">
              {rating === 5 && "Excellent! ⭐⭐⭐⭐⭐"}
              {rating === 4 && "Very Good! ⭐⭐⭐⭐"}
              {rating === 3 && "Good ⭐⭐⭐"}
              {rating === 2 && "Fair ⭐⭐"}
              {rating === 1 && "Needs Improvement ⭐"}
            </p>
          )}
        </div>

        {/* Experience Selection */}
        <div>
          <label className="block text-sm font-semibold mb-3">
            Select your experience type
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {experienceOptions.map((option) => {
              const Icon = option.icon;
              return (
                <button
                  key={option.value}
                  onClick={() => setExperience(option.value)}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    experience === option.value
                      ? `${option.bg} border-current ${option.color}`
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Icon className={`w-8 h-8 mx-auto mb-2 ${
                    experience === option.value ? option.color : 'text-gray-400'
                  }`} />
                  <p className="text-sm font-medium">{option.label}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Porter Rating */}
        <div>
          <label className="block text-sm font-semibold mb-3">
            Rate Porter: {porterName}
          </label>
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => setPorterRating(star)}
                className="transition-transform hover:scale-110"
              >
                <Star
                  className={`w-8 h-8 ${
                    star <= porterRating
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-gray-300'
                  }`}
                />
              </button>
            ))}
            {porterRating > 0 && (
              <span className="ml-2 text-sm text-muted-foreground">
                {porterRating}/5
              </span>
            )}
          </div>
        </div>

        {/* Comment */}
        <div>
          <label className="block text-sm font-semibold mb-3">
            Share your detailed feedback
          </label>
          <Textarea
            placeholder="Tell us about your experience with the porter service..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={4}
            className="resize-none"
          />
          <p className="text-xs text-muted-foreground mt-2">
            {comment.length}/500 characters
          </p>
        </div>

        {/* Submit Button */}
        <div className="flex gap-3 pt-4">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1"
            disabled={submitting}
          >
            Skip for Now
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={submitting || rating === 0}
            className="flex-1"
          >
            {submitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Submitting...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Submit Review
              </>
            )}
          </Button>
        </div>

        {rating >= 4 && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
            <p className="text-sm text-green-700 font-medium">
              ⭐ High-rated reviews are featured on our homepage!
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ReviewModal;