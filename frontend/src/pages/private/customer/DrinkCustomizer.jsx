import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { dndItemsAPI } from '@/services/api';
import DrinkDisplay from '@/components/dnd/DrinkDisplay';
import DrinkControls from '@/components/dnd/DrinkControls';
import IngredientsBar from '@/components/dnd/IngredientsBar';

// Import result images (these remain hardcoded for now)
import baseBlender from '@/assets/drag&drop/Base Blender.png';
import withCaramel from '@/assets/drag&drop/WIth Caramel.png';
import caramel1Shot from '@/assets/drag&drop/Caramel 1 Shot.png';
import caramel2Shot from '@/assets/drag&drop/Caramel 2 Shot.png';
import caramel3Shot from '@/assets/drag&drop/Caramel 3 Shot.png';
import caramelWithStrawberry from '@/assets/drag&drop/Caramel with Stawberry Jam.png';
import blendedCaramel from '@/assets/drag&drop/Blended Caramel.png';
import caramel1ScoopIce from '@/assets/drag&drop/Caramel 1 Scoop Ice.png';
import caramel2ScoopIce from '@/assets/drag&drop/Caramel 2 Scoop Ice.png';
import caramelWithIce from '@/assets/drag&drop/Caramel Belended with Ice.png';
import caramelFinished from '@/assets/drag&drop/Caramel Finished.png';

