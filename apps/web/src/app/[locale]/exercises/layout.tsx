import { DesktopSidebar } from "@/components/navigation/DesktopSidebar";
import { BottomNavigation } from "@/components/navigation/BottomNavigation";

type ExercisesLayoutProps = {
  children: React.ReactNode;
};

export default function ExercisesLayout({ children }: ExercisesLayoutProps) {
  return (
    <div className="flex min-h-dvh">
      <DesktopSidebar />

      <div className="flex-1 pb-[calc(3.5rem+env(safe-area-inset-bottom))] lg:pb-0">
        {children}
      </div>

      <BottomNavigation />
    </div>
  );
}
