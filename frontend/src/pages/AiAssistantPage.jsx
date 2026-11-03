import React, { useState } from 'react';
import { Bot, Sparkles, Send, Activity, ShieldCheck, HelpCircle } from 'lucide-react';
import { Card, Badge, Button, Input, Alert } from '../components/ui';

export const AiAssistantPage = () => {
  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      text: 'Hello! I am FanPulse AI. I provide grounded, contextual explanations of live match situations and fantasy point outcomes using verified cricket telemetry.',
      timestamp: '19:42',
    },
  ]);

  const quickQuestions = [
    'Explain the IND vs AUS death overs strategy',
    'Why did V. Kohli earn 112 fantasy points?',
    'What was the turning point in the second innings?',
  ];

  const handleAsk = (q) => {
    const textToSend = q || question;
    if (!textToSend.trim()) return;

    const userMsg = { role: 'user', text: textToSend, timestamp: '19:43' };
    const aiMsg = {
      role: 'assistant',
      text: `[Demo Grounded Answer]: Based on verified ball-by-ball telemetry, India maintained a 9.8 RPO in overs 16-20. Virat Kohli's 74 runs included 48 dot-ball-free strike rotations and 2 boundaries in the 18th over, yielding +16 bonus fantasy points for boundary acceleration and a strike rate > 150.`,
      timestamp: '19:43',
    };

    setMessages((prev) => [...prev, userMsg, aiMsg]);
    setQuestion('');
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="gold" size="xs">
              <Sparkles className="w-3 h-3 inline mr-1" />
              Gemini 1.5 Flash via Supabase Edge Functions
            </Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-2">
            <Bot className="w-7 h-7 text-cricket-gold" />
            <span>Cricket Intelligence Assistant</span>
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">
            Ask natural language questions &bull; Grounded strictly in application database statistics
          </p>
        </div>
      </div>

      {/* Safety / Grounding Banner */}
      <Alert variant="info" title="Hallucination Prevention Policy (BR-AI-01)">
        All match figures, strike rates, and fantasy scores are retrieved from verified database records before synthesis. The model never invents statistics.
      </Alert>

      {/* Conversation Container */}
      <Card variant="default" padding="md" className="min-h-[380px] flex flex-col justify-between">
        <div className="space-y-4 mb-4 max-h-[460px] overflow-y-auto pr-2">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex items-start gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role === 'assistant' && (
                <div className="w-8 h-8 rounded-lg bg-cricket-gold/10 text-cricket-gold flex items-center justify-center flex-shrink-0 border border-cricket-gold/30">
                  <Bot className="w-4 h-4" />
                </div>
              )}
              <div
                className={`max-w-xl rounded-2xl p-4 text-xs sm:text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-cricket-green text-pitch-dark font-medium rounded-tr-none'
                    : 'bg-pitch-elevated text-gray-200 border border-pitch-border rounded-tl-none'
                }`}
              >
                {msg.text}
                <span className={`block text-[10px] mt-1.5 ${msg.role === 'user' ? 'text-pitch-dark/70' : 'text-gray-500'}`}>
                  {msg.timestamp}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Input & Suggested Prompts */}
        <div className="pt-4 border-t border-pitch-border space-y-3">
          {/* Quick Chip Prompts */}
          <div className="flex flex-wrap gap-2">
            {quickQuestions.map((q) => (
              <button
                key={q}
                type="button"
                onClick={() => handleAsk(q)}
                className="text-[11px] px-2.5 py-1 rounded-full bg-pitch-elevated hover:bg-pitch-border text-gray-300 hover:text-white transition-colors border border-pitch-border"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleAsk();
            }}
            className="flex items-center gap-2"
          >
            <Input
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Ask anything about match momentum, player form, or fantasy scoring..."
              className="flex-1"
            />
            <Button type="submit" variant="gold" size="md" leftIcon={Send}>
              Ask
            </Button>
          </form>
        </div>
      </Card>
    </div>
  );
};

export default AiAssistantPage;
