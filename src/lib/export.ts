import { Document, Block } from '@/types/document';

export interface ExportOptions {
  format: 'json' | 'markdown' | 'html' | 'txt';
  includeMetadata?: boolean;
  prettyPrint?: boolean;
}

export class DocumentExporter {
  static exportDocument(document: Document, options: ExportOptions): string {
    switch (options.format) {
      case 'json':
        return this.exportAsJSON(document, options);
      case 'markdown':
        return this.exportAsMarkdown(document, options);
      case 'html':
        return this.exportAsHTML(document, options);
      case 'txt':
        return this.exportAsText(document, options);
      default:
        throw new Error(`Unsupported export format: ${options.format}`);
    }
  }

  static exportAsJSON(document: Document, options: ExportOptions): string {
    const exportData = {
      ...(options.includeMetadata && {
        metadata: {
          exportedAt: new Date().toISOString(),
          version: '1.0.0',
          format: 'json'
        }
      }),
      document
    };

    return options.prettyPrint 
      ? JSON.stringify(exportData, null, 2)
      : JSON.stringify(exportData);
  }

  static exportAsMarkdown(document: Document, options: ExportOptions): string {
    let markdown = '';

    if (options.includeMetadata) {
      markdown += `---\n`;
      markdown += `title: ${document.title}\n`;
      markdown += `created: ${document.createdAt}\n`;
      markdown += `updated: ${document.updatedAt}\n`;
      markdown += `id: ${document.id}\n`;
      markdown += `---\n\n`;
    }

    markdown += `# ${document.title}\n\n`;

    document.blocks.forEach(block => {
      markdown += this.blockToMarkdown(block) + '\n\n';
    });

    return markdown.trim();
  }

  static exportAsHTML(document: Document, options: ExportOptions): string {
    let html = `<!DOCTYPE html>\n<html lang="en">\n<head>\n`;
    html += `  <meta charset="UTF-8">\n`;
    html += `  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n`;
    html += `  <title>${document.title}</title>\n`;
    html += `  <style>\n`;
    html += `    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 800px; margin: 0 auto; padding: 2rem; line-height: 1.6; }\n`;
    html += `    h1, h2, h3 { color: #1a1a1a; }\n`;
    html += `    code { background: #f5f5f5; padding: 0.2em 0.4em; border-radius: 3px; }\n`;
    html += `    pre { background: #f5f5f5; padding: 1rem; border-radius: 6px; overflow-x: auto; }\n`;
    html += `    blockquote { border-left: 4px solid #e5e5e5; margin: 0; padding-left: 1rem; color: #666; }\n`;
    html += `    .todo-item { display: flex; align-items: center; gap: 0.5rem; }\n`;
    html += `    .todo-checkbox { margin-right: 0.5rem; }\n`;
    html += `  </style>\n</head>\n<body>\n`;

    if (options.includeMetadata) {
      html += `  <div style="color: #666; font-size: 0.9em; margin-bottom: 2rem;">\n`;
      html += `    <p>Created: ${new Date(document.createdAt).toLocaleDateString()}</p>\n`;
      html += `    <p>Last updated: ${new Date(document.updatedAt).toLocaleDateString()}</p>\n`;
      html += `  </div>\n`;
    }

    html += `  <h1>${document.title}</h1>\n`;

    document.blocks.forEach(block => {
      html += `  ${this.blockToHTML(block)}\n`;
    });

    html += `</body>\n</html>`;
    return html;
  }

  static exportAsText(document: Document, options: ExportOptions): string {
    let text = '';

    if (options.includeMetadata) {
      text += `${document.title}\n`;
      text += `${'='.repeat(document.title.length)}\n\n`;
      text += `Created: ${new Date(document.createdAt).toLocaleDateString()}\n`;
      text += `Updated: ${new Date(document.updatedAt).toLocaleDateString()}\n\n`;
    } else {
      text += `${document.title}\n\n`;
    }

    document.blocks.forEach(block => {
      text += this.blockToText(block) + '\n\n';
    });

    return text.trim();
  }

