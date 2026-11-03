import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Button from '../components/ui/Button';

describe('Button Component', () => {
  it('renders button with text content', () => {
    render(<Button>Click Me</Button>);
    expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument();
  });

  it('handles click events when enabled', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Submit</Button>);

    fireEvent.click(screen.getByRole('button', { name: /submit/i }));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('disables button and displays spinner when isLoading is true', () => {
    const handleClick = vi.fn();
    render(<Button isLoading onClick={handleClick}>Loading Action</Button>);

    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute('aria-busy', 'true');

    fireEvent.click(button);
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('renders variant styles properly', () => {
    const { rerender } = render(<Button variant="danger">Delete</Button>);
    expect(screen.getByRole('button')).toHaveClass('text-red-400');

    rerender(<Button variant="gold">Gold Action</Button>);
    expect(screen.getByRole('button')).toHaveClass('bg-cricket-gold');
  });
});
