import { cn } from "@/lib/utils";

type LightningIconProps = {
  className?: string;
  size?: number;
  "aria-hidden"?: boolean;
};

export function LightningIcon({
  className,
  size = 16,
  "aria-hidden": ariaHidden = true,
}: LightningIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      className={cn("block shrink-0 overflow-visible", className)}
      aria-hidden={ariaHidden}
      focusable="false"
    >
      <path
        fill="currentColor"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M14.615 1.595a.75.75 0 0 1 .359.852l-3.92 9.855h7.268a.75.75 0 0 1 .548 1.262l-10.5 11.25a.75.75 0 0 1-1.272-.701L11.018 14.25H3.75a.75.75 0 0 1-.548-1.262l10.5-11.25a.75.75 0 0 1 .913-.143Z"
      />
    </svg>
  );
}
