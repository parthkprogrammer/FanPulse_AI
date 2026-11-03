import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  User,
  Mail,
  Shield,
  LogOut,
  Award,
  Trophy,
  Save,
  CheckCircle2,
  Info,
  Heart,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { profileUpdateSchema } from '../utils/validationSchemas';
import { Card, Badge, Button, Input, Alert } from '../components/ui';

export const ProfilePage = () => {
  const { user, signOut, updateProfile, isMockMode } = useAuth();
  const [successMessage, setSuccessMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isDirty },
  } = useForm({
    resolver: zodResolver(profileUpdateSchema),
    defaultValues: {
      displayName: user?.displayName || '',
      favoriteTeam: user?.favoriteTeam || 'India National Team',
      bio: user?.bio || '',
    },
  });

  const onUpdateProfile = async (data) => {
    setSuccessMessage(null);
    setErrorMessage(null);

    try {
      await updateProfile(data);
      setSuccessMessage('Profile settings updated successfully!');
    } catch (err) {
      setErrorMessage(err.message || 'Failed to update profile settings.');
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Dev Mock Mode Notice */}
      {isMockMode && (
        <Alert variant="warning" title="Development Mock Session">
          You are currently signed in under Development Mock Mode. Changes to your profile are preserved in local session memory only.
        </Alert>
      )}

      {successMessage && (
        <Alert variant="success" onClose={() => setSuccessMessage(null)}>
          {successMessage}
        </Alert>
      )}

      {errorMessage && (
        <Alert variant="error" onClose={() => setErrorMessage(null)}>
          {errorMessage}
        </Alert>
      )}

      {/* Profile Header Hero Card */}
      <Card variant="default" padding="lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-cricket-green to-emerald-400 flex items-center justify-center text-pitch-dark shadow-lg shadow-cricket-green/20">
              <User className="w-8 h-8 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="success" size="xs">
                  {user?.isMockUser ? 'Demo Member' : 'Verified Member'}
                </Badge>
                <Badge variant="gold" size="xs">
                  {user?.role || 'USER'}
                </Badge>
                <Badge variant="neutral" size="xs">
                  {user?.authMode || 'LOCAL_MOCK'}
                </Badge>
              </div>
              <h1 className="text-2xl font-bold text-white">
                {user?.displayName || 'Cricket Enthusiast'}
              </h1>
              <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5" />
                <span>{user?.email || 'fan@fanpulse.ai'}</span>
              </p>
            </div>
          </div>

          <Button
            variant="danger"
            size="sm"
            leftIcon={LogOut}
            onClick={signOut}
          >
            Sign Out
          </Button>
        </div>
      </Card>

      {/* Edit Profile Form */}
      <Card variant="default" padding="md">
        <Card.Header>
          <Card.Title>Profile Settings</Card.Title>
          <Card.Description>Update your public display identity and favorite cricket team</Card.Description>
        </Card.Header>

        <Card.Content className="pt-2">
          <form onSubmit={handleSubmit(onUpdateProfile)} className="space-y-4" noValidate>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Display Screen Name"
                type="text"
                required
                leftIcon={User}
                error={errors.displayName?.message}
                {...register('displayName')}
              />

              <Input
                label="Favorite Cricket Team"
                type="text"
                leftIcon={Heart}
                placeholder="e.g. India, Australia, CSK"
                error={errors.favoriteTeam?.message}
                {...register('favoriteTeam')}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                Fan Bio / Summary
              </label>
              <textarea
                rows={3}
                placeholder="Share your cricket fandom or fantasy strategy..."
                className="w-full rounded-lg bg-pitch-dark text-white placeholder-gray-500 text-sm p-3 border border-pitch-border hover:border-gray-500 focus:outline-none focus:border-cricket-green transition-colors"
                {...register('bio')}
              />
              {errors.bio && (
                <p className="text-xs text-red-400 mt-1">{errors.bio.message}</p>
              )}
            </div>

            <div className="flex justify-end pt-2">
              <Button
                type="submit"
                variant="primary"
                size="md"
                isLoading={isSubmitting}
                leftIcon={Save}
                disabled={!isDirty}
              >
                Save Changes
              </Button>
            </div>
          </form>
        </Card.Content>
      </Card>

      {/* Session Security Details Card */}
      <Card variant="default" padding="md">
        <Card.Header>
          <Card.Title>Session & Security Overview</Card.Title>
          <Card.Description>Client authentication state details</Card.Description>
        </Card.Header>
        <Card.Content className="space-y-2 pt-2 text-xs text-gray-300">
          <div className="flex justify-between py-2 border-b border-pitch-border">
            <span className="text-gray-400">Authentication Mode</span>
            <span className="font-semibold text-white">
              {user?.authMode === 'SUPABASE_CLOUD' ? 'Supabase GoTrue (Cloud Production)' : 'Development Mock Authentication'}
            </span>
          </div>
          <div className="flex justify-between py-2 border-b border-pitch-border">
            <span className="text-gray-400">Account ID</span>
            <span className="font-mono text-gray-400">{user?.id || 'usr_demo_01'}</span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-gray-400">Client Security Policy</span>
            <span className="text-cricket-green font-medium">Passwords never stored in browser storage</span>
          </div>
        </Card.Content>
      </Card>
    </div>
  );
};

export default ProfilePage;
