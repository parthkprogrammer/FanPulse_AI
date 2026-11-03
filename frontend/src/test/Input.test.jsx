import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Input from '../components/ui/Input';

describe('Input Component', () => {
  it('renders input with associated label', () => {
    render(<Input label="Email Address" id="test-email" placeholder="test@fanpulse.ai" />);
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
  });

  it('renders error message and marks aria-invalid', () => {
    render(
      <Input
        label="Password"
        id="test-password"
        error="Password must be at least 8 characters"
      />
    );

    const input = screen.getByLabelText(/password/i);
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByText(/password must be at least 8 characters/i)).toBeInTheDocument();
  });

  it('renders helper text when provided', () => {
    render(
      <Input
        label="Username"
        id="test-username"
        helperText="Choose a unique fan name"
      />
    );

    expect(screen.getByText(/choose a unique fan name/i)).toBeInTheDocument();
  });
});
