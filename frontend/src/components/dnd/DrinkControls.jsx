import { Button } from '@/components/ui/button';
import { RotateCcw } from 'lucide-react';
import PropTypes from 'prop-types';

const DrinkControls = ({
  addedIngredients,
  milkShots,
  iceScoops,
  isBlended,
  hasIce,
  isFinished,
  isAnimating,
  totalPrice,
  onReset,
  onBlend,
  onFinish,
  onAddToCart
}) => {
  return (
    <>
      {/* Status Indicators */}
      <div className="mt-4 space-y-2">
        {milkShots > 0 && (
          <div className="text-sm text-[#FFC107] font-medium">
            Milk Shots: {milkShots}/3
          </div>
        )}
        {iceScoops > 0 && (
          <div className="text-sm text-blue-600 font-medium">
            Ice Scoops: {iceScoops}/2
          </div>
        )}
        {isBlended && (
          <div className="text-sm text-green-600 font-medium">
            ✓ Blended
          </div>
        )}
        {hasIce && (
          <div className="text-sm text-blue-600 font-medium">
            ✓ Ice Added
          </div>
        )}
        {isFinished && (
          <div className="text-sm text-purple-600 font-medium">
            ✓ Finished Product
          </div>
        )}
        {totalPrice > 0 && (
          <div className="text-sm text-[#FFC107] font-bold">
            Total: ₱{totalPrice}
          </div>
        )}
      </div>

      <div className="flex gap-3 mt-4">
        <Button
          variant="outline"
          onClick={onReset}
          className="flex-1"
          disabled={addedIngredients.length === 0}
        >
          <RotateCcw className="w-4 h-4 mr-2" />
          Reset
        </Button>

        {/* Show blend button only at specific steps */}
        {((addedIngredients.some(ing => ing.id === 'strawberry-jam') && !isBlended) ||
          (addedIngredients.some(ing => ing.id === 'ice') && isBlended)) && (
          <Button
            variant="yellow"
            onClick={onBlend}
            className="flex-1"
            disabled={isAnimating}
          >
            Blend
          </Button>
        )}

        {/* Show finish button only after second blend */}
        {isBlended && hasIce && (
          <Button
            variant="yellow"
            onClick={onFinish}
            className="flex-1"
            disabled={isFinished || isAnimating}
          >
            Finish
          </Button>
        )}
      </div>

      {isFinished && (
        <Button
          variant="yellow"
          onClick={onAddToCart}
          className="w-full mt-3"
        >
          Add to Cart
        </Button>
      )}
    </>
  );
};

DrinkControls.propTypes = {
  addedIngredients: PropTypes.array.isRequired,
  milkShots: PropTypes.number.isRequired,
  iceScoops: PropTypes.number.isRequired,
  isBlended: PropTypes.bool.isRequired,
  hasIce: PropTypes.bool.isRequired,
  isFinished: PropTypes.bool.isRequired,
  isAnimating: PropTypes.bool.isRequired,
  totalPrice: PropTypes.number.isRequired,
  onReset: PropTypes.func.isRequired,
  onBlend: PropTypes.func.isRequired,
  onFinish: PropTypes.func.isRequired,
  onAddToCart: PropTypes.func.isRequired,
};

export default DrinkControls;
