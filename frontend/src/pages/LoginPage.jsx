import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, LogIn } from 'lucide-react';
import { supabase } from '../services/supabaseClient';
import { Input, Button, Alert } from '../components/ui';

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
        <Alert variant="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Input
        label="Email Address"
        type="email"
        required
        leftIcon={Mail}
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="fan@fanpulse.ai"
        autoComplete="email"
      />

      <Input
        label="Password"
        type="password"
        required
        leftIcon={Lock}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="••••••••"
        autoComplete="current-password"
      />

      <Button
        type="submit"
        variant="primary"
        size="md"
        isLoading={loading}
        leftIcon={LogIn}
        className="w-full mt-2"
      >
        Sign In
      </Button>

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
