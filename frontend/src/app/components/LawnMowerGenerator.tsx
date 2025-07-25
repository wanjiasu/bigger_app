'use client'

import React, { useState, useEffect } from 'react'
import { useLanguage } from '../../contexts/LanguageContext'
import { 
  PenTool, 
  Send, 
  Loader2, 
  Copy, 
  CheckCircle, 
  Globe, 
  Target, 
  Sparkles, 
  Users, 
  MessageSquare, 
  Calendar, 
  Scissors, 
  ChevronDown,
  Zap,
  Settings,
  Brain,
  Palette
} from 'lucide-react'
import { API_ENDPOINTS } from '../../config/api'

interface LawnMowerFormData {
  spu: string
  sku: string
  language: string
  target_platform: string
  opening_hook: string
  narrative_perspective: string
  content_logic: string
  value_proposition: string
  key_selling_points: string[]
  specific_scenario: string[]
  user_persona: string
  content_style: string
  holiday_season: string
  ai_model: string[]
}

interface GeneratedContent {
  titles: {
    chinese: string[]
    english: string[]
  }
  main_content: {
    chinese: string
    english: string
  }
  visual_suggestions: {
    image_video_content: string
    scene_atmosphere: string
    composition_focus: string
    color_tone: string
  }
  interaction_guide: {
    chinese: string
    english: string
  }
  hashtags: {
    chinese: string[]
    english: string[]
  }
}

