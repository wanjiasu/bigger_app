'use client'

import { useState } from 'react'
import { Sparkles, Loader2, Send } from 'lucide-react'
import axios from 'axios'

interface NoteGeneratorProps {
  onNoteGenerated: () => void
}

interface GeneratedNote {
  id: number
  note_title: string
  note_content: string
  comment_guide: string
  comment_questions: string
  created_at: string
}

export function NoteGenerator({ onNoteGenerated }: NoteGeneratorProps) {
  const [scenario, setScenario] = useState('')
  const [persona, setPersona] = useState('')
  const [hotspot, setHotspot] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [generatedNote, setGeneratedNote] = useState<GeneratedNote | null>(null)
  const [error, setError] = useState('')

  const handleGenerate = async () => {
    if (!scenario.trim()) {
      setError('请输入痛点场景')
      return
    }

    setIsLoading(true)
    setError('')
    setGeneratedNote(null)

    try {
      const response = await axios.post('http://localhost:8000/notes/generate', {
        scenario: scenario.trim(),
        persona: persona.trim() || null,
        hotspot: hotspot.trim() || null
      })

      if (response.data.success) {
        setGeneratedNote(response.data.data)
        onNoteGenerated()
      } else {
        setError('生成失败，请重试')
      }
    } catch (err: any) {
      console.error('生成笔记失败:', err)
      setError(err.response?.data?.detail || '网络错误，请检查后端服务是否启动')
    } finally {
      setIsLoading(false)
    }
  }

  const handleReset = () => {
    setScenario('')
    setPersona('')
    setHotspot('')
    setGeneratedNote(null)
    setError('')
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-xl shadow-lg p-8">
        <div className="flex items-center gap-2 mb-6">
          <Sparkles className="w-6 h-6 text-pink-500" />
          <h2 className="text-2xl font-bold text-gray-800">生成小红书笔记</h2>
        </div>

        {/* Input Form */}
        <div className="space-y-6 mb-8">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              痛点场景 <span className="text-red-500">*</span>
            </label>
            <textarea
              value={scenario}
              onChange={(e) => setScenario(e.target.value)}
              placeholder="请描述用户的痛点场景，例如：上班族早上起不来，总是迟到..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent resize-none"
              rows={4}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                人设 (可选)
              </label>
              <input
                type="text"
                value={persona}
                onChange={(e) => setPersona(e.target.value)}
                placeholder="例如：职场新人、宝妈、学生..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                热点 (可选)
              </label>
              <input
                type="text"
                value={hotspot}
                onChange={(e) => setHotspot(e.target.value)}
                placeholder="例如：双十一、春节、开学季..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-600">{error}</p>
            </div>
          )}

          <div className="flex gap-4">
            <button
              onClick={handleGenerate}
              disabled={isLoading || !scenario.trim()}
              className="flex-1 bg-gradient-to-r from-pink-500 to-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:from-pink-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  生成中...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  生成笔记
                </>
              )}
            </button>

            <button
              onClick={handleReset}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-all duration-200"
            >
              重置
            </button>
          </div>
        </div>

        {/* Generated Note Preview */}
        {generatedNote && (
          <div className="border-t pt-8">
            <h3 className="text-xl font-bold text-gray-800 mb-6">生成结果预览</h3>
            
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-lg p-6">
                <h4 className="font-semibold text-gray-700 mb-2">笔记标题</h4>
                <p className="text-lg font-medium text-gray-800">{generatedNote.note_title}</p>
              </div>

              <div className="bg-blue-50 rounded-lg p-6">
                <h4 className="font-semibold text-gray-700 mb-2">笔记正文</h4>
                <div className="text-gray-800 whitespace-pre-wrap">{generatedNote.note_content}</div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-green-50 rounded-lg p-6">
                  <h4 className="font-semibold text-gray-700 mb-2">评论引导</h4>
                  <p className="text-gray-800">{generatedNote.comment_guide}</p>
                </div>

                <div className="bg-yellow-50 rounded-lg p-6">
                  <h4 className="font-semibold text-gray-700 mb-2">评论问题</h4>
                  <div className="text-gray-800 whitespace-pre-wrap">{generatedNote.comment_questions}</div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-500">
                  生成时间: {new Date(generatedNote.created_at).toLocaleString('zh-CN')}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 