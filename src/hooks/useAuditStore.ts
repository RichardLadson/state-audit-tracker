import { useState, useCallback, useEffect } from 'react';
import { StateCard, StageColumnId, Swimlane, OperativePosture } from '@/types/audit';
import { seedStates } from '@/data/seedData';

const STORAGE_KEY = 'medicaid-audit-board-v2';

function loadFromStorage(): StateCard[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].swimlane) return parsed;
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

  const moveCard = useCallback((cardId: string, toSwimlane: Swimlane, toStage: StageColumnId, reason: string) => {
    setCards(prev => prev.map(c => {
      if (c.id !== cardId) return c;
      const entry = {
        from: `${c.swimlane}/${c.stageColumn}`,
        to: `${toSwimlane}/${toStage}`,
        reason,
        timestamp: new Date().toISOString(),
      };
      return { ...c, swimlane: toSwimlane, stageColumn: toStage, transitionLog: [...c.transitionLog, entry] };
    }));
  }, []);

  const updateCard = useCallback((cardId: string, updates: Partial<StateCard>) => {
    setCards(prev => prev.map(c => c.id === cardId ? { ...c, ...updates } : c));
  }, []);

  const addCard = useCallback((card: StateCard) => {
    setCards(prev => [...prev, card]);
  }, []);

  const resetBoard = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setCards(seedStates);
  }, []);

  return { cards, moveCard, updateCard, addCard, resetBoard };
}

export function canMoveToStage(card: StateCard, targetSwimlane: Swimlane, targetStage: StageColumnId): { allowed: boolean; reason?: string; warnings?: string[] } {
  const warnings: string[] = [];

  // Cannot move to full-enable if B1-B4 not closed
  if (targetSwimlane === 'full-enable') {
    const { B1, B2, B3, B4 } = card.blockers;
    if (B1 !== 'closed' || B2 !== 'closed' || B3 !== 'closed' || B4 !== 'closed') {
      return { allowed: false, reason: 'B1-B4 must all be closed to enter full-enable track.' };
    }
    if (!card.policyClosure) {
      return { allowed: false, reason: 'Policy closure required for full-enable track.' };
    }
    if (!card.runtimeClosure) {
      warnings.push('Runtime closure not yet confirmed.');
    }
  }

  // Cannot move to terminal GO-hold without all blockers closed
  if (targetSwimlane === 'terminal' && targetStage === 'Governance') {
    if (card.criticalUnresolvedFields.some(f => f.activationBlocking)) {
      warnings.push('Activation-blocking critical fields remain unresolved.');
    }
  }

  // Warn if B4 is open on any promotion
  if (card.blockers.B4 !== 'closed') {
    warnings.push('B4 is open — promotion styling suppressed.');
  }

  // Warn if fail-closed not preserved
  if (!card.failClosedPreserved) {
    warnings.push('failClosedPreserved is false — caution state.');
  }

  return { allowed: true, warnings: warnings.length > 0 ? warnings : undefined };
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
  if (card.blockers.B4 !== 'closed') {
    warnings.push('B4 open — promotion blocked');
  }
  if (card.criticalUnresolvedFields.some(f => f.activationBlocking)) {
    warnings.push('Activation-critical fields unresolved');
  }
  if (!card.failClosedPreserved && card.swimlane !== 'terminal') {
    warnings.push('Fail-closed posture not preserved');
  }
  return [...new Set(warnings)];
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

export function getPostureLabel(posture: OperativePosture): string {
  const labels: Record<OperativePosture, string> = {
    'reference-only': 'Reference Only',
    'evidence-remediation': 'Evidence Remediation',
    'runtime-pending': 'Runtime Pending',
    'policy-advanced': 'Policy Advanced',
    'controlled-enable': 'Controlled Enable',
    'full-enable-track': 'Full Enable Track',
    'GO-hold': 'GO Hold',
    'NO-GO-finalized': 'NO-GO Finalized',
    'enabled': 'Enabled',
  };
  return labels[posture];
}

export function getPostureColorClass(posture: OperativePosture): string {
  const colors: Record<OperativePosture, string> = {
    'reference-only': 'text-posture-reference',
    'evidence-remediation': 'text-posture-evidence',
    'runtime-pending': 'text-posture-runtime',
    'policy-advanced': 'text-posture-policy',
    'controlled-enable': 'text-posture-controlled',
    'full-enable-track': 'text-posture-enabled',
    'GO-hold': 'text-posture-go-hold',
    'NO-GO-finalized': 'text-posture-nogo',
    'enabled': 'text-posture-enabled',
  };
  return colors[posture];
}

export function getPostureBgClass(posture: OperativePosture): string {
  const colors: Record<OperativePosture, string> = {
    'reference-only': 'bg-posture-reference/15 border-posture-reference/30',
    'evidence-remediation': 'bg-posture-evidence/15 border-posture-evidence/30',
    'runtime-pending': 'bg-posture-runtime/15 border-posture-runtime/30',
    'policy-advanced': 'bg-posture-policy/15 border-posture-policy/30',
    'controlled-enable': 'bg-posture-controlled/15 border-posture-controlled/30',
    'full-enable-track': 'bg-posture-enabled/15 border-posture-enabled/30',
    'GO-hold': 'bg-posture-go-hold/15 border-posture-go-hold/30',
    'NO-GO-finalized': 'bg-posture-nogo/15 border-posture-nogo/30',
    'enabled': 'bg-posture-enabled/15 border-posture-enabled/30',
  };
  return colors[posture];
}

export function hasActivationBlockers(card: StateCard): boolean {
  return card.criticalUnresolvedFields.some(f => f.activationBlocking) || card.blockers.B4 !== 'closed';
}
