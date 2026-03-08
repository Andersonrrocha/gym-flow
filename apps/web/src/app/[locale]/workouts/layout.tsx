import { DesktopSidebar } from "@/components/navigation/DesktopSidebar";
import { BottomNavigation } from "@/components/navigation/BottomNavigation";

type WorkoutsLayoutProps = {
  children: React.ReactNode;
};

export default function WorkoutsLayout({ children }: WorkoutsLayoutProps) {
  return (
    <div className="flex min-h-dvh">
      <DesktopSidebar />

      <div className="flex-1 pb-16 lg:pb-0">{children}</div>

      <BottomNavigation />
    </div>
  );
}
