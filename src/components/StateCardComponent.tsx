import { StateCard, OperativePosture } from '@/types/audit';
import { getWarnings, getOpenBlockerSummary, getPostureLabel, getPostureColorClass, getPostureBgClass, hasActivationBlockers } from '@/hooks/useAuditStore';
import { AlertTriangle, ShieldAlert, ShieldCheck, Shield, Lock, Unlock } from 'lucide-react';

interface StateCardComponentProps {
  card: StateCard;
  onClick: (card: StateCard) => void;
  isDragging?: boolean;
  compact?: boolean;
}

function BlockerStrip({ card }: { card: StateCard }) {
  const blockerKeys = ['B1', 'B2', 'B3', 'B4', 'B5'] as const;
  return (
    <div className="flex gap-0.5">
      {blockerKeys.map(key => {
        const status = card.blockers[key];
        const isActivationCritical = key === 'B1' || key === 'B4';
        let bgClass = '';
        let textClass = 'text-muted-foreground';

        if (status === 'closed') {
          bgClass = 'bg-success/20';
          textClass = 'text-success';
        } else if (status === 'open') {
          bgClass = isActivationCritical ? 'bg-critical/20' : 'bg-warning/20';
          textClass = isActivationCritical ? 'text-critical' : 'text-warning';
        } else if (status === 'partial') {
          bgClass = 'bg-caution/15';
          textClass = 'text-caution';
        } else if (status === 'monitoring') {
          bgClass = 'bg-info/15';
          textClass = 'text-info';
        } else {
          bgClass = 'bg-muted';
        }

        return (
          <span
            key={key}
            className={`text-[8px] font-mono px-1 py-0.5 ${bgClass} ${textClass} leading-none`}
            title={`${key}: ${status}`}
          >
            {key}
          </span>
        );
      })}
    </div>
  );
}

function PostureBadge({ posture }: { posture: OperativePosture }) {
  return (
    <span className={`text-[9px] font-mono uppercase tracking-wider px-1.5 py-0.5 border ${getPostureBgClass(posture)} ${getPostureColorClass(posture)}`}>
      {getPostureLabel(posture)}
    </span>
  );
}

function ClosureBadges({ card }: { card: StateCard }) {
  return (
    <div className="flex gap-1">
      <span className={`text-[8px] font-mono px-1 py-0.5 flex items-center gap-0.5 border ${card.policyClosure ? 'border-posture-policy/40 text-posture-policy bg-posture-policy/10' : 'border-border text-muted-foreground'}`}>
        <Shield className="w-2.5 h-2.5" />
        POL
      </span>
      <span className={`text-[8px] font-mono px-1 py-0.5 flex items-center gap-0.5 border ${card.runtimeClosure ? 'border-posture-runtime/40 text-posture-runtime bg-posture-runtime/10' : 'border-border text-muted-foreground'}`}>
        <ShieldCheck className="w-2.5 h-2.5" />
        RUN
      </span>
    </div>
  );
}

export function StateCardComponent({ card, onClick, isDragging, compact }: StateCardComponentProps) {
  const warnings = getWarnings(card);
  const isBlocked = hasActivationBlockers(card);
  const isTerminal = card.swimlane === 'terminal';
  const hasCriticalFields = card.criticalUnresolvedFields.filter(f => f.activationBlocking).length > 0;

  const borderColor = card.lane === 'A' ? 'border-l-lane-a' : 'border-l-lane-b';
  const terminalClass = isTerminal
    ? card.terminalDisposition === 'NO-GO-finalized'
      ? 'bg-terminal-bg border-posture-nogo/20'
      : 'bg-terminal-bg border-posture-go-hold/20'
    : '';
  const cautionBorder = (!isTerminal && isBlocked) ? 'border-t-2 border-t-warning/60' : '';

  return (
    <div
      onClick={() => onClick(card)}
      className={`${isTerminal ? terminalClass : 'bg-card'} border border-border border-l-[3px] ${borderColor} ${cautionBorder} p-2.5 cursor-pointer hover:bg-accent/50 transition-colors ${isDragging ? 'opacity-80 ring-1 ring-primary/40' : ''}`}
    >
      {/* Row 1: State code + posture */}
      <div className="flex items-start justify-between mb-1.5">
        <div className="flex items-center gap-2">
          <span className="font-mono text-sm font-bold tracking-wide">
            {card.stateCode}
          </span>
          {warnings.length > 0 && (
            <AlertTriangle className="w-3 h-3 text-warning shrink-0" />
          )}
        </div>
        <PostureBadge posture={card.operativePosture} />
      </div>

      {/* Row 2: State name + confidence */}
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[11px] text-muted-foreground font-sans">
          {card.stateName}
        </span>
        <span className={`text-[9px] font-mono ${card.confidence === 'High' ? 'text-confidence-high' : card.confidence === 'Medium' ? 'text-confidence-medium' : 'text-confidence-low'}`}>
          {card.confidence}
        </span>
      </div>

      {/* Row 3: Lane + run mode + closure badges */}
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-1.5">
          <span className={`text-[9px] font-mono uppercase ${card.lane === 'A' ? 'text-lane-a' : 'text-lane-b'}`}>
            Lane {card.lane}
          </span>
          <span className="text-[9px] font-mono text-muted-foreground">
            {card.runMode}
          </span>
        </div>
        <ClosureBadges card={card} />
      </div>

      {/* Row 4: Blocker strip */}
      <div className="flex items-center justify-between mb-1">
        <BlockerStrip card={card} />
        <div className="flex items-center gap-1">
          {card.failClosedPreserved ? (
            <Lock className="w-2.5 h-2.5 text-success" title="Fail-closed preserved" />
          ) : (
            <Unlock className="w-2.5 h-2.5 text-warning" title="Fail-closed NOT preserved" />
          )}
        </div>
      </div>

      {/* Row 5: Critical unresolved fields (activation blocking only) */}
      {hasCriticalFields && !compact && (
        <div className="mt-1.5 pt-1.5 border-t border-warning/20">
          {card.criticalUnresolvedFields.filter(f => f.activationBlocking).slice(0, 3).map((f, i) => (
            <div key={i} className="flex items-start gap-1 mb-0.5">
              <ShieldAlert className="w-2.5 h-2.5 text-critical shrink-0 mt-0.5" />
              <span className="text-[8px] font-mono text-critical leading-tight">
                {f.field}: {f.status}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
