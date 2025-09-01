'use client';

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';

export interface Block {
  id: string;
  type: 'paragraph' | 'heading1' | 'heading2' | 'heading3' | 'bulletList' | 'numberedList' | 'todo' | 'quote' | 'code' | 'divider' | 'image';
  content: string;
  metadata?: {
    checked?: boolean;
    language?: string;
    imageUrl?: string;
    imageAlt?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface Document {
  id: string;
  title: string;
  blocks: Block[];
  parentId?: string;
  isTemplate?: boolean;
  templateCategory?: string;
  createdAt: Date;
  updatedAt: Date;
  isFavorite?: boolean;
}

export interface AppState {
  documents: Document[];
  currentDocumentId: string | null;
  sidebarCollapsed: boolean;
  theme: 'light' | 'dark';
  searchQuery: string;
  commandPaletteOpen: boolean;
  recentDocuments: string[];
  favorites: string[];
}

type AppAction =
  | { type: 'CREATE_DOCUMENT'; payload: { title: string; parentId?: string; template?: Document } }
  | { type: 'UPDATE_DOCUMENT'; payload: { id: string; updates: Partial<Document> } }
  | { type: 'DELETE_DOCUMENT'; payload: { id: string } }
  | { type: 'SET_CURRENT_DOCUMENT'; payload: { id: string | null } }
  | { type: 'ADD_BLOCK'; payload: { documentId: string; block: Block; index?: number } }
  | { type: 'UPDATE_BLOCK'; payload: { documentId: string; blockId: string; updates: Partial<Block> } }
  | { type: 'DELETE_BLOCK'; payload: { documentId: string; blockId: string } }
  | { type: 'REORDER_BLOCKS'; payload: { documentId: string; fromIndex: number; toIndex: number } }
  | { type: 'TOGGLE_SIDEBAR' }
  | { type: 'SET_THEME'; payload: { theme: 'light' | 'dark' } }
  | { type: 'SET_SEARCH_QUERY'; payload: { query: string } }
  | { type: 'TOGGLE_COMMAND_PALETTE' }
  | { type: 'ADD_TO_RECENT'; payload: { documentId: string } }
  | { type: 'TOGGLE_FAVORITE'; payload: { documentId: string } }
  | { type: 'IMPORT_DOCUMENTS'; payload: { documents: Document[] } }
  | { type: 'LOAD_STATE'; payload: { state: AppState } };

const initialState: AppState = {
  documents: [],
  currentDocumentId: null,
  sidebarCollapsed: false,
  theme: 'light',
  searchQuery: '',
  commandPaletteOpen: false,
  recentDocuments: [],
  favorites: [],
};

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function createDefaultBlock(): Block {
  return {
    id: generateId(),
    type: 'paragraph',
    content: '',
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'CREATE_DOCUMENT': {
      const newDocument: Document = {
        id: generateId(),
        title: action.payload.title,
        blocks: action.payload.template?.blocks || [createDefaultBlock()],
        parentId: action.payload.parentId,
        isTemplate: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      return {
        ...state,
        documents: [...state.documents, newDocument],
        currentDocumentId: newDocument.id,
      };
    }

    case 'UPDATE_DOCUMENT': {
      return {
        ...state,
        documents: state.documents.map(doc =>
          doc.id === action.payload.id
            ? { ...doc, ...action.payload.updates, updatedAt: new Date() }
            : doc
        ),
      };
    }

    case 'DELETE_DOCUMENT': {
      const documentsToDelete = [action.payload.id];
      const findChildDocuments = (parentId: string) => {
        state.documents.forEach(doc => {
          if (doc.parentId === parentId) {
            documentsToDelete.push(doc.id);
            findChildDocuments(doc.id);
          }
        });
      };
      findChildDocuments(action.payload.id);

      return {
        ...state,
        documents: state.documents.filter(doc => !documentsToDelete.includes(doc.id)),
        currentDocumentId: state.currentDocumentId === action.payload.id ? null : state.currentDocumentId,
        recentDocuments: state.recentDocuments.filter(id => !documentsToDelete.includes(id)),
        favorites: state.favorites.filter(id => !documentsToDelete.includes(id)),
      };
    }

    case 'SET_CURRENT_DOCUMENT': {
      return {
        ...state,
        currentDocumentId: action.payload.id,
      };
    }

    case 'ADD_BLOCK': {
      return {
        ...state,
        documents: state.documents.map(doc =>
          doc.id === action.payload.documentId
            ? {
                ...doc,
                blocks: action.payload.index !== undefined
                  ? [
                      ...doc.blocks.slice(0, action.payload.index),
                      action.payload.block,
                      ...doc.blocks.slice(action.payload.index),
                    ]
                  : [...doc.blocks, action.payload.block],
                updatedAt: new Date(),
              }
            : doc
        ),
      };
    }

    case 'UPDATE_BLOCK': {
      return {
        ...state,
        documents: state.documents.map(doc =>
          doc.id === action.payload.documentId
            ? {
                ...doc,
                blocks: doc.blocks.map(block =>
                  block.id === action.payload.blockId
                    ? { ...block, ...action.payload.updates, updatedAt: new Date() }
                    : block
                ),
                updatedAt: new Date(),
              }
            : doc
        ),
      };
    }

    case 'DELETE_BLOCK': {
      return {
        ...state,
        documents: state.documents.map(doc =>
          doc.id === action.payload.documentId
            ? {
                ...doc,
                blocks: doc.blocks.filter(block => block.id !== action.payload.blockId),
                updatedAt: new Date(),
              }
            : doc
        ),
      };
    }

    case 'REORDER_BLOCKS': {
      return {
        ...state,
        documents: state.documents.map(doc =>
          doc.id === action.payload.documentId
            ? {
                ...doc,
                blocks: (() => {
                  const blocks = [...doc.blocks];
                  const [removed] = blocks.splice(action.payload.fromIndex, 1);
                  blocks.splice(action.payload.toIndex, 0, removed);
                  return blocks;
                })(),
                updatedAt: new Date(),
              }
            : doc
        ),
      };
    }

    case 'TOGGLE_SIDEBAR': {
      return {
        ...state,
        sidebarCollapsed: !state.sidebarCollapsed,
      };
    }

    case 'SET_THEME': {
      return {
        ...state,
        theme: action.payload.theme,
      };
    }

    case 'SET_SEARCH_QUERY': {
      return {
        ...state,
        searchQuery: action.payload.query,
      };
    }

    case 'TOGGLE_COMMAND_PALETTE': {
      return {
        ...state,
        commandPaletteOpen: !state.commandPaletteOpen,
      };
    }

    case 'ADD_TO_RECENT': {
      const recentDocuments = [
        action.payload.documentId,
        ...state.recentDocuments.filter(id => id !== action.payload.documentId),
      ].slice(0, 10);
      return {
        ...state,
        recentDocuments,
      };
    }

    case 'TOGGLE_FAVORITE': {
      const isFavorite = state.favorites.includes(action.payload.documentId);
      return {
        ...state,
        favorites: isFavorite
          ? state.favorites.filter(id => id !== action.payload.documentId)
          : [...state.favorites, action.payload.documentId],
      };
    }

    case 'IMPORT_DOCUMENTS': {
      return {
        ...state,
        documents: [...state.documents, ...action.payload.documents],
      };
    }

    case 'LOAD_STATE': {
      return action.payload.state;
    }

    default:
      return state;
  }
}

interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  createDocument: (title: string, parentId?: string, template?: Document) => void;
  updateDocument: (id: string, updates: Partial<Document>) => void;
  deleteDocument: (id: string) => void;
  setCurrentDocument: (id: string | null) => void;
  addBlock: (documentId: string, block: Block, index?: number) => void;
  updateBlock: (documentId: string, blockId: string, updates: Partial<Block>) => void;
  deleteBlock: (documentId: string, blockId: string) => void;
  reorderBlocks: (documentId: string, fromIndex: number, toIndex: number) => void;
  toggleSidebar: () => void;
  setTheme: (theme: 'light' | 'dark') => void;
  setSearchQuery: (query: string) => void;
  toggleCommandPalette: () => void;
  addToRecent: (documentId: string) => void;
  toggleFavorite: (documentId: string) => void;
  exportData: () => string;
  importData: (data: string) => void;
  getCurrentDocument: () => Document | null;
  getDocumentsByParent: (parentId?: string) => Document[];
  searchDocuments: (query: string) => Document[];
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  useEffect(() => {
    const savedState = localStorage.getItem('notion-app-state');
    if (savedState) {
      try {
        const parsedState = JSON.parse(savedState);
        parsedState.documents = parsedState.documents.map((doc: any) => ({
          ...doc,
          createdAt: new Date(doc.createdAt),
          updatedAt: new Date(doc.updatedAt),
          blocks: doc.blocks.map((block: any) => ({
            ...block,
            createdAt: new Date(block.createdAt),
            updatedAt: new Date(block.updatedAt),
          })),
        }));
        dispatch({ type: 'LOAD_STATE', payload: { state: parsedState } });
      } catch (error) {
        console.error('Failed to load saved state:', error);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('notion-app-state', JSON.stringify(state));
  }, [state]);

  const createDocument = (title: string, parentId?: string, template?: Document) => {
    dispatch({ type: 'CREATE_DOCUMENT', payload: { title, parentId, template } });
  };

  const updateDocument = (id: string, updates: Partial<Document>) => {
    dispatch({ type: 'UPDATE_DOCUMENT', payload: { id, updates } });
  };

  const deleteDocument = (id: string) => {
    dispatch({ type: 'DELETE_DOCUMENT', payload: { id } });
  };

  const setCurrentDocument = (id: string | null) => {
    dispatch({ type: 'SET_CURRENT_DOCUMENT', payload: { id } });
    if (id) {
      addToRecent(id);
    }
  };

  const addBlock = (documentId: string, block: Block, index?: number) => {
    dispatch({ type: 'ADD_BLOCK', payload: { documentId, block, index } });
  };

  const updateBlock = (documentId: string, blockId: string, updates: Partial<Block>) => {
    dispatch({ type: 'UPDATE_BLOCK', payload: { documentId, blockId, updates } });
  };

  const deleteBlock = (documentId: string, blockId: string) => {
    dispatch({ type: 'DELETE_BLOCK', payload: { documentId, blockId } });
  };

  const reorderBlocks = (documentId: string, fromIndex: number, toIndex: number) => {
    dispatch({ type: 'REORDER_BLOCKS', payload: { documentId, fromIndex, toIndex } });
  };

  const toggleSidebar = () => {
    dispatch({ type: 'TOGGLE_SIDEBAR' });
  };

  const setTheme = (theme: 'light' | 'dark') => {
    dispatch({ type: 'SET_THEME', payload: { theme } });
  };

  const setSearchQuery = (query: string) => {
    dispatch({ type: 'SET_SEARCH_QUERY', payload: { query } });
  };

  const toggleCommandPalette = () => {
    dispatch({ type: 'TOGGLE_COMMAND_PALETTE' });
  };

  const addToRecent = (documentId: string) => {
    dispatch({ type: 'ADD_TO_RECENT', payload: { documentId } });
  };

  const toggleFavorite = (documentId: string) => {
    dispatch({ type: 'TOGGLE_FAVORITE', payload: { documentId } });
  };

  const exportData = (): string => {
    return JSON.stringify(state, null, 2);
  };

  const importData = (data: string) => {
    try {
      const parsedData = JSON.parse(data);
      if (parsedData.documents && Array.isArray(parsedData.documents)) {
        dispatch({ type: 'IMPORT_DOCUMENTS', payload: { documents: parsedData.documents } });
      }
    } catch (error) {
      console.error('Failed to import data:', error);
    }
  };

  const getCurrentDocument = (): Document | null => {
    return state.documents.find(doc => doc.id === state.currentDocumentId) || null;
  };

  const getDocumentsByParent = (parentId?: string): Document[] => {
    return state.documents.filter(doc => doc.parentId === parentId);
  };

  const searchDocuments = (query: string): Document[] => {
    if (!query.trim()) return [];
    const lowercaseQuery = query.toLowerCase();
    return state.documents.filter(doc => {
      const titleMatch = doc.title.toLowerCase().includes(lowercaseQuery);
      const contentMatch = doc.blocks.some(block =>
        block.content.toLowerCase().includes(lowercaseQuery)
      );
      return titleMatch || contentMatch;
    });
  };

  const value: AppContextType = {
    state,
    dispatch,
    createDocument,
    updateDocument,
    deleteDocument,
    setCurrentDocument,
    addBlock,
    updateBlock,
    deleteBlock,
    reorderBlocks,
    toggleSidebar,
    setTheme,
    setSearchQuery,
    toggleCommandPalette,
    addToRecent,
    toggleFavorite,
    exportData,
    importData,
    getCurrentDocument,
    getDocumentsByParent,
    searchDocuments,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}