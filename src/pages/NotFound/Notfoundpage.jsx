import { Link } from 'react-router-dom';
import { Home } from 'lucide-react'; // Menggunakan ikon dari Lucide

const NotFoundPage = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 text-center px-4">
      <div className="max-w-md w-full">
        {/* Ilustrasi atau ikon besar */}
        <div className="mb-6">
          <img 
            src="/error-404.svg" // Ganti dengan path ke file SVG/gambar Anda
            alt="Page Not Found Illustration" 
            className="w-64 h-64 mx-auto"
          />
        </div>
        <h2 className="mt-4 text-3xl font-bold text-gray-800">
          Halaman Tidak Ditemukan
        </h2>
        <p className="mt-4 text-gray-600">
          Maaf, kami tidak dapat menemukan halaman yang Anda cari. Mungkin URL-nya salah atau halaman tersebut telah dipindahkan.
        </p>

        <Link
          to="/"
          className="mt-8 inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-transform transform hover:scale-105"
        >
          <Home className="mr-2 -ml-1 h-5 w-5" />
          Kembali ke Beranda
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;