# Full Stack Application

一个使用 Next.js + FastAPI + PostgreSQL 的全栈应用。

## 技术栈

### 前端
- Next.js 15.3.1
- React 19
- TypeScript
- TailwindCSS

### 后端
- FastAPI
- SQLAlchemy
- PostgreSQL 15

## 项目结构
```tree
my-fullstack-app/
├── frontend/                # Next.js 前端项目
│   ├── src/                # 源代码
│   ├── public/             # 静态资源
│   ├── Dockerfile.dev      # 开发环境 Docker 配置
│   └── package.json        # 依赖配置
├── backend/                # FastAPI 后端项目
│   ├── app/               # 应用代码
│   ├── Dockerfile.dev     # 开发环境 Docker 配置
│   └── requirements.txt   # Python 依赖
├── db/                    # 数据库相关
│   └── init.sql          # 数据库初始化脚本
├── docker-compose.yml     # Docker 编排配置
├── .env.example          # 环境变量示例
└── README.md             # 项目文档
```

## 快速开始

1. 克隆项目
```bash
git clone https://gitee.com/wanjiasu/my-fullstack-app.git
cd my-fullstack-app
```

2. 配置环境变量
```bash
cp .env.example .env
# 编辑 .env 文件设置您的环境变量
openssl rand -base64 32
# 生成密钥
```

3. 启动服务
```bash
docker-compose up --build
```

4. 访问服务
- 前端: http://localhost:3000
- 后端 API: http://localhost:8000

## 开发指南

### 数据库架构
- PostgreSQL 超级用户用于管理数据库
- FastAPI 使用独立的数据库用户和数据库

### 环境变量
请参考 `.env.example` 文件进行配置：
- 数据库配置
- API 配置

## 部署

### 开发环境
使用 `docker-compose.yml` 进行本地开发：
```bash
docker-compose up --build
```

### 生产环境
TODO: 添加生产环境部署说明

## 贡献指南
1. Fork 项目
2. 创建特性分支
3. 提交更改
4. 推送到分支
5. 创建 Pull Request

## 许可证
[选择合适的许可证]

# 小红书笔记生成器

基于 DeepSeek AI 的智能小红书图文笔记生成工具，支持根据痛点场景、人设和热点自动生成高质量的小红书内容。

## 功能特性

- 🤖 **AI 智能生成**：集成 DeepSeek 大模型，生成符合小红书风格的内容
- 📝 **完整内容输出**：自动生成笔记标题、正文、评论引导和评论问题
- 💾 **数据持久化**：支持笔记的保存、查看、编辑和删除
- 🔍 **搜索功能**：支持按标题、场景、人设、热点搜索笔记
- 📊 **可视化表格**：清晰的表格展示所有生成的笔记
- 📱 **响应式设计**：支持桌面端和移动端访问

## 技术栈

### 后端
- **FastAPI**：现代、快速的 Python Web 框架
- **SQLAlchemy**：Python SQL 工具包和对象关系映射
- **PostgreSQL**：关系型数据库
- **DeepSeek API**：AI 内容生成服务
- **Pydantic**：数据验证和设置管理

### 前端
- **Next.js 15**：React 全栈框架
- **TypeScript**：类型安全的 JavaScript
- **Tailwind CSS**：实用优先的 CSS 框架
- **Lucide React**：美观的图标库
- **Axios**：HTTP 客户端

## 快速开始

### 环境要求

- Python 3.8+
- Node.js 18+
- PostgreSQL 12+
- DeepSeek API Key

### 1. 克隆项目

```bash
git clone <repository-url>
cd test-app
```

### 2. 后端设置

```bash
cd backend

# 安装依赖
pip install -r requirements.txt

# 创建环境变量文件
cp app/.env.example app/.env

# 编辑 .env 文件，添加你的配置
# DEEPSEEK_API_KEY=your_deepseek_api_key_here
# DATABASE_URL=postgresql://user:password@localhost/dbname
```

### 3. 前端设置

