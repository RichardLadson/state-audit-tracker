import { useState } from 'react';
import { StateCard, StageColumnId, Swimlane, STAGE_COLUMNS } from '@/types/audit';
import { canMoveToStage } from '@/hooks/useAuditStore';
import { AlertTriangle } from 'lucide-react';

interface TransitionModalProps {
  card: StateCard;
  targetSwimlane: Swimlane;
  targetStage: StageColumnId;
  onCommit: (reason: string) => void;
  onCancel: () => void;
}

const SWIMLANE_LABELS: Record<Swimlane, string> = {
  'lane-a-active': 'Lane A — Active',
  'lane-b-active': 'Lane B — Active',
  'full-enable': 'Full-Enable Track',
  'terminal': 'Terminal States',
};

export function TransitionModal({ card, targetSwimlane, targetStage, onCommit, onCancel }: TransitionModalProps) {
  const [reason, setReason] = useState('');
  const check = canMoveToStage(card, targetSwimlane, targetStage);

  if (!check.allowed) {
    return (
      <div className="fixed inset-0 bg-background/80 flex items-center justify-center z-50">
        <div className="bg-card border border-border p-4 w-[440px]">
          <h3 className="font-mono text-sm font-semibold mb-2 text-critical">Transition Blocked</h3>
          <p className="text-xs text-muted-foreground mb-4 font-sans">{check.reason}</p>
          <button
            onClick={onCancel}
            className="font-mono text-xs px-3 py-1.5 border border-border hover:bg-accent"
          >
            Dismiss
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-background/80 flex items-center justify-center z-50">
      <div className="bg-card border border-border p-4 w-[440px]">
        <h3 className="font-mono text-sm font-semibold mb-1">Transition Commit</h3>
        <p className="text-xs text-muted-foreground mb-3 font-sans">
          <span className="font-mono font-semibold text-foreground">{card.stateCode}</span>
          {' '}{SWIMLANE_LABELS[card.swimlane]} / {card.stageColumn}
          {' → '}{SWIMLANE_LABELS[targetSwimlane]} / {targetStage}
        </p>

        {check.warnings && check.warnings.length > 0 && (
          <div className="mb-3 border border-warning/30 bg-warning/5 p-2 space-y-1">
            {check.warnings.map((w, i) => (
              <div key={i} className="flex items-start gap-1.5">
                <AlertTriangle className="w-3 h-3 text-warning shrink-0 mt-0.5" />
                <span className="text-[10px] font-mono text-warning">{w}</span>
              </div>
            ))}
          </div>
        )}

        <label className="block font-mono text-xs text-muted-foreground mb-1">
          Transition Reason (required):
        </label>
        <input
          type="text"
          value={reason}
          onChange={e => setReason(e.target.value)}
          autoFocus
          className="w-full bg-background border border-border px-2 py-1.5 text-xs text-foreground font-sans focus:outline-none focus:border-primary mb-3"
          onKeyDown={e => {
            if (e.key === 'Enter' && reason.trim()) onCommit(reason.trim());
            if (e.key === 'Escape') onCancel();
          }}
        />
        <div className="flex gap-2">
          <button
            disabled={!reason.trim()}
            onClick={() => onCommit(reason.trim())}
            className="font-mono text-xs px-3 py-1.5 bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Commit
          </button>
          <button
            onClick={onCancel}
            className="font-mono text-xs px-3 py-1.5 border border-border hover:bg-accent"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
