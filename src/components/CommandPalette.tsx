'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/contexts/AppContext';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { searchDocuments } from '@/lib/utils';
import { Document } from '@/types';

export function CommandPalette() {
  const { state, dispatch } = useApp();
  const [query, setQuery] = useState('');
  
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        dispatch({ type: 'TOGGLE_COMMAND_PALETTE' });
      }
      
      if (e.key === 'Escape' && state.commandPaletteOpen) {
        dispatch({ type: 'TOGGLE_COMMAND_PALETTE' });
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [dispatch, state.commandPaletteOpen]);
  
  const createNewDocument = (title: string = 'Untitled', emoji: string = '📄') => {
    dispatch({
      type: 'CREATE_DOCUMENT',
      payload: { title, emoji },
    });
    dispatch({ type: 'TOGGLE_COMMAND_PALETTE' });
  };
  
  const selectDocument = (docId: string) => {
    dispatch({ type: 'SET_CURRENT_DOCUMENT', payload: { id: docId } });
    dispatch({ type: 'TOGGLE_COMMAND_PALETTE' });
  };
  
  const filteredDocuments = searchDocuments(state.documents, query);
  
  const commands = [
    {
      group: 'Actions',
      items: [
        {
          id: 'new-page',
          title: 'New Page',
          description: 'Create a new document',
          icon: '📄',
          action: () => createNewDocument(),
        },
        {
          id: 'daily-notes',
          title: 'Daily Notes',
          description: 'Create daily notes template',
          icon: '📅',
          action: () => createNewDocument(`Daily Notes - ${new Date().toLocaleDateString()}`, '📅'),
        },
        {
          id: 'meeting-notes',
          title: 'Meeting Notes',
          description: 'Create meeting notes template',
          icon: '📋',
          action: () => createNewDocument('Meeting Notes', '📋'),
        },
        {
          id: 'project-plan',
          title: 'Project Plan',
          description: 'Create project plan template',
          icon: '📊',
          action: () => createNewDocument('Project Plan', '📊'),
        },
      ],
    },
  ];

  return (
    <Dialog 
      open={state.commandPaletteOpen} 
      onOpenChange={() => dispatch({ type: 'TOGGLE_COMMAND_PALETTE' })}
    >
      <DialogContent className="p-0 max-w-2xl">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Search pages or run a command..."
            value={query}
            onValueChange={setQuery}
            className="border-0"
          />
          
          <CommandList className="max-h-96">
            <CommandEmpty>
              No results found for "{query}"
            </CommandEmpty>
            
            {/* Commands */}
            {commands.map((group) => (
              <CommandGroup key={group.group} heading={group.group}>
                {group.items.map((command) => (
                  <CommandItem
                    key={command.id}
                    onSelect={command.action}
                    className="flex items-center space-x-3 p-3"
                  >
                    <span className="text-lg">{command.icon}</span>
                    <div>
                      <div className="font-medium">{command.title}</div>
                      <div className="text-sm text-muted-foreground">
                        {command.description}
                      </div>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            ))}
            
            {/* Documents */}
            {filteredDocuments.length > 0 && (
              <CommandGroup heading="Pages">
                {filteredDocuments.map((doc: Document) => (
                  <CommandItem
                    key={doc.id}
                    onSelect={() => selectDocument(doc.id)}
                    className="flex items-center space-x-3 p-3"
                  >
                    <span className="text-lg">{doc.emoji || '📄'}</span>
                    <div className="flex-1">
                      <div className="font-medium truncate">{doc.title}</div>
                      <div className="text-sm text-muted-foreground">
                        Last edited {new Date(doc.updatedAt).toLocaleDateString()}
                      </div>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </DialogContent>
    </Dialog>
  );
}