import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full px-3 py-1 font-display text-xs font-bold uppercase tracking-wide",
  {
    variants: {
      variant: {
        lime: "bg-tuki-lime text-tuki-night",
        yellow: "bg-tuki-yellow text-tuki-night",
        turquoise: "bg-tuki-turquoise text-tuki-cream",
        outline: "border border-tuki-cream/30 text-tuki-cream",
        night: "bg-tuki-night/70 text-tuki-cream backdrop-blur",
      },
    },
    defaultVariants: {
      variant: "lime",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
