import { motion } from 'framer-motion';
import PropTypes from 'prop-types';
import { useDragAndDrop } from '@/hooks/useDragAndDrop';

const DraggableIngredient = ({ ingredient, onDrop, isAnimating }) => {
  const { isDragging, dragPosition, handleMouseDown, handleTouchStart } = useDragAndDrop(
    () => onDrop(ingredient),
    isAnimating
  );

  const getDragStyle = () => {
    if (!isDragging) {
      return {
        position: 'relative',
        transform: 'none',
        zIndex: 'auto',
        pointerEvents: 'auto',
        width: 'auto',
        height: 'auto',
      };
    }

    return {
      position: 'fixed',
      left: `${dragPosition.x - 40}px`,
      top: `${dragPosition.y - 40}px`,
      transform: 'none',
      zIndex: 1000,
      pointerEvents: 'none',
      width: '80px',
      height: '80px',
    };
  };

  const handleMouseDownWithScroll = (e) => {
    // Only start dragging if it's a left click
    if (e.button === 0) {
      handleMouseDown(e);
    }
  };

  const handleTouchStartWithScroll = (e) => {
    // Start dragging immediately for better mobile experience
    handleTouchStart(e);
  };

  return (
    <motion.div
      className={`relative cursor-grab active:cursor-grabbing flex-shrink-0 ${
        isDragging ? 'z-50' : ''
      }`}
      style={getDragStyle()}
      onMouseDown={handleMouseDownWithScroll}
      onTouchStart={handleTouchStartWithScroll}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <div
        className="bg-gray-50 rounded-xl p-3 border-2 border-gray-200 hover:border-[#FFC107] transition-colors w-20 h-20 flex flex-col items-center justify-center"
        style={{ touchAction: 'none' }}
      >
        <img
          src={ingredient.image}
          alt={ingredient.name}
          className="w-12 h-12 object-contain mb-1"
        />
        <p className="text-xs font-medium text-[#232323] text-center leading-tight">
          {ingredient.name}
        </p>
        {ingredient.price && (
          <p className="text-xs text-[#FFC107] font-bold">
            ₱{ingredient.price}
          </p>
        )}
      </div>

      {isDragging && (
        <motion.div
          className="absolute -top-2 -right-2 bg-[#FFC107] text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.2 }}
        >
          +
        </motion.div>
      )}
    </motion.div>
  );
};

DraggableIngredient.propTypes = {
  ingredient: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    image: PropTypes.string.isRequired,
    price: PropTypes.number,
  }).isRequired,
  onDrop: PropTypes.func.isRequired,
  isAnimating: PropTypes.bool.isRequired,
};

export default DraggableIngredient;
