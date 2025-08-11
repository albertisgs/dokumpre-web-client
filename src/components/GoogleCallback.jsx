import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axiosInstance from "../axios/axiosInstance";
import { useAuth } from "../context/AuthContext";
import { handleGoogleBELogout } from "../pages/Login/handler/logoutHandler";

const GoogleCallback = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { updateAuth, logout } = useAuth();
  // Corrected: useState returns an array [value, setter], not an object.
  const [isVerifying, setIsVerifying] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    // A cleanup function is needed for the timeout to prevent memory leaks
    let timeoutId;

    const queryParams = new URLSearchParams(location.search);
    const accessToken = queryParams.get("access_token");
    const idToken = queryParams.get("id_token");

    const authenticateUser = async () => {
      if (!accessToken) {
        navigate("/login", { state: { error: "No token received" } });
        return;
      }

      try {
        const profileResponse = await axiosInstance.general.get("api/authgoogle/me", {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            Accept: "application/json",
          },
        });
        const userProfile = profileResponse.data;

        const verificationResponse = await axiosInstance.general.post(
          "api/user-management/email/check",
          {
            // Note: 'id_user' is being set to the email. Ensure this is the intended backend behavior.
            email: userProfile.email,
            id_user: userProfile.id,
          }
        );
        
        const role = await axiosInstance.general.get(
          `api/user-management/roles/${userProfile.id_role}`,
          {
            headers: {
              Authorization: `Bearer ${idToken}`,
              Accept: "application/json",
            },
          }
        );

        // Improvement: Check for a more robust condition than a "magic string".
        if (verificationResponse.data?.status === "successful") {
          updateAuth(
            {
              email: userProfile.email,
              name: userProfile.username,
              picture: userProfile.picture,
              role:role.data?.name
            },
            accessToken,
            "google"
          );
          // For security, consider using httpOnly cookies instead of localStorage.
          localStorage.setItem("token", accessToken);
          if (idToken) {
            localStorage.setItem("id_token", idToken);
          }
          navigate("/");
        } else {
          setIsVerifying(false);
          setErrorMessage("Your Google account is not registered with Dokuprime.");
          await handleGoogleBELogout(accessToken);
          logout();

          timeoutId = setTimeout(() => {
            navigate("/login");
          }, 3000);
        }
      } catch (error) {
        console.error("Authentication failed:", error);
        setIsVerifying(false);
        setErrorMessage("Your Google account is not registered with Dokuprime.");
        logout(); // Ensure user is logged out on error

        timeoutId = setTimeout(() => {
          navigate("/login", { state: { error: "Authentication failed" } });
        }, 3000);
      }
    };

    authenticateUser();

    // Cleanup function to clear the timeout if the component unmounts
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
    // location.search is sufficient. The other functions are stable.
  }, [location.search, navigate, updateAuth, logout]);

  return (
    <div className="flex h-screen flex-col items-center justify-center bg-gray-50">
      <div className="mb-8">
        <img src="/Dokuprime.svg" alt="Dokuprime Logo" className="h-8 md:h-10" />
      </div>

      <div className="flex flex-col items-center space-y-4">
        <div className="relative flex h-12 w-12 items-center justify-center">
          <img src="/icons8-google-48.png" alt="Google icon" className="h-5 w-5" />
        </div>
        
        <p className="text-lg text-gray-600">
          {isVerifying ? "Verifying your Google Account..." : errorMessage}
        </p>
        
        {isVerifying && (
          <div className="h-1 w-32 overflow-hidden rounded-full bg-gray-200">
            <div className="h-full w-full animate-indeterminate bg-blue-500"></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GoogleCallback;