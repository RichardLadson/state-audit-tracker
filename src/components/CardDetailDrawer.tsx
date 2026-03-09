import { useState } from 'react';
import { StateCard, Lane, StateClass, Confidence, RunMode, BlockerStatus, ActivationStatus, WorkflowStatus } from '@/types/audit';
import { getWarnings } from '@/hooks/useAuditStore';
import { X } from 'lucide-react';

interface CardDetailDrawerProps {
  card: StateCard;
  onClose: () => void;
  onUpdate: (id: string, updates: Partial<StateCard>) => void;
}

const BLOCKER_OPTIONS: BlockerStatus[] = ['open', 'partial', 'closed', 'monitoring', 'superseded'];
const LANE_OPTIONS: Lane[] = ['A', 'B'];
const CLASS_OPTIONS: StateClass[] = ['standard likely', 'model-risk', 'special-case', 'likely NO-GO', 'activation candidate'];
const CONFIDENCE_OPTIONS: Confidence[] = ['Low', 'Medium', 'High'];
const RUN_MODE_OPTIONS: RunMode[] = ['preflight', 'scaffold', 'evidence-refresh', 'continuation', 'traceability-closure', 'policy-closure', 'runtime-closure', 'governance', 'controlled-enable', 'reconciliation'];
const ACTIVATION_OPTIONS: ActivationStatus[] = ['scaffolded', 'evidence-backed', 'traceability-closed', 'policy-closed', 'runtime-closed', 'GO', 'enabled', 'NO-GO'];
const WORKFLOW_OPTIONS: WorkflowStatus[] = ['not started', 'in progress', 'packaged', 'finalized'];

function SelectField<T extends string>({ label, value, options, onChange }: { label: string; value: T; options: T[]; onChange: (v: T) => void }) {
  return (
    <div className="mb-3">
      <label className="block font-mono text-[10px] text-muted-foreground uppercase tracking-wider mb-1">{label}</label>
      <select
        value={value}
        onChange={e => onChange(e.target.value as T)}
        className="w-full bg-background border border-border px-2 py-1.5 text-xs text-foreground font-sans focus:outline-none focus:border-primary"
      >
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}

export function CardDetailDrawer({ card, onClose, onUpdate }: CardDetailDrawerProps) {
  const [draft, setDraft] = useState<StateCard>({ ...card });
  const warnings = getWarnings(draft);

  const update = (updates: Partial<StateCard>) => {
    setDraft(prev => ({ ...prev, ...updates }));
  };

  const save = () => {
    onUpdate(card.id, draft);
    onClose();
  };

  return (
    <div className="fixed inset-y-0 right-0 w-[480px] bg-card border-l border-border z-40 overflow-y-auto">
      <div className="flex items-center justify-between p-4 border-b border-border">
        <h2 className="font-mono text-sm font-semibold">
          {draft.stateCode} — {draft.stateName}
        </h2>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="p-4 space-y-0">
        {warnings.length > 0 && (
          <div className="mb-4 border border-warning p-2">
            {warnings.map((w, i) => (
              <p key={i} className="text-[10px] font-mono text-warning">{w}</p>
            ))}
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <SelectField label="Lane" value={draft.lane} options={LANE_OPTIONS} onChange={v => update({ lane: v })} />
          <SelectField label="Confidence" value={draft.confidence} options={CONFIDENCE_OPTIONS} onChange={v => update({ confidence: v })} />
          <SelectField label="Class" value={draft.stateClass} options={CLASS_OPTIONS} onChange={v => update({ stateClass: v })} />
          <SelectField label="Run Mode" value={draft.runMode} options={RUN_MODE_OPTIONS} onChange={v => update({ runMode: v })} />
          <SelectField label="Activation" value={draft.activationStatus} options={ACTIVATION_OPTIONS} onChange={v => update({ activationStatus: v })} />
          <SelectField label="Workflow" value={draft.workflowStatus} options={WORKFLOW_OPTIONS} onChange={v => update({ workflowStatus: v })} />
        </div>

        <div className="mt-4">
          <h3 className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider mb-2">Blockers</h3>
          <div className="space-y-2">
            {(['B1', 'B2', 'B3', 'B4', 'B5'] as const).map(key => (
              <div key={key} className="flex items-center gap-2">
                <span className="font-mono text-xs w-6">{key}</span>
                <select
                  value={draft.blockers[key]}
                  onChange={e => update({ blockers: { ...draft.blockers, [key]: e.target.value as BlockerStatus } })}
                  className="flex-1 bg-background border border-border px-2 py-1 text-xs text-foreground font-sans focus:outline-none focus:border-primary"
                >
                  {BLOCKER_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <div>
            <label className="flex items-center gap-2 font-mono text-xs cursor-pointer">
              <input
                type="checkbox"
                checked={draft.failClosedPreserved}
                onChange={e => update({ failClosedPreserved: e.target.checked })}
                className="accent-primary"
              />
              failClosedPreserved
            </label>
          </div>
          <div>
            <label className="flex items-center gap-2 font-mono text-xs cursor-pointer">
              <input
                type="checkbox"
                checked={draft.constantsActivated}
                onChange={e => update({ constantsActivated: e.target.checked })}
                className="accent-primary"
              />
              constantsActivated
            </label>
          </div>
        </div>

        <div className="mt-4 space-y-3">
          <div>
            <label className="block font-mono text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Status File Path</label>
            <input
              type="text"
              value={draft.statusFilePath}
              onChange={e => update({ statusFilePath: e.target.value })}
              className="w-full bg-background border border-border px-2 py-1.5 text-xs text-foreground font-sans focus:outline-none focus:border-primary"
            />
          </div>
          <div>
            <label className="block font-mono text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Final Readout Path</label>
            <input
              type="text"
              value={draft.finalReadoutPath}
              onChange={e => update({ finalReadoutPath: e.target.value })}
              className="w-full bg-background border border-border px-2 py-1.5 text-xs text-foreground font-sans focus:outline-none focus:border-primary"
            />
          </div>
          <div>
            <label className="block font-mono text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Latest Commit</label>
            <input
              type="text"
              value={draft.latestCommit}
              onChange={e => update({ latestCommit: e.target.value })}
              className="w-full bg-background border border-border px-2 py-1.5 text-xs text-foreground font-sans focus:outline-none focus:border-primary"
            />
          </div>
          <div>
            <label className="block font-mono text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Notes</label>
            <textarea
              value={draft.notes}
              onChange={e => update({ notes: e.target.value })}
              rows={3}
              className="w-full bg-background border border-border px-2 py-1.5 text-xs text-foreground font-sans focus:outline-none focus:border-primary resize-none"
            />
          </div>
        </div>

        {draft.transitionLog.length > 0 && (
          <div className="mt-4">
            <h3 className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider mb-2">Transition Log</h3>
            <div className="space-y-1 max-h-40 overflow-y-auto">
              {draft.transitionLog.map((entry, i) => (
                <div key={i} className="text-[10px] font-sans text-muted-foreground border-b border-border pb-1">
                  <span className="font-mono">{entry.from} → {entry.to}</span>
                  <span className="mx-2">·</span>
                  <span>{entry.reason}</span>
                  <span className="mx-2">·</span>
                  <span>{new Date(entry.timestamp).toLocaleDateString()}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-6 flex gap-2">
          <button
            onClick={save}
            className="font-mono text-xs px-4 py-2 bg-primary text-primary-foreground hover:opacity-90"
          >
            Save Changes
          </button>
          <button
            onClick={onClose}
            className="font-mono text-xs px-4 py-2 border border-border hover:bg-accent"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
