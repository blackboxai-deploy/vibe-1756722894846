'use client';

import React from 'react';
import { useApp } from '@/contexts/AppContext';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { CommandPalette } from '@/components/CommandPalette';

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const { state } = useApp();
  
  return (
    <div className="flex h-screen bg-background text-foreground">
      <Sidebar />
      
      <div className="flex flex-col flex-1">
        <Header />
        
        <main className="flex-1 overflow-hidden">
          {children}
        </main>
      </div>
      
      {state.commandPaletteOpen && <CommandPalette />}
    </div>
  );
}