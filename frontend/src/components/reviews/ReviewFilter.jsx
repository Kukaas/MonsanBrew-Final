import PropTypes from 'prop-types';
import { Star } from 'lucide-react';
import { Button } from '../ui/button';

const ReviewFilter = ({
    selectedRating,
    onRatingChange,
    totalReviews = 0,
    averageRating = 0,
    reviewCounts = {} // Object with rating counts: {5: 10, 4: 5, 3: 2, 2: 1, 1: 0}
}) => {
    const ratings = [5, 4, 3, 2, 1];

    const getRatingPercentage = (rating) => {
        if (totalReviews === 0) return 0;
        return Math.round((reviewCounts[rating] || 0) / totalReviews * 100);
    };

    return (
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 mb-4">
            <div className="mb-4">
                <h4 className="font-semibold text-[#232323]">Filter Reviews</h4>
            </div>

            {/* Overall Rating Summary */}
            <div className="flex items-center gap-3 mb-4 p-3 bg-gray-50 rounded-lg">
                <div className="text-center">
                    <div className="text-2xl font-bold text-[#232323]">{averageRating.toFixed(1)}</div>
                    <div className="flex items-center gap-1 justify-center">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                                key={star}
                                className={`w-4 h-4 ${
                                    star <= averageRating
                                        ? 'fill-[#FFC107] text-[#FFC107]'
                                        : 'text-gray-300'
                                }`}
                            />
                        ))}
                    </div>
                    <div className="text-sm text-gray-500 mt-1">
                        {totalReviews} review{totalReviews !== 1 ? 's' : ''}
                    </div>
                </div>
            </div>

            {/* Rating Filter Options */}
            <div className="space-y-2">
                {ratings.map((rating) => {
                    const count = reviewCounts[rating] || 0;
                    const percentage = getRatingPercentage(rating);
                    const isSelected = selectedRating === rating;

                    return (
                        <button
                            key={rating}
                            onClick={() => onRatingChange(rating)}
                            className={`w-full flex items-center justify-between p-2 rounded-lg transition-colors ${
                                isSelected
                                    ? 'bg-gray-100 border border-gray-300'
                                    : 'hover:bg-gray-50'
                            }`}
                        >
                            <div className="flex items-center gap-2">
                                <div className="flex items-center gap-1">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <Star
                                            key={star}
                                            className={`w-3 h-3 ${
                                                star <= rating
                                                    ? 'fill-[#FFC107] text-[#FFC107]'
                                                    : 'text-gray-300'
                                            }`}
                                        />
                                    ))}
                                </div>
                                <span className="text-sm font-medium text-[#232323]">
                                    {rating} star{rating !== 1 ? 's' : ''}
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-16 bg-gray-200 rounded-full h-2">
                                    <div
                                        className="bg-[#FFC107] h-2 rounded-full transition-all duration-300"
                                        style={{ width: `${percentage}%` }}
                                    />
                                </div>
                                <span className="text-sm text-gray-500 min-w-[3rem] text-right">
                                    {count}
                                </span>
                            </div>
                        </button>
                    );
                })}
            </div>


        </div>
    );
};

ReviewFilter.propTypes = {
  selectedRating: PropTypes.number,
  onRatingChange: PropTypes.func.isRequired,
  totalReviews: PropTypes.number,
  averageRating: PropTypes.number,
  reviewCounts: PropTypes.object, // Object with rating counts: {5: 10, 4: 5, 3: 2, 2: 1, 1: 0}
};

export default ReviewFilter;
