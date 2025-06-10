'use client'

import { useState, useEffect } from 'react'
import { Eye, Edit, Trash2, Search, RefreshCw } from 'lucide-react'
import axios from 'axios'
import { NoteDetailModal } from './NoteDetailModal'
import { EditNoteModal } from './EditNoteModal'
import { API_ENDPOINTS } from '../../config/api'

interface Note {
  id: number
  input_basic_content: string
  input_note_purpose: string | null
  input_recent_trends: string | null
  input_writing_style: string | null
  input_target_audience: string | null
  input_content_type: string | null
  input_reference_links: string | null
  note_title: string
  note_content: string
  comment_guide: string
  comment_questions: string
  created_at: string
  updated_at: string | null
}

interface NotesTableProps {
  refreshTrigger: number
}

export function NotesTable({ refreshTrigger }: NotesTableProps) {
  const [notes, setNotes] = useState<Note[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedNote, setSelectedNote] = useState<Note | null>(null)
  const [editingNote, setEditingNote] = useState<Note | null>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)

  const fetchNotes = async () => {
    try {
      setLoading(true)
      const response = await axios.get(API_ENDPOINTS.NOTES_LIST)
      setNotes(response.data.sort((a: Note, b: Note) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      ))
      setError('')
    } catch (err: any) {
      console.error('获取笔记失败:', err)
      setError('获取笔记失败，请检查后端服务是否启动')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchNotes()
  }, [refreshTrigger])

  const handleDelete = async (id: number) => {
    if (!confirm('确定要删除这条笔记吗？')) return

    try {
      await axios.delete(API_ENDPOINTS.NOTES_DELETE(id))
      setNotes(notes.filter(note => note.id !== id))
    } catch (err: any) {
      console.error('删除失败:', err)
      alert('删除失败，请重试')
    }
  }

  const handleView = (note: Note) => {
    setSelectedNote(note)
    setShowDetailModal(true)
  }

  const handleEdit = (note: Note) => {
    setEditingNote(note)
    setShowEditModal(true)
  }

  const handleEditSuccess = (updatedNote: Note) => {
    setNotes(notes.map(note => note.id === updatedNote.id ? updatedNote : note))
    setShowEditModal(false)
    setEditingNote(null)
  }

  const filteredNotes = notes.filter(note =>
    note.note_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    note.input_basic_content.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (note.input_note_purpose && note.input_note_purpose.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (note.input_recent_trends && note.input_recent_trends.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (note.input_writing_style && note.input_writing_style.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (note.input_target_audience && note.input_target_audience.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (note.input_content_type && note.input_content_type.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const truncateText = (text: string | null | undefined, maxLength: number) => {
    if (!text) return '-'
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text
  }

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-8">
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="w-8 h-8 animate-spin text-pink-500" />
          <span className="ml-2 text-gray-600">加载中...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-8">
        <div className="text-center py-12">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={fetchNotes}
            className="bg-pink-500 text-white px-4 py-2 rounded-lg hover:bg-pink-600 transition-colors"
          >
            重试
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">笔记管理</h2>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="搜索笔记..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            />
          </div>
          <button
            onClick={fetchNotes}
            className="p-2 text-gray-600 hover:text-pink-500 transition-colors"
            title="刷新"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>
      </div>

      {filteredNotes.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">
            {searchTerm ? '没有找到匹配的笔记' : '还没有生成任何笔记'}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-700">标题</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">基本内容</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">内容类型</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">目标受众</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">写作风格</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">创建时间</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">操作</th>
              </tr>
            </thead>
            <tbody>
              {filteredNotes.map((note) => (
                <tr key={note.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-4 px-4">
                    <div className="font-medium text-gray-800">
                      {truncateText(note.note_title, 30)}
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="text-gray-600">
                      {truncateText(note.input_basic_content, 40)}
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="text-gray-600">
                      {truncateText(note.input_content_type, 20)}
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="text-gray-600">
                      {truncateText(note.input_target_audience, 20)}
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="text-gray-600">
                      {truncateText(note.input_writing_style, 20)}
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="text-gray-600 text-sm">
                      {new Date(note.created_at).toLocaleString('zh-CN')}
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleView(note)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="查看详情"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleEdit(note)}
                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                        title="编辑"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(note.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="删除"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-6 text-sm text-gray-500">
        共 {filteredNotes.length} 条笔记
      </div>

      {/* Modals */}
      {showDetailModal && selectedNote && (
        <NoteDetailModal
          note={selectedNote}
          onClose={() => {
            setShowDetailModal(false)
            setSelectedNote(null)
          }}
        />
      )}

      {showEditModal && editingNote && (
        <EditNoteModal
          note={editingNote}
          onClose={() => {
            setShowEditModal(false)
            setEditingNote(null)
          }}
          onSuccess={handleEditSuccess}
        />
      )}
    </div>
  )
} 