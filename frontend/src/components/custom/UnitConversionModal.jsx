import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import CustomAlertDialog from "./CustomAlertDialog";
import CustomSelect from "./CustomSelect";
import { Calculator, ArrowRight, RotateCcw } from "lucide-react";

const conversionFactors = {
  // Weight conversions
  kilograms: {
    grams: 1000,
    pounds: 2.20462,
  },
  grams: {
    kilograms: 0.001,
    pounds: 0.00220462,
  },
  pounds: {
    kilograms: 0.453592,
    grams: 453.592,
  },
  // Volume conversions
  liters: {
    milliliters: 1000,
    fluid_ounces: 33.814,
  },
  milliliters: {
    liters: 0.001,
    fluid_ounces: 0.033814,
  },
  fluid_ounces: {
    liters: 0.0295735,
    milliliters: 29.5735,
  },
  // Common conversions
  pieces: {
    dozens: 0.0833333,
  },
  dozens: {
    pieces: 12,
  },
};

const unitCategories = {
  weight: ["kilograms", "grams", "pounds"],
  volume: ["liters", "milliliters", "fluid_ounces"],
  common: [
    "pieces",
    "dozens",
    "packs",
    "boxes",
    "cans",
    "bottles",
    "trays",
    "sachets",
  ],
};

