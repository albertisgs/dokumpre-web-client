import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Loader2 } from "lucide-react"; // Assuming you use lucide-react for icons
import axiosInstance from "../axios/axiosInstance";

const GoogleCallback = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { updateAuth} = useAuth(); // Use the refetch function from the new context

  const [statusMessage, setStatusMessage] = useState(
    "Verifying your Google Account..."
  );

  useEffect(() => {
    const handleAuthCallback = async () => {
      const queryParams = new URLSearchParams(location.search);
      const status = queryParams.get("status");

      if (status === "login-success") {
        const verifyUser = async () => {
          try {
            const profile = await axiosInstance.generalSession.get(
              "api/auth/me"
            );
            const role = await axiosInstance.generalSession.get(
              `api/user-management/roles/${profile.data?.id_role}`
            );

            if (profile.data) {
              updateAuth(
                {
                  email: profile.data.email,
                  name: profile.data.username,
                  picture: profile.data.photo_url,
                  role: role.data?.name,
                },
                "google"
              );
            }

            // Redirect to the protected route (e.g., dashboard)
            navigate("/");
          } catch (error) {
            console.error("verification failed:", error);
            navigate("/login", { state: { error: "Authentication failed" } });
          }
        };

        verifyUser();
        setTimeout(() => {
          navigate("/");
        }, 5000); // Redirect to the main dashboard
      } else {
        // Handle failure cases (e.g., 'unauthorized' or 'login-failed')
        let message = "An unknown error occurred during login.";
        if (status === "unauthorized") {
          message =
            "Your Google account is not authorized to use this application.";
        } else if (status === "login-failed") {
          message = "Login failed. Please try again.";
        }

        setStatusMessage(message);

        // Redirect back to the login page after a short delay
        setTimeout(() => {
          navigate("/login");
        }, 3000); // 3-second delay to show the message
      }
    };

    handleAuthCallback();
  }, [location.search, navigate, updateAuth]);

  return (
    <div className="flex h-screen flex-col items-center justify-center bg-gray-50">
      <div className="mb-8">
        <img
          src="/Dokuprime.svg"
          alt="Dokuprime Logo"
          className="h-8 md:h-10"
        />
      </div>

      <div className="flex flex-col items-center space-y-4 text-center">
        <img
          src="/icons8-google-48.png"
          alt="Google icon"
          className="h-12 w-12 mb-4"
        />

        <p className="text-lg text-gray-600 px-4">{statusMessage}</p>

        {/* Show a loader only while verifying */}
        {statusMessage.includes("Verifying") && (
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        )}
      </div>
    </div>
  );
};

export default GoogleCallback;
