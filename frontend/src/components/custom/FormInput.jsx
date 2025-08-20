import { forwardRef, useState } from 'react';
import PropTypes from 'prop-types';
import { cn } from '../../lib/utils';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Eye, EyeOff } from 'lucide-react';

const FormInput = forwardRef(({ label, error, inputClassName, labelClassName, icon: Icon, endIcon, variant = 'white', type, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);

    // Determine if this is a password field
    const isPassword = type === 'password';

    // Toggle password visibility
    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    // Style for dark variant
    const darkInputClass =
        "w-full bg-[#232323] border border-[#444] rounded-md py-5 px-5 text-lg text-white placeholder:text-[#BDBDBD] font-bold focus:border-[#FFC107] focus:ring-2 focus:ring-[#FFC107]/40 focus:outline-none transition";
    // Style for white variant
    const whiteInputClass =
        "w-full bg-white border border-[#E0E0E0] rounded-md py-5 px-5 text-lg text-black placeholder:text-[#BDBDBD] font-bold focus:border-[#FFC107] focus:ring-2 focus:ring-[#FFE082] focus:outline-none transition";
    // Style for label
    const labelClass = variant === 'dark' || variant === 'white'
        ? 'text-base font-bold text-yellow-400 mb-2'
        : 'text-base font-bold text-white text-[#FFC107]';

    return (
        <div className="flex flex-col space-y-2">
            <Label
                htmlFor={props.id || props.name}
                className={cn(labelClass, labelClassName)}
            >
                {label}
            </Label>
            <div className="relative w-full">
                <Input
                    ref={ref}
                    variant={variant}
                    type={isPassword && showPassword ? 'text' : type}
                    className={cn(
                        variant === 'dark' && darkInputClass,
                        variant === 'white' && whiteInputClass,
                        Icon && "pl-12",
                        (endIcon || isPassword) && "pr-16", // <-- increased padding for password toggle
                        error && "border-red-500 focus:border-red-500 focus:ring-red-500",
                        inputClassName
                    )}
                    aria-invalid={error ? "true" : "false"}
                    aria-describedby={error ? `${props.id || props.name}-error` : undefined}
                    {...props}
                />
                {isPassword && (
                    <button
                        type="button"
                        onClick={togglePasswordVisibility}
                        className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center justify-center w-8 h-8 text-gray-400 hover:text-gray-600 transition-colors z-10"
                    >
                        {showPassword ? (
                            <EyeOff className="w-5 h-5" />
                        ) : (
                            <Eye className="w-5 h-5" />
                        )}
                    </button>
                )}
                {endIcon && !isPassword && (
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center z-10">
                        {endIcon}
                    </div>
                )}
            </div>
        </div>
    );
});

FormInput.displayName = 'FormInput';

FormInput.propTypes = {
  label: PropTypes.string,
  error: PropTypes.string,
  inputClassName: PropTypes.string,
  labelClassName: PropTypes.string,
  icon: PropTypes.elementType,
  endIcon: PropTypes.node,
  variant: PropTypes.oneOf(['white', 'dark']),
  type: PropTypes.string,
  id: PropTypes.string,
  name: PropTypes.string,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onChange: PropTypes.func,
  placeholder: PropTypes.string,
  required: PropTypes.bool,
  disabled: PropTypes.bool,
  className: PropTypes.string,
};

export default FormInput;
