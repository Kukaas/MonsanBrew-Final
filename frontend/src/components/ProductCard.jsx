import PropTypes from "prop-types";
import { Button } from "./ui/button";
import { useNavigate } from "react-router-dom";
import { Star } from "lucide-react";

function ProductCard({ product }) {
  // Determine image source (base64 or url)
  let imageSrc = "/placeholder.png";
  if (product.image) {
    imageSrc = product.image.startsWith("data:image")
      ? product.image
      : `data:image/jpeg;base64,${product.image}`;
  } else if (product.imageUrl) {
    imageSrc = product.imageUrl;
  }

  const navigate = useNavigate();

  const handleCardClick = () => {
    navigate(`/product/${product._id}`);
  };

  const handleButtonClick = (e) => {
    e.stopPropagation();
    navigate(`/product/${product._id}`);
  };

  return (
    <div
      className="bg-white rounded-2xl shadow p-4 flex flex-col w-full h-full cursor-pointer hover:shadow-lg transition-shadow"
      onClick={handleCardClick}
    >
      <div className="flex justify-center mb-3">
        <img
          src={imageSrc}
          alt={product.productName}
          className="w-30 h-30 object-cover bg-white"
        />
      </div>
      <div className="font-bold text-base text-[#232323] text-left mb-1">
        {product.productName}
      </div>
      <div className="text-[#232323] text-sm text-left mb-2">
        {Array.isArray(product.sizes) && product.sizes.length > 0 ? (
          (() => {
            const prices = product.sizes
              .map((s) => Number(s.price))
              .filter((p) => !isNaN(p));
            if (prices.length === 0) return null;
            const min = Math.min(...prices);
            const max = Math.max(...prices);
            return min === max
              ? `₱ ${min.toLocaleString()}`
              : `₱ ${min.toLocaleString()} - ₱ ${max.toLocaleString()}`;
          })()
        ) : (
          <>₱ {product.price?.toLocaleString()}</>
        )}
      </div>

      {/* Rating and Review Count */}
      {(product.averageRating > 0 || product.reviewCount > 0) && (
        <div className="flex items-center gap-2 mb-2">
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`w-3 h-3 ${
                  star <= (product.averageRating || 0)
                    ? "fill-[#FFC107] text-[#FFC107]"
                    : "text-gray-300"
                }`}
              />
            ))}
          </div>
          <span className="text-xs text-gray-500 whitespace-nowrap px-1">
            ({product.reviewCount || 0})
          </span>
        </div>
      )}

      <div className="border-t border-[#E0E0E0] my-2" />
      <Button
        variant="yellow"
        className="w-full mt-2"
        onClick={handleButtonClick}
      >
        Buy
      </Button>
    </div>
  );
}

ProductCard.propTypes = {
  product: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    productName: PropTypes.string.isRequired,
    image: PropTypes.string,
    imageUrl: PropTypes.string,
    price: PropTypes.number,
    sizes: PropTypes.arrayOf(PropTypes.shape({
      price: PropTypes.number.isRequired,
    })),
    averageRating: PropTypes.number,
    reviewCount: PropTypes.number,
  }).isRequired,
};

export default ProductCard;
