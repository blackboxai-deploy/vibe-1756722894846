import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}

export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatTime(date: string): string {
  return new Date(date).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

export function getDocumentPath(documents: any[], documentId: string): string[] {
  const path: string[] = [];
  
  function findPath(docs: any[], id: string, currentPath: string[]): boolean {
    for (const doc of docs) {
      const newPath = [...currentPath, doc.title];
      if (doc.id === id) {
        path.push(...newPath);
        return true;
      }
      if (doc.children && findPath(doc.children, id, newPath)) {
        return true;
      }
    }
    return false;
  }
  
  findPath(documents, documentId, []);
  return path;
}

export function searchDocuments(documents: any[], query: string) {
  if (!query.trim()) return documents;
  
  const searchTerm = query.toLowerCase();
  
  return documents.filter(doc => {
    // Search in title
    if (doc.title.toLowerCase().includes(searchTerm)) return true;
    
    // Search in block content
    return doc.blocks.some((block: any) => 
      block.content.toLowerCase().includes(searchTerm)
    );
  });
}

export const BLOCK_TYPES = {
  paragraph: { label: 'Text', shortcut: 'Just start typing' },
  heading1: { label: 'Heading 1', shortcut: '# Heading' },
  heading2: { label: 'Heading 2', shortcut: '## Heading' },
  heading3: { label: 'Heading 3', shortcut: '### Heading' },
  'bulleted-list': { label: 'Bullet List', shortcut: '- Item' },
  'numbered-list': { label: 'Numbered List', shortcut: '1. Item' },
  todo: { label: 'To-do List', shortcut: '[] Task' },
  quote: { label: 'Quote', shortcut: '> Quote' },
  code: { label: 'Code Block', shortcut: '``` Code' },
  image: { label: 'Image', shortcut: 'Upload image' },
} as const;
