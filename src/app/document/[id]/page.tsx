'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Plus, 
  Type, 
  Heading1, 
  Heading2, 
  Heading3, 
  List, 
  ListOrdered, 
  CheckSquare, 
  Quote, 
  Code, 
  Image, 
  Download, 
  Upload, 
  Trash2, 
  GripVertical,
  Save,
  FileText,
  Calendar,
  User
} from 'lucide-react';

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
  createdAt: string;
  updatedAt: string;
  tags: string[];
}

const blockTypes = [
  { type: 'paragraph', label: 'Paragraph', icon: Type },
  { type: 'heading1', label: 'Heading 1', icon: Heading1 },
  { type: 'heading2', label: 'Heading 2', icon: Heading2 },
  { type: 'heading3', label: 'Heading 3', icon: Heading3 },
  { type: 'bulletList', label: 'Bullet List', icon: List },
  { type: 'numberedList', label: 'Numbered List', icon: ListOrdered },
  { type: 'todoList', label: 'Todo List', icon: CheckSquare },
  { type: 'quote', label: 'Quote', icon: Quote },
  { type: 'code', label: 'Code', icon: Code },
  { type: 'image', label: 'Image', icon: Image },
];

export default function DocumentPage() {
  const params = useParams();
  const router = useRouter();
  const documentId = params.id as string;
  
  const [document, setDocument] = useState<Document | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [newTag, setNewTag] = useState('');

  useEffect(() => {
    loadDocument();
  }, [documentId]);

  const loadDocument = () => {
    try {
      const savedDocuments = localStorage.getItem('notion-documents');
      const documents = savedDocuments ? JSON.parse(savedDocuments) : {};
      
      if (documents[documentId]) {
        setDocument(documents[documentId]);
      } else {
        // Create new document
        const newDoc: Document = {
          id: documentId,
          title: 'Untitled Document',
          blocks: [{
            id: generateId(),
            type: 'paragraph',
            content: ''
          }],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          tags: []
        };
        setDocument(newDoc);
        saveDocument(newDoc);
      }
    } catch (error) {
      console.error('Error loading document:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveDocument = useCallback(async (doc: Document) => {
    setIsSaving(true);
    try {
      const savedDocuments = localStorage.getItem('notion-documents');
      const documents = savedDocuments ? JSON.parse(savedDocuments) : {};
      
      const updatedDoc = {
        ...doc,
        updatedAt: new Date().toISOString()
      };
      
      documents[doc.id] = updatedDoc;
      localStorage.setItem('notion-documents', JSON.stringify(documents));
      setDocument(updatedDoc);
      
      // Auto-save delay
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      console.error('Error saving document:', error);
    } finally {
      setIsSaving(false);
    }
  }, []);

  const generateId = () => Math.random().toString(36).substr(2, 9);

  const updateTitle = (title: string) => {
    if (!document) return;
    const updatedDoc = { ...document, title };
    saveDocument(updatedDoc);
  };

  const addBlock = (afterIndex: number, type: Block['type'] = 'paragraph') => {
    if (!document) return;
    
    const newBlock: Block = {
      id: generateId(),
      type,
      content: '',
      ...(type === 'todoList' && { completed: false }),
      ...(type === 'image' && { imageUrl: 'https://placehold.co/600x300/e2e8f0/64748b?text=Click+to+add+image' })
    };
    
    const newBlocks = [...document.blocks];
    newBlocks.splice(afterIndex + 1, 0, newBlock);
    
    const updatedDoc = { ...document, blocks: newBlocks };
    saveDocument(updatedDoc);
  };

  const updateBlock = (blockId: string, updates: Partial<Block>) => {
    if (!document) return;
    
    const updatedBlocks = document.blocks.map(block =>
      block.id === blockId ? { ...block, ...updates } : block
    );
    
    const updatedDoc = { ...document, blocks: updatedBlocks };
    saveDocument(updatedDoc);
  };

  const deleteBlock = (blockId: string) => {
    if (!document || document.blocks.length <= 1) return;
    
    const updatedBlocks = document.blocks.filter(block => block.id !== blockId);
    const updatedDoc = { ...document, blocks: updatedBlocks };
    saveDocument(updatedDoc);
  };

  const moveBlock = (fromIndex: number, toIndex: number) => {
    if (!document) return;
    
    const newBlocks = [...document.blocks];
    const [movedBlock] = newBlocks.splice(fromIndex, 1);
    newBlocks.splice(toIndex, 0, movedBlock);
    
    const updatedDoc = { ...document, blocks: newBlocks };
    saveDocument(updatedDoc);
  };

  const addTag = () => {
    if (!document || !newTag.trim()) return;
    
    const updatedTags = [...document.tags, newTag.trim()];
    const updatedDoc = { ...document, tags: updatedTags };
    saveDocument(updatedDoc);
    setNewTag('');
  };

  const removeTag = (tagToRemove: string) => {
    if (!document) return;
    
    const updatedTags = document.tags.filter(tag => tag !== tagToRemove);
    const updatedDoc = { ...document, tags: updatedTags };
    saveDocument(updatedDoc);
  };

  const exportDocument = () => {
    if (!document) return;
    
    const dataStr = JSON.stringify(document, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${document.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const exportAsMarkdown = () => {
    if (!document) return;
    
    let markdown = `# ${document.title}\n\n`;
    
    document.blocks.forEach(block => {
      switch (block.type) {
        case 'heading1':
          markdown += `# ${block.content}\n\n`;
          break;
        case 'heading2':
          markdown += `## ${block.content}\n\n`;
          break;
        case 'heading3':
          markdown += `### ${block.content}\n\n`;
          break;
        case 'bulletList':
          markdown += `- ${block.content}\n`;
          break;
        case 'numberedList':
          markdown += `1. ${block.content}\n`;
          break;
        case 'todoList':
          markdown += `- [${block.completed ? 'x' : ' '}] ${block.content}\n`;
          break;
        case 'quote':
          markdown += `> ${block.content}\n\n`;
          break;
        case 'code':
          markdown += `\`\`\`\n${block.content}\n\`\`\`\n\n`;
          break;
        case 'image':
          markdown += `![Image](${block.imageUrl})\n\n`;
          break;
        default:
          markdown += `${block.content}\n\n`;
      }
    });
    
    const dataBlob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${document.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.md`;
    link.click();
    URL.revokeObjectURL(url);
  };

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
          return <Input {...commonProps} className={`${commonProps.className} text-3xl font-bold`} />;
        case 'heading2':
          return <Input {...commonProps} className={`${commonProps.className} text-2xl font-semibold`} />;
        case 'heading3':
          return <Input {...commonProps} className={`${commonProps.className} text-xl font-medium`} />;
        case 'quote':
          return (
            <div className="border-l-4 border-gray-300 pl-4">
              <Textarea {...commonProps} className={`${commonProps.className} italic text-gray-600`} />
            </div>
          );
        case 'code':
          return (
            <div className="bg-gray-100 rounded-md p-3">
              <Textarea {...commonProps} className={`${commonProps.className} font-mono text-sm bg-transparent`} />
            </div>
          );
        case 'todoList':
          return (
            <div className="flex items-start gap-2">
              <Checkbox
                checked={block.completed || false}
                onCheckedChange={(checked) => updateBlock(block.id, { completed: !!checked })}
                className="mt-1"
              />
              <Input
                {...commonProps}
                className={`${commonProps.className} ${block.completed ? 'line-through text-gray-500' : ''}`}
              />
            </div>
          );
        case 'image':
          return (
            <div className="space-y-2">
              <img
                src={block.imageUrl || 'https://placehold.co/600x300/e2e8f0/64748b?text=Click+to+add+image'}
                alt="Block image"
                className="max-w-full h-auto rounded-md cursor-pointer"
                onClick={() => {
                  const url = prompt('Enter image URL:', block.imageUrl);
                  if (url !== null) {
                    updateBlock(block.id, { imageUrl: url });
                  }
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
          return <Textarea {...commonProps} className={`${commonProps.className} min-h-[24px]`} />;
      }
    };

    return (
      <div key={block.id} className="group relative">
        <div className="flex items-start gap-2">
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 cursor-grab"
              onMouseDown={(e) => {
                // Simple drag implementation placeholder
                e.preventDefault();
              }}
            >
              <GripVertical className="h-3 w-3" />
            </Button>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                  <Plus className="h-3 w-3" />
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Add Block</DialogTitle>
                </DialogHeader>
                <div className="grid grid-cols-2 gap-2">
                  {blockTypes.map(({ type, label, icon: Icon }) => (
                    <Button
                      key={type}
                      variant="outline"
                      className="justify-start gap-2"
                      onClick={() => {
                        addBlock(index, type as Block['type']);
                      }}
                    >
                      <Icon className="h-4 w-4" />
                      {label}
                    </Button>
                  ))}
                </div>
              </DialogContent>
            </Dialog>
            {document?.blocks.length > 1 && (
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
      </div>
    );
  };

  const getPlaceholder = (type: Block['type']) => {
    const placeholders = {
      paragraph: 'Start writing...',
      heading1: 'Heading 1',
      heading2: 'Heading 2',
      heading3: 'Heading 3',
      bulletList: 'List item',
      numberedList: 'List item',
      todoList: 'Todo item',
      quote: 'Quote',
      code: 'Code',
      image: 'Image caption'
    };
    return placeholders[type];
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p>Loading document...</p>
        </div>
      </div>
    );
  }

  if (!document) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <p className="text-red-500">Document not found</p>
          <Button onClick={() => router.push('/')} className="mt-4">
            Go Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b bg-white sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 flex-1">
              <Input
                value={document.title}
                onChange={(e) => updateTitle(e.target.value)}
                className="text-2xl font-bold border-none bg-transparent p-0 focus:ring-0 focus:outline-none"
                placeholder="Untitled Document"
              />
              {isSaving && (
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Save className="h-4 w-4 animate-pulse" />
                  Saving...
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Export Document</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-2">
                    <Button onClick={exportDocument} className="w-full justify-start">
                      <FileText className="h-4 w-4 mr-2" />
                      Export as JSON
                    </Button>
                    <Button onClick={exportAsMarkdown} className="w-full justify-start">
                      <FileText className="h-4 w-4 mr-2" />
                      Export as Markdown
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
          
          {/* Document metadata */}
          <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              Created {new Date(document.createdAt).toLocaleDateString()}
            </div>
            <div className="flex items-center gap-1">
              <User className="h-3 w-3" />
              Last edited {new Date(document.updatedAt).toLocaleDateString()}
            </div>
          </div>
          
          {/* Tags */}
          <div className="flex items-center gap-2 mt-3">
            {document.tags.map(tag => (
              <Badge
                key={tag}
                variant="secondary"
                className="cursor-pointer"
                onClick={() => removeTag(tag)}
              >
                {tag} ×
              </Badge>
            ))}
            <div className="flex items-center gap-2">
              <Input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addTag()}
                placeholder="Add tag..."
                className="h-6 text-xs w-24"
              />
              <Button size="sm" onClick={addTag} disabled={!newTag.trim()}>
                Add
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Editor */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="space-y-4">
          {document.blocks.map((block, index) => renderBlock(block, index))}
        </div>
        
        {/* Add block at end */}
        <div className="mt-8">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="ghost" className="text-gray-400 hover:text-gray-600">
                <Plus className="h-4 w-4 mr-2" />
                Add a block
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Add Block</DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-2">
                {blockTypes.map(({ type, label, icon: Icon }) => (
                  <Button
                    key={type}
                    variant="outline"
                    className="justify-start gap-2"
                    onClick={() => {
                      addBlock(document.blocks.length - 1, type as Block['type']);
                    }}
                  >
                    <Icon className="h-4 w-4" />
                    {label}
                  </Button>
                ))}
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
}