import React from 'react';
import { Link } from 'react-router-dom';
import { Trophy, PlusCircle } from 'lucide-react';
import { useAppSelector } from '@/app/hooks';

export const MyTeamsPage: React.FC = () => {
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Trophy className="w-6 h-6 text-cricket-gold" />
            My Fantasy Teams
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Review your custom drafted 11-player lineups, track fantasy points, and analyze team differences.
          </p>
        </div>

        <Link
          to="/matches"
          className="px-4 py-2 bg-cricket-green hover:bg-cricket-green-dark text-white rounded-xl text-xs font-semibold inline-flex items-center gap-1.5 shadow-md shadow-cricket-green/20"
        >
          <PlusCircle className="w-4 h-4" />
          Create New Team
        </Link>
      </div>

      {/* Empty State / Auth Prompt */}
      {!isAuthenticated ? (
        <div className="bg-pitch-card border border-pitch-border rounded-2xl p-10 text-center space-y-4 max-w-lg mx-auto">
          <div className="w-12 h-12 rounded-full bg-amber-500/10 text-cricket-gold mx-auto flex items-center justify-center">
            <Trophy className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-white">Sign In to Manage Fantasy Teams</h3>
          <p className="text-xs text-gray-400">
            Create an account to draft custom cricket lineups, track live points, and compare teams side-by-side.
          </p>
          <div className="pt-2 flex justify-center gap-3">
            <Link
              to="/login"
              className="px-4 py-2 bg-cricket-green text-white text-xs font-semibold rounded-lg hover:bg-cricket-green-dark"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="px-4 py-2 bg-pitch-elevated text-gray-200 text-xs font-semibold rounded-lg border border-pitch-border"
            >
              Register
            </Link>
          </div>
        </div>
      ) : (
        <div className="bg-pitch-card border border-pitch-border rounded-2xl p-12 text-center space-y-4 max-w-md mx-auto">
          <div className="w-12 h-12 rounded-full bg-cricket-green/10 text-cricket-green mx-auto flex items-center justify-center">
            <Trophy className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-white">No Fantasy Teams Created Yet</h3>
          <p className="text-xs text-gray-400">
            Head to the Match Center, select an upcoming match fixture, and draft your dream 11-player squad!
          </p>
          <Link
            to="/matches"
            className="inline-block px-4 py-2 bg-cricket-green hover:bg-cricket-green-dark text-white text-xs font-semibold rounded-lg"
          >
            Browse Upcoming Matches
          </Link>
        </div>
      )}
    </div>
  );
};

export default MyTeamsPage;

