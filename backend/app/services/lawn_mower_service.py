import httpx
import json
import os
from typing import Dict, Any, Optional, List
import re

class LawnMowerService:
    def __init__(self):
        # 使用 One-API 配置，与 ai_service.py 保持一致
        self.one_api_url = os.getenv("ONE_API_URL", "https://your-remote-oneapi-service.com").rstrip('/')
        self.api_key = os.getenv("ONE_API_KEY")
        
        # 模型映射到One-API中的实际模型名称，与 ai_service.py 保持一致
        self.model_mapping = {
            'claude-3-5-sonnet-latest': 'claude-3-5-sonnet-latest',
            'claude-sonnet-4-20250514': 'claude-sonnet-4-20250514',
            'gpt-4o': 'gpt-4o',
            'deepseek-r1': 'deepseek-r1',
            'glm-4': 'glm-4'
        }
        
        # 加载产品数据
        self.products_data = self._load_products_data()
        
        print(f"🤖 割草机服务已初始化")
        print(f"📡 One-API地址: {self.one_api_url}")
        print(f"🔑 API Key: {self.api_key[:10]}...{self.api_key[-10:] if self.api_key else 'None'}")
        
    def _load_products_data(self) -> Dict[str, Any]:
        """加载产品数据"""
        try:
            # 获取当前文件的目录
            current_dir = os.path.dirname(os.path.abspath(__file__))
            # 构建product_data.json的路径 - 更新为正确的路径
            products_path = os.path.join(current_dir, "..", "data", "product_data.json")
            
            with open(products_path, 'r', encoding='utf-8') as f:
                return json.load(f)
        except Exception as e:
            print(f"Failed to load products data: {e}")
            return {}
    
    def _get_headers(self) -> Dict[str, str]:
        """获取请求头"""
        return {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {self.api_key}"
        }

    async def _call_one_api(self, model: str, messages: list, temperature: float = 0.7) -> Dict[Any, Any]:
        """调用One-API服务"""
        headers = self._get_headers()
        
        # 获取实际的模型名称
        actual_model = self.model_mapping.get(model, model)
        
        request_data = {
            "model": actual_model,
            "messages": messages,
            "temperature": temperature,
            "max_tokens": 3000
        }

        print(f"🚀 正在调用AI模型...")
        print(f"📝 模型: {model} -> {actual_model}")
        print(f"🌐 请求URL: {self.one_api_url}/v1/chat/completions")
        
        async with httpx.AsyncClient(timeout=60.0) as client:
            try:                
                response = await client.post(
                    f"{self.one_api_url}/v1/chat/completions",
                    headers=headers,
                    json=request_data
                )
                
                print(f"📊 响应状态码: {response.status_code}")
                
                if response.status_code != 200:
                    error_text = response.text
                    print(f"❌ API响应错误: {error_text}")
                    raise httpx.HTTPStatusError(f"HTTP {response.status_code}: {error_text}", request=response.request, response=response)
                
                response_data = response.json()
                print(f"✅ API调用成功！")
                
                return response_data
                
            except httpx.HTTPStatusError as e:
                error_msg = f"HTTP错误 {e.response.status_code}: {e.response.text if hasattr(e, 'response') else str(e)}"
                print(f"❌ {error_msg}")
                raise Exception(error_msg)
            except httpx.RequestError as e:
                error_msg = f"请求错误: {str(e)}"
                print(f"❌ {error_msg}")
                raise Exception(error_msg)
            except Exception as e:
                error_msg = f"未知错误: {str(e)}"
                print(f"❌ {error_msg}")
                raise Exception(error_msg)
    
    def _get_product_specs(self, spu: str, sku: Optional[str] = None) -> str:
        """根据SPU和SKU获取产品规格详情"""
        try:
            # 在产品数据中查找对应的系列
            for series_name, series_data in self.products_data.items():
                if spu.lower() in series_name.lower():
                    specs = []
                    specs.append(f"系列概述：{series_data.get('产品概述', '')}")
                    specs.append(f"核心功能：{series_data.get('核心功能', '')}")
                    
                    # 如果有SKU，查找具体型号规格
                    if sku and sku.strip():
                        sku_list = series_data.get('SKUs', {})
                        
                        # 尝试精确匹配或模糊匹配
                        target_sku = None
                        for sku_name, sku_data in sku_list.items():
                            if sku.lower() in sku_name.lower() or sku_name.lower() in sku.lower():
                                target_sku = sku_data
                                break
                        
                        if target_sku:
                            # 使用组合字段或单独字段
                            if '组合字段' in target_sku:
                                specs.append(f"产品规格：{target_sku['组合字段']}")
                            else:
                                for key, value in target_sku.items():
                                    if value and str(value).strip() and key != '组合字段':
                                        specs.append(f"{key}：{value}")
                        else:
                            specs.append(f"未找到具体型号 {sku} 的详细信息")
                    else:
                        # 只有SPU时，提供系列通用信息
                        if series_data.get('规格参数'):
                            specs.append(f"系列规格参数：{series_data.get('规格参数', '')}")
                    
                    return "\n".join(specs)
            
            product_info = f"{spu}"
            if sku:
                product_info += f" {sku}"
            return f"未找到 {product_info} 的详细规格信息"
            
        except Exception as e:
            return f"获取产品规格时出错：{str(e)}"
    
    async def generate_lawn_mower_content(
        self, 
        spu: str,
        sku: Optional[str] = None,
        language: str = "chinese",
        target_platform: str = "Facebook",
        opening_hook: str = "",
        narrative_perspective: str = "",
        content_logic: str = "",
        value_proposition: str = "",
        key_selling_points: str = "",
        specific_scenario: str = "",
        user_persona: str = "",
        content_style: str = "",
        holiday_season: Optional[str] = None,
        ai_model: List[str] = None
    ) -> Dict[str, Any]:
        """
        调用One-API生成割草机推广内容
        """
        try:
            # 处理AI模型参数
            if ai_model is None:
                ai_model = ["gpt-4o"]
            
            # 获取产品规格详情
            product_specs = self._get_product_specs(spu, sku)
            
            # 检查API key是否配置
            if not self.api_key:
                print("⚠️ 未配置 ONE_API_KEY，返回备用内容")
                return {
                    "success": True,
                    "data": self._get_fallback_content(
                        spu, sku, language, target_platform, opening_hook,
                        narrative_perspective, content_logic, value_proposition,
                        key_selling_points, specific_scenario, user_persona,
                        content_style, holiday_season, product_specs
                    )
                }
            
            # 构建提示词
            prompt = self._build_prompt(
                spu, sku, language, target_platform, opening_hook,
                narrative_perspective, content_logic, value_proposition,
                key_selling_points, specific_scenario, user_persona,
                content_style, holiday_season, product_specs
            )
            
            # 使用选择的模型进行生成
            results = []
            for model in ai_model:
                try:
                    print(f"🎯 正在使用模型 {model} 生成内容...")
                    
                    messages = [
                        {
                            "role": "system",
                            "content": "你是一位资深的内容运营专家，深耕智能家居与户外科技领域，专为库犸科技Mammotion品牌服务，擅长通过生活化内容拉近用户与智能割草机器人的距离。请严格按照要求的JSON格式返回结果。"
                        },
                        {
                            "role": "user", 
                            "content": prompt
                        }
                    ]
                    
                    response = await self._call_one_api(model, messages, temperature=0.7)
                    content = response["choices"][0]["message"]["content"]
                    
                    # 解析JSON响应
                    try:
                        parsed_content = json.loads(content)
                        results.append(parsed_content)
                        print(f"✅ 模型 {model} 生成成功")
                    except json.JSONDecodeError:
                        # 如果不是标准JSON，尝试提取内容
                        print(f"⚠️ 模型 {model} 返回非标准JSON，尝试解析...")
                        parsed_content = self._parse_fallback_content(content, spu, sku, language, target_platform)
                        results.append(parsed_content.get('data', {}))
                        
                except Exception as e:
                    print(f"❌ 模型 {model} 生成失败: {str(e)}")
                    continue
            
            # 如果所有模型都失败，返回备用内容
            if not results:
                print("❌ 所有模型都失败，返回备用内容")
                return {
                    "success": False,
                    "error": "所有模型生成失败",
                    "data": self._get_fallback_content(
                        spu, sku, language, target_platform, opening_hook,
                        narrative_perspective, content_logic, value_proposition,
                        key_selling_points, specific_scenario, user_persona,
                        content_style, holiday_season, product_specs
                    )
                }
            
            # 返回第一个成功的结果
            return {
                "success": True,
                "data": results[0] if len(results) == 1 else {"results": results}
            }
                    
        except Exception as e:
            print(f"❌ 生成内容时出错: {str(e)}")
            return {
                "success": False,
                "error": f"生成失败: {str(e)}",
                "data": self._get_fallback_content(
                    spu, sku, language, target_platform, opening_hook,
                    narrative_perspective, content_logic, value_proposition,
                    key_selling_points, specific_scenario, user_persona,
                    content_style, holiday_season, product_specs
                )
            }

    def _build_prompt(
        self, 
        spu: str,
        sku: str,
        language: str,
        target_platform: str,
        opening_hook: str,
        narrative_perspective: str,
        content_logic: str,
        value_proposition: str,
        key_selling_points: str,
        specific_scenario: str,
        user_persona: str,
        content_style: str,
        holiday_season: Optional[str],
        product_specs: str
    ) -> str:
        """构建提示词"""
        
        holiday_text = f"，结合{holiday_season}" if holiday_season else ""
        
        prompt = f"""
你是一位资深的内容运营专家，深耕智能家居与户外科技领域，专为库犸科技Mammotion品牌服务，擅长通过生活化内容拉近用户与智能割草机器人的距离。

请根据下方提供的【内容创作信息】，为Mammotion的智能割草机器人产品创作一篇用于{target_platform}的推广内容，核心目标是提升品牌认知、激发用户互动（点赞/评论/分享）并引导用户了解产品详情。

你的所有创作都遵循 A-B-C 内容逻辑框架：
A - 锚点 (Anchor): 用{opening_hook}精准锚定{user_persona}在{specific_scenario}中的草坪护理痛点或需求。
B - 桥梁 (Bridge): 以{narrative_perspective}为线索，结合{content_logic}阐述Mammotion产品如何解决痛点，重点传递{value_proposition}。
C - 共鸣 (Resonate): 结尾呼应生活场景，强化产品带来的"轻松生活"价值，搭配自然的互动引导。

【内容创作信息】
产品系列/型号: {spu} {sku}
产品规格详情: {product_specs}
内容价值主张: {value_proposition}
具体场景: {specific_scenario}
用户画像: {user_persona}
叙事视角: {narrative_perspective}
内容风格: {content_style}
节日/时令: {holiday_season or "无特定节日"}
目标发布平台: {target_platform}
主打卖点: {key_selling_points}

【内容输出要求】
整体要求：符合 {target_platform} 社交属性，内容轻量化、有画面感，avoid过度技术化表述，适配{content_style}。
标题要求：包含{opening_hook}元素{holiday_text}，引发{user_persona}好奇，控制在60字符内。
文案要求: 主体遵循A-B-C逻辑，穿插表情符号增强亲和力，合理分段（每段不超过3行），融入产品功能但侧重"解决问题后的生活改变"。

请严格按照以下JSON格式返回结果：

{{
    "titles": {{
        "chinese": [
            "备选标题1",
            "备选标题2"
        ],
        "english": [
            "Alternative Title 1",
            "Alternative Title 2"
        ]
    }},
    "main_content": {{
        "chinese": "中文主体文案内容",
        "english": "English main content"
    }},
    "visual_suggestions": {{
        "image_video_content": "图片/视频内容建议",
        "scene_atmosphere": "场景氛围描述",
        "composition_focus": "构图重点说明",
        "color_tone": "色调建议"
    }},
    "interaction_guide": {{
        "chinese": "中文互动引导问题",
        "english": "English interaction guide" 
    }},
    "hashtags": {{
        "chinese": ["#中文标签1", "#中文标签2", "等"],
        "english": ["#EnglishTag1", "#EnglishTag2", "etc"]
    }}
}}
"""
        return prompt
    
    def _parse_fallback_content(self, content: str, spu: str, sku: str, language: str, target_platform: str) -> Dict[str, Any]:
        """备用内容解析"""
        try:
            # 尝试从内容中提取JSON
            json_match = re.search(r'\{.*\}', content, re.DOTALL)
            if json_match:
                json_str = json_match.group()
                parsed = json.loads(json_str)
                return {
                    "success": True,
                    "data": parsed
                }
        except:
            pass
        
        # 如果找不到有效JSON，返回简化的内容
        return {
            "success": True,
            "data": self._get_fallback_content(
                spu, sku, language, target_platform, "问题解决", 
                "用户视角", "问题-解决方案", "轻松生活", 
                "智能便捷", "日常草坪护理", "家庭用户", 
                "轻松友好", None, f"{spu} {sku} 智能割草机器人"
            )
        }
    
    def _get_fallback_content(
        self, 
        spu: str,
        sku: str,
        language: str,
        target_platform: str,
        opening_hook: str,
        narrative_perspective: str,
        content_logic: str,
        value_proposition: str,
        key_selling_points: str,
        specific_scenario: str,
        user_persona: str,
        content_style: str,
        holiday_season: Optional[str],
        product_specs: str
    ) -> Dict[str, Any]:
        """获取备用内容（当API调用失败时）"""
        
        product_name = f"{spu} {sku}"
        holiday_text = f"，正值{holiday_season}" if holiday_season else ""
        
        return {
            "titles": {
                "chinese": [
                    f"🌱 {product_name}：让{specific_scenario}变得轻松简单{holiday_text}！",
                    f"🚜 告别传统割草烦恼，{product_name}带来全新体验！"
                ],
                "english": [
                    f"🌱 {product_name}: Making {specific_scenario} Easy & Simple!",
                    f"🚜 Say Goodbye to Traditional Lawn Care with {product_name}!"
                ]
            },
            "main_content": {
                "chinese": f"还在为{specific_scenario}而烦恼吗？🤔\n\n{product_name}来帮你解决！✨ 凭借{key_selling_points}，让草坪护理变得前所未有的轻松。无论是{specific_scenario}，还是复杂地形，都能轻松应对！\n\n🎯 {value_proposition}\n⚡ 智能AI导航，精准高效\n🔋 超长续航，一次搞定\n📱 手机App控制，随时随地\n\n从此告别周末割草，享受更多家庭时光！☀️🏡",
                "english": f"Tired of {specific_scenario}? 🤔\n\n{product_name} is here to help! ✨ With {key_selling_points}, lawn care has never been easier. Whether it's {specific_scenario} or complex terrain, it handles everything effortlessly!\n\n🎯 {value_proposition}\n⚡ Smart AI navigation for precision\n🔋 Extended battery life\n📱 Mobile app control anytime\n\nSay goodbye to weekend lawn work and enjoy more family time! ☀️🏡"
            },
            "visual_suggestions": {
                "image_video_content": f"3张图组合——图1：{user_persona}在庭院休闲，{product_name}自动工作的远景；图2：产品在{specific_scenario}中的特写镜头；图3：App控制界面与修剪后的完美草坪效果图",
                "scene_atmosphere": f"阳光明媚的{specific_scenario}环境，绿植环绕，传递\"轻松惬意\"的生活感受",
                "composition_focus": "突出\"人+产品+场景\"的和谐感，避免纯产品堆砌，强调生活化应用",
                "color_tone": "自然清新的绿色系为主，搭配暖色调光影，强化\"户外智能生活\"质感"
            },
            "interaction_guide": {
                "chinese": f"你在{specific_scenario}中遇到过什么困扰？💬 {product_name}能为你解决哪些问题？评论区聊聊吧！",
                "english": f"What challenges have you faced in {specific_scenario}? 💬 How could {product_name} help you? Let's discuss in the comments!"
            },
            "hashtags": {
                "chinese": ["#Mammotion", f"#{spu}", f"#{sku}", "#智能割草机", "#草坪护理", "#智能家居", "#户外生活", "#轻松生活", "#AI科技", "#庭院管理"],
                "english": ["#Mammotion", f"#{spu}", f"#{sku}", "#SmartMower", "#LawnCare", "#SmartHome", "#OutdoorLife", "#EasyLife", "#AITech", "#YardWork"]
            }
        } 