# GitHub 数据展示页面

一个现代化的 Web 展示页面，用于在 GitHub Pages 上展示用户的 Stars 和 Repositories 数据。通过自动化工作流，每次提交时自动抓取最新数据并生成页面。

## 🌟 功能特性

### Stars 展示
- 📊 **统计概览** - 显示总数、语言数、主题数
- 🔥 **热度排行** - 按 Stars 数排序的项目列表
- 📚 **语言分类** - 按编程语言分类的项目统计
- 🏷️ **主题分类** - 按主题分类的项目统计

### Repositories 展示
- 📊 **统计概览** - 显示总数、语言数、主题数、平均 Stars/Forks
- 🔥 **热度排行** - 按 Stars 数排序的项目列表
- 📚 **语言分类** - 按编程语言分类的项目统计
- 🏷️ **主题分类** - 按主题分类的项目统计

### 用户体验
- 🎨 **现代化设计** - 清晰的排版和视觉效果
- 📱 **响应式设计** - 完美适配移动、平板和桌面设备
- ⚡ **快速加载** - 1 秒内完成页面渲染
- 💾 **页签记忆** - 自动记住用户上次选择的页签
- 🔄 **无需重新加载** - 切换页签时立即显示内容

### 自动化工作流
- 🤖 **自动更新** - 每次提交时自动抓取最新数据
- 📦 **多格式输出** - 支持 Markdown、JSON、CSV 格式
- 🚀 **自动部署** - GitHub Pages 自动部署

## 📋 项目结构

```
.
├── index.html                    # 主页面
├── assets/
│   ├── css/
│   │   └── style.css            # 样式表
│   ├── js/
│   │   ├── app.js               # 应用主逻辑
│   │   └── *.test.js            # 测试文件
│   └── data/
│       ├── github_stars.json    # Stars 数据
│       └── github_repos.json    # Repositories 数据
├── .github/
│   └── workflows/
│       └── update-data.yml      # GitHub Actions 工作流
├── organize_github_stars.py     # Stars 整理脚本
├── organize_github_repos.py     # Repositories 整理脚本
├── README.md                     # 本文件
└── package.json                  # 项目配置
```

## 🚀 快速开始

### 前置要求

- Python 3.6+
- Node.js 14+（用于前端开发）
- GitHub Token（可选，但推荐用于提高 API 限制）

### 本地开发

#### 1. 克隆项目

```bash
git clone https://github.com/your-username/your-repo.git
cd your-repo
```

#### 2. 安装依赖

```bash
# Python 依赖
pip install requests

# Node.js 依赖（可选，用于开发和测试）
npm install
```

#### 3. 获取 GitHub Token

