import { StateCard } from '@/types/audit';
import { getWarnings, getOpenBlockerSummary } from '@/hooks/useAuditStore';
import { AlertTriangle } from 'lucide-react';

interface StateCardComponentProps {
  card: StateCard;
  onClick: (card: StateCard) => void;
  isDragging?: boolean;
}

function ConfidenceBadge({ confidence }: { confidence: string }) {
  const cls =
    confidence === 'High' ? 'bg-confidence-high text-background' :
    confidence === 'Medium' ? 'bg-confidence-medium text-background' :
    'bg-confidence-low text-foreground';
  return (
    <span className={`px-1.5 py-0.5 text-[10px] font-mono uppercase tracking-wider ${cls}`}>
      {confidence}
    </span>
  );
}

export function StateCardComponent({ card, onClick, isDragging }: StateCardComponentProps) {
  const warnings = getWarnings(card);
  const openBlockers = getOpenBlockerSummary(card);
  const borderColor = card.lane === 'A' ? 'border-l-lane-a' : 'border-l-lane-b';

  return (
    <div
      onClick={() => onClick(card)}
      className={`bg-card border border-border border-l-[3px] ${borderColor} p-3 cursor-pointer hover:bg-accent transition-colors ${isDragging ? 'opacity-80' : ''}`}
    >
      <div className="flex items-center justify-between mb-1.5">
        <span className="font-mono text-sm font-semibold tracking-wide">
          {card.stateCode}
        </span>
        <div className="flex items-center gap-1.5">
          {warnings.length > 0 && (
            <AlertTriangle className="w-3.5 h-3.5 text-warning" />
          )}
          <ConfidenceBadge confidence={card.confidence} />
        </div>
      </div>

      <div className="text-xs text-muted-foreground mb-1.5 font-sans">
        {card.stateName}
      </div>

      <div className="flex items-center gap-2 mb-1.5">
        <span className={`text-[10px] font-mono uppercase ${card.lane === 'A' ? 'text-lane-a' : 'text-lane-b'}`}>
          Lane {card.lane}
        </span>
        <span className="text-[10px] font-mono text-muted-foreground uppercase">
          {card.runMode}
        </span>
      </div>

      {openBlockers.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-1">
          {openBlockers.map(b => {
            const isRisk = b.startsWith('B1') || b.startsWith('B4');
            return (
              <span
                key={b}
                className={`text-[9px] font-mono px-1 py-0.5 border ${isRisk ? 'border-warning text-warning' : 'border-border text-muted-foreground'}`}
              >
                {b}
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
}
