/**
 * PrivateRoute.jsx — Route guard for authenticated routes
 * Checks for user auth state and redirects to login if unauthenticated.
 */

import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Route guard component
 * Renders nested routes if user is logged in, else redirects to login.
 */
function PrivateRoute() {
  const { user } = useAuth();

  return user ? <Outlet /> : <Navigate to="/login" replace />;
}

export default PrivateRoute;
