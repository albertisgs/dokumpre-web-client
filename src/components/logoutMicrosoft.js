// src/components/Logout.jsx
import { useNavigate } from "react-router-dom";
import axiosInstance from "../axios/axiosInstance";

export const MicrosoftLogout = () => {
  const navigate = useNavigate();
  const handleMicrosoftLogout = async () => {
    try {
      // Call the backend logout endpoint
      const response = await axiosInstance.generalSession.get("/api/authazure/logout");
      const { auth_url } = response.data;
      window.location.href = auth_url;
      // Clear tokens from localStorage
    } catch (error) {
      console.error("Logout failed:", error);
      // Optionally redirect to login page with an error
      navigate("/login", { state: { error: "Logout failed" } });
    }
  };

  return {
    handleMicrosoftLogout,
  };
};
