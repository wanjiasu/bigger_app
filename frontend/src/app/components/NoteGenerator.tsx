'use client'

import { useState, useRef, useEffect } from 'react'
import { Sparkles, Loader2, Send, ChevronDown, Settings, Target, TrendingUp, Users, FileText, Link, Smartphone, Heart, MessageCircle, Share, Bookmark, Check, Copy, Cpu, X } from 'lucide-react'
import axios from 'axios'
import { useLanguage } from '../../contexts/LanguageContext'
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
function XiaohongshuPreview({ note, copiedContent, copyingContent, copyToClipboard }: { 
  note: GeneratedNote | null,
  copiedContent: string | null,
  copyingContent: string | null,
  copyToClipboard: (text: string) => Promise<void>
}) {
  if (!note) {
    return (
      <div className="bg-black rounded-[2.5rem] p-2 w-full max-w-[300px] mx-auto">
        <div className="bg-white rounded-[2rem] h-[600px] p-4 flex flex-col items-center justify-center">
          <Smartphone className="w-12 h-12 text-gray-300 mb-4" />
          <p className="text-gray-400 text-sm text-center">{t('generator.previewDesc')}</p>
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
                {copyingContent === note.note_title ? (
                  <Loader2 className="w-3 h-3 animate-spin text-blue-500" />
                ) : copiedContent === note.note_title ? (
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
                {copyingContent === note.note_content ? (
                  <Loader2 className="w-3 h-3 animate-spin text-blue-500" />
                ) : copiedContent === note.note_content ? (
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
  const { t } = useLanguage()
  const [basicContent, setBasicContent] = useState('')
  const [showAdvanced, setShowAdvanced] = useState(true)
  
  // 账号信息参数
  const [accountInfo, setAccountInfo] = useState({
    account_name: '',
    account_type: '',
    topic_keywords: '',
    platform: '小红书'
  })
  // 移除 useStoredAccount 状态，直接通过 selectedAccountId 判断
  const [storedAccounts, setStoredAccounts] = useState<any[]>([])
  const [selectedAccountId, setSelectedAccountId] = useState<number | null>(null)
  
  // 高级参数
  const [notePurpose, setNotePurpose] = useState('')
  const [recentTrends, setRecentTrends] = useState('')
  const [writingStyle, setWritingStyle] = useState('')
  const [targetAudience, setTargetAudience] = useState('')
  const [contentType, setContentType] = useState('')
  const [referenceLinks, setReferenceLinks] = useState('')
  
  // 修改为多模型选择，默认选择模型一（gpt-4o）
  const [selectedModels, setSelectedModels] = useState<string[]>(['gpt-4o'])
  
  const [isLoading, setIsLoading] = useState(false)
  // 修改为多模型结果
  const [generatedNotes, setGeneratedNotes] = useState<ModelResults>({})
  const [error, setError] = useState('')
  // 添加显示模式状态
  const [showResults, setShowResults] = useState(false)

  // 复制功能状态
  const [copiedContent, setCopiedContent] = useState<string | null>(null)
  const [copyError, setCopyError] = useState<string | null>(null)
  const [copyingContent, setCopyingContent] = useState<string | null>(null)
  const [allContentCopied, setAllContentCopied] = useState(false)

  // 获取存储的账号信息
  useEffect(() => {
    const fetchStoredAccounts = async () => {
      try {
        const response = await fetch(`${API_ENDPOINTS.NOTES_LIST.replace('/notes/', '/client-accounts/')}`)
        if (response.ok) {
          const accounts = await response.json()
          setStoredAccounts(accounts)
        }
      } catch (error) {
        console.error('获取账号信息失败:', error)
      }
    }
    fetchStoredAccounts()
  }, [])
  
  // 多选下拉状态
  const [isModelDropdownOpen, setIsModelDropdownOpen] = useState(false)
  const modelDropdownRef = useRef<HTMLDivElement>(null)

  // 点击外部关闭下拉
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modelDropdownRef.current && !modelDropdownRef.current.contains(event.target as Node)) {
        setIsModelDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  // 可用的模型列表 - 使用抽象名称隐藏真实模型
  const availableModels = [
    { value: 'gpt-4o', label: t('models.modelOne') },
    { value: 'claude-3-5-sonnet-latest', label: t('models.modelTwo') },
    { value: 'claude-sonnet-4-20250514', label: t('models.modelThree') },
    { value: 'deepseek-r1', label: t('models.modelFour') },
    { value: 'glm-4', label: t('models.modelFive') }
  ]

  const copyToClipboard = async (text: string) => {
    try {
      setCopyError(null) // 清除之前的错误
      setCopyingContent(text) // 设置复制中状态
      
      // 优先使用现代 Clipboard API
      if (navigator?.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text)
        setCopiedContent(text)
        setTimeout(() => setCopiedContent(null), 2000)
        return
      }
      
      // 降级方案：使用传统的 execCommand 方法
      const textArea = document.createElement('textarea')
      textArea.value = text
      textArea.style.position = 'fixed'
      textArea.style.left = '-999999px'
      textArea.style.top = '-999999px'
      textArea.style.opacity = '0'
      textArea.setAttribute('readonly', '')
      document.body.appendChild(textArea)
      
      // 选择文本
      textArea.select()
      textArea.setSelectionRange(0, 99999) // 移动端兼容
      
      const success = document.execCommand('copy')
      document.body.removeChild(textArea)
      
      if (success) {
        setCopiedContent(text)
        setTimeout(() => setCopiedContent(null), 2000)
      } else {
        throw new Error('复制操作失败')
      }
    } catch (err) {
      console.error('复制失败:', err)
      setCopyError('复制失败，请手动选择并复制内容')
      setTimeout(() => setCopyError(null), 3000)
    } finally {
      setCopyingContent(null) // 清除复制中状态
    }
  }

  const copyAllContent = async (content: string) => {
    try {
      setCopyError(null)
      setAllContentCopied(false)
      setCopyingContent('ALL_CONTENT') // 特殊标识符
      
      // 优先使用现代 Clipboard API
      if (navigator?.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(content)
      } else {
        // 降级方案
        const textArea = document.createElement('textarea')
        textArea.value = content
        textArea.style.position = 'fixed'
        textArea.style.left = '-999999px'
        textArea.style.top = '-999999px'
        textArea.style.opacity = '0'
        textArea.setAttribute('readonly', '')
        document.body.appendChild(textArea)
        
        textArea.select()
        textArea.setSelectionRange(0, 99999)
        
        const success = document.execCommand('copy')
        document.body.removeChild(textArea)
        
        if (!success) {
          throw new Error('复制操作失败')
        }
      }
      
      // 成功复制后的反馈
      setAllContentCopied(true)
      setCopiedContent(content)
      
      // 设备振动反馈（如果支持）
      if (navigator.vibrate) {
        navigator.vibrate(100) // 振动100毫秒
      }
      
      // 重置状态
      setTimeout(() => {
        setAllContentCopied(false)
        setCopiedContent(null)
      }, 3000) // 延长显示时间为3秒
      
    } catch (err) {
      console.error('复制失败:', err)
      setCopyError('复制失败，请手动选择并复制内容')
      setTimeout(() => setCopyError(null), 3000)
    } finally {
      setCopyingContent(null)
    }
  }

  const handleGenerate = async () => {
    if (!basicContent.trim()) {
      setError(t('generator.inputRequired'))
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
        setError(t('generator.generateFailed'))
      }
    } catch (err: any) {
      console.error('生成笔记失败:', err)
      setError(err.response?.data?.detail || t('generator.networkError'))
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
    setSelectedModels(['gpt-4o']) // 重置为模型一（推荐）
    setGeneratedNotes({})
    setError('')
    setShowAdvanced(true)
    setShowResults(false) // 返回输入页面
  }

  const handleBackToInput = () => {
    setShowResults(false)
    setError('')
  }

  // 处理账号选择
  const handleAccountSelect = (accountId: number) => {
    const selectedAccount = storedAccounts.find(acc => acc.id === accountId)
    if (selectedAccount) {
      setAccountInfo({
        account_name: selectedAccount.account_name,
        account_type: selectedAccount.account_type,
        topic_keywords: selectedAccount.topic_keywords?.join(', ') || '',
        platform: selectedAccount.platform
      })
      setSelectedAccountId(accountId)
    }
  }

  // 移除 handleToggleStoredAccount 函数，不再需要

  // 获取实际使用的模型列表
  const actualModels = selectedModels.length > 0 ? selectedModels : ['gpt-4o']

  // 如果显示结果，渲染结果页面
  if (showResults) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          {/* 结果页头部 */}
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">
                    {actualModels.length === 1 ? t('generator.generationResults') : t('generator.modelComparison')}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {actualModels.length === 1 
                      ? t('generator.aiReady')
                      : `${actualModels.length} ${t('generator.modelResults')}`
                    }
                  </p>
                </div>
              </div>
              <button
                onClick={handleBackToInput}
                className="px-4 py-2 text-gray-600 hover:text-pink-600 transition-colors flex items-center gap-2 rounded-lg hover:bg-pink-50"
              >
                <ChevronDown className="w-4 h-4 rotate-90" />
                {t('generator.backToEdit')}
              </button>
            </div>
          </div>

          {/* 结果内容 */}
          <div className="p-6">

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
                  copyingContent={copyingContent}
                  copyToClipboard={copyToClipboard} 
                />
              </div>
              
              <div className="space-y-4">
                {generatedNotes[actualModels[0]] && (
                  <>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-gray-800">{t('generator.commentGuide')}</h4>
                        <button
                          onClick={() => copyToClipboard(generatedNotes[actualModels[0]]?.comment_guide || '')}
                          className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                          title={t('generator.copyCommentGuide')}
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
                        <h4 className="font-medium text-gray-800">{t('generator.interactiveQuestions')}</h4>
                        <button
                          onClick={() => copyToClipboard(generatedNotes[actualModels[0]]?.comment_questions || '')}
                          className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                          title={t('generator.copyCommentQuestions')}
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
                          const allContent = `${note.note_title}\n\n${note.note_content}\n\n${t('generator.commentGuideLabel')}\n${note.comment_guide}\n\n${t('generator.commentQuestionsLabel')}\n${note.comment_questions}`
                          copyAllContent(allContent)
                        }
                      }}
                      className={`w-full px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
                        copyingContent === 'ALL_CONTENT'
                          ? 'bg-blue-500 hover:bg-blue-600 text-white'
                          : allContentCopied
                          ? 'bg-green-500 hover:bg-green-600 text-white'
                          : 'bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white'
                      }`}
                    >
                      {copyingContent === 'ALL_CONTENT' ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          {t('generator.copying')}
                        </>
                      ) : allContentCopied ? (
                        <>
                          <Check className="w-4 h-4" />
                          {t('generator.copySuccess')}
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          {t('generator.copyAllContent')}
                        </>
                      )}
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
                  {t('generator.modelsSelected')} {actualModels.length} {t('generator.modelsComparison')}
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
                            {t('generator.generateSuccess')}
                          </span>
                        )}
                      </div>
                      
                      <XiaohongshuPreview 
                        note={note} 
                        copiedContent={copiedContent} 
                        copyingContent={copyingContent}
                        copyToClipboard={copyToClipboard} 
                      />

                      {note && (
                        <div className="mt-4 space-y-3">
                          <div className="bg-white rounded-lg p-3">
                            <div className="flex items-center justify-between mb-1">
                              <div className="text-xs text-gray-600">{t('generator.commentGuide')}</div>
                              <button
                                onClick={() => copyToClipboard(note.comment_guide)}
                                className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                                title={t('generator.copyCommentGuide')}
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
                              <div className="text-xs text-gray-600">{t('generator.interactiveQuestions')}</div>
                              <button
                                onClick={() => copyToClipboard(note.comment_questions)}
                                className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                                title={t('generator.copyCommentQuestions')}
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
                          return `=== ${modelInfo?.label || model} ===\n\n${note.note_title}\n\n${note.note_content}\n\n${t('generator.commentGuideLabel')}\n${note.comment_guide}\n\n${t('generator.commentQuestionsLabel')}\n${note.comment_questions}\n\n`
                        }
                        return ''
                      }).join('\n')
                      copyAllContent(allContent)
                    }}
                    className={`w-full px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
                      copyingContent === 'ALL_CONTENT'
                        ? 'bg-blue-500 hover:bg-blue-600 text-white'
                        : allContentCopied
                        ? 'bg-green-500 hover:bg-green-600 text-white'
                        : 'bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white'
                    }`}
                  >
                    {copyingContent === 'ALL_CONTENT' ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        {t('generator.copying')}
                      </>
                    ) : allContentCopied ? (
                      <>
                        <Check className="w-4 h-4" />
                        {t('generator.copySuccessWithModels').replace('{count}', actualModels.length.toString())}
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        {t('generator.copyAllModelsResult')}
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          )}
          </div>
        </div>
      </div>
    )
  }

  // 输入页面
  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        {/* 表单头部 */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800">{t('generator.title')}</h3>
              <p className="text-sm text-gray-600">{t('generator.subtitle')}</p>
            </div>
          </div>
        </div>

        {/* 表单内容 */}
        <div className="p-6 space-y-6">

          {/* 基本内容输入 */}
          <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-xl p-6 border border-pink-100">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="w-5 h-5 text-pink-500" />
              <h3 className="text-base font-semibold text-gray-800">{t('generator.basicContent')}</h3>
              <span className="text-xs text-red-500 bg-red-100 px-2 py-1 rounded-full">{t('generator.basicContentRequired')}</span>
            </div>
            <textarea
              value={basicContent}
              onChange={(e) => setBasicContent(e.target.value)}
              placeholder={t('generator.basicContentPlaceholder')}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent resize-none bg-white"
              rows={4}
            />
            <p className="text-xs text-gray-600 mt-2 flex items-center gap-1">
              <span>💡</span>
              {t('generator.basicContentTip')}
            </p>
          </div>



          {/* 高级参数切换 */}
          <div className="border-t border-gray-100 pt-6">
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center gap-2 text-gray-600 hover:text-pink-600 transition-colors p-3 rounded-lg hover:bg-pink-50 w-full"
            >
              <Settings className="w-5 h-5" />
              <span className="text-sm font-medium">{t('generator.advancedSettings')}</span>
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full ml-auto mr-2">
                {showAdvanced ? t('generator.collapse') : t('generator.expand')}
              </span>
              <ChevronDown 
                className={`w-4 h-4 transition-transform ${showAdvanced ? 'rotate-180' : ''}`} 
              />
            </button>
          </div>

          {/* 高级参数输入区域 */}
          {showAdvanced && (
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 space-y-6 border border-gray-200">
            {/* 账号信息设置 */}
            <div className="bg-white rounded-lg p-5 shadow-sm border border-gray-100">
              <div className="flex items-center gap-2 mb-4 pb-2 border-b border-gray-100">
                <Users className="w-5 h-5 text-blue-500" />
                <h3 className="text-base font-semibold text-gray-800">{t('generator.accountInfo')}</h3>
                <span className="text-xs text-gray-500 bg-blue-50 px-2 py-1 rounded-full">{t('generator.accountInfoDesc')}</span>
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 block">{t('generator.selectAccount')}</label>
                  <select
                    value={selectedAccountId || ''}
                    onChange={(e) => {
                      const accountId = parseInt(e.target.value)
                      if (accountId) {
                        handleAccountSelect(accountId)
                      } else {
                        // 清空账号信息
                        setSelectedAccountId(null)
                        setAccountInfo({
                          account_name: '',
                          account_type: '',
                          topic_keywords: '',
                          platform: '小红书'
                        })
                      }
                    }}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white"
                  >
                    <option value="">{t('generator.selectAccountPlaceholder')}</option>
                    {storedAccounts.map((account) => (
                      <option key={account.id} value={account.id}>
                        {account.account_name} ({account.account_type} - {account.platform})
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500">💡 {t('generator.selectAccountTip')}</p>
                </div>

                {selectedAccountId && (
                  <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                    <h4 className="text-sm font-medium text-gray-800 mb-2 flex items-center gap-2">
                      <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                      {t('generator.currentSelectedAccount')}
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-gray-600">{t('generator.accountName')}</span>
                        <span className="font-medium text-blue-700">{accountInfo.account_name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-600">{t('generator.accountType')}</span>
                        <span className="font-medium text-blue-700">{accountInfo.account_type}</span>
                      </div>
                      <div className="md:col-span-2 flex items-start gap-2">
                        <span className="text-gray-600 mt-0.5">{t('generator.topicKeywords')}</span>
                        <span className="font-medium text-blue-700 flex-1">{accountInfo.topic_keywords || t('generator.notSet')}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* 内容定位设置 */}
            <div className="bg-white rounded-lg p-5 shadow-sm border border-gray-100">
              <div className="flex items-center gap-2 mb-4 pb-2 border-b border-gray-100">
                <Target className="w-5 h-5 text-green-500" />
                <h3 className="text-base font-semibold text-gray-800">{t('generator.contentPositioning')}</h3>
                <span className="text-xs text-gray-500 bg-green-50 px-2 py-1 rounded-full">{t('generator.contentPositioningDesc')}</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 block">{t('generator.notePurpose')}</label>
                  <select
                    value={notePurpose}
                    onChange={(e) => setNotePurpose(e.target.value)}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white"
                  >
                    <option value="">{t('generator.pleaseSelectNotePurpose')}</option>
                    <option value="流量互动">{t('options.trafficInteraction')}</option>
                    <option value="引导到店">{t('options.guideToStore')}</option>
                    <option value="拉动销售">{t('options.driveSales')}</option>
                    <option value="传播造势">{t('options.brandPromotion')}</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 block">{t('generator.contentType')}</label>
                  <select
                    value={contentType}
                    onChange={(e) => setContentType(e.target.value)}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-200 bg-white"
                  >
                    <option value="">{t('generator.pleaseSelectContentType')}</option>
                    <option value="明星/IP联动">{t('options.celebrityIP')}</option>
                    <option value="节庆/事件营销">{t('options.festivalEvent')}</option>
                    <option value="新店/促销种草">{t('options.newStorePromotion')}</option>
                    <option value="用户UGC共创">{t('options.userUGC')}</option>
                    <option value="休闲/玩乐/购物种草">{t('options.leisureShopping')}</option>
                    <option value="品牌宣传">{t('options.brandAdvertising')}</option>
                    <option value="通知公告">{t('options.announcement')}</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 block">{t('generator.targetAudience')}</label>
                  <select
                    value={targetAudience}
                    onChange={(e) => setTargetAudience(e.target.value)}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 bg-white"
                  >
                    <option value="">{t('generator.pleaseSelectTargetAudience')}</option>
                    <option value="购物爱好者">🛒 购物爱好者</option>
                    <option value="实用主义者">⚡ 实用主义者</option>
                    <option value="价格敏感者">💸 价格敏感者</option>
                    <option value="决策困难者">🤔 决策困难者</option>
                    <option value="产品研究者">🔍 产品研究者</option>
                    <option value="健康生活家">🌱 健康生活家</option>
                    <option value="生活品质控">✨ 生活品质控</option>
                    <option value="时尚追随者">👗 时尚追随者</option>
                    <option value="家庭主妇">👩‍👧‍👦 家庭主妇</option>
                    <option value="学生党">🎓 学生党</option>
                  </select>
                </div>
              </div>
            </div>

            {/* 内容风格设置 */}
            <div className="bg-white rounded-lg p-5 shadow-sm border border-gray-100">
              <div className="flex items-center gap-2 mb-4 pb-2 border-b border-gray-100">
                <FileText className="w-5 h-5 text-purple-500" />
                <h3 className="text-base font-semibold text-gray-800">{t('generator.contentStyle')}</h3>
                <span className="text-xs text-gray-500 bg-purple-50 px-2 py-1 rounded-full">{t('generator.contentStyleDesc')}</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 block">{t('generator.writingStyle')}</label>
                  <select
                    value={writingStyle}
                    onChange={(e) => setWritingStyle(e.target.value)}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-white"
                  >
                    <option value="">{t('generator.pleaseSelectWritingStyle')}</option>
                    <option value="口语化">{t('options.colloquial')}</option>
                    <option value="正式">{t('options.formal')}</option>
                    <option value="热情">{t('options.enthusiastic')}</option>
                    <option value="简洁">{t('options.concise')}</option>
                    <option value="礼貌">{t('options.polite')}</option>
                    <option value="高情商">{t('options.highEQ')}</option>
                    <option value="抒情">{t('options.lyrical')}</option>
                    <option value="诙谐">{t('options.witty')}</option>
                    <option value="夸张/情绪化">{t('options.exaggerated')}</option>
                    <option value="幽默">{t('options.humorous')}</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 block">{t('generator.recentTrends')}</label>
                  <input
                    type="text"
                    value={recentTrends}
                    onChange={(e) => setRecentTrends(e.target.value)}
                    placeholder={t('generator.trendExample')}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-white"
                  />
                  <p className="text-xs text-gray-500">💡 {t('generator.recentTrendsPlaceholder')}</p>
                </div>
              </div>
            </div>

            {/* 技术设置 */}
            <div className="bg-white rounded-lg p-5 shadow-sm border border-gray-100">
              <div className="flex items-center gap-2 mb-4 pb-2 border-b border-gray-100">
                <Cpu className="w-5 h-5 text-orange-500" />
                <h3 className="text-base font-semibold text-gray-800">{t('generator.techSettings')}</h3>
                <span className="text-xs text-gray-500 bg-orange-50 px-2 py-1 rounded-full">{t('generator.techSettingsDesc')}</span>
              </div>
              
              <div className="space-y-5">
                {/* AI 模型选择 */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-700">{t('generator.modelSelection')}</label>
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                      {t('generator.modelsSelected')} {selectedModels.length}/3 {t('generator.modelCount')}
                    </span>
                  </div>
                  
                  {/* 多选下拉组件 */}
                  <div className="relative" ref={modelDropdownRef}>
                    <button
                      type="button"
                      onClick={() => setIsModelDropdownOpen(!isModelDropdownOpen)}
                      className="w-full px-4 py-3 text-left bg-white border border-gray-200 rounded-lg hover:border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          {selectedModels.length === 0 ? (
                            <span className="text-gray-500">{t('generator.selectAIModel')}</span>
                          ) : (
                            <div className="flex flex-wrap gap-1">
                              {selectedModels.map((modelValue) => {
                                const model = availableModels.find(m => m.value === modelValue)
                                return (
                                  <span
                                    key={modelValue}
                                    className="inline-flex items-center gap-1 px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded-full"
                                  >
                                    {model?.label}
                                                                         <span
                                       onClick={(e) => {
                                         e.stopPropagation()
                                         setSelectedModels(selectedModels.filter(m => m !== modelValue))
                                       }}
                                       className="hover:bg-orange-200 rounded-full p-0.5 transition-colors cursor-pointer"
                                     >
                                       <X className="w-3 h-3" />
                                     </span>
                                  </span>
                                )
                              })}
                            </div>
                          )}
                        </div>
                        <ChevronDown 
                          className={`w-5 h-5 text-gray-400 transition-transform ${
                            isModelDropdownOpen ? 'rotate-180' : ''
                          }`} 
                        />
                      </div>
                    </button>

                    {/* 下拉选项 */}
                    {isModelDropdownOpen && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                        <div className="p-2">
                          {availableModels.map((model) => {
                            const isSelected = selectedModels.includes(model.value)
                            const isDisabled = !isSelected && selectedModels.length >= 3
                            
                            return (
                              <label
                                key={model.value}
                                className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                                  isDisabled 
                                    ? 'opacity-50 cursor-not-allowed' 
                                    : 'hover:bg-gray-50'
                                } ${
                                  isSelected ? 'bg-orange-50 border border-orange-200' : ''
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  disabled={isDisabled}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      if (selectedModels.length < 3) {
                                        setSelectedModels([...selectedModels, model.value])
                                      }
                                    } else {
                                      setSelectedModels(selectedModels.filter(m => m !== model.value))
                                    }
                                  }}
                                  className="w-4 h-4 text-orange-500 rounded border-gray-300 focus:ring-orange-500 disabled:opacity-50"
                                />
                                                                  <div className="flex-1">
                                    <div className={`text-sm font-medium ${isSelected ? 'text-orange-700' : 'text-gray-800'}`}>
                                      {model.label}
                                    </div>
                                  </div>
                                {isSelected && (
                                  <Check className="w-4 h-4 text-orange-500" />
                                )}
                              </label>
                            )
                          })}
                        </div>
                        
                        {selectedModels.length >= 3 && (
                          <div className="border-t border-gray-100 p-3 bg-orange-50">
                            <div className="flex items-center gap-2">
                              <span className="text-orange-500">⚠️</span>
                              <p className="text-xs text-orange-600">{t('generator.maxModelsReached')}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  
                  {/* 选择提示 */}
                  {selectedModels.length === 0 && (
                    <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
                      <span className="text-blue-500">💡</span>
                      <p className="text-sm text-blue-600">{t('generator.modelRecommendation')}</p>
                    </div>
                  )}
                </div>

                {/* 参考链接 */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <Link className="w-4 h-4 text-cyan-500" />
                    {t('generator.referenceLinks')}
                  </label>
                  <input
                    type="text"
                    value={referenceLinks}
                    onChange={(e) => setReferenceLinks(e.target.value)}
                    placeholder={t('generator.referenceLinkPlaceholder')}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-200 bg-white"
                  />
                  <p className="text-xs text-gray-500 flex items-center gap-1">
                    <span>ℹ️</span>
                    {t('generator.referenceLinksTip')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <span className="text-red-500">❌</span>
                <p className="text-red-600">{error}</p>
              </div>
            </div>
          )}

          {copyError && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <span className="text-orange-500">⚠️</span>
                <p className="text-orange-600">{copyError}</p>
              </div>
            </div>
          )}

          {allContentCopied && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <Check className="w-5 h-5 text-green-500" />
                <p className="text-green-600 font-medium">{t('generator.contentCopiedSuccess')}</p>
              </div>
            </div>
          )}
        </div>

        {/* 底部按钮区域 */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 rounded-b-xl">
          <div className="flex gap-4">
            <button
              onClick={handleGenerate}
              disabled={isLoading || !basicContent.trim()}
              className="flex-1 bg-gradient-to-r from-pink-500 to-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:from-pink-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2 shadow-sm"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {t('generator.generating')}
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  {t('generator.startGenerate')} ({actualModels.length} {t('generator.modelCount')})
                </>
              )}
            </button>

            <button
              onClick={handleReset}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-100 transition-all duration-200 bg-white shadow-sm"
            >
              {t('common.reset')}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
} 