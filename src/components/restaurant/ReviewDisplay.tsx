import { Star, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { Review } from '../../lib/helpers/types';

interface ReviewDisplayProps {
  review?: Review & {
    consumer?: {
      name: string;
    };
  };
  orderCreatedAt: string;
}

export function ReviewDisplay({ review, orderCreatedAt }: ReviewDisplayProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!review) {
    return (
      <div className="ikram-review-empty">
        <p>No review submitted yet</p>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        className={`ikram-review-star ${index < rating ? '' : 'empty'}`}
        size={16}
      />
    ));
  };

  return (
    <div className="ikram-review">
      <div className="ikram-review-header">
        <div className="ikram-review-user-info">
          <div className="ikram-review-user-name">
            {review.consumer?.name || 'Anonymous Customer'}
          </div>
          <div className="ikram-review-date">
            Reviewed on {formatDate(review.created_at)}
          </div>
        </div>
        <div className="ikram-review-stars">
          {renderStars(review.rating_value)}
          <span className="ikram-review-rating-value">
            {review.rating_value.toFixed(1)}
          </span>
        </div>
      </div>

      {review.comment && (
        <>
          {review.comment.length > 150 ? (
            <>
              <div className="ikram-review-comment">
                "{isExpanded ? review.comment : `${review.comment.substring(0, 150)}...`}"
              </div>
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className={`ikram-review-toggle ${isExpanded ? 'expanded' : ''}`}
              >
                {isExpanded ? 'Show Less' : 'Read More'}
                <ChevronDown size={16} />
              </button>
            </>
          ) : (
            <div className="ikram-review-comment">"{review.comment}"</div>
          )}
        </>
      )}
    </div>
  );
}

interface ReviewsSummaryProps {
  averageRating: number;
  totalReviews: number;
}

export function ReviewsSummary({ averageRating, totalReviews }: ReviewsSummaryProps) {
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => {
      const fillPercentage = Math.max(0, Math.min(1, rating - index));
      return (
        <div key={index} style={{ position: 'relative', display: 'inline-block' }}>
          <Star
            className="ikram-review-star empty"
            size={20}
            style={{ position: 'relative' }}
          />
          {fillPercentage > 0 && (
            <Star
              className="ikram-review-star"
              size={20}
              style={{
                position: 'absolute',
                left: 0,
                top: 0,
                clipPath: `inset(0 ${(1 - fillPercentage) * 100}% 0 0)`,
              }}
            />
          )}
        </div>
      );
    });
  };

  return (
    <div className="ikram-review-summary">
      <div className="ikram-review-summary-rating">
        <span className="ikram-review-summary-value">
          {averageRating.toFixed(1)}
        </span>
        <div className="ikram-review-summary-stars">
          {renderStars(averageRating)}
        </div>
      </div>
      <span className="ikram-review-summary-text">
        Based on {totalReviews} {totalReviews === 1 ? 'review' : 'reviews'}
      </span>
    </div>
  );
}
