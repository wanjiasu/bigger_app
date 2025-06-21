'use client'

import { useState, useEffect } from 'react'
import { NoteGenerator } from './components/NoteGenerator'
import { NotesTable } from './components/NotesTable'
import { ClientAccountTable } from './components/ClientAccountTable'
import { FileText, Sparkles, BarChart3, Users, Settings, HelpCircle, Shield, TrendingUp } from 'lucide-react'
import Image from 'next/image'

export default function Home() {
  const [activeTab, setActiveTab] = useState<'generate' | 'manage' | 'history' | 'account'>('generate')
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const [loginTime, setLoginTime] = useState<string>('')

  useEffect(() => {
    setLoginTime(new Date().toLocaleDateString())
  }, [])

  const handleNoteGenerated = () => {
    setRefreshTrigger(prev => prev + 1)
  }

  const sidebarItems = [
    { id: 'account', label: '账号信息', icon: Users, active: activeTab === 'account', disabled: false },
    { id: 'generate', label: '内容生成', icon: Sparkles, active: activeTab === 'generate' },
    { id: 'history', label: '历史记录', icon: FileText, active: activeTab === 'history' },
    { id: 'violation', label: '违规检测', icon: Shield, active: false, disabled: true },
    { id: 'tracking', label: '数据追踪', icon: TrendingUp, active: false, disabled: true },
  ]

  const bottomItems = [
    { id: 'settings', label: '系统管理', icon: Settings, disabled: true },
    { id: 'help', label: '帮助中心', icon: HelpCircle, disabled: true },
  ]

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* 左侧边栏 */}
      <div className="w-64 bg-white shadow-lg flex flex-col">
        {/* Logo 区域 */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 relative">
              <Image 
                src="/logo.png" 
                alt="胜利手势logo" 
                width={40} 
                height={40} 
                className="rounded-lg object-cover"
              />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
                胜利手势
              </h1>
              <p className="text-sm text-gray-500">商业地产内容生产</p>
            </div>
          </div>
        </div>

        {/* 主导航 */}
        <div className="flex-1 py-6">
          <nav className="px-4 space-y-2">
            {sidebarItems.map((item) => (
              <button
                key={item.id}
                onClick={() => !item.disabled && (item.id === 'generate' || item.id === 'history' || item.id === 'account') && setActiveTab(item.id as 'generate' | 'manage' | 'history' | 'account')}
                disabled={item.disabled}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all duration-200 relative ${
                  item.active
                    ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-md'
                    : item.disabled
                    ? 'text-gray-400 cursor-not-allowed'
                    : 'text-gray-600 hover:bg-pink-50 hover:text-pink-600'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
                {item.disabled && (
                  <span className="ml-auto text-xs bg-gray-200 text-gray-500 px-2 py-1 rounded-full">
                    待开发
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* 底部导航 */}
        <div className="border-t border-gray-100 p-4">
          <nav className="space-y-2">
            {bottomItems.map((item) => (
              <button
                key={item.id}
                disabled={item.disabled}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all duration-200 text-gray-400 cursor-not-allowed relative"
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
                <span className="ml-auto text-xs bg-gray-200 text-gray-500 px-2 py-1 rounded-full">
                  待开发
                </span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* 右侧内容区域 */}
      <div className="flex-1 flex flex-col">
        {/* 顶部标题栏 */}
        <div className="bg-white shadow-sm border-b border-gray-100 px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">
                {activeTab === 'generate' 
                  ? '内容生成' 
                  : activeTab === 'history' 
                  ? '历史记录' 
                  : activeTab === 'account'
                  ? '账号信息'
                  : '管理笔记'
                }
              </h2>
              <p className="text-gray-600 mt-1">
                {activeTab === 'generate' 
                  ? '基于 DeepSeek AI 的智能商业地产内容生成工具' 
                  : activeTab === 'history'
                  ? '查看所有历史生成记录，包含详细参数和生成结果'
                  : activeTab === 'account'
                  ? '管理您的社交媒体账号信息，包括账号类型和常驻话题'
                  : '查看和管理已生成的笔记内容'
                }
              </p>
            </div>
            <div className="text-sm text-gray-500">
              {loginTime && `最近登录时间: ${loginTime}`}
            </div>
          </div>
        </div>

        {/* 主内容区域 */}
        <div className="flex-1 p-8 bg-gradient-to-br from-pink-50 to-purple-50">
          <div className="max-w-6xl mx-auto">
            {activeTab === 'generate' ? (
              <NoteGenerator onNoteGenerated={handleNoteGenerated} />
            ) : activeTab === 'history' ? (
              <NotesTable refreshTrigger={refreshTrigger} showDetailed={true} />
            ) : activeTab === 'account' ? (
              <ClientAccountTable refreshTrigger={refreshTrigger} />
            ) : (
              <NotesTable refreshTrigger={refreshTrigger} showDetailed={false} />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
