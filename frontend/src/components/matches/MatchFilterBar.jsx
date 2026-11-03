import React from 'react';
import PropTypes from 'prop-types';
import { Search, X, Filter, RotateCcw } from 'lucide-react';
import { Button } from '../ui';

const STATUS_OPTIONS = [
  { id: 'ALL', label: 'All Matches' },
  { id: 'LIVE', label: 'Live' },
  { id: 'UPCOMING', label: 'Upcoming' },
  { id: 'COMPLETED', label: 'Completed' },
];

const FORMAT_OPTIONS = [
  { id: 'ALL', label: 'All Formats' },
  { id: 'T20', label: 'T20' },
  { id: 'ODI', label: 'ODI' },
  { id: 'TEST', label: 'Test' },
];

export const MatchFilterBar = ({
  status = 'ALL',
  onStatusChange,
  format = 'ALL',
  onFormatChange,
  search = '',
  onSearchChange,
  totalCount = 0,
  onReset,
}) => {
  const isFiltered = status !== 'ALL' || format !== 'ALL' || search.trim() !== '';

  return (
    <div className="space-y-4 bg-pitch-card p-4 sm:p-5 rounded-2xl border border-pitch-border">
      {/* Upper Row: Status Tabs & Search Input */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Status Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          {STATUS_OPTIONS.map((tab) => {
            const isActive = status === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onStatusChange(tab.id)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all duration-150 ${
                  isActive
                    ? 'bg-cricket-gold text-pitch-background shadow-md shadow-cricket-gold/10'
                    : 'bg-pitch-surface text-gray-400 hover:text-white hover:bg-pitch-elevated border border-pitch-border'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search teams, countries, venues..."
            className="w-full pl-9 pr-9 py-1.5 text-xs bg-pitch-surface border border-pitch-border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-cricket-gold focus:border-cricket-gold"
          />
          {search && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
              title="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Lower Row: Format Pills & Results Count */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-pitch-border/60">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-gray-400 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5 text-gray-500" />
            Format:
          </span>
          <div className="flex items-center gap-1">
            {FORMAT_OPTIONS.map((f) => {
              const isActive = format === f.id;
              return (
                <button
                  key={f.id}
                  onClick={() => onFormatChange(f.id)}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all ${
                    isActive
                      ? 'bg-cricket-green text-pitch-background'
                      : 'bg-pitch-elevated text-gray-300 hover:text-white hover:bg-pitch-elevated/80'
                  }`}
                >
                  {f.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Matches counter & reset */}
        <div className="flex items-center gap-3">
          <span className="text-xs font-medium text-gray-400">
            Showing <strong className="text-white font-bold">{totalCount}</strong> {totalCount === 1 ? 'match' : 'matches'}
          </span>
          {isFiltered && onReset && (
            <Button
              variant="ghost"
              size="xs"
              onClick={onReset}
              leftIcon={RotateCcw}
              className="text-xs text-cricket-gold hover:text-cricket-gold/80"
            >
              Reset Filters
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

MatchFilterBar.propTypes = {
  status: PropTypes.string,
  onStatusChange: PropTypes.func.isRequired,
  format: PropTypes.string,
  onFormatChange: PropTypes.func.isRequired,
  search: PropTypes.string,
  onSearchChange: PropTypes.func.isRequired,
  totalCount: PropTypes.number,
  onReset: PropTypes.func,
};

export default MatchFilterBar;
