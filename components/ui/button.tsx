import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full font-display font-semibold transition-all duration-200 ease-out active:scale-95 disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tuki-lime focus-visible:ring-offset-2 focus-visible:ring-offset-tuki-night",
  {
    variants: {
      variant: {
        default:
          "bg-tuki-turquoise text-tuki-cream shadow-soft hover:shadow-soft-lg hover:brightness-110",
        lime: "bg-tuki-lime text-tuki-night shadow-soft hover:shadow-soft-lg hover:brightness-105",
        yellow:
          "bg-tuki-yellow text-tuki-night shadow-soft hover:shadow-soft-lg hover:brightness-105",
        whatsapp:
          "bg-[#25D366] text-tuki-night shadow-soft-lg hover:brightness-105",
        outline:
          "border-2 border-tuki-cream/25 bg-transparent text-tuki-cream hover:border-tuki-lime hover:text-tuki-lime",
        ghost: "bg-transparent text-tuki-cream hover:bg-white/10",
      },
      size: {
        default: "h-12 px-6 text-sm",
        sm: "h-9 px-4 text-xs",
        lg: "h-14 px-8 text-base",
        icon: "h-11 w-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
