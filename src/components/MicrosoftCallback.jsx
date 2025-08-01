import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import axiosInstance from "../axios/axiosInstance";
import { useAuth } from "../context/AuthContext";

const MicrosoftCallback = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { updateAuth, logout } = useAuth();

  useEffect(() => {
    // Extract query parameters from the URL
    const queryParams = new URLSearchParams(location.search);
    const accessToken = queryParams.get("access_token");
    const idToken = queryParams.get("id_token");
    const logoutParam = queryParams.get("logout");

    if (logoutParam) {
      // Perform logout and redirect to login after 3 seconds
      setTimeout(() => {
        navigate("/login");
      }, 3000);
      return;
    }

    if (accessToken) {
      // Verify token and proceed with authentication
      const verifyToken = async () => {
        try {
          const response = await axios.get(
            "http://localhost:9898/api/authazure/verify-token",
            {
              headers: {
                Authorization: `Bearer ${idToken}`,
              },
            }
          );
          console.log("Token verified:", response.data);

          const profile = await axiosInstance.general.get("api/authazure/me", {
            headers: {
              Authorization: `Bearer ${idToken}`,
              Accept: "application/json",
            },
          });

          if (profile.data) {
            updateAuth(
              {
                email: profile.data.email,
                name: profile.data.username,
                picture: null,
              },
              accessToken,
              "microsoft",
              idToken
            );
          }

          // Store the token in localStorage
          localStorage.setItem("token", accessToken);
          if (idToken) {
            localStorage.setItem("id_token", idToken);
          }

          // Redirect to the protected route (e.g., dashboard)
          navigate("/");
        } catch (error) {
          console.error("Token verification failed:", error);
          navigate("/login", { state: { error: "Authentication failed" } });
        }
      };

      verifyToken();
    } else {
      navigate("/login", { state: { error: "No token received" } });
    }
  }, [navigate, location.search, updateAuth, logout]);

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
          <div className="h-full w-full animate-indeterminate bg-blue-500"></div>
        </div>
      </div>
    </div>
  );
};

export default MicrosoftCallback;