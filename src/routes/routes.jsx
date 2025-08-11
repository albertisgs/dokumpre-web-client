import { createBrowserRouter } from 'react-router-dom';
import Layout from '../layouts/Layout';
import { generateRoutesFromMenu } from './ListRoutes';
import Login from '../pages/Login/Login';
import ProtectedLoginRoute from '../components/protectedLoginRoute';
import MicrosoftCallback from '../components/MicrosoftCallback';
import GoogleCallback from '../components/GoogleCallback';

// This function now creates the entire route configuration dynamically
export const createRouterForUser = (userMenu) => {
  const filteredRoutes = generateRoutesFromMenu(userMenu);

  const routeConfig = [
    {
      path: '/',
      element: <Layout />,
      children: filteredRoutes,
    },
    {
      path: '/login',
      element: (
        <ProtectedLoginRoute>
          <Login />
        </ProtectedLoginRoute>
      ),
    },
    {
      path: '/auth-microsoft/callback',
      element: <MicrosoftCallback />,
    },
    {
      path: '/auth-google/callback',
      element: <GoogleCallback />,
    },
  ];

  return createBrowserRouter(routeConfig);
};
