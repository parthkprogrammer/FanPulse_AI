import React from 'react';
import { Link } from 'react-router-dom';
import { Home, HelpCircle } from 'lucide-react';

export const NotFoundPage = () => {
  return (
    <div className="text-center py-16 px-4">
      <div className="w-16 h-16 rounded-full bg-pitch-elevated flex items-center justify-center mx-auto mb-4 text-cricket-gold">
        <HelpCircle className="w-8 h-8" />
      </div>
      <h1 className="text-4xl font-extrabold text-white">404</h1>
      <p className="text-lg font-semibold text-gray-200 mt-2">Page Not Found</p>
      <p className="text-xs sm:text-sm text-gray-400 mt-1 max-w-sm mx-auto">
        The match pitch or fantasy resource you are looking for does not exist or has been moved.
      </p>
      <div className="mt-6">
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-cricket-green hover:bg-cricket-green-dark text-pitch-dark font-semibold text-sm transition-all shadow-md shadow-cricket-green/20"
        >
          <Home className="w-4 h-4" />
          <span>Return to Dashboard</span>
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;

