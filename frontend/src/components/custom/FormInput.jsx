import React, { forwardRef } from 'react';
import { cn } from '../../lib/utils';
import { Label } from '../ui/label';
import { Input } from '../ui/input';

const FormInput = forwardRef(({ label, error, inputClassName, labelClassName, icon: Icon, endIcon, variant = 'white', ...props }, ref) => {
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
                    className={cn(
                        variant === 'dark' && darkInputClass,
                        variant === 'white' && whiteInputClass,
                        Icon && "pl-12",
                        endIcon && "pr-12",
                        error && "border-red-500 focus:border-red-500 focus:ring-red-500",
                        inputClassName
                    )}
                    aria-invalid={error ? "true" : "false"}
                    aria-describedby={error ? `${props.id || props.name}-error` : undefined}
                    {...props}
                />
                {endIcon && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center">
                        {endIcon}
                    </div>
                )}
            </div>
        </div>
    );
});

FormInput.displayName = 'FormInput';

export default FormInput;
