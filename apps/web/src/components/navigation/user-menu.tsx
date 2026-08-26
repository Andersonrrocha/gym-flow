"use client";

import { useState, useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useTheme } from "next-themes";
import {
  Languages,
  LogOut,
  Monitor,
  Moon,
  Ruler,
  Settings,
  Sun,
  User,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useUnits, type WeightUnit } from "@/lib/units/context";
import { useLogout } from "@/hooks/use-logout";
import { cn } from "@/lib/utils";

function useLocaleSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale();
  const [, startTransition] = useTransition();

  return (next: string) => {
    if (next === locale) return;
    const segments = pathname.split("/");
    if (segments[1] === locale) segments[1] = next;
    const nextPath = segments.join("/") || `/${next}`;
    startTransition(() => router.replace(nextPath));
  };
}

function TriggerButton({ ariaLabel }: { ariaLabel: string }) {
  return (
    <span
      aria-label={ariaLabel}
      className="inline-flex size-9 items-center justify-center rounded-full border border-border bg-card text-muted-foreground transition-colors hover:border-border-strong hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background data-[state=open]:bg-muted data-[state=open]:text-foreground"
    >
      <User className="size-4" strokeWidth={2.2} aria-hidden />
    </span>
  );
}

export function UserMenu() {
  return (
    <>
      <div className="lg:hidden">
        <UserMenuMobile />
      </div>
      <div className="hidden lg:block">
        <UserMenuDesktop />
      </div>
    </>
  );
}

/* -------------------------------------------------------------------------- */
/*                                 Desktop                                    */
/* -------------------------------------------------------------------------- */

function UserMenuDesktop() {
  const t = useTranslations("UserMenu");
  const tNav = useTranslations("WorkoutHome");
  const locale = useLocale();
  const { unit, setUnit } = useUnits();
  const { theme, setTheme } = useTheme();
  const { logout } = useLogout();
  const switchLocale = useLocaleSwitcher();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button type="button">
          <TriggerButton ariaLabel={t("openMenu")} />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" sideOffset={8} className="min-w-56">
        <DropdownMenuLabel>{t("preferences")}</DropdownMenuLabel>

        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <Sun className="size-4" aria-hidden />
            <span>{t("theme")}</span>
            <span className="ml-auto mr-1 text-xs text-muted-foreground">
              {theme === "system"
                ? t("themeSystem")
                : theme === "light"
                  ? t("themeLight")
                  : t("themeDark")}
            </span>
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuRadioGroup
              value={theme ?? "dark"}
              onValueChange={setTheme}
            >
              <DropdownMenuRadioItem value="light">
                <Sun className="size-3.5" aria-hidden />
                {t("themeLight")}
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="dark">
                <Moon className="size-3.5" aria-hidden />
                {t("themeDark")}
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="system">
                <Monitor className="size-3.5" aria-hidden />
                {t("themeSystem")}
              </DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <Ruler className="size-4" aria-hidden />
            <span>{t("units")}</span>
            <span className="ml-auto mr-1 text-xs uppercase text-muted-foreground">
              {unit}
            </span>
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuRadioGroup
              value={unit}
              onValueChange={(v) => setUnit(v as WeightUnit)}
            >
              <DropdownMenuRadioItem value="kg">
                {t("unitsKg")}
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="lb">
                {t("unitsLb")}
              </DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <Languages className="size-4" aria-hidden />
            <span>{t("language")}</span>
            <span className="ml-auto mr-1 text-xs uppercase text-muted-foreground">
              {locale}
            </span>
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuRadioGroup
              value={locale}
              onValueChange={switchLocale}
            >
              <DropdownMenuRadioItem value="en">
                {t("languageEnglish")}
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="pt">
                {t("languagePortuguese")}
              </DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        <DropdownMenuSeparator />

        <DropdownMenuItem disabled>
          <Settings className="size-4" aria-hidden />
          <span>{t("settings")}</span>
          <span className="ml-auto text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
            {t("comingSoon")}
          </span>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem tone="destructive" onSelect={() => logout()}>
          <LogOut className="size-4" aria-hidden />
          <span>{tNav("logout")}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/* -------------------------------------------------------------------------- */
/*                                  Mobile                                    */
/* -------------------------------------------------------------------------- */

function UserMenuMobile() {
  const t = useTranslations("UserMenu");
  const tNav = useTranslations("WorkoutHome");
  const locale = useLocale();
  const { unit, setUnit } = useUnits();
  const { theme, setTheme } = useTheme();
  const { logout } = useLogout();
  const switchLocale = useLocaleSwitcher();
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button type="button">
          <TriggerButton ariaLabel={t("openMenu")} />
        </button>
      </DialogTrigger>
      <DialogContent variant="sheet-bottom" showClose={false} className="max-w-md">
        <DialogTitle className="sr-only">{t("title")}</DialogTitle>

        <div className="mx-auto mb-1 h-1 w-10 rounded-full bg-muted-foreground/30" aria-hidden />

        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          {t("preferences")}
        </p>

        <Section icon={<Sun className="size-4" aria-hidden />} label={t("theme")}>
          <Segmented
            value={theme ?? "dark"}
            onChange={(v) => setTheme(v)}
            options={[
              { value: "light", label: t("themeLight") },
              { value: "dark", label: t("themeDark") },
              { value: "system", label: t("themeSystem") },
            ]}
          />
        </Section>

        <Section icon={<Ruler className="size-4" aria-hidden />} label={t("units")}>
          <Segmented
            value={unit}
            onChange={(v) => setUnit(v as WeightUnit)}
            options={[
              { value: "kg", label: "kg" },
              { value: "lb", label: "lb" },
            ]}
          />
        </Section>

        <Section
          icon={<Languages className="size-4" aria-hidden />}
          label={t("language")}
        >
          <Segmented
            value={locale}
            onChange={switchLocale}
            options={[
              { value: "en", label: "EN" },
              { value: "pt", label: "PT" },
            ]}
          />
        </Section>

        <button
          type="button"
          disabled
          className="mt-1 flex w-full items-center gap-3 rounded-xl border border-border bg-muted/40 px-3 py-3 text-left text-sm text-muted-foreground opacity-60"
        >
          <Settings className="size-4" aria-hidden />
          <span className="flex-1">{t("settings")}</span>
          <span className="text-[10px] font-semibold uppercase tracking-wider">
            {t("comingSoon")}
          </span>
        </button>

        <button
          type="button"
          onClick={() => {
            setOpen(false);
            logout();
          }}
          className="mt-1 flex w-full items-center justify-center gap-2 rounded-xl border border-destructive/30 bg-destructive-soft px-3 py-3 text-sm font-semibold text-destructive transition-colors hover:bg-destructive/15 active:scale-[0.99]"
        >
          <LogOut className="size-4" aria-hidden />
          {tNav("logout")}
        </button>
      </DialogContent>
    </Dialog>
  );
}

/* -------------------------------------------------------------------------- */
/*                                 Helpers                                    */
/* -------------------------------------------------------------------------- */

function Section({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2 text-sm font-medium text-foreground">
        <span className="text-muted-foreground" aria-hidden>
          {icon}
        </span>
        <span>{label}</span>
      </div>
      <div>{children}</div>
    </div>
  );
}

function Segmented<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T;
  onChange: (next: T) => void;
  options: Array<{ value: T; label: string }>;
}) {
  return (
    <div
      role="radiogroup"
      className="flex w-full items-stretch gap-1 rounded-xl bg-muted/40 p-1"
    >
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(opt.value)}
            className={cn(
              "flex-1 rounded-lg px-2 py-2 text-sm font-medium transition-colors",
              active
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
