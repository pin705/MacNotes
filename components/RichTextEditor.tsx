'use client';

import { useEditor, EditorContent, Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Underline from '@tiptap/extension-underline';
import Highlight from '@tiptap/extension-highlight';
import React, { useEffect } from 'react';
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Highlighter,
  List,
  ListOrdered,
  Heading1,
  Heading2,
  Quote,
  Code,
  Undo,
  Redo,
} from 'lucide-react';

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
}

const MenuButton = ({
  onClick,
  isActive,
  children,
}: {
  onClick: () => void;
  isActive: boolean;
  children: React.ReactNode;
}) => (
  <button
    onClick={onClick}
    className={`p-1.5 rounded transition-colors ${
      isActive
        ? 'bg-yellow-500 text-white'
        : 'text-zinc-500 hover:bg-zinc-200 dark:hover:bg-zinc-700'
    }`}
  >
    {children}
  </button>
);

const MenuBar = ({ editor }: { editor: Editor | null }) => {
  if (!editor) return null;

  return (
    <div className="flex flex-wrap gap-1 p-2 border-b border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 rounded-t-lg">
      <MenuButton
        onClick={() => editor.chain().focus().toggleBold().run()}
        isActive={editor.isActive('bold')}
      >
        <Bold size={16} />
      </MenuButton>
      <MenuButton
        onClick={() => editor.chain().focus().toggleItalic().run()}
        isActive={editor.isActive('italic')}
      >
        <Italic size={16} />
      </MenuButton>
      <MenuButton
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        isActive={editor.isActive('underline')}
      >
        <UnderlineIcon size={16} />
      </MenuButton>
      <MenuButton
        onClick={() => editor.chain().focus().toggleStrike().run()}
        isActive={editor.isActive('strike')}
      >
        <Strikethrough size={16} />
      </MenuButton>
      <MenuButton
        onClick={() => editor.chain().focus().toggleHighlight().run()}
        isActive={editor.isActive('highlight')}
      >
        <Highlighter size={16} />
      </MenuButton>

      <div className="w-px h-6 bg-zinc-300 dark:bg-zinc-600 mx-1" />

      <MenuButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        isActive={editor.isActive('heading', { level: 1 })}
      >
        <Heading1 size={16} />
      </MenuButton>
      <MenuButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        isActive={editor.isActive('heading', { level: 2 })}
      >
        <Heading2 size={16} />
      </MenuButton>

      <div className="w-px h-6 bg-zinc-300 dark:bg-zinc-600 mx-1" />

      <MenuButton
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        isActive={editor.isActive('bulletList')}
      >
        <List size={16} />
      </MenuButton>
      <MenuButton
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        isActive={editor.isActive('orderedList')}
      >
        <ListOrdered size={16} />
      </MenuButton>

      <div className="w-px h-6 bg-zinc-300 dark:bg-zinc-600 mx-1" />

      <MenuButton
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        isActive={editor.isActive('blockquote')}
      >
        <Quote size={16} />
      </MenuButton>
      <MenuButton
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        isActive={editor.isActive('codeBlock')}
      >
        <Code size={16} />
      </MenuButton>

      <div className="w-px h-6 bg-zinc-300 dark:bg-zinc-600 mx-1" />

      <MenuButton
        onClick={() => editor.chain().focus().undo().run()}
        isActive={false}
      >
        <Undo size={16} />
      </MenuButton>
      <MenuButton
        onClick={() => editor.chain().focus().redo().run()}
        isActive={false}
      >
        <Redo size={16} />
      </MenuButton>
    </div>
  );
};

export default function RichTextEditor({
  content,
  onChange,
  placeholder = 'Viết nội dung ghi chú tại đây...',
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Placeholder.configure({
        placeholder,
      }),
      Underline,
      Highlight.configure({
        multicolor: false,
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class:
          'prose prose-sm sm:prose dark:prose-invert max-w-none min-h-[300px] p-4 focus:outline-none',
      },
    },
  });

  // Update content when prop changes (e.g., switching notes)
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  return (
    <div className="border border-zinc-200 dark:border-zinc-700 rounded-lg overflow-hidden bg-white dark:bg-zinc-900">
      <MenuBar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
}
