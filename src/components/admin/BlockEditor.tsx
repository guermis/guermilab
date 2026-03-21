import { useState, useCallback } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { GripVertical, Plus, Trash2, Type, ImageIcon, MessageSquareQuote, Video } from 'lucide-react';

interface Block {
  id: string;
  type: 'text' | 'image' | 'video' | 'quote';
  order: number;
  heading?: string;
  body?: string;
  src?: string;
  caption?: string;
  quote?: string;
  author?: string;
}

interface BlockEditorProps {
  blocks: Block[];
  onChange: (blocks: Block[]) => void;
}

const BLOCK_TYPES = [
  { type: 'text' as const, icon: Type, label: 'Texto' },
  { type: 'image' as const, icon: ImageIcon, label: 'Imagem' },
  { type: 'video' as const, icon: Video, label: 'Vídeo' },
  { type: 'quote' as const, icon: MessageSquareQuote, label: 'Citação' },
];

function BlockForm({ block, onChange }: { block: Block; onChange: (b: Block) => void }) {
  switch (block.type) {
    case 'text':
      return (
        <div className="space-y-2">
          <input
            type="text"
            placeholder="Título do bloco"
            value={block.heading || ''}
            onChange={(e) => onChange({ ...block, heading: e.target.value })}
            className="w-full rounded-sm border border-border bg-secondary px-3 py-2 text-sm text-foreground font-display placeholder:text-muted-foreground"
          />
          <textarea
            placeholder="Conteúdo do bloco..."
            value={block.body || ''}
            onChange={(e) => onChange({ ...block, body: e.target.value })}
            rows={3}
            className="w-full rounded-sm border border-border bg-secondary px-3 py-2 text-sm text-foreground font-body placeholder:text-muted-foreground resize-y"
          />
        </div>
      );
    case 'image':
      return (
        <div className="space-y-2">
          <input
            type="text"
            placeholder="URL da imagem"
            value={block.src || ''}
            onChange={(e) => onChange({ ...block, src: e.target.value })}
            className="w-full rounded-sm border border-border bg-secondary px-3 py-2 text-sm text-foreground font-body placeholder:text-muted-foreground"
          />
          <input
            type="text"
            placeholder="Legenda (opcional)"
            value={block.caption || ''}
            onChange={(e) => onChange({ ...block, caption: e.target.value })}
            className="w-full rounded-sm border border-border bg-secondary px-3 py-2 text-sm text-foreground font-body placeholder:text-muted-foreground"
          />
          {block.src && (
            <img src={block.src} alt="" className="w-full h-32 object-cover rounded-sm border border-border" />
          )}
        </div>
      );
    case 'video':
      return (
        <div className="space-y-2">
          <input
            type="text"
            placeholder="URL do vídeo"
            value={block.src || ''}
            onChange={(e) => onChange({ ...block, src: e.target.value })}
            className="w-full rounded-sm border border-border bg-secondary px-3 py-2 text-sm text-foreground font-body placeholder:text-muted-foreground"
          />
          <input
            type="text"
            placeholder="Legenda (opcional)"
            value={block.caption || ''}
            onChange={(e) => onChange({ ...block, caption: e.target.value })}
            className="w-full rounded-sm border border-border bg-secondary px-3 py-2 text-sm text-foreground font-body placeholder:text-muted-foreground"
          />
        </div>
      );
    case 'quote':
      return (
        <div className="space-y-2">
          <textarea
            placeholder="Texto da citação..."
            value={block.quote || ''}
            onChange={(e) => onChange({ ...block, quote: e.target.value })}
            rows={2}
            className="w-full rounded-sm border border-border bg-secondary px-3 py-2 text-sm text-foreground font-display italic placeholder:text-muted-foreground resize-y"
          />
          <input
            type="text"
            placeholder="Autor"
            value={block.author || ''}
            onChange={(e) => onChange({ ...block, author: e.target.value })}
            className="w-full rounded-sm border border-border bg-secondary px-3 py-2 text-sm text-foreground font-body placeholder:text-muted-foreground"
          />
        </div>
      );
  }
}

export function BlockEditor({ blocks, onChange }: BlockEditorProps) {
  const [showAddMenu, setShowAddMenu] = useState(false);

  const onDragEnd = useCallback((result: DropResult) => {
    if (!result.destination) return;
    const items = Array.from(blocks);
    const [moved] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, moved);
    onChange(items.map((b, i) => ({ ...b, order: i })));
  }, [blocks, onChange]);

  const addBlock = (type: Block['type']) => {
    const newBlock: Block = {
      id: `temp-${Date.now()}`,
      type,
      order: blocks.length,
    };
    onChange([...blocks, newBlock]);
    setShowAddMenu(false);
  };

  const updateBlock = (index: number, updated: Block) => {
    const items = [...blocks];
    items[index] = updated;
    onChange(items);
  };

  const removeBlock = (index: number) => {
    onChange(blocks.filter((_, i) => i !== index).map((b, i) => ({ ...b, order: i })));
  };

  const getTypeIcon = (type: string) => {
    const found = BLOCK_TYPES.find(bt => bt.type === type);
    return found ? found.icon : Type;
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-[11px] tracking-[0.15em] uppercase text-muted-foreground font-body">
          Blocos de conteúdo ({blocks.length})
        </span>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="blocks">
          {(provided) => (
            <div ref={provided.innerRef} {...provided.droppableProps} className="space-y-2">
              {blocks.map((block, index) => {
                const Icon = getTypeIcon(block.type);
                return (
                  <Draggable key={block.id} draggableId={block.id} index={index}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className={`rounded-sm border bg-card p-3 ${snapshot.isDragging ? 'border-primary/50 shadow-lg' : 'border-border'}`}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <div {...provided.dragHandleProps} className="cursor-grab active:cursor-grabbing">
                            <GripVertical className="h-4 w-4 text-muted-foreground" />
                          </div>
                          <Icon className="h-3.5 w-3.5 text-primary" />
                          <span className="text-[10px] tracking-[0.15em] uppercase text-muted-foreground font-body flex-1">
                            {block.type}
                          </span>
                          <button onClick={() => removeBlock(index)} className="p-1 hover:bg-secondary rounded-sm transition-colors">
                            <Trash2 className="h-3.5 w-3.5 text-destructive" />
                          </button>
                        </div>
                        <BlockForm block={block} onChange={(b) => updateBlock(index, b)} />
                      </div>
                    )}
                  </Draggable>
                );
              })}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      {/* Add block */}
      <div className="relative">
        <button
          onClick={() => setShowAddMenu(!showAddMenu)}
          className="w-full rounded-sm border border-dashed border-border py-3 text-xs tracking-[0.15em] uppercase text-muted-foreground hover:border-primary/40 hover:text-foreground transition-all font-body flex items-center justify-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Adicionar bloco
        </button>
        {showAddMenu && (
          <div className="absolute top-full left-0 right-0 mt-1 rounded-sm border border-border bg-card shadow-lg z-10">
            {BLOCK_TYPES.map(bt => (
              <button
                key={bt.type}
                onClick={() => addBlock(bt.type)}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs text-foreground hover:bg-secondary transition-colors font-body"
              >
                <bt.icon className="h-3.5 w-3.5 text-primary" />
                {bt.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
