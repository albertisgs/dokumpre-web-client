import { showAlert } from "../../../utils/alert";
import axiosInstance from "../../../axios/axiosInstance";

export const handleCredentialLogin = async (
  email,
  password,
  updateAuth,
  navigate
) => {
  try {
    const login = await axiosInstance.generalSession.post("api/auth/sign-in", {
      email,
      password,
    });
    if (login.status == 200) {
      const profile = await axiosInstance.generalSession.get("api/auth/me");
      const team = await axiosInstance.generalSession.get(
        `api/user-management/teams/${profile.data?.id_team}`
      );

      if (profile.data) {
        updateAuth(
          {
            email: profile.data.email,
            name: profile.data.username,
            picture: null,
            team: team.data?.name,
            access_list: profile.data.access_list,
            id_team: profile.data.id_team,
            permissions: profile.data.permissions || [],
          },
          "credential"
        );
        
        navigate("/");
      } else {
        showAlert({
          title: "Login Failed",
          text: "Invalid email or password.",
          icon: "error",
        });
      }
    }
  } catch (error) {
    showAlert({
      title: "Login Failed",
      text: error.response?.data?.message || "An error occurred",
      icon: "error",
    });
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
