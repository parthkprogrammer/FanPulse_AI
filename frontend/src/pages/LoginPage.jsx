import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, LogIn, AlertCircle } from 'lucide-react';
import { supabase } from '../services/supabaseClient';

export const LoginPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        throw authError;
      }

      navigate('/');
    } catch (err) {
      setError(err.message || 'Failed to authenticate. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div>
        <label className="block text-xs font-semibold text-gray-300 mb-1.5" htmlFor="email">
          Email Address
        </label>
        <div className="relative">
          <Mail className="w-4 h-4 absolute left-3 top-3 text-gray-500" />
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="fan@fanpulse.ai"
            className="w-full pl-9 pr-4 py-2.5 bg-pitch-dark border border-pitch-border rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-cricket-green transition-colors"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-300 mb-1.5" htmlFor="password">
          Password
        </label>
        <div className="relative">
          <Lock className="w-4 h-4 absolute left-3 top-3 text-gray-500" />
          <input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full pl-9 pr-4 py-2.5 bg-pitch-dark border border-pitch-border rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-cricket-green transition-colors"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-cricket-green hover:bg-cricket-green-dark text-pitch-dark font-semibold text-sm transition-all shadow-md shadow-cricket-green/20 disabled:opacity-50"
      >
        <LogIn className="w-4 h-4" />
        <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
      </button>

      <div className="text-center pt-3 border-t border-pitch-border">
        <p className="text-xs text-gray-400">
          Don't have an account?{' '}
          <Link to="/register" className="text-cricket-green font-semibold hover:underline">
            Create an Account
          </Link>
        </p>
      </div>
    </form>
  );
};

export default LoginPage;

