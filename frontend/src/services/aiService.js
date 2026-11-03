import { apiClient } from './apiClient';
import { matchService } from './matchService';
import { isSupabaseConfigured } from './authService';

/**
 * Suggested questions tailored by match context
 */
export const SUGGESTED_QUESTIONS = {
  'm-ind-aus-t20': [
    'Explain the death overs acceleration and bowling discipline',
    'Why did Virat Kohli earn 112 fantasy points?',
    'What was the turning point in the second innings chase?',
    "Break down Jasprit Bumrah's bowling spell and impact",
    'Compare Travis Head and Glenn Maxwell contributions',
  ],
  'm-eng-sa-odi': [
    'How did England defend 312 at Lord’s?',
    'Explain Joe Root’s match-winning century',
    'Why did South Africa collapse in the final 5 overs?',
  ],
  'm-nz-pak-t20': [
    'What are the key match conditions and ground dimensions at Eden Park?',
    'Who are the top projected fantasy picks for this fixture?',
  ],
  default: [
    'Explain the match situation and momentum shifts',
    'Which players earned the highest fantasy points and why?',
    'What was the key turning point of the game?',
  ],
};

const STORAGE_KEY = 'fanpulse_ai_chat_history_';

export const aiService = {
  /**
   * Retrieves matches for the selector dropdown
   */
  async getSelectableMatches() {
    try {
      const response = await matchService.getMatches({ status: 'ALL' });
      return response.matches || [];
    } catch {
      return [];
    }
  },

  /**
   * Retrieves suggested questions for a given match
   */
  getSuggestedQuestions(matchId) {
    return SUGGESTED_QUESTIONS[matchId] || SUGGESTED_QUESTIONS.default;
  },

  /**
   * Submits a question to the AI Assistant via Supabase Edge Function
   */
  async askQuestion({
    matchId,
    question,
    conversationHistory = [],
    topic = 'MATCH_EXPLANATION',
    playerId,
    fantasyTeamId,
  }) {
    if (!matchId) {
      throw new Error('Please select a cricket match fixture.');
    }

    if (!question || question.trim().length === 0) {
      throw new Error('Please enter a question.');
    }

    if (question.length > 250) {
      throw new Error('Question must not exceed 250 characters.');
    }

    const isProduction = import.meta.env.PROD || import.meta.env.MODE === 'production';

    // 1. Attempt call to Supabase Edge Function via apiClient
    try {
      const response = await apiClient.post(
        '/ai-assistant',
        {
          matchId,
          question: question.trim(),
          topic,
          ...(playerId ? { playerId } : {}),
          ...(fantasyTeamId ? { fantasyTeamId } : {}),
          conversationHistory: conversationHistory.slice(-4),
        },
        { timeout: 15000 }
      );

      if (response.data?.status === 'success' && response.data?.data) {
        return {
          ...response.data.data,
          isSimulated: Boolean(response.data.data.isSimulated),
        };
      }
    } catch (err) {
      // If server returned a formal error envelope from the Edge Function
      if (err.response?.data?.message) {
        const errorMsg = err.response.data.message;
        const errType = err.response.data.error || 'ApiError';
        const error = new Error(errorMsg);
        error.errorType = errType;
        error.status = err.response.status;
        throw error;
      }

      // If client timed out
      if (err.code === 'ECONNABORTED' || err.message?.includes('timeout')) {
        const timeoutErr = new Error('AI request timed out after 15 seconds. Please retry.');
        timeoutErr.isTimeout = true;
        throw timeoutErr;
      }

      // Rule: Do not simulate successful AI responses in production
      if (isProduction || isSupabaseConfigured()) {
        const prodErr = new Error(
          'Match explanation is temporarily unavailable. All match scorecards and fantasy points remain fully operational.'
        );
        prodErr.isServiceUnavailable = true;
        throw prodErr;
      }

      // In local development when backend is not deployed, provide clearly labeled Dev Mock
      return this._getDevelopmentMockResponse(matchId, question);
    }

    throw new Error('Failed to obtain a valid response from the AI assistant.');
  },

  /**
   * Internal development fallback for offline testing only.
   * Strictly disabled in production.
   */
  _getDevelopmentMockResponse(matchId, question) {
    // Artificial 600ms latency to test shimmer loading
    const lowerQ = question.toLowerCase();

    let answer = `Based on verified telemetry for **${matchId}**, **India** reached **184/4 (18.2 ov)** chasing **178/8**. **Virat Kohli** anchored the innings with **74* off 48b** (SR 154.2), while **Hardik Pandya** closed out the chase with **38* off 19b** (SR 200.0).`;

    if (lowerQ.includes('death') || lowerQ.includes('strategy') || lowerQ.includes('over')) {
      answer = `During the death overs (overs 16–20), **India** restricted Australia to just 34 runs while conceding zero sixes, spearheaded by **Jasprit Bumrah's** 3/24 (4.0 ov). In the chase, **Hardik Pandya** attacked the 18th over, hitting 10 runs off 2 balls from Pat Cummins to lower the required run rate to 3.00.`;
    } else if (lowerQ.includes('kohli') || lowerQ.includes('points') || lowerQ.includes('112')) {
      answer = `**Virat Kohli** earned **112 fantasy points** as the match's top batting contributor. His 74* runs included 6 fours, 2 sixes, a +16 milestone bonus for passing 70 runs, and a +12 strike rate acceleration bonus (>150 SR).`;
    } else if (lowerQ.includes('bumrah') || lowerQ.includes('bowl')) {
      answer = `**Jasprit Bumrah** earned **98 fantasy points** with an exceptional economy of 6.00 and 14 dot balls. He took 3 top-order wickets, earning +75 wicket points, +8 economy bonus, and +6 maiden over points.`;
    } else if (lowerQ.includes('turning') || lowerQ.includes('moment')) {
      answer = `The primary turning point was the **18th over**. India required 15 off 12 balls when **Hardik Pandya** struck a boundary past backward point followed by a 92-meter six over mid-wicket, reducing the target to 5 runs off 10 balls.`;
    }

    return {
      explanation: answer,
      matchId,
      topic: 'MATCH_EXPLANATION',
      provider: 'development_local_mock',
      isGrounded: true,
      isSimulated: true,
      notice: 'DEMO DATA — Simulated in local development mode. Live AI connects via Supabase Edge Function.',
      timestamp: new Date().toISOString(),
    };
  },

  /**
   * Conversation history persistence in localStorage for session convenience
   */
  getStoredHistory(matchId) {
    try {
      const data = localStorage.getItem(`${STORAGE_KEY}${matchId}`);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },

  saveStoredHistory(matchId, messages) {
    try {
      localStorage.setItem(`${STORAGE_KEY}${matchId}`, JSON.stringify(messages));
    } catch {
      // Storage access fallback
    }
  },

  clearStoredHistory(matchId) {
    try {
      localStorage.removeItem(`${STORAGE_KEY}${matchId}`);
    } catch {
      // Storage access fallback
    }
  },
};

export default aiService;
