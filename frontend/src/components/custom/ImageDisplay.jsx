import PropTypes from "prop-types";
import { CreditCard, Camera, Package } from "lucide-react";

const ImageDisplay = ({
  imageSrc,
  altText,
  title,
  description,
  icon = "default",
  className = "",
}) => {
  const getIcon = () => {
    switch (icon) {
      case "payment":
        return <CreditCard className="w-7 h-7 text-[#FFC107]" />;
      case "camera":
        return <Camera className="w-7 h-7 text-[#FFC107]" />;
      case "package":
        return <Package className="w-7 h-7 text-[#FFC107]" />;
      default:
        return <CreditCard className="w-7 h-7 text-[#FFC107]" />;
    }
  };

  if (!imageSrc) return null;

  return (
    <>
      <div className="border-t border-[#232323] my-4" />
      <div className={className}>
        <div className="flex items-center gap-3 mb-6">
          {getIcon()}
          <h3 className="text-[#FFC107] text-2xl font-extrabold tracking-widest uppercase">
            {title}
          </h3>
        </div>
        <div className="bg-[#232323] rounded-xl p-6 border border-[#333]">
          <img
            src={imageSrc}
            alt={altText}
            className="max-w-full h-auto rounded-lg border-2 border-[#FFC107]"
          />
        </div>
        {description && (
          <div className="text-center mt-4">
            <span className="text-gray-400 text-sm">{description}</span>
          </div>
        )}
      </div>
    </>
  );
};

ImageDisplay.propTypes = {
    imageSrc: PropTypes.string,
    altText: PropTypes.string,
    title: PropTypes.string,
    description: PropTypes.string,
    icon: PropTypes.oneOf(['default', 'payment', 'camera', 'package']),
    className: PropTypes.string,
};

export default ImageDisplay;
