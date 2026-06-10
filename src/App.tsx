import {
  createBrowserRouter,
  Navigate,
  RouterProvider,
} from "react-router-dom";
import { AppShell } from "@/components/layout/AppShell";
import { HomeView } from "@/views/HomeView";
import { LoginView } from "@/views/LoginView";
import { ReglasView } from "@/views/ReglasView";
import { GruposView } from "@/views/GruposView";
import { EliminatoriasView } from "@/views/EliminatoriasView";
import { LeaderboardView } from "@/views/LeaderboardView";
import { PerfilView } from "@/views/PerfilView";

const router = createBrowserRouter([
  {
    path: "/login",
    element: <LoginView />,
  },
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
  { path: "*", element: <Navigate to="/" replace /> },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
