'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Block } from '@/types';
import { BLOCK_TYPES } from '@/lib/utils';

interface AddBlockButtonProps {
  onAddBlock: (type: Block['type']) => void;
  size?: 'sm' | 'default';
  placeholder?: string;
}

export function AddBlockButton({ 
  onAddBlock, 
  size = 'default', 
  placeholder = 'Click to add a block' 
}: AddBlockButtonProps) {
  const [open, setOpen] = useState(false);
  
  const handleBlockSelect = (type: Block['type']) => {
    onAddBlock(type);
    setOpen(false);
  };
  
  if (size === 'sm') {
    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
          >
            +
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64 p-2" side="right">
          <BlockTypeGrid onSelect={handleBlockSelect} />
        </PopoverContent>
      </Popover>
    );
  }
  
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          className="w-full justify-start text-muted-foreground hover:text-foreground min-h-[2rem] py-2"
        >
          <span className="mr-2">+</span>
          {placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0">
        <div className="p-4">
          <h4 className="font-medium mb-3">Add a block</h4>
          <BlockTypeGrid onSelect={handleBlockSelect} />
        </div>
      </PopoverContent>
    </Popover>
  );
}

interface BlockTypeGridProps {
  onSelect: (type: Block['type']) => void;
}

function BlockTypeGrid({ onSelect }: BlockTypeGridProps) {
  const blockTypes = Object.entries(BLOCK_TYPES) as Array<[Block['type'], typeof BLOCK_TYPES[keyof typeof BLOCK_TYPES]]>;
  
  const getBlockIcon = (type: Block['type']) => {
    switch (type) {
      case 'paragraph': return '📝';
      case 'heading1': return '📑';
      case 'heading2': return '📄';
      case 'heading3': return '📃';
      case 'bulleted-list': return '•';
      case 'numbered-list': return '1.';
      case 'todo': return '☑️';
      case 'quote': return '💬';
      case 'code': return '💻';
      case 'image': return '🖼️';
      default: return '📝';
    }
  };
  
  return (
    <div className="grid gap-1">
      {blockTypes.map(([type, config]) => (
        <Button
          key={type}
          variant="ghost"
          onClick={() => onSelect(type)}
          className="justify-start h-auto p-3 text-left"
        >
          <div className="flex items-start space-x-3">
            <span className="text-lg flex-shrink-0 mt-0.5">
              {getBlockIcon(type)}
            </span>
            <div>
              <div className="font-medium text-sm">
                {config.label}
              </div>
              <div className="text-xs text-muted-foreground">
                {config.shortcut}
              </div>
            </div>
          </div>
        </Button>
      ))}
    </div>
  );
}