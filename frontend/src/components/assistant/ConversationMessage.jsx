import React from 'react';
import PropTypes from 'prop-types';
import { Bot, User, ShieldCheck, Sparkles, CheckCircle2 } from 'lucide-react';
import { Badge } from '../ui';

/**
 * Lightweight helper to format basic bold markdown (**text**) safely into React elements
 */
const renderFormattedText = (content) => {
  if (typeof content !== 'string') return content;

  // Split by double newline for paragraphs
  const paragraphs = content.split('\n\n');

  return paragraphs.map((para, pIdx) => {
    // Process **bold** within each paragraph
    const parts = para.split(/(\*\*[^*]+\*\*)/g);
    return (
      <p key={pIdx} className={pIdx > 0 ? 'mt-2.5' : ''}>
        {parts.map((part, idx) => {
          if (part.startsWith('**') && part.endsWith('**')) {
            return (
              <strong key={idx} className="font-semibold text-white">
                {part.slice(2, -2)}
              </strong>
            );
          }
          return part;
        })}
      </p>
    );
  });
};

export const ConversationMessage = ({ message }) => {
  const isUser = message.role === 'user';

  if (isUser) {
    return (
      <div className="flex items-start justify-end gap-3 max-w-2xl ml-auto">
        <div className="space-y-1 text-right">
          <div className="rounded-2xl rounded-tr-none px-4 py-3 bg-cricket-green text-pitch-dark font-medium text-xs sm:text-sm shadow-md">
            <p className="whitespace-pre-wrap">{message.text}</p>
          </div>
          <span className="text-[10px] text-gray-500 font-mono pr-1">
            {message.timestamp}
          </span>
        </div>
        <div className="w-8 h-8 rounded-xl bg-cricket-green/20 text-cricket-green border border-cricket-green/40 flex items-center justify-center flex-shrink-0 mt-0.5">
          <User className="w-4 h-4" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-3 max-w-3xl mr-auto">
      <div className="w-8 h-8 rounded-xl bg-cricket-gold/15 text-cricket-gold border border-cricket-gold/30 flex items-center justify-center flex-shrink-0 mt-1">
        <Bot className="w-4 h-4" />
      </div>

      <div className="space-y-2 flex-1">
        {/* Attribution & Grounding Header */}
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="gold" size="xs">
            <Sparkles className="w-3 h-3 inline mr-1" />
            Gemini 1.5 Flash
          </Badge>
          <Badge variant="neutral" size="xs">
            <ShieldCheck className="w-3 h-3 inline mr-1 text-cricket-green" />
            Verified Telemetry Grounding
          </Badge>
          {message.isSimulated && (
            <Badge variant="warning" size="xs">
              DEMO DATA
            </Badge>
          )}
        </div>

        {/* Message Bubble */}
        <div className="rounded-2xl rounded-tl-none p-4 sm:p-5 bg-pitch-card border border-pitch-border text-xs sm:text-sm text-gray-200 leading-relaxed shadow-lg">
          {renderFormattedText(message.text)}

          {message.notice && (
            <div className="mt-3 pt-2.5 border-t border-pitch-border/60 text-[11px] text-amber-300/80 font-medium">
              {message.notice}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 text-[10px] text-gray-500 pl-1 font-mono">
          <span>{message.timestamp}</span>
          <span>&bull;</span>
          <span>Deterministic analysis</span>
        </div>
      </div>
    </div>
  );
};

ConversationMessage.propTypes = {
  message: PropTypes.shape({
    role: PropTypes.oneOf(['user', 'assistant']).isRequired,
    text: PropTypes.string.isRequired,
    timestamp: PropTypes.string.isRequired,
    isSimulated: PropTypes.bool,
    notice: PropTypes.string,
  }).isRequired,
};

export default ConversationMessage;
