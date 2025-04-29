# Full Stack Application

一个使用 Next.js + FastAPI + PostgreSQL + NocoDB 的全栈应用。

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
- NocoDB (数据库管理工具)

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
```

3. 启动服务
```bash
docker-compose up --build
```

4. 访问服务
- 前端: http://localhost:3000
- 后端 API: http://localhost:8000
- NocoDB: http://localhost:8080

## 开发指南

### 数据库架构
- PostgreSQL 超级用户用于管理数据库
- FastAPI 使用独立的数据库用户和数据库
- NocoDB 使用独立的数据库用户和数据库

### 环境变量
请参考 `.env.example` 文件进行配置：
- 数据库配置
- API 配置
- NocoDB 配置

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