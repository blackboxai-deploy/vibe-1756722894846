'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Plus, 
  Type, 
  List, 
  CheckSquare, 
  Quote, 
  Code, 
  Image, 
  Heading1, 
  Heading2, 
  Heading3,
  GripVertical,
  Trash2,
  Download,
  Upload,
  Save
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Block {
  id: string;
  type: 'paragraph' | 'heading1' | 'heading2' | 'heading3' | 'bulletList' | 'numberedList' | 'todoList' | 'quote' | 'code' | 'image';
  content: string;
  completed?: boolean;
  imageUrl?: string;
}

interface Document {
  id: string;
  title: string;
  blocks: Block[];
  createdAt: Date;
  updatedAt: Date;
}

interface DocumentEditorProps {
  documentId?: string;
  onSave?: (document: Document) => void;
}

const BLOCK_TYPES = [
  { type: 'paragraph', icon: Type, label: 'Text' },
  { type: 'heading1', icon: Heading1, label: 'Heading 1' },
  { type: 'heading2', icon: Heading2, label: 'Heading 2' },
  { type: 'heading3', icon: Heading3, label: 'Heading 3' },
  { type: 'bulletList', icon: List, label: 'Bullet List' },
  { type: 'numberedList', icon: List, label: 'Numbered List' },
  { type: 'todoList', icon: CheckSquare, label: 'To-do List' },
  { type: 'quote', icon: Quote, label: 'Quote' },
  { type: 'code', icon: Code, label: 'Code' },
  { type: 'image', icon: Image, label: 'Image' },
] as const;

