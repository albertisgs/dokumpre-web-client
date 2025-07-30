import { Suspense } from "react";
import "./App.css";
import { router } from "./routes/routes";
import { RouterProvider } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { AuthProvider } from "./context/AuthContext";
import { GoogleOAuthProvider } from "@react-oauth/google";

const GoogleClient = import.meta.env.VITE_GOOGLE_CLIENT_ID

function App() {
  return (
    <GoogleOAuthProvider clientId={GoogleClient}>
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
          <RouterProvider router={router} />
        </Suspense>
      </AuthProvider>
    </GoogleOAuthProvider>
  );
}

export default App;
