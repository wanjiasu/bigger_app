import httpx
import json
import os
from typing import Dict, Any, Optional
import re

class DeepSeekService:
    def __init__(self):
        self.api_key = os.getenv("DEEPSEEK_API_KEY", "")
        self.base_url = "https://api.deepseek.com/v1/chat/completions"
        
    async def generate_xiaohongshu_note(
        self, 
        basic_content: str, 
        note_purpose: Optional[str] = None, 
        recent_trends: Optional[str] = None, 
        writing_style: Optional[str] = None, 
        target_audience: Optional[str] = None, 
        content_type: Optional[str] = None, 
        reference_links: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        调用DeepSeek API生成小红书笔记内容
        """
        # 如果没有API key，直接返回备用内容
        if not self.api_key or self.api_key == "sk-your-deepseek-api-key-here":
            return {
                "success": True,
                "data": self._get_fallback_content(
                    basic_content, note_purpose, recent_trends, 
                    writing_style, target_audience, content_type, reference_links
                )
            }
        
        # 构建提示词
        prompt = self._build_prompt(
            basic_content, note_purpose, recent_trends, 
            writing_style, target_audience, content_type, reference_links
        )
        
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        
        data = {
            "model": "deepseek-chat",
            "messages": [
                {
                    "role": "system",
                    "content": "你是一个专业的小红书内容创作专家，擅长根据用户需求生成高质量的小红书图文笔记。请严格按照JSON格式返回结果。"
                },
                {
                    "role": "user", 
                    "content": prompt
                }
            ],
            "temperature": 0.7,
            "max_tokens": 2000
        }
        
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post(self.base_url, headers=headers, json=data)
                response.raise_for_status()
                
                result = response.json()
                content = result["choices"][0]["message"]["content"]
                
                # 解析JSON响应
                try:
                    parsed_content = json.loads(content)
                    return {
                        "success": True,
                        "data": parsed_content
                    }
                except json.JSONDecodeError:
                    # 如果不是标准JSON，尝试提取内容
                    return self._parse_fallback_content(content)
                    
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "data": self._get_fallback_content(
                    basic_content, note_purpose, recent_trends, 
                    writing_style, target_audience, content_type, reference_links
                )
            }
    
    def _build_prompt(
        self, 
        basic_content: str, 
        note_purpose: Optional[str] = None, 
        recent_trends: Optional[str] = None, 
        writing_style: Optional[str] = None, 
        target_audience: Optional[str] = None, 
        content_type: Optional[str] = None, 
        reference_links: Optional[str] = None
    ) -> str:
        """构建提示词"""
        prompt = f"""
请根据以下信息生成一篇小红书图文笔记：

基本内容：{basic_content}
"""
        
        if note_purpose:
            prompt += f"笔记目的：{note_purpose}\n"
        
        if recent_trends:
            prompt += f"近期热梗：{recent_trends}\n"
            
        if writing_style:
            prompt += f"写作风格：{writing_style}\n"
            
        if target_audience:
            prompt += f"目标受众：{target_audience}\n"
            
        if content_type:
            prompt += f"内容类型：{content_type}\n"
            
        if reference_links:
            prompt += f"参考链接：{reference_links}\n"
            
        prompt += """
请生成以下内容，并以JSON格式返回：

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
"""
        return prompt
    
    def _parse_fallback_content(self, content: str) -> Dict[str, Any]:
        """备用内容解析"""
        # 尝试从内容中提取JSON
        try:
            # 查找JSON块
            json_match = re.search(r'\{[^{}]*"note_title"[^{}]*\}', content, re.DOTALL)
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
            "data": {
                "note_title": "✨ 分享一个超实用的小技巧",
                "note_content": f"今天想和大家分享一些实用的小技巧 💕\n\n{content[:200]}...\n\n希望对大家有帮助！",
                "comment_guide": "你们还有什么好方法吗？评论区分享一下吧！💕",
                "comment_questions": "你遇到过类似问题吗？\n你是怎么解决的？\n还有什么想了解的？"
            }
        }
    
    def _get_fallback_content(
        self, 
        basic_content: str, 
        note_purpose: Optional[str] = None, 
        recent_trends: Optional[str] = None, 
        writing_style: Optional[str] = None, 
        target_audience: Optional[str] = None, 
        content_type: Optional[str] = None, 
        reference_links: Optional[str] = None
    ) -> Dict[str, Any]:
        """获取备用内容（当API调用失败时）"""
        # 根据内容类型设置emoji前缀
        title_prefix = "✨"
        if content_type:
            type_emoji_map = {
                "产品种草": "🛒",
                "生活分享": "✨",
                "知识科普": "📚",
                "穿搭搭配": "👗",
                "美食制作": "🍳",
                "旅行攻略": "🗺️",
                "学习经验": "📖"
            }
            title_prefix = type_emoji_map.get(content_type, "✨")
        
        # 根据热梗调整内容
        trend_text = ""
        if recent_trends:
            trend_text = f"正值{recent_trends}，"
        
        # 根据目标受众调整语气
        audience_prefix = ""
        if target_audience:
            if "职场" in target_audience:
                audience_prefix = "作为职场人，"
            elif "宝妈" in target_audience:
                audience_prefix = "作为宝妈，"
            elif "学生" in target_audience:
                audience_prefix = "作为学生党，"
        
        # 根据写作风格调整语气
        style_suffix = "！"
        if writing_style:
            style_map = {
                "轻松幽默": "哈哈哈~",
                "专业严谨": "。",
                "温馨治愈": "💕",
                "活泼可爱": "！！",
                "干货分享": "👍"
            }
            style_suffix = style_map.get(writing_style, "！")
        
        return {
            "note_title": f"{title_prefix} {trend_text}关于{basic_content}的分享{style_suffix}",
            "note_content": f"{audience_prefix}想和大家分享一下关于{basic_content}的经验 💕\n\n{trend_text}相信很多小伙伴都对此感兴趣，我也是经过一番摸索才总结出来的！😅\n\n分享几个实用的小贴士给大家 ✨\n\n📝 贴士一：保持耐心\n任何事情都需要时间积累\n\n⏳ 贴士二：多多练习\n熟能生巧，多实践才能有进步\n\n💪 贴士三：坚持学习\n持续学习新知识，保持进步\n\n希望对大家有帮助呀 🥰",
            "comment_guide": "你们还有什么好经验吗？评论区一起交流吧！💕",
            "comment_questions": f"你对{basic_content}有什么看法？\n你有类似的经历吗？\n还想了解什么相关内容？\n有什么问题可以一起讨论~"
        } 