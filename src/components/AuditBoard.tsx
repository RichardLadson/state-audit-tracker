import { useState, useCallback } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { COLUMNS, ColumnId, StateCard } from '@/types/audit';
import { useAuditStore, canMoveToColumn } from '@/hooks/useAuditStore';
import { StateCardComponent } from './StateCardComponent';
import { CardDetailDrawer } from './CardDetailDrawer';
import { TransitionModal } from './TransitionModal';
import { FilterBar, Filters, emptyFilters, applyFilters } from './FilterBar';
import { TableView } from './TableView';
import { LayoutGrid, Table2 } from 'lucide-react';

type ViewMode = 'board' | 'table';

export function AuditBoard() {
  const { cards, moveCard, updateCard } = useAuditStore();
  const [filters, setFilters] = useState<Filters>(emptyFilters);
  const [viewMode, setViewMode] = useState<ViewMode>('board');
  const [selectedCard, setSelectedCard] = useState<StateCard | null>(null);
  const [pendingTransition, setPendingTransition] = useState<{ card: StateCard; targetColumn: ColumnId } | null>(null);

  const filteredCards = applyFilters(cards, filters);

  const handleDragEnd = useCallback((result: DropResult) => {
    if (!result.destination) return;
    const targetColumn = result.destination.droppableId as ColumnId;
    const card = cards.find(c => c.id === result.draggableId);
    if (!card || card.column === targetColumn) return;

    const check = canMoveToColumn(card, targetColumn);
    // Always show transition modal (for reason or for blocked message)
    setPendingTransition({ card, targetColumn });
  }, [cards]);

  const handleTransitionCommit = useCallback((reason: string) => {
    if (!pendingTransition) return;
    moveCard(pendingTransition.card.id, pendingTransition.targetColumn, reason);
    setPendingTransition(null);
  }, [pendingTransition, moveCard]);

  const handleCardClick = useCallback((card: StateCard) => {
    setSelectedCard(card);
  }, []);

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-border shrink-0">
        <h1 className="font-mono text-sm font-bold tracking-wide uppercase">
          Medicaid Audit Kanban
        </h1>
        <div className="flex items-center gap-4">
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
        </div>
      </header>

      {/* Content */}
      {viewMode === 'board' ? (
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="flex-1 overflow-x-auto overflow-y-hidden">
            <div className="flex h-full min-w-max">
              {COLUMNS.map(colId => {
                const colCards = filteredCards.filter(c => c.column === colId);
                return (
                  <div key={colId} className="w-[320px] shrink-0 flex flex-col border-r border-border">
                    <div className="px-3 py-2 border-b border-border flex items-center justify-between">
                      <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                        {colId}
                      </span>
                      <span className="font-mono text-[10px] text-muted-foreground">
                        {colCards.length}
                      </span>
                    </div>
                    <Droppable droppableId={colId}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.droppableProps}
                          className={`flex-1 overflow-y-auto p-2 space-y-2 ${snapshot.isDraggingOver ? 'bg-accent/30' : ''}`}
                        >
                          {colCards.length === 0 && !snapshot.isDraggingOver && (
                            <p className="font-mono text-[10px] text-muted-foreground p-2">No states match criteria.</p>
                          )}
                          {colCards.map((card, index) => (
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
          targetColumn={pendingTransition.targetColumn}
          onCommit={handleTransitionCommit}
          onCancel={() => setPendingTransition(null)}
        />
      )}
    </div>
  );
}
