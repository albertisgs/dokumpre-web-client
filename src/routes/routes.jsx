import { createBrowserRouter } from "react-router-dom";
import Layout from "../layouts/Layout";
import { generateRoutesFromMenu } from "./ListRoutes";
import Login from "../pages/Login/Login";

import MicrosoftCallback from "../components/callback/MicrosoftCallback";
import GoogleCallback from "../components/callback/GoogleCallback";
import ProtectedLoginRoute from "../components/protected/protectedLoginRoute";
import NotFoundPage from "../pages/NotFound/Notfoundpage";
import AgentDashboard from "../pages/AgentDashboard/AgentDashboard";

// This function now creates the entire route configuration dynamically
export const createRouterForUser = (userMenu) => {
  const filteredRoutes = generateRoutesFromMenu(userMenu);
  const finalFilteredRoutes = filteredRoutes.filter(
    (r) => r.path !== "/agent-dashboard"
  );

  const routeConfig = [
    {
      path: "/",
      element: <Layout />,
      children: [
        ...finalFilteredRoutes,
        // Tambahkan rute baru yang lebih spesifik di sini
        {
          path: "/agent-dashboard", // Halaman default
          element: <AgentDashboard/>,
        },
        {
          path: "/agent-dashboard/history", // Halaman riwayat
          element: <AgentDashboard view="history" />,
        },
        {
          path: "/agent-dashboard/:sessionId", // Halaman chat spesifik
          element: <AgentDashboard view="live" />,
        },
      ],
    },
    {
      path: "/login",
      element: (
        <ProtectedLoginRoute>
          <Login />
        </ProtectedLoginRoute>
      ),
    },
    {
      path: "/auth-microsoft/callback",
      element: <MicrosoftCallback />,
    },
    {
      path: "/auth-google/callback",
      element: <GoogleCallback />,
    },
    {
      path: "*",
      element: <NotFoundPage />,
    },
  ];

  return createBrowserRouter(routeConfig);
};
