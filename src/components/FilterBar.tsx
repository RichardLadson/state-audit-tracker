import { useState, useMemo } from 'react';
import { StateCard, Lane, StateClass, Confidence, RunMode, BlockerStatus, Swimlane, OperativePosture } from '@/types/audit';
import { Search, X } from 'lucide-react';

export interface Filters {
  search: string;
  lane: Lane | '';
  stateClass: StateClass | '';
  confidence: Confidence | '';
  blockerState: BlockerStatus | '';
  runMode: RunMode | '';
  swimlane: Swimlane | 'terminal' | '';
  posture: OperativePosture | '';
  activationBlocked: '' | 'yes' | 'no';
  runtimeReady: '' | 'yes' | 'no';
}

export const emptyFilters: Filters = {
  search: '',
  lane: '',
  stateClass: '',
  confidence: '',
  blockerState: '',
  runMode: '',
  swimlane: '',
  posture: '',
  activationBlocked: '',
  runtimeReady: '',
};

export function applyFilters(cards: StateCard[], filters: Filters): StateCard[] {
  return cards.filter(card => {
    if (filters.search) {
      const s = filters.search.toLowerCase();
      if (!card.stateCode.toLowerCase().includes(s) && !card.stateName.toLowerCase().includes(s)) return false;
    }
    if (filters.lane && card.lane !== filters.lane) return false;
    if (filters.stateClass && card.stateClass !== filters.stateClass) return false;
    if (filters.confidence && card.confidence !== filters.confidence) return false;
    if (filters.runMode && card.runMode !== filters.runMode) return false;
    if (filters.swimlane && card.swimlane !== filters.swimlane) return false;
    if (filters.posture && card.operativePosture !== filters.posture) return false;
    if (filters.blockerState) {
      const hasBlocker = Object.values(card.blockers).some(b => b === filters.blockerState);
      if (!hasBlocker) return false;
    }
    if (filters.activationBlocked === 'yes') {
      const blocked = card.criticalUnresolvedFields.some(f => f.activationBlocking) || card.blockers.B4 !== 'closed';
      if (!blocked) return false;
    }
    if (filters.activationBlocked === 'no') {
      const blocked = card.criticalUnresolvedFields.some(f => f.activationBlocking) || card.blockers.B4 !== 'closed';
      if (blocked) return false;
    }
    if (filters.runtimeReady === 'yes' && !card.runtimeClosure) return false;
    if (filters.runtimeReady === 'no' && card.runtimeClosure) return false;
    return true;
  });
}

interface FilterBarProps {
  filters: Filters;
  onChange: (filters: Filters) => void;
}

export function FilterBar({ filters, onChange }: FilterBarProps) {
  const hasFilters = Object.values(filters).some(v => v !== '');

  const set = <K extends keyof Filters>(key: K, value: Filters[K]) => {
    onChange({ ...filters, [key]: value });
  };

  const selectClass = "bg-background border border-border px-1.5 py-1 text-[10px] text-foreground font-mono focus:outline-none focus:border-primary";

  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      <div className="relative">
        <Search className="absolute left-1.5 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search..."
          value={filters.search}
          onChange={e => set('search', e.target.value)}
          className="bg-background border border-border pl-6 pr-2 py-1 text-[10px] text-foreground font-sans w-28 focus:outline-none focus:border-primary"
        />
      </div>

      <select value={filters.lane} onChange={e => set('lane', e.target.value as Lane | '')} className={selectClass}>
        <option value="">Lane</option>
        <option value="A">A</option>
        <option value="B">B</option>
      </select>

      <select value={filters.posture} onChange={e => set('posture', e.target.value as OperativePosture | '')} className={selectClass}>
        <option value="">Posture</option>
        <option value="reference-only">Reference Only</option>
        <option value="evidence-remediation">Evidence Remediation</option>
        <option value="runtime-pending">Runtime Pending</option>
        <option value="policy-advanced">Policy Advanced</option>
        <option value="controlled-enable">Controlled Enable</option>
        <option value="GO-hold">GO Hold</option>
        <option value="NO-GO-finalized">NO-GO Finalized</option>
        <option value="enabled">Enabled</option>
      </select>

      <select value={filters.confidence} onChange={e => set('confidence', e.target.value as Confidence | '')} className={selectClass}>
        <option value="">Conf</option>
        <option value="High">High</option>
        <option value="Medium">Medium</option>
        <option value="Low">Low</option>
      </select>

      <select value={filters.blockerState} onChange={e => set('blockerState', e.target.value as BlockerStatus | '')} className={selectClass}>
        <option value="">Blocker</option>
        <option value="open">open</option>
        <option value="partial">partial</option>
        <option value="closed">closed</option>
        <option value="monitoring">monitoring</option>
      </select>

      <select value={filters.activationBlocked} onChange={e => set('activationBlocked', e.target.value as '' | 'yes' | 'no')} className={selectClass}>
        <option value="">Act.Block</option>
        <option value="yes">Blocked</option>
        <option value="no">Clear</option>
      </select>

      <select value={filters.runtimeReady} onChange={e => set('runtimeReady', e.target.value as '' | 'yes' | 'no')} className={selectClass}>
        <option value="">Runtime</option>
        <option value="yes">Ready</option>
        <option value="no">Not Ready</option>
      </select>

      {hasFilters && (
        <button
          onClick={() => onChange(emptyFilters)}
          className="font-mono text-[9px] text-muted-foreground hover:text-foreground flex items-center gap-0.5"
        >
          <X className="w-3 h-3" /> Clear
        </button>
      )}
    </div>
  );
}
