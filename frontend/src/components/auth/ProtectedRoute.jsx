import React from 'react';
import { Navigate, useLocation, Outlet, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Spinner, Card, Button } from '../ui';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

export const ProtectedRoute = ({ requiredRole, children }) => {
  const { isAuthenticated, isLoading, user, hasRole } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Spinner size="lg" color="green" label="Authenticating session..." />
      </div>
    );
  }

  // Not authenticated: redirect to login preserving attempted destination
  if (!isAuthenticated) {
    const returnUrl = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/login?returnUrl=${returnUrl}`} state={{ from: location }} replace />;
  }

  // Role check: if specific role is required (e.g., ADMIN or ROLE_ADMIN)
  if (requiredRole && !hasRole(requiredRole)) {
    return (
      <div className="max-w-xl mx-auto py-12 px-4">
        <Card variant="default" padding="lg" className="border-red-500/30">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="p-3 rounded-full bg-red-500/10 text-red-400">
              <ShieldAlert className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-white">Access Restricted</h2>
            <p className="text-xs sm:text-sm text-gray-400">
              This administrative area requires elevated credentials ({requiredRole}). Your current role is {user?.role || 'USER'}.
            </p>
            <div className="pt-2">
              <Link to="/dashboard">
                <Button variant="outline" size="sm" leftIcon={ArrowLeft}>
                  Return to Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return children ? children : <Outlet />;
};

export default ProtectedRoute;