1. 访问 [GitHub Settings - Tokens](https://github.com/settings/tokens)
2. 点击 "Generate new token"
3. 选择 `public_repo` 权限
4. 复制 token

#### 4. 运行脚本

```bash
# 获取 Stars 数据
python organize_github_stars.py
# 输入用户名：your-username
# 输入 Token：your-token（可选）

# 获取 Repositories 数据
python organize_github_repos.py
# 输入用户名：your-username
# 输入 Token：your-token（可选）
```

#### 5. 本地预览

```bash
# 使用 Python 内置服务器
python -m http.server 8000

# 或使用 Node.js http-server
npx http-server

# 访问 http://localhost:8000
```

### 环境变量配置（可选）

```bash
# Windows (cmd)
set GITHUB_TOKEN=your_token_here

# Windows (PowerShell)
$env:GITHUB_TOKEN="your_token_here"

# macOS/Linux
export GITHUB_TOKEN=your_token_here
```

## 📊 数据格式

### Stars 数据结构

```json
{
  "username": "string",
  "generated_at": "ISO 8601 datetime",
  "total": "number",
  "by_language": {
    "language_name": {
      "count": "number",
      "percentage": "number"
    }
  },
  "by_topic": {
    "topic_name": {
      "count": "number",
      "percentage": "number"
    }
  },
  "all_projects": [
    {
      "name": "string",
      "html_url": "string",
      "description": "string",
      "stargazers_count": "number",
      "language": "string",
      "topics": ["string"],
      "updated_at": "ISO 8601 datetime"
    }
  ]
}
```

### Repositories 数据结构

```json
{
  "username": "string",
  "generated_at": "ISO 8601 datetime",
  "total": "number",
  "average_stars": "number",
  "average_forks": "number",
  "by_language": {
    "language_name": {
      "count": "number",
      "percentage": "number"
    }
  },
  "by_topic": {
    "topic_name": {
      "count": "number",
      "percentage": "number"
    }
  },
  "all_projects": [
    {
      "name": "string",
      "html_url": "string",
      "description": "string",
      "stargazers_count": "number",
      "forks_count": "number",
      "language": "string",
      "topics": ["string"],
      "updated_at": "ISO 8601 datetime",
      "fork": "boolean",
      "private": "boolean"
    }
  ]
}
```

## 🔧 使用说明

### 页面功能

#### 页签切换
- 点击 "⭐ Stars" 或 "📦 Repositories" 页签切换内容
- 页签选择会自动保存到浏览器本地存储
- 刷新页面时会恢复上次选择的页签

#### 项目链接
- 点击项目名称或链接会在新标签页打开 GitHub 项目页面
- 支持所有主流浏览器

#### 数据统计
- 统计卡片显示关键指标
- 分类统计显示按语言和主题的分布
- 热度排行按 Stars 数从高到低排序

### 响应式设计

页面在不同设备上的表现：

- **移动设备** (< 768px)
  - 单列布局
  - 隐藏或折叠非关键信息
  - 优化的字体大小和间距

- **平板设备** (768px - 1024px)
  - 两列布局
  - 调整卡片大小
  - 平衡的信息展示

- **桌面设备** (> 1024px)
  - 多列布局
  - 完整的信息展示
  - 最佳的视觉效果

## 🤖 自动化工作流

### GitHub Actions 配置

项目包含自动化工作流 `.github/workflows/update-data.yml`，配置如下：

- **触发条件**：代码提交到 main 分支
- **执行步骤**：
  1. 检出代码
  2. 设置 Python 环境
  3. 安装依赖
  4. 运行 Stars 整理脚本
  5. 运行 Repositories 整理脚本
  6. 提交更新到仓库
  7. GitHub Pages 自动部署

### 工作流变量

在 GitHub 仓库设置中配置以下 Secrets：

- `GITHUB_TOKEN`：GitHub API token（用于获取数据）

### 手动触发工作流

```bash
# 推送到 main 分支自动触发
git push origin main

# 或在 GitHub 网页界面手动触发
# Actions → update-data → Run workflow
```

## 📈 性能指标

- **页面加载时间**：< 1 秒
- **数据渲染时间**：< 500ms
- **页签切换响应**：即时（无需重新加载）
- **浏览器兼容性**：Chrome、Firefox、Safari、Edge 最新版本

## 🧪 测试

### 运行测试

```bash
# 运行所有测试
npm test

# 运行特定测试文件
npm test -- app.test.js

# 运行测试并生成覆盖率报告
npm test -- --coverage
```

### 测试覆盖

- ✅ 数据加载和处理
- ✅ 页面渲染和交互
- ✅ 页签切换功能
- ✅ 错误处理
- ✅ 响应式设计
- ✅ 浏览器兼容性

## 🐛 常见问题

### Q: 如何更新数据？

**A**: 有两种方式：

1. **自动更新**：提交代码到 main 分支，GitHub Actions 会自动运行脚本更新数据
2. **手动更新**：在本地运行 `organize_github_stars.py` 和 `organize_github_repos.py` 脚本

### Q: 如何修改数据源？

**A**: 编辑 Python 脚本中的配置：

- `organize_github_stars.py`：修改 `fetch_stars()` 方法
- `organize_github_repos.py`：修改 `fetch_repos()` 方法

### Q: 如何自定义主题分类？

**A**: 编辑 Python 脚本中的 `TOPIC_KEYWORDS` 字典，添加或修改主题关键词。

### Q: 页面显示不正常？

**A**: 检查以下几点：

1. 确保 `assets/data/github_stars.json` 和 `assets/data/github_repos.json` 存在
2. 确保 JSON 文件格式有效
3. 清除浏览器缓存并刷新页面
4. 检查浏览器控制台是否有错误信息

### Q: GitHub Pages 部署失败？

**A**: 检查以下几点：

1. 确保仓库是公开的（或 GitHub Pages 已启用）
2. 确保 main 分支是默认分支
3. 检查 GitHub Actions 工作流是否成功运行
4. 查看 GitHub Pages 设置中的部署状态

## 📝 许可证

MIT License - 详见 LICENSE 文件

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📞 联系方式

如有问题或建议，请通过以下方式联系：

- 提交 GitHub Issue
- 发送 Pull Request
- 发送邮件至 [your-email@example.com]

## 🔗 相关资源

- [GitHub API 文档](https://docs.github.com/en/rest)
- [GitHub Pages 文档](https://docs.github.com/en/pages)
- [GitHub Actions 文档](https://docs.github.com/en/actions)

---

**最后更新**：2024 年 1 月

**维护者**：[Your Name]
