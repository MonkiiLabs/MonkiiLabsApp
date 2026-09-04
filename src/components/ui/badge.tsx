import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

/* A badge is a reading, so it is a tinted chip on a hairline rather than
   a solid sticker in a charcoal keyline. Only `destructive` fills, and
   only because an alarm should read hotter than its surroundings. */
const badgeVariants = cva(
  "inline-flex items-center rounded-sm border px-fib2 py-0.5 text-micro font-semibold uppercase transition-colors focus:outline-none focus:ring-2 focus:ring-act-lit focus:ring-offset-2 focus:ring-offset-bench",
  {
    variants: {
      variant: {
        default: "border-act/35 bg-act/12 text-act-lit",
        secondary: "border-hair/12 bg-hair/[0.05] text-paper-2",
        destructive: "border-act-lit/50 bg-act text-paper",
        vital: "border-alive/35 bg-alive/12 text-alive-lit",
        muted: "border-hair/8 bg-hair/[0.03] text-paper-3",
        outline: "border-hair/16 bg-transparent text-paper-2",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
