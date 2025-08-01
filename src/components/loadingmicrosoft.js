export default function loadingmicrosoft() {
  return (
     <div className="flex h-screen flex-col items-center justify-center bg-gray-50">
      <div className="mb-8">
        <img
          src="/Dokuprime.svg"
          alt="Dokuprime Logo"
          className="h-8 md:h-10"
        />
      </div>
      
      <div className="flex flex-col items-center space-y-4">
        <div className="relative h-12 w-12">
          {/* Microsoft logo spinner */}
          <div className="absolute inset-0 flex items-center justify-center">
            <img
                  src="/microsoft-svgrepo-com.svg"
                  alt="Google icon"
                  className="w-5 h-5 mr-2"
                />
          </div>
        </div>
        
        <p className="text-gray-600">Signing in with Microsoft...</p>
        
        <div className="h-1 w-32 overflow-hidden rounded-full bg-gray-200">
          <div className="h-full w-full animate-indeterminate bg-blue-500"></div>
        </div>
      </div>
    </div>
  )
}
