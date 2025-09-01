'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Badge } from '@/components/ui/badge'
import { 
  Menu, 
  Search, 
  Plus, 
  FileText, 
  Star, 
  Trash2, 
  Settings, 
  Download,
  Upload,
  FolderOpen,
  Command,
  Moon,
  Sun,
  ChevronRight,
  ChevronDown,
  MoreHorizontal
} from 'lucide-react'
import { useTheme } from 'next-themes'
import { cn } from '@/lib/utils'

interface Document {
  id: string
  title: string
  content: string
  createdAt: Date
  updatedAt: Date
  isFavorite: boolean
  parentId?: string
  children?: Document[]
}

interface MainLayoutProps {
  children: React.ReactNode
  currentDocumentId?: string
  onDocumentSelect?: (documentId: string) => void
  onDocumentCreate?: () => void
  onDocumentDelete?: (documentId: string) => void
  onDocumentExport?: (documentId: string) => void
  onBulkExport?: () => void
  onImport?: (files: FileList) => void
}

export default function MainLayout({
  children,
  currentDocumentId,
  onDocumentSelect,
  onDocumentCreate,
  onDocumentDelete,
  onDocumentExport,
  onBulkExport,
  onImport
}: MainLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [documents, setDocuments] = useState<Document[]>([])
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set())
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    // Load documents from localStorage
    const savedDocs = localStorage.getItem('notion-documents')
    if (savedDocs) {
      setDocuments(JSON.parse(savedDocs))
    }
  }, [])

  const filteredDocuments = documents.filter(doc =>
    doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doc.content.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files && onImport) {
      onImport(files)
    }
  }

  const toggleFolder = (folderId: string) => {
    const newExpanded = new Set(expandedFolders)
    if (newExpanded.has(folderId)) {
      newExpanded.delete(folderId)
    } else {
      newExpanded.add(folderId)
    }
    setExpandedFolders(newExpanded)
  }

  const DocumentTree = ({ docs, level = 0 }: { docs: Document[], level?: number }) => (
    <div className={cn("space-y-1", level > 0 && "ml-4")}>
      {docs.map((doc) => (
        <div key={doc.id} className="group">
          <div
            className={cn(
              "flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer hover:bg-accent transition-colors",
              currentDocumentId === doc.id && "bg-accent"
            )}
            onClick={() => onDocumentSelect?.(doc.id)}
          >
            {doc.children && doc.children.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0"
                onClick={(e) => {
                  e.stopPropagation()
                  toggleFolder(doc.id)
                }}
              >
                {expandedFolders.has(doc.id) ? (
                  <ChevronDown className="h-3 w-3" />
                ) : (
                  <ChevronRight className="h-3 w-3" />
                )}
              </Button>
            )}
            <FileText className="h-4 w-4 text-muted-foreground" />
            <span className="flex-1 text-sm truncate">{doc.title}</span>
            {doc.isFavorite && <Star className="h-3 w-3 text-yellow-500 fill-current" />}
            <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={(e) => {
                  e.stopPropagation()
                  onDocumentExport?.(doc.id)
                }}
              >
                <Download className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 text-destructive"
                onClick={(e) => {
                  e.stopPropagation()
                  onDocumentDelete?.(doc.id)
                }}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          </div>
          {doc.children && doc.children.length > 0 && expandedFolders.has(doc.id) && (
            <DocumentTree docs={doc.children} level={level + 1} />
          )}
        </div>
      ))}
    </div>
  )

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Workspace</h2>
          <div className="flex items-center gap-1">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                  >
                    {mounted && theme === 'dark' ? (
                      <Sun className="h-4 w-4" />
                    ) : (
                      <Moon className="h-4 w-4" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Toggle theme</TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <Button variant="ghost" size="sm">
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search documents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="p-4 space-y-2">
        <Button
          onClick={onDocumentCreate}
          className="w-full justify-start"
          variant="ghost"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Document
        </Button>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={onBulkExport}
          >
            <Download className="h-4 w-4 mr-2" />
            Export All
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => document.getElementById('file-upload')?.click()}
          >
            <Upload className="h-4 w-4 mr-2" />
            Import
          </Button>
        </div>
        
        <input
          id="file-upload"
          type="file"
          multiple
          accept=".json,.md,.txt"
          onChange={handleFileUpload}
          className="hidden"
        />
      </div>

      <Separator />

      {/* Document List */}
      <ScrollArea className="flex-1 px-4">
        <div className="py-4">
          {searchQuery ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2 mb-3">
                <Search className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  Search results ({filteredDocuments.length})
                </span>
              </div>
              <DocumentTree docs={filteredDocuments} />
            </div>
          ) : (
            <div className="space-y-4">
              {/* Recent Documents */}
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Recent</h3>
                <DocumentTree docs={documents.slice(0, 5)} />
              </div>

              {/* Favorites */}
              {documents.some(doc => doc.isFavorite) && (
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">Favorites</h3>
                  <DocumentTree docs={documents.filter(doc => doc.isFavorite)} />
                </div>
              )}

              {/* All Documents */}
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">All Documents</h3>
                <DocumentTree docs={documents} />
              </div>
            </div>
          )}

          {documents.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <FolderOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-sm">No documents yet</p>
              <p className="text-xs">Create your first document to get started</p>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="p-4 border-t">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{documents.length} documents</span>
          <Badge variant="secondary" className="text-xs">
            <Command className="h-3 w-3 mr-1" />K
          </Badge>
        </div>
      </div>
    </div>
  )

  return (
    <TooltipProvider>
      <div className="flex h-screen bg-background">
        {/* Desktop Sidebar */}
        <div
          className={cn(
            "hidden md:flex flex-col border-r bg-card transition-all duration-300",
            sidebarOpen ? "w-80" : "w-0 overflow-hidden"
          )}
        >
          <SidebarContent />
        </div>

        {/* Mobile Sidebar */}
        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden fixed top-4 left-4 z-50"
            >
              <Menu className="h-4 w-4" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-80 p-0">
            <SidebarContent />
          </SheetContent>
        </Sheet>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <header className="border-b bg-card px-6 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="sm"
                  className="hidden md:flex"
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                >
                  <Menu className="h-4 w-4" />
                </Button>
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-muted-foreground" />
                  <span className="font-medium">Productivity App</span>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </header>

          {/* Content */}
          <main className="flex-1 overflow-auto">
            {children}
          </main>
        </div>
      </div>
    </TooltipProvider>
  )
}