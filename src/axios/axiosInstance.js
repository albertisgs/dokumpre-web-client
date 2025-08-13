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
  return axios.create({
    baseURL,
    // timeout: 120000,
    headers: {
      'Content-Type': 'application/json',
    },
    withCredentials:true
  });
};

const axiosInstance = {
  general: createAxiosInstance(GeneralUrl),
  generalSession: AxiosInstanceSession(GeneralUrl)
};

export default axiosInstance;