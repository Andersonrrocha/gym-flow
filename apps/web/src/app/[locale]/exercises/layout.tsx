import { DesktopSidebar } from "@/components/navigation/DesktopSidebar";
import { BottomNavigation } from "@/components/navigation/BottomNavigation";

type ExercisesLayoutProps = {
  children: React.ReactNode;
};

export default function ExercisesLayout({ children }: ExercisesLayoutProps) {
  return (
    <div className="flex min-h-dvh">
      <DesktopSidebar />

      <div className="flex flex-1 flex-col pt-[var(--app-safe-top)] pb-[calc(3.5rem+var(--app-safe-bottom))] lg:pb-0 lg:pt-0">
        {children}
      </div>

      <BottomNavigation />
    </div>
  );
}
