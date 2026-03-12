import { useState, useCallback, useMemo } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { STAGE_COLUMNS, StageColumnId, Swimlane, StateCard } from '@/types/audit';
import { useAuditStore, canMoveToStage } from '@/hooks/useAuditStore';
import { StateCardComponent } from './StateCardComponent';
import { CardDetailDrawer } from './CardDetailDrawer';
import { TransitionModal } from './TransitionModal';
import { FilterBar, Filters, emptyFilters, applyFilters } from './FilterBar';
import { TableView } from './TableView';
import { LayoutGrid, Table2, RotateCcw, ChevronDown, ChevronRight } from 'lucide-react';

type ViewMode = 'board' | 'table';

interface SwimlaneConfig {
  id: Swimlane;
  label: string;
  description: string;
  bgClass: string;
  headerClass: string;
  stages: readonly StageColumnId[];
}

const ACTIVE_STAGES = STAGE_COLUMNS;

const SWIMLANE_CONFIG: SwimlaneConfig[] = [
  {
    id: 'lane-a-active',
    label: 'Lane A — Active',
    description: 'Reference-package / evidence-remediation / closure work. Not runtime-ready.',
    bgClass: 'bg-swimlane-a/30',
    headerClass: 'bg-swimlane-a border-lane-a/30',
    stages: ACTIVE_STAGES,
  },
  {
    id: 'lane-b-active',
    label: 'Lane B — Active',
    description: 'Controlled usability work. Closure incomplete. Not fully ready.',
    bgClass: 'bg-swimlane-b/30',
    headerClass: 'bg-swimlane-b border-lane-b/30',
    stages: ACTIVE_STAGES,
  },
  {
    id: 'full-enable',
    label: 'Full-Enable Track',
    description: 'Progressing toward client-facing activation. Still shows blocker truth.',
    bgClass: 'bg-swimlane-enable/30',
    headerClass: 'bg-swimlane-enable border-success/30',
    stages: ACTIVE_STAGES,
  },
];