export default function UnitConversionModal({ isOpen, onClose }) {
  const [fromUnit, setFromUnit] = useState("kilograms");
  const [toUnit, setToUnit] = useState("grams");
  const [fromValue, setFromValue] = useState("1");
  const [toValue, setToValue] = useState("1000");
  const [category, setCategory] = useState("weight");

  // Calculate conversion when inputs change
  useEffect(() => {
    if (fromValue && fromUnit && toUnit) {
      const value = parseFloat(fromValue);
      if (!isNaN(value)) {
        const converted = convertUnit(value, fromUnit, toUnit);
        setToValue(converted.toString());
      }
    }
  }, [fromValue, fromUnit, toUnit]);

  const convertUnit = (value, from, to) => {
    if (from === to) return value;

    // Direct conversion
    if (conversionFactors[from] && conversionFactors[from][to]) {
      return value * conversionFactors[from][to];
    }

    // Reverse conversion
    if (conversionFactors[to] && conversionFactors[to][from]) {
      return value / conversionFactors[to][from];
    }

    // If no conversion available, return original value
    return value;
  };

  const handleFromValueChange = (e) => {
    const value = e.target.value;
    setFromValue(value);
  };

  const handleFromUnitChange = (unit) => {
    setFromUnit(unit);
    // Update category if needed
    Object.entries(unitCategories).forEach(([cat, units]) => {
      if (units.includes(unit)) {
        setCategory(cat);
      }
    });
  };

  const handleToUnitChange = (unit) => {
    setToUnit(unit);
  };

  const swapUnits = () => {
    const tempUnit = fromUnit;
    const tempValue = fromValue;
    setFromUnit(toUnit);
    setToUnit(tempUnit);
    setFromValue(toValue);
    setToValue(tempValue);
  };

  const resetConversion = () => {
    setFromUnit("kilograms");
    setToUnit("grams");
    setFromValue("1");
    setToValue("1000");
    setCategory("weight");
  };

  const getAvailableUnits = () => {
    return unitCategories[category] || [];
  };

  const formatResult = (value) => {
    if (isNaN(value) || value === 0) return "0";
    return value.toFixed(2);
  };

  return (
    <CustomAlertDialog
      open={isOpen}
      onOpenChange={onClose}
      title={
        <div className="flex items-center gap-2">
          <Calculator className="w-6 h-6 text-[#FFC107]" />
          Unit Converter
        </div>
      }
      description="Convert between different units of measurement"
      className="max-w-2xl"
      actions={
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={resetConversion}
            className="flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Reset
          </Button>
          <Button variant="yellow" onClick={onClose}>
            Close
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Category Selection */}
        <div>
          <label className="block text-sm font-bold text-[#FFC107] mb-2">
            Category
          </label>
          <div className="flex gap-2 flex-wrap">
            {Object.keys(unitCategories).map((cat) => (
              <Button
                key={cat}
                variant={category === cat ? "yellow" : "outline"}
                size="sm"
                onClick={() => setCategory(cat)}
                className="capitalize"
              >
                {cat}
              </Button>
            ))}
          </div>
        </div>

        {/* Conversion Input */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          {/* From */}
          <div className="space-y-2">
            <label className="block text-sm font-bold text-[#FFC107]">
              From
            </label>
            <Input
              type="number"
              value={fromValue}
              onChange={handleFromValueChange}
              placeholder="Enter value"
              className="bg-[#232323] border-[#333] text-white"
            />
            <CustomSelect
              value={fromUnit}
              onChange={handleFromUnitChange}
              options={getAvailableUnits().map((unit) => ({
                value: unit,
                label: unit.charAt(0).toUpperCase() + unit.slice(1),
              }))}
              placeholder="Select unit"
              name="fromUnit"
            />
          </div>

          {/* Swap Button */}
          <div className="flex justify-center">
            <Button
              variant="outline"
              size="icon"
              onClick={swapUnits}
              className="rounded-full w-10 h-10"
            >
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>

          {/* To */}
          <div className="space-y-2">
            <label className="block text-sm font-bold text-[#FFC107]">To</label>
            <Input
              type="number"
              value={formatResult(parseFloat(toValue))}
              readOnly
              className="bg-[#232323] border-[#333] text-white"
            />
            <CustomSelect
              value={toUnit}
              onChange={handleToUnitChange}
              options={getAvailableUnits().map((unit) => ({
                value: unit,
                label: unit.charAt(0).toUpperCase() + unit.slice(1),
              }))}
              placeholder="Select unit"
              name="toUnit"
            />
          </div>
        </div>

        {/* Result Display */}
        <div className="bg-[#232323] p-4 rounded-lg border border-[#333]">
          <div className="text-center">
            <p className="text-[#BDBDBD] text-sm mb-1">Conversion Result</p>
            <p className="text-2xl font-bold text-[#FFC107]">
              {fromValue} {fromUnit} = {formatResult(parseFloat(toValue))}{" "}
              {toUnit}
            </p>
          </div>
        </div>

        {/* Quick Conversions */}
        <div>
          <h3 className="text-lg font-bold text-[#FFC107] mb-3">
            Quick Conversions
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-[#232323] p-3 rounded-lg border border-[#333]">
              <h4 className="font-bold text-white mb-2">Weight</h4>
              <div className="space-y-1 text-sm text-[#BDBDBD]">
                <p>• 1 kg = 1000 g</p>
                <p>• 1 kg = 2.20462 lbs</p>
                <p>• 1 g = 0.001 kg</p>
              </div>
            </div>
            <div className="bg-[#232323] p-3 rounded-lg border border-[#333]">
              <h4 className="font-bold text-white mb-2">Volume</h4>
              <div className="space-y-1 text-sm text-[#BDBDBD]">
                <p>• 1 L = 1000 ml</p>
                <p>• 1 L = 33.814 fl oz</p>
                <p>• 1 ml = 0.001 L</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tips */}
        <div className="bg-[#232323] p-4 rounded-lg border border-[#333]">
          <h3 className="font-bold text-[#FFC107] mb-2">💡 Tips</h3>
          <ul className="space-y-1 text-sm text-[#BDBDBD]">
            <li>• Use smaller units for more precise measurements</li>
            <li>• Always check packaging for exact quantities</li>
            <li>• Some ingredients may have different densities</li>
            <li>• Volume ≠ Weight for most ingredients</li>
          </ul>
        </div>
      </div>
    </CustomAlertDialog>
  );
}

UnitConversionModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};
