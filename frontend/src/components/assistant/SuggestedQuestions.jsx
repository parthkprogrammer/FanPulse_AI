import React from 'react';
import PropTypes from 'prop-types';
import { Sparkles, HelpCircle } from 'lucide-react';

export const SuggestedQuestions = ({ questions = [], onSelectQuestion, disabled = false }) => {
  if (!questions || questions.length === 0) return null;

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1.5 text-xs text-gray-400 font-medium">
        <Sparkles className="w-3.5 h-3.5 text-cricket-gold" />
        <span>Suggested Cricket Inquiries:</span>
      </div>

      <div className="flex flex-wrap gap-2">
        {questions.map((q, idx) => (
          <button
            key={idx}
            type="button"
            disabled={disabled}
            onClick={() => onSelectQuestion(q)}
            className="text-left text-xs px-3 py-1.5 rounded-full bg-pitch-elevated/70 hover:bg-pitch-border text-gray-300 hover:text-white transition-all border border-pitch-border hover:border-cricket-gold/40 disabled:opacity-50 disabled:cursor-not-allowed group flex items-center gap-1.5"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-cricket-gold/60 group-hover:bg-cricket-gold transition-colors" />
            <span>{q}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

SuggestedQuestions.propTypes = {
  questions: PropTypes.arrayOf(PropTypes.string).isRequired,
  onSelectQuestion: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
};

export default SuggestedQuestions;