```bash
cd frontend

# 安装依赖
npm install
```

### 4. 数据库设置

确保 PostgreSQL 服务正在运行，并创建相应的数据库。

### 5. 启动服务

#### 使用 Docker Compose（推荐）

```bash
# 在项目根目录
docker-compose up -d
```

#### 手动启动

**启动后端：**
```bash
cd backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**启动前端：**
```bash
cd frontend
npm run dev
```

### 6. 访问应用

- 前端界面：http://localhost:3000
- 后端 API 文档：http://localhost:8000/docs

## 使用说明

### 生成笔记

1. 在首页点击"生成笔记"标签
2. 填写必填的"痛点场景"字段
3. 可选填写"人设"和"热点"信息
4. 点击"生成笔记"按钮
5. 等待 AI 生成完成，查看生成结果

### 管理笔记

1. 点击"管理笔记"标签查看所有生成的笔记
2. 使用搜索框快速查找特定笔记
3. 点击操作按钮：
   - 👁️ **查看**：查看笔记详细内容，支持一键复制
   - ✏️ **编辑**：修改笔记内容
   - 🗑️ **删除**：删除不需要的笔记

## API 接口

### 笔记相关接口

- `POST /notes/generate` - 生成新笔记
- `GET /notes/` - 获取所有笔记
- `GET /notes/{note_id}` - 获取单个笔记
- `PUT /notes/{note_id}` - 更新笔记
- `DELETE /notes/{note_id}` - 删除笔记

详细的 API 文档请访问：http://localhost:8000/docs

## 配置说明

### DeepSeek API 配置

1. 访问 [DeepSeek 官网](https://platform.deepseek.com/) 注册账号
2. 获取 API Key
3. 在后端 `.env` 文件中配置：
   ```
   DEEPSEEK_API_KEY=your_api_key_here
   ```

### 数据库配置

在 `.env` 文件中配置数据库连接：
```
DATABASE_URL=postgresql://username:password@localhost:5432/database_name
```

## 项目结构

```
test-app/
├── backend/                 # 后端代码
│   ├── app/
│   │   ├── main.py         # FastAPI 主应用
│   │   ├── models.py       # 数据库模型
│   │   ├── schemas.py      # Pydantic 模型
│   │   ├── db.py          # 数据库配置
│   │   └── deepseek_service.py  # DeepSeek API 服务
│   ├── requirements.txt    # Python 依赖
│   └── Dockerfile.dev     # Docker 配置
├── frontend/               # 前端代码
│   ├── src/
│   │   └── app/
│   │       ├── components/ # React 组件
│   │       ├── page.tsx   # 主页面
│   │       └── layout.tsx # 布局组件
│   ├── package.json       # Node.js 依赖
│   └── Dockerfile.dev     # Docker 配置
├── docker-compose.yml     # Docker Compose 配置
└── README.md             # 项目说明
```

## 开发指南

### 添加新功能

1. **后端**：在 `backend/app/` 目录下添加新的路由和服务
2. **前端**：在 `frontend/src/app/components/` 目录下添加新组件
3. **数据库**：在 `models.py` 中添加新的数据模型

### 自定义 AI 提示词

编辑 `backend/app/deepseek_service.py` 中的 `_build_prompt` 方法来自定义 AI 生成的提示词。

## 故障排除

### 常见问题

1. **后端启动失败**
   - 检查 Python 版本和依赖安装
   - 确认数据库连接配置正确
   - 检查 DeepSeek API Key 是否有效

2. **前端无法连接后端**
   - 确认后端服务正在运行（端口 8000）
   - 检查 CORS 配置
   - 查看浏览器控制台错误信息

3. **AI 生成失败**
   - 检查 DeepSeek API Key 是否正确
   - 确认网络连接正常
   - 查看后端日志获取详细错误信息

## 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 联系方式

如有问题或建议，请通过以下方式联系：

- 提交 Issue
- 发送邮件至：[your-email@example.com]

---

**注意**：使用本工具前请确保遵守相关平台的使用条款和内容政策。