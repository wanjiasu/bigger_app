'use client'

import { X, Copy, Check } from 'lucide-react'
import { useState } from 'react'

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

interface NoteDetailModalProps {
  note: Note
  onClose: () => void
  showDetailed?: boolean
}

export function NoteDetailModal({ note, onClose, showDetailed = false }: NoteDetailModalProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null)

  const copyToClipboard = async (text: string, fieldName: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedField(fieldName)
      setTimeout(() => setCopiedField(null), 2000)
    } catch (err) {
      console.error('复制失败:', err)
    }
  }

  const CopyButton = ({ text, fieldName }: { text: string; fieldName: string }) => (
    <button
      onClick={() => copyToClipboard(text, fieldName)}
      className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
      title="复制到剪贴板"
    >
      {copiedField === fieldName ? (
        <Check className="w-4 h-4 text-green-500" />
      ) : (
        <Copy className="w-4 h-4" />
      )}
    </button>
  )

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-bold text-gray-800">
              {showDetailed ? '历史记录详情' : '笔记详情'}
            </h2>
            {showDetailed && (
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-3 py-1 rounded-full text-sm font-mono">
                ID: #{note.id}
              </div>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          <div className="space-y-6">
            {/* Input Information */}
            <div className="bg-gray-50 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">输入信息</h3>
                {showDetailed && (
                  <div className="text-sm text-gray-500 space-y-1">
                    <div>创建时间: {new Date(note.created_at).toLocaleString('zh-CN')}</div>
                    {note.updated_at && (
                      <div>更新时间: {new Date(note.updated_at).toLocaleString('zh-CN')}</div>
                    )}
                  </div>
                )}
              </div>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-gray-700">基本内容</label>
                    <CopyButton text={note.input_basic_content} fieldName="basic_content" />
                  </div>
                  <p className="text-gray-800 bg-white p-3 rounded border">
                    {note.input_basic_content}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-medium text-gray-700">笔记目的</label>
                      {note.input_note_purpose && (
                        <CopyButton text={note.input_note_purpose} fieldName="note_purpose" />
                      )}
                    </div>
                    <p className="text-gray-800 bg-white p-3 rounded border">
                      {note.input_note_purpose || '未设置'}
                    </p>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-medium text-gray-700">近期热梗</label>
                      {note.input_recent_trends && (
                        <CopyButton text={note.input_recent_trends} fieldName="recent_trends" />
                      )}
                    </div>
                    <p className="text-gray-800 bg-white p-3 rounded border">
                      {note.input_recent_trends || '未设置'}
                    </p>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-medium text-gray-700">写作风格</label>
                      {note.input_writing_style && (
                        <CopyButton text={note.input_writing_style} fieldName="writing_style" />
                      )}
                    </div>
                    <p className="text-gray-800 bg-white p-3 rounded border">
                      {note.input_writing_style || '未设置'}
                    </p>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-medium text-gray-700">目标受众</label>
                      {note.input_target_audience && (
                        <CopyButton text={note.input_target_audience} fieldName="target_audience" />
                      )}
                    </div>
                    <p className="text-gray-800 bg-white p-3 rounded border">
                      {note.input_target_audience || '未设置'}
                    </p>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-medium text-gray-700">内容类型</label>
                      {note.input_content_type && (
                        <CopyButton text={note.input_content_type} fieldName="content_type" />
                      )}
                    </div>
                    <p className="text-gray-800 bg-white p-3 rounded border">
                      {note.input_content_type || '未设置'}
                    </p>
                  </div>

                  {note.input_reference_links && (
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-sm font-medium text-gray-700">参考链接</label>
                        <CopyButton text={note.input_reference_links} fieldName="reference_links" />
                      </div>
                      <p className="text-gray-800 bg-white p-3 rounded border break-all">
                        {note.input_reference_links}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Generated Content */}
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-lg p-6">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-lg font-semibold text-gray-800">笔记标题</h4>
                  <CopyButton text={note.note_title} fieldName="title" />
                </div>
                <p className="text-gray-800 text-lg font-medium">{note.note_title}</p>
              </div>

              <div className="bg-blue-50 rounded-lg p-6">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-lg font-semibold text-gray-800">笔记正文</h4>
                  <CopyButton text={note.note_content} fieldName="content" />
                </div>
                <div className="text-gray-800 whitespace-pre-wrap bg-white p-4 rounded border">
                  {note.note_content}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-green-50 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-lg font-semibold text-gray-800">评论引导</h4>
                    <CopyButton text={note.comment_guide} fieldName="guide" />
                  </div>
                  <p className="text-gray-800 bg-white p-4 rounded border">
                    {note.comment_guide}
                  </p>
                </div>

                <div className="bg-yellow-50 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-lg font-semibold text-gray-800">评论问题</h4>
                    <CopyButton text={note.comment_questions} fieldName="questions" />
                  </div>
                  <div className="text-gray-800 whitespace-pre-wrap bg-white p-4 rounded border">
                    {note.comment_questions}
                  </div>
                </div>
              </div>
            </div>

            {/* Meta Information */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h4 className="text-lg font-semibold text-gray-800 mb-4">元信息</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-700">创建时间：</span>
                  <span className="text-gray-600">
                    {new Date(note.created_at).toLocaleString('zh-CN')}
                  </span>
                </div>
                {note.updated_at && (
                  <div>
                    <span className="font-medium text-gray-700">更新时间：</span>
                    <span className="text-gray-600">
                      {new Date(note.updated_at).toLocaleString('zh-CN')}
                    </span>
                  </div>
                )}
                <div>
                  <span className="font-medium text-gray-700">笔记ID：</span>
                  <span className="text-gray-600">{note.id}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
          >
            关闭
          </button>
        </div>
      </div>
    </div>
  )
} 