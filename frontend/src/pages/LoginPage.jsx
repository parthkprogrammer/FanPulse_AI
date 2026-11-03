import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Mail, Lock, LogIn, Info } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { loginSchema } from '../utils/validationSchemas';
import { Input, Button, Alert, Badge } from '../components/ui';

export const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn, isMockMode } = useAuth();
  const [serverError, setServerError] = useState(null);
  const [successNotice, setSuccessNotice] = useState(null);

  const queryParams = new URLSearchParams(location.search);
  const returnUrl = queryParams.get('returnUrl') || '/dashboard';

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data) => {
    setServerError(null);
    setSuccessNotice(null);

    try {
      const result = await signIn(data);
      if (result.isMock) {
        setSuccessNotice('Signed in with Development Mock Authentication.');
      }
      setTimeout(() => {
        navigate(decodeURIComponent(returnUrl), { replace: true });
      }, 500);
    } catch (err) {
      setServerError(err.message || 'Authentication failed. Please verify your credentials.');
    }
  };

  return (
    <div className="space-y-4">
      {/* Explicit Mock Mode Disclosure */}
      {isMockMode && (
        <div className="p-3 rounded-xl bg-pitch-elevated border border-cricket-gold/30 text-xs text-gray-300 space-y-1">
          <div className="flex items-center gap-1.5 font-bold text-cricket-gold">
            <Info className="w-3.5 h-3.5" />
            <span>Development Mock Mode</span>
          </div>
          <p className="text-[11px] text-gray-400">
            Cloud Supabase credentials not linked. Submitting this form creates a transient mock session for testing.
          </p>
        </div>
      )}

      {serverError && (
        <Alert variant="error" onClose={() => setServerError(null)}>
          {serverError}
        </Alert>
      )}

      {successNotice && (
        <Alert variant="success" onClose={() => setSuccessNotice(null)}>
          {successNotice}
        </Alert>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <Input
          label="Email Address"
          type="email"
          required
          leftIcon={Mail}
          placeholder="fan@fanpulse.ai"
          autoComplete="email"
          error={errors.email?.message}
          {...register('email')}
        />

        <Input
          label="Password"
          type="password"
          required
          leftIcon={Lock}
          placeholder="••••••••"
          autoComplete="current-password"
          error={errors.password?.message}
          {...register('password')}
        />

        <Button
          type="submit"
          variant="primary"
          size="md"
          isLoading={isSubmitting}
          leftIcon={LogIn}
          className="w-full mt-2"
        >
          Sign In
        </Button>
      </form>

      <div className="text-center pt-3 border-t border-pitch-border">
        <p className="text-xs text-gray-400">
          Don't have an account?{' '}
          <Link to="/register" className="text-cricket-green font-semibold hover:underline">
            Create an Account
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
