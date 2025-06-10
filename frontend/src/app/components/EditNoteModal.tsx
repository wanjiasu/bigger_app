'use client'

import { useState } from 'react'
import { X, Save, Loader2 } from 'lucide-react'
import axios from 'axios'
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

interface EditNoteModalProps {
  note: Note
  onClose: () => void
  onSuccess: (updatedNote: Note) => void
}

export function EditNoteModal({ note, onClose, onSuccess }: EditNoteModalProps) {
  const [formData, setFormData] = useState({
    note_title: note.note_title,
    note_content: note.note_content,
    comment_guide: note.comment_guide,
    comment_questions: note.comment_questions
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.note_title.trim() || !formData.note_content.trim()) {
      setError('标题和正文不能为空')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      const response = await axios.put(API_ENDPOINTS.NOTES_UPDATE(note.id), formData)
      onSuccess(response.data)
    } catch (err: any) {
      console.error('更新失败:', err)
      setError(err.response?.data?.detail || '更新失败，请重试')
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800">编辑笔记</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
          <div className="space-y-6">
            {/* Input Information (Read-only) */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">原始输入信息</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">基本内容</label>
                  <p className="text-gray-600 bg-white p-3 rounded border mt-1">
                    {note.input_basic_content}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">笔记目的</label>
                    <p className="text-gray-600 bg-white p-3 rounded border mt-1">
                      {note.input_note_purpose || '未设置'}
                    </p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700">近期热梗</label>
                    <p className="text-gray-600 bg-white p-3 rounded border mt-1">
                      {note.input_recent_trends || '未设置'}
                    </p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700">写作风格</label>
                    <p className="text-gray-600 bg-white p-3 rounded border mt-1">
                      {note.input_writing_style || '未设置'}
                    </p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700">内容类型</label>
                    <p className="text-gray-600 bg-white p-3 rounded border mt-1">
                      {note.input_content_type || '未设置'}
                    </p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700">目标受众</label>
                    <p className="text-gray-600 bg-white p-3 rounded border mt-1">
                      {note.input_target_audience || '未设置'}
                    </p>
                  </div>

                  {note.input_reference_links && (
                    <div>
                      <label className="text-sm font-medium text-gray-700">参考链接</label>
                      <p className="text-gray-600 bg-white p-3 rounded border mt-1 break-all">
                        {note.input_reference_links}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Editable Content */}
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  笔记标题 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.note_title}
                  onChange={(e) => handleChange('note_title', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  placeholder="请输入笔记标题"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  笔记正文 <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.note_content}
                  onChange={(e) => handleChange('note_content', e.target.value)}
                  rows={8}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent resize-none"
                  placeholder="请输入笔记正文"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    评论引导
                  </label>
                  <textarea
                    value={formData.comment_guide}
                    onChange={(e) => handleChange('comment_guide', e.target.value)}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent resize-none"
                    placeholder="请输入评论引导文案"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    评论问题
                  </label>
                  <textarea
                    value={formData.comment_questions}
                    onChange={(e) => handleChange('comment_questions', e.target.value)}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent resize-none"
                    placeholder="请输入评论问题（每行一个问题）"
                  />
                </div>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-600">{error}</p>
              </div>
            )}
          </div>
        </form>

        {/* Footer */}
        <div className="flex justify-end gap-4 p-6 border-t border-gray-200">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            取消
          </button>
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className="px-6 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg hover:from-pink-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                保存中...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                保存
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
} 