  private static blockToMarkdown(block: Block): string {
    switch (block.type) {
      case 'heading1':
        return `# ${block.content}`;
      case 'heading2':
        return `## ${block.content}`;
      case 'heading3':
        return `### ${block.content}`;
      case 'paragraph':
        return block.content;
      case 'bulletList':
        return `- ${block.content}`;
      case 'numberedList':
        return `1. ${block.content}`;
      case 'todo':
        const checked = block.properties?.checked ? 'x' : ' ';
        return `- [${checked}] ${block.content}`;
      case 'quote':
        return `> ${block.content}`;
      case 'code':
        const language = block.properties?.language || '';
        return `\`\`\`${language}\n${block.content}\n\`\`\``;
      case 'divider':
        return '---';
      case 'image':
        const alt = block.properties?.alt || 'Image';
        return `![${alt}](${block.content})`;
      default:
        return block.content;
    }
  }

  private static blockToHTML(block: Block): string {
    switch (block.type) {
      case 'heading1':
        return `<h1>${this.escapeHtml(block.content)}</h1>`;
      case 'heading2':
        return `<h2>${this.escapeHtml(block.content)}</h2>`;
      case 'heading3':
        return `<h3>${this.escapeHtml(block.content)}</h3>`;
      case 'paragraph':
        return `<p>${this.escapeHtml(block.content)}</p>`;
      case 'bulletList':
        return `<ul><li>${this.escapeHtml(block.content)}</li></ul>`;
      case 'numberedList':
        return `<ol><li>${this.escapeHtml(block.content)}</li></ol>`;
      case 'todo':
        const checked = block.properties?.checked ? 'checked' : '';
        return `<div class="todo-item"><input type="checkbox" class="todo-checkbox" ${checked} disabled> <span>${this.escapeHtml(block.content)}</span></div>`;
      case 'quote':
        return `<blockquote><p>${this.escapeHtml(block.content)}</p></blockquote>`;
      case 'code':
        return `<pre><code>${this.escapeHtml(block.content)}</code></pre>`;
      case 'divider':
        return '<hr>';
      case 'image':
        const alt = block.properties?.alt || 'Image';
        return `<img src="${this.escapeHtml(block.content)}" alt="${this.escapeHtml(alt)}" style="max-width: 100%; height: auto;">`;
      default:
        return `<p>${this.escapeHtml(block.content)}</p>`;
    }
  }

  private static blockToText(block: Block): string {
    switch (block.type) {
      case 'heading1':
        return `${block.content}\n${'='.repeat(block.content.length)}`;
      case 'heading2':
        return `${block.content}\n${'-'.repeat(block.content.length)}`;
      case 'heading3':
        return `${block.content}`;
      case 'paragraph':
        return block.content;
      case 'bulletList':
        return `• ${block.content}`;
      case 'numberedList':
        return `1. ${block.content}`;
      case 'todo':
        const checked = block.properties?.checked ? '☑' : '☐';
        return `${checked} ${block.content}`;
      case 'quote':
        return `"${block.content}"`;
      case 'code':
        return `CODE:\n${block.content}`;
      case 'divider':
        return '─'.repeat(50);
      case 'image':
        return `[Image: ${block.content}]`;
      default:
        return block.content;
    }
  }

  private static escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  static downloadFile(content: string, filename: string, mimeType: string): void {
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

  static exportAndDownload(document: Document, options: ExportOptions): void {
    const content = this.exportDocument(document, options);
    const timestamp = new Date().toISOString().split('T')[0];
    const sanitizedTitle = document.title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    
    const extensions = {
      json: 'json',
      markdown: 'md',
      html: 'html',
      txt: 'txt'
    };

    const mimeTypes = {
      json: 'application/json',
      markdown: 'text/markdown',
      html: 'text/html',
      txt: 'text/plain'
    };

    const filename = `${sanitizedTitle}_${timestamp}.${extensions[options.format]}`;
    const mimeType = mimeTypes[options.format];

    this.downloadFile(content, filename, mimeType);
  }

  static exportWorkspace(documents: Document[], options: ExportOptions): string {
    const workspace = {
      metadata: {
        exportedAt: new Date().toISOString(),
        version: '1.0.0',
        format: options.format,
        documentCount: documents.length
      },
      documents: documents.map(doc => ({
        ...doc,
        content: options.format === 'json' ? doc : this.exportDocument(doc, { ...options, includeMetadata: false })
      }))
    };

    return options.prettyPrint 
      ? JSON.stringify(workspace, null, 2)
      : JSON.stringify(workspace);
  }

  static exportAndDownloadWorkspace(documents: Document[], options: ExportOptions): void {
    const content = this.exportWorkspace(documents, options);
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `workspace_backup_${timestamp}.json`;
    
    this.downloadFile(content, filename, 'application/json');
  }
}