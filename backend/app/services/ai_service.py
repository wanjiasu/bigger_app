import os
import httpx
from typing import Optional, Dict, Any
from enum import Enum
from datetime import datetime

class AIModel(str, Enum):
    CLAUDE_3_5_SONNET = "claude-3-5-sonnet-latest"
    CLAUDE_SONNET_4 = "claude-sonnet-4-20250514"
    GPT_4O = "gpt-4o"
    DEEPSEEK_R1 = "deepseek-r1"
    GLM_4 = "glm-4"

class AIService:
    def __init__(self):
        """初始化AI服务"""
        # One-API配置
        self.one_api_url = os.getenv("ONE_API_URL", "https://your-remote-oneapi-service.com").rstrip('/')
        self.api_key = os.getenv("ONE_API_KEY")
        self.default_model = AIModel.GPT_4O

        # 模型映射到One-API中的实际模型名称
        self.model_mapping = {
            AIModel.CLAUDE_3_5_SONNET: "claude-3-5-sonnet-latest",
            AIModel.CLAUDE_SONNET_4: "claude-sonnet-4-20250514",
            AIModel.GPT_4O: "gpt-4o", 
            AIModel.DEEPSEEK_R1: "deepseek-r1",
            AIModel.GLM_4: "glm-4"
        }

        print(f"🤖 AI服务已初始化")
        print(f"📡 API地址: {self.one_api_url}")
        print(f"🎯 支持的模型: {', '.join([model.value for model in AIModel])}")
        print(f"⏰ 时间: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")

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
            "max_tokens": 2000
        }

        print(f"🚀 正在调用AI模型...")
        print(f"📝 模型: {model} -> {actual_model}")
        print(f"🔑 API Key: {self.api_key[:10]}...{self.api_key[-10:] if self.api_key else 'None'}")
        print(f"🌐 请求URL: {self.one_api_url}/v1/chat/completions")
        
        async with httpx.AsyncClient() as client:
            try:
                start_time = datetime.now()
                
                response = await client.post(
                    f"{self.one_api_url}/v1/chat/completions",
                    headers=headers,
                    json=request_data,
                    timeout=60.0
                )
                
                end_time = datetime.now()
                duration = (end_time - start_time).total_seconds()
                
                print(f"📊 响应状态码: {response.status_code}")
                print(f"📋 响应头: {dict(response.headers)}")
                
                if response.status_code != 200:
                    error_text = response.text
                    print(f"❌ API响应错误: {error_text}")
                    raise httpx.HTTPStatusError(f"HTTP {response.status_code}: {error_text}", request=response.request, response=response)
                
                response_data = response.json()
                print(f"✅ API调用成功！耗时: {duration:.2f}秒")
                print(f"📄 响应数据结构: {list(response_data.keys()) if isinstance(response_data, dict) else type(response_data)}")
                
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

    async def generate_note(self, 
                          basic_content: str,
                          model: Optional[str] = None,
                          note_purpose: Optional[str] = None,
                          recent_trends: Optional[str] = None,
                          writing_style: Optional[str] = None,
                          target_audience: Optional[str] = None,
                          content_type: Optional[str] = None,
                          reference_links: Optional[str] = None,
                          account_name: Optional[str] = None,
                          account_type: Optional[str] = None,
                          topic_keywords: Optional[str] = None,
                          platform: Optional[str] = None) -> Dict[str, str]:
        """生成小红书笔记"""
        
        # 根据选择的模型确定使用哪个模型
        selected_model = model if model in [m.value for m in AIModel] else self.default_model.value
        
        print(f"\n📝 开始生成笔记...")
        print(f"🤖 使用模型: {selected_model}")
        print(f"📄 基础内容: {basic_content[:100]}...")
        if account_name:
            print(f"👤 账号信息: {account_name} ({account_type}) - {platform}")
        
        # 构建系统提示词
        system_prompt = """你是一个专业的小红书内容创作专家，擅长根据用户需求生成高质量的小红书图文笔记。

请严格按照以下JSON格式返回结果：
{
    "note_title": "笔记标题（吸引人的标题，包含emoji）",
    "note_content": "笔记正文（包含多个段落，使用emoji和换行符，适合小红书风格）",
    "comment_guide": "评论区引导文案（鼓励用户互动的文案）",
    "comment_questions": "评论区问题（3-5个引导性问题，用换行符分隔）"
}

要求：
1. 标题要有吸引力，包含相关emoji
2. 正文要符合指定的写作风格，多使用emoji，分段清晰
3. 内容要针对目标受众，符合指定的内容类型
4. 如果有近期热梗，要巧妙融入内容中
5. 评论引导要能激发用户参与
6. 问题要具体且容易回答
7. 整体内容要围绕笔记目的展开
8. 如果提供了账号信息，要根据账号类型和常驻话题优化内容风格和关键词"""
        
        # 构建用户提示词
        user_prompt = f"""请根据以下信息生成小红书笔记：

基本内容：{basic_content}
"""
        
        # 添加账号信息到提示词中
        if account_name or account_type or topic_keywords or platform:
            user_prompt += "\n账号信息：\n"
            if account_name:
                user_prompt += f"账号名称：{account_name}\n"
            if account_type:
                user_prompt += f"账号类型：{account_type}\n"
            if platform:
                user_prompt += f"发布平台：{platform}\n"
            if topic_keywords:
                user_prompt += f"常驻话题关键词：{topic_keywords}\n"
                user_prompt += "请结合这些关键词优化内容，使其更符合该账号的定位和风格。\n"
        
        if note_purpose:
            user_prompt += f"笔记目的：{note_purpose}\n"
        if recent_trends:
            user_prompt += f"近期热梗：{recent_trends}\n"
        if writing_style:
            user_prompt += f"写作风格：{writing_style}\n"
        if target_audience:
            user_prompt += f"目标受众：{target_audience}\n"
        if content_type:
            user_prompt += f"内容类型：{content_type}\n"
        if reference_links:
            user_prompt += f"参考链接：{reference_links}\n"

        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ]

        try:
            response = await self._call_one_api(selected_model, messages)
            
            # 解析AI返回的内容
            content = response['choices'][0]['message']['content']
            
            print(f"✅ 内容生成成功，正在解析...")
            
            # 尝试解析JSON响应
            try:
                import json
                import re
                
                print(f"🔍 原始AI响应内容: {content[:200]}...")
                
                # 方法1: 尝试直接解析整个内容为JSON
                try:
                    parsed_content = json.loads(content.strip())
                    if isinstance(parsed_content, dict) and 'note_title' in parsed_content:
                        print(f"✨ 直接JSON解析成功！")
                        print(f"📌 标题: {parsed_content.get('note_title', '')}")
                        return parsed_content
                except json.JSONDecodeError:
                    pass
                
                # 方法2: 查找JSON代码块（```json 或 ```）
                json_block_patterns = [
                    r'```json\s*(\{.*?\})\s*```',
                    r'```\s*(\{.*?\})\s*```',
                    r'(\{[^{}]*"note_title"[^{}]*\})'
                ]
                
                for pattern in json_block_patterns:
                    json_matches = re.findall(pattern, content, re.DOTALL | re.IGNORECASE)
                    for json_match in json_matches:
                        try:
                            parsed_content = json.loads(json_match.strip())
                            if isinstance(parsed_content, dict) and 'note_title' in parsed_content:
                                print(f"✨ JSON代码块解析成功！")
                                print(f"📌 标题: {parsed_content.get('note_title', '')}")
                                return parsed_content
                        except json.JSONDecodeError:
                            continue
                
                # 方法3: 查找更复杂的JSON结构（支持嵌套）
                json_pattern = r'\{(?:[^{}]|{[^{}]*})*\}'
                json_matches = re.findall(json_pattern, content, re.DOTALL)
                
                for json_match in json_matches:
                    try:
                        parsed_content = json.loads(json_match)
                        if isinstance(parsed_content, dict) and 'note_title' in parsed_content:
                            print(f"✨ 复杂JSON结构解析成功！")
                            print(f"📌 标题: {parsed_content.get('note_title', '')}")
                            return parsed_content
                    except json.JSONDecodeError:
                        continue
                
                # 如果所有JSON解析都失败，使用备用解析方法
                print("⚠️ JSON解析失败，使用备用解析方法")
                return self._parse_fallback_content(content)
                    
            except Exception as e:
                print(f"⚠️ JSON解析异常: {str(e)}，使用备用解析方法")
                return self._parse_fallback_content(content)
            
        except Exception as e:
            print(f"❌ 生成笔记失败: {str(e)}")
            raise

    def _parse_fallback_content(self, content: str) -> Dict[str, str]:
        """备用内容解析方法"""
        print("🔄 使用备用解析方法...")
        print(f"🔍 备用解析内容: {content[:300]}...")
        
        # 初始化默认值
        note = {
            'note_title': '✨ 精彩内容分享',
            'note_content': '',
            'comment_guide': '你们觉得怎么样？评论区聊聊吧！💕',
            'comment_questions': '你有什么看法？\n还想了解什么？\n有类似经历吗？'
        }
        
        # 如果内容看起来像是不完整的JSON，尝试提取字段值
        import re
        
        # 尝试提取JSON字段值
        title_match = re.search(r'"note_title":\s*"([^"]*)"', content, re.DOTALL)
        if title_match:
            note['note_title'] = title_match.group(1).strip()
            print(f"📌 提取到标题: {note['note_title']}")
        
        content_match = re.search(r'"note_content":\s*"([^"]*)"', content, re.DOTALL)
        if content_match:
            note['note_content'] = content_match.group(1).strip()
            print(f"📝 提取到正文: {note['note_content'][:100]}...")
        
        guide_match = re.search(r'"comment_guide":\s*"([^"]*)"', content, re.DOTALL)
        if guide_match:
            note['comment_guide'] = guide_match.group(1).strip()
            print(f"💬 提取到评论引导: {note['comment_guide']}")
        
        questions_match = re.search(r'"comment_questions":\s*"([^"]*)"', content, re.DOTALL)
        if questions_match:
            note['comment_questions'] = questions_match.group(1).strip()
            print(f"❓ 提取到评论问题: {note['comment_questions']}")
        
        # 如果没有提取到正文，使用整个内容的前500字符
        if not note['note_content']:
            note['note_content'] = content[:500] + '...' if len(content) > 500 else content
        
        # 简单的内容解析（作为后备）
        sections = content.split('\n\n')
        for i, section in enumerate(sections):
            if i == 0 and len(section) < 100 and not title_match:  # 可能是标题
                note['note_title'] = section.strip()
            elif '标题' in section and not title_match:
                note['note_title'] = section.replace('标题：', '').replace('标题', '').strip()
            elif '正文' in section and not content_match:
                note['note_content'] = section.replace('正文：', '').replace('正文', '').strip()
            elif '评论' in section and '引导' in section and not guide_match:
                note['comment_guide'] = section.replace('评论引导：', '').strip()
            elif '问题' in section and not questions_match:
                note['comment_questions'] = section.replace('互动问题：', '').replace('问题：', '').strip()
        
        print(f"✅ 备用解析完成，标题: {note['note_title']}")
        return note

    async def test_connection(self) -> bool:
        """测试API连接状态"""
        print("🔍 测试API连接...")
        
        try:
            test_prompt = "你好，这是一个连接测试。"
            messages = [
                {"role": "user", "content": test_prompt}
            ]
            
            await self._call_one_api(self.default_model.value, messages)
            print("✅ API连接测试成功！")
            return True
            
        except Exception as e:
            print(f"❌ API连接测试失败: {str(e)}")
            return False

    def get_available_models(self) -> list:
        """获取可用的模型列表"""
        return [
            {"value": model.value, "label": self._get_model_display_name(model.value)}
            for model in AIModel
        ]

    def _get_model_display_name(self, model: str) -> str:
        """获取模型的显示名称"""
        display_names = {
            "claude-3-5-sonnet-latest": "Claude 3.5 Sonnet",
            "claude-sonnet-4-20250514": "Claude Sonnet 4",
            "gpt-4o": "GPT-4o",
            "deepseek-r1": "DeepSeek R1",
            "glm-4": "GLM-4"
        }
        return display_names.get(model, model)

# 创建服务实例
ai_service = AIService() 