export function AuditBoard() {
  const { cards, moveCard, updateCard, resetBoard } = useAuditStore();
  const [filters, setFilters] = useState<Filters>(emptyFilters);
  const [viewMode, setViewMode] = useState<ViewMode>('board');
  const [selectedCard, setSelectedCard] = useState<StateCard | null>(null);
  const [pendingTransition, setPendingTransition] = useState<{ card: StateCard; targetSwimlane: Swimlane; targetStage: StageColumnId } | null>(null);
  const [collapsedSwimlanes, setCollapsedSwimlanes] = useState<Set<string>>(new Set());

  const filteredCards = applyFilters(cards, filters);

  const terminalCards = useMemo(() => filteredCards.filter(c => c.swimlane === 'terminal'), [filteredCards]);
  const goHoldCards = terminalCards.filter(c => c.terminalDisposition === 'GO-hold');
  const noGoCards = terminalCards.filter(c => c.terminalDisposition === 'NO-GO-finalized');

  const handleDragEnd = useCallback((result: DropResult) => {
    if (!result.destination) return;
    // droppableId format: "swimlane|stage"
    const [targetSwimlane, targetStage] = result.destination.droppableId.split('|') as [Swimlane, StageColumnId];
    const card = cards.find(c => c.id === result.draggableId);
    if (!card) return;
    if (card.swimlane === targetSwimlane && card.stageColumn === targetStage) return;

    setPendingTransition({ card, targetSwimlane, targetStage });
  }, [cards]);

  const handleTransitionCommit = useCallback((reason: string) => {
    if (!pendingTransition) return;
    moveCard(pendingTransition.card.id, pendingTransition.targetSwimlane, pendingTransition.targetStage, reason);
    setPendingTransition(null);
  }, [pendingTransition, moveCard]);

  const handleCardClick = useCallback((card: StateCard) => {
    setSelectedCard(card);
  }, []);

  const toggleSwimlane = (id: string) => {
    setCollapsedSwimlanes(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-2.5 border-b border-border shrink-0">
        <div className="flex items-center gap-3">
          <h1 className="font-mono text-xs font-bold tracking-wider uppercase text-foreground">
            Medicaid Audit Operations
          </h1>
          <span className="text-[9px] font-mono text-muted-foreground border border-border px-1.5 py-0.5">
            {cards.length} states
          </span>
        </div>
        <div className="flex items-center gap-3">
          <FilterBar filters={filters} onChange={setFilters} />
          <div className="flex border border-border">
            <button
              onClick={() => setViewMode('board')}
              className={`px-2 py-1 flex items-center gap-1 font-mono text-[10px] uppercase ${viewMode === 'board' ? 'bg-accent text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
            >
              <LayoutGrid className="w-3 h-3" /> Board
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-2 py-1 flex items-center gap-1 font-mono text-[10px] uppercase border-l border-border ${viewMode === 'table' ? 'bg-accent text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
            >
              <Table2 className="w-3 h-3" /> Table
            </button>
          </div>
          <button
            onClick={resetBoard}
            className="text-muted-foreground hover:text-foreground"
            title="Reset board"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* Content */}
      {viewMode === 'board' ? (
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="flex-1 overflow-y-auto">
            {/* Active Swimlanes */}
            {SWIMLANE_CONFIG.map(swimlane => {
              const swimCards = filteredCards.filter(c => c.swimlane === swimlane.id);
              const isCollapsed = collapsedSwimlanes.has(swimlane.id);

              return (
                <div key={swimlane.id} className="border-b border-border">
                  {/* Swimlane Header */}
                  <button
                    onClick={() => toggleSwimlane(swimlane.id)}
                    className={`w-full flex items-center gap-3 px-4 py-2 border-b border-border ${swimlane.headerClass} text-left`}
                  >
                    {isCollapsed ? <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" /> : <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />}
                    <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-foreground">
                      {swimlane.label}
                    </span>
                    <span className="text-[9px] font-mono text-muted-foreground">
                      {swimlane.description}
                    </span>
                    <span className="ml-auto text-[10px] font-mono text-muted-foreground">
                      {swimCards.length}
                    </span>
                  </button>

                  {/* Stage columns */}
                  {!isCollapsed && (
                    <div className={`overflow-x-auto ${swimlane.bgClass}`}>
                      <div className="flex min-w-max">
                        {swimlane.stages.map(stage => {
                          const stageCards = swimCards.filter(c => c.stageColumn === stage);
                          const droppableId = `${swimlane.id}|${stage}`;

                          return (
                            <div key={stage} className="w-[240px] shrink-0 border-r border-border/50">
                              <div className="px-2 py-1.5 border-b border-border/50">
                                <span className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground">
                                  {stage}
                                </span>
                                {stageCards.length > 0 && (
                                  <span className="ml-1 text-[9px] font-mono text-muted-foreground/60">
                                    {stageCards.length}
                                  </span>
                                )}
                              </div>
                              <Droppable droppableId={droppableId}>
                                {(provided, snapshot) => (
                                  <div
                                    ref={provided.innerRef}
                                    {...provided.droppableProps}
                                    className={`min-h-[100px] p-1.5 space-y-1.5 ${snapshot.isDraggingOver ? 'bg-accent/40' : ''}`}
                                  >
                                    {stageCards.map((card, index) => (
                                      <Draggable key={card.id} draggableId={card.id} index={index}>
                                        {(provided, snapshot) => (
                                          <div
                                            ref={provided.innerRef}
                                            {...provided.draggableProps}
                                            {...provided.dragHandleProps}
                                          >
                                            <StateCardComponent
                                              card={card}
                                              onClick={handleCardClick}
                                              isDragging={snapshot.isDragging}
                                            />
                                          </div>
                                        )}
                                      </Draggable>
                                    ))}
                                    {provided.placeholder}
                                  </div>
                                )}
                              </Droppable>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {/* Terminal States Section */}
            <div className="border-b border-terminal-border">
              <button
                onClick={() => toggleSwimlane('terminal')}
                className="w-full flex items-center gap-3 px-4 py-2 border-b border-terminal-border bg-swimlane-terminal text-left"
              >
                {collapsedSwimlanes.has('terminal') ? <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" /> : <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />}
                <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-foreground">
                  Terminal States
                </span>
                <span className="text-[9px] font-mono text-muted-foreground">
                  Final disposition — not active work
                </span>
                <span className="ml-auto text-[10px] font-mono text-muted-foreground">
                  {terminalCards.length}
                </span>
              </button>

              {!collapsedSwimlanes.has('terminal') && (
                <div className="bg-terminal-bg p-4">
                  <div className="grid grid-cols-2 gap-6">
                    {/* GO Hold */}
                    <div>
                      <div className="flex items-center gap-2 mb-2 pb-1.5 border-b border-posture-go-hold/20">
                        <span className="font-mono text-[10px] uppercase tracking-wider text-posture-go-hold font-bold">
                          GO Hold
                        </span>
                        <span className="text-[9px] font-mono text-muted-foreground">
                          Approved, not fully enabled client-facing
                        </span>
                        <span className="ml-auto text-[9px] font-mono text-muted-foreground">{goHoldCards.length}</span>
                      </div>
                      <div className="space-y-1.5">
                        {goHoldCards.map(card => (
                          <StateCardComponent key={card.id} card={card} onClick={handleCardClick} compact />
                        ))}
                        {goHoldCards.length === 0 && (
                          <p className="text-[10px] font-mono text-muted-foreground/50 py-2">No states in GO hold.</p>
                        )}
                      </div>
                    </div>

                    {/* NO-GO Finalized */}
                    <div>
                      <div className="flex items-center gap-2 mb-2 pb-1.5 border-b border-posture-nogo/20">
                        <span className="font-mono text-[10px] uppercase tracking-wider text-posture-nogo font-bold">
                          NO-GO Finalized
                        </span>
                        <span className="text-[9px] font-mono text-muted-foreground">
                          Final disposition
                        </span>
                        <span className="ml-auto text-[9px] font-mono text-muted-foreground">{noGoCards.length}</span>
                      </div>
                      <div className="space-y-1.5">
                        {noGoCards.map(card => (
                          <StateCardComponent key={card.id} card={card} onClick={handleCardClick} compact />
                        ))}
                        {noGoCards.length === 0 && (
                          <p className="text-[10px] font-mono text-muted-foreground/50 py-2">No states finalized NO-GO.</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </DragDropContext>
      ) : (
        <div className="flex-1 overflow-auto p-4">
          <TableView cards={filteredCards} onCardClick={handleCardClick} />
        </div>
      )}

      {/* Detail Drawer */}
      {selectedCard && (
        <CardDetailDrawer
          card={selectedCard}
          onClose={() => setSelectedCard(null)}
          onUpdate={(id, updates) => {
            updateCard(id, updates);
            setSelectedCard(null);
          }}
        />
      )}

      {/* Transition Modal */}
      {pendingTransition && (
        <TransitionModal
          card={pendingTransition.card}
          targetSwimlane={pendingTransition.targetSwimlane}
          targetStage={pendingTransition.targetStage}
          onCommit={handleTransitionCommit}
          onCancel={() => setPendingTransition(null)}
        />
      )}
    </div>
  );
}
