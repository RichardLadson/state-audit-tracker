export type Lane = 'A' | 'B';

export type Swimlane = 'lane-a-active' | 'lane-b-active' | 'full-enable' | 'terminal';

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

export type OperativePosture =
  | 'reference-only'
  | 'evidence-remediation'
  | 'runtime-pending'
  | 'policy-advanced'
  | 'controlled-enable'
  | 'full-enable-track'
  | 'GO-hold'
  | 'NO-GO-finalized'
  | 'enabled';

export type TerminalDisposition = 'GO-hold' | 'NO-GO-finalized' | null;

export const STAGE_COLUMNS = [
  'Preflight',
  'Classification',
  'Scaffold / Setup',
  'Evidence Collection',
  'Traceability Closure',
  'Policy Closure',
  'Runtime Closure',
  'Governance',
  'Controlled Enable',
  'Reconciliation',
] as const;

export type StageColumnId = typeof STAGE_COLUMNS[number];

// Keep old columns for migration
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

export interface CriticalUnresolvedField {
  field: string;
  status: 'unresolved' | 'plausible-not-closed' | 'missing' | 'pending';
  note: string;
  activationBlocking: boolean;
}

export interface Blockers {
  B1: BlockerStatus;
  B2: BlockerStatus;
  B3: BlockerStatus;
  B4: BlockerStatus;
  B5: BlockerStatus;
}

export interface TransitionLogEntry {
  from: string;
  to: string;
  reason: string;
  timestamp: string;
}

export interface HistoryEntry {
  date: string;
  event: string;
  detail: string;
}

export interface StateCard {
  id: string;
  stateCode: string;
  stateName: string;
  lane: Lane;
  swimlane: Swimlane;
  stageColumn: StageColumnId;
  operativePosture: OperativePosture;
  terminalDisposition: TerminalDisposition;
  stateClass: StateClass;
  confidence: Confidence;
  runMode: RunMode;
  blockers: Blockers;
  activationStatus: ActivationStatus;
  workflowStatus: WorkflowStatus;
  policyClosure: boolean;
  runtimeClosure: boolean;
  failClosedPreserved: boolean;
  constantsActivated: boolean;
  criticalUnresolvedFields: CriticalUnresolvedField[];
  statusFilePath: string;
  finalReadoutPath: string;
  latestCommit: string;
  notes: string;
  auditNotes: string;
  lessonsLearned: string;
  history: HistoryEntry[];
  column: ColumnId; // legacy
  transitionLog: TransitionLogEntry[];
}
