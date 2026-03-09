import { useState, useCallback, useEffect } from 'react';
import { StateCard, ColumnId } from '@/types/audit';
import { seedStates } from '@/data/seedData';

const STORAGE_KEY = 'medicaid-audit-board';

function loadFromStorage(): StateCard[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch { /* ignore */ }
  return seedStates;
}

function saveToStorage(cards: StateCard[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cards));
}

export function useAuditStore() {
  const [cards, setCards] = useState<StateCard[]>(loadFromStorage);

  useEffect(() => {
    saveToStorage(cards);
  }, [cards]);

  const moveCard = useCallback((cardId: string, toColumn: ColumnId, reason: string) => {
    setCards(prev => prev.map(c => {
      if (c.id !== cardId) return c;
      const entry = {
        from: c.column,
        to: toColumn,
        reason,
        timestamp: new Date().toISOString(),
      };
      return { ...c, column: toColumn, transitionLog: [...c.transitionLog, entry] };
    }));
  }, []);

  const updateCard = useCallback((cardId: string, updates: Partial<StateCard>) => {
    setCards(prev => prev.map(c => c.id === cardId ? { ...c, ...updates } : c));
  }, []);

  const addCard = useCallback((card: StateCard) => {
    setCards(prev => [...prev, card]);
  }, []);

  const resetBoard = useCallback(() => {
    setCards(seedStates);
  }, []);

  const getCardsByColumn = useCallback((column: ColumnId) => {
    return cards.filter(c => c.column === column);
  }, [cards]);

  return { cards, moveCard, updateCard, addCard, resetBoard, getCardsByColumn };
}

export function canMoveToColumn(card: StateCard, target: ColumnId): { allowed: boolean; reason?: string } {
  if (target === 'GO not enabled') {
    const { B1, B2, B3, B4 } = card.blockers;
    if (B1 !== 'closed' || B2 !== 'closed' || B3 !== 'closed' || B4 !== 'closed') {
      return { allowed: false, reason: 'B1-B4 must all be closed to move to GO not enabled.' };
    }
  }
  if (target === 'Enabled') {
    if (card.column !== 'GO not enabled') {
      return { allowed: false, reason: 'Card must be in "GO not enabled" to move to Enabled.' };
    }
  }
  return { allowed: true };
}

export function getWarnings(card: StateCard): string[] {
  const warnings: string[] = [];
  if (card.constantsActivated && !card.failClosedPreserved) {
    warnings.push('constantsActivated=true but failClosedPreserved=false');
  }
  if (card.lane === 'B') {
    const { B1, B2, B3, B4 } = card.blockers;
    if (B1 !== 'closed' || B2 !== 'closed' || B3 !== 'closed' || B4 !== 'closed') {
      warnings.push('Lane B with unclosed B1-B4 blockers');
    }
  }
  return warnings;
}

export function getOpenBlockerSummary(card: StateCard): string[] {
  const items: string[] = [];
  (Object.keys(card.blockers) as Array<keyof typeof card.blockers>).forEach(k => {
    if (card.blockers[k] !== 'closed') {
      items.push(`${k}: ${card.blockers[k]}`);
    }
  });
  return items;
}
