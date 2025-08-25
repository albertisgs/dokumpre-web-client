import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/hooks/useAuth";

const ProtectedLoginRoute = ({ children }) => {
  const { authState } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Efek ini akan berjalan setelah komponen di-mount.
    // Jika pengguna sudah login saat mereka mencoba membuka halaman /login,
    // maka kita arahkan mereka ke halaman utama.
    if (authState.authType) {
      navigate('/', { replace: true });
    }
  }, [authState.authType, navigate]);

  // Jika belum terautentikasi, tampilkan halaman login.
  // Jika sudah terautentikasi, jangan tampilkan apa-apa (karena useEffect akan mengalihkan).
  return authState.authType ? null : children;
};

export default ProtectedLoginRoute;