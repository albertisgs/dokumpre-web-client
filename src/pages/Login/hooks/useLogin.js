import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { handleCredentialLogin, handleGoogleBELogin, handleMicrosoftLogin } from "../handler/loginHandler";
import { useAuth } from "../../../context/hooks/UseAuth";


export const useLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false); 
  const navigate = useNavigate();
  const { updateAuth } = useAuth();

 const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); // 2. Atur loading menjadi true saat proses dimulai
    try {
      await handleCredentialLogin(email, password, updateAuth, navigate);
    } catch (error) {
      console.error("error login user", error)
    } finally {
      setLoading(false); // 3. Atur loading kembali ke false setelah selesai (baik berhasil maupun gagal)
    }
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
    handleGoogleBESubmit,
    loading
  };
};