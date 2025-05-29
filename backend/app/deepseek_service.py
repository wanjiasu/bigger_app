import httpx
import json
import os
from typing import Dict, Any

class DeepSeekService:
    def __init__(self):
        self.api_key = os.getenv("DEEPSEEK_API_KEY", "")
        self.base_url = "https://api.deepseek.com/v1/chat/completions"
        
    async def generate_xiaohongshu_note(self, scenario: str, persona: str = None, hotspot: str = None) -> Dict[str, Any]:
        """
        调用DeepSeek API生成小红书笔记内容
        """
        # 如果没有API key，直接返回备用内容
        if not self.api_key or self.api_key == "sk-your-deepseek-api-key-here":
            return {
                "success": True,
                "data": self._get_fallback_content(scenario, persona, hotspot)
            }
        
        # 构建提示词
        prompt = self._build_prompt(scenario, persona, hotspot)
        
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
                "data": self._get_fallback_content(scenario, persona, hotspot)
            }
    
    def _build_prompt(self, scenario: str, persona: str = None, hotspot: str = None) -> str:
        """构建提示词"""
        prompt = f"""
                请根据以下信息生成一篇小红书图文笔记：

                痛点场景：{scenario}
                """
        
        if persona:
            prompt += f"人设：{persona}\n"
        
        if hotspot:
            prompt += f"热点：{hotspot}\n"
            
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
2. 正文要有小红书风格，多使用emoji，分段清晰
3. 评论引导要能激发用户参与
4. 问题要具体且容易回答
5. 内容要贴合痛点场景和人设
"""
        return prompt
    
    def _parse_fallback_content(self, content: str) -> Dict[str, Any]:
        """备用内容解析"""
        return {
            "success": True,
            "data": {
                "note_title": "✨ 分享一个超实用的小技巧",
                "note_content": content,
                "comment_guide": "你们还有什么好方法吗？评论区分享一下吧！💕",
                "comment_questions": "你遇到过类似问题吗？\n你是怎么解决的？\n还有什么想了解的？"
            }
        }
    
    def _get_fallback_content(self, scenario: str, persona: str = None, hotspot: str = None) -> Dict[str, Any]:
        """获取备用内容（当API调用失败时）"""
        # 根据场景生成更个性化的内容
        title_prefix = "✨"
        if hotspot:
            if "新年" in hotspot:
                title_prefix = "🎊"
            elif "双十一" in hotspot:
                title_prefix = "🛒"
            elif "春节" in hotspot:
                title_prefix = "🧧"
            elif "开学" in hotspot:
                title_prefix = "📚"
        
        persona_text = ""
        if persona:
            if "职场" in persona:
                persona_text = "作为一个职场人，"
            elif "宝妈" in persona:
                persona_text = "作为一个宝妈，"
            elif "学生" in persona:
                persona_text = "作为一个学生，"
        
        hotspot_text = ""
        if hotspot:
            hotspot_text = f"正值{hotspot}，"
        
        return {
            "note_title": f"{title_prefix} {hotspot_text}解决{scenario}的实用方法！",
            "note_content": f"{persona_text}我想和大家分享一下关于{scenario}的经验 💕\n\n{hotspot_text}相信很多小伙伴都遇到过这样的情况，我之前也是这样的！😅\n\n后来我发现了一些小技巧，真的超级实用 ✨\n\n📝 方法一：提前准备\n制定详细的计划，提前做好准备工作\n\n⏰ 方法二：设置提醒\n利用手机闹钟或提醒功能\n\n💪 方法三：养成习惯\n坚持21天，让好习惯成为自然\n\n分享给大家，希望对你们有帮助 🥰",
            "comment_guide": "你们还有什么好方法吗？评论区分享一下吧！💕",
            "comment_questions": f"你也遇到过{scenario}的问题吗？\n你是怎么解决的？\n还有什么想了解的？\n有没有其他类似的困扰？"
        } 