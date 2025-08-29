import { useState } from "react";

const Dashboard = () => {
  const [loading, setLoading] = useState(true);

  const handleLoad = () => {
    setLoading(false);
  };

  return (
    <div className="relative w-full h-screen overflow-hidden">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white z-10">
          <p className="text-gray-400 text-center px-6 py-4">Loading...</p>
        </div>
      )}
      <iframe
        // src="http://10.168.81.200:3002/public/dashboard/220788b0-454c-4b80-89f0-7d79a1ff0d9c"
        src="http://172.16.12.98:3000/public/dashboard/2acb6ea5-a0e6-406d-8538-ea1d4f78b876"
        title="Dashboard"
        onLoad={handleLoad}
        className="w-full h-full border-0 zoomed-iframe"
      ></iframe>
    </div>
  );
};

export default Dashboard;
