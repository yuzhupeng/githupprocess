#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
GitHub Repositories 整理脚本
功能：按语言、主题分类，生成 Markdown、JSON、CSV 格式的报告
"""

import requests
import json
import csv
from collections import defaultdict
from datetime import datetime
from pathlib import Path
import re
import sys
import os

# 设置 UTF-8 编码
os.environ['PYTHONIOENCODING'] = 'utf-8'
if sys.platform == 'win32':
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')

try:
    import httpx
    TRANSLATOR_AVAILABLE = True
except ImportError:
    TRANSLATOR_AVAILABLE = False
    print("⚠️  未安装翻译库，将跳过翻译功能")
    print("   安装命令: pip install httpx")

class GitHubRepoOrganizer:
    # 描述长度限制
    DESC_MAX_LENGTH = 100
    
    # 主题关键词映射 - 细粒度分类
    TOPIC_KEYWORDS = {
        # AI/ML 相关
        'AI/ML': ['ai', 'machine learning', 'deep learning', 'neural', 'transformer', 'llm', 'gpt', 'bert', 'nlp', 'cv', 'computer vision'],
        'LLM/大模型': ['llm', 'gpt', 'chatgpt', 'claude', 'gemini', 'deepseek', 'qwen', 'langchain', 'llamaindex'],
        '数据科学': ['pandas', 'numpy', 'scikit', 'tensorflow', 'pytorch', 'keras', 'matplotlib', 'seaborn', 'jupyter', 'data analysis'],
        
        # Web 开发
        'Web 框架': ['django', 'flask', 'fastapi', 'express', 'spring', 'rails', 'laravel', 'asp.net', 'nextjs', 'nuxtjs'],
        'React 生态': ['react', 'nextjs', 'remix', 'gatsby', 'react-native'],
        'Vue 生态': ['vue', 'nuxt', 'vite'],
        '前端工具': ['webpack', 'vite', 'rollup', 'esbuild', 'parcel', 'gulp', 'grunt'],
        
        # 数据库/存储
        '数据库': ['mysql', 'postgresql', 'mongodb', 'redis', 'elasticsearch', 'database', 'sql', 'orm', 'clickhouse', 'cassandra'],
        'NoSQL': ['mongodb', 'redis', 'elasticsearch', 'dynamodb', 'firestore'],
        
        # DevOps/基础设施
        'DevOps': ['docker', 'kubernetes', 'ci/cd', 'jenkins', 'gitlab', 'github actions', 'terraform', 'ansible', 'devops'],
        '容器化': ['docker', 'kubernetes', 'container', 'k8s', 'orchestration'],
        '监控/日志': ['prometheus', 'grafana', 'elk', 'datadog', 'newrelic', 'monitoring', 'logging'],
        
        # 安全/认证
        '安全': ['security', 'encryption', 'ssl', 'tls', 'cryptography', 'penetration', 'hacking'],
        '认证授权': ['auth', 'oauth', 'jwt', 'permission', 'rbac', 'saml'],
        
        # 开发工具
        '编辑器/IDE': ['vscode', 'editor', 'ide', 'vim', 'neovim', 'emacs'],
        '调试工具': ['debugger', 'profiler', 'tracer', 'debugging'],
        '代码质量': ['linter', 'formatter', 'eslint', 'prettier', 'sonarqube'],
        
        # 测试
        '测试框架': ['test', 'pytest', 'jest', 'mocha', 'unittest', 'rspec', 'jasmine', 'testing'],
        'E2E测试': ['cypress', 'playwright', 'selenium', 'e2e'],
        
        # 爬虫/数据采集
        '爬虫': ['crawler', 'scraper', 'spider', 'selenium', 'beautifulsoup', 'scrapy'],
        
        # 游戏开发
        '游戏': ['game', 'unity', 'unreal', 'godot', 'pygame', 'gaming'],
        
        # 移动开发
        '移动开发': ['ios', 'android', 'react-native', 'flutter', 'mobile', 'app'],
        
        # 云计算
        '云计算': ['aws', 'azure', 'gcp', 'cloud', 'serverless'],
        
        # 区块链
        '区块链': ['blockchain', 'crypto', 'ethereum', 'bitcoin', 'web3', 'defi', 'nft'],
        
        # 多媒体
        '图像处理': ['image', 'opencv', 'pillow', 'graphics', 'vision', 'computer vision'],
        '音视频': ['audio', 'video', 'ffmpeg', 'media', 'streaming', 'rtmp'],
        
        # 其他
        '文档': ['documentation', 'docs', 'sphinx', 'mkdocs', 'docusaurus'],
        '命令行工具': ['cli', 'command', 'terminal', 'shell', 'bash', 'zsh', 'tool'],
        '学习资源': ['tutorial', 'course', 'learning', 'guide', 'awesome', 'roadmap'],
    }
    
    def __init__(self, username, token=None):
        self.username = username
        self.token = token
        self.headers = {'Accept': 'application/vnd.github.v3+json'}
        if token:
            self.headers['Authorization'] = f'token {token}'
        self.repos = []
        self.translation_cache = {}  # 缓存翻译结果
    
    def fetch_repos(self, limit=None):
        """获取所有 repositories"""
        print(f"正在获取 {self.username} 的 repositories...")
        page = 1
        while True:
            url = f'https://api.github.com/users/{self.username}/repos'
            params = {'page': page, 'per_page': 100, 'sort': 'updated', 'direction': 'desc'}
            
            try:
                response = requests.get(url, headers=self.headers, params=params, timeout=10)
                if response.status_code != 200:
                    print(f"错误: {response.status_code} - {response.text}")
                    break
                
                data = response.json()
                if not data:
                    break
                
                self.repos.extend(data)
                print(f"已获取 {len(self.repos)} 个项目...")
                
                # 如果指定了限制，检查是否达到
                if limit and len(self.repos) >= limit:
                    self.repos = self.repos[:limit]
                    break
                
                page += 1
            except Exception as e:
                print(f"获取数据出错: {e}")
                break
        
        print(f"✓ 共获取 {len(self.repos)} 个 repositories\n")
        return self.repos
    
    def categorize_by_topic(self, description):
        """根据描述分类到主题"""
        if not description:
            return ['其他']
        
        desc_lower = description.lower()
        topics = []
        
        for topic, keywords in self.TOPIC_KEYWORDS.items():
            if any(keyword in desc_lower for keyword in keywords):
                topics.append(topic)
        
        return topics if topics else ['其他']
    
    def organize_by_language(self):
        """按编程语言分类"""
        organized = defaultdict(list)
        for repo in self.repos:
            lang = repo.get('language') or 'Unknown'
            organized[lang].append(self._format_repo(repo))
        return organized
    
    def organize_by_topic(self):
        """按主题分类"""
        organized = defaultdict(list)
        for repo in self.repos:
            description = repo.get('description', '')
            topics = self.categorize_by_topic(description)
            for topic in topics:
                organized[topic].append(self._format_repo(repo))
        return organized
    
    def sort_by_stars(self):
        """按 Stars 数排序"""
        return sorted(self.repos, key=lambda x: x['stargazers_count'], reverse=True)
    
    def sort_by_forks(self):
        """按 Forks 数排序"""
        return sorted(self.repos, key=lambda x: x['forks_count'], reverse=True)
    
    def sort_by_updated(self):
        """按更新时间排序"""
        return sorted(self.repos, key=lambda x: x['updated_at'], reverse=True)
    
    def get_statistics(self):
        """获取详细统计信息"""
        by_lang = self.organize_by_language()
        by_topic = self.organize_by_topic()
        
        # 计算平均 stars 和 forks
        avg_stars = sum(r['stargazers_count'] for r in self.repos) / len(self.repos) if self.repos else 0
        avg_forks = sum(r['forks_count'] for r in self.repos) / len(self.repos) if self.repos else 0
        
        # 找出最活跃的项目（最近更新）
        most_active = sorted(self.repos, key=lambda x: x['updated_at'], reverse=True)[:5]
        
        # 找出最受欢迎的项目
        most_popular = sorted(self.repos, key=lambda x: x['stargazers_count'], reverse=True)[:5]
        
        # 找出最多 fork 的项目
        most_forked = sorted(self.repos, key=lambda x: x['forks_count'], reverse=True)[:5]
        
        return {
            'total': len(self.repos),
            'by_language': by_lang,
            'by_topic': by_topic,
            'avg_stars': avg_stars,
            'avg_forks': avg_forks,
            'most_active': most_active,
            'most_popular': most_popular,
            'most_forked': most_forked,
            'language_count': len(by_lang),
            'topic_count': len(by_topic),
        }
    
    def truncate_description(self, description, max_length=None):
        """截取描述长度"""
        if max_length is None:
            max_length = self.DESC_MAX_LENGTH
        
        if not description:
            return '暂无描述'
        
        if len(description) <= max_length:
            return description
        
        return description[:max_length].rstrip() + '...'
    
    def translate_text(self, text):
        """翻译文本 - 使用百度翻译 API"""
        if not TRANSLATOR_AVAILABLE:
            return text
        
        # 检查缓存
        if text in self.translation_cache:
            return self.translation_cache[text]
        
        try:
            # 使用百度翻译 API (免费)
            url = 'https://api.mymemory.translated.net/get'
            params = {
                'q': text,
                'langpair': 'en|zh-CN'
            }
            response = requests.get(url, params=params, timeout=5)
            if response.status_code == 200:
                data = response.json()
                if data.get('responseStatus') == 200:
                    translated = data['responseData']['translatedText']
                    self.translation_cache[text] = translated
                    return translated
        except Exception:
            pass
        
        return text
    
    def get_bilingual_description(self, description):
        """获取中英文双语描述"""
        if not description or description == '暂无描述':
            return '暂无描述'
        
        # 截取长度
        truncated = self.truncate_description(description)
        
        # 翻译
        if TRANSLATOR_AVAILABLE:
            translated = self.translate_text(truncated)
            if translated != truncated:  # 翻译成功
                return f"{translated}\n  > {truncated}"
        
        return truncated
    
    def _format_repo(self, repo):
        """格式化 repository 信息"""
        return {
            'name': repo['name'],
            'url': repo['html_url'],
            'description': repo['description'] or '暂无描述',
            'stars': repo['stargazers_count'],
            'language': repo['language'] or 'Unknown',
            'forks': repo['forks_count'],
            'updated_at': repo['updated_at'],
            'is_fork': repo['fork'],
            'is_private': repo['private'],
        }
    
    def generate_markdown(self):
        """生成 Markdown 文档"""
        stats = self.get_statistics()
        
        md = f"# GitHub Repositories 整理\n\n"
        md += f"**用户**: {self.username}\n"
        md += f"**生成时间**: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n"
        md += f"**总数**: {len(self.repos)} 个项目\n\n"
        
        # 快速导航
        md += "## 📑 快速导航\n\n"
        md += "- [📊 统计概览](#-统计概览)\n"
        md += "- [🔥 热度排行](#-热度排行)\n"
        md += "- [🔄 最近更新](#-最近更新)\n"
        md += "- [👥 最多Fork](#-最多fork)\n"
        md += "- [📚 按编程语言](#-按编程语言分类)\n"
        md += "- [🏷️ 按主题](#-按主题分类)\n\n"
        
        md += "---\n\n"
        
        # 统计概览
        md += "## 📊 统计概览\n\n"
        md += f"| 指标 | 数值 |\n"
        md += f"|------|------|\n"
        md += f"| 总项目数 | {stats['total']} |\n"
        md += f"| 编程语言数 | {stats['language_count']} |\n"
        md += f"| 主题分类数 | {stats['topic_count']} |\n"
        md += f"| 平均 Stars | {stats['avg_stars']:.0f} |\n"
        md += f"| 平均 Forks | {stats['avg_forks']:.0f} |\n\n"
        
        # 编程语言分布
        md += "### 编程语言分布 (Top 10)\n\n"
        lang_sorted = sorted(stats['by_language'].items(), key=lambda x: len(x[1]), reverse=True)[:10]
        for lang, projects in lang_sorted:
            md += f"- {lang}: {len(projects)} 个\n"
        md += "\n"
        
        # 主题分布
        md += "### 主题分布 (Top 15)\n\n"
        topic_sorted = sorted(stats['by_topic'].items(), key=lambda x: len(x[1]), reverse=True)[:15]
        for topic, projects in topic_sorted:
            md += f"- {topic}: {len(projects)} 个\n"
        md += "\n"
        
        md += "---\n\n"
        
        # 热度排行
        md += "## 🔥 热度排行 (按 Stars)\n\n"
        top_stars = self.sort_by_stars()[:20]
        for i, proj in enumerate(top_stars, 1):
            md += f"{i}. **[{proj['name']}]({proj['html_url']})** ⭐ {proj['stargazers_count']}\n"
            md += f"   - {self.get_bilingual_description(proj['description'] or '暂无描述')}\n"
            md += f"   - 🔗 Forks: {proj['forks_count']}\n\n"
        
        md += "---\n\n"
        
        # 最近更新
        md += "## 🔄 最近更新 (按更新时间)\n\n"
        recent = self.sort_by_updated()[:20]
        for i, proj in enumerate(recent, 1):
            updated_date = proj['updated_at'][:10]
            md += f"{i}. **[{proj['name']}]({proj['html_url']})** ⭐ {proj['stargazers_count']}\n"
            md += f"   - 最后更新: {updated_date}\n"
            md += f"   - {self.get_bilingual_description(proj['description'] or '暂无描述')}\n\n"
        
        md += "---\n\n"
        
        # 最多 Fork
        md += "## 👥 最多Fork (按 Forks 数)\n\n"
        top_forks = self.sort_by_forks()[:20]
        for i, proj in enumerate(top_forks, 1):
            md += f"{i}. **[{proj['name']}]({proj['html_url']})** ⭐ {proj['stargazers_count']}\n"
            md += f"   - 🔗 Forks: {proj['forks_count']}\n"
            md += f"   - {self.get_bilingual_description(proj['description'] or '暂无描述')}\n\n"
        
        md += "---\n\n"
        
        # 按语言分类
        md += "## 📚 按编程语言分类\n\n"
        by_lang = self.organize_by_language()
        for lang in sorted(by_lang.keys(), key=lambda x: len(by_lang[x]), reverse=True):
            projects = sorted(by_lang[lang], key=lambda x: x['stars'], reverse=True)
            md += f"### {lang} ({len(projects)})\n\n"
            
            for proj in projects[:30]:  # 每个语言最多显示30个
                md += f"- **[{proj['name']}]({proj['url']})** ⭐ {proj['stars']}\n"
                md += f"  - {self.get_bilingual_description(proj['description'])}\n"
                md += f"  - 🔗 Forks: {proj['forks']}\n\n"
            
            if len(projects) > 30:
                md += f"*... 还有 {len(projects) - 30} 个项目*\n\n"
        
        # 按主题分类
        md += "\n---\n\n"
        md += "## 🏷️ 按主题分类\n\n"
        by_topic = self.organize_by_topic()
        for topic in sorted(by_topic.keys()):
            projects = sorted(by_topic[topic], key=lambda x: x['stars'], reverse=True)
            md += f"### {topic} ({len(projects)})\n\n"
            
            for proj in projects[:30]:  # 每个主题最多显示30个
                md += f"- **[{proj['name']}]({proj['url']})** ⭐ {proj['stars']}\n"
                md += f"  - {self.get_bilingual_description(proj['description'])}\n\n"
            
            if len(projects) > 30:
                md += f"*... 还有 {len(projects) - 30} 个项目*\n\n"
        
        return md
    
    def save_markdown(self, filename='GitHub_Repos.md'):
        """保存为 Markdown 文件"""
        md = self.generate_markdown()
        with open(filename, 'w', encoding='utf-8') as f:
            f.write(md)
        print(f"✓ Markdown 文件已保存: {filename}")
    
    def save_json(self, filename='github_repos.json'):
        """保存为 JSON 文件"""
        data = {
            'username': self.username,
            'generated_at': datetime.now().isoformat(),
            'total': len(self.repos),
            'by_language': self.organize_by_language(),
            'by_topic': self.organize_by_topic(),
            'all_repos': [self._format_repo(r) for r in self.repos]
        }
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        print(f"✓ JSON 文件已保存: {filename}")
    
    def save_csv(self, filename='github_repos.csv'):
        """保存为 CSV 文件"""
        with open(filename, 'w', newline='', encoding='utf-8') as f:
            writer = csv.writer(f)
            writer.writerow(['项目名称', '链接', '描述', 'Stars', '语言', 'Forks', '最后更新', '是否Fork', '是否私有'])
            
            for repo in sorted(self.repos, key=lambda x: x['stargazers_count'], reverse=True):
                writer.writerow([
                    repo['name'],
                    repo['html_url'],
                    repo['description'] or '暂无描述',
                    repo['stargazers_count'],
                    repo['language'] or 'Unknown',
                    repo['forks_count'],
                    repo['updated_at'],
                    '是' if repo['fork'] else '否',
                    '是' if repo['private'] else '否',
                ])
        print(f"✓ CSV 文件已保存: {filename}")
    
    def generate_summary(self):
        """生成统计摘要"""
        by_lang = self.organize_by_language()
        by_topic = self.organize_by_topic()
        
        print("\n" + "="*50)
        print("📈 统计摘要")
        print("="*50)
        print(f"总项目数: {len(self.repos)}")
        print(f"\n编程语言分布 (Top 5):")
        for lang, projects in sorted(by_lang.items(), key=lambda x: len(x[1]), reverse=True)[:5]:
            print(f"  {lang}: {len(projects)} 个")
        
        print(f"\n主题分布 (Top 5):")
        for topic, projects in sorted(by_topic.items(), key=lambda x: len(x[1]), reverse=True)[:5]:
            print(f"  {topic}: {len(projects)} 个")
        
        if self.repos:
            top_repo = max(self.repos, key=lambda x: x['stargazers_count'])
            print(f"\n最受欢迎的项目:")
            print(f"  {top_repo['name']}: ⭐ {top_repo['stargazers_count']}")
        print("="*50 + "\n")


def main():
    # 配置
    USERNAME = input("请输入你的 GitHub 用户名: ").strip()
    TOKEN = os.getenv('GITHUB_TOKEN') or input("请输入 GitHub Token (可选，直接回车跳过): ").strip() or None
    
    if not USERNAME:
        print("用户名不能为空!")
        return
    
    # 创建整理器
    organizer = GitHubRepoOrganizer(USERNAME, TOKEN)
    
    # 获取数据
    if not organizer.fetch_repos():
        print("无法获取 repositories，请检查用户名或网络连接")
        return
    
    # 生成报告
    organizer.generate_summary()
    organizer.save_markdown()
    organizer.save_json()
    organizer.save_csv()
    
    print("✅ 所有文件已生成完毕!")


if __name__ == '__main__':
    main()
