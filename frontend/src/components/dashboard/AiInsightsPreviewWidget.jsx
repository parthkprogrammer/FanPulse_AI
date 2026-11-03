import React from 'react';
import { Link } from 'react-router-dom';
import { Bot, Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';
import { Card, Badge, Button } from '../ui';

export const AiInsightsPreviewWidget = ({ insights, isDemoData = true }) => {
  if (!insights) return null;

  return (
    <Card variant="default" padding="md" className="space-y-4 border-cricket-gold/30">
      <div className="flex items-center justify-between pb-3 border-b border-pitch-border">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="heading-card flex items-center gap-1.5">
              <Bot className="w-5 h-5 text-cricket-gold" />
              <span>AI Match Intelligence</span>
            </h3>
            {isDemoData && <Badge variant="gold" size="xs">DEMO DATA</Badge>}
          </div>
          <p className="text-xs text-gray-400 mt-0.5">
            Grounded explanations synthesized via Gemini 1.5 Flash
          </p>
        </div>
        <Badge variant="gold" size="xs">
          <Sparkles className="w-3 h-3 inline mr-1" />
          Verified
        </Badge>
      </div>

      <div className="p-4 rounded-xl bg-pitch-elevated/70 border border-pitch-border space-y-2.5">
        <h4 className="text-sm font-bold text-white leading-tight">
          {insights.headline}
        </h4>
        <p className="text-xs text-gray-300 leading-relaxed">
          {insights.summary}
        </p>

        <div className="pt-2 flex items-center gap-2 text-[11px] text-cricket-gold font-medium">
          <ShieldCheck className="w-4 h-4 text-cricket-green flex-shrink-0" />
          <span>{insights.keyStat}</span>
        </div>
      </div>

      <div className="pt-1 flex items-center justify-between">
        <span className="text-[11px] text-gray-400">Ask why moments changed the game:</span>
        <Link to="/assistant">
          <Button variant="gold" size="sm" rightIcon={ArrowRight}>
            Explore AI Assistant
          </Button>
        </Link>
      </div>
    </Card>
  );
};

export default AiInsightsPreviewWidget;
