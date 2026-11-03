import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, UserPlus, AlertCircle } from 'lucide-react';
import { supabase } from '../services/supabaseClient';

export const RegisterPage = () => {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      if (signUpError) {
        throw signUpError;
      }

      navigate('/');
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
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
        <label className="block text-xs font-semibold text-gray-300 mb-1.5" htmlFor="fullName">
          Full Name
        </label>
        <div className="relative">
          <User className="w-4 h-4 absolute left-3 top-3 text-gray-500" />
          <input
            id="fullName"
            type="text"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Virat Sharma"
            className="w-full pl-9 pr-4 py-2.5 bg-pitch-dark border border-pitch-border rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-cricket-green transition-colors"
          />
        </div>
      </div>

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
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Minimum 6 characters"
            className="w-full pl-9 pr-4 py-2.5 bg-pitch-dark border border-pitch-border rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-cricket-green transition-colors"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-cricket-green hover:bg-cricket-green-dark text-pitch-dark font-semibold text-sm transition-all shadow-md shadow-cricket-green/20 disabled:opacity-50"
      >
        <UserPlus className="w-4 h-4" />
        <span>{loading ? 'Creating Account...' : 'Create Account'}</span>
      </button>

      <div className="text-center pt-3 border-t border-pitch-border">
        <p className="text-xs text-gray-400">
          Already have an account?{' '}
          <Link to="/login" className="text-cricket-green font-semibold hover:underline">
            Sign In
          </Link>
        </p>
      </div>
    </form>
  );
};

export default RegisterPage;

