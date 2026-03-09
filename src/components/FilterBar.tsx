import { useState, useMemo } from 'react';
import { StateCard, Lane, StateClass, Confidence, RunMode, BlockerStatus } from '@/types/audit';
import { Search, X } from 'lucide-react';

export interface Filters {
  search: string;
  lane: Lane | '';
  stateClass: StateClass | '';
  confidence: Confidence | '';
  blockerState: BlockerStatus | '';
  runMode: RunMode | '';
}

export const emptyFilters: Filters = {
  search: '',
  lane: '',
  stateClass: '',
  confidence: '',
  blockerState: '',
  runMode: '',
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
    if (filters.blockerState) {
      const hasBlocker = Object.values(card.blockers).some(b => b === filters.blockerState);
      if (!hasBlocker) return false;
    }
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

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <div className="relative">
        <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search state..."
          value={filters.search}
          onChange={e => set('search', e.target.value)}
          className="bg-background border border-border pl-7 pr-2 py-1 text-xs text-foreground font-sans w-36 focus:outline-none focus:border-primary"
        />
      </div>

      <select value={filters.lane} onChange={e => set('lane', e.target.value as Lane | '')} className="bg-background border border-border px-2 py-1 text-xs text-foreground font-mono focus:outline-none focus:border-primary">
        <option value="">Lane</option>
        <option value="A">A</option>
        <option value="B">B</option>
      </select>

      <select value={filters.stateClass} onChange={e => set('stateClass', e.target.value as StateClass | '')} className="bg-background border border-border px-2 py-1 text-xs text-foreground font-mono focus:outline-none focus:border-primary">
        <option value="">Class</option>
        <option value="standard likely">standard likely</option>
        <option value="model-risk">model-risk</option>
        <option value="special-case">special-case</option>
        <option value="likely NO-GO">likely NO-GO</option>
        <option value="activation candidate">activation candidate</option>
      </select>

      <select value={filters.confidence} onChange={e => set('confidence', e.target.value as Confidence | '')} className="bg-background border border-border px-2 py-1 text-xs text-foreground font-mono focus:outline-none focus:border-primary">
        <option value="">Confidence</option>
        <option value="High">High</option>
        <option value="Medium">Medium</option>
        <option value="Low">Low</option>
      </select>

      <select value={filters.runMode} onChange={e => set('runMode', e.target.value as RunMode | '')} className="bg-background border border-border px-2 py-1 text-xs text-foreground font-mono focus:outline-none focus:border-primary">
        <option value="">Run Mode</option>
        <option value="preflight">preflight</option>
        <option value="scaffold">scaffold</option>
        <option value="evidence-refresh">evidence-refresh</option>
        <option value="continuation">continuation</option>
        <option value="traceability-closure">traceability-closure</option>
        <option value="policy-closure">policy-closure</option>
        <option value="runtime-closure">runtime-closure</option>
        <option value="governance">governance</option>
        <option value="controlled-enable">controlled-enable</option>
        <option value="reconciliation">reconciliation</option>
      </select>

      <select value={filters.blockerState} onChange={e => set('blockerState', e.target.value as BlockerStatus | '')} className="bg-background border border-border px-2 py-1 text-xs text-foreground font-mono focus:outline-none focus:border-primary">
        <option value="">Blocker</option>
        <option value="open">open</option>
        <option value="partial">partial</option>
        <option value="closed">closed</option>
        <option value="monitoring">monitoring</option>
        <option value="superseded">superseded</option>
      </select>

      {hasFilters && (
        <button
          onClick={() => onChange(emptyFilters)}
          className="font-mono text-[10px] text-muted-foreground hover:text-foreground flex items-center gap-1"
        >
          <X className="w-3 h-3" /> Clear
        </button>
      )}
    </div>
  );
}
