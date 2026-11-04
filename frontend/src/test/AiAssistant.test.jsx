import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AiAssistantPage } from '../pages/AiAssistantPage';
import { aiService } from '../services/aiService';

const renderAiAssistant = (initialPath = '/assistant') => {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <AiAssistantPage />
    </MemoryRouter>
  );
};

describe('AiAssistantPage Component', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
  });

  it('renders header, grounding banner, match selector, and welcome message', async () => {
    renderAiAssistant();

    expect(await screen.findByText('Cricket Intelligence Assistant')).toBeInTheDocument();
    expect(screen.getByText(/Strict Data Grounding Policy/i)).toBeInTheDocument();
    expect(await screen.findByText(/Target Match Context/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Ask anything about momentum/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Ask AI/i })).toBeInTheDocument();

    // Verify initial grounded welcome message
    expect(screen.getByText(/I am/i)).toBeInTheDocument();
    expect(screen.getByText(/FanPulse AI/i)).toBeInTheDocument();
  });

  it('submits a user question and renders user bubble and assistant explanation', async () => {
    vi.spyOn(aiService, 'askQuestion').mockResolvedValueOnce({
      explanation: 'Jasprit Bumrah bowled 4.0 overs taking 3 wickets for 24 runs with 14 dot balls.',
      matchId: 'm-ind-aus-t20',
      isGrounded: true,
      isSimulated: false,
    });

    renderAiAssistant();

    const input = await screen.findByPlaceholderText(/Ask anything about momentum/i);
    fireEvent.change(input, { target: { value: "Explain Jasprit Bumrah's bowling spell" } });

    const submitBtn = screen.getByRole('button', { name: /Ask AI/i });
    fireEvent.click(submitBtn);

    // User message should appear immediately
    expect(screen.getByText("Explain Jasprit Bumrah's bowling spell")).toBeInTheDocument();

    // AI response should resolve and render
    await waitFor(() => {
      expect(
        screen.getByText(/Jasprit Bumrah bowled 4.0 overs taking 3 wickets for 24 runs/i)
      ).toBeInTheDocument();
    });
  });

  it('clicks a suggested question chip and submits it immediately', async () => {
    const askSpy = vi.spyOn(aiService, 'askQuestion').mockResolvedValueOnce({
      explanation: 'Virat Kohli earned 112 fantasy points through an unbeaten 74 runs off 48 balls.',
      matchId: 'm-ind-aus-t20',
      isGrounded: true,
      isSimulated: false,
    });

    renderAiAssistant();

    const suggestedChip = await screen.findByRole('button', {
      name: /Why did Virat Kohli earn 112 fantasy points\?/i,
    });
    fireEvent.click(suggestedChip);

    await waitFor(() => {
      expect(askSpy).toHaveBeenCalledTimes(1);
    });

    expect(
      screen.getAllByText('Why did Virat Kohli earn 112 fantasy points?').length
    ).toBeGreaterThanOrEqual(2);
  });

  it('handles service errors and allows retrying the failed question', async () => {
    const askSpy = vi
      .spyOn(aiService, 'askQuestion')
      .mockRejectedValueOnce(
        new Error('Match explanation is temporarily unavailable. Upstream provider timeout.')
      )
      .mockResolvedValueOnce({
        explanation: 'Recovered response after retry: India needed 5 runs in 10 balls.',
        matchId: 'm-ind-aus-t20',
        isGrounded: true,
        isSimulated: false,
      });

    renderAiAssistant();

    const input = await screen.findByPlaceholderText(/Ask anything about momentum/i);
    fireEvent.change(input, { target: { value: 'What was the situation in the 18th over?' } });

    const submitBtn = screen.getByRole('button', { name: /Ask AI/i });
    fireEvent.click(submitBtn);

    // Error alert and retry button should appear
    expect(
      await screen.findByText(/Match explanation is temporarily unavailable/i)
    ).toBeInTheDocument();
    const retryBtn = screen.getByRole('button', { name: /Retry Question/i });
    expect(retryBtn).toBeInTheDocument();

    // Click retry
    fireEvent.click(retryBtn);

    await waitFor(() => {
      expect(askSpy).toHaveBeenCalledTimes(2);
      expect(screen.getByText(/Recovered response after retry/i)).toBeInTheDocument();
    });
  });

  it('prevents submission when question exceeds 250 characters limit', async () => {
    renderAiAssistant();

    const input = await screen.findByPlaceholderText(/Ask anything about momentum/i);
    const longText = 'A'.repeat(251);
    fireEvent.change(input, { target: { value: longText } });

    // Counter shows over limit
    expect(screen.getByText('251 / 250')).toBeInTheDocument();

    // Submit button should be disabled
    const submitBtn = screen.getByRole('button', { name: /Ask AI/i });
    expect(submitBtn).toBeDisabled();
  });

  it('switches match fixture and updates suggested questions', async () => {
    renderAiAssistant();

    const select = await screen.findByLabelText(/Select match for AI analysis/i);
    fireEvent.change(select, { target: { value: 'm-eng-sa-odi' } });

    // Suggested questions should update for England vs South Africa
    expect(
      await screen.findByRole('button', { name: /How did England defend 312 at Lord’s\?/i })
    ).toBeInTheDocument();
  });

  it('clears conversation history when clicking clear thread', async () => {
    vi.spyOn(aiService, 'askQuestion').mockResolvedValueOnce({
      explanation: 'Test answer.',
      matchId: 'm-ind-aus-t20',
      isGrounded: true,
    });

    renderAiAssistant();

    const input = await screen.findByPlaceholderText(/Ask anything about momentum/i);
    fireEvent.change(input, { target: { value: 'Test question' } });
    fireEvent.click(screen.getByRole('button', { name: /Ask AI/i }));

    expect(await screen.findByText('Test question')).toBeInTheDocument();

    // Clear thread button should appear
    const clearBtn = screen.getByRole('button', { name: /Clear Thread/i });
    fireEvent.click(clearBtn);

    // Custom user message should be cleared, returning to welcome message
    expect(screen.queryByText('Test question')).not.toBeInTheDocument();
  });

  it('disables submit button when question is empty or contains only whitespace', async () => {
    renderAiAssistant();

    const input = await screen.findByPlaceholderText(/Ask anything about momentum/i);
    const submitBtn = screen.getByRole('button', { name: /Ask AI/i });

    // Initially empty -> disabled
    expect(submitBtn).toBeDisabled();

    // Whitespace only -> disabled
    fireEvent.change(input, { target: { value: '     ' } });
    expect(submitBtn).toBeDisabled();

    // Valid text -> enabled
    fireEvent.change(input, { target: { value: 'Valid tactical query' } });
    expect(submitBtn).not.toBeDisabled();
  });

  it('provides accessibility basics: accessible textarea label and button roles', async () => {
    renderAiAssistant();

    const textarea = await screen.findByLabelText(/Ask FanPulse AI a question/i);
    expect(textarea).toBeInTheDocument();
    expect(textarea).toHaveAttribute('rows', '2');

    const submitBtn = screen.getByRole('button', { name: /Ask AI/i });
    expect(submitBtn).toBeInTheDocument();
  });
});
