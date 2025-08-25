import { showAlert } from "../../../utils/alert";
import axiosInstance from "../../../axios/axiosInstance";

export const handleCredentialLogin = async (
  email,
  password,
  updateAuth,
  navigate
) => {
  try {
    const loginResponse = await axiosInstance.generalSession.post("api/auth/sign-in", {
      email,
      password,
    });

    // DATA PROFIL SEKARANG ADA DI loginResponse.data
    const profile = loginResponse.data;
    console.log(profile.permission)
    console.log(profile.access_list)

    if (profile) {
      // Kita tidak perlu lagi memanggil API team secara terpisah di sini
      // karena team_name sudah ada di dalam profil
      updateAuth(
        {
          email: profile.email,
          name: profile.username,
          picture: profile.photo_url || null,
          team: profile.team_name, // <-- Gunakan team_name dari profil
          access_list: profile.access_list,
          id_team: profile.id_team,
          permissions: profile.permissions || [],
        },
        "credential"
      );
      
      navigate("/");
    } else {
      // Skenario ini seharusnya tidak terjadi jika backend bekerja dengan benar
      showAlert({
        title: "Login Failed",
        text: "Could not retrieve user profile.",
        icon: "error",
      });
    }
  } catch (error) {
    showAlert({
      title: "Login Failed",
      text: error.response?.data?.detail || "An error occurred",
      icon: "error",
    });
    throw error; // Lemparkan error agar state loading bisa di-handle
  }
};

export const handleMicrosoftLogin = async () => {
  try {
    const response = await axiosInstance.general.get("api/authazure/login");
    // console.log(response.data.auth_url)
    // Redirect to the Azure AD auth URL
    window.location.href = response.data.auth_url;
  } catch (error) {
    console.error("Failed to fetch auth URL:", error);
  }
};

export const handleGoogleBELogin = async () => {
  try {
    const response = await axiosInstance.general.get("api/authgoogle/login");
    window.location.href = response.data.auth_url;
  } catch (error) {
    console.error("Failed to fetch auth URL:", error);
  }
};
