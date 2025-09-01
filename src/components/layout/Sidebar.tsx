'use client';

import React from 'react';
import { useApp } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { Document } from '@/types';

export function Sidebar() {
  const { state, dispatch } = useApp();
  
  const createNewDocument = () => {
    dispatch({
      type: 'CREATE_DOCUMENT',
      payload: {
        title: 'Untitled',
        emoji: '📄',
      },
    });
  };
  
  const selectDocument = (docId: string) => {
    dispatch({
      type: 'SET_CURRENT_DOCUMENT',
      payload: { id: docId },
    });
  };

  if (state.sidebarCollapsed) {
    return (
      <div className="w-12 bg-muted/50 border-r border-border flex flex-col items-center py-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => dispatch({ type: 'TOGGLE_SIDEBAR' })}
          className="mb-4"
        >
          ☰
        </Button>
      </div>
    );
  }
  
  return (
    <div className="w-64 bg-muted/50 border-r border-border flex flex-col">
      {/* Header */}
      <div className="p-3 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => dispatch({ type: 'TOGGLE_SIDEBAR' })}
            >
              ☰
            </Button>
            <span className="font-medium text-sm">Workspace</span>
          </div>
        </div>
      </div>
      
      {/* Quick Actions */}
      <div className="p-3 space-y-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={createNewDocument}
          className="w-full justify-start text-muted-foreground hover:text-foreground"
        >
          <span className="mr-2">+</span>
          New Page
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => dispatch({ type: 'TOGGLE_COMMAND_PALETTE' })}
          className="w-full justify-start text-muted-foreground hover:text-foreground"
        >
          <span className="mr-2">⌘</span>
          Search
        </Button>
      </div>
      
      <Separator />
      
      {/* Documents List */}
      <ScrollArea className="flex-1">
        <div className="p-3 space-y-1">
          <div className="text-xs font-medium text-muted-foreground mb-2 px-2">
            Pages
          </div>
          {state.documents.length === 0 ? (
            <div className="text-xs text-muted-foreground px-2 py-4">
              No pages yet. Create your first page to get started.
            </div>
          ) : (
            state.documents.map((doc: Document) => (
              <DocumentItem
                key={doc.id}
                document={doc}
                isActive={doc.id === state.currentDocumentId}
                onClick={() => selectDocument(doc.id)}
              />
            ))
          )}
        </div>
      </ScrollArea>
      
      {/* Footer */}
      <div className="p-3 border-t border-border">
        <div className="text-xs text-muted-foreground">
          {state.documents.length} {state.documents.length === 1 ? 'page' : 'pages'}
        </div>
      </div>
    </div>
  );
}

interface DocumentItemProps {
  document: Document;
  isActive: boolean;
  onClick: () => void;
}

function DocumentItem({ document, isActive, onClick }: DocumentItemProps) {
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={onClick}
      className={cn(
        "w-full justify-start text-left",
        isActive && "bg-accent text-accent-foreground"
      )}
    >
      <span className="mr-2 text-sm">
        {document.emoji || '📄'}
      </span>
      <span className="truncate text-sm">
        {document.title || 'Untitled'}
      </span>
    </Button>
  );
}