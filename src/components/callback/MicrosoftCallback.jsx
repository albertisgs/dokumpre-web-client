import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useOAuthCallback } from "./hooks/UseOauthCallback";
import { Loader2 } from "lucide-react";

const MicrosoftCallback = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const status = queryParams.get("status");

  useOAuthCallback("microsoft", status)

 useEffect(() => {
    if (status === "login-failed") {
      setTimeout(() => navigate("/login"), 3000);
    } else if (status !== "login-success") {
      // Handle jika status tidak ada atau tidak valid
      navigate("/login", { state: { error: "Invalid callback status" } });
    }
  }, [status, navigate]); 

  return (
    <div className="flex h-screen flex-col items-center justify-center bg-gray-50">
      <div className="mb-8">
        <img
          src="/Dokuprime.svg"
          alt="Dokuprime Logo"
          className="h-8 md:h-10"
        />
      </div>

      <div className="flex flex-col items-center space-y-4">
        <div className="relative h-12 w-12">
          {/* Microsoft logo spinner */}
          <div className="absolute inset-0 flex items-center justify-center">
            <img
              src="/microsoft-svgrepo-com.svg"
              alt="Microsoft icon"
              className="w-5 h-5 mr-2"
            />
          </div>
        </div>

        <p className="text-gray-600">loading with Microsoft...</p>

        <div className="h-1 w-32 overflow-hidden rounded-full bg-gray-200">
           <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        </div>
      </div>
    </div>
  );
};

export default MicrosoftCallback;
