import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Mail, Lock, User, UserPlus, Info, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { registerSchema } from '../utils/validationSchemas';
import { Input, Button, Alert } from '../components/ui';

export const RegisterPage = () => {
  const navigate = useNavigate();
  const { signUp, isMockMode } = useAuth();
  const [serverError, setServerError] = useState(null);
  const [successNotice, setSuccessNotice] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (data) => {
    setServerError(null);
    setSuccessNotice(null);

    try {
      const result = await signUp({
        email: data.email,
        password: data.password,
        fullName: data.fullName,
      });

      if (result.requiresEmailConfirmation) {
        setSuccessNotice('Registration successful! Please check your email for confirmation link.');
      } else {
        setSuccessNotice('Account created successfully! Redirecting...');
        setTimeout(() => {
          navigate('/dashboard');
        }, 1000);
      }
    } catch (err) {
      setServerError(err.message || 'Registration failed. Please try again.');
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
            Cloud Supabase credentials not linked. Registering will initialize a demo user without creating a remote database record.
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
          label="Full Name"
          type="text"
          required
          leftIcon={User}
          placeholder="Virat Sharma"
          autoComplete="name"
          error={errors.fullName?.message}
          {...register('fullName')}
        />

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
          placeholder="Minimum 8 chars (A-z, 0-9)"
          autoComplete="new-password"
          error={errors.password?.message}
          helperText="Must be 8+ chars with uppercase, lowercase, and a number."
          {...register('password')}
        />

        <Input
          label="Confirm Password"
          type="password"
          required
          leftIcon={Lock}
          placeholder="Re-enter password"
          autoComplete="new-password"
          error={errors.confirmPassword?.message}
          {...register('confirmPassword')}
        />

        <Button
          type="submit"
          variant="primary"
          size="md"
          isLoading={isSubmitting}
          leftIcon={UserPlus}
          className="w-full mt-2"
        >
          Create Account
        </Button>
      </form>

      <div className="text-center pt-3 border-t border-pitch-border">
        <p className="text-xs text-gray-400">
          Already have an account?{' '}
          <Link to="/login" className="text-cricket-green font-semibold hover:underline">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
