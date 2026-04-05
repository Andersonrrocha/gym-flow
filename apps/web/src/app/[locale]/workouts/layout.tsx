import { DesktopSidebar } from "@/components/navigation/DesktopSidebar";
import { BottomNavigation } from "@/components/navigation/BottomNavigation";
import { ProactiveRefresh } from "@/components/auth/ProactiveRefresh";

type WorkoutsLayoutProps = {
  children: React.ReactNode;
};

export default function WorkoutsLayout({ children }: WorkoutsLayoutProps) {
  return (
    <div className="flex min-h-dvh">
      <ProactiveRefresh />
      <DesktopSidebar />

      <div className="flex min-h-0 min-w-0 flex-1 flex-col pt-[env(safe-area-inset-top)] pb-[calc(3.5rem+env(safe-area-inset-bottom))] lg:pb-0 lg:pt-0">
        {children}
      </div>

      <BottomNavigation />
    </div>
  );
}
