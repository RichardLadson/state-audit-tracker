import { StateCard } from '@/types/audit';
import { getWarnings, getOpenBlockerSummary, getPostureLabel, getPostureColorClass, hasActivationBlockers } from '@/hooks/useAuditStore';
import { AlertTriangle, Shield, ShieldCheck, ArrowUpDown, Lock, Unlock } from 'lucide-react';
import { useState, useMemo } from 'react';

interface TableViewProps {
  cards: StateCard[];
  onCardClick: (card: StateCard) => void;
}

type SortKey = 'stateCode' | 'stateName' | 'lane' | 'confidence' | 'swimlane' | 'stageColumn' | 'operativePosture' | 'runMode';

export function TableView({ cards, onCardClick }: TableViewProps) {
  const [sortKey, setSortKey] = useState<SortKey>('stateCode');
  const [sortAsc, setSortAsc] = useState(true);

  const sorted = useMemo(() => {
    return [...cards].sort((a, b) => {
      const av = a[sortKey] ?? '';
      const bv = b[sortKey] ?? '';
      const cmp = String(av).localeCompare(String(bv));
      return sortAsc ? cmp : -cmp;
    });
  }, [cards, sortKey, sortAsc]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortAsc(!sortAsc);
    else { setSortKey(key); setSortAsc(true); }
  };

  const Th = ({ k, label }: { k: SortKey; label: string }) => (
    <th
      onClick={() => toggleSort(k)}
      className="px-2 py-1.5 text-left font-mono text-[9px] uppercase tracking-wider text-muted-foreground cursor-pointer hover:text-foreground select-none whitespace-nowrap"
    >
      <span className="flex items-center gap-1">
        {label}
        <ArrowUpDown className="w-2.5 h-2.5" />
      </span>
    </th>
  );

  if (cards.length === 0) {
    return <p className="font-mono text-xs text-muted-foreground p-4">No states match criteria.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-[11px] font-sans">
        <thead className="border-b border-border">
          <tr>
            <th className="w-4 px-2 py-1.5"></th>
            <Th k="stateCode" label="Code" />
            <Th k="stateName" label="State" />
            <Th k="lane" label="Lane" />
            <Th k="operativePosture" label="Posture" />
            <Th k="swimlane" label="Track" />
            <Th k="stageColumn" label="Stage" />
            <Th k="confidence" label="Conf" />
            <Th k="runMode" label="Mode" />
            <th className="px-2 py-1.5 text-left font-mono text-[9px] uppercase tracking-wider text-muted-foreground">Closure</th>
            <th className="px-2 py-1.5 text-left font-mono text-[9px] uppercase tracking-wider text-muted-foreground">Blockers</th>
            <th className="px-2 py-1.5 text-left font-mono text-[9px] uppercase tracking-wider text-muted-foreground">Critical</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map(card => {
            const warnings = getWarnings(card);
            const openBlockers = getOpenBlockerSummary(card);
            const blocked = hasActivationBlockers(card);
            const critCount = card.criticalUnresolvedFields.filter(f => f.activationBlocking).length;

            return (
              <tr
                key={card.id}
                onClick={() => onCardClick(card)}
                className={`border-b border-border hover:bg-accent cursor-pointer ${card.swimlane === 'terminal' ? 'opacity-70' : ''}`}
              >
                <td className="px-2 py-1.5">
                  {warnings.length > 0 && <AlertTriangle className="w-3 h-3 text-warning" />}
                </td>
                <td className={`px-2 py-1.5 font-mono font-bold ${card.lane === 'A' ? 'text-lane-a' : 'text-lane-b'}`}>
                  {card.stateCode}
                </td>
                <td className="px-2 py-1.5">{card.stateName}</td>
                <td className={`px-2 py-1.5 font-mono ${card.lane === 'A' ? 'text-lane-a' : 'text-lane-b'}`}>{card.lane}</td>
                <td className="px-2 py-1.5">
                  <span className={`font-mono text-[10px] ${getPostureColorClass(card.operativePosture)}`}>
                    {getPostureLabel(card.operativePosture)}
                  </span>
                </td>
                <td className="px-2 py-1.5 font-mono text-[10px] text-muted-foreground">{card.swimlane}</td>
                <td className="px-2 py-1.5 font-mono text-[10px]">{card.stageColumn}</td>
                <td className="px-2 py-1.5">
                  <span className={`font-mono ${card.confidence === 'High' ? 'text-confidence-high' : card.confidence === 'Medium' ? 'text-confidence-medium' : 'text-confidence-low'}`}>
                    {card.confidence}
                  </span>
                </td>
                <td className="px-2 py-1.5 font-mono text-[10px] text-muted-foreground">{card.runMode}</td>
                <td className="px-2 py-1.5">
                  <div className="flex gap-1">
                    <span className={`text-[9px] font-mono flex items-center gap-0.5 ${card.policyClosure ? 'text-posture-policy' : 'text-muted-foreground/40'}`}>
                      <Shield className="w-2.5 h-2.5" /> POL
                    </span>
                    <span className={`text-[9px] font-mono flex items-center gap-0.5 ${card.runtimeClosure ? 'text-posture-runtime' : 'text-muted-foreground/40'}`}>
                      <ShieldCheck className="w-2.5 h-2.5" /> RUN
                    </span>
                  </div>
                </td>
                <td className="px-2 py-1.5">
                  <div className="flex flex-wrap gap-0.5">
                    {openBlockers.map(b => {
                      const isRisk = b.startsWith('B1') || b.startsWith('B4');
                      return (
                        <span key={b} className={`text-[8px] font-mono px-0.5 py-0 ${isRisk ? 'text-critical' : 'text-muted-foreground'}`}>
                          {b}
                        </span>
                      );
                    })}
                  </div>
                </td>
                <td className="px-2 py-1.5">
                  {critCount > 0 && (
                    <span className="text-[9px] font-mono text-critical">
                      {critCount} blocking
                    </span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
