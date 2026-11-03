import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, UserPlus } from 'lucide-react';
import { supabase } from '../services/supabaseClient';
import { Input, Button, Alert } from '../components/ui';

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
        <Alert variant="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Input
        label="Full Name"
        type="text"
        required
        leftIcon={User}
        value={fullName}
        onChange={(e) => setFullName(e.target.value)}
        placeholder="Virat Sharma"
        autoComplete="name"
      />

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
        minLength={6}
        leftIcon={Lock}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Minimum 6 characters"
        autoComplete="new-password"
        helperText="Password must be at least 6 characters long."
      />

      <Button
        type="submit"
        variant="primary"
        size="md"
        isLoading={loading}
        leftIcon={UserPlus}
        className="w-full mt-2"
      >
        Create Account
      </Button>

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
