import { useState } from 'react';
import { StateCard, Lane, StateClass, Confidence, RunMode, BlockerStatus, ActivationStatus, WorkflowStatus, OperativePosture, CriticalUnresolvedField } from '@/types/audit';
import { getWarnings, getPostureLabel, getPostureColorClass, getPostureBgClass, hasActivationBlockers } from '@/hooks/useAuditStore';
import { X, Shield, ShieldCheck, ShieldAlert, Lock, Unlock, AlertTriangle, ChevronDown, ChevronRight, Plus, Trash2 } from 'lucide-react';

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
const POSTURE_OPTIONS: OperativePosture[] = ['reference-only', 'evidence-remediation', 'runtime-pending', 'policy-advanced', 'controlled-enable', 'full-enable-track', 'GO-hold', 'NO-GO-finalized', 'enabled'];

function SelectField<T extends string>({ label, value, options, onChange }: { label: string; value: T; options: T[]; onChange: (v: T) => void }) {
  return (
    <div>
      <label className="block font-mono text-[9px] text-muted-foreground uppercase tracking-wider mb-0.5">{label}</label>
      <select
        value={value}
        onChange={e => onChange(e.target.value as T)}
        className="w-full bg-background border border-border px-2 py-1 text-[11px] text-foreground font-sans focus:outline-none focus:border-primary"
      >
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}

function Section({ title, children, defaultOpen = true }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-border">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-2 py-2 px-4 text-left hover:bg-accent/30"
      >
        {open ? <ChevronDown className="w-3 h-3 text-muted-foreground" /> : <ChevronRight className="w-3 h-3 text-muted-foreground" />}
        <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground font-bold">{title}</span>
      </button>
      {open && <div className="px-4 pb-3">{children}</div>}
    </div>
  );
}

function BlockerStatusBadge({ status }: { status: BlockerStatus }) {
  const cls = status === 'closed' ? 'text-success bg-success/10'
    : status === 'open' ? 'text-critical bg-critical/10'
    : status === 'partial' ? 'text-caution bg-caution/10'
    : status === 'monitoring' ? 'text-info bg-info/10'
    : 'text-muted-foreground bg-muted';
  return (
    <span className={`text-[9px] font-mono px-1.5 py-0.5 ${cls}`}>{status}</span>
  );
}

