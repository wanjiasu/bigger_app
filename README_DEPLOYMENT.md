# 部署解决方案 - 修复网络错误

## 问题描述
部署到服务器后，前端显示 "AxiosError: Network Error"，这是因为前端代码尝试连接 `http://localhost:8000`，但在服务器环境中这个地址不可用。

## 解决方案

### 1. 已完成的代码修改
我已经更新了所有前端组件，使用动态 API 配置：

- ✅ 创建了 `frontend/src/config/api.ts` 配置文件
- ✅ 更新了 `NoteGenerator.tsx`
- ✅ 更新了 `NotesTable.tsx`
- ✅ 更新了 `EditNoteModal.tsx`
- ✅ 更新了 `users/page.tsx`

### 2. 服务器部署步骤

#### 选项 A: 使用环境变量（推荐）

1. **创建生产环境变量文件**
   ```bash
   # 在你的服务器上创建 .env.production
   echo "NEXT_PUBLIC_API_URL=http://你的服务器IP:8000" > frontend/.env.production
   
   # 例如：
   echo "NEXT_PUBLIC_API_URL=http://192.168.1.100:8000" > frontend/.env.production
   # 或者如果你使用域名：
   echo "NEXT_PUBLIC_API_URL=https://api.yourdomain.com" > frontend/.env.production
   ```

2. **重新构建前端**
   ```bash
   cd frontend
   npm run build
   npm start
   ```

#### 选项 B: 直接修改配置文件

如果你想要快速修复，可以直接编辑 `frontend/src/config/api.ts` 文件：

```typescript
// 在第8行附近，将默认值改为你的服务器地址
return process.env.NEXT_PUBLIC_API_URL || 'http://你的服务器IP:8000'
```

### 3. Docker 部署

如果你使用 Docker，需要在 docker-compose.yml 中设置环境变量：

```yaml
frontend:
  # ... 其他配置
  environment:
    - NODE_ENV=production
    - NEXT_PUBLIC_API_URL=http://backend:8000  # Docker 内部网络
```

### 4. 验证修复

部署后，检查浏览器控制台应该看到：
```
API Base URL: http://你的服务器地址:8000
```

如果仍然显示 localhost，说明环境变量没有正确设置。

### 5. 常见问题

**Q: 我的后端和前端在同一台服务器上，应该用什么地址？**
A: 使用服务器的实际IP地址或域名，例如 `http://192.168.1.100:8000`

**Q: 我使用了反向代理（如 Nginx），应该怎么配置？**
A: 使用代理后的地址，例如 `https://yourdomain.com/api`

**Q: 开发环境还能正常工作吗？**
A: 是的，开发环境会自动使用 `http://localhost:8000`

### 6. 立即测试

现在就可以测试修复：

1. 在你的服务器上设置环境变量：
   ```bash
   export NEXT_PUBLIC_API_URL=http://你的服务器IP:8000
   ```

2. 重启前端服务

3. 访问网站，检查网络请求是否指向正确的地址 