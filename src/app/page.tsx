'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Plus, 
  Search, 
  FileText, 
  Clock, 
  Star, 
  Download,
  Upload,
  Folder,
  Grid3X3,
  List,
  Filter
} from 'lucide-react';
import Link from 'next/link';

interface Document {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  favorite: boolean;
  tags: string[];
  type: 'document' | 'template' | 'note';
}

export default function Dashboard() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filterType, setFilterType] = useState<'all' | 'favorites' | 'recent'>('all');

  useEffect(() => {
    // Load documents from localStorage
    const savedDocs = localStorage.getItem('notion-documents');
    if (savedDocs) {
      setDocuments(JSON.parse(savedDocs));
    } else {
      // Create sample documents
      const sampleDocs: Document[] = [
        {
          id: '1',
          title: 'Welcome to Your Workspace',
          content: 'This is your first document. Start writing and organizing your thoughts here.',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          favorite: true,
          tags: ['welcome', 'getting-started'],
          type: 'document'
        },
        {
          id: '2',
          title: 'Project Planning Template',
          content: 'Use this template to plan your projects with goals, tasks, and timelines.',
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          updatedAt: new Date(Date.now() - 86400000).toISOString(),
          favorite: false,
          tags: ['template', 'project', 'planning'],
          type: 'template'
        },
        {
          id: '3',
          title: 'Meeting Notes',
          content: 'Quick notes from today\'s team meeting and action items.',
          createdAt: new Date(Date.now() - 172800000).toISOString(),
          updatedAt: new Date(Date.now() - 172800000).toISOString(),
          favorite: false,
          tags: ['meeting', 'notes'],
          type: 'note'
        }
      ];
      setDocuments(sampleDocs);
      localStorage.setItem('notion-documents', JSON.stringify(sampleDocs));
    }
  }, []);

  const createNewDocument = () => {
    const newDoc: Document = {
      id: Date.now().toString(),
      title: 'Untitled Document',
      content: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      favorite: false,
      tags: [],
      type: 'document'
    };
    const updatedDocs = [newDoc, ...documents];
    setDocuments(updatedDocs);
    localStorage.setItem('notion-documents', JSON.stringify(updatedDocs));
    window.location.href = `/document/${newDoc.id}`;
  };

  const toggleFavorite = (id: string) => {
    const updatedDocs = documents.map(doc => 
      doc.id === id ? { ...doc, favorite: !doc.favorite } : doc
    );
    setDocuments(updatedDocs);
    localStorage.setItem('notion-documents', JSON.stringify(updatedDocs));
  };

  const exportAllDocuments = () => {
    const dataStr = JSON.stringify(documents, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `workspace-backup-${new Date().toISOString().split('T')[0]}.json`;
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const importDocuments = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const importedDocs = JSON.parse(e.target?.result as string);
          const mergedDocs = [...documents, ...importedDocs];
          setDocuments(mergedDocs);
          localStorage.setItem('notion-documents', JSON.stringify(mergedDocs));
        } catch (error) {
          alert('Error importing documents. Please check the file format.');
        }
      };
      reader.readAsText(file);
    }
  };

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         doc.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         doc.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesFilter = filterType === 'all' || 
                         (filterType === 'favorites' && doc.favorite) ||
                         (filterType === 'recent' && new Date(doc.updatedAt) > new Date(Date.now() - 7 * 86400000));
    
    return matchesSearch && matchesFilter;
  });

  const recentDocuments = documents
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 5);

  const favoriteDocuments = documents.filter(doc => doc.favorite);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Your Workspace</h1>
              <p className="text-muted-foreground">Organize your thoughts and ideas</p>
            </div>
            <div className="flex items-center gap-2">
              <Button onClick={exportAllDocuments} variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export All
              </Button>
              <label htmlFor="import-file">
                <Button variant="outline" size="sm" asChild>
                  <span>
                    <Upload className="h-4 w-4 mr-2" />
                    Import
                  </span>
                </Button>
              </label>
              <input
                id="import-file"
                type="file"
                accept=".json"
                onChange={importDocuments}
                className="hidden"
              />
              <Button onClick={createNewDocument}>
                <Plus className="h-4 w-4 mr-2" />
                New Document
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Search and Filters */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search documents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 border rounded-md p-1">
                <Button
                  variant={filterType === 'all' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setFilterType('all')}
                >
                  All
                </Button>
                <Button
                  variant={filterType === 'favorites' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setFilterType('favorites')}
                >
                  <Star className="h-4 w-4 mr-1" />
                  Favorites
                </Button>
                <Button
                  variant={filterType === 'recent' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setFilterType('recent')}
                >
                  <Clock className="h-4 w-4 mr-1" />
                  Recent
                </Button>
              </div>
              <Separator orientation="vertical" className="h-8" />
              <div className="flex items-center gap-1 border rounded-md p-1">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                >
                  <Grid3X3 className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Documents</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{documents.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Favorites</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{favoriteDocuments.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">This Week</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {documents.filter(doc => new Date(doc.createdAt) > new Date(Date.now() - 7 * 86400000)).length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Templates</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {documents.filter(doc => doc.type === 'template').length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Documents Grid/List */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">
            {filterType === 'all' ? 'All Documents' : 
             filterType === 'favorites' ? 'Favorite Documents' : 'Recent Documents'}
            {searchQuery && ` matching "${searchQuery}"`}
          </h2>
          
          {filteredDocuments.length === 0 ? (
            <Card className="p-8 text-center">
              <Folder className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-2">No documents found</h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery ? 'Try adjusting your search terms' : 'Create your first document to get started'}
              </p>
              <Button onClick={createNewDocument}>
                <Plus className="h-4 w-4 mr-2" />
                Create Document
              </Button>
            </Card>
          ) : (
            <div className={viewMode === 'grid' ? 
              'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' : 
              'space-y-2'
            }>
              {filteredDocuments.map((doc) => (
                <Card key={doc.id} className={`group hover:shadow-md transition-shadow ${
                  viewMode === 'list' ? 'p-4' : ''
                }`}>
                  <Link href={`/document/${doc.id}`}>
                    <CardHeader className={viewMode === 'list' ? 'pb-2' : ''}>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-base group-hover:text-primary transition-colors">
                            {doc.title}
                          </CardTitle>
                          <CardDescription className="mt-1">
                            {doc.content.slice(0, 100)}...
                          </CardDescription>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.preventDefault();
                            toggleFavorite(doc.id);
                          }}
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Star className={`h-4 w-4 ${doc.favorite ? 'fill-current text-yellow-500' : ''}`} />
                        </Button>
                      </div>
                    </CardHeader>
                    {viewMode === 'grid' && (
                      <CardContent>
                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4" />
                            <span>{doc.type}</span>
                          </div>
                          <span>{new Date(doc.updatedAt).toLocaleDateString()}</span>
                        </div>
                        {doc.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {doc.tags.slice(0, 3).map((tag) => (
                              <Badge key={tag} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                            {doc.tags.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{doc.tags.length - 3}
                              </Badge>
                            )}
                          </div>
                        )}
                      </CardContent>
                    )}
                  </Link>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Recent Activity */}
        {recentDocuments.length > 0 && filterType === 'all' && !searchQuery && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
            <div className="space-y-2">
              {recentDocuments.map((doc) => (
                <Card key={`recent-${doc.id}`} className="p-4">
                  <Link href={`/document/${doc.id}`} className="flex items-center justify-between group">
                    <div className="flex items-center gap-3">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium group-hover:text-primary transition-colors">
                          {doc.title}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Updated {new Date(doc.updatedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {doc.favorite && <Star className="h-4 w-4 fill-current text-yellow-500" />}
                      <Badge variant="outline" className="text-xs">
                        {doc.type}
                      </Badge>
                    </div>
                  </Link>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}