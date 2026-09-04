import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  // Ink system: a 2px charcoal keyline over a hard, blur-free shadow that
  // collapses on press, so a button physically travels when you hit it.
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-label font-bold ring-offset-background transition-[transform,box-shadow,background-color] duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "border-2 border-ink bg-coral text-white shadow-ink hover:bg-coral-dark hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-ink-lg active:translate-x-1 active:translate-y-1 active:shadow-none",
        destructive:
          "border-2 border-ink bg-destructive text-white shadow-ink hover:bg-coral-dark hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-ink-lg active:translate-x-1 active:translate-y-1 active:shadow-none",
        outline:
          "border-2 border-ink bg-white text-ink shadow-ink hover:bg-cream hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-ink-lg active:translate-x-1 active:translate-y-1 active:shadow-none",
        secondary:
          "border-2 border-ink bg-sky text-ink shadow-ink hover:bg-sky-dark hover:text-white hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-ink-lg active:translate-x-1 active:translate-y-1 active:shadow-none",
        // Vital = alive. Reserved for actions that restore or pay out.
        vital:
          "border-2 border-ink bg-vital text-ink shadow-ink hover:brightness-105 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-ink-lg active:translate-x-1 active:translate-y-1 active:shadow-none",
        ghost: "text-ink hover:bg-cream",
        link: "text-coral underline-offset-4 hover:underline",
      },
      size: {
        default: "h-11 px-fib3 py-2",
        sm: "h-9 px-fib3 text-micro tracking-[0.1em]",
        lg: "h-12 px-fib4",
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
