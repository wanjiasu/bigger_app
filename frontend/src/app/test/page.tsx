import { apiEndpoints } from '@/lib/config';

export default function TestPage() {
  const usersEndpoint = apiEndpoints.users;
  
  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">前后端连接测试</h1>
      
      <div className="bg-blue-50 p-4 rounded-lg mb-6">
        <h2 className="text-xl font-semibold mb-2">API 配置信息</h2>
        <p><strong>后端 API 地址:</strong> {usersEndpoint}</p>
        <p><strong>测试说明:</strong> 打开浏览器开发者工具，在控制台中运行以下命令来测试API连接</p>
      </div>

      <div className="bg-gray-100 p-4 rounded-lg mb-6">
        <h2 className="text-xl font-semibold mb-2">测试命令</h2>
        <div className="space-y-4">
          <div>
            <p className="font-medium">1. 测试获取用户列表:</p>
            <code className="block bg-black text-green-400 p-2 mt-1 rounded text-sm whitespace-pre-wrap">
              {`fetch('${usersEndpoint}').then(r => r.json()).then(console.log)`}
            </code>
          </div>
          <div>
            <p className="font-medium">2. 测试创建用户:</p>
            <code className="block bg-black text-green-400 p-2 mt-1 rounded text-sm whitespace-pre-wrap">
              {`fetch('${usersEndpoint}', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({username: 'testuser2', email: 'test2@example.com', age: 30})
}).then(r => r.json()).then(console.log)`}
            </code>
          </div>
        </div>
      </div>

      <div className="bg-green-50 p-4 rounded-lg">
        <h2 className="text-xl font-semibold mb-2">测试步骤</h2>
        <ol className="list-decimal list-inside space-y-1">
          <li>确保 Docker 容器正在运行</li>
          <li>在浏览器中访问 http://192.168.0.200:3000/test</li>
          <li>打开开发者工具 (F12)</li>
          <li>在控制台中运行上面的测试命令</li>
          <li>查看返回的数据确认连接正常</li>
        </ol>
      </div>

      <div className="bg-yellow-50 p-4 rounded-lg mt-6">
        <h2 className="text-xl font-semibold mb-2">测试结果</h2>
        <p>✅ 后端API测试成功！已成功创建用户并能获取用户列表。</p>
        <p>✅ 前端访问正常，可以通过内网地址 http://192.168.0.200:3000 访问。</p>
        <p>✅ CORS配置正确，允许跨域请求。</p>
      </div>
    </div>
  );
} 