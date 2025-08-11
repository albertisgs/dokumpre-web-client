import { showAlert } from "../../../utils/alert";
import axiosInstance from "../../../axios/axiosInstance";

export const handleCredentialLogin = async (
  email,
  password,
  updateAuth,
  navigate
) => {
  try {
    const token = await axiosInstance.general.post("api/auth/sign-in", {
      email,
      password,
    });

    const profile = await axiosInstance.general.get("api/auth/me", {
      headers: {
        Authorization: `Bearer ${token.data.access_token}`,
        Accept: "application/json",
      },
    });

    const role = await axiosInstance.general.get(
      `api/user-management/roles/${profile.data?.id_role}`,
      {
        headers: {
          Authorization: `Bearer ${token.data.access_token}`,
          Accept: "application/json",
        },
      }
    );

    if (profile.data) {
      updateAuth(
        {
          email: profile.data.email,
          name: profile.data.username,
          picture: null,
          role: role.data?.name,
        },
        token.data.access_token,
        "credential"
      );
      localStorage.setItem("token", token.data.access_token);
      navigate("/");
    } else {
      showAlert({
        title: "Login Failed",
        text: "Invalid email or password.",
        icon: "error",
      });
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
