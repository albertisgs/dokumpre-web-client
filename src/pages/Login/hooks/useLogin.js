import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import { handleCredentialLogin, handleGoogleBELogin, handleMicrosoftLogin } from "../handler/loginHandler";


export const useLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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

  const handleGoogleBESubmit = async (e) => {
    e.preventDefault();
    await handleGoogleBELogin()
  };

  return {
    email,
    setEmail,
    password,
    setPassword,
    handleSubmit,
    handleMicrosoftSubmit,
    handleGoogleBESubmit
  };
};