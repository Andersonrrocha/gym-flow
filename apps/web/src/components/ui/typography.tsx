import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const headingVariants = cva("font-display tracking-tight text-foreground", {
  variants: {
    level: {
      h1: "text-3xl font-bold leading-[1.1] sm:text-4xl",
      h2: "text-2xl font-bold leading-tight sm:text-3xl",
      h3: "text-xl font-semibold leading-snug sm:text-2xl",
      h4: "text-lg font-semibold leading-snug",
      h5: "text-base font-semibold leading-snug",
      h6: "text-sm font-semibold leading-snug",
    },
  },
  defaultVariants: {
    level: "h2",
  },
});

type HeadingTag = "h1" | "h2" | "h3" | "h4" | "h5" | "h6";

type HeadingProps = React.HTMLAttributes<HTMLHeadingElement> &
  VariantProps<typeof headingVariants> & {
    as?: HeadingTag;
  };

export const Heading = React.forwardRef<HTMLHeadingElement, HeadingProps>(
  ({ className, level = "h2", as, ...props }, ref) => {
    const Tag: HeadingTag = as ?? (level as HeadingTag) ?? "h2";
    return React.createElement(Tag, {
      ref,
      className: cn(headingVariants({ level }), className),
      ...props,
    });
  },
);
Heading.displayName = "Heading";

const displayVariants = cva(
  "font-display font-bold tracking-tight tabular-nums text-foreground",
  {
    variants: {
      size: {
        sm: "text-3xl leading-none",
        md: "text-4xl leading-none",
        lg: "text-5xl leading-none",
        xl: "text-6xl leading-none",
      },
    },
    defaultVariants: { size: "md" },
  },
);

export interface DisplayProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof displayVariants> {}

export const Display = React.forwardRef<HTMLDivElement, DisplayProps>(
  ({ className, size, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(displayVariants({ size }), className)}
      {...props}
    />
  ),
);
Display.displayName = "Display";

const textVariants = cva("font-sans", {
  variants: {
    size: {
      xs: "text-xs",
      sm: "text-sm",
      base: "text-base",
      lg: "text-lg",
    },
    tone: {
      default: "text-foreground",
      muted: "text-muted-foreground",
      primary: "text-primary",
      destructive: "text-destructive",
      success: "text-success",
    },
    weight: {
      regular: "font-normal",
      medium: "font-medium",
      semibold: "font-semibold",
      bold: "font-bold",
    },
  },
  defaultVariants: {
    size: "sm",
    tone: "default",
    weight: "regular",
  },
});

type TextTag = "p" | "span" | "div" | "label";

export interface TextProps
  extends React.HTMLAttributes<HTMLElement>,
    VariantProps<typeof textVariants> {
  as?: TextTag;
}

export const Text = React.forwardRef<HTMLElement, TextProps>(
  ({ className, size, tone, weight, as = "p", ...props }, ref) => {
    return React.createElement(as, {
      ref,
      className: cn(textVariants({ size, tone, weight }), className),
      ...props,
    });
  },
);
Text.displayName = "Text";

export const Mono = React.forwardRef<
  HTMLSpanElement,
  React.HTMLAttributes<HTMLSpanElement>
>(({ className, ...props }, ref) => (
  <span
    ref={ref}
    className={cn("font-mono tabular-nums", className)}
    {...props}
  />
));
Mono.displayName = "Mono";

export const Eyebrow = React.forwardRef<
  HTMLSpanElement,
  React.HTMLAttributes<HTMLSpanElement>
>(({ className, ...props }, ref) => (
  <span
    ref={ref}
    className={cn(
      "text-[11px] font-semibold uppercase tracking-wider text-muted-foreground",
      className,
    )}
    {...props}
  />
));
Eyebrow.displayName = "Eyebrow";
