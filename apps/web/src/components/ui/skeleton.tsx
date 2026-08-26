import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const skeletonVariants = cva(
  "relative overflow-hidden bg-muted/60 motion-safe:animate-pulse",
  {
    variants: {
      shape: {
        rect: "rounded-lg",
        text: "rounded-md",
        circle: "rounded-full",
        pill: "rounded-full",
      },
    },
    defaultVariants: {
      shape: "rect",
    },
  },
);

export interface SkeletonProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof skeletonVariants> {}

export const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  ({ className, shape, ...props }, ref) => (
    <div
      ref={ref}
      role="status"
      aria-label="Loading"
      aria-busy="true"
      className={cn(skeletonVariants({ shape }), className)}
      {...props}
    />
  ),
);
Skeleton.displayName = "Skeleton";

export function SkeletonRow({
  lines = 2,
  className,
}: {
  lines?: number;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          shape="text"
          className={cn("h-3", i === lines - 1 ? "w-2/3" : "w-full")}
        />
      ))}
    </div>
  );
}
