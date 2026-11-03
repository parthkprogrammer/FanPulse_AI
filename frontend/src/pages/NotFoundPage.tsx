import React from 'react';
import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-4">
      <div className="text-6xl font-extrabold text-cricket-gold tracking-tight mb-2">404</div>
      <h1 className="text-2xl font-bold text-white mb-2">Page Not Found</h1>
      <p className="text-xs text-gray-400 max-w-sm mb-6">
        The cricket fixture or fantasy view you were looking for doesn't exist or has been relocated.
      </p>
      <Link
        to="/"
        className="px-4 py-2 bg-cricket-green hover:bg-cricket-green-dark text-white text-xs font-semibold rounded-lg inline-flex items-center gap-1.5 shadow-md shadow-cricket-green/20"
      >
        <Home className="w-4 h-4" />
        Return to Dashboard
      </Link>
    </div>
  );
};

export default NotFoundPage;

