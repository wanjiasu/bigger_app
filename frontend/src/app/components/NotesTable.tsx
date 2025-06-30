'use client'

import { useState, useEffect } from 'react'
import { Eye, Edit, Trash2, Search, RefreshCw, FileText, Calendar, Tag } from 'lucide-react'
import axios from 'axios'
import { NoteDetailModal } from './NoteDetailModal'
import { EditNoteModal } from './EditNoteModal'
import { useLanguage } from '../../contexts/LanguageContext'
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
  showDetailed?: boolean
}

export function NotesTable({ refreshTrigger, showDetailed = false }: NotesTableProps) {
  const [notes, setNotes] = useState<Note[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedNote, setSelectedNote] = useState<Note | null>(null)
  const [editingNote, setEditingNote] = useState<Note | null>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const { t } = useLanguage()

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
      setError(t('notes.fetchFailed'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchNotes()
  }, [refreshTrigger])

  const handleDelete = async (id: number) => {
    if (!confirm(t('notes.confirmDelete'))) return

    try {
      await axios.delete(API_ENDPOINTS.NOTES_DELETE(id))
      setNotes(notes.filter(note => note.id !== id))
    } catch (err: any) {
      console.error('删除失败:', err)
      alert(t('notes.deleteFailed'))
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
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="text-center py-12">
          <div className="flex flex-col items-center">
            <FileText className="w-12 h-12 text-gray-300 mb-4" />
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={fetchNotes}
              className="px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg hover:from-pink-600 hover:to-purple-700 transition-all duration-200"
            >
              {t('common.retry')}
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100">
      {/* 表格头部 */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-800">
              {showDetailed ? t('notes.history') : t('notes.management')}
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              {showDetailed 
                ? t('notes.historyDesc')
                : t('notes.managementDesc')
              }
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder={t('notes.searchPlaceholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent text-sm"
              />
            </div>
            <button
              onClick={fetchNotes}
              className="p-2 text-gray-600 hover:text-pink-500 transition-colors rounded-lg hover:bg-pink-50"
                              title={t('common.refresh')}
            >
              <RefreshCw className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* 表格内容 */}
      {filteredNotes.length === 0 ? (
        <div className="px-6 py-12 text-center text-gray-500">
          <div className="flex flex-col items-center">
            <FileText className="w-12 h-12 text-gray-300 mb-4" />
            <p className="text-lg font-medium">
              {searchTerm ? t('notes.noSearchResults') : t('notes.noRecords')}
            </p>
            <p className="text-sm">
              {searchTerm ? t('notes.adjustSearch') : t('notes.noRecordsDesc')}
            </p>
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                {showDetailed && (
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                )}
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('notes.title')}</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('notes.basicContent')}</th>
                {showDetailed && (
                  <>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('notes.notePurpose')}</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('notes.recentTrends')}</th>
                  </>
                )}
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('notes.contentType')}</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('notes.targetAudience')}</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('notes.writingStyle')}</th>
                {showDetailed && (
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('notes.referenceLinks')}</th>
                )}
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('notes.createdAt')}</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('notes.actions')}</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredNotes.map((note) => (
                <tr key={note.id} className="hover:bg-gray-50">
                  {showDetailed && (
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        #{note.id}
                      </span>
                    </td>
                  )}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {truncateText(note.note_title, showDetailed ? 25 : 30)}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-600">
                      {truncateText(note.input_basic_content, showDetailed ? 30 : 40)}
                    </div>
                  </td>
                  {showDetailed && (
                    <>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-green-100 text-green-800">
                          {truncateText(note.input_note_purpose, 15)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-yellow-100 text-yellow-800">
                          {truncateText(note.input_recent_trends, 15)}
                        </span>
                      </td>
                    </>
                  )}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                      {truncateText(note.input_content_type, 15)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                      {truncateText(note.input_target_audience, 15)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-pink-100 text-pink-800">
                      {truncateText(note.input_writing_style, 15)}
                    </span>
                  </td>
                  {showDetailed && (
                    <td className="px-6 py-4 whitespace-nowrap">
                      {note.input_reference_links ? (
                        <a 
                          href={note.input_reference_links} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-cyan-100 text-cyan-800 hover:bg-cyan-200 transition-colors"
                          title={note.input_reference_links}
                        >
                          {t('notes.linkText')}
                        </a>
                      ) : (
                        <span className="text-gray-400 text-sm">-</span>
                      )}
                    </td>
                  )}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1 text-gray-400" />
                      {new Date(note.created_at).toLocaleDateString('zh-CN')}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleView(note)}
                        className="text-indigo-600 hover:text-indigo-900 p-1 rounded-md hover:bg-indigo-50"
                        title={t('common.view')}
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      {!showDetailed && (
                        <>
                          <button
                            onClick={() => handleEdit(note)}
                            className="text-green-600 hover:text-green-900 p-1 rounded-md hover:bg-green-50"
                            title={t('common.edit')}
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(note.id)}
                            className="text-red-600 hover:text-red-900 p-1 rounded-md hover:bg-red-50"
                            title={t('common.delete')}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 底部统计信息 */}
      <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 rounded-b-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 text-sm text-gray-600">
            <Tag className="w-4 h-4" />
            <span>{t('common.total')} {filteredNotes.length} {t('notes.totalRecords')}</span>
          </div>
          {showDetailed && (
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <FileText className="w-4 h-4" />
                {t('common.total')}: {notes.length}
              </span>
              <span className="flex items-center gap-1">
                <Search className="w-4 h-4" />
                {t('common.search')}: {filteredNotes.length}
              </span>
              {notes.length > 0 && (
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {t('common.latest')}: {new Date(notes[0].created_at).toLocaleDateString('zh-CN')}
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {showDetailModal && selectedNote && (
        <NoteDetailModal
          note={selectedNote}
          showDetailed={showDetailed}
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