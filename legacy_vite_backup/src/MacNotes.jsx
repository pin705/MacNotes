import React, { useState, useEffect, useRef } from 'react';
import {
    Plus,
    Trash2,
    Search,
    ChevronLeft,
    Download,
    Upload,
    MoreHorizontal,
    Edit3,
    Moon,
    Sun,
    Laptop
} from 'lucide-react';

const MacNotes = () => {
    // State
    const [notes, setNotes] = useState(() => {
        const saved = localStorage.getItem('macnotes-data');
        return saved ? JSON.parse(saved) : [
            {
                id: 'welcome-note',
                title: 'Chào mừng đến với MacNotes',
                body: 'Đây là ứng dụng ghi chú lấy cảm hứng từ Apple Notes.\n\nTính năng nổi bật:\n- Giao diện tối giản, sang trọng.\n- Tự động lưu vào trình duyệt.\n- Hỗ trợ Dark Mode.\n- Xuất/Nhập dữ liệu để đồng bộ giữa các máy.\n\nHãy thử tạo một ghi chú mới nhé!',
                updatedAt: new Date().toISOString()
            }
        ];
    });

    const [activeNoteId, setActiveNoteId] = useState(notes.length > 0 ? notes[0].id : null);
    const [searchQuery, setSearchQuery] = useState('');
    const [isSidebarOpen, setIsSidebarOpen] = useState(true); // For mobile view logic
    const [theme, setTheme] = useState('system'); // light, dark, system
    const [showSettings, setShowSettings] = useState(false);
    const fileInputRef = useRef(null);

    // Derived state
    const activeNote = notes.find(n => n.id === activeNoteId);

    const filteredNotes = notes.filter(note => {
        const query = searchQuery.toLowerCase();
        return (
            note.title.toLowerCase().includes(query) ||
            note.body.toLowerCase().includes(query)
        );
    }).sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

    // Effects
    useEffect(() => {
        localStorage.setItem('macnotes-data', JSON.stringify(notes));
    }, [notes]);

    useEffect(() => {
        // Handle responsive sidebar behavior
        const handleResize = () => {
            if (window.innerWidth < 768) {
                if (activeNoteId) setIsSidebarOpen(false);
                else setIsSidebarOpen(true);
            } else {
                setIsSidebarOpen(true);
            }
        };

        window.addEventListener('resize', handleResize);
        handleResize(); // Initial check

        return () => window.removeEventListener('resize', handleResize);
    }, [activeNoteId]);

    useEffect(() => {
        const root = window.document.documentElement;
        root.classList.remove('light', 'dark');

        if (theme === 'system') {
            const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
            root.classList.add(systemTheme);
        } else {
            root.classList.add(theme);
        }
    }, [theme]);

    // Handlers
    const handleAddNote = () => {
        const newId = Date.now().toString();
        const newNote = {
            id: newId,
            title: 'Ghi chú mới',
            body: '',
            updatedAt: new Date().toISOString()
        };
        setNotes([newNote, ...notes]);
        setActiveNoteId(newId);
        if (window.innerWidth < 768) setIsSidebarOpen(false);
        setSearchQuery(''); // Clear search to show new note
    };

    const handleDeleteNote = (e, id) => {
        e.stopPropagation();
        const newNotes = notes.filter(n => n.id !== id);
        setNotes(newNotes);
        if (activeNoteId === id) {
            setActiveNoteId(null);
            if (window.innerWidth < 768) setIsSidebarOpen(true);
        }
    };

    const handleUpdateNote = (field, value) => {
        if (!activeNote) return;
        const updatedNotes = notes.map(note => {
            if (note.id === activeNoteId) {
                return { ...note, [field]: value, updatedAt: new Date().toISOString() };
            }
            return note;
        });
        setNotes(updatedNotes);
    };

    const handleExport = () => {
        const dataStr = JSON.stringify(notes, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `macnotes_backup_${new Date().toLocaleDateString('vi-VN').replace(/\//g, '-')}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setShowSettings(false);
    };

    const handleImport = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const importedNotes = JSON.parse(event.target.result);
                if (Array.isArray(importedNotes)) {
                    if (confirm('Hành động này sẽ ghi đè ghi chú hiện tại. Bạn có chắc chắn không?')) {
                        setNotes(importedNotes);
                        setActiveNoteId(null);
                        setIsSidebarOpen(true);
                        alert('Nhập dữ liệu thành công!');
                    }
                } else {
                    alert('File không hợp lệ.');
                }
            } catch (err) {
                alert('Lỗi khi đọc file.');
            }
        };
        reader.readAsText(file);
        setShowSettings(false);
    };

    const formatDate = (isoString) => {
        const date = new Date(isoString);
        const now = new Date();
        const isToday = date.toDateString() === now.toDateString();

        if (isToday) {
            return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
        }
        return date.toLocaleDateString('vi-VN', { day: 'numeric', month: 'numeric', year: '2-digit' });
    };

    return (
        <div className={`flex h-screen w-full bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-sans overflow-hidden transition-colors duration-200`}>

            {/* Sidebar - Note List */}
            <div
                className={`${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'} 
        absolute md:relative z-20 w-full md:w-80 h-full flex flex-col 
        bg-zinc-50/95 dark:bg-zinc-900/95 backdrop-blur-xl border-r border-zinc-200 dark:border-zinc-800 transition-transform duration-300 ease-in-out`}
            >
                {/* Sidebar Header */}
                <div className="p-4 flex flex-col gap-3 border-b border-zinc-200 dark:border-zinc-800">
                    <div className="flex items-center justify-between">
                        <h1 className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">All Notes</h1>
                        <div className="relative">
                            <button
                                onClick={() => setShowSettings(!showSettings)}
                                className="p-1.5 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-md transition-colors text-zinc-500"
                            >
                                <MoreHorizontal size={20} />
                            </button>

                            {/* Settings Dropdown */}
                            {showSettings && (
                                <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-zinc-800 rounded-lg shadow-xl border border-zinc-200 dark:border-zinc-700 p-1 z-50">
                                    <div className="px-3 py-2 text-xs font-semibold text-zinc-400">Giao diện</div>
                                    <button onClick={() => setTheme('light')} className={`w-full text-left px-3 py-2 text-sm rounded-md flex items-center gap-2 ${theme === 'light' ? 'bg-yellow-500/10 text-yellow-600' : 'hover:bg-zinc-100 dark:hover:bg-zinc-700'}`}>
                                        <Sun size={14} /> Sáng
                                    </button>
                                    <button onClick={() => setTheme('dark')} className={`w-full text-left px-3 py-2 text-sm rounded-md flex items-center gap-2 ${theme === 'dark' ? 'bg-yellow-500/10 text-yellow-600' : 'hover:bg-zinc-100 dark:hover:bg-zinc-700'}`}>
                                        <Moon size={14} /> Tối
                                    </button>
                                    <button onClick={() => setTheme('system')} className={`w-full text-left px-3 py-2 text-sm rounded-md flex items-center gap-2 ${theme === 'system' ? 'bg-yellow-500/10 text-yellow-600' : 'hover:bg-zinc-100 dark:hover:bg-zinc-700'}`}>
                                        <Laptop size={14} /> Hệ thống
                                    </button>

                                    <div className="my-1 border-t border-zinc-200 dark:border-zinc-700"></div>
                                    <div className="px-3 py-2 text-xs font-semibold text-zinc-400">Dữ liệu</div>

                                    <button onClick={handleExport} className="w-full text-left px-3 py-2 text-sm hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded-md flex items-center gap-2">
                                        <Download size={14} /> Xuất JSON
                                    </button>
                                    <button onClick={() => fileInputRef.current.click()} className="w-full text-left px-3 py-2 text-sm hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded-md flex items-center gap-2">
                                        <Upload size={14} /> Nhập JSON
                                    </button>
                                    <input type="file" ref={fileInputRef} onChange={handleImport} className="hidden" accept=".json" />
                                </div>
                            )}
                        </div>
                    </div>

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

                {/* Note List */}
                <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1 scrollbar-hide">
                    {filteredNotes.length === 0 ? (
                        <div className="text-center mt-10 text-zinc-400 text-sm">
                            Không tìm thấy ghi chú nào.
                        </div>
                    ) : (
                        filteredNotes.map(note => (
                            <div
                                key={note.id}
                                onClick={() => {
                                    setActiveNoteId(note.id);
                                    if (window.innerWidth < 768) setIsSidebarOpen(false);
                                }}
                                className={`group relative p-3 rounded-lg cursor-pointer transition-all duration-200 select-none
                  ${activeNoteId === note.id
                                        ? 'bg-yellow-500 text-white shadow-md'
                                        : 'hover:bg-zinc-200/50 dark:hover:bg-zinc-800/50 bg-white dark:bg-zinc-900/50'
                                    }
                `}
                            >
                                <h3 className={`font-bold text-sm mb-1 truncate ${activeNoteId === note.id ? 'text-white' : 'text-zinc-900 dark:text-zinc-100'}`}>
                                    {note.title || 'Ghi chú chưa đặt tên'}
                                </h3>
                                <div className="flex items-baseline gap-2">
                                    <span className={`text-xs whitespace-nowrap ${activeNoteId === note.id ? 'text-yellow-100' : 'text-zinc-400'}`}>
                                        {formatDate(note.updatedAt)}
                                    </span>
                                    <p className={`text-xs truncate flex-1 ${activeNoteId === note.id ? 'text-yellow-50' : 'text-zinc-500'}`}>
                                        {note.body || 'Không có nội dung thêm'}
                                    </p>
                                </div>

                                {/* Delete Button (Hover only on Desktop) */}
                                <button
                                    onClick={(e) => handleDeleteNote(e, note.id)}
                                    className={`absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity
                    ${activeNoteId === note.id ? 'text-white hover:bg-yellow-600' : 'text-red-500 hover:bg-zinc-300 dark:hover:bg-zinc-700'}
                  `}
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Main Editor Area */}
            <div className={`flex-1 flex flex-col h-full bg-white dark:bg-zinc-950 transition-all duration-300 relative z-10`}>
                {activeNote ? (
                    <>
                        {/* Mobile Header for Editor */}
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
                            <div className="w-8"></div> {/* Spacer */}
                        </div>

                        {/* Desktop Status Bar (Optional visually, using updated date at top) */}
                        <div className="hidden md:flex justify-center pt-4 pb-2 text-xs text-zinc-400 select-none">
                            Đã chỉnh sửa {formatDate(activeNote.updatedAt)}
                        </div>

                        {/* Editor Inputs */}
                        <div className="flex-1 overflow-y-auto px-6 md:px-12 py-4 md:py-8 max-w-4xl mx-auto w-full">
                            <input
                                type="text"
                                value={activeNote.title}
                                onChange={(e) => handleUpdateNote('title', e.target.value)}
                                placeholder="Tiêu đề"
                                className="w-full bg-transparent text-2xl md:text-3xl font-bold border-none outline-none placeholder:text-zinc-300 dark:placeholder:text-zinc-700 mb-4 text-zinc-900 dark:text-zinc-100"
                            />
                            <textarea
                                value={activeNote.body}
                                onChange={(e) => handleUpdateNote('body', e.target.value)}
                                placeholder="Viết nội dung ghi chú tại đây..."
                                className="w-full h-[calc(100%-80px)] bg-transparent resize-none border-none outline-none text-base md:text-lg leading-relaxed text-zinc-700 dark:text-zinc-300 placeholder:text-zinc-300 dark:placeholder:text-zinc-700"
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

                {/* Floating Action Button (Create Note) */}
                <div className="absolute bottom-6 right-6 md:bottom-8 md:right-8">
                    <button
                        onClick={handleAddNote}
                        className="flex items-center justify-center w-14 h-14 bg-yellow-500 hover:bg-yellow-400 text-white rounded-full shadow-lg hover:shadow-xl transition-all active:scale-95"
                    >
                        <Plus size={28} />
                    </button>
                </div>
            </div>

        </div>
    );
};

export default MacNotes;
