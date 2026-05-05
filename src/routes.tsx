import { RouteObject } from 'react-router-dom';
import Home from './pages/Home';
import Checkout from './pages/Checkout';

export const routes: RouteObject[] = [
  {
    path: '/',
    element: <Home />,
  },
  {
    path: '/checkout',
    element: <Checkout />,
    children: [
      {
        path: ':step',
        element: <Checkout />,
      }
    ]
  },
];
