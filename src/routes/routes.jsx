import { createBrowserRouter } from 'react-router-dom';
import Layout from '../layouts/Layout';
import { menu } from '../configs/menu';
import { generateRoutesFromMenu } from './ListRoutes';
import Login from '../pages/Login/Login';

const filteredRoutes = generateRoutesFromMenu(menu);

export const routeConfig = [
  {
    path: '/',
    element: <Layout />,
    children: filteredRoutes,
  },
  {
    path: '/login',
    element: <Login />,
  },
];

export const router = createBrowserRouter(routeConfig);
