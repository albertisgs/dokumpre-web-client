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
      const { response, config } = error;
      const ignoredUrls = ['api/auth/sign-in', 'api/auth/me'];
      // Cek apakah response 401 dan URL-nya BUKAN salah satu dari yang diabaikan
      if (response && response.status === 401 && !ignoredUrls.includes(config.url)) {
        console.error("Sesi tidak valid di halaman lain. Melakukan logout...");
        
        localStorage.removeItem('authType');
        localStorage.removeItem('user');
        
        // Lakukan redirect hanya jika error terjadi di luar halaman login atau verifikasi sesi
        window.location.href = '/login';
      }
      
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