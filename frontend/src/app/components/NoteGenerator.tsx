'use client'

import { useState } from 'react'
import { Sparkles, Loader2, Send, ChevronDown, Settings, Target, TrendingUp, Users, FileText, Link, Smartphone, Heart, MessageCircle, Share, Bookmark, Check, Copy, Cpu } from 'lucide-react'
import axios from 'axios'
import { API_ENDPOINTS } from '../../config/api'

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
  model?: string  // 添加模型标识
}

// 添加多模型结果类型
interface ModelResults {
  [key: string]: GeneratedNote | null
}

// 小红书手机预览组件
function XiaohongshuPreview({ note, copiedContent, copyToClipboard }: { 
  note: GeneratedNote | null,
  copiedContent: string | null,
  copyToClipboard: (text: string) => Promise<void>
}) {
  if (!note) {
    return (
      <div className="bg-black rounded-[2.5rem] p-2 w-full max-w-[300px] mx-auto">
        <div className="bg-white rounded-[2rem] h-[600px] p-4 flex flex-col items-center justify-center">
          <Smartphone className="w-12 h-12 text-gray-300 mb-4" />
          <p className="text-gray-400 text-sm text-center">生成后将在此预览<br />小红书效果</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-black rounded-[2.5rem] p-2 w-full max-w-[300px] mx-auto">
      <div className="bg-white rounded-[2rem] h-[600px] overflow-hidden flex flex-col">
        {/* 顶部状态栏 */}
        <div className="flex justify-between items-center px-4 py-2 text-xs">
          <span>9:41</span>
          <div className="flex gap-1">
            <div className="w-4 h-2 bg-green-500 rounded-sm"></div>
            <div className="w-6 h-2 bg-gray-300 rounded-sm"></div>
          </div>
        </div>

        {/* 小红书头部 */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <div className="w-6"></div>
          <div className="text-black font-semibold text-lg">小红书</div>
          <Share className="w-5 h-5 text-gray-600" />
        </div>

        {/* 主要内容区域 */}
        <div className="flex-1 overflow-y-auto">
          {/* 用户信息 */}
          <div className="flex items-center gap-3 px-4 py-3">
            <div className="w-10 h-10 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-bold">U</span>
            </div>
            <div className="flex-1">
              <div className="font-medium text-gray-800 text-sm">用户昵称</div>
              <div className="text-gray-500 text-xs">刚刚</div>
            </div>
            <button className="bg-red-500 text-white px-4 py-1 rounded-full text-xs font-medium">
              关注
            </button>
          </div>

          {/* 图片区域 */}
          <div className="bg-gradient-to-br from-pink-100 to-purple-100 mx-4 mb-3 rounded-xl h-48 flex items-center justify-center">
            <div className="text-center">
              <FileText className="w-12 h-12 text-pink-400 mx-auto mb-2" />
              <p className="text-pink-600 text-sm">图片预览区域</p>
            </div>
          </div>

          {/* 标题 */}
          <div className="px-4 mb-2 relative">
            <div className="flex items-start gap-2">
              <h3 className="font-bold text-gray-800 text-sm leading-relaxed flex-1">
                {note.note_title}
              </h3>
              <button
                onClick={() => copyToClipboard(note.note_title)}
                className="p-1 text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
                title="复制标题"
              >
                {copiedContent === note.note_title ? (
                  <Check className="w-3 h-3 text-green-500" />
                ) : (
                  <Copy className="w-3 h-3" />
                )}
              </button>
            </div>
          </div>

          {/* 正文内容 */}
          <div className="px-4 mb-4 relative">
            <div className="flex items-start gap-2">
              <div 
                className="text-gray-700 text-xs leading-relaxed max-h-32 overflow-y-auto flex-1" 
                style={{
                  scrollbarWidth: 'thin',
                  scrollbarColor: '#D1D5DB #F3F4F6'
                }}>
                {note.note_content.split('\n').map((line, index) => (
                  <div key={index} className="mb-1">
                    {line}
                  </div>
                ))}
              </div>
              <button
                onClick={() => copyToClipboard(note.note_content)}
                className="p-1 text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
                title="复制正文"
              >
                {copiedContent === note.note_content ? (
                  <Check className="w-3 h-3 text-green-500" />
                ) : (
                  <Copy className="w-3 h-3" />
                )}
              </button>
            </div>
          </div>

          {/* 标签区域 */}
          <div className="px-4 mb-4">
            <div className="flex flex-wrap gap-2">
              <span className="bg-red-100 text-red-600 px-2 py-1 rounded-full text-xs">#小红书</span>
              <span className="bg-pink-100 text-pink-600 px-2 py-1 rounded-full text-xs">#生活分享</span>
              <span className="bg-purple-100 text-purple-600 px-2 py-1 rounded-full text-xs">#AI生成</span>
            </div>
          </div>
        </div>

        {/* 底部互动区域 */}
        <div className="border-t border-gray-100 px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <Heart className="w-5 h-5 text-gray-400" />
                <span className="text-gray-600 text-sm">666</span>
              </div>
              <div className="flex items-center gap-1">
                <MessageCircle className="w-5 h-5 text-gray-400" />
                <span className="text-gray-600 text-sm">88</span>
              </div>
              <Share className="w-5 h-5 text-gray-400" />
            </div>
            <Bookmark className="w-5 h-5 text-gray-400" />
          </div>
        </div>
      </div>
    </div>
  )
}

export function NoteGenerator({ onNoteGenerated }: NoteGeneratorProps) {
  const [basicContent, setBasicContent] = useState('')
  const [showAdvanced, setShowAdvanced] = useState(false)
  
  // 高级参数
  const [notePurpose, setNotePurpose] = useState('')
  const [recentTrends, setRecentTrends] = useState('')
  const [writingStyle, setWritingStyle] = useState('')
  const [targetAudience, setTargetAudience] = useState('')
  const [contentType, setContentType] = useState('')
  const [referenceLinks, setReferenceLinks] = useState('')
  
  // 修改为多模型选择，默认选择 gpt-4o
  const [selectedModels, setSelectedModels] = useState<string[]>(['gpt-4o'])
  
  const [isLoading, setIsLoading] = useState(false)
  // 修改为多模型结果
  const [generatedNotes, setGeneratedNotes] = useState<ModelResults>({})
  const [error, setError] = useState('')
  // 添加显示模式状态
  const [showResults, setShowResults] = useState(false)

  // 复制功能状态
  const [copiedContent, setCopiedContent] = useState<string | null>(null)

  // 可用的模型列表
  const availableModels = [
    { value: 'claude-3-5-sonnet-latest', label: 'Claude 3.5 Sonnet' },
    { value: 'gpt-4o', label: 'GPT-4o' },
    { value: 'deepseek-r1', label: 'DeepSeek R1' },
    { value: 'glm-4', label: 'GLM-4' }
  ]

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedContent(text)
      setTimeout(() => setCopiedContent(null), 2000)
    } catch (err) {
      console.error('复制失败:', err)
    }
  }

  const handleGenerate = async () => {
    if (!basicContent.trim()) {
      setError('请输入基本内容')
      return
    }

    // 如果没有选择模型，使用默认的 gpt-4o
    const modelsToUse = selectedModels.length > 0 ? selectedModels : ['gpt-4o']

    setIsLoading(true)
    setError('')
    setGeneratedNotes({})

    try {
      const response = await axios.post(API_ENDPOINTS.NOTES_GENERATE, {
        basic_content: basicContent.trim(),
        note_purpose: notePurpose.trim() || null,
        recent_trends: recentTrends.trim() || null,
        writing_style: writingStyle.trim() || null,
        target_audience: targetAudience.trim() || null,
        content_type: contentType.trim() || null,
        reference_links: referenceLinks.trim() || null,
        ai_model: modelsToUse.join(',')
      })

      if (response.data.success) {
        const newGeneratedNotes: ModelResults = {}
        response.data.data.forEach((note: GeneratedNote) => {
          newGeneratedNotes[note.model || ''] = note
        })
        setGeneratedNotes(newGeneratedNotes)
        setShowResults(true) // 显示结果页面
        // 只触发刷新，不跳转页面
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
    setBasicContent('')
    setNotePurpose('')
    setRecentTrends('')
    setWritingStyle('')
    setTargetAudience('')
    setContentType('')
    setReferenceLinks('')
    setSelectedModels(['gpt-4o']) // 重置为默认模型
    setGeneratedNotes({})
    setError('')
    setShowAdvanced(false)
    setShowResults(false) // 返回输入页面
  }

  const handleBackToInput = () => {
    setShowResults(false)
    setError('')
  }

  // 获取实际使用的模型列表
  const actualModels = selectedModels.length > 0 ? selectedModels : ['gpt-4o']

  // 如果显示结果，渲染结果页面
  if (showResults) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-pink-500" />
              <h2 className="text-xl font-bold text-gray-800">
                {actualModels.length === 1 ? '生成结果' : '模型对比结果'}
              </h2>
            </div>
            <button
              onClick={handleBackToInput}
              className="px-4 py-2 text-gray-600 hover:text-pink-600 transition-colors flex items-center gap-2"
            >
              <ChevronDown className="w-4 h-4 rotate-90" />
              返回编辑
            </button>
          </div>

          {actualModels.length === 1 ? (
            // 单个模型结果展示
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-medium text-gray-800 mb-4">
                  {availableModels.find(m => m.value === actualModels[0])?.label || actualModels[0]}
                </h3>
                <XiaohongshuPreview 
                  note={generatedNotes[actualModels[0]]} 
                  copiedContent={copiedContent} 
                  copyToClipboard={copyToClipboard} 
                />
              </div>
              
              <div className="space-y-4">
                {generatedNotes[actualModels[0]] && (
                  <>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-gray-800">评论引导</h4>
                        <button
                          onClick={() => copyToClipboard(generatedNotes[actualModels[0]]?.comment_guide || '')}
                          className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                          title="复制评论引导"
                        >
                          {copiedContent === generatedNotes[actualModels[0]]?.comment_guide ? (
                            <Check className="w-4 h-4 text-green-500" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                      <p className="text-gray-700">{generatedNotes[actualModels[0]]?.comment_guide}</p>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-gray-800">评论问题</h4>
                        <button
                          onClick={() => copyToClipboard(generatedNotes[actualModels[0]]?.comment_questions || '')}
                          className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                          title="复制评论问题"
                        >
                          {copiedContent === generatedNotes[actualModels[0]]?.comment_questions ? (
                            <Check className="w-4 h-4 text-green-500" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                      <p className="text-gray-700 whitespace-pre-line">{generatedNotes[actualModels[0]]?.comment_questions}</p>
                    </div>

                    <button
                      onClick={() => {
                        const note = generatedNotes[actualModels[0]]
                        if (note) {
                          const allContent = `${note.note_title}\n\n${note.note_content}\n\n评论引导：\n${note.comment_guide}\n\n评论问题：\n${note.comment_questions}`
                          copyToClipboard(allContent)
                        }
                      }}
                      className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white px-4 py-2 rounded-lg font-medium hover:from-pink-600 hover:to-purple-700 transition-all duration-200 flex items-center justify-center gap-2"
                    >
                      <Copy className="w-4 h-4" />
                      复制全部内容
                    </button>
                  </>
                )}
              </div>
            </div>
          ) : (
            // 多个模型对比展示
            <div className="space-y-8">
              <div className="text-center">
                <p className="text-sm text-gray-500">
                  已选择 {actualModels.length} 个模型进行对比
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {actualModels.map((model) => {
                  const note = generatedNotes[model]
                  const modelInfo = availableModels.find(m => m.value === model)
                  
                  return (
                    <div key={model} className="bg-gray-50 rounded-xl p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-medium text-gray-800">{modelInfo?.label || model}</h4>
                        {note && (
                          <span className="text-xs text-green-500 bg-green-50 px-2 py-1 rounded-full">
                            生成成功
                          </span>
                        )}
                      </div>
                      
                      <XiaohongshuPreview 
                        note={note} 
                        copiedContent={copiedContent} 
                        copyToClipboard={copyToClipboard} 
                      />

                      {note && (
                        <div className="mt-4 space-y-3">
                          <div className="bg-white rounded-lg p-3">
                            <div className="flex items-center justify-between mb-1">
                              <div className="text-xs text-gray-600">评论引导</div>
                              <button
                                onClick={() => copyToClipboard(note.comment_guide)}
                                className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                                title="复制评论引导"
                              >
                                {copiedContent === note.comment_guide ? (
                                  <Check className="w-3 h-3 text-green-500" />
                                ) : (
                                  <Copy className="w-3 h-3" />
                                )}
                              </button>
                            </div>
                            <div className="text-sm text-gray-800">{note.comment_guide}</div>
                          </div>

                          <div className="bg-white rounded-lg p-3">
                            <div className="flex items-center justify-between mb-1">
                              <div className="text-xs text-gray-600">评论问题</div>
                              <button
                                onClick={() => copyToClipboard(note.comment_questions)}
                                className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                                title="复制评论问题"
                              >
                                {copiedContent === note.comment_questions ? (
                                  <Check className="w-3 h-3 text-green-500" />
                                ) : (
                                  <Copy className="w-3 h-3" />
                                )}
                              </button>
                            </div>
                            <div className="text-sm text-gray-800">{note.comment_questions}</div>
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>

              {Object.keys(generatedNotes).length > 0 && (
                <div className="pt-6 border-t border-gray-100">
                  <button
                    onClick={() => {
                      const allContent = actualModels.map((model) => {
                        const note = generatedNotes[model]
                        const modelInfo = availableModels.find(m => m.value === model)
                        if (note) {
                          return `=== ${modelInfo?.label || model} ===\n\n${note.note_title}\n\n${note.note_content}\n\n评论引导：\n${note.comment_guide}\n\n评论问题：\n${note.comment_questions}\n\n`
                        }
                        return ''
                      }).join('\n')
                      copyToClipboard(allContent)
                    }}
                    className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white px-4 py-2 rounded-lg font-medium hover:from-pink-600 hover:to-purple-700 transition-all duration-200 flex items-center justify-center gap-2"
                  >
                    {copiedContent && actualModels.every((model) => 
                      copiedContent.includes(generatedNotes[model]?.note_title || '') && 
                      copiedContent.includes(generatedNotes[model]?.comment_guide || '')
                    ) ? (
                      <>
                        <Check className="w-4 h-4" />
                        已复制所有内容
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        复制所有模型生成结果
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    )
  }

  // 输入页面
  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center gap-2 mb-6">
          <Sparkles className="w-6 h-6 text-pink-500" />
          <h2 className="text-xl font-bold text-gray-800">内容生成</h2>
        </div>

        {/* 基本内容输入 */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            基本内容 <span className="text-red-500">*</span>
          </label>
          <textarea
            value={basicContent}
            onChange={(e) => setBasicContent(e.target.value)}
            placeholder="请输入您想要生成的基本内容描述..."
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent resize-none"
            rows={4}
          />
        </div>

        {/* 高级参数切换 */}
        <div className="mb-4">
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center gap-2 text-gray-600 hover:text-pink-600 transition-colors"
          >
            <Settings className="w-4 h-4" />
            <span className="text-sm font-medium">高级参数设置</span>
            <ChevronDown 
              className={`w-4 h-4 transition-transform ${showAdvanced ? 'rotate-180' : ''}`} 
            />
          </button>
        </div>

        {/* 高级参数输入区域 */}
        {showAdvanced && (
          <div className="bg-gray-50 rounded-lg p-4 mb-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <Target className="w-4 h-4 text-blue-500" />
                  笔记目的
                </label>
                <input
                  type="text"
                  value={notePurpose}
                  onChange={(e) => setNotePurpose(e.target.value)}
                  placeholder="例如：种草推荐、知识分享、生活记录..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <TrendingUp className="w-4 h-4 text-green-500" />
                  近期热梗
                </label>
                <input
                  type="text"
                  value={recentTrends}
                  onChange={(e) => setRecentTrends(e.target.value)}
                  placeholder="例如：双十一、春节、热门话题..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <FileText className="w-4 h-4 text-purple-500" />
                  写作风格
                </label>
                <select
                  value={writingStyle}
                  onChange={(e) => setWritingStyle(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                >
                  <option value="">请选择写作风格</option>
                  <option value="轻松幽默">轻松幽默</option>
                  <option value="专业严谨">专业严谨</option>
                  <option value="温馨治愈">温馨治愈</option>
                  <option value="活泼可爱">活泼可爱</option>
                  <option value="干货分享">干货分享</option>
                </select>
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <Cpu className="w-4 h-4 text-orange-500" />
                  AI 模型（默认：GPT-4o，最多选择3个）
                </label>
                <div className="space-y-2">
                  {availableModels.map((model) => (
                    <label key={model.value} className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50">
                      <input
                        type="checkbox"
                        checked={selectedModels.includes(model.value)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            if (selectedModels.length < 3) {
                              setSelectedModels([...selectedModels, model.value])
                            }
                          } else {
                            setSelectedModels(selectedModels.filter(m => m !== model.value))
                          }
                        }}
                        className="w-4 h-4 text-pink-500 rounded border-gray-300 focus:ring-pink-500"
                      />
                      <span className="text-sm text-gray-700">{model.label}</span>
                      {model.value === 'gpt-4o' && selectedModels.length === 0 && (
                        <span className="text-xs text-orange-500">(默认)</span>
                      )}
                    </label>
                  ))}
                  {selectedModels.length >= 3 && (
                    <p className="text-xs text-orange-500 mt-1">
                      已达到最大选择数量（3个模型）
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <Users className="w-4 h-4 text-orange-500" />
                  内容受众
                </label>
                <input
                  type="text"
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value)}
                  placeholder="例如：职场新人、宝妈、学生党..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <Sparkles className="w-4 h-4 text-pink-500" />
                内容类型
              </label>
              <select
                value={contentType}
                onChange={(e) => setContentType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              >
                <option value="">请选择内容类型</option>
                <option value="产品种草">产品种草</option>
                <option value="生活分享">生活分享</option>
                <option value="知识科普">知识科普</option>
                <option value="穿搭搭配">穿搭搭配</option>
                <option value="美食制作">美食制作</option>
                <option value="旅行攻略">旅行攻略</option>
                <option value="学习经验">学习经验</option>
              </select>
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <Link className="w-4 h-4 text-cyan-500" />
                参考链接
              </label>
              <input
                type="text"
                value={referenceLinks}
                onChange={(e) => setReferenceLinks(e.target.value)}
                placeholder="可输入参考链接，多个链接用逗号分隔..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">注：参考链接暂时仅作记录，不参与实际生成</p>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {/* 生成按钮 */}
        <div className="flex gap-4">
          <button
            onClick={handleGenerate}
            disabled={isLoading || !basicContent.trim()}
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
                开始生成 ({actualModels.length} 个模型)
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
    </div>
  )
} 