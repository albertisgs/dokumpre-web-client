import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { showAlert } from '../../utils/alert';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

const handleSubmit = (e) => {
  e.preventDefault();
  const validCredentials = [
    { email: 'superadmin@is-gs.com', password: 'superadmin' },
    { email: 'cia@is-gs.com', password: 'cia' }
  ];

  const isValid = validCredentials.some(
    (cred) => cred.email === email && cred.password === password
  );

  if (isValid) {
    localStorage.setItem('token', 'fakeToken');
    navigate('/');
  } else {
    showAlert({
      title: 'Login Failed',
      text: 'Invalid email or password.',
      icon: 'error',
    });
  }
};


  return (
    <div className="bg-gray-50 min-h-screen flex w-full font-open-sans">
      <div
        className="relative w-full md:w-1/2 flex items-center justify-start px-8 md:px-12 lg:px-20 py-16 text-white"
        style={{
          backgroundImage: 'url("/abstract-wave.png")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-black opacity-50 z-0" />
        <div className="relative z-10">
          <h1 className="text-3xl lg:text-4xl font-extrabold mb-4">Welcome to</h1>
          <h2 className="text-5xl lg:text-6xl font-extrabold text-white">Dokuprime</h2>
        </div>
      </div>

      <div className="w-full md:w-1/2 flex flex-col items-center justify-center p-8 md:p-12 lg:p-16 relative">
        <div className="absolute top-8 right-8 md:top-12 md:right-12 lg:top-16 lg:right-16">
          <img
            src="/Dokuprime.svg"
            alt="Logo Dokuprime"
            className="h-8 md:h-10"
          />
        </div>

        <div className="bg-white p-10 rounded-xl shadow-lg border border-gray-200 w-full max-w-lg mt-32">
          <h2 className="text-3xl font-bold text-gray-800 mb-2 text-center">LOGIN</h2>
          <p className="text-gray-500 mb-8 text-center">Sign in with your email credentials.</p>

          <form className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <div className="mt-1 relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                  <i className="far fa-envelope" />
                </span>
                <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 py-3 w-full border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="mt-1 relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                  <i className="fas fa-lock" />
                </span>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 py-3 w-full border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
            </div>

            <button
              type="submit"
              onClick={handleSubmit}
              className="w-full flex justify-center py-3 px-4 rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 cursor-pointer"
            >
              Sign In
            </button>
          </form>
        </div>

        <p className="mt-auto pt-8 text-center text-xs text-gray-500">
          &copy; 2025 Dokuprime. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default Login;
