import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

/* =====================================================================
   Button.

   The previous build gave every button a 2px charcoal keyline over a
   hard offset shadow that collapsed on press, so buttons physically
   travelled across the page. That is a comic-book device, and it was the
   loudest source of the cartoon read.

   What replaces it: a filled red slab for the one action that matters,
   hairlines for everything else, and a 97% scale on press, felt rather
   than watched. Red is the only fill, because red is the only colour on
   this site you are meant to press.
   ===================================================================== */

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-label font-semibold transition-[background-color,border-color,color,transform] duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-act-lit focus-visible:ring-offset-2 focus-visible:ring-offset-bench active:scale-[0.97] disabled:pointer-events-none disabled:opacity-40 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "border border-act-lit/50 bg-act text-paper hover:bg-act-lit active:bg-act-deep",
        destructive:
          "border border-act-lit/50 bg-act text-paper hover:bg-act-lit active:bg-act-deep",
        outline:
          "border border-hair/13 bg-hair/[0.04] text-paper hover:border-hair/25 hover:bg-hair/10",
        secondary:
          "border border-hair/10 bg-bench-3 text-paper hover:border-hair/20 hover:bg-bench-4",
        // Reserved for reporting, not for acting. Green never fills a
        // button: it outlines one, because green means "alive", and a
        // reading is not a command.
        vital:
          "border border-alive/35 bg-alive/10 text-alive-lit hover:border-alive/60 hover:bg-alive/15",
        ghost: "text-paper-2 hover:bg-hair/[0.06] hover:text-paper",
        link: "text-act-lit underline-offset-4 hover:underline",
      },
      size: {
        // 40px floor everywhere, so no control drops under the tap target.
        default: "h-10 px-fib3",
        sm: "h-9 px-fib2 text-micro font-semibold uppercase",
        lg: "h-11 px-fib4",
        icon: "h-10 w-10 p-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