export function LawnMowerGenerator() {
  const { t } = useLanguage()
  const [formData, setFormData] = useState<LawnMowerFormData>({
    spu: '',
    sku: '',
    language: 'chinese',
    target_platform: 'Facebook',
    opening_hook: '',
    narrative_perspective: '',
    content_logic: '',
    value_proposition: '',
    key_selling_points: [],
    specific_scenario: [],
    user_persona: '',
    content_style: '',
    holiday_season: '',
    ai_model: []
  })

  const [generatedContent, setGeneratedContent] = useState<GeneratedContent | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [copiedItem, setCopiedItem] = useState<string | null>(null)
  const [availableSkus, setAvailableSkus] = useState<string[]>([])
  const [productsData, setProductsData] = useState<any>(null)
  const [modelDropdownOpen, setModelDropdownOpen] = useState(false)
  const [sellingPointDropdownOpen, setSellingPointDropdownOpen] = useState(false)
  const [scenarioDropdownOpen, setScenarioDropdownOpen] = useState(false)

  // 加载产品数据
  useEffect(() => {
    const loadProductsData = async () => {
      try {
        const response = await fetch(API_ENDPOINTS.LAWN_MOWER_PRODUCTS)
        console.log('Loading products data...');
        const data = await response.json()
        console.log('Loaded products data:', data);
        setProductsData(data)
      } catch (error) {
        console.error('加载产品数据失败:', error)
      }
    }
    loadProductsData()
  }, [])

  const handleInputChange = (field: keyof LawnMowerFormData, value: string) => {
    setFormData((prev: LawnMowerFormData) => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSpuChange = (spuValue: string) => {
    console.log('Selected SPU:', spuValue);
    setFormData((prev: LawnMowerFormData) => ({
      ...prev,
      spu: spuValue,
      sku: '' // 重置SKU选择
    }))

    // 更新可用的SKU列表
    if (productsData && spuValue) {
      const seriesData = productsData[spuValue]
      console.log('Series Data:', seriesData);
      console.log('SKUs:', seriesData?.SKUs); // 添加这行来调试
      if (seriesData?.SKUs) {
        const skus = Object.keys(seriesData.SKUs);
        console.log('Available SKUs:', skus);
        setAvailableSkus(skus)
      } else {
        console.log('No SKUs found in series data');
        setAvailableSkus([])
      }
    } else {
      console.log('No product data or SPU value');
      setAvailableSkus([])
    }
  }

  const handleModelToggle = (modelValue: string) => {
    setFormData((prev: LawnMowerFormData) => {
      const currentModels = prev.ai_model
      const newModels = currentModels.includes(modelValue)
        ? currentModels.filter(m => m !== modelValue)
        : [...currentModels, modelValue]
      
      return {
        ...prev,
        ai_model: newModels
      }
    })
  }

  const removeModel = (modelValue: string) => {
    setFormData((prev: LawnMowerFormData) => ({
      ...prev,
      ai_model: prev.ai_model.filter(m => m !== modelValue)
    }))
  }

  const handleSellingPointToggle = (pointValue: string) => {
    setFormData((prev: LawnMowerFormData) => {
      const currentPoints = prev.key_selling_points
      const newPoints = currentPoints.includes(pointValue)
        ? currentPoints.filter(p => p !== pointValue)
        : [...currentPoints, pointValue]
      
      return {
        ...prev,
        key_selling_points: newPoints
      }
    })
  }

  const removeSellingPoint = (pointValue: string) => {
    setFormData((prev: LawnMowerFormData) => ({
      ...prev,
      key_selling_points: prev.key_selling_points.filter(p => p !== pointValue)
    }))
  }

  const handleScenarioToggle = (scenarioValue: string) => {
    setFormData((prev: LawnMowerFormData) => {
      const currentScenarios = prev.specific_scenario
      const newScenarios = currentScenarios.includes(scenarioValue)
        ? currentScenarios.filter(s => s !== scenarioValue)
        : [...currentScenarios, scenarioValue]
      
      return {
        ...prev,
        specific_scenario: newScenarios
      }
    })
  }

  const removeScenario = (scenarioValue: string) => {
    setFormData((prev: LawnMowerFormData) => ({
      ...prev,
      specific_scenario: prev.specific_scenario.filter(s => s !== scenarioValue)
    }))
  }

  const handleGenerate = async () => {
    if (!formData.spu || formData.ai_model.length === 0) {
      alert('请填写必填字段：SPU、AI模型')
      return
    }

    setIsGenerating(true)
    try {
      // 将数组字段转换为字符串，以匹配后端schema
      const requestData = {
        ...formData,
        key_selling_points: Array.isArray(formData.key_selling_points) 
          ? formData.key_selling_points.join('、') 
          : formData.key_selling_points,
        specific_scenario: Array.isArray(formData.specific_scenario)
          ? formData.specific_scenario.join('、')
          : formData.specific_scenario
      }

      const response = await fetch(API_ENDPOINTS.LAWN_MOWER_GENERATE, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const result = await response.json()
      
      if (result.success) {
        // 处理多模型结果
        if (result.data.results && result.data.results.length > 0) {
          // 使用第一个结果
          setGeneratedContent(result.data.results[0])
        } else {
          setGeneratedContent(result.data)
        }
      } else {
        alert(result.error || '生成失败，请重试')
      }
    } catch (error) {
      console.error('生成内容失败:', error)
      alert('生成失败，请检查网络连接或联系管理员')
    } finally {
      setIsGenerating(false)
    }
  }

  const copyToClipboard = async (text: string, itemKey: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedItem(itemKey)
      setTimeout(() => setCopiedItem(null), 2000)
    } catch (error) {
      console.error('复制失败:', error)
    }
  }

  const spuOptions = [
    'YUKA mini Series',
    'LUBA mini AWD Series', 
    'LUBA 2 AWD X Series',
    'YUKA Series'
  ]

  const platformOptions = [
    'Facebook',
    '小红书'
  ]

  const styleOptions = [
    '口语化',
    '热情',
    '简洁',
    '礼貌',
    '抒情',
    '幽默',
    '诗意',
    '真诚',
    '高级',
    '宁静'
  ]

  const openingHookOptions = [
    '反问式',
    '痛点式',
    '颠覆认知式',
    '说数据式',
    '讲故事式'
  ]

  const narrativePerspectiveOptions = [
    '父亲/母亲视角',
    '宠物视角',
    '产品拟人化视角',
    '数据控视角',
    '问题解决者视角',
    '幕后故事视角'
  ]

  const contentLogicOptions = [
    '情感驱动-打动人心',
    '逻辑驱动-理性举证'
  ]

  const valuePropositionOptions = [
    '价值展示型内容',
    '功能深度解析型内容',
    '用户证言与社群驱动型内容',
    '教育与支持型内容'
  ]

  const sellingPointsOptions = [
    '解放时间',
    '智能便捷',
    '低噪音安全',
    '坡度适应安全',
    '长续航大容量',
    '单次充电长时间工作',
    '节能低耗',
    'RTK - GPS厘米级精度',
    'AI视觉避障',
    '全轮驱动AWD'
  ]

  const specificScenarioOptions = [
    '用户反馈&评论分享',
    '功能技术解读',
    '使用场景展示',
    '限时促销启动',
    '产品型号对比',
    '活动提醒',
    '本地草坪场景分享',
    '技术解读',
    '安全家庭场景',
    '安全避障功能'
  ]

  const userPersonaOptions = [
    '科技爱好者',
    '忙碌的专业人士/中产家庭',
    '年长或行动不便的房主',
    '追求完美的庭院主人'
  ]

  const aiModelOptions = [
    { value: 'claude-3-5-sonnet-latest', label: 'Claude 3.5 Sonnet' },
    { value: 'claude-sonnet-4-20250514', label: 'Claude Sonnet 4' },
    { value: 'gpt-4o', label: 'GPT-4o' },
    { value: 'deepseek-r1', label: 'DeepSeek R1' },
    { value: 'glm-4', label: 'GLM-4' }
  ]

  // 现代化的下拉框组件
  const ModernSelect = ({ label, value, onChange, options, placeholder, icon: Icon, required = false }: {
    label: string
    value: string
    onChange: (value: string) => void
    options: string[]
    placeholder: string
    icon?: any
    required?: boolean
  }) => (
    <div className="group">
      <label className="flex items-center gap-1 text-xs font-semibold text-gray-800 mb-2">
        {Icon && <Icon className="w-3 h-3 text-gray-600" />}
        {label}
        {required && <span className="text-rose-500">*</span>}
      </label>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-xl shadow-sm
                   hover:border-blue-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-50
                   transition-all duration-200 appearance-none cursor-pointer
                   text-gray-700 text-sm"
        >
          <option value="">{placeholder}</option>
          {options.map(option => (
            <option key={option} value={option} className="py-1">{option}</option>
          ))}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
      </div>
    </div>
  )

  // 现代化的多选下拉框组件
  const ModernMultiSelect = ({ 
    label, 
    values, 
    onToggle, 
    onRemove, 
    options, 
    placeholder, 
    icon: Icon,
    isOpen,
    setIsOpen,
    colorScheme = 'blue'
  }: {
    label: string
    values: string[]
    onToggle: (value: string) => void
    onRemove: (value: string) => void
    options: string[]
    placeholder: string
    icon?: any
    isOpen: boolean
    setIsOpen: (open: boolean) => void
    colorScheme?: 'blue' | 'purple' | 'pink'
  }) => {
    const colorClasses = {
      blue: 'bg-blue-50 text-blue-700 border-blue-200',
      purple: 'bg-purple-50 text-purple-700 border-purple-200',
      pink: 'bg-pink-50 text-pink-700 border-pink-200'
    }

    return (
      <div className="group">
        <label className="flex items-center gap-1 text-xs font-semibold text-gray-800 mb-2">
          {Icon && <Icon className="w-3 h-3 text-gray-600" />}
          {label}
        </label>
        <div className="relative">
          <button
            type="button"
            className="w-full px-3 py-2.5 text-left bg-white border border-gray-200 rounded-xl shadow-sm
                     hover:border-blue-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-50
                     transition-all duration-200 min-h-[42px]"
            onClick={() => setIsOpen(!isOpen)}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                {values.length > 0 ? (
                  <div className="flex flex-wrap gap-1">
                    {values.map((item) => (
                      <span
                        key={item}
                        className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full border ${colorClasses[colorScheme]}`}
                      >
                        <span className="truncate max-w-[80px]">{item}</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            onRemove(item)
                          }}
                          className="hover:bg-opacity-20 hover:bg-gray-800 rounded-full p-0.5 transition-colors flex-shrink-0"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                ) : (
                  <span className="text-gray-500 text-sm">{placeholder}</span>
                )}
              </div>
              <ChevronDown 
                className={`w-4 h-4 text-gray-400 transition-transform flex-shrink-0 ml-2 ${
                  isOpen ? 'transform rotate-180' : ''
                }`} 
              />
            </div>
          </button>
          {isOpen && (
            <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-xl max-h-48 overflow-y-auto">
              {options.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => onToggle(option)}
                  className={`w-full px-3 py-2 text-left hover:bg-gray-50 transition-colors text-sm first:rounded-t-xl last:rounded-b-xl ${
                    values.includes(option)
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span>{option}</span>
                    {values.includes(option) && (
                      <CheckCircle className="w-3 h-3 text-blue-600" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* 背景装饰 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-full blur-2xl"></div>
        <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-gradient-to-br from-pink-400/20 to-rose-600/20 rounded-full blur-2xl"></div>
      </div>

      <div className="relative max-w-6xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl mb-3 shadow-md">
            <Scissors className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-2">
            割草机内容生成工作流
          </h1>
          <p className="text-sm text-gray-600 max-w-xl mx-auto">
            基于AI的专业割草机产品内容生成工具，为您的营销策略提供智能化解决方案
          </p>
        </div>

        {/* 表单区域 */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 p-4 mb-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            
            {/* 产品信息 */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                  <Settings className="w-4 h-4 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-800">产品信息</h3>
              </div>
              
              <ModernSelect
                label="产品系列"
                value={formData.spu}
                onChange={handleSpuChange}
                options={spuOptions}
                placeholder="选择产品系列"
                icon={Zap}
                required
              />

              <ModernSelect
                label="具体型号"
                value={formData.sku}
                onChange={(value) => handleInputChange('sku', value)}
                options={availableSkus}
                placeholder={!formData.spu ? "请先选择产品系列" : "选择具体型号"}
                icon={Target}
              />

              <ModernSelect
                label="语言"
                value={formData.language}
                onChange={(value) => handleInputChange('language', value)}
                options={['chinese', 'english']}
                placeholder="选择语言"
                icon={Globe}
              />

              <ModernSelect
                label="目标平台"
                value={formData.target_platform}
                onChange={(value) => handleInputChange('target_platform', value)}
                options={platformOptions}
                placeholder="选择目标平台"
                icon={MessageSquare}
              />
            </div>

            {/* 内容策略 */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                  <Brain className="w-4 h-4 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-800">内容策略</h3>
              </div>

              <ModernSelect
                label="开场钩子"
                value={formData.opening_hook}
                onChange={(value) => handleInputChange('opening_hook', value)}
                options={openingHookOptions}
                placeholder="选择开场钩子"
                icon={Sparkles}
              />

              <ModernSelect
                label="叙事视角"
                value={formData.narrative_perspective}
                onChange={(value) => handleInputChange('narrative_perspective', value)}
                options={narrativePerspectiveOptions}
                placeholder="选择叙事视角"
                icon={Users}
              />

              <ModernSelect
                label="内容驱动逻辑"
                value={formData.content_logic}
                onChange={(value) => handleInputChange('content_logic', value)}
                options={contentLogicOptions}
                placeholder="选择内容驱动逻辑"
                icon={Target}
              />

              <ModernSelect
                label="内容价值主张"
                value={formData.value_proposition}
                onChange={(value) => handleInputChange('value_proposition', value)}
                options={valuePropositionOptions}
                placeholder="选择内容价值主张"
                icon={CheckCircle}
              />
            </div>
          </div>

          {/* 产品卖点和场景 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-800">产品卖点</h3>
              </div>

              <ModernMultiSelect
                label="主打卖点"
                values={formData.key_selling_points}
                onToggle={handleSellingPointToggle}
                onRemove={removeSellingPoint}
                options={sellingPointsOptions}
                placeholder="选择主打卖点"
                icon={Zap}
                isOpen={sellingPointDropdownOpen}
                setIsOpen={setSellingPointDropdownOpen}
                colorScheme="pink"
              />

              <ModernMultiSelect
                label="具体场景"
                values={formData.specific_scenario}
                onToggle={handleScenarioToggle}
                onRemove={removeScenario}
                options={specificScenarioOptions}
                placeholder="选择具体场景"
                icon={Calendar}
                isOpen={scenarioDropdownOpen}
                setIsOpen={setScenarioDropdownOpen}
                colorScheme="purple"
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center">
                  <Palette className="w-4 h-4 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-800">受众与风格</h3>
              </div>

              <ModernSelect
                label="用户画像"
                value={formData.user_persona}
                onChange={(value) => handleInputChange('user_persona', value)}
                options={userPersonaOptions}
                placeholder="选择用户画像"
                icon={Users}
              />

              <ModernSelect
                label="内容风格"
                value={formData.content_style}
                onChange={(value) => handleInputChange('content_style', value)}
                options={styleOptions}
                placeholder="选择内容风格"
                icon={Palette}
              />

              <div className="group">
                <label className="flex items-center gap-1 text-xs font-semibold text-gray-800 mb-2">
                  <Calendar className="w-3 h-3 text-gray-600" />
                  节日/时令
                </label>
                <input
                  type="text"
                  value={formData.holiday_season}
                  onChange={(e) => handleInputChange('holiday_season', e.target.value)}
                  placeholder="如：春季草坪护理、夏日庭院时光（可选）"
                  className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-xl shadow-sm
                           hover:border-blue-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-50
                           transition-all duration-200 text-gray-700 text-sm"
                />
              </div>
            </div>
          </div>

          {/* AI模型选择 */}
          <div className="mt-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center">
                <Brain className="w-4 h-4 text-white" />
              </div>
              <h3 className="text-lg font-bold text-gray-800">AI模型配置</h3>
            </div>

            <ModernMultiSelect
              label="AI模型"
              values={formData.ai_model}
              onToggle={handleModelToggle}
              onRemove={removeModel}
              options={aiModelOptions.map(opt => opt.value)}
              placeholder="选择AI模型"
              icon={Brain}
              isOpen={modelDropdownOpen}
              setIsOpen={setModelDropdownOpen}
              colorScheme="blue"
            />
          </div>

          {/* 生成按钮 */}
          <div className="mt-6 flex justify-center">
            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="group relative px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white 
                       rounded-xl font-semibold shadow-lg hover:shadow-xl
                       hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed 
                       transition-all duration-200 transform hover:scale-105"
            >
              <div className="flex items-center gap-2">
                {isGenerating ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    生成中...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    生成内容
                  </>
                )}
              </div>
              
              {/* 按钮光效 */}
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 opacity-0 group-hover:opacity-20 transition-opacity duration-200"></div>
            </button>
          </div>
        </div>

        {/* 生成结果展示区域 */}
        {generatedContent && (
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 p-4">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-4 h-4 text-white" />
              </div>
              <h3 className="text-lg font-bold text-gray-800">生成结果</h3>
            </div>
            
            <div className="space-y-4">
              {/* 标题选项 */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4">
                <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  标题选项
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-semibold text-gray-600 mb-2">中文版本</p>
                    {generatedContent.titles.chinese.map((title, index) => (
                      <div key={index} className="bg-white/80 p-3 rounded-lg mb-2 flex items-center justify-between shadow-sm">
                        <span className="text-xs text-gray-800">{title}</span>
                        <button
                          onClick={() => copyToClipboard(title, `title-cn-${index}`)}
                          className="text-blue-600 hover:text-blue-700 p-1 rounded hover:bg-blue-50 transition-colors"
                        >
                          {copiedItem === `title-cn-${index}` ? (
                            <CheckCircle className="w-3 h-3" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                      </div>
                    ))}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-600 mb-2">英文版本</p>
                    {generatedContent.titles.english.map((title, index) => (
                      <div key={index} className="bg-white/80 p-3 rounded-lg mb-2 flex items-center justify-between shadow-sm">
                        <span className="text-xs text-gray-800">{title}</span>
                        <button
                          onClick={() => copyToClipboard(title, `title-en-${index}`)}
                          className="text-blue-600 hover:text-blue-700 p-1 rounded hover:bg-blue-50 transition-colors"
                        >
                          {copiedItem === `title-en-${index}` ? (
                            <CheckCircle className="w-3 h-3" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* 主体文案 */}
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4">
                <h4 className="font-bold text-gray-800 mb-3">主体文案</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-semibold text-gray-600">中文版本</p>
                      <button
                        onClick={() => copyToClipboard(generatedContent.main_content.chinese, 'content-cn')}
                        className="text-purple-600 hover:text-purple-700 p-1 rounded hover:bg-purple-50 transition-colors"
                      >
                        {copiedItem === 'content-cn' ? (
                          <CheckCircle className="w-3 h-3" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </button>
                    </div>
                    <div className="bg-white/80 p-3 rounded-lg shadow-sm">
                      <pre className="whitespace-pre-wrap text-xs text-gray-800 leading-relaxed">
                        {generatedContent.main_content.chinese}
                      </pre>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-semibold text-gray-600">英文版本</p>
                      <button
                        onClick={() => copyToClipboard(generatedContent.main_content.english, 'content-en')}
                        className="text-purple-600 hover:text-purple-700 p-1 rounded hover:bg-purple-50 transition-colors"
                      >
                        {copiedItem === 'content-en' ? (
                          <CheckCircle className="w-3 h-3" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </button>
                    </div>
                    <div className="bg-white/80 p-3 rounded-lg shadow-sm">
                      <pre className="whitespace-pre-wrap text-xs text-gray-800 leading-relaxed">
                        {generatedContent.main_content.english}
                      </pre>
                    </div>
                  </div>
                </div>
              </div>

              {/* 视觉建议 */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4">
                <h4 className="font-bold text-gray-800 mb-3">视觉建议</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="bg-white/80 p-3 rounded-lg shadow-sm">
                    <h5 className="font-semibold text-gray-700 mb-2 text-sm">图片/视频内容</h5>
                    <p className="text-xs text-gray-600 leading-relaxed">{generatedContent.visual_suggestions.image_video_content}</p>
                  </div>
                  <div className="bg-white/80 p-3 rounded-lg shadow-sm">
                    <h5 className="font-semibold text-gray-700 mb-2 text-sm">场景氛围</h5>
                    <p className="text-xs text-gray-600 leading-relaxed">{generatedContent.visual_suggestions.scene_atmosphere}</p>
                  </div>
                  <div className="bg-white/80 p-3 rounded-lg shadow-sm">
                    <h5 className="font-semibold text-gray-700 mb-2 text-sm">构图重点</h5>
                    <p className="text-xs text-gray-600 leading-relaxed">{generatedContent.visual_suggestions.composition_focus}</p>
                  </div>
                  <div className="bg-white/80 p-3 rounded-lg shadow-sm">
                    <h5 className="font-semibold text-gray-700 mb-2 text-sm">色调建议</h5>
                    <p className="text-xs text-gray-600 leading-relaxed">{generatedContent.visual_suggestions.color_tone}</p>
                  </div>
                </div>
              </div>

              {/* 互动引导 */}
              <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-4">
                <h4 className="font-bold text-gray-800 mb-3">互动引导</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white/80 p-3 rounded-lg shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="font-semibold text-gray-700 text-sm">中文版本</h5>
                      <button
                        onClick={() => copyToClipboard(generatedContent.interaction_guide.chinese, 'guide-cn')}
                        className="text-orange-600 hover:text-orange-700 p-1 rounded hover:bg-orange-50 transition-colors"
                      >
                        {copiedItem === 'guide-cn' ? (
                          <CheckCircle className="w-3 h-3" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </button>
                    </div>
                    <p className="text-xs text-gray-600 leading-relaxed">{generatedContent.interaction_guide.chinese}</p>
                  </div>
                  <div className="bg-white/80 p-3 rounded-lg shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="font-semibold text-gray-700 text-sm">英文版本</h5>
                      <button
                        onClick={() => copyToClipboard(generatedContent.interaction_guide.english, 'guide-en')}
                        className="text-orange-600 hover:text-orange-700 p-1 rounded hover:bg-orange-50 transition-colors"
                      >
                        {copiedItem === 'guide-en' ? (
                          <CheckCircle className="w-3 h-3" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </button>
                    </div>
                    <p className="text-xs text-gray-600 leading-relaxed">{generatedContent.interaction_guide.english}</p>
                  </div>
                </div>
              </div>

              {/* 推荐标签 */}
              <div className="bg-gradient-to-r from-cyan-50 to-blue-50 rounded-xl p-4">
                <h4 className="font-bold text-gray-800 mb-3">推荐标签</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-semibold text-gray-600 mb-2">中文标签</p>
                    <div className="flex flex-wrap gap-1">
                      {generatedContent.hashtags.chinese.map((tag, index) => (
                        <span
                          key={index}
                          onClick={() => copyToClipboard(tag, `hashtag-cn-${index}`)}
                          className="px-2 py-1 bg-gradient-to-r from-cyan-100 to-blue-100 text-cyan-700 text-xs font-medium rounded-full cursor-pointer hover:from-cyan-200 hover:to-blue-200 transition-all duration-200 transform hover:scale-105"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-600 mb-2">英文标签</p>
                    <div className="flex flex-wrap gap-1">
                      {generatedContent.hashtags.english.map((tag, index) => (
                        <span
                          key={index}
                          onClick={() => copyToClipboard(tag, `hashtag-en-${index}`)}
                          className="px-2 py-1 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 text-xs font-medium rounded-full cursor-pointer hover:from-purple-200 hover:to-pink-200 transition-all duration-200 transform hover:scale-105"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 