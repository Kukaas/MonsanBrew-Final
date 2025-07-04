import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils"
import { Loader } from "lucide-react";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-xs hover:bg-primary/90",
        destructive:
          "bg-destructive text-white shadow-xs hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        outline:
          "border bg-background text-lg font-bold shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50",
        secondary:
          "bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/80",
        ghost:
          "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",
        link: "text-primary underline-offset-4 hover:underline",
        yellow:
          "bg-[#FFC107] text-lg text-white font-bold rounded-md shadow-none border-none hover:bg-[#e6ac06] focus-visible:ring-2 focus-visible:ring-[#FFC107]/60 focus-visible:ring-offset-2 transition-colors",
        "yellow-outline": "border border-[#FFC107] bg-[#232323] text-white text-lg font-bold shadow-xs hover:bg-[#232323] hover:border-[#b38f00] hover:text-white"
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        icon: "size-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

// Update Spinner to use Lucide Loader icon
const Spinner = ({ colorClass = "text-current" }) => (
  <Loader className={`animate-spin mr-2 h-5 w-5 ${colorClass}`} />
);

const Button = React.forwardRef(function Button({
  className,
  variant,
  size,
  asChild = false,
  loading = false,
  disabled,
  children,
  ...props
}, ref) {
  const Comp = asChild ? Slot : "button";
  // Determine spinner color for yellow variant
  const spinnerColorClass = variant === "yellow" ? "text-[#232323]" : "text-current";
  return (
    <Comp
      ref={ref}
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Spinner colorClass={spinnerColorClass} />}
      {children}
    </Comp>
  );
});

Button.displayName = "Button";

export { Button, buttonVariants }
