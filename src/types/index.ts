export interface Block {
  id: string;
  type: 'paragraph' | 'heading1' | 'heading2' | 'heading3' | 'bulletList' | 'numberedList' | 'todoList' | 'quote' | 'code' | 'divider' | 'image';
  content: string;
  properties?: {
    checked?: boolean;
    language?: string;
    level?: number;
    url?: string;
    caption?: string;
  };
  children?: Block[];
}

export interface Document {
  id: string;
  title: string;
  content: Block[];
  createdAt: string;
  updatedAt: string;
  parentId?: string;
  isTemplate?: boolean;
  templateCategory?: string;
  emoji?: string;
  coverImage?: string;
  archived?: boolean;
  favorite?: boolean;
}

export interface Workspace {
  id: string;
  name: string;
  documents: Document[];
  settings: WorkspaceSettings;
}

export interface WorkspaceSettings {
  theme: 'light' | 'dark' | 'system';
  sidebarCollapsed: boolean;
  defaultTemplate?: string;
  autoSave: boolean;
  showLineNumbers: boolean;
}

export interface Template {
  id: string;
  name: string;
  description: string;
  category: 'personal' | 'work' | 'education' | 'project' | 'other';
  emoji: string;
  blocks: Block[];
  preview?: string;
}

export interface SearchResult {
  documentId: string;
  title: string;
  content: string;
  blockId?: string;
  matchType: 'title' | 'content';
  score: number;
}

export interface AppState {
  workspace: Workspace;
  currentDocument: Document | null;
  sidebarOpen: boolean;
  commandPaletteOpen: boolean;
  searchQuery: string;
  searchResults: SearchResult[];
  selectedBlocks: string[];
  draggedBlock: string | null;
}

export interface AppAction {
  type: 'SET_WORKSPACE' | 'CREATE_DOCUMENT' | 'UPDATE_DOCUMENT' | 'DELETE_DOCUMENT' | 
        'SET_CURRENT_DOCUMENT' | 'TOGGLE_SIDEBAR' | 'TOGGLE_COMMAND_PALETTE' |
        'SET_SEARCH_QUERY' | 'SET_SEARCH_RESULTS' | 'SELECT_BLOCKS' | 'SET_DRAGGED_BLOCK' |
        'ADD_BLOCK' | 'UPDATE_BLOCK' | 'DELETE_BLOCK' | 'MOVE_BLOCK' | 'DUPLICATE_BLOCK' |
        'TOGGLE_FAVORITE' | 'ARCHIVE_DOCUMENT' | 'UPDATE_SETTINGS' | 'IMPORT_DOCUMENTS' |
        'EXPORT_DOCUMENT' | 'EXPORT_WORKSPACE';
  payload?: any;
}

export interface FileUpload {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  uploadedAt: string;
  documentId?: string;
}

export interface ExportOptions {
  format: 'json' | 'markdown' | 'html' | 'pdf';
  includeImages: boolean;
  includeMetadata: boolean;
  compressImages: boolean;
}

export interface KeyboardShortcut {
  key: string;
  ctrlKey?: boolean;
  metaKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  action: string;
  description: string;
}

export interface BlockPosition {
  documentId: string;
  blockId: string;
  index: number;
}

export interface DragDropResult {
  source: BlockPosition;
  destination: BlockPosition;
}