export function CardDetailDrawer({ card, onClose, onUpdate }: CardDetailDrawerProps) {
  const [draft, setDraft] = useState<StateCard>({ ...card });
  const warnings = getWarnings(draft);
  const blocked = hasActivationBlockers(draft);

  const update = (updates: Partial<StateCard>) => {
    setDraft(prev => ({ ...prev, ...updates }));
  };

  const save = () => {
    onUpdate(card.id, draft);
    onClose();
  };

  const addCriticalField = () => {
    update({
      criticalUnresolvedFields: [
        ...draft.criticalUnresolvedFields,
        { field: '', status: 'unresolved', note: '', activationBlocking: true },
      ],
    });
  };

  const updateCriticalField = (index: number, updates: Partial<CriticalUnresolvedField>) => {
    const fields = [...draft.criticalUnresolvedFields];
    fields[index] = { ...fields[index], ...updates };
    update({ criticalUnresolvedFields: fields });
  };

  const removeCriticalField = (index: number) => {
    update({ criticalUnresolvedFields: draft.criticalUnresolvedFields.filter((_, i) => i !== index) });
  };

  return (
    <div className="fixed inset-y-0 right-0 w-[520px] bg-card border-l border-border z-40 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border shrink-0">
        <div className="flex items-center gap-3">
          <span className={`font-mono text-lg font-bold ${draft.lane === 'A' ? 'text-lane-a' : 'text-lane-b'}`}>
            {draft.stateCode}
          </span>
          <span className="text-sm text-foreground font-sans">{draft.stateName}</span>
        </div>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto">
        {/* Operative Posture Summary */}
        <div className="px-4 py-3 border-b border-border">
          <div className="flex items-center justify-between mb-2">
            <span className={`font-mono text-xs font-bold uppercase tracking-wider ${getPostureColorClass(draft.operativePosture)}`}>
              {getPostureLabel(draft.operativePosture)}
            </span>
            {blocked && (
              <span className="flex items-center gap-1 text-[9px] font-mono text-warning bg-warning/10 px-1.5 py-0.5">
                <AlertTriangle className="w-2.5 h-2.5" /> ACTIVATION BLOCKED
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <span className={`text-[10px] font-mono uppercase ${draft.lane === 'A' ? 'text-lane-a' : 'text-lane-b'}`}>
              Lane {draft.lane}
            </span>
            <span className={`text-[10px] font-mono ${draft.confidence === 'High' ? 'text-confidence-high' : draft.confidence === 'Medium' ? 'text-confidence-medium' : 'text-confidence-low'}`}>
              {draft.confidence} conf
            </span>
            <span className="text-[10px] font-mono text-muted-foreground">{draft.runMode}</span>
          </div>
          <div className="flex items-center gap-3 mt-2">
            <span className={`text-[10px] font-mono flex items-center gap-1 ${draft.policyClosure ? 'text-posture-policy' : 'text-muted-foreground'}`}>
              <Shield className="w-3 h-3" /> Policy: {draft.policyClosure ? 'Closed' : 'Open'}
            </span>
            <span className={`text-[10px] font-mono flex items-center gap-1 ${draft.runtimeClosure ? 'text-posture-runtime' : 'text-muted-foreground'}`}>
              <ShieldCheck className="w-3 h-3" /> Runtime: {draft.runtimeClosure ? 'Closed' : 'Open'}
            </span>
            <span className={`text-[10px] font-mono flex items-center gap-1 ${draft.failClosedPreserved ? 'text-success' : 'text-warning'}`}>
              {draft.failClosedPreserved ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
              Fail-closed: {draft.failClosedPreserved ? 'Yes' : 'No'}
            </span>
          </div>
        </div>

        {/* Warnings */}
        {warnings.length > 0 && (
          <div className="px-4 py-2 border-b border-warning/20 bg-warning/5">
            {warnings.map((w, i) => (
              <div key={i} className="flex items-start gap-1.5 mb-0.5">
                <AlertTriangle className="w-3 h-3 text-warning shrink-0 mt-0.5" />
                <span className="text-[10px] font-mono text-warning">{w}</span>
              </div>
            ))}
          </div>
        )}

        {/* Blocker Matrix */}
        <Section title="Blocker Matrix">
          <div className="space-y-1.5">
            {(['B1', 'B2', 'B3', 'B4', 'B5'] as const).map(key => {
              const isActivationCritical = key === 'B1' || key === 'B4';
              return (
                <div key={key} className="flex items-center gap-2">
                  <span className={`font-mono text-[11px] w-6 font-bold ${isActivationCritical && draft.blockers[key] !== 'closed' ? 'text-critical' : 'text-foreground'}`}>
                    {key}
                  </span>
                  {isActivationCritical && draft.blockers[key] !== 'closed' && (
                    <ShieldAlert className="w-3 h-3 text-critical shrink-0" />
                  )}
                  <select
                    value={draft.blockers[key]}
                    onChange={e => update({ blockers: { ...draft.blockers, [key]: e.target.value as BlockerStatus } })}
                    className="flex-1 bg-background border border-border px-2 py-1 text-[11px] text-foreground font-sans focus:outline-none focus:border-primary"
                  >
                    {BLOCKER_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                  <BlockerStatusBadge status={draft.blockers[key]} />
                </div>
              );
            })}
          </div>
        </Section>

        {/* Critical Unresolved Fields */}
        <Section title="Critical Unresolved Fields">
          {draft.criticalUnresolvedFields.length === 0 ? (
            <p className="text-[10px] font-mono text-muted-foreground/60 mb-2">No critical unresolved fields.</p>
          ) : (
            <div className="space-y-2 mb-2">
              {draft.criticalUnresolvedFields.map((f, i) => (
                <div key={i} className={`border p-2 ${f.activationBlocking ? 'border-critical/30 bg-critical/5' : 'border-border'}`}>
                  <div className="flex items-center gap-2 mb-1">
                    <input
                      value={f.field}
                      onChange={e => updateCriticalField(i, { field: e.target.value })}
                      placeholder="Field name"
                      className="flex-1 bg-background border border-border px-1.5 py-0.5 text-[10px] text-foreground font-mono focus:outline-none focus:border-primary"
                    />
                    <select
                      value={f.status}
                      onChange={e => updateCriticalField(i, { status: e.target.value as CriticalUnresolvedField['status'] })}
                      className="bg-background border border-border px-1.5 py-0.5 text-[10px] text-foreground font-mono focus:outline-none focus:border-primary"
                    >
                      <option value="unresolved">unresolved</option>
                      <option value="plausible-not-closed">plausible-not-closed</option>
                      <option value="missing">missing</option>
                      <option value="pending">pending</option>
                    </select>
                    <label className="flex items-center gap-1 text-[9px] font-mono text-muted-foreground">
                      <input
                        type="checkbox"
                        checked={f.activationBlocking}
                        onChange={e => updateCriticalField(i, { activationBlocking: e.target.checked })}
                        className="accent-critical"
                      />
                      blocking
                    </label>
                    <button onClick={() => removeCriticalField(i)} className="text-muted-foreground hover:text-critical">
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                  <input
                    value={f.note}
                    onChange={e => updateCriticalField(i, { note: e.target.value })}
                    placeholder="Note"
                    className="w-full bg-background border border-border px-1.5 py-0.5 text-[10px] text-foreground font-sans focus:outline-none focus:border-primary"
                  />
                </div>
              ))}
            </div>
          )}
          <button onClick={addCriticalField} className="flex items-center gap-1 text-[10px] font-mono text-primary hover:text-primary/80">
            <Plus className="w-3 h-3" /> Add field
          </button>
        </Section>

        {/* Classification & Settings */}
        <Section title="Classification & Settings">
          <div className="grid grid-cols-2 gap-2">
            <SelectField label="Lane" value={draft.lane} options={LANE_OPTIONS} onChange={v => update({ lane: v })} />
            <SelectField label="Confidence" value={draft.confidence} options={CONFIDENCE_OPTIONS} onChange={v => update({ confidence: v })} />
            <SelectField label="Class" value={draft.stateClass} options={CLASS_OPTIONS} onChange={v => update({ stateClass: v })} />
            <SelectField label="Run Mode" value={draft.runMode} options={RUN_MODE_OPTIONS} onChange={v => update({ runMode: v })} />
            <SelectField label="Operative Posture" value={draft.operativePosture} options={POSTURE_OPTIONS} onChange={v => update({ operativePosture: v })} />
            <SelectField label="Activation" value={draft.activationStatus} options={ACTIVATION_OPTIONS} onChange={v => update({ activationStatus: v })} />
            <SelectField label="Workflow" value={draft.workflowStatus} options={WORKFLOW_OPTIONS} onChange={v => update({ workflowStatus: v })} />
          </div>
          <div className="mt-3 grid grid-cols-3 gap-2">
            <label className="flex items-center gap-1.5 font-mono text-[10px] cursor-pointer">
              <input type="checkbox" checked={draft.policyClosure} onChange={e => update({ policyClosure: e.target.checked })} className="accent-primary" />
              policyClosure
            </label>
            <label className="flex items-center gap-1.5 font-mono text-[10px] cursor-pointer">
              <input type="checkbox" checked={draft.runtimeClosure} onChange={e => update({ runtimeClosure: e.target.checked })} className="accent-primary" />
              runtimeClosure
            </label>
            <label className="flex items-center gap-1.5 font-mono text-[10px] cursor-pointer">
              <input type="checkbox" checked={draft.failClosedPreserved} onChange={e => update({ failClosedPreserved: e.target.checked })} className="accent-primary" />
              failClosed
            </label>
            <label className="flex items-center gap-1.5 font-mono text-[10px] cursor-pointer">
              <input type="checkbox" checked={draft.constantsActivated} onChange={e => update({ constantsActivated: e.target.checked })} className="accent-primary" />
              constants
            </label>
          </div>
        </Section>

        {/* Artifacts & Paths */}
        <Section title="Artifacts & Paths">
          <div className="space-y-2">
            <div>
              <label className="block font-mono text-[9px] text-muted-foreground uppercase tracking-wider mb-0.5">Status File</label>
              <input
                type="text" value={draft.statusFilePath} onChange={e => update({ statusFilePath: e.target.value })}
                className="w-full bg-background border border-border px-2 py-1 text-[11px] text-foreground font-mono focus:outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="block font-mono text-[9px] text-muted-foreground uppercase tracking-wider mb-0.5">Final Readout</label>
              <input
                type="text" value={draft.finalReadoutPath} onChange={e => update({ finalReadoutPath: e.target.value })}
                className="w-full bg-background border border-border px-2 py-1 text-[11px] text-foreground font-mono focus:outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="block font-mono text-[9px] text-muted-foreground uppercase tracking-wider mb-0.5">Latest Commit</label>
              <input
                type="text" value={draft.latestCommit} onChange={e => update({ latestCommit: e.target.value })}
                className="w-full bg-background border border-border px-2 py-1 text-[11px] text-foreground font-mono focus:outline-none focus:border-primary"
              />
            </div>
          </div>
        </Section>

        {/* Notes (operative) */}
        <Section title="Operative Notes">
          <textarea
            value={draft.notes} onChange={e => update({ notes: e.target.value })} rows={2}
            className="w-full bg-background border border-border px-2 py-1 text-[11px] text-foreground font-sans focus:outline-none focus:border-primary resize-none"
          />
        </Section>

        {/* History Panel (secondary) */}
        <Section title="History & Lessons" defaultOpen={false}>
          <div className="space-y-2">
            <div>
              <label className="block font-mono text-[9px] text-muted-foreground uppercase tracking-wider mb-0.5">Audit Notes</label>
              <textarea
                value={draft.auditNotes} onChange={e => update({ auditNotes: e.target.value })} rows={2}
                className="w-full bg-background border border-border px-2 py-1 text-[10px] text-muted-foreground font-sans focus:outline-none focus:border-primary resize-none"
              />
            </div>
            <div>
              <label className="block font-mono text-[9px] text-muted-foreground uppercase tracking-wider mb-0.5">Lessons Learned</label>
              <textarea
                value={draft.lessonsLearned} onChange={e => update({ lessonsLearned: e.target.value })} rows={2}
                className="w-full bg-background border border-border px-2 py-1 text-[10px] text-muted-foreground font-sans focus:outline-none focus:border-primary resize-none"
              />
            </div>
            {draft.history.length > 0 && (
              <div>
                <label className="block font-mono text-[9px] text-muted-foreground uppercase tracking-wider mb-1">Event History</label>
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {draft.history.map((h, i) => (
                    <div key={i} className="text-[10px] text-muted-foreground border-l-2 border-border pl-2">
                      <span className="font-mono text-muted-foreground/70">{h.date}</span>
                      <span className="mx-1.5">·</span>
                      <span className="font-semibold">{h.event}</span>
                      <p className="text-[9px] text-muted-foreground/60">{h.detail}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {draft.transitionLog.length > 0 && (
              <div>
                <label className="block font-mono text-[9px] text-muted-foreground uppercase tracking-wider mb-1">Transition Log</label>
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {draft.transitionLog.map((entry, i) => (
                    <div key={i} className="text-[10px] font-sans text-muted-foreground border-l-2 border-border pl-2">
                      <span className="font-mono">{entry.from} → {entry.to}</span>
                      <span className="mx-1.5">·</span>
                      <span>{entry.reason}</span>
                      <span className="mx-1.5">·</span>
                      <span className="text-muted-foreground/60">{new Date(entry.timestamp).toLocaleDateString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Section>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-border shrink-0 flex gap-2">
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
  );
}
