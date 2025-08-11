import { Suspense, useMemo } from "react";
import "./App.css";
import { createRouterForUser} from "./routes/routes";
import { RouterProvider } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { menu } from "./configs/menu";

// A new component to handle the dynamic router creation
const AppRouter = () => {
  const { authState } = useAuth();
  const userRole = authState.user?.role;

  // useMemo will re-calculate the router only when the user's role changes
  const router = useMemo(() => {
    const accessibleMenu = menu.filter(item => {
      return !item.roles || item.roles.includes(userRole);
    });
    return createRouterForUser(accessibleMenu);
  }, [userRole]);

  return <RouterProvider router={router} />;
}
function App() {
  return (
     <AuthProvider>
        <Suspense
          fallback={
            <div className="p-6 flex items-center justify-center min-h-[400px]">
              <div className="text-center">
                <Loader2 className="animate-spin w-8 h-8 mx-auto mb-4 text-blue-600" />
                <p className="text-gray-600">Loading...</p>
              </div>
            </div>
          }
        >
          <AppRouter/>
        </Suspense>
      </AuthProvider>
  );
}

export default App;
