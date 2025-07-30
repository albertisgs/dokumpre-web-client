import axios from "axios";
import { showAlert } from "../../../utils/alert";
import axiosInstance from "../../../axios/axiosInstance";

export const handleCredentialLogin = async (email, password, updateAuth, navigate) => {
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

    if (profile.data) {
      updateAuth(
        { 
          email: profile.data.email, 
          name: profile.data.username, 
          picture: null 
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

export const handleGoogleLoginSuccess = async (response, updateAuth, navigate, setIsLoading) => {
  try {
    const res = await axios.get(
      "https://www.googleapis.com/oauth2/v1/userinfo",
      {
        headers: {
          Authorization: `Bearer ${response.access_token}`,
          Accept: "application/json",
        },
      }
    );

    if (res.data) {
      updateAuth(
        {
          email: res.data.email,
          name: res.data.name,
          picture: res.data.picture,
        },
        response.access_token,
        "google"
      );
      localStorage.setItem("token", response.access_token);
      navigate("/");
    }
  } catch (error) {
    console.log("error get data", error);
    showAlert({
      title: "Login Failed",
      text: "Failed to fetch user data from Google",
      icon: "error",
    });
  } finally {
    setIsLoading(false);
  }
};