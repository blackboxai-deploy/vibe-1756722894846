'use client';

import React from 'react';
import { useApp } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function Header() {
  const { state, dispatch } = useApp();
  
  const currentDocument = state.documents.find(doc => doc.id === state.currentDocumentId);
  
  const updateDocumentTitle = (title: string) => {
    if (state.currentDocumentId) {
      dispatch({
        type: 'UPDATE_DOCUMENT',
        payload: {
          id: state.currentDocumentId,
          updates: { title },
        },
      });
    }
  };

  return (
    <header className="h-12 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex items-center h-full px-4">
        {/* Document Title */}
        {currentDocument ? (
          <div className="flex items-center flex-1">
            <span className="mr-2 text-lg">
              {currentDocument.emoji || '📄'}
            </span>
            <Input
              value={currentDocument.title}
              onChange={(e) => updateDocumentTitle(e.target.value)}
              className="border-0 bg-transparent text-lg font-semibold focus-visible:ring-0 focus-visible:ring-offset-0 px-0"
              placeholder="Untitled"
            />
          </div>
        ) : (
          <div className="flex items-center flex-1">
            <span className="text-lg font-semibold text-muted-foreground">
              Welcome to your workspace
            </span>
          </div>
        )}
        
        {/* Actions */}
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => dispatch({ type: 'TOGGLE_COMMAND_PALETTE' })}
            className="text-muted-foreground"
          >
            <span className="mr-1">⌘K</span>
            Search
          </Button>
          
          {currentDocument && (
            <div className="text-xs text-muted-foreground">
              Last edited {new Date(currentDocument.updatedAt).toLocaleDateString()}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}