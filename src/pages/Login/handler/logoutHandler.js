import axiosInstance from "../../../axios/axiosInstance";

export const handleGoogleBELogout = async (token) => {
    try {
      // The signature is axios.post(url, data, config)
      const response = await axiosInstance.general.post(
        'api/authgoogle/logout',
        null,
        {   
          headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/json",
            },
        }
      )
      return response.data
    } catch (error) {
      console.error('Failed to logout:', error);
      // We can also throw the error to be handled by the component
      throw error;
    } 
  }