const DrinkCustomizer = () => {
  const navigate = useNavigate();
  const [currentImage, setCurrentImage] = useState(baseBlender);
  const [addedIngredients, setAddedIngredients] = useState([]);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showTwinkles, setShowTwinkles] = useState(false);
  const [milkShots, setMilkShots] = useState(0);
  const [iceScoops, setIceScoops] = useState(0);
  const [isBlended, setIsBlended] = useState(false);
  const [hasIce, setHasIce] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [isSecondBlend, setIsSecondBlend] = useState(false);
  const [dbIngredients, setDbIngredients] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch ingredients from database
  useEffect(() => {
    const fetchIngredients = async () => {
      try {
        const response = await dndItemsAPI.getAll();

        if (response && response.dndItems) {
          setDbIngredients(response.dndItems);
        } else {
          console.error('Unexpected response structure:', response);
          toast.error('Invalid response format from server');
        }
      } catch (error) {
        console.error('Error fetching ingredients:', error);
        toast.error('Failed to load ingredients');
      } finally {
        setIsLoading(false);
      }
    };

    fetchIngredients();
  }, []);

  // Convert database ingredients to the format expected by the component
  const allIngredients = dbIngredients.map(ingredient => ({
    id: ingredient.ingredientName.toLowerCase().replace(/\s+/g, '-').replace(/[&]/g, '-'),
    name: ingredient.ingredientName,
    image: ingredient.image, // This is now base64 from database
    price: ingredient.price
  }));

  // Get available ingredients based on current flow step
  const getAvailableIngredients = () => {
    if (isLoading || allIngredients.length === 0) {
      return [];
    }

    const hasCaramel = addedIngredients.some(ing => ing.id === 'caramel-powder');
    const hasMilk = milkShots >= 3; // Require 3 milk shots
    const hasStrawberry = addedIngredients.some(ing => ing.id === 'strawberry-jam');
    const hasBlended = isBlended;
    const hasIce = iceScoops >= 2; // Require 2 ice scoops
    const hasSecondBlend = isBlended && hasIce;

    // Step 1: Show only powders
    if (!hasCaramel) {
      return allIngredients.filter(ing =>
        ing.id === 'caramel-powder' ||
        ing.id === 'bamboo-charcoal-powder' ||
        ing.id === 'cookies-cream-powder'
      );
    }

    // Step 2: Show milk after caramel (until 3 shots are added)
    if (hasCaramel && milkShots < 3) {
      return allIngredients.filter(ing => ing.id === 'milk');
    }

    // Step 3: Show strawberry jam after 3 milk shots
    if (hasCaramel && hasMilk && !hasStrawberry) {
      return allIngredients.filter(ing => ing.id === 'strawberry-jam');
    }

    // Step 4: After strawberry, show blend button (no new ingredients)
    if (hasCaramel && hasMilk && hasStrawberry && !hasBlended) {
      return [];
    }

    // Step 5: Show ice after first blend (until 2 scoops are added)
    if (hasCaramel && hasMilk && hasStrawberry && hasBlended && iceScoops < 2) {
      return allIngredients.filter(ing => ing.id === 'ice');
    }

    // Step 6: After 2 ice scoops, show blend button again (no new ingredients)
    if (hasCaramel && hasMilk && hasStrawberry && hasBlended && hasIce && !hasSecondBlend) {
      return [];
    }

    // Step 7: After second blend, show finish button (no new ingredients)
    if (hasCaramel && hasMilk && hasStrawberry && hasBlended && hasIce && hasSecondBlend && !isFinished) {
      return [];
    }

    // Step 8: Finished - no ingredients needed
    return [];
  };

  const ingredients = getAvailableIngredients();

  // Update hasIce state based on iceScoops - only set to true when we have 2 scoops AND we're ready for blending
  useEffect(() => {
    // Only set hasIce to true when we have 2 scoops AND we're in the ice phase
    const hasCaramel = addedIngredients.some(ing => ing.id === 'caramel-powder');
    const hasMilk = milkShots >= 3;
    const hasStrawberry = addedIngredients.some(ing => ing.id === 'strawberry-jam');
    const isInIcePhase = hasCaramel && hasMilk && hasStrawberry && isBlended;

    setHasIce(iceScoops >= 2 && isInIcePhase);
  }, [iceScoops, addedIngredients, milkShots, isBlended]);

  // Update image whenever ingredients or state changes
  useEffect(() => {
    const resultImage = getResultImage();
    setCurrentImage(resultImage);
  }, [addedIngredients, milkShots, iceScoops, isBlended, hasIce, isFinished, isSecondBlend]);

  const getResultImage = () => {
    // Check if finished product
    if (isFinished) {
      return caramelFinished;
    }

    // Check if second blend (after ice is added and blended)
    if (isSecondBlend) {
      return caramelWithIce;
    }

    // Check ice scoops (after ice is added) - this should be checked before blended
    const hasCaramel = addedIngredients.some(ing => ing.id === 'caramel-powder');
    if (hasCaramel && iceScoops > 0) {
      if (iceScoops === 1) {
        return caramel1ScoopIce;
      }
      if (iceScoops >= 2) {
        return caramel2ScoopIce;
      }
    }

    // Check if blended (after first blend) - this should take priority over strawberry
    if (isBlended) {
      return blendedCaramel;
    }

    // Check if has strawberry jam (after strawberry is added, but before blend)
    const hasStrawberry = addedIngredients.some(ing => ing.id === 'strawberry-jam');
    if (hasStrawberry) {
      return caramelWithStrawberry;
    }

    // Check milk shots (after milk is added)
    if (hasCaramel && milkShots > 0) {
      if (milkShots === 1) {
        return caramel1Shot;
      }
      if (milkShots === 2) {
        return caramel2Shot;
      }
      if (milkShots >= 3) {
        return caramel3Shot;
      }
    }

    // Check if has caramel powder (first ingredient)
    if (hasCaramel) {
      return withCaramel;
    }

    return baseBlender;
  };

  const handleIngredientDrop = (ingredient) => {
    if (isAnimating) return;
    setIsAnimating(true);
    setShowTwinkles(true);

    const newIngredients = [...addedIngredients, ingredient];
    setAddedIngredients(newIngredients);

    // Handle specific ingredient logic
    if (ingredient.id === 'milk') {
      setMilkShots(prev => prev + 1);
    } else if (ingredient.id === 'ice') {
      setIceScoops(prev => prev + 1);
    }

    // Hide twinkles after animation
    setTimeout(() => {
      setShowTwinkles(false);
      setIsAnimating(false);
    }, 1000);

    toast.success(`${ingredient.name} added!`);
  };

  const handleReset = () => {
    setCurrentImage(baseBlender);
    setAddedIngredients([]);
    setMilkShots(0);
    setIceScoops(0);
    setIsBlended(false);
    setHasIce(false);
    setIsFinished(false);
    setIsSecondBlend(false);
    toast.success('Drink reset!');
  };

  const handleBlend = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setShowTwinkles(true);

    // Check if this is the second blend (after ice is added)
    const hasCaramel = addedIngredients.some(ing => ing.id === 'caramel-powder');
    const hasMilk = milkShots >= 3;
    const hasStrawberry = addedIngredients.some(ing => ing.id === 'strawberry-jam');
    const isInIcePhase = hasCaramel && hasMilk && hasStrawberry && isBlended && iceScoops >= 2;

    if (isInIcePhase) {
      // Second blend - after ice is added
      setIsSecondBlend(true);
      toast.success('Drink blended with ice!');
    } else {
      // First blend - after strawberry
      setIsBlended(true);
      toast.success('Drink blended!');
    }

    // Hide twinkles and stop animation after delay
    setTimeout(() => {
      setShowTwinkles(false);
      setIsAnimating(false);
    }, 1000);
  };

  const handleFinish = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setShowTwinkles(true);

    // Set finished state - let useEffect handle image update
    setIsFinished(true);

    // Hide twinkles and stop animation after delay
    setTimeout(() => {
      setShowTwinkles(false);
      setIsAnimating(false);
    }, 1000);

    toast.success('Drink finished!');
  };

  const handleAddToCart = () => {
    if (addedIngredients.length === 0) {
      toast.error('Please add some ingredients first!');
      return;
    }
    if (!isFinished) {
      toast.error('Please finish your drink first!');
      return;
    }
    toast.success('Custom drink added to cart!');
  };

  // Calculate total price based on added ingredients and their database prices
  const totalPrice = addedIngredients.reduce((sum, ingredient) => {
    const dbIngredient = dbIngredients.find(db =>
      db.ingredientName.toLowerCase().replace(/\s+/g, '-').replace(/[&]/g, '-') === ingredient.id
    );
    return sum + (dbIngredient?.price || 0);
  }, 0);

  return (
    <div className="min-h-screen bg-[#232323] flex flex-col items-center px-2 sm:px-4 py-0">
      <div className="w-full sticky top-0 z-30 bg-[#232323] flex items-center px-4 py-4 shadow-md">
        <button
          className="text-white hover:text-[#FFC107] mr-2"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft size={28} />
        </button>
        <h1 className="text-xl font-extrabold text-white flex-1 text-center mr-8">
          Drink Customizer
        </h1>
      </div>

      <div className="w-full max-w-4xl flex flex-col items-center py-6 pb-32">
        <div className="w-full max-w-md mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-lg relative overflow-hidden">
            <div className="text-center mb-4">
              <h2 className="text-lg font-bold text-[#232323] mb-2">
                Your Custom Drink
              </h2>
              <p className="text-sm text-gray-600">
                Drag ingredients to customize
              </p>
            </div>

            <DrinkDisplay
              currentImage={currentImage}
              showTwinkles={showTwinkles}
            />

            {addedIngredients.length > 0 && (
              <div className="mt-4">
                <h3 className="text-sm font-semibold text-[#232323] mb-2">
                  Added Ingredients:
                </h3>
                <div className="flex flex-wrap gap-2">
                  {addedIngredients.map((ingredient, index) => (
                    <span
                      key={`${ingredient.id}-${index}`}
                      className="px-2 py-1 bg-[#FFC107]/20 text-[#FFC107] text-xs font-medium rounded-full"
                    >
                      {ingredient.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <DrinkControls
              addedIngredients={addedIngredients}
              milkShots={milkShots}
              iceScoops={iceScoops}
              isBlended={isBlended}
              hasIce={hasIce}
              isFinished={isFinished}
              isAnimating={isAnimating}
              totalPrice={totalPrice}
              onReset={handleReset}
              onBlend={handleBlend}
              onFinish={handleFinish}
              onAddToCart={handleAddToCart}
            />
          </div>
        </div>

        <IngredientsBar
          ingredients={ingredients}
          onDrop={handleIngredientDrop}
          isAnimating={isAnimating}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
};

export default DrinkCustomizer;
