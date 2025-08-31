import PropTypes from 'prop-types';
import DraggableIngredient from './DraggableIngredient';

const IngredientsBar = ({ ingredients, onDrop, isAnimating, isLoading }) => {
  return (
    <div className="fixed bottom-4 left-0 right-0 z-40 px-4">
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-4 mx-auto max-w-4xl">
        <div className="text-center mb-3">
          <h3 className="text-sm font-bold text-[#232323]">
            Available Ingredients
          </h3>
          <p className="text-xs text-gray-500">
            Drag to customize your drink
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FFC107]"></div>
            <span className="ml-2 text-sm text-gray-600">Loading ingredients...</span>
          </div>
        ) : (
          <div
            className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide"
            onWheel={(e) => {
              e.preventDefault();
              const container = e.currentTarget;
              container.scrollLeft += e.deltaY;
            }}
            onTouchStart={(e) => {
              // Allow touch scrolling on the container
              e.stopPropagation();
            }}
            style={{
              scrollBehavior: 'smooth',
              WebkitOverflowScrolling: 'touch',
              touchAction: 'pan-x'
            }}
          >
            {ingredients.map((ingredient) => (
              <DraggableIngredient
                key={ingredient.id}
                ingredient={ingredient}
                onDrop={onDrop}
                isAnimating={isAnimating}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

IngredientsBar.propTypes = {
  ingredients: PropTypes.array.isRequired,
  onDrop: PropTypes.func.isRequired,
  isAnimating: PropTypes.bool.isRequired,
  isLoading: PropTypes.bool.isRequired,
};

export default IngredientsBar;
