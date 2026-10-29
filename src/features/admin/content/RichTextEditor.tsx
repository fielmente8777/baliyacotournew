'use client';

/**
 * A word-processor style editor for long website text (the Terms page):
 * click Bold, Heading, Bullets and so on, and see the result while typing.
 * Stores HTML behind the scenes, so the website renders it exactly as before;
 * nobody has to write HTML.
 */

import { useEffect } from 'react';
import { EditorContent, useEditor, type Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import {
  Bold,
  Heading2,
  Heading3,
  Italic,
  Link2,
  List,
  ListOrdered,
  Pilcrow,
  Quote,
  Redo2,
  RemoveFormatting,
  Underline as UnderlineIcon,
  Undo2,
  Unlink,
} from 'lucide-react';

import { cn } from '@/lib/format';

function ToolButton({
  label,
  onClick,
  active,
  disabled,
  children,
}: {
  label: string;
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      aria-pressed={active}
      disabled={disabled}
      /* Keep the text selection while clicking a tool. */
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className={cn(
        'flex size-8 items-center justify-center rounded-md transition disabled:opacity-30',
        active ? 'bg-secondary text-white' : 'text-[#444] hover:bg-[#f1ece4]'
      )}
    >
      {children}
    </button>
  );
}

function Toolbar({ editor }: { editor: Editor }) {
  const setLink = () => {
    const previous = editor.getAttributes('link').href as string | undefined;
    const url = window.prompt('Link address (a page like /products, or a full https:// address)', previous ?? '');
    if (url === null) return;
    if (!url.trim()) return void editor.chain().focus().unsetLink().run();
    editor.chain().focus().extendMarkRange('link').setLink({ href: url.trim() }).run();
  };

  const divider = <span aria-hidden className="mx-1 h-5 w-px bg-[#e6e0d6]" />;

  return (
    <div className="sticky top-0 z-10 flex flex-wrap items-center gap-0.5 border-b border-[#e6e0d6] bg-[#faf8f4] p-1.5">
      <ToolButton label="Normal text" active={editor.isActive('paragraph')} onClick={() => editor.chain().focus().setParagraph().run()}>
        <Pilcrow className="size-4" />
      </ToolButton>
      <ToolButton label="Heading" active={editor.isActive('heading', { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
        <Heading2 className="size-4" />
      </ToolButton>
      <ToolButton label="Sub-heading" active={editor.isActive('heading', { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>
        <Heading3 className="size-4" />
      </ToolButton>
      {divider}
      <ToolButton label="Bold" active={editor.isActive('bold')} onClick={() => editor.chain().focus().toggleBold().run()}>
        <Bold className="size-4" />
      </ToolButton>
      <ToolButton label="Italic" active={editor.isActive('italic')} onClick={() => editor.chain().focus().toggleItalic().run()}>
        <Italic className="size-4" />
      </ToolButton>
      <ToolButton label="Underline" active={editor.isActive('underline')} onClick={() => editor.chain().focus().toggleUnderline().run()}>
        <UnderlineIcon className="size-4" />
      </ToolButton>
      {divider}
      <ToolButton label="Bullet list" active={editor.isActive('bulletList')} onClick={() => editor.chain().focus().toggleBulletList().run()}>
        <List className="size-4" />
      </ToolButton>
      <ToolButton label="Numbered list" active={editor.isActive('orderedList')} onClick={() => editor.chain().focus().toggleOrderedList().run()}>
        <ListOrdered className="size-4" />
      </ToolButton>
      <ToolButton label="Quote" active={editor.isActive('blockquote')} onClick={() => editor.chain().focus().toggleBlockquote().run()}>
        <Quote className="size-4" />
      </ToolButton>
      {divider}
      <ToolButton label="Add or edit link" active={editor.isActive('link')} onClick={setLink}>
        <Link2 className="size-4" />
      </ToolButton>
      <ToolButton label="Remove link" disabled={!editor.isActive('link')} onClick={() => editor.chain().focus().unsetLink().run()}>
        <Unlink className="size-4" />
      </ToolButton>
      <ToolButton label="Clear formatting" onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()}>
        <RemoveFormatting className="size-4" />
      </ToolButton>
      {divider}
      <ToolButton label="Undo" disabled={!editor.can().undo()} onClick={() => editor.chain().focus().undo().run()}>
        <Undo2 className="size-4" />
      </ToolButton>
      <ToolButton label="Redo" disabled={!editor.can().redo()} onClick={() => editor.chain().focus().redo().run()}>
        <Redo2 className="size-4" />
      </ToolButton>
    </div>
  );
}

export default function RichTextEditor({
  value,
  onChange,
  placeholder = 'Start typing…',
}: {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
}) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link.configure({ openOnClick: false, autolink: true }),
      Placeholder.configure({ placeholder }),
    ],
    content: value,
    /* Rendered in the browser only — avoids a server/client mismatch. */
    immediatelyRender: false,
    onUpdate: ({ editor: e }) => onChange(e.getHTML()),
    editorProps: {
      attributes: {
        /* Same look as the live Terms page (.terms-content in style.scss). */
        class: 'terms-content min-h-[50vh] px-5 py-4 outline-none [&_a]:text-secondary [&_a]:underline [&_blockquote]:border-l-4 [&_blockquote]:border-[#e6e0d6] [&_blockquote]:pl-4 [&_ol]:list-decimal [&_ul]:list-disc',
      },
    },
  });

  /* Text replaced from outside (e.g. "Use this" from the AI writer). */
  useEffect(() => {
    if (editor && value !== editor.getHTML()) editor.commands.setContent(value, false);
  }, [editor, value]);

  return (
    <div className="overflow-hidden rounded-md border border-[#d8d2c8] bg-white focus-within:border-secondary focus-within:ring-2 focus-within:ring-secondary/15">
      {editor ? <Toolbar editor={editor} /> : <div className="h-11 border-b border-[#e6e0d6] bg-[#faf8f4]" />}
      <div className="max-h-[70vh] overflow-y-auto">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
