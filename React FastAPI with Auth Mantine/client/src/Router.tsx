import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { NothingFoundBackground } from './components/404/NothingFoundBackground';
import { LoginPage } from './pages/Login.page';
import { ProtectedRoute } from './routes/ProtectedRoute';
import { HomePage } from './pages/Home.page';
import { LandingPage } from './pages/Landing.page';

const router = createBrowserRouter([
  {
    path: '/',
    element: <ProtectedRoute />, // Protects all child routes
    children: [
      { path: '/', element: <HomePage /> }, // Protected route
      { path: '/missions', element: <HomePage /> }, // Protected route
      { path: '/map', element: <HomePage /> }, // Protected route
      { path: '/resources', element: <HomePage /> }, // Protected route
      { path: '/help', element: <HomePage /> }, // Protected route
    ],
    errorElement: <NothingFoundBackground />, // Handle 404 errors
  },
  {
    path: '/landing',
    element: <LandingPage />, // Public route
  },
  {
    path: '/login',
    element: <LoginPage />, // Public route
  },
]);

export function Router() {
  return <RouterProvider router={router} />;
}