import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 font-body",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary-dark rounded-button shadow-xs hover:shadow-sm",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-button",
        outline: "border border-border bg-surface text-foreground hover:bg-background rounded-button",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80 rounded-button",
        ghost: "hover:bg-background text-foreground rounded-button",
        link: "text-primary underline-offset-4 hover:underline",
        accent: "bg-accent text-accent-foreground hover:bg-accent-dark rounded-button font-semibold shadow-xs",
        hero: "bg-primary text-primary-foreground hover:bg-primary-dark rounded-button font-heading font-semibold shadow-sm hover:shadow-md text-16",
      },
      size: {
        default: "h-10 px-4 py-2 text-14",
        sm: "h-9 px-3 text-12",
        lg: "h-12 px-6 text-16",
        xl: "h-14 px-8 text-18",
        icon: "h-10 w-10",
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
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
