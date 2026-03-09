import { useState } from 'react';
import { StateCard, ColumnId, COLUMNS } from '@/types/audit';
import { canMoveToColumn } from '@/hooks/useAuditStore';

interface TransitionModalProps {
  card: StateCard;
  targetColumn: ColumnId;
  onCommit: (reason: string) => void;
  onCancel: () => void;
}

export function TransitionModal({ card, targetColumn, onCommit, onCancel }: TransitionModalProps) {
  const [reason, setReason] = useState('');
  const check = canMoveToColumn(card, targetColumn);

  if (!check.allowed) {
    return (
      <div className="fixed inset-0 bg-background/80 flex items-center justify-center z-50">
        <div className="bg-card border border-border p-4 w-[400px]">
          <h3 className="font-mono text-sm font-semibold mb-2 text-destructive">Transition blocked</h3>
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
      <div className="bg-card border border-border p-4 w-[400px]">
        <h3 className="font-mono text-sm font-semibold mb-1">Transition Commit</h3>
        <p className="text-xs text-muted-foreground mb-3 font-sans">
          {card.stateCode}: {card.column} → {targetColumn}
        </p>
        <label className="block font-mono text-xs text-muted-foreground mb-1">
          Transition Reason:
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
