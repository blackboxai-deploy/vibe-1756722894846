import { Document, Block, Workspace } from '@/types/document';

const STORAGE_KEYS = {
  WORKSPACE: 'notion-workspace',
  DOCUMENTS: 'notion-documents',
  SETTINGS: 'notion-settings',
} as const;

export interface WorkspaceData {
  id: string;
  name: string;
  documents: Document[];
  createdAt: string;
  updatedAt: string;
}

export interface AppSettings {
  theme: 'light' | 'dark' | 'system';
  sidebarCollapsed: boolean;
  defaultTemplate: string;
}

class StorageManager {
  private isClient = typeof window !== 'undefined';

  // Document operations
  saveDocument(document: Document): void {
    if (!this.isClient) return;
    
    const documents = this.getAllDocuments();
    const existingIndex = documents.findIndex(doc => doc.id === document.id);
    
    if (existingIndex >= 0) {
      documents[existingIndex] = { ...document, updatedAt: new Date().toISOString() };
    } else {
      documents.push(document);
    }
    
    localStorage.setItem(STORAGE_KEYS.DOCUMENTS, JSON.stringify(documents));
    this.updateWorkspaceTimestamp();
  }

  getDocument(id: string): Document | null {
    if (!this.isClient) return null;
    
    const documents = this.getAllDocuments();
    return documents.find(doc => doc.id === id) || null;
  }

  getAllDocuments(): Document[] {
    if (!this.isClient) return [];
    
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.DOCUMENTS);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error loading documents:', error);
      return [];
    }
  }

  deleteDocument(id: string): void {
    if (!this.isClient) return;
    
    const documents = this.getAllDocuments();
    const filtered = documents.filter(doc => doc.id !== id);
    localStorage.setItem(STORAGE_KEYS.DOCUMENTS, JSON.stringify(filtered));
    this.updateWorkspaceTimestamp();
  }

  // Workspace operations
  getWorkspace(): WorkspaceData {
    if (!this.isClient) {
      return this.getDefaultWorkspace();
    }
    
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.WORKSPACE);
      if (stored) {
        const workspace = JSON.parse(stored);
        return {
          ...workspace,
          documents: this.getAllDocuments()
        };
      }
    } catch (error) {
      console.error('Error loading workspace:', error);
    }
    
    return this.getDefaultWorkspace();
  }

  saveWorkspace(workspace: Partial<WorkspaceData>): void {
    if (!this.isClient) return;
    
    const current = this.getWorkspace();
    const updated = {
      ...current,
      ...workspace,
      updatedAt: new Date().toISOString()
    };
    
    localStorage.setItem(STORAGE_KEYS.WORKSPACE, JSON.stringify(updated));
  }

  private getDefaultWorkspace(): WorkspaceData {
    return {
      id: 'default',
      name: 'My Workspace',
      documents: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }

  private updateWorkspaceTimestamp(): void {
    const workspace = this.getWorkspace();
    workspace.updatedAt = new Date().toISOString();
    localStorage.setItem(STORAGE_KEYS.WORKSPACE, JSON.stringify(workspace));
  }

  // Settings operations
  getSettings(): AppSettings {
    if (!this.isClient) {
      return this.getDefaultSettings();
    }
    
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (stored) {
        return { ...this.getDefaultSettings(), ...JSON.parse(stored) };
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
    
    return this.getDefaultSettings();
  }

  saveSettings(settings: Partial<AppSettings>): void {
    if (!this.isClient) return;
    
    const current = this.getSettings();
    const updated = { ...current, ...settings };
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(updated));
  }

  private getDefaultSettings(): AppSettings {
    return {
      theme: 'system',
      sidebarCollapsed: false,
      defaultTemplate: 'blank'
    };
  }

  // Search operations
  searchDocuments(query: string): Document[] {
    if (!query.trim()) return [];
    
    const documents = this.getAllDocuments();
    const searchTerm = query.toLowerCase();
    
    return documents.filter(doc => {
      // Search in title
      if (doc.title.toLowerCase().includes(searchTerm)) {
        return true;
      }
      
      // Search in blocks content
      return doc.blocks.some(block => {
        if (block.type === 'text' || block.type === 'heading') {
          return block.content.toLowerCase().includes(searchTerm);
        }
        return false;
      });
    });
  }

  // Export/Import operations
  exportWorkspace(): string {
    const workspace = this.getWorkspace();
    const settings = this.getSettings();
    
    const exportData = {
      workspace,
      settings,
      exportedAt: new Date().toISOString(),
      version: '1.0'
    };
    
    return JSON.stringify(exportData, null, 2);
  }

  exportDocument(id: string): string | null {
    const document = this.getDocument(id);
    if (!document) return null;
    
    const exportData = {
      document,
      exportedAt: new Date().toISOString(),
      version: '1.0'
    };
    
    return JSON.stringify(exportData, null, 2);
  }

  exportDocumentAsMarkdown(id: string): string | null {
    const document = this.getDocument(id);
    if (!document) return null;
    
    let markdown = `# ${document.title}\n\n`;
    
    document.blocks.forEach(block => {
      switch (block.type) {
        case 'heading':
          const level = block.properties?.level || 1;
          markdown += `${'#'.repeat(level + 1)} ${block.content}\n\n`;
          break;
        case 'text':
          markdown += `${block.content}\n\n`;
          break;
        case 'quote':
          markdown += `> ${block.content}\n\n`;
          break;
        case 'code':
          const language = block.properties?.language || '';
          markdown += `\`\`\`${language}\n${block.content}\n\`\`\`\n\n`;
          break;
        case 'bulleted-list':
          markdown += `- ${block.content}\n`;
          break;
        case 'numbered-list':
          markdown += `1. ${block.content}\n`;
          break;
        case 'todo':
          const checked = block.properties?.checked ? 'x' : ' ';
          markdown += `- [${checked}] ${block.content}\n`;
          break;
        case 'divider':
          markdown += `---\n\n`;
          break;
      }
    });
    
    return markdown;
  }

  importWorkspace(jsonData: string): boolean {
    if (!this.isClient) return false;
    
    try {
      const importData = JSON.parse(jsonData);
      
      if (importData.workspace) {
        this.saveWorkspace(importData.workspace);
      }
      
      if (importData.workspace?.documents) {
        importData.workspace.documents.forEach((doc: Document) => {
          this.saveDocument(doc);
        });
      }
      
      if (importData.settings) {
        this.saveSettings(importData.settings);
      }
      
      return true;
    } catch (error) {
      console.error('Error importing workspace:', error);
      return false;
    }
  }

  // Utility operations
  clearAllData(): void {
    if (!this.isClient) return;
    
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
  }

  getStorageSize(): number {
    if (!this.isClient) return 0;
    
    let total = 0;
    Object.values(STORAGE_KEYS).forEach(key => {
      const item = localStorage.getItem(key);
      if (item) {
        total += item.length;
      }
    });
    
    return total;
  }

  downloadFile(content: string, filename: string, mimeType: string = 'application/json'): void {
    if (!this.isClient) return;
    
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}

export const storage = new StorageManager();