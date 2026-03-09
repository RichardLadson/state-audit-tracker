import { StateCard } from '@/types/audit';
import { getWarnings, getOpenBlockerSummary } from '@/hooks/useAuditStore';
import { AlertTriangle, ArrowUpDown } from 'lucide-react';
import { useState, useMemo } from 'react';

interface TableViewProps {
  cards: StateCard[];
  onCardClick: (card: StateCard) => void;
}

type SortKey = 'stateCode' | 'stateName' | 'lane' | 'confidence' | 'column' | 'stateClass' | 'runMode';

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
      className="px-3 py-2 text-left font-mono text-[10px] uppercase tracking-wider text-muted-foreground cursor-pointer hover:text-foreground select-none"
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
      <table className="w-full text-xs font-sans">
        <thead className="border-b border-border">
          <tr>
            <th className="w-4 px-3 py-2"></th>
            <Th k="stateCode" label="Code" />
            <Th k="stateName" label="State" />
            <Th k="lane" label="Lane" />
            <Th k="column" label="Phase" />
            <Th k="stateClass" label="Class" />
            <Th k="confidence" label="Conf" />
            <Th k="runMode" label="Run Mode" />
            <th className="px-3 py-2 text-left font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Blockers</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map(card => {
            const warnings = getWarnings(card);
            const openBlockers = getOpenBlockerSummary(card);
            return (
              <tr
                key={card.id}
                onClick={() => onCardClick(card)}
                className="border-b border-border hover:bg-accent cursor-pointer"
              >
                <td className="px-3 py-2">
                  {warnings.length > 0 && <AlertTriangle className="w-3 h-3 text-warning" />}
                </td>
                <td className={`px-3 py-2 font-mono font-semibold ${card.lane === 'A' ? 'text-lane-a' : 'text-lane-b'}`}>
                  {card.stateCode}
                </td>
                <td className="px-3 py-2">{card.stateName}</td>
                <td className="px-3 py-2 font-mono">{card.lane}</td>
                <td className="px-3 py-2 font-mono text-[10px]">{card.column}</td>
                <td className="px-3 py-2">{card.stateClass}</td>
                <td className="px-3 py-2">
                  <span className={`font-mono ${card.confidence === 'High' ? 'text-confidence-high' : card.confidence === 'Medium' ? 'text-confidence-medium' : 'text-confidence-low'}`}>
                    {card.confidence}
                  </span>
                </td>
                <td className="px-3 py-2 font-mono text-[10px]">{card.runMode}</td>
                <td className="px-3 py-2">
                  <div className="flex flex-wrap gap-1">
                    {openBlockers.map(b => (
                      <span key={b} className={`text-[9px] font-mono px-1 py-0.5 border ${b.startsWith('B1') || b.startsWith('B4') ? 'border-warning text-warning' : 'border-border text-muted-foreground'}`}>
                        {b}
                      </span>
                    ))}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
