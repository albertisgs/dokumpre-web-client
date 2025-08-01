import { createBrowserRouter } from 'react-router-dom';
import Layout from '../layouts/Layout';
import { menu } from '../configs/menu';
import { generateRoutesFromMenu } from './ListRoutes';
import Login from '../pages/Login/Login';
import ProtectedLoginRoute from '../components/protectedLoginRoute';
import MicrosoftCallback from '../components/MicrosoftCallback';

const filteredRoutes = generateRoutesFromMenu(menu);

export const routeConfig = [
  {
    path: '/',
    element: <Layout />,
    children: filteredRoutes,
  },
  {
    path: '/login',
    element:(
       <ProtectedLoginRoute>
        <Login />
      </ProtectedLoginRoute>
    ),
  },{
    path:'/auth-microsoft/callback',
    element:(
      <MicrosoftCallback/>
    )
  }
];

export const router = createBrowserRouter(routeConfig);
