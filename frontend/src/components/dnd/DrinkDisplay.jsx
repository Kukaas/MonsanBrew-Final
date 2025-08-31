import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import PropTypes from 'prop-types';

const DrinkDisplay = ({
  currentImage,
  showTwinkles
}) => {
  return (
    <div className="relative flex justify-center items-center min-h-[300px] bg-gradient-to-b from-gray-50 to-white rounded-xl border-2 border-dashed border-gray-200 drink-display-area">
      <motion.img
        key={currentImage}
        src={currentImage}
        alt="Custom Drink"
        className="w-48 h-48 object-contain"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      />

      <AnimatePresence>
        {showTwinkles && (
          <motion.div
            className="absolute inset-0 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {[...Array(12)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                }}
                initial={{ opacity: 0, scale: 0 }}
                animate={{
                  opacity: [0, 1, 0],
                  scale: [0, 1, 0],
                  rotate: [0, 360]
                }}
                transition={{
                  duration: 1,
                  delay: Math.random() * 0.5,
                  ease: "easeOut"
                }}
              >
                <Sparkles className="w-4 h-4 text-[#FFC107]" />
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

DrinkDisplay.propTypes = {
  currentImage: PropTypes.string.isRequired,
  showTwinkles: PropTypes.bool.isRequired,
};

export default DrinkDisplay;
