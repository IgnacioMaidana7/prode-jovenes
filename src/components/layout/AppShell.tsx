import { Outlet, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Sidebar } from "./Sidebar";
import { MobileBottomNav } from "./MobileBottomNav";
import { TopBar } from "./TopBar";
import { Toaster } from "@/components/ui/sonner";

const pageVariants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -4 },
};

const pageTransition = {
  duration: 0.25,
  ease: [0.16, 1, 0.3, 1] as const,
};

export function AppShell() {
  const location = useLocation();
  return (
    <div className="flex h-dvh w-full overflow-hidden bg-background">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar />
        <main className="relative flex-1 overflow-y-auto pb-20 lg:pb-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={pageTransition}
              className="mx-auto w-full max-w-6xl px-4 py-6 md:px-8 md:py-8"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
        <MobileBottomNav />
      </div>
      <Toaster />
    </div>
  );
}
