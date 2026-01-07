import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  rating: number; // 0 to 5
  onRate?: (rating: number) => void;
  readOnly?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function StarRating({ rating, onRate, readOnly = false, size = "md", className }: StarRatingProps) {
  const stars = [1, 2, 3, 4, 5];

  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-8 h-8",
  };

  return (
    <div className={cn("flex items-center gap-1", className)}>
      {stars.map((star) => (
        <button
          key={star}
          type="button"
          disabled={readOnly}
          onClick={() => !readOnly && onRate?.(star)}
          className={cn(
            "transition-all duration-200 focus:outline-none focus-visible:scale-110",
            readOnly ? "cursor-default" : "cursor-pointer hover:scale-110 active:scale-95"
          )}
        >
          <Star
            className={cn(
              sizeClasses[size],
              star <= Math.round(rating)
                ? "fill-amber-400 text-amber-400 drop-shadow-sm"
                : "fill-muted text-muted-foreground/30",
              "transition-colors"
            )}
          />
        </button>
      ))}
    </div>
  );
}
