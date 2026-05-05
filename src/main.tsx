import { ViteSSG } from 'vite-ssg';
import App from './App.tsx';
import { routes } from './routes.tsx';
import './index.css';

export const createApp = ViteSSG(
  App,
  { routes }
);
