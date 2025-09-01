"use client"

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { 
  Plus, 
  Search, 
  FileText, 
  ChevronRight, 
  ChevronDown, 
  MoreHorizontal, 
  Star, 
  Trash2, 
  Edit, 
  Copy,
  Download,
  Upload,
  Menu,
  Home,
  Settings,
  Moon,
  Sun
} from 'lucide-react'
import { useTheme } from 'next-themes'
import { useWorkspace } from '@/contexts/WorkspaceContext'
import { cn } from '@/lib/utils'

interface WorkspaceSidebarProps {
  className?: string
  isMobile?: boolean
}

interface PageItemProps {
  page: any
  level: number
  onSelect: (pageId: string) => void
  onRename: (pageId: string, newTitle: string) => void
  onDelete: (pageId: string) => void
  onToggleFavorite: (pageId: string) => void
  onDuplicate: (pageId: string) => void
  selectedPageId?: string
}

const PageItem: React.FC<PageItemProps> = ({
  page,
  level,
  onSelect,
  onRename,
  onDelete,
  onToggleFavorite,
  onDuplicate,
  selectedPageId
}) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editTitle, setEditTitle] = useState(page.title)
  const [isHovered, setIsHovered] = useState(false)

  const hasChildren = page.children && page.children.length > 0
  const isSelected = selectedPageId === page.id

  const handleRename = () => {
    if (editTitle.trim() && editTitle !== page.title) {
      onRename(page.id, editTitle.trim())
    }
    setIsEditing(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleRename()
    } else if (e.key === 'Escape') {
      setEditTitle(page.title)
      setIsEditing(false)
    }
  }

  return (
    <div className="select-none">
      <div
        className={cn(
          "group flex items-center gap-1 py-1 px-2 rounded-sm cursor-pointer hover:bg-accent/50 transition-colors",
          isSelected && "bg-accent",
          level > 0 && "ml-4"
        )}
        style={{ paddingLeft: `${level * 12 + 8}px` }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {hasChildren && (
          <Button
            variant="ghost"
            size="sm"
            className="h-4 w-4 p-0 hover:bg-accent"
            onClick={(e) => {
              e.stopPropagation()
              setIsExpanded(!isExpanded)
            }}
          >
            {isExpanded ? (
              <ChevronDown className="h-3 w-3" />
            ) : (
              <ChevronRight className="h-3 w-3" />
            )}
          </Button>
        )}
        
        {!hasChildren && <div className="w-4" />}
        
        <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
        
        <div className="flex-1 min-w-0">
          {isEditing ? (
            <Input
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              onBlur={handleRename}
              onKeyDown={handleKeyDown}
              className="h-6 px-1 text-sm"
              autoFocus
            />
          ) : (
            <span
              className="text-sm truncate block"
              onClick={() => onSelect(page.id)}
            >
              {page.title}
            </span>
          )}
        </div>

        {page.isFavorite && (
          <Star className="h-3 w-3 text-yellow-500 fill-current flex-shrink-0" />
        )}

        {(isHovered || isSelected) && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 hover:bg-accent"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreHorizontal className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => setIsEditing(true)}>
                <Edit className="h-4 w-4 mr-2" />
                Rename
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onToggleFavorite(page.id)}>
                <Star className="h-4 w-4 mr-2" />
                {page.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDuplicate(page.id)}>
                <Copy className="h-4 w-4 mr-2" />
                Duplicate
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => onDelete(page.id)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {hasChildren && isExpanded && (
        <div>
          {page.children.map((child: any) => (
            <PageItem
              key={child.id}
              page={child}
              level={level + 1}
              onSelect={onSelect}
              onRename={onRename}
              onDelete={onDelete}
              onToggleFavorite={onToggleFavorite}
              onDuplicate={onDuplicate}
              selectedPageId={selectedPageId}
            />
          ))}
        </div>
      )}
    </div>
  )
}

