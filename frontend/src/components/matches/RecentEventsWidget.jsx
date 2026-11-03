import React from 'react';
import PropTypes from 'prop-types';
import { Activity, Flame, ShieldAlert, Award, TrendingUp } from 'lucide-react';
import { Card, Badge } from '../ui';

export const RecentEventsWidget = ({ events = [] }) => {
  if (!events || events.length === 0) {
    return (
      <Card variant="default" padding="md" className="border-pitch-border">
        <p className="text-xs text-gray-400">No pivotal match events logged yet.</p>
      </Card>
    );
  }

  const getEventIcon = (type) => {
    switch (type) {
      case 'WICKET':
        return <ShieldAlert className="w-4 h-4 text-red-400" />;
      case 'SIX':
      case 'FOUR':
        return <Flame className="w-4 h-4 text-cricket-gold" />;
      case 'MILESTONE':
        return <Award className="w-4 h-4 text-cricket-gold" />;
      case 'PARTNERSHIP':
        return <TrendingUp className="w-4 h-4 text-cricket-green" />;
      default:
        return <Activity className="w-4 h-4 text-gray-400" />;
    }
  };

  return (
    <Card variant="default" padding="none" className="border-pitch-border overflow-hidden">
      <div className="p-4 bg-pitch-elevated/70 border-b border-pitch-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-cricket-gold" />
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            Match Highlights & Turning Points
          </h3>
        </div>
        <Badge variant="warning" size="xs">
          KEY MOMENTS
        </Badge>
      </div>

      <div className="p-4 space-y-3 divide-y divide-pitch-border/60">
        {events.map((ev) => (
          <div key={ev.id} className="pt-3 first:pt-0 flex items-start gap-3">
            <div className="p-2 rounded-lg bg-pitch-surface border border-pitch-border mt-0.5 flex-shrink-0">
              {getEventIcon(ev.type)}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-mono font-bold text-cricket-gold">
                  Over {ev.over}
                </span>
                <Badge variant={ev.badgeVariant || 'neutral'} size="xs">
                  {ev.badge}
                </Badge>
              </div>

              <h4 className="text-xs font-bold text-white mt-1">{ev.headline}</h4>
              <p className="text-[11px] text-gray-400 mt-0.5 leading-relaxed">{ev.detail}</p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

RecentEventsWidget.propTypes = {
  events: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      type: PropTypes.string.isRequired,
      over: PropTypes.string.isRequired,
      headline: PropTypes.string.isRequired,
      detail: PropTypes.string.isRequired,
      badge: PropTypes.string.isRequired,
      badgeVariant: PropTypes.string,
    })
  ),
};

export default RecentEventsWidget;
