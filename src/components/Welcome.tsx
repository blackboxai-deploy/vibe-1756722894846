'use client';

import React from 'react';
import { useApp } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDate } from '@/lib/utils';

export function Welcome() {
  const { state, dispatch } = useApp();
  
  const createNewDocument = (title: string, emoji: string, template?: any) => {
    dispatch({
      type: 'CREATE_DOCUMENT',
      payload: {
        title,
        emoji,
        blocks: template || [{
          id: Math.random().toString(36).substr(2, 9),
          type: 'paragraph',
          content: '',
        }],
      },
    });
  };
  
  const recentDocuments = state.documents
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 6);
  
  const templates = [
    {
      name: 'Daily Notes',
      emoji: '📅',
      description: 'Capture your daily thoughts and tasks',
      template: [
        { id: '1', type: 'heading1', content: `Daily Notes - ${new Date().toLocaleDateString()}` },
        { id: '2', type: 'heading2', content: 'Today\'s Goals' },
        { id: '3', type: 'todo', content: 'Complete project tasks' },
        { id: '4', type: 'todo', content: 'Review emails' },
        { id: '5', type: 'heading2', content: 'Notes' },
        { id: '6', type: 'paragraph', content: '' },
      ],
    },
    {
      name: 'Meeting Notes',
      emoji: '📋',
      description: 'Template for meeting documentation',
      template: [
        { id: '1', type: 'heading1', content: 'Meeting Notes' },
        { id: '2', type: 'paragraph', content: `📅 Date: ${new Date().toLocaleDateString()}` },
        { id: '3', type: 'paragraph', content: '👥 Attendees: ' },
        { id: '4', type: 'heading2', content: 'Agenda' },
        { id: '5', type: 'bulleted-list', content: 'Topic 1' },
        { id: '6', type: 'heading2', content: 'Action Items' },
        { id: '7', type: 'todo', content: 'Follow up on...' },
      ],
    },
    {
      name: 'Project Plan',
      emoji: '📊',
      description: 'Structure your project planning',
      template: [
        { id: '1', type: 'heading1', content: 'Project Plan' },
        { id: '2', type: 'heading2', content: 'Overview' },
        { id: '3', type: 'paragraph', content: 'Brief project description...' },
        { id: '4', type: 'heading2', content: 'Objectives' },
        { id: '5', type: 'bulleted-list', content: 'Primary objective' },
        { id: '6', type: 'heading2', content: 'Timeline' },
        { id: '7', type: 'paragraph', content: 'Project timeline details...' },
        { id: '8', type: 'heading2', content: 'Resources' },
        { id: '9', type: 'bulleted-list', content: 'Required resources' },
      ],
    },
  ];

  return (
    <div className="flex-1 overflow-auto">
      <div className="max-w-4xl mx-auto p-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="text-6xl mb-4">🚀</div>
          <h1 className="text-4xl font-bold mb-4">Welcome to your workspace</h1>
          <p className="text-xl text-muted-foreground mb-8">
            Organize your thoughts, projects, and ideas in one powerful workspace
          </p>
          
          <Button
            onClick={() => createNewDocument('Untitled', '📄')}
            size="lg"
            className="mr-4"
          >
            Create New Page
          </Button>
          
          <Button
            variant="outline"
            onClick={() => dispatch({ type: 'TOGGLE_COMMAND_PALETTE' })}
            size="lg"
          >
            Browse Templates
          </Button>
        </div>
        
        {/* Quick Templates */}
        <div className="mb-12">
          <h2 className="text-2xl font-semibold mb-6">Quick Start Templates</h2>
          <div className="grid md:grid-cols-3 gap-4">
            {templates.map((template) => (
              <Card 
                key={template.name} 
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => createNewDocument(template.name, template.emoji, template.template)}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{template.emoji}</span>
                    <CardTitle className="text-lg">{template.name}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription>{template.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
        
        {/* Recent Documents */}
        {recentDocuments.length > 0 && (
          <div>
            <h2 className="text-2xl font-semibold mb-6">Recent Pages</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {recentDocuments.map((doc) => (
                <Card 
                  key={doc.id}
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => dispatch({ type: 'SET_CURRENT_DOCUMENT', payload: { id: doc.id } })}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-center space-x-3">
                      <span className="text-xl">{doc.emoji || '📄'}</span>
                      <CardTitle className="text-base truncate">{doc.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>
                      Last edited {formatDate(doc.updatedAt)}
                    </CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
        
        {/* Getting Started */}
        <div className="mt-12 p-6 bg-muted/50 rounded-lg">
          <h3 className="text-lg font-semibold mb-3">Getting Started</h3>
          <div className="space-y-2 text-sm text-muted-foreground">
            <div>• Press <kbd className="px-2 py-1 bg-background rounded text-xs">Cmd+K</kbd> to open the command palette</div>
            <div>• Type <kbd className="px-2 py-1 bg-background rounded text-xs">/</kbd> at the start of any line to see block options</div>
            <div>• Use <kbd className="px-2 py-1 bg-background rounded text-xs">Enter</kbd> to create new blocks</div>
            <div>• Try markdown shortcuts like <kbd className="px-2 py-1 bg-background rounded text-xs"># Heading</kbd> or <kbd className="px-2 py-1 bg-background rounded text-xs">- List</kbd></div>
          </div>
        </div>
      </div>
    </div>
  );
}