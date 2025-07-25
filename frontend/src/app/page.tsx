'use client'

import { useState, useEffect } from 'react'
import { NoteGenerator } from './components/NoteGenerator'
import { NotesTable } from './components/NotesTable'
import { ClientAccountTable } from './components/ClientAccountTable'
import { LanguageSwitcher } from './components/LanguageSwitcher'
import { LawnMowerGenerator } from './components/LawnMowerGenerator'
import { useLanguage } from '../contexts/LanguageContext'
import { FileText, Sparkles, BarChart3, Users, Settings, HelpCircle, Shield, TrendingUp, ChevronDown, ChevronRight, PenTool } from 'lucide-react'
import Image from 'next/image'

export default function Home() {
  const [activeTab, setActiveTab] = useState<'generate' | 'generate-advanced' | 'manage' | 'history' | 'account'>('generate')
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const [loginTime, setLoginTime] = useState<string>('')
  const [generateDropdownOpen, setGenerateDropdownOpen] = useState(false)
  const { language, setLanguage, t } = useLanguage()

  useEffect(() => {
    setLoginTime(new Date().toLocaleDateString())
  }, [])

  const handleNoteGenerated = () => {
    setRefreshTrigger((prev: number) => prev + 1)
  }

  const sidebarItems = [
    { id: 'account', label: t('nav.account'), icon: Users, active: activeTab === 'account', disabled: false },
    { 
      id: 'generate', 
      label: t('nav.generate'), 
      icon: Sparkles, 
      active: activeTab === 'generate' || activeTab === 'generate-advanced',
      hasSubmenu: true,
      submenu: [
        { id: 'generate', label: '通用小红书-工作流', active: activeTab === 'generate' },
        { id: 'generate-advanced', label: '割草机-工作流', active: activeTab === 'generate-advanced' }
      ]
    },
    { id: 'history', label: t('nav.history'), icon: FileText, active: activeTab === 'history' },
    { id: 'violation', label: t('nav.violation'), icon: Shield, active: false, disabled: true },
    { id: 'tracking', label: t('nav.tracking'), icon: TrendingUp, active: false, disabled: true },
  ]

  const bottomItems = [
    { id: 'settings', label: t('nav.settings'), icon: Settings, disabled: true },
    { id: 'help', label: t('nav.help'), icon: HelpCircle, disabled: true },
  ]

  const handleMenuClick = (itemId: string, submenuId?: string) => {
    if (itemId === 'generate') {
      if (submenuId) {
        setActiveTab(submenuId as 'generate' | 'generate-advanced')
        // 保持下拉菜单展开状态，不关闭
      } else {
        setGenerateDropdownOpen(!generateDropdownOpen)
      }
    } else if (itemId === 'history' || itemId === 'account') {
      setActiveTab(itemId as 'history' | 'account')
      setGenerateDropdownOpen(false)
    }
  }

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
                {t('app.title')}
              </h1>
              <p className="text-sm text-gray-500">{t('app.subtitle')}</p>
            </div>
          </div>
        </div>

        {/* 主导航 */}
        <div className="flex-1 py-6">
          <nav className="px-4 space-y-2">
            {sidebarItems.map((item) => (
              <div key={item.id}>
                <button
                  onClick={() => handleMenuClick(item.id)}
                  disabled={item.disabled}
                  className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-left transition-all duration-200 relative ${
                    item.active
                      ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-md'
                      : item.disabled
                      ? 'text-gray-400 cursor-not-allowed'
                      : 'text-gray-600 hover:bg-pink-50 hover:text-pink-600'
                  }`}
                >
                  <item.icon className="w-5 h-5 flex-shrink-0" />
                  <span className="font-medium text-sm truncate flex-1">{item.label}</span>
                  {item.hasSubmenu && (
                    <div className="flex-shrink-0">
                      {generateDropdownOpen ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )}
                    </div>
                  )}
                  {item.disabled && (
                    <span className="text-xs bg-gray-200 text-gray-500 px-1.5 py-0.5 rounded-full whitespace-nowrap flex-shrink-0">
                      {t('nav.status.developing')}
                    </span>
                  )}
                </button>
                
                {/* 下拉子菜单 */}
                {item.hasSubmenu && generateDropdownOpen && (
                  <div className="mt-1 ml-6 space-y-1">
                    {item.submenu?.map((subItem) => (
                      <button
                        key={subItem.id}
                        onClick={() => handleMenuClick(item.id, subItem.id)}
                        className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left transition-all duration-200 text-sm ${
                          subItem.active
                            ? 'bg-gradient-to-r from-pink-400 to-purple-500 text-white shadow-sm'
                            : 'text-gray-600 hover:bg-pink-50 hover:text-pink-600'
                        }`}
                      >
                        <div className="w-2 h-2 rounded-full bg-current opacity-60"></div>
                        <span className="font-medium truncate flex-1">{subItem.label}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
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
                className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-left transition-all duration-200 text-gray-400 cursor-not-allowed relative"
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                <span className="font-medium text-sm truncate flex-1">{item.label}</span>
                <span className="text-xs bg-gray-200 text-gray-500 px-1.5 py-0.5 rounded-full whitespace-nowrap flex-shrink-0">
                  {t('nav.status.developing')}
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
                  ? '通用小红书-工作流'
                  : activeTab === 'generate-advanced'
                  ? '割草机-工作流'
                  : activeTab === 'history' 
                  ? t('page.history.title')
                  : activeTab === 'account'
                  ? t('page.account.title')
                  : t('page.generate.title')
                }
              </h2>
              <p className="text-gray-600 mt-1">
                {activeTab === 'generate' 
                  ? '通用的小红书内容生成工作流，适用于各种场景的内容创作'
                  : activeTab === 'generate-advanced'
                  ? '专业的割草机产品内容生成工作流，针对特定产品优化'
                  : activeTab === 'history'
                  ? t('page.history.description')
                  : activeTab === 'account'
                  ? t('page.account.description')
                  : t('page.generate.description')
                }
              </p>
            </div>
            <div className="flex items-center gap-4">
              <LanguageSwitcher 
                currentLanguage={language} 
                onLanguageChange={setLanguage} 
              />
              <div className="text-sm text-gray-500">
                {loginTime && `${t('common.lastLogin')}: ${loginTime}`}
              </div>
            </div>
          </div>
        </div>

        {/* 主内容区域 */}
        <div className="flex-1 p-8 bg-gradient-to-br from-pink-50 to-purple-50">
          <div className="max-w-6xl mx-auto">
            {activeTab === 'generate' ? (
              <NoteGenerator onNoteGenerated={handleNoteGenerated} />
            ) : activeTab === 'generate-advanced' ? (
              <LawnMowerGenerator />
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
