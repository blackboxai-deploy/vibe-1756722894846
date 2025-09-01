'use client';

import React, { useRef, KeyboardEvent } from 'react';
import { Block } from '@/types';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';

interface BlockRendererProps {
  block: Block;
  onUpdate: (updates: Partial<Block>) => void;
  onDelete: () => void;
  onEnter: () => void;
  isSelected: boolean;
}

export function BlockRenderer({ 
  block, 
  onUpdate, 
  onDelete, 
  onEnter, 
  isSelected 
}: BlockRendererProps) {

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onEnter();
    }
    
    if (e.key === 'Backspace' && block.content === '' && !e.shiftKey) {
      e.preventDefault();
      onDelete();
    }
  };
  
  const handleContentChange = (content: string) => {
    // Handle markdown shortcuts
    if (content.startsWith('# ') && block.type !== 'heading1') {
      onUpdate({ type: 'heading1', content: content.slice(2) });
      return;
    }
    if (content.startsWith('## ') && block.type !== 'heading2') {
      onUpdate({ type: 'heading2', content: content.slice(3) });
      return;
    }
    if (content.startsWith('### ') && block.type !== 'heading3') {
      onUpdate({ type: 'heading3', content: content.slice(4) });
      return;
    }
    if (content.startsWith('- ') && block.type !== 'bulleted-list') {
      onUpdate({ type: 'bulleted-list', content: content.slice(2) });
      return;
    }
    if (/^\d+\. /.test(content) && block.type !== 'numbered-list') {
      onUpdate({ type: 'numbered-list', content: content.replace(/^\d+\. /, '') });
      return;
    }
    if (content.startsWith('> ') && block.type !== 'quote') {
      onUpdate({ type: 'quote', content: content.slice(2) });
      return;
    }
    if (content.startsWith('```') && block.type !== 'code') {
      onUpdate({ type: 'code', content: content.slice(3) });
      return;
    }
    
    onUpdate({ content });
  };
  
  const getTextareaClassName = () => {
    const baseClasses = "w-full bg-transparent border-0 resize-none focus-visible:ring-0 focus-visible:ring-offset-0 p-0 min-h-[1.5rem]";
    
    switch (block.type) {
      case 'heading1':
        return cn(baseClasses, "text-3xl font-bold");
      case 'heading2':
        return cn(baseClasses, "text-2xl font-semibold");
      case 'heading3':
        return cn(baseClasses, "text-xl font-medium");
      case 'quote':
        return cn(baseClasses, "text-muted-foreground italic border-l-4 border-muted-foreground/30 pl-4");
      case 'code':
        return cn(baseClasses, "font-mono text-sm bg-muted p-3 rounded-md");
      default:
        return cn(baseClasses, "text-base");
    }
  };
  
  const getPlaceholder = () => {
    switch (block.type) {
      case 'heading1':
        return 'Heading 1';
      case 'heading2':
        return 'Heading 2';
      case 'heading3':
        return 'Heading 3';
      case 'bulleted-list':
        return 'List item';
      case 'numbered-list':
        return 'List item';
      case 'todo':
        return 'To-do';
      case 'quote':
        return 'Quote';
      case 'code':
        return 'Code block';
      default:
        return "Type '/' for commands";
    }
  };

  // Todo list item
  if (block.type === 'todo') {
    return (
      <div className={cn(
        "flex items-start space-x-3 py-1",
        isSelected && "ring-2 ring-primary/20 rounded-md"
      )}>
        <div className="mt-0.5">
          <Checkbox
            checked={block.properties?.checked || false}
            onCheckedChange={(checked) => 
              onUpdate({ properties: { ...block.properties, checked: !!checked } })
            }
          />
        </div>
        <Textarea
          ref={textareaRef}
          value={block.content}
          onChange={(e) => handleContentChange(e.target.value)}
          onKeyDown={handleKeyDown}

          placeholder={getPlaceholder()}
          className={cn(
            getTextareaClassName(),
            block.properties?.checked && "line-through text-muted-foreground"
          )}
          rows={1}
        />
      </div>
    );
  }

  // Bulleted list
  if (block.type === 'bulleted-list') {
    return (
      <div className={cn(
        "flex items-start space-x-3 py-1",
        isSelected && "ring-2 ring-primary/20 rounded-md"
      )}>
        <div className="mt-2 w-2 h-2 bg-foreground rounded-full flex-shrink-0" />
        <Textarea
          ref={textareaRef}
          value={block.content}
          onChange={(e) => handleContentChange(e.target.value)}
          onKeyDown={handleKeyDown}

          placeholder={getPlaceholder()}
          className={getTextareaClassName()}
          rows={1}
        />
      </div>
    );
  }

  // Numbered list
  if (block.type === 'numbered-list') {
    return (
      <div className={cn(
        "flex items-start space-x-3 py-1",
        isSelected && "ring-2 ring-primary/20 rounded-md"
      )}>
        <div className="mt-0.5 text-sm text-muted-foreground font-medium">
          1.
        </div>
        <Textarea
          ref={textareaRef}
          value={block.content}
          onChange={(e) => handleContentChange(e.target.value)}
          onKeyDown={handleKeyDown}

          placeholder={getPlaceholder()}
          className={getTextareaClassName()}
          rows={1}
        />
      </div>
    );
  }

  // Image block
  if (block.type === 'image') {
    return (
      <div className={cn(
        "py-2",
        isSelected && "ring-2 ring-primary/20 rounded-md"
      )}>
        {block.content ? (
          <img 
            src={block.content} 
            alt="Block image" 
            className="max-w-full h-auto rounded-md"
          />
        ) : (
          <div className="border-2 border-dashed border-muted-foreground/30 rounded-md p-8 text-center">
            <div className="text-muted-foreground mb-2">📷</div>
            <Textarea
              ref={textareaRef}
              value={block.content}
              onChange={(e) => handleContentChange(e.target.value)}
              onKeyDown={handleKeyDown}

              placeholder="Paste image URL"
              className="text-center border-0 bg-transparent"
              rows={1}
            />
          </div>
        )}
      </div>
    );
  }

  // Default text blocks
  return (
    <div className={cn(
      "py-1",
      isSelected && "ring-2 ring-primary/20 rounded-md",
      block.type === 'quote' && "border-l-4 border-muted-foreground/30 pl-4"
    )}>
      <Textarea
        ref={textareaRef}
        value={block.content}
        onChange={(e) => handleContentChange(e.target.value)}
        onKeyDown={handleKeyDown}

        placeholder={getPlaceholder()}
        className={getTextareaClassName()}
        rows={1}
      />
    </div>
  );
}