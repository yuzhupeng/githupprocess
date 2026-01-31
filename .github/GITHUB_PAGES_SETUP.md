# GitHub Pages 配置指南

本文档说明如何在 GitHub 仓库中启用和配置 GitHub Pages。

## 📋 前置要求

- 拥有 GitHub 仓库的管理员权限
- 仓库已启用 GitHub Actions

## 🚀 配置步骤

### 步骤 1: 启用 GitHub Pages

1. 访问仓库的 **Settings** 页面
2. 在左侧菜单中找到 **Pages** 选项
3. 在 "Build and deployment" 部分：
   - **Source** 选择 "Deploy from a branch"
   - **Branch** 选择 "main"
   - **Folder** 选择 "/" (root)
4. 点击 **Save** 按钮

### 步骤 2: 配置工作流权限

1. 访问仓库的 **Settings** 页面
2. 在左侧菜单中找到 **Actions** → **General**
3. 在 "Workflow permissions" 部分：
   - 选择 "Read and write permissions"
   - 勾选 "Allow GitHub Actions to create and approve pull requests"
4. 点击 **Save** 按钮

### 步骤 3: 配置 Secrets（可选但推荐）

如果需要自动更新数据，需要配置以下 Secrets：

1. 访问仓库的 **Settings** 页面
2. 在左侧菜单中找到 **Secrets and variables** → **Actions**
3. 点击 **New repository secret** 按钮
4. 添加以下 Secrets：

#### GITHUB_USERNAME
- **Name**: `GITHUB_USERNAME`
- **Value**: 你的 GitHub 用户名

#### GITHUB_TOKEN
- **Name**: `GITHUB_TOKEN`
- **Value**: 你的 GitHub Personal Access Token
  - 访问 https://github.com/settings/tokens
  - 点击 "Generate new token"
  - 选择 `public_repo` 权限
  - 复制 token 值

### 步骤 4: 验证部署

1. 访问仓库的 **Actions** 页面
2. 查看 "Deploy to GitHub Pages" 工作流的运行状态
3. 工作流成功运行后，访问 GitHub Pages URL：
   - `https://your-username.github.io/your-repo-name/`
   - 或 `https://your-custom-domain.com/`（如果配置了自定义域名）

## 📊 工作流说明

### update-data.yml
- **触发条件**：
  - 代码提交到 main 分支
  - 每周一 UTC 时间 00:00 自动运行
  - 手动触发（通过 workflow_dispatch）
- **功能**：
  - 抓取 GitHub Stars 数据
  - 抓取 GitHub Repositories 数据
  - 自动提交更新到仓库

### deploy-pages.yml
- **触发条件**：
  - 代码提交到 main 分支
  - 手动触发（通过 workflow_dispatch）
- **功能**：
  - 构建并部署到 GitHub Pages
  - 自动更新网站内容

## 🔗 GitHub Pages URL

部署成功后，你的网站将在以下 URL 可访问：

### 默认 URL
```
https://<username>.github.io/<repository-name>/
```

### 自定义域名（可选）

如果要使用自定义域名：

1. 在仓库根目录创建 `CNAME` 文件
2. 文件内容为你的自定义域名，例如：
   ```
   github-showcase.example.com
   ```
3. 在你的域名 DNS 设置中添加 CNAME 记录，指向 `<username>.github.io`
4. 在 GitHub Pages 设置中配置自定义域名

## 🐛 常见问题

### Q: 部署失败，显示 "Permission denied"

**A**: 检查工作流权限设置：
1. 访问 Settings → Actions → General
2. 确保 "Workflow permissions" 设置为 "Read and write permissions"

### Q: 页面显示 404

**A**: 检查以下几点：
1. 确保 GitHub Pages 已启用
2. 确保源分支设置为 "main"
3. 确保部署文件夹设置为 "/" (root)
4. 等待几分钟让 GitHub Pages 完成部署

### Q: 数据没有更新

**A**: 检查以下几点：
1. 确保 `GITHUB_USERNAME` 和 `GITHUB_TOKEN` Secrets 已配置
2. 查看 "Update GitHub Data" 工作流的运行日志
3. 确保 GitHub Token 有效且有 `public_repo` 权限

### Q: 如何使用自定义域名？

**A**: 
1. 在仓库根目录创建 `CNAME` 文件
2. 在 DNS 设置中添加 CNAME 记录
3. 在 GitHub Pages 设置中配置自定义域名

## 📚 相关资源

- [GitHub Pages 官方文档](https://docs.github.com/en/pages)
- [GitHub Actions 官方文档](https://docs.github.com/en/actions)
- [GitHub Personal Access Tokens](https://github.com/settings/tokens)

## ✅ 检查清单

部署前请确保完成以下步骤：

- [ ] GitHub Pages 已启用
- [ ] 源分支设置为 "main"
- [ ] 部署文件夹设置为 "/" (root)
- [ ] 工作流权限已配置
- [ ] GITHUB_USERNAME Secret 已配置
- [ ] GITHUB_TOKEN Secret 已配置
- [ ] 工作流已成功运行
- [ ] 网站可以通过 GitHub Pages URL 访问

---

**最后更新**：2024 年 1 月
