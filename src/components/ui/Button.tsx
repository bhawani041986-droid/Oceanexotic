import React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-[--radius-button] text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]",
  {
    variants: {
      variant: {
        primary: "bg-[var(--c-primary)] text-[var(--foreground)] shadow-[var(--c-shadow-glow)] hover:opacity-90",
        secondary: "bg-[var(--c-bg-alt)] border border-[var(--border)] text-[var(--c-text-primary)] hover:bg-[var(--foreground)]/5",
        outline: "border border-[var(--border)] bg-transparent hover:bg-[var(--foreground)]/5 text-[var(--c-text-primary)]",
        ghost: "hover:bg-[var(--foreground)]/5 text-[var(--c-text-secondary)] hover:text-[var(--c-text-primary)]",
        danger: "bg-danger text-white hover:opacity-90",
      },
      size: {
        default: "h-[48px] px-8 py-2",
        sm: "h-10 px-4 text-xs",
        lg: "h-14 px-12 text-base",
        icon: "h-12 w-12",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
