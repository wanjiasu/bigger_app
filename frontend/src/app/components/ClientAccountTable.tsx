'use client'

import { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, Tag } from 'lucide-react'
import { API_BASE_URL } from '../../config/api'

interface ClientAccount {
  id: number
  account_name: string
  account_type: string
  topic_keywords: string[]
  platform: string
  created_at: string
  updated_at?: string
}

interface ClientAccountTableProps {
  refreshTrigger?: number
}

export function ClientAccountTable({ refreshTrigger = 0 }: ClientAccountTableProps) {
  const [accounts, setAccounts] = useState<ClientAccount[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [formData, setFormData] = useState({
    account_name: '',
    account_type: '',
    topic_keywords: '',
    platform: '小红书'
  })

  const fetchAccounts = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${API_BASE_URL}/client-accounts/`)
      if (response.ok) {
        const data = await response.json()
        setAccounts(data)
      }
    } catch (error) {
      console.error('获取账号信息失败:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAccounts()
  }, [refreshTrigger])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const keywordsArray = formData.topic_keywords
        .split(',')
        .map(keyword => keyword.trim())
        .filter(keyword => keyword.length > 0)

      const response = await fetch(`${API_BASE_URL}/client-accounts/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          topic_keywords: keywordsArray
        }),
      })

      if (response.ok) {
        setShowModal(false)
        setFormData({
          account_name: '',
          account_type: '',
          topic_keywords: '',
          platform: '小红书'
        })
        fetchAccounts()
      }
    } catch (error) {
      console.error('创建账号失败:', error)
    }
  }

  const handleDelete = async (id: number) => {
    if (confirm('确定要删除这个账号吗？')) {
      try {
        const response = await fetch(`${API_BASE_URL}/client-accounts/${id}`, {
          method: 'DELETE',
        })
        if (response.ok) {
          fetchAccounts()
        }
      } catch (error) {
        console.error('删除账号失败:', error)
      }
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100">
      {/* 表格头部 */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-800">账号信息管理</h3>
            <p className="text-sm text-gray-600 mt-1">管理您的社交媒体账号信息</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg hover:from-pink-600 hover:to-purple-700 transition-all duration-200 shadow-md hover:shadow-lg"
          >
            <Plus className="w-4 h-4" />
            添加账号
          </button>
        </div>
      </div>

      {/* 表格内容 */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                账号名称
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                账号类型
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                常驻话题
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                发布平台
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                创建时间
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                操作
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {accounts.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                  <div className="flex flex-col items-center">
                    <Tag className="w-12 h-12 text-gray-300 mb-4" />
                    <p className="text-lg font-medium">暂无账号信息</p>
                    <p className="text-sm">点击右上角"添加账号"按钮开始创建</p>
                  </div>
                </td>
              </tr>
            ) : (
              accounts.map((account) => (
                <tr key={account.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {account.account_name}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {account.account_type}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {account.topic_keywords?.map((keyword, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-pink-100 text-pink-800"
                        >
                          {keyword}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {account.platform}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(account.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-2">
                      <button
                        className="text-indigo-600 hover:text-indigo-900 p-1 rounded-md hover:bg-indigo-50"
                        title="编辑"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(account.id)}
                        className="text-red-600 hover:text-red-900 p-1 rounded-md hover:bg-red-50"
                        title="删除"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* 创建账号模态框 */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">添加新账号</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  账号名称
                </label>
                <input
                  type="text"
                  required
                  value={formData.account_name}
                  onChange={(e) => setFormData({ ...formData, account_name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                  placeholder="输入账号名称"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  账号类型
                </label>
                <input
                  type="text"
                  required
                  value={formData.account_type}
                  onChange={(e) => setFormData({ ...formData, account_type: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                  placeholder="输入账号类型，如：个人、企业、品牌、机构等"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  常驻话题关键词
                </label>
                <textarea
                  value={formData.topic_keywords}
                  onChange={(e) => setFormData({ ...formData, topic_keywords: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                  placeholder="用逗号分隔多个关键词，如：美食,旅行,生活,摄影,时尚,健身"
                  rows={3}
                />
                <p className="text-xs text-gray-500 mt-1">
                  💡 提示：每个关键词用逗号分隔，可以输入多行
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  发布平台
                </label>
                <select
                  required
                  value={formData.platform}
                  onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                >
                  <option value="小红书">小红书</option>
                  <option value="抖音">抖音</option>
                  <option value="微博">微博</option>
                  <option value="B站">B站</option>
                </select>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg hover:from-pink-600 hover:to-purple-700 transition-all duration-200"
                >
                  创建账号
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
} 