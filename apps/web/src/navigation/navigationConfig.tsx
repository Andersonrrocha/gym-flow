import type { LucideIcon } from "lucide-react";
import {
  Calendar,
  Dumbbell,
  List,
  Settings,
  TrendingUp,
} from "lucide-react";

export type NavigationItem = {
  key: string;
  labelKey: string;
  href: string;
  icon: LucideIcon;
  enabled: boolean;
};

export const navigationItems: NavigationItem[] = [
  {
    key: "workouts",
    labelKey: "workouts",
    href: "/workouts",
    icon: Dumbbell,
    enabled: true,
  },
  {
    key: "exercises",
    labelKey: "exercises",
    href: "/exercises",
    icon: List,
    enabled: true,
  },
  {
    key: "schedule",
    labelKey: "schedule",
    href: "/schedule",
    icon: Calendar,
    enabled: false,
  },
  {
    key: "progress",
    labelKey: "progress",
    href: "/progress",
    icon: TrendingUp,
    enabled: false,
  },
  {
    key: "settings",
    labelKey: "settings",
    href: "/settings",
    icon: Settings,
    enabled: false,
  },
];
