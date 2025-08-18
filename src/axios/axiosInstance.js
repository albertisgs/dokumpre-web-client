import axios from 'axios';

const GeneralUrl = import.meta.env.VITE_API_URL_GENERAL

const createAxiosInstance = (baseURL) => {
  return axios.create({
    baseURL,
    // timeout: 120000,
    headers: {
      'Content-Type': 'application/json',
    },
  });
};
const AxiosInstanceSession = (baseURL) => {
  const instance = axios.create({
    baseURL,
    headers: {
      'Content-Type': 'application/json',
    },
    withCredentials: true,
  });

  // 👇 TAMBAHKAN INTERCEPTOR DI SINI
  instance.interceptors.response.use(
    (response) => response, // Jika response sukses (2xx), langsung kembalikan
    (error) => {
      // Jika response gagal
      if (error.response && error.response.status === 401) {
        // Cek jika error adalah 401 Unauthorized
        console.error("Sesi tidak valid atau telah berakhir. Melakukan logout...");
        
        // Hapus data sesi dari localStorage
        localStorage.removeItem('authType');
        localStorage.removeItem('user');
        
        window.location.href = '/login';
      }
      
      // Kembalikan error agar bisa ditangani lebih lanjut jika perlu
      return Promise.reject(error);
    }
  );

  return instance;
};

const axiosInstance = {
  general: createAxiosInstance(GeneralUrl),
  generalSession: AxiosInstanceSession(GeneralUrl),
};

export default axiosInstance;