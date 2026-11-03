import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Bot,
  Sparkles,
  ShieldCheck,
  AlertTriangle,
  RefreshCw,
  Trash2,
  Info,
  Activity,
} from 'lucide-react';
import { Card, Badge, Button, Alert } from '../components/ui';
import {
  MatchSelectorDropdown,
  SuggestedQuestions,
  ConversationMessage,
  QuestionInputForm,
} from '../components/assistant';
import { aiService } from '../services/aiService';

const getInitialWelcomeMessage = (matchTitle) => ({
  role: 'assistant',
  text: `Hello! I am **FanPulse AI**, specialized exclusively in objective cricket match analysis and deterministic fantasy insights.\n\nCurrently grounded in telemetry for **${matchTitle}**. You can ask about death-overs tactics, player strike rates, bowling economies, or why specific players accumulated their fantasy point totals.`,
  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  isGrounded: true,
});

export const AiAssistantPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryMatchId = searchParams.get('matchId');

  // Match Fixtures State
  const [matches, setMatches] = useState([]);
  const [selectedMatchId, setSelectedMatchId] = useState(queryMatchId || 'm-ind-aus-t20');

  // Conversation & Form State
  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastFailedQuestion, setLastFailedQuestion] = useState(null);

  const messagesEndRef = useRef(null);

  // Load selectable matches
  useEffect(() => {
    let isMounted = true;
    const fetchMatches = async () => {
      const matchItems = await aiService.getSelectableMatches();
      if (isMounted && matchItems.length > 0) {
        setMatches(matchItems);
        // If current selectedMatchId not in loaded list, use first
        if (!queryMatchId && !matchItems.some((m) => m.id === selectedMatchId)) {
          setSelectedMatchId(matchItems[0].id);
        }
      }
    };
    fetchMatches();
    return () => {
      isMounted = false;
    };
  }, [queryMatchId, selectedMatchId]);

  // Load or initialize conversation history when match switches
  useEffect(() => {
    const currentMatch = matches.find((m) => m.id === selectedMatchId);
    const matchTitle = currentMatch?.title || 'Selected Fixture';

    const stored = aiService.getStoredHistory(selectedMatchId);
    if (stored && stored.length > 0) {
      setMessages(stored);
    } else {
      setMessages([getInitialWelcomeMessage(matchTitle)]);
    }

    setError(null);
    setLastFailedQuestion(null);
  }, [selectedMatchId, matches]);

  // Persist conversation history to localStorage
  useEffect(() => {
    if (messages.length > 0 && selectedMatchId) {
      aiService.saveStoredHistory(selectedMatchId, messages);
    }
  }, [messages, selectedMatchId]);

  // Auto-scroll to bottom of conversation
  useEffect(() => {
    if (typeof messagesEndRef.current?.scrollIntoView === 'function') {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading]);

  // Handle Match Selection Change
  const handleSelectMatch = (matchId) => {
    setSelectedMatchId(matchId);
    setSearchParams({ matchId });
  };

  // Submit Question to AI Service
  const handleAskQuestion = useCallback(
    async (questionText) => {
      const queryToSubmit = questionText || question;
      if (!queryToSubmit || !queryToSubmit.trim() || isLoading) return;

      const userMessage = {
        role: 'user',
        text: queryToSubmit.trim(),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, userMessage]);
      setQuestion('');
      setIsLoading(true);
      setError(null);
      setLastFailedQuestion(null);

      try {
        const response = await aiService.askQuestion({
          matchId: selectedMatchId,
          question: queryToSubmit.trim(),
          conversationHistory: messages,
        });

        const aiMessage = {
          role: 'assistant',
          text: response.explanation,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isGrounded: Boolean(response.isGrounded),
          isSimulated: Boolean(response.isSimulated),
          notice: response.notice,
        };

        setMessages((prev) => [...prev, aiMessage]);
      } catch (err) {
        setError(err.message || 'Unable to generate match explanation. Please retry.');
        setLastFailedQuestion(queryToSubmit.trim());
      } finally {
        setIsLoading(false);
      }
    },
    [question, isLoading, selectedMatchId, messages]
  );

  // Clear Conversation Session
  const handleClearHistory = () => {
    const currentMatch = matches.find((m) => m.id === selectedMatchId);
    const matchTitle = currentMatch?.title || 'Selected Fixture';

    aiService.clearStoredHistory(selectedMatchId);
    setMessages([getInitialWelcomeMessage(matchTitle)]);
    setError(null);
    setLastFailedQuestion(null);
  };

  const selectedMatch = matches.find((m) => m.id === selectedMatchId);
  const isTelemetryUnavailable =
    selectedMatch?.status === 'UPCOMING' &&
    selectedMatchId !== 'm-ind-aus-t20' &&
    selectedMatchId !== 'm-eng-sa-odi';

  const suggestedQuestions = aiService.getSuggestedQuestions(selectedMatchId);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="gold" size="xs">
              <Sparkles className="w-3 h-3 inline mr-1" />
              Gemini 1.5 Flash via Supabase Edge Functions
            </Badge>
            <Badge variant="neutral" size="xs">
              <ShieldCheck className="w-3 h-3 inline mr-1 text-cricket-green" />
              Grounding Guardrails
            </Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-2">
            <Bot className="w-7 h-7 text-cricket-gold" />
            <span>Cricket Intelligence Assistant</span>
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">
            Grounded cricket situation explanations and deterministic fantasy points analysis
          </p>
        </div>

        <div className="flex items-center gap-2">
          {messages.length > 1 && (
            <Button
              variant="ghost"
              size="xs"
              onClick={handleClearHistory}
              leftIcon={Trash2}
              className="text-gray-400 hover:text-red-400"
            >
              Clear Thread
            </Button>
          )}
        </div>
      </div>

      {/* Safety & Grounding Disclaimer */}
      <Alert variant="info" title="Strict Data Grounding Policy (BR-AI-01 & BR-AI-02)">
        All match figures, strike rates, and fantasy scores are retrieved from verified database records before synthesis. The model never invents statistics, calculates fantasy scores, or offers gambling advice.
      </Alert>

      {/* Match Selector Dropdown */}
      {matches.length > 0 && (
        <MatchSelectorDropdown
          matches={matches}
          selectedMatchId={selectedMatchId}
          onSelectMatch={handleSelectMatch}
        />
      )}

      {/* Telemetry Unavailable Warning */}
      {isTelemetryUnavailable && (
        <Alert variant="warning" title="Telemetry Pending Coin Toss" icon={Info}>
          <p className="text-xs">
            Detailed ball-by-ball telemetry is not yet active for this fixture. In-depth AI insights will unlock when coin toss and official playing XIs are confirmed.
          </p>
        </Alert>
      )}

      {/* Main Conversation Thread Card */}
      <Card variant="default" padding="md" className="border-pitch-border min-h-[460px] flex flex-col justify-between shadow-xl">
        {/* Messages Stream */}
        <div className="space-y-4 mb-4 max-h-[500px] overflow-y-auto pr-1">
          {messages.map((msg, index) => (
            <ConversationMessage key={index} message={msg} />
          ))}

          {/* Loading Indicator */}
          {isLoading && (
            <div className="flex items-start gap-3 max-w-xl mr-auto animate-pulse">
              <div className="w-8 h-8 rounded-xl bg-cricket-gold/15 text-cricket-gold border border-cricket-gold/30 flex items-center justify-center flex-shrink-0">
                <Bot className="w-4 h-4 animate-spin" />
              </div>
              <div className="p-4 rounded-2xl rounded-tl-none bg-pitch-card border border-cricket-gold/30 space-y-2">
                <div className="flex items-center gap-2 text-xs text-cricket-gold font-medium">
                  <Sparkles className="w-3.5 h-3.5 animate-spin" />
                  <span>Analyzing match telemetry & synthesizing explanation with Gemini 1.5 Flash...</span>
                </div>
                <div className="h-3 w-56 bg-pitch-elevated rounded" />
                <div className="h-3 w-36 bg-pitch-elevated rounded" />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Error Alert with Retry CTA */}
        {error && (
          <div className="mb-4">
            <Alert variant="danger" title="Assistant Service Error" icon={AlertTriangle}>
              <div className="space-y-2">
                <p className="text-xs">{error}</p>
                {lastFailedQuestion && (
                  <Button
                    variant="secondary"
                    size="xs"
                    leftIcon={RefreshCw}
                    onClick={() => handleAskQuestion(lastFailedQuestion)}
                  >
                    Retry Question
                  </Button>
                )}
              </div>
            </Alert>
          </div>
        )}

        {/* Suggested Questions & Input Bar */}
        <div className="pt-4 border-t border-pitch-border space-y-3">
          <SuggestedQuestions
            questions={suggestedQuestions}
            onSelectQuestion={(q) => handleAskQuestion(q)}
            disabled={isLoading}
          />

          <QuestionInputForm
            question={question}
            onChangeQuestion={setQuestion}
            onSubmitQuestion={() => handleAskQuestion(question)}
            isLoading={isLoading}
            disabled={isTelemetryUnavailable}
          />
        </div>
      </Card>
    </div>
  );
};

export default AiAssistantPage;
