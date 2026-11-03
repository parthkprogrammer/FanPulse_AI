import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppDispatch } from '@/app/hooks';
import { setCredentials } from '@/features/auth/authSlice';
import { UserPlus, Lock, Mail, User, AlertCircle } from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!displayName || !email || !password) {
      setError('Please fill in all required fields.');
      return;
    }

    if (password.length < 8) {
      setError('Password must contain at least 8 characters.');
      return;
    }

    setLoading(true);

    // Mock initial registration for foundational setup before backend Milestone 5
    setTimeout(() => {
      setLoading(false);
      dispatch(
        setCredentials({
          token: 'mock-jwt-token-fanpulse-dev',
          user: {
            id: 2,
            email,
            displayName,
            role: 'ROLE_USER',
          },
        })
      );
      navigate('/');
    }, 500);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight">Create an Account</h2>
        <p className="text-xs text-gray-400 mt-1">
          Join FanPulse AI to draft fantasy teams and unlock cricket insights.
        </p>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-gray-300 mb-1">
            Display Name
          </label>
          <div className="relative">
            <User className="w-4 h-4 text-gray-400 absolute left-3 top-3 pointer-events-none" />
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="CricketFan2026"
              className="w-full pl-9 pr-3 py-2 bg-pitch-elevated border border-pitch-border rounded-lg text-sm text-white placeholder-gray-400 focus:outline-none focus:border-cricket-green transition-colors"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-300 mb-1">
            Email Address
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-3 pointer-events-none" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="fan@example.com"
              className="w-full pl-9 pr-3 py-2 bg-pitch-elevated border border-pitch-border rounded-lg text-sm text-white placeholder-gray-400 focus:outline-none focus:border-cricket-green transition-colors"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-300 mb-1">
            Password (min 8 chars)
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-3 pointer-events-none" />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full pl-9 pr-3 py-2 bg-pitch-elevated border border-pitch-border rounded-lg text-sm text-white placeholder-gray-400 focus:outline-none focus:border-cricket-green transition-colors"
              required
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 bg-cricket-green hover:bg-cricket-green-dark text-white text-sm font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 shadow-md shadow-cricket-green/20"
        >
          {loading ? (
            'Creating Account...'
          ) : (
            <>
              <UserPlus className="w-4 h-4" />
              Register
            </>
          )}
        </button>
      </form>

      <div className="text-center text-xs text-gray-400 pt-2 border-t border-pitch-border">
        Already have an account?{' '}
        <Link to="/login" className="text-cricket-green hover:underline font-semibold">
          Sign In
        </Link>
      </div>
    </div>
  );
};

export default RegisterPage;

