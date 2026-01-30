---
inclusion: always
---
# 始终 中文交流
# 开发工作流指南

## 本地开发环境设置

### 1. 环境准备
```bash
# 克隆或进入项目目录
cd githupprocess

# 创建虚拟环境（推荐）
python -m venv venv

# 激活虚拟环境
# Windows
venv\Scripts\activate
# macOS/Linux
source venv/bin/activate

# 安装依赖
pip install requests
pip install httpx  # 可选，用于翻译功能
```

### 2. GitHub Token 配置

#### 方式一：环境变量（推荐）
```bash
# Windows (cmd)
set GITHUB_TOKEN=your_token_here

# Windows (PowerShell)
$env:GITHUB_TOKEN="your_token_here"

# macOS/Linux
export GITHUB_TOKEN=your_token_here
```

#### 方式二：脚本交互式输入
直接运行脚本时输入 Token

## 测试工作流

### 测试 Stars 脚本
```bash
python organize_github_stars.py
# 输入用户名：octocat
# 输入 Token：（可选）
```

### 测试 Repos 脚本
```bash
python organize_github_repos.py
# 输入用户名：octocat
# 输入 Token：（可选）
```

### 验证输出
- ✅ 检查 Markdown 文件是否生成
- ✅ 检查 JSON 文件是否有效
- ✅ 检查 CSV 文件是否可读
- ✅ 检查中文显示是否正常

## 代码修改流程

### 1. 修改前
- 备份原始脚本
- 理解现有逻辑
- 确认修改范围

### 2. 修改中
- 保持代码风格一致
- 添加必要的注释
- 测试新功能

### 3. 修改后
- 运行完整测试
- 验证输出格式
- 检查错误处理

## 常见修改场景

### 场景 1：添加新的主题分类
```python
# 在 TOPIC_KEYWORDS 中添加
'新分类': ['关键词1', '关键词2', '关键词3'],
```

### 场景 2：修改输出格式
- Markdown：修改 `generate_markdown()` 方法
- JSON：修改 `save_json()` 方法
- CSV：修改 `save_csv()` 方法

### 场景 3：添加新的排序方式
```python
def sort_by_custom(self):
    """按自定义字段排序"""
    return sorted(self.repos, key=lambda x: x['field_name'], reverse=True)
```

### 场景 4：修改 API 获取逻辑
- 修改 `fetch_stars()` 或 `fetch_repos()` 方法
- 注意分页处理
- 保持错误处理

## 调试技巧

### 1. 打印调试信息
```python
print(f"调试信息: {variable}")
print(f"数据类型: {type(variable)}")
print(f"数据长度: {len(variable)}")
```

### 2. 检查 API 响应
```python
print(f"状态码: {response.status_code}")
print(f"响应头: {response.headers}")
print(f"响应体: {response.json()}")
```

### 3. 验证数据结构
```python
import json
print(json.dumps(data, indent=2, ensure_ascii=False))
```

## 性能优化建议

### 1. 缓存机制
- 实现本地缓存避免重复请求
- 添加缓存过期时间

### 2. 并发请求
- 考虑使用 `asyncio` 加速数据获取
- 注意 API 速率限制

### 3. 内存优化
- 对大量数据使用流式处理
- 及时释放不需要的对象

## 版本控制

### Git 工作流
```bash
# 创建特性分支
git checkout -b feature/new-feature

# 提交更改
git add .
git commit -m "feat: 添加新功能描述"

# 推送到远程
git push origin feature/new-feature

# 创建 Pull Request
```

### 提交信息规范
- `feat:` 新功能
- `fix:` 修复 bug
- `docs:` 文档更新
- `refactor:` 代码重构
- `test:` 测试相关
- `chore:` 构建、依赖等

## 文档更新

### 修改 Steering Docs
1. 编辑 `.kiro/steering/` 中的 markdown 文件
2. 保持格式一致
3. 添加必要的示例代码

### 更新 README
- 保持与脚本功能同步
- 添加新功能说明
- 更新使用示例

## 问题排查清单

- [ ] 检查 Python 版本 >= 3.6
- [ ] 检查依赖是否安装
- [ ] 检查网络连接
- [ ] 检查 GitHub Token 有效性
- [ ] 检查用户名是否正确
- [ ] 检查文件编码是否为 UTF-8
- [ ] 检查磁盘空间是否充足
- [ ] 检查文件权限是否正确

## 发布流程

### 1. 准备发布
- 更新版本号
- 更新 CHANGELOG
- 运行完整测试

### 2. 创建发布
- 创建 Git tag
- 生成发布说明
- 上传到 GitHub Releases

### 3. 发布后
- 监控用户反馈
- 记录已知问题
- 规划下一版本
