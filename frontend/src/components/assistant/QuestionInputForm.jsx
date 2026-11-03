import React from 'react';
import PropTypes from 'prop-types';
import { Send, CornerDownLeft, X } from 'lucide-react';
import { Button } from '../ui';

const MAX_CHAR_LIMIT = 250;

export const QuestionInputForm = ({
  question,
  onChangeQuestion,
  onSubmitQuestion,
  isLoading,
  disabled = false,
}) => {
  const charCount = question.length;
  const isOverLimit = charCount > MAX_CHAR_LIMIT;
  const canSubmit = question.trim().length > 0 && !isOverLimit && !isLoading && !disabled;

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (canSubmit) {
        onSubmitQuestion();
      }
    }
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (canSubmit) {
          onSubmitQuestion();
        }
      }}
      className="space-y-2"
    >
      <div className="relative rounded-2xl bg-pitch-elevated border border-pitch-border focus-within:border-cricket-gold transition-colors p-2 shadow-inner">
        <textarea
          rows={2}
          value={question}
          onChange={(e) => onChangeQuestion(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isLoading || disabled}
          placeholder="Ask anything about momentum, player form, death-overs acceleration, or fantasy points..."
          aria-label="Ask FanPulse AI a question"
          className="w-full bg-transparent text-white placeholder-gray-500 text-xs sm:text-sm p-2 focus:outline-none resize-none disabled:opacity-50"
        />

        <div className="flex items-center justify-between pt-1 px-1 border-t border-pitch-border/50">
          <div className="flex items-center gap-2">
            <span
              className={`text-[11px] font-mono ${
                isOverLimit
                  ? 'text-red-400 font-bold'
                  : charCount > 200
                  ? 'text-amber-400'
                  : 'text-gray-500'
              }`}
            >
              {charCount} / {MAX_CHAR_LIMIT}
            </span>
            {question.length > 0 && (
              <button
                type="button"
                onClick={() => onChangeQuestion('')}
                className="text-[11px] text-gray-500 hover:text-gray-300 flex items-center gap-0.5"
                title="Clear question"
              >
                <X className="w-3 h-3" />
                <span>Clear</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span className="hidden sm:inline text-[10px] text-gray-500 font-mono">
              Press Enter &crarr;
            </span>
            <Button
              type="submit"
              variant="gold"
              size="sm"
              isLoading={isLoading}
              disabled={!canSubmit}
              leftIcon={Send}
              className="text-xs"
            >
              {isLoading ? 'Synthesizing...' : 'Ask AI'}
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
};

QuestionInputForm.propTypes = {
  question: PropTypes.string.isRequired,
  onChangeQuestion: PropTypes.func.isRequired,
  onSubmitQuestion: PropTypes.func.isRequired,
  isLoading: PropTypes.bool.isRequired,
  disabled: PropTypes.bool,
};

export default QuestionInputForm;
