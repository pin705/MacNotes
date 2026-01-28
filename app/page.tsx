'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import {
  Plus,
  Trash2,
  Search,
  ChevronLeft,
  MoreHorizontal,
  Edit3,
  Moon,
  Sun,
  Laptop,
  FolderPlus,
  Folder,
  Tag,
  Pin,
  PinOff,
  Archive,
  ArchiveRestore,
  Trash,
  RefreshCw,
  LogOut,
  User,
  Check,
  X,
  Cloud,
  CloudOff,
  Loader2,
} from 'lucide-react';

// Dynamically import Rich Text Editor (client-side only)
const RichTextEditor = dynamic(() => import('@/components/RichTextEditor'), {
  ssr: false,
  loading: () => (
    <div className="h-64 flex items-center justify-center text-zinc-400">
      <Loader2 className="animate-spin" size={24} />
    </div>
  ),
});

interface NoteData {
  _id: string;
  title: string;
  body: string;
  folderId?: string;
  tags: string[];
  isPinned: boolean;
  isArchived: boolean;
  isDeleted: boolean;
  updatedAt: string;
  createdAt: string;
}

interface FolderData {
  _id: string;
  name: string;
  color: string;
  icon: string;
}

interface TagData {
  name: string;
  count: number;
}

// Debounce helper
const debounce = <F extends (...args: any[]) => any>(func: F, wait: number) => {
  let timeout: NodeJS.Timeout;
  return function executedFunction(...args: Parameters<F>) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

export default function MacNotes() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Notes state
  const [notes, setNotes] = useState<NoteData[]>([]);
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Folders & Tags state
  const [folders, setFolders] = useState<FolderData[]>([]);
  const [tags, setTags] = useState<TagData[]>([]);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  // View state
  const [viewMode, setViewMode] = useState<'all' | 'archived' | 'trash'>('all');

  // UI state
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('system');
  const [showSettings, setShowSettings] = useState(false);
  const [showFolderModal, setShowFolderModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');

  // Sync state
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'synced' | 'syncing' | 'error'>('synced');

  // Tag input state
  const [showTagInput, setShowTagInput] = useState(false);
  const [newTag, setNewTag] = useState('');

  // Derived state
  const activeNote = notes.find((n) => n._id === activeNoteId);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    }
  }, [status, router]);

  // Fetch data
  const fetchNotes = useCallback(async () => {
    if (!session) return;

    try {
      setIsSyncing(true);
      setSyncStatus('syncing');

      const params = new URLSearchParams();
      if (selectedFolderId) params.set('folderId', selectedFolderId);
      if (selectedTag) params.set('tag', selectedTag);
      if (searchQuery) params.set('search', searchQuery);
      if (viewMode === 'archived') params.set('archived', 'true');
      if (viewMode === 'trash') params.set('deleted', 'true');

      const res = await fetch(`/api/notes?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setNotes(data);
        setSyncStatus('synced');
      } else {
        setSyncStatus('error');
      }
    } catch (error) {
      console.error('Failed to fetch notes:', error);
      setSyncStatus('error');
    } finally {
      setIsLoading(false);
      setIsSyncing(false);
    }
  }, [session, selectedFolderId, selectedTag, searchQuery, viewMode]);

  const fetchFolders = async () => {
    if (!session) return;
    try {
      const res = await fetch('/api/folders');
      if (res.ok) {
        const data = await res.json();
        setFolders(data);
      }
    } catch (error) {
      console.error('Failed to fetch folders:', error);
    }
  };

  const fetchTags = async () => {
    if (!session) return;
    try {
      const res = await fetch('/api/tags');
      if (res.ok) {
        const data = await res.json();
        setTags(data);
      }
    } catch (error) {
      console.error('Failed to fetch tags:', error);
    }
  };

  useEffect(() => {
    if (session) {
      fetchNotes();
      fetchFolders();
      fetchTags();
    }
  }, [session, fetchNotes]);

  // Search with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (session) fetchNotes();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, session, fetchNotes]);

  // Theme Logic - Load saved theme on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('macnotes-theme') as 'light' | 'dark' | 'system' | null;
    if (savedTheme) {
      setTheme(savedTheme);
    }
  }, []);

  // Apply theme changes
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');

    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';
      root.classList.add(systemTheme);
    } else {
      root.classList.add(theme);
    }
    
    // Save to localStorage
    localStorage.setItem('macnotes-theme', theme);
  }, [theme]);

  // Sidebar responsive logic
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        if (activeNoteId) setIsSidebarOpen(false);
        else setIsSidebarOpen(true);
      } else {
        setIsSidebarOpen(true);
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => window.removeEventListener('resize', handleResize);
  }, [activeNoteId]);

  // API Actions
  const handleAddNote = async () => {
    try {
      setSyncStatus('syncing');
      const res = await fetch('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'Ghi chú mới',
          body: '',
          folderId: selectedFolderId || undefined,
        }),
      });

      if (res.ok) {
        const newNote = await res.json();
        setNotes([newNote, ...notes]);
        setActiveNoteId(newNote._id);
        if (window.innerWidth < 768) setIsSidebarOpen(false);
        setSearchQuery('');
        setSyncStatus('synced');
      }
    } catch (error) {
      console.error('Error creating note:', error);
      setSyncStatus('error');
    }
  };

  const handleDeleteNote = async (e: React.MouseEvent, id: string, permanent = false) => {
    e.stopPropagation();

    if (permanent && !confirm('Xóa vĩnh viễn ghi chú này?')) return;

    try {
      setSyncStatus('syncing');
      const url = permanent ? `/api/notes/${id}?permanent=true` : `/api/notes/${id}`;
      const res = await fetch(url, { method: 'DELETE' });

      if (res.ok) {
        const newNotes = notes.filter((n) => n._id !== id);
        setNotes(newNotes);
        if (activeNoteId === id) {
          setActiveNoteId(null);
          if (window.innerWidth < 768) setIsSidebarOpen(true);
        }
        setSyncStatus('synced');
      }
    } catch (error) {
      console.error('Error deleting note:', error);
      setSyncStatus('error');
    }
  };

  const handleRestoreNote = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();

    try {
      setSyncStatus('syncing');
      const res = await fetch(`/api/notes/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isDeleted: false, isArchived: false, deletedAt: null }),
      });

      if (res.ok) {
        fetchNotes();
        setSyncStatus('synced');
      }
    } catch (error) {
      console.error('Error restoring note:', error);
      setSyncStatus('error');
    }
  };

  // Debounced Update
  const debouncedUpdate = useCallback(
    debounce(async (id: string, data: Partial<NoteData>) => {
      try {
        setSyncStatus('syncing');
        const res = await fetch(`/api/notes/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
        if (res.ok) {
          setSyncStatus('synced');
        } else {
          setSyncStatus('error');
        }
      } catch (error) {
        console.error('Error updating note:', error);
        setSyncStatus('error');
      }
    }, 500),
    []
  );

  const handleUpdateNote = (field: keyof NoteData, value: any) => {
    if (!activeNote || !activeNoteId) return;

    // Optimistic Update
    const updatedNotes = notes.map((note) => {
      if (note._id === activeNoteId) {
        return { ...note, [field]: value, updatedAt: new Date().toISOString() };
      }
      return note;
    });
    setNotes(updatedNotes);

    // Call API
    debouncedUpdate(activeNoteId, { [field]: value });
  };

  const handleTogglePin = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const note = notes.find((n) => n._id === id);
    if (!note) return;

    try {
      setSyncStatus('syncing');
      const res = await fetch(`/api/notes/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPinned: !note.isPinned }),
      });

      if (res.ok) {
        fetchNotes();
        setSyncStatus('synced');
      }
    } catch (error) {
      console.error('Error toggling pin:', error);
      setSyncStatus('error');
    }
  };

  const handleArchiveNote = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();

    try {
      setSyncStatus('syncing');
      const res = await fetch(`/api/notes/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isArchived: true }),
      });

      if (res.ok) {
        fetchNotes();
        setSyncStatus('synced');
      }
    } catch (error) {
      console.error('Error archiving note:', error);
      setSyncStatus('error');
    }
  };

  // Folder actions
  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;

    try {
      const res = await fetch('/api/folders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newFolderName }),
      });

      if (res.ok) {
        fetchFolders();
        setNewFolderName('');
        setShowFolderModal(false);
      }
    } catch (error) {
      console.error('Error creating folder:', error);
    }
  };

  // Tag actions
  const handleAddTag = () => {
    if (!newTag.trim() || !activeNote) return;

    const updatedTags = [...activeNote.tags, newTag.trim()];
    handleUpdateNote('tags', updatedTags);
    setNewTag('');
    setShowTagInput(false);
    fetchTags();
  };

  const handleRemoveTag = (tagToRemove: string) => {
    if (!activeNote) return;
    const updatedTags = activeNote.tags.filter((t) => t !== tagToRemove);
    handleUpdateNote('tags', updatedTags);
  };

  const formatDate = (isoString: string) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();

    if (isToday) {
      return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    }
    return date.toLocaleDateString('vi-VN', { day: 'numeric', month: 'numeric', year: '2-digit' });
  };

  // Loading state
  if (status === 'loading' || (status === 'authenticated' && isLoading)) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-white dark:bg-zinc-950">
        <div className="text-center">
          <Loader2 className="animate-spin text-yellow-500 mx-auto mb-4" size={48} />
          <p className="text-zinc-500">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (!session) return null;

  return (
    <div className="flex h-screen w-full bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-sans overflow-hidden transition-colors duration-200">
      {/* Sidebar */}
      <div
        className={`${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'} 
        absolute md:relative z-20 w-full md:w-80 h-full flex flex-col 
        bg-zinc-50/95 dark:bg-zinc-900/95 backdrop-blur-xl border-r border-zinc-200 dark:border-zinc-800 transition-transform duration-300 ease-in-out`}
      >
        {/* Sidebar Header */}
        <div className="p-4 flex flex-col gap-3 border-b border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Image
                src="/logo.png"
                alt="MacNotes"
                width={32}
                height={32}
                className="rounded-lg"
              />
              <span className="font-semibold text-zinc-700 dark:text-zinc-200">MacNotes</span>
            </div>

            <div className="flex items-center gap-1">
              {/* Sync Status */}
              <div className="p-1.5">
                {syncStatus === 'syncing' ? (
                  <RefreshCw size={16} className="animate-spin text-yellow-500" />
                ) : syncStatus === 'synced' ? (
                  <Cloud size={16} className="text-green-500" />
                ) : (
                  <CloudOff size={16} className="text-red-500" />
                )}
              </div>

              <div className="relative">
                <button
                  onClick={() => setShowSettings(!showSettings)}
                  className="p-1.5 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-md transition-colors text-zinc-500"
                >
                  <MoreHorizontal size={20} />
                </button>

                {/* Settings Dropdown */}
                {showSettings && (
                  <div className="absolute right-0 top-full mt-2 w-52 bg-white dark:bg-zinc-800 rounded-lg shadow-xl border border-zinc-200 dark:border-zinc-700 p-1 z-50">
                    {/* User Info */}
                    <div className="px-3 py-2 border-b border-zinc-200 dark:border-zinc-700 mb-1">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                          <User size={16} className="text-white" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-zinc-900 dark:text-white">
                            {session.user?.name}
                          </p>
                          <p className="text-xs text-zinc-500">{session.user?.email}</p>
                        </div>
                      </div>
                    </div>

                    <div className="px-3 py-2 text-xs font-semibold text-zinc-400">Giao diện</div>
                    <button
                      onClick={() => { setTheme('light'); setShowSettings(false); }}
                      className={`w-full text-left px-3 py-2 text-sm rounded-md flex items-center gap-2 ${
                        theme === 'light'
                          ? 'bg-yellow-500/10 text-yellow-600'
                          : 'hover:bg-zinc-100 dark:hover:bg-zinc-700'
                      }`}
                    >
                      <Sun size={14} /> Sáng
                    </button>
                    <button
                      onClick={() => { setTheme('dark'); setShowSettings(false); }}
                      className={`w-full text-left px-3 py-2 text-sm rounded-md flex items-center gap-2 ${
                        theme === 'dark'
                          ? 'bg-yellow-500/10 text-yellow-600'
                          : 'hover:bg-zinc-100 dark:hover:bg-zinc-700'
                      }`}
                    >
                      <Moon size={14} /> Tối
                    </button>
                    <button
                      onClick={() => { setTheme('system'); setShowSettings(false); }}
                      className={`w-full text-left px-3 py-2 text-sm rounded-md flex items-center gap-2 ${
                        theme === 'system'
                          ? 'bg-yellow-500/10 text-yellow-600'
                          : 'hover:bg-zinc-100 dark:hover:bg-zinc-700'
                      }`}
                    >
                      <Laptop size={14} /> Hệ thống
                    </button>

                    <div className="my-1 border-t border-zinc-200 dark:border-zinc-700"></div>
                    <button
                      onClick={() => signOut()}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-red-100 dark:hover:bg-red-900/30 rounded-md flex items-center gap-2 text-red-600 dark:text-red-400"
                    >
                      <LogOut size={14} /> Đăng xuất
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Search */}
          <div className="relative group">
            <Search className="absolute left-2.5 top-2 text-zinc-400" size={16} />
            <input
              type="text"
              placeholder="Tìm kiếm..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-zinc-200/50 dark:bg-zinc-800/50 border-none rounded-lg text-sm focus:ring-2 focus:ring-yellow-500/50 focus:bg-white dark:focus:bg-zinc-800 transition-all outline-none placeholder:text-zinc-500"
            />
          </div>
        </div>

        {/* Folders & Views */}
        <div className="p-3 border-b border-zinc-200 dark:border-zinc-800">
          {/* View Modes */}
          <div className="flex gap-1 mb-3">
            <button
              onClick={() => {
                setViewMode('all');
                setSelectedFolderId(null);
                setSelectedTag(null);
              }}
              className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                viewMode === 'all' && !selectedFolderId && !selectedTag
                  ? 'bg-yellow-500 text-white'
                  : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800'
              }`}
            >
              Tất cả
            </button>
            <button
              onClick={() => {
                setViewMode('archived');
                setSelectedFolderId(null);
                setSelectedTag(null);
              }}
              className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                viewMode === 'archived'
                  ? 'bg-yellow-500 text-white'
                  : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800'
              }`}
            >
              <Archive size={12} className="inline mr-1" />
              Lưu trữ
            </button>
            <button
              onClick={() => {
                setViewMode('trash');
                setSelectedFolderId(null);
                setSelectedTag(null);
              }}
              className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                viewMode === 'trash'
                  ? 'bg-yellow-500 text-white'
                  : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800'
              }`}
            >
              <Trash size={12} className="inline mr-1" />
              Thùng rác
            </button>
          </div>

          {/* Folders */}
          <div className="space-y-1">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-semibold text-zinc-400 uppercase">Thư mục</span>
              <button
                onClick={() => setShowFolderModal(true)}
                className="p-1 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded transition-colors text-zinc-500"
              >
                <FolderPlus size={14} />
              </button>
            </div>
            {folders.map((folder) => (
              <button
                key={folder._id}
                onClick={() => {
                  setSelectedFolderId(selectedFolderId === folder._id ? null : folder._id);
                  setSelectedTag(null);
                  setViewMode('all');
                }}
                className={`w-full text-left px-2 py-1.5 text-sm rounded-lg flex items-center gap-2 transition-colors ${
                  selectedFolderId === folder._id
                    ? 'bg-yellow-500/10 text-yellow-600'
                    : 'hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300'
                }`}
              >
                <Folder size={14} style={{ color: folder.color }} />
                {folder.name}
              </button>
            ))}
          </div>

          {/* Tags */}
          {tags.length > 0 && (
            <div className="mt-3 space-y-1">
              <span className="text-xs font-semibold text-zinc-400 uppercase">Tags</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {tags.slice(0, 10).map((tag) => (
                  <button
                    key={tag.name}
                    onClick={() => {
                      setSelectedTag(selectedTag === tag.name ? null : tag.name);
                      setSelectedFolderId(null);
                      setViewMode('all');
                    }}
                    className={`px-2 py-0.5 text-xs rounded-full transition-colors ${
                      selectedTag === tag.name
                        ? 'bg-yellow-500 text-white'
                        : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-300 dark:hover:bg-zinc-700'
                    }`}
                  >
                    #{tag.name} ({tag.count})
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Note List */}
        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1 scrollbar-hide">
          {notes.length === 0 ? (
            <div className="text-center mt-10 text-zinc-400 text-sm">
              {viewMode === 'trash'
                ? 'Thùng rác trống.'
                : viewMode === 'archived'
                ? 'Không có ghi chú lưu trữ.'
                : 'Chưa có ghi chú nào.'}
            </div>
          ) : (
            notes.map((note) => (
              <div
                key={note._id}
                onClick={() => {
                  setActiveNoteId(note._id);
                  if (window.innerWidth < 768) setIsSidebarOpen(false);
                }}
                className={`group relative p-3 rounded-lg cursor-pointer transition-all duration-200 select-none
                  ${
                    activeNoteId === note._id
                      ? 'bg-yellow-500 text-white shadow-md'
                      : 'hover:bg-zinc-200/50 dark:hover:bg-zinc-800/50 bg-white dark:bg-zinc-900/50'
                  }
                `}
              >
                <div className="flex items-center gap-2 mb-1">
                  {note.isPinned && (
                    <Pin
                      size={12}
                      className={activeNoteId === note._id ? 'text-white' : 'text-yellow-500'}
                    />
                  )}
                  <h3
                    className={`font-bold text-sm truncate flex-1 ${
                      activeNoteId === note._id ? 'text-white' : 'text-zinc-900 dark:text-zinc-100'
                    }`}
                  >
                    {note.title || 'Ghi chú chưa đặt tên'}
                  </h3>
                </div>
                <div className="flex items-baseline gap-2">
                  <span
                    className={`text-xs whitespace-nowrap ${
                      activeNoteId === note._id ? 'text-yellow-100' : 'text-zinc-400'
                    }`}
                  >
                    {formatDate(note.updatedAt)}
                  </span>
                  <p
                    className={`text-xs truncate flex-1 ${
                      activeNoteId === note._id ? 'text-yellow-50' : 'text-zinc-500'
                    }`}
                  >
                    {note.body?.replace(/<[^>]*>/g, '') || 'Không có nội dung thêm'}
                  </p>
                </div>

                {/* Note Actions */}
                <div
                  className={`absolute right-2 top-1/2 -translate-y-1/2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity`}
                >
                  {viewMode === 'trash' ? (
                    <>
                      <button
                        onClick={(e) => handleRestoreNote(e, note._id)}
                        className="p-1.5 rounded-full text-green-500 hover:bg-zinc-300 dark:hover:bg-zinc-700"
                        title="Khôi phục"
                      >
                        <ArchiveRestore size={14} />
                      </button>
                      <button
                        onClick={(e) => handleDeleteNote(e, note._id, true)}
                        className="p-1.5 rounded-full text-red-500 hover:bg-zinc-300 dark:hover:bg-zinc-700"
                        title="Xóa vĩnh viễn"
                      >
                        <Trash2 size={14} />
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={(e) => handleTogglePin(e, note._id)}
                        className={`p-1.5 rounded-full hover:bg-zinc-300 dark:hover:bg-zinc-700 ${
                          activeNoteId === note._id ? 'text-white' : 'text-yellow-500'
                        }`}
                        title={note.isPinned ? 'Bỏ ghim' : 'Ghim'}
                      >
                        {note.isPinned ? <PinOff size={14} /> : <Pin size={14} />}
                      </button>
                      {!note.isArchived && (
                        <button
                          onClick={(e) => handleArchiveNote(e, note._id)}
                          className={`p-1.5 rounded-full hover:bg-zinc-300 dark:hover:bg-zinc-700 ${
                            activeNoteId === note._id ? 'text-white' : 'text-zinc-500'
                          }`}
                          title="Lưu trữ"
                        >
                          <Archive size={14} />
                        </button>
                      )}
                      <button
                        onClick={(e) => handleDeleteNote(e, note._id)}
                        className={`p-1.5 rounded-full hover:bg-zinc-300 dark:hover:bg-zinc-700 ${
                          activeNoteId === note._id ? 'text-white' : 'text-red-500'
                        }`}
                        title="Xóa"
                      >
                        <Trash2 size={14} />
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Main Editor Area */}
      <div className="flex-1 flex flex-col h-full bg-white dark:bg-zinc-950 transition-all duration-300 relative z-10">
        {activeNote ? (
          <>
            {/* Mobile Header */}
            <div className="md:hidden flex items-center p-4 border-b border-zinc-100 dark:border-zinc-900">
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="flex items-center text-yellow-500 font-medium"
              >
                <ChevronLeft size={24} />
                <span className="text-sm">Danh sách</span>
              </button>
              <div className="flex-1 text-center text-xs text-zinc-400">
                Đã chỉnh sửa {formatDate(activeNote.updatedAt)}
              </div>
              <div className="w-8"></div>
            </div>

            {/* Desktop Status Bar */}
            <div className="hidden md:flex justify-center pt-4 pb-2 text-xs text-zinc-400 select-none">
              Đã chỉnh sửa {formatDate(activeNote.updatedAt)}
            </div>

            {/* Editor */}
            <div className="flex-1 overflow-y-auto px-6 md:px-12 py-4 md:py-8 max-w-4xl mx-auto w-full">
              {/* Title Input */}
              <input
                type="text"
                value={activeNote.title}
                onChange={(e) => handleUpdateNote('title', e.target.value)}
                placeholder="Tiêu đề"
                className="w-full bg-transparent text-2xl md:text-3xl font-bold border-none outline-none placeholder:text-zinc-300 dark:placeholder:text-zinc-700 mb-4 text-zinc-900 dark:text-zinc-100"
              />

              {/* Tags */}
              <div className="flex flex-wrap items-center gap-2 mb-4">
                {activeNote.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-2 py-0.5 bg-yellow-500/10 text-yellow-600 text-xs rounded-full"
                  >
                    <Tag size={10} />
                    {tag}
                    <button
                      onClick={() => handleRemoveTag(tag)}
                      className="hover:text-red-500 transition-colors"
                    >
                      <X size={10} />
                    </button>
                  </span>
                ))}
                {showTagInput ? (
                  <div className="inline-flex items-center gap-1">
                    <input
                      type="text"
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAddTag()}
                      placeholder="Nhập tag..."
                      className="w-24 px-2 py-0.5 text-xs bg-zinc-100 dark:bg-zinc-800 rounded-full outline-none focus:ring-1 focus:ring-yellow-500"
                      autoFocus
                    />
                    <button
                      onClick={handleAddTag}
                      className="p-0.5 text-green-500 hover:bg-green-100 dark:hover:bg-green-900/30 rounded-full"
                    >
                      <Check size={12} />
                    </button>
                    <button
                      onClick={() => {
                        setShowTagInput(false);
                        setNewTag('');
                      }}
                      className="p-0.5 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-full"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowTagInput(true)}
                    className="text-xs text-zinc-400 hover:text-yellow-500 transition-colors"
                  >
                    + Thêm tag
                  </button>
                )}
              </div>

              {/* Rich Text Editor */}
              <RichTextEditor
                content={activeNote.body}
                onChange={(content) => handleUpdateNote('body', content)}
              />
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-zinc-300 dark:text-zinc-700 select-none p-6 text-center">
            <Edit3 size={64} className="mb-4 opacity-50" />
            <p className="text-lg font-medium">Chọn một ghi chú để xem</p>
            <p className="text-sm mt-2 max-w-xs">Hoặc bấm nút tạo mới bên dưới để bắt đầu viết.</p>
          </div>
        )}

        {/* FAB */}
        {viewMode === 'all' && (
          <div className="absolute bottom-6 right-6 md:bottom-8 md:right-8">
            <button
              onClick={handleAddNote}
              className="flex items-center justify-center w-14 h-14 bg-yellow-500 hover:bg-yellow-400 text-white rounded-full shadow-lg hover:shadow-xl transition-all active:scale-95"
            >
              <Plus size={28} />
            </button>
          </div>
        )}
      </div>

      {/* Create Folder Modal */}
      {showFolderModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-zinc-800 rounded-xl p-6 w-80 shadow-2xl">
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-4">Tạo thư mục</h3>
            <input
              type="text"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreateFolder()}
              placeholder="Tên thư mục..."
              className="w-full px-3 py-2 bg-zinc-100 dark:bg-zinc-700 rounded-lg outline-none focus:ring-2 focus:ring-yellow-500 text-zinc-900 dark:text-white"
              autoFocus
            />
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => {
                  setShowFolderModal(false);
                  setNewFolderName('');
                }}
                className="flex-1 py-2 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded-lg transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={handleCreateFolder}
                className="flex-1 py-2 bg-yellow-500 hover:bg-yellow-400 text-white rounded-lg transition-colors"
              >
                Tạo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
