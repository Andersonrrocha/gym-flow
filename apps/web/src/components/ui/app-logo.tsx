import Image from "next/image";
import { cn } from "@/lib/utils";

const ICON_VIEW_W = 341;
const ICON_VIEW_H = 196;
const TEXT_VIEW_W = 418;
const TEXT_VIEW_H = 127;

type AppLogoProps = {
  variant?: "mark" | "inline" | "stacked";
  iconSize?: number;
  textWidth?: number;
  className?: string;
};

export function AppLogo({
  variant = "inline",
  iconSize = 32,
  textWidth: textWidthProp,
  className,
}: AppLogoProps) {
  const iconW = iconSize;
  const iconH = Math.round((iconSize * ICON_VIEW_H) / ICON_VIEW_W);

  const icon = (
    <Image
      src="/logo-icon.svg"
      alt="GymFlow"
      width={iconW}
      height={iconH}
      className="shrink-0 object-contain"
      priority={variant === "stacked"}
    />
  );

  if (variant === "mark") {
    return (
      <div className={cn("flex items-center", className)}>{icon}</div>
    );
  }

  const stackedTextW =
    textWidthProp ?? Math.min(320, Math.round(iconSize * 3.8));
  const stackedTextH = Math.round(
    (stackedTextW * TEXT_VIEW_H) / TEXT_VIEW_W,
  );

  const inlineTextH = Math.max(20, Math.round(iconH * 1.65));
  const inlineTextW = Math.round((inlineTextH * TEXT_VIEW_W) / TEXT_VIEW_H);

  const wordmarkStacked = (
    <Image
      src="/logo-text.svg"
      alt=""
      width={stackedTextW}
      height={stackedTextH}
      sizes={`${stackedTextW}px`}
      className="h-auto w-full max-w-full object-contain object-center"
      style={{ maxWidth: stackedTextW }}
      aria-hidden
    />
  );

  const wordmarkInline = (
    <Image
      src="/logo-text.svg"
      alt=""
      width={inlineTextW}
      height={inlineTextH}
      className="max-h-[32px] w-auto max-w-[min(200px,55vw)] object-contain object-left"
      aria-hidden
    />
  );

  if (variant === "stacked") {
    return (
      <div className={cn("flex flex-col items-center gap-2", className)}>
        {icon}
        {wordmarkStacked}
      </div>
    );
  }

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {icon}
      {wordmarkInline}
    </div>
  );
}
