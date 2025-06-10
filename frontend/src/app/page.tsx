'use client'

import { useState, useEffect } from 'react'
import { NoteGenerator } from './components/NoteGenerator'
import { NotesTable } from './components/NotesTable'
import { FileText, Sparkles, Home, BarChart3, Users, Settings, HelpCircle, Shield, TrendingUp } from 'lucide-react'

export default function Home() {
  const [activeTab, setActiveTab] = useState<'generate' | 'manage'>('generate')
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  const handleNoteGenerated = () => {
    setRefreshTrigger(prev => prev + 1)
  }

  const sidebarItems = [
    { id: 'account', label: '账号管理', icon: Users, active: false, disabled: true },
    { id: 'generate', label: '内容生成', icon: Sparkles, active: activeTab === 'generate' },
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
            <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
                智能内容平台
              </h1>
              <p className="text-sm text-gray-500">管理系统</p>
            </div>
          </div>
        </div>

        {/* 主导航 */}
        <div className="flex-1 py-6">
          <nav className="px-4 space-y-2">
            {sidebarItems.map((item) => (
              <button
                key={item.id}
                onClick={() => !item.disabled && item.id === 'generate' && setActiveTab(item.id as 'generate' | 'manage')}
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
                {activeTab === 'generate' ? '内容生成' : '管理笔记'}
              </h2>
              <p className="text-gray-600 mt-1">
                {activeTab === 'generate' 
                  ? '基于 DeepSeek AI 的智能小红书图文笔记生成工具' 
                  : '查看和管理已生成的笔记内容'
                }
              </p>
            </div>
            <div className="text-sm text-gray-500">
              最近登录时间: 2025-05-28
            </div>
          </div>
        </div>

        {/* 主内容区域 */}
        <div className="flex-1 p-8 bg-gradient-to-br from-pink-50 to-purple-50">
          <div className="max-w-6xl mx-auto">
            {activeTab === 'generate' ? (
              <NoteGenerator onNoteGenerated={handleNoteGenerated} />
            ) : (
              <NotesTable refreshTrigger={refreshTrigger} />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