const SidebarContent: React.FC<{
  onClose?: () => void
  selectedPageId?: string
}> = ({ onClose, selectedPageId }) => {
  const { theme, setTheme } = useTheme()
  const {
    pages,
    favorites,
    createPage,
    deletePage,
    renamePage,
    toggleFavorite,
    duplicatePage,
    searchPages,
    exportWorkspace,
    importWorkspace
  } = useWorkspace()

  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [isSearching, setIsSearching] = useState(false)

  useEffect(() => {
    if (searchQuery.trim()) {
      setIsSearching(true)
      const results = searchPages(searchQuery)
      setSearchResults(results)
    } else {
      setIsSearching(false)
      setSearchResults([])
    }
  }, [searchQuery, searchPages])

  const handleCreatePage = () => {
    const newPage = createPage('Untitled', selectedPageId)
    if (onClose) onClose()
    // Navigate to new page would happen here
  }

  const handlePageSelect = (pageId: string) => {
    if (onClose) onClose()
    // Navigation logic would go here
    window.location.href = `/document/${pageId}`
  }

  const handleExport = async () => {
    try {
      const data = await exportWorkspace()
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `workspace-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Export failed:', error)
    }
  }

  const handleImport = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        try {
          const text = await file.text()
          const data = JSON.parse(text)
          await importWorkspace(data)
        } catch (error) {
          console.error('Import failed:', error)
        }
      }
    }
    input.click()
  }

  return (
    <div className="flex flex-col h-full bg-background border-r">
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-lg">Workspace</h2>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            >
              {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <Settings className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleExport}>
                  <Download className="h-4 w-4 mr-2" />
                  Export Workspace
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleImport}>
                  <Upload className="h-4 w-4 mr-2" />
                  Import Workspace
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search pages..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1">
        <div className="p-2">
          {/* Quick Actions */}
          <div className="mb-4">
            <Button
              variant="ghost"
              className="w-full justify-start mb-1"
              onClick={() => handlePageSelect('dashboard')}
            >
              <Home className="h-4 w-4 mr-2" />
              Dashboard
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={handleCreatePage}
            >
              <Plus className="h-4 w-4 mr-2" />
              New Page
            </Button>
          </div>

          <Separator className="my-4" />

          {/* Search Results */}
          {isSearching && (
            <div className="mb-4">
              <h3 className="text-sm font-medium text-muted-foreground mb-2">
                Search Results ({searchResults.length})
              </h3>
              {searchResults.length > 0 ? (
                <div className="space-y-1">
                  {searchResults.map((page) => (
                    <div
                      key={page.id}
                      className="flex items-center gap-2 p-2 rounded-sm hover:bg-accent cursor-pointer"
                      onClick={() => handlePageSelect(page.id)}
                    >
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm truncate">{page.title}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No results found</p>
              )}
              <Separator className="my-4" />
            </div>
          )}

          {/* Favorites */}
          {favorites.length > 0 && !isSearching && (
            <div className="mb-4">
              <h3 className="text-sm font-medium text-muted-foreground mb-2 px-2">
                Favorites
              </h3>
              {favorites.map((page) => (
                <PageItem
                  key={page.id}
                  page={page}
                  level={0}
                  onSelect={handlePageSelect}
                  onRename={renamePage}
                  onDelete={deletePage}
                  onToggleFavorite={toggleFavorite}
                  onDuplicate={duplicatePage}
                  selectedPageId={selectedPageId}
                />
              ))}
              <Separator className="my-4" />
            </div>
          )}

          {/* All Pages */}
          {!isSearching && (
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2 px-2">
                Pages
              </h3>
              {pages.length > 0 ? (
                <div className="space-y-1">
                  {pages.map((page) => (
                    <PageItem
                      key={page.id}
                      page={page}
                      level={0}
                      onSelect={handlePageSelect}
                      onRename={renamePage}
                      onDelete={deletePage}
                      onToggleFavorite={toggleFavorite}
                      onDuplicate={duplicatePage}
                      selectedPageId={selectedPageId}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-sm text-muted-foreground mb-2">No pages yet</p>
                  <Button variant="outline" size="sm" onClick={handleCreatePage}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create your first page
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  )
}

export const WorkspaceSidebar: React.FC<WorkspaceSidebarProps> = ({
  className,
  isMobile = false
}) => {
  const [selectedPageId, setSelectedPageId] = useState<string>()

  useEffect(() => {
    // Get current page ID from URL
    const path = window.location.pathname
    const match = path.match(/\/document\/(.+)/)
    if (match) {
      setSelectedPageId(match[1])
    }
  }, [])

  if (isMobile) {
    return (
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" size="sm" className="md:hidden">
            <Menu className="h-4 w-4" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0 w-80">
          <SidebarContent selectedPageId={selectedPageId} />
        </SheetContent>
      </Sheet>
    )
  }

  return (
    <div className={cn("w-80 h-full", className)}>
      <SidebarContent selectedPageId={selectedPageId} />
    </div>
  )
}

export default WorkspaceSidebar