export default function DocumentEditor({ documentId, onSave }: DocumentEditorProps) {
  const [document, setDocument] = useState<Document>({
    id: documentId || `doc_${Date.now()}`,
    title: 'Untitled Document',
    blocks: [{ id: `block_${Date.now()}`, type: 'paragraph', content: '' }],
    createdAt: new Date(),
    updatedAt: new Date()
  });
  
  const [showBlockMenu, setShowBlockMenu] = useState<string | null>(null);
  const [draggedBlock, setDraggedBlock] = useState<string | null>(null);

  // Load document from localStorage
  useEffect(() => {
    if (documentId) {
      const saved = localStorage.getItem(`document_${documentId}`);
      if (saved) {
        const parsedDoc = JSON.parse(saved);
        setDocument({
          ...parsedDoc,
          createdAt: new Date(parsedDoc.createdAt),
          updatedAt: new Date(parsedDoc.updatedAt)
        });
      }
    }
  }, [documentId]);

  // Auto-save document
  useEffect(() => {
    const timer = setTimeout(() => {
      const updatedDoc = { ...document, updatedAt: new Date() };
      localStorage.setItem(`document_${document.id}`, JSON.stringify(updatedDoc));
      onSave?.(updatedDoc);
    }, 1000);

    return () => clearTimeout(timer);
  }, [document, onSave]);

  const updateTitle = useCallback((title: string) => {
    setDocument(prev => ({ ...prev, title }));
  }, []);

  const updateBlock = useCallback((blockId: string, updates: Partial<Block>) => {
    setDocument(prev => ({
      ...prev,
      blocks: prev.blocks.map(block => 
        block.id === blockId ? { ...block, ...updates } : block
      )
    }));
  }, []);

  const addBlock = useCallback((afterBlockId: string, type: Block['type'] = 'paragraph') => {
    const newBlock: Block = {
      id: `block_${Date.now()}`,
      type,
      content: '',
      ...(type === 'todoList' && { completed: false }),
      ...(type === 'image' && { imageUrl: 'https://placehold.co/600x300/e2e8f0/64748b?text=Click+to+add+image' })
    };

    setDocument(prev => {
      const index = prev.blocks.findIndex(b => b.id === afterBlockId);
      const newBlocks = [...prev.blocks];
      newBlocks.splice(index + 1, 0, newBlock);
      return { ...prev, blocks: newBlocks };
    });
    
    setShowBlockMenu(null);
  }, []);

  const deleteBlock = useCallback((blockId: string) => {
    setDocument(prev => ({
      ...prev,
      blocks: prev.blocks.filter(block => block.id !== blockId)
    }));
  }, []);

  const moveBlock = useCallback((fromIndex: number, toIndex: number) => {
    setDocument(prev => {
      const newBlocks = [...prev.blocks];
      const [movedBlock] = newBlocks.splice(fromIndex, 1);
      newBlocks.splice(toIndex, 0, movedBlock);
      return { ...prev, blocks: newBlocks };
    });
  }, []);

  const exportDocument = useCallback(() => {
    const dataStr = JSON.stringify(document, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${document.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }, [document]);

  const importDocument = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const imported = JSON.parse(e.target?.result as string);
          setDocument({
            ...imported,
            id: `doc_${Date.now()}`,
            createdAt: new Date(imported.createdAt),
            updatedAt: new Date()
          });
        } catch (error) {
          console.error('Failed to import document:', error);
        }
      };
      reader.readAsText(file);
    }
  }, []);

  const renderBlock = (block: Block, index: number) => {
    const commonProps = {
      value: block.content,
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => 
        updateBlock(block.id, { content: e.target.value }),
      className: "border-none bg-transparent resize-none focus:outline-none focus:ring-0 p-0",
      placeholder: getPlaceholder(block.type)
    };

    const blockContent = () => {
      switch (block.type) {
        case 'heading1':
          return <Input {...commonProps} className={cn(commonProps.className, "text-3xl font-bold")} />;
        case 'heading2':
          return <Input {...commonProps} className={cn(commonProps.className, "text-2xl font-semibold")} />;
        case 'heading3':
          return <Input {...commonProps} className={cn(commonProps.className, "text-xl font-medium")} />;
        case 'quote':
          return (
            <div className="border-l-4 border-gray-300 pl-4">
              <Textarea {...commonProps} className={cn(commonProps.className, "italic text-gray-600")} />
            </div>
          );
        case 'code':
          return (
            <div className="bg-gray-100 rounded-md p-3">
              <Textarea {...commonProps} className={cn(commonProps.className, "font-mono text-sm")} />
            </div>
          );
        case 'todoList':
          return (
            <div className="flex items-start gap-2">
              <input
                type="checkbox"
                checked={block.completed || false}
                onChange={(e) => updateBlock(block.id, { completed: e.target.checked })}
                className="mt-1"
              />
              <Input 
                {...commonProps} 
                className={cn(commonProps.className, block.completed && "line-through text-gray-500")} 
              />
            </div>
          );
        case 'bulletList':
          return (
            <div className="flex items-start gap-2">
              <span className="mt-1">•</span>
              <Input {...commonProps} />
            </div>
          );
        case 'numberedList':
          return (
            <div className="flex items-start gap-2">
              <span className="mt-1">{index + 1}.</span>
              <Input {...commonProps} />
            </div>
          );
        case 'image':
          return (
            <div className="space-y-2">
              <img 
                src={block.imageUrl} 
                alt="Block image" 
                className="max-w-full h-auto rounded-md cursor-pointer"
                onClick={() => {
                  const url = prompt('Enter image URL:', block.imageUrl);
                  if (url) updateBlock(block.id, { imageUrl: url });
                }}
              />
              <Input
                {...commonProps}
                placeholder="Add a caption..."
                className="text-sm text-gray-500"
              />
            </div>
          );
        default:
          return <Textarea {...commonProps} className="min-h-[24px]" />;
      }
    };

    return (
      <div
        key={block.id}
        className={cn(
          "group relative py-1",
          draggedBlock === block.id && "opacity-50"
        )}
        draggable
        onDragStart={() => setDraggedBlock(block.id)}
        onDragEnd={() => setDraggedBlock(null)}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          if (draggedBlock && draggedBlock !== block.id) {
            const fromIndex = document.blocks.findIndex(b => b.id === draggedBlock);
            const toIndex = document.blocks.findIndex(b => b.id === block.id);
            moveBlock(fromIndex, toIndex);
          }
        }}
      >
        <div className="flex items-start gap-2">
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 cursor-grab"
            >
              <GripVertical className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={() => setShowBlockMenu(showBlockMenu === block.id ? null : block.id)}
            >
              <Plus className="h-3 w-3" />
            </Button>
            {document.blocks.length > 1 && (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                onClick={() => deleteBlock(block.id)}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            )}
          </div>
          <div className="flex-1">
            {blockContent()}
          </div>
        </div>

        {showBlockMenu === block.id && (
          <Card className="absolute left-8 top-8 z-10 p-2 shadow-lg">
            <div className="grid grid-cols-2 gap-1">
              {BLOCK_TYPES.map(({ type, icon: Icon, label }) => (
                <Button
                  key={type}
                  variant="ghost"
                  size="sm"
                  className="justify-start gap-2 h-8"
                  onClick={() => addBlock(block.id, type as Block['type'])}
                >
                  <Icon className="h-4 w-4" />
                  <span className="text-xs">{label}</span>
                </Button>
              ))}
            </div>
          </Card>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <Input
          value={document.title}
          onChange={(e) => updateTitle(e.target.value)}
          className="text-2xl font-bold border-none bg-transparent p-0 focus:ring-0"
          placeholder="Untitled Document"
        />
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-xs">
            {document.blocks.length} blocks
          </Badge>
          <input
            type="file"
            accept=".json"
            onChange={importDocument}
            className="hidden"
            id="import-file"
          />
          <Button
            variant="outline"
            size="sm"
            onClick={() => document.getElementById('import-file')?.click()}
          >
            <Upload className="h-4 w-4 mr-2" />
            Import
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={exportDocument}
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const updatedDoc = { ...document, updatedAt: new Date() };
              localStorage.setItem(`document_${document.id}`, JSON.stringify(updatedDoc));
              onSave?.(updatedDoc);
            }}
          >
            <Save className="h-4 w-4 mr-2" />
            Save
          </Button>
        </div>
      </div>

      <Separator className="mb-6" />

      {/* Editor */}
      <ScrollArea className="h-[calc(100vh-200px)]">
        <div className="space-y-2">
          {document.blocks.map((block, index) => renderBlock(block, index))}
        </div>
      </ScrollArea>

      {/* Add block at end */}
      <div className="mt-4">
        <Button
          variant="ghost"
          className="w-full justify-start text-gray-500 hover:text-gray-700"
          onClick={() => addBlock(document.blocks[document.blocks.length - 1].id)}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add a block
        </Button>
      </div>
    </div>
  );
}

function getPlaceholder(type: Block['type']): string {
  switch (type) {
    case 'heading1': return 'Heading 1';
    case 'heading2': return 'Heading 2';
    case 'heading3': return 'Heading 3';
    case 'bulletList': return 'List item';
    case 'numberedList': return 'List item';
    case 'todoList': return 'To-do item';
    case 'quote': return 'Quote';
    case 'code': return 'Code';
    case 'image': return 'Image caption';
    default: return 'Type something...';
  }
}