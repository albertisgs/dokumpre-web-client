import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGoogleLogin } from "@react-oauth/google";
import { showAlert } from "../../../utils/alert";
import { useAuth } from "../../../context/AuthContext";
import { handleCredentialLogin, handleGoogleLoginSuccess, handleMicrosoftLogin } from "../handler/loginHandler";


export const useLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const navigate = useNavigate();
  const { updateAuth } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    await handleCredentialLogin(email, password, updateAuth, navigate);
  };

  const handleMicrosoftSubmit = async (e) => {
    e.preventDefault();
    await handleMicrosoftLogin()
  };

  const googleLogin = useGoogleLogin({
    onSuccess: (response) => 
      handleGoogleLoginSuccess(response, updateAuth, navigate, setIsGoogleLoading),
    onError: () => {
      showAlert({
        title: "Login Google",
        icon: "error",
      });
      setIsGoogleLoading(false);
    },
  });

  const handleGoogleLogin = () => {
    setIsGoogleLoading(true);
    googleLogin();
  };

  return {
    email,
    setEmail,
    password,
    setPassword,
    isGoogleLoading,
    handleSubmit,
    handleGoogleLogin,
    handleMicrosoftSubmit
  };
};