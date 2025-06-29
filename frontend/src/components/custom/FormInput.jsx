import React, { forwardRef } from 'react';
import { cn } from '../../lib/utils';
import { Label } from '../ui/label';
import { Input } from '../ui/input';

const FormInput = forwardRef(({ label, error, inputClassName, labelClassName, ...props }, ref) => {
    const Icon = props.icon;
    const endIcon = props.endIcon;

    return (
        <div className="flex flex-col space-y-2">
            <Label
                htmlFor={props.id || props.name}
                className={cn("text-base font-bold text-white", labelClassName)}
            >
                {label}
            </Label>
            <div className="relative w-full">
                <Input
                    ref={ref}
                    className={cn(
                        "w-full bg-white border border-[#E0E0E0] rounded-md py-5 px-5 text-lg text-[#222] placeholder:text-lg placeholder:text-[#BDBDBD] font-medium focus:border-[#FFC107] focus:ring-2 focus:ring-[#FFE082] focus:outline-none transition",
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
