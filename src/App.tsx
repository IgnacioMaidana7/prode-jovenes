import { useEffect } from "react";
import {
  createBrowserRouter,
  Navigate,
  Outlet,
  RouterProvider,
} from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AppShell } from "@/components/layout/AppShell";
import { HomeView } from "@/views/HomeView";
import { OnboardingView } from "@/views/OnboardingView";
import { ReglasView } from "@/views/ReglasView";
import { GruposView } from "@/views/GruposView";
import { EliminatoriasView } from "@/views/EliminatoriasView";
import { LeaderboardView } from "@/views/LeaderboardView";
import { PerfilView } from "@/views/PerfilView";
import { useIsAuthenticated, useAuthStore } from "@/stores/auth.store";
import { useRealtimeSync } from "@/hooks/useRealtimeSync";
import { UpdateNoticeModal } from "@/components/prode/UpdateNoticeModal";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 30_000,
    },
  },
});

function ProtectedRoute() {
  const isAuthenticated = useIsAuthenticated();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <Outlet />;
}

const router = createBrowserRouter([
  { path: "/login", element: <OnboardingView /> },
  {
    path: "/",
    element: <ProtectedRoute />,
    children: [
      {
        path: "/",
        element: <AppShell />,
        children: [
          { index: true, element: <HomeView /> },
          { path: "reglas", element: <ReglasView /> },
          { path: "grupos", element: <GruposView /> },
          { path: "eliminatorias", element: <EliminatoriasView /> },
          { path: "leaderboard", element: <LeaderboardView /> },
          { path: "perfil", element: <PerfilView /> },
        ],
      },
    ],
  },
  { path: "*", element: <Navigate to="/" replace /> },
]);

function RealtimeBridge() {
  useRealtimeSync();
  return null;
}

function App() {
  const initialize = useAuthStore((s) => s.initialize);

  useEffect(() => {
    initialize();
  }, [initialize]);

  return (
    <QueryClientProvider client={queryClient}>
      <RealtimeBridge />
      <UpdateNoticeModal />
      <RouterProvider router={router} />
    </QueryClientProvider>
  );
}

export default App;
