"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Download, Share, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AppLogo } from "@/components/ui/app-logo";
import {
  bumpVisitCount,
  dismissPrompt,
  shouldShowPrompt,
  useInstallPrompt,
} from "@/lib/pwa-install";

export function PwaInstallPrompt() {
  const t = useTranslations("PwaInstall");
  const reduced = useReducedMotion();
  const { platform, installable, prompt } = useInstallPrompt();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    bumpVisitCount();
    const t = setTimeout(() => {
      if (
        installable &&
        platform !== "installed" &&
        platform !== "unsupported" &&
        shouldShowPrompt()
      ) {
        setVisible(true);
      }
    }, 1500);
    return () => clearTimeout(t);
  }, [installable, platform]);

  const dismiss = () => {
    dismissPrompt();
    setVisible(false);
  };

  const handleInstall = async () => {
    if (prompt) {
      await prompt();
    }
    setVisible(false);
  };

  if (!visible) return null;
  const isIos = platform === "ios-safari";

  return (
    <AnimatePresence>
      <motion.div
        key="pwa-install"
        role="region"
        aria-label={t("title")}
        className="pointer-events-none fixed inset-x-0 z-30 px-3"
        style={{
          bottom:
            "calc(4rem + env(safe-area-inset-bottom, 0px) + 0.75rem)",
        }}
        initial={reduced ? false : { y: 24, opacity: 0 }}
        animate={reduced ? false : { y: 0, opacity: 1 }}
        exit={reduced ? undefined : { y: 24, opacity: 0 }}
        transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="pointer-events-auto mx-auto flex max-w-md items-center gap-3 rounded-2xl border border-border bg-card/95 p-3 shadow-xl backdrop-blur-md">
          <div className="shrink-0">
            <AppLogo variant="mark" iconSize={36} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-display text-sm font-semibold text-foreground">
              {isIos ? t("iosTitle") : t("title")}
            </p>
            <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
              {isIos ? t("iosBody") : t("description")}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-1.5">
            {!isIos && prompt ? (
              <Button size="sm" onClick={handleInstall}>
                <Download className="size-3.5" strokeWidth={2.4} aria-hidden />
                {t("installCta")}
              </Button>
            ) : null}
            {isIos ? (
              <span
                aria-hidden
                className="inline-flex size-9 items-center justify-center rounded-full border border-border text-primary"
              >
                <Share className="size-4" strokeWidth={2.2} />
              </span>
            ) : null}
            <button
              type="button"
              onClick={dismiss}
              aria-label={t("dismiss")}
              title={t("dismiss")}
              className="inline-flex size-9 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <X className="size-4" strokeWidth={2.4} aria-hidden />
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
