export type Lane = 'A' | 'B';

export type StateClass = 'standard likely' | 'model-risk' | 'special-case' | 'likely NO-GO' | 'activation candidate';

export type Confidence = 'Low' | 'Medium' | 'High';

export type RunMode =
  | 'preflight' | 'scaffold' | 'evidence-refresh' | 'continuation'
  | 'traceability-closure' | 'policy-closure' | 'runtime-closure'
  | 'governance' | 'controlled-enable' | 'reconciliation';

export type BlockerStatus = 'open' | 'partial' | 'closed' | 'monitoring' | 'superseded';

export type ActivationStatus =
  | 'scaffolded' | 'evidence-backed' | 'traceability-closed' | 'policy-closed'
  | 'runtime-closed' | 'GO' | 'enabled' | 'NO-GO';

export type WorkflowStatus = 'not started' | 'in progress' | 'packaged' | 'finalized';

export const COLUMNS = [
  'Blocked',
  'Preflighted',
  'Evidence in progress',
  'Traceability closed',
  'Runtime closure in progress',
  'GO not enabled',
  'Enabled',
  'Reconciled',
  'NO-GO finalized',
] as const;

export type ColumnId = typeof COLUMNS[number];

export interface Blockers {
  B1: BlockerStatus;
  B2: BlockerStatus;
  B3: BlockerStatus;
  B4: BlockerStatus;
  B5: BlockerStatus;
}

export interface TransitionLogEntry {
  from: ColumnId;
  to: ColumnId;
  reason: string;
  timestamp: string;
}

export interface StateCard {
  id: string;
  stateCode: string;
  stateName: string;
  lane: Lane;
  stateClass: StateClass;
  confidence: Confidence;
  runMode: RunMode;
  blockers: Blockers;
  activationStatus: ActivationStatus;
  workflowStatus: WorkflowStatus;
  failClosedPreserved: boolean;
  constantsActivated: boolean;
  statusFilePath: string;
  finalReadoutPath: string;
  latestCommit: string;
  notes: string;
  column: ColumnId;
  transitionLog: TransitionLogEntry[];
}
