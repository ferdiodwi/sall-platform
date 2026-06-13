'use client'

import React, { useRef } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { Image } from '@tiptap/extension-image'
import { Table } from '@tiptap/extension-table'
import { TableRow } from '@tiptap/extension-table'
import { TableCell } from '@tiptap/extension-table'
import { TableHeader } from '@tiptap/extension-table'
import { Youtube } from '@tiptap/extension-youtube'
import { createClient } from '@/lib/supabase/client'
import { 
  Bold, 
  Italic, 
  Heading1, 
  Heading2, 
  Heading3, 
  List, 
  ListOrdered, 
  Image as ImageIcon, 
  Video, 
  Table as TableIcon,
  Undo,
  Redo,
  UploadCloud
} from 'lucide-react'

interface WysiwygEditorProps {
  content: string
  onChange: (html: string) => void
}

export function WysiwygEditor({ content, onChange }: WysiwygEditorProps) {
  const supabase = createClient()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const editor = useEditor({
    extensions: [
      StarterKit,
      Image.configure({
        inline: false,
        HTMLAttributes: {
          class: 'max-w-full h-auto rounded-2xl my-4 mx-auto border border-rose-100 shadow-md',
        },
      }),
      Table.configure({
        resizable: true,
        HTMLAttributes: {
          class: 'min-w-full border-collapse my-6 border border-rose-200 text-sm text-gray-700 rounded-xl overflow-hidden',
        },
      }),
      TableRow,
      TableHeader,
      TableCell.configure({
        HTMLAttributes: {
          class: 'border border-rose-100 p-3 bg-white/50 align-top',
        },
      }),
      Youtube.configure({
        controls: true,
        nocookie: true,
        HTMLAttributes: {
          class: 'aspect-video w-full max-w-2xl mx-auto my-6 rounded-2xl overflow-hidden shadow-lg border border-rose-100',
        },
      }),
    ],
    content: content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
  })

  if (!editor) {
    return (
      <div className="h-64 border border-rose-100 rounded-2xl bg-rose-50/10 flex items-center justify-center text-gray-400 text-sm animate-pulse">
        Memuat Editor Tiptap...
      </div>
    )
  }

  // Handle Image Upload to Supabase Storage
  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`
      const filePath = `modules/${fileName}`

      // Upload file to bucket 'module-images'
      let { error: uploadError } = await supabase.storage
        .from('module-images')
        .upload(filePath, file)

      // Fallback create bucket jika belum ada
      if (uploadError && uploadError.message.includes('Object not found')) {
        await supabase.storage.createBucket('module-images', { public: true })
        const { error: retryError } = await supabase.storage
          .from('module-images')
          .upload(filePath, file)
        uploadError = retryError
      }

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('module-images')
        .getPublicUrl(filePath)

      editor.chain().focus().setImage({ src: publicUrl }).run()
    } catch (err) {
      console.error('Error uploading image to storage:', err)
      alert('Gagal mengunggah gambar. Silakan coba lagi.')
    }
  }

  const addYoutubeVideo = () => {
    const url = prompt('Masukkan URL video YouTube:')
    if (url) {
      editor.chain().focus().setYoutubeVideo({ src: url }).run()
    }
  }

  const addTable = () => {
    editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
  }

  return (
    <div className="border border-rose-100 rounded-3xl overflow-hidden bg-white shadow-sm flex flex-col min-h-[400px]">
      {/* Editor Toolbar */}
      <div className="bg-rose-50/40 p-3 border-b border-rose-100 flex flex-wrap gap-1.5 items-center">
        {/* Headings */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={`p-2 rounded-xl text-gray-600 hover:bg-rose-50 hover:text-rose-600 transition-colors ${
            editor.isActive('heading', { level: 1 }) ? 'bg-rose-100/60 text-rose-600 font-bold' : ''
          }`}
          title="Heading 1"
        >
          <Heading1 size={16} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`p-2 rounded-xl text-gray-600 hover:bg-rose-50 hover:text-rose-600 transition-colors ${
            editor.isActive('heading', { level: 2 }) ? 'bg-rose-100/60 text-rose-600 font-bold' : ''
          }`}
          title="Heading 2"
        >
          <Heading2 size={16} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={`p-2 rounded-xl text-gray-600 hover:bg-rose-50 hover:text-rose-600 transition-colors ${
            editor.isActive('heading', { level: 3 }) ? 'bg-rose-100/60 text-rose-600 font-bold' : ''
          }`}
          title="Heading 3"
        >
          <Heading3 size={16} />
        </button>

        <span className="w-px h-6 bg-rose-200/50 mx-1" />

        {/* Text Formats */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-2 rounded-xl text-gray-600 hover:bg-rose-50 hover:text-rose-600 transition-colors ${
            editor.isActive('bold') ? 'bg-rose-100/60 text-rose-600 font-bold' : ''
          }`}
          title="Tebal (Bold)"
        >
          <Bold size={16} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-2 rounded-xl text-gray-600 hover:bg-rose-50 hover:text-rose-600 transition-colors ${
            editor.isActive('italic') ? 'bg-rose-100/60 text-rose-600 font-bold' : ''
          }`}
          title="Miring (Italic)"
        >
          <Italic size={16} />
        </button>

        <span className="w-px h-6 bg-rose-200/50 mx-1" />

        {/* Lists */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`p-2 rounded-xl text-gray-600 hover:bg-rose-50 hover:text-rose-600 transition-colors ${
            editor.isActive('bulletList') ? 'bg-rose-100/60 text-rose-600 font-bold' : ''
          }`}
          title="Daftar Bullet"
        >
          <List size={16} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`p-2 rounded-xl text-gray-600 hover:bg-rose-50 hover:text-rose-600 transition-colors ${
            editor.isActive('orderedList') ? 'bg-rose-100/60 text-rose-600 font-bold' : ''
          }`}
          title="Daftar Angka"
        >
          <ListOrdered size={16} />
        </button>

        <span className="w-px h-6 bg-rose-200/50 mx-1" />

        {/* Tables, Images & Videos */}
        <button
          type="button"
          onClick={addTable}
          className="p-2 rounded-xl text-gray-600 hover:bg-rose-50 hover:text-rose-600 transition-colors"
          title="Tambah Tabel"
        >
          <TableIcon size={16} />
        </button>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="p-2 rounded-xl text-gray-600 hover:bg-rose-50 hover:text-rose-600 transition-colors"
          title="Unggah Gambar"
        >
          <UploadCloud size={16} />
        </button>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleImageUpload}
          accept="image/*"
          className="hidden"
        />
        <button
          type="button"
          onClick={addYoutubeVideo}
          className="p-2 rounded-xl text-gray-600 hover:bg-rose-50 hover:text-rose-600 transition-colors"
          title="Embed YouTube Video"
        >
          <Video size={16} />
        </button>

        <span className="w-px h-6 bg-rose-200/50 mx-1" />

        {/* History */}
        <button
          type="button"
          onClick={() => editor.chain().focus().undo().run()}
          className="p-2 rounded-xl text-gray-600 hover:bg-rose-50 hover:text-rose-600 transition-colors"
          title="Undo"
        >
          <Undo size={16} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().redo().run()}
          className="p-2 rounded-xl text-gray-600 hover:bg-rose-50 hover:text-rose-600 transition-colors"
          title="Redo"
        >
          <Redo size={16} />
        </button>
      </div>

      {/* Editor Content */}
      <div className="flex-1 p-5 overflow-y-auto">
        <EditorContent editor={editor} className="prose prose-rose max-w-none focus:outline-none min-h-[300px]" />
      </div>
    </div>
  )
}
