---
inclusion: always
---
# 始终 中文交流
# GitHub 整理工具 - 项目指南

## 项目概述

这是一套用于整理和分析 GitHub Stars 和 Repositories 的 Python 脚本工具集。

### 核心功能
- **获取数据**: 从 GitHub API 获取用户的 Stars 和 Repositories
- **智能分类**: 按编程语言和主题关键词自动分类
- **多格式输出**: 生成 Markdown、JSON、CSV 三种格式的报告
- **双语支持**: 支持中英文双语描述（可选翻译）

## 项目结构

```
.
├── organize_github_stars.py      # Stars 整理脚本
├── organize_github_repos.py       # Repositories 整理脚本
├── translate_md.py                # 翻译辅助工具
├── GitHub_Stars.md                # 生成的 Stars 报告
├── github_stars.json              # Stars 数据 JSON
├── github_stars.csv               # Stars 数据 CSV
└── .kiro/
    └── steering/
        └── github-organizer-guide.md  # 本文件
```

## 使用指南

### 前置要求
- Python 3.6+
- `requests` 库
- GitHub Token（可选，但推荐用于提高 API 限制）

### 安装依赖
```bash
pip install requests
# 可选：安装翻译支持
pip install httpx
```

### 获取 GitHub Token
1. 访问 https://github.com/settings/tokens
2. 点击 "Generate new token"
3. 选择 `public_repo` 权限
4. 复制 token

### 运行脚本

#### 获取 Stars
```bash
python organize_github_stars.py
```

#### 获取 Repositories
```bash
python organize_github_repos.py
```

两个脚本都会提示输入：
- GitHub 用户名（必需）
- GitHub Token（可选，直接回车跳过）

### 输出文件

#### Markdown 报告
- `GitHub_Stars.md` - Stars 整理报告
- `GitHub_Repos.md` - Repositories 整理报告

包含内容：
- 📊 统计概览（总数、语言数、主题数、平均 Stars/Forks）
- 🔥 热度排行（按 Stars 数排序）
- 🔄 最近更新（按更新时间排序）
- 👥 最多 Fork（按 Forks 数排序）
- 📚 按编程语言分类
- 🏷️ 按主题分类

#### JSON 数据
- `github_stars.json` - Stars 原始数据
- `github_repos.json` - Repositories 原始数据

结构：
```json
{
  "username": "your-username",
  "generated_at": "2024-01-30T10:00:00",
  "total": 100,
  "by_language": { ... },
  "by_topic": { ... },
  "all_projects": [ ... ]
}
```

#### CSV 表格
- `github_stars.csv` - Stars 表格数据
- `github_repos.csv` - Repositories 表格数据

列字段：
- 项目名称、链接、描述、Stars、语言、Forks、最后更新
- Repositories 额外字段：是否 Fork、是否私有

## 主题分类系统

脚本使用细粒度的主题关键词映射进行自动分类：

### 主要分类
- **AI/ML**: AI、机器学习、深度学习、神经网络等
- **LLM/大模型**: LLM、GPT、Claude、Gemini 等
- **数据科学**: Pandas、NumPy、TensorFlow、PyTorch 等
- **Web 框架**: Django、Flask、FastAPI、Express 等
- **React 生态**: React、Next.js、Remix、Gatsby 等
- **Vue 生态**: Vue、Nuxt、Vite 等
- **前端工具**: Webpack、Vite、Rollup、ESBuild 等
- **数据库**: MySQL、PostgreSQL、MongoDB、Redis 等
- **DevOps**: Docker、Kubernetes、CI/CD、Terraform 等
- **安全**: 加密、SSL/TLS、认证授权等
- **测试**: 测试框架、E2E 测试等
- **游戏开发**: Unity、Unreal、Godot 等
- **移动开发**: iOS、Android、React Native、Flutter 等
- **区块链**: Blockchain、Crypto、Web3、DeFi 等
- **其他**: 文档、命令行工具、学习资源等

## 常见问题

### Q: API 限制问题
**A**: 
- 无 Token：60 请求/小时
- 有 Token：5000 请求/小时
- 建议使用 Token 以获得更高限制

### Q: 翻译功能不工作
**A**: 
- 确保安装了 `httpx`: `pip install httpx`
- 检查网络连接
- 翻译服务可能不可用，脚本会自动跳过

### Q: 获取数据超时
**A**: 
- 检查网络连接
- 减少获取数量（修改脚本中的 `limit` 参数）
- 稍后重试

### Q: 中文显示乱码
**A**: 
- Windows 用户：脚本已自动处理 UTF-8 编码
- 其他系统：确保终端支持 UTF-8

## 扩展建议

### 可能的改进方向
1. **合并脚本**: 创建统一的 CLI 工具支持 Stars 和 Repos
2. **增量更新**: 支持增量更新而不是每次全量获取
3. **自定义分类**: 允许用户自定义主题关键词
4. **数据对比**: 支持不同时间点的数据对比分析
5. **Web 界面**: 创建简单的 Web 界面展示数据
6. **定时任务**: 支持定时自动更新报告
7. **高级统计**: 添加趋势分析、活跃度指数等

## 开发规范

### 代码风格
- 使用 Python 3.6+ 特性
- 遵循 PEP 8 规范
- 添加类型注解（可选）
- 中文注释和文档字符串

### 错误处理
- 所有网络请求都应有超时设置
- 优雅处理 API 错误
- 提供清晰的错误提示

### 性能考虑
- 实现请求缓存机制
- 支持分页获取大量数据
- 考虑 API 速率限制

## 相关资源

- [GitHub API 文档](https://docs.github.com/en/rest)
- [GitHub Token 管理](https://github.com/settings/tokens)
- [Python requests 库](https://requests.readthedocs.io/)
