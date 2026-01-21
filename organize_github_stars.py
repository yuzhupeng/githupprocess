#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
GitHub Stars 整理脚本
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

class GitHubStarOrganizer:
    # 描述长度限制
    DESC_MAX_LENGTH = 100
    
    # 主题关键词映射
    TOPIC_KEYWORDS = {
        'Web 框架': ['django', 'flask', 'fastapi', 'express', 'react', 'vue', 'angular', 'next', 'nuxt', 'svelte', 'rails', 'laravel', 'spring'],
        '数据科学': ['pandas', 'numpy', 'scikit', 'tensorflow', 'pytorch', 'keras', 'matplotlib', 'seaborn', 'jupyter', 'data', 'ml', 'ai', 'machine learning'],
        '数据库': ['mysql', 'postgresql', 'mongodb', 'redis', 'elasticsearch', 'database', 'sql', 'orm'],
        '命令行工具': ['cli', 'command', 'terminal', 'shell', 'bash', 'zsh', 'tool'],
        '开发工具': ['vscode', 'editor', 'ide', 'debugger', 'linter', 'formatter', 'build', 'webpack', 'gulp', 'grunt'],
        '测试框架': ['test', 'pytest', 'jest', 'mocha', 'unittest', 'rspec', 'jasmine'],
        '文档': ['documentation', 'docs', 'sphinx', 'mkdocs', 'docusaurus'],
        '认证授权': ['auth', 'oauth', 'jwt', 'security', 'permission'],
        '爬虫': ['crawler', 'scraper', 'spider', 'selenium', 'beautifulsoup'],
        '游戏': ['game', 'unity', 'unreal', 'godot', 'pygame'],
        '移动开发': ['ios', 'android', 'react-native', 'flutter', 'mobile'],
        '云计算': ['aws', 'azure', 'gcp', 'docker', 'kubernetes', 'cloud'],
        '区块链': ['blockchain', 'crypto', 'ethereum', 'bitcoin', 'web3'],
        '图像处理': ['image', 'opencv', 'pillow', 'graphics', 'vision'],
        '音视频': ['audio', 'video', 'ffmpeg', 'media', 'streaming'],
    }
    
    def __init__(self, username, token=None):
        self.username = username
        self.token = token
        self.headers = {'Accept': 'application/vnd.github.v3+json'}
        if token:
            self.headers['Authorization'] = f'token {token}'
        self.stars = []
        self.translation_cache = {}  # 缓存翻译结果
    
    def fetch_stars(self, limit=None):
        """获取所有 star 项目"""
        print(f"正在获取 {self.username} 的 star 项目...")
        page = 1
        while True:
            url = f'https://api.github.com/users/{self.username}/starred'
            params = {'page': page, 'per_page': 100, 'sort': 'starred_at', 'direction': 'desc'}
            
            try:
                response = requests.get(url, headers=self.headers, params=params, timeout=10)
                if response.status_code != 200:
                    print(f"错误: {response.status_code} - {response.text}")
                    break
                
                data = response.json()
                if not data:
                    break
                
                self.stars.extend(data)
                print(f"已获取 {len(self.stars)} 个项目...")
                
                # 如果指定了限制，检查是否达到
                if limit and len(self.stars) >= limit:
                    self.stars = self.stars[:limit]
                    break
                
                page += 1
            except Exception as e:
                print(f"获取数据出错: {e}")
                break
        
        print(f"✓ 共获取 {len(self.stars)} 个 star 项目\n")
        return self.stars
    
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
        for star in self.stars:
            lang = star.get('language') or 'Unknown'
            organized[lang].append(self._format_star(star))
        return organized
    
    def organize_by_topic(self):
        """按主题分类"""
        organized = defaultdict(list)
        for star in self.stars:
            description = star.get('description', '')
            topics = self.categorize_by_topic(description)
            for topic in topics:
                organized[topic].append(self._format_star(star))
        return organized
    
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
    
    def _format_star(self, star):
        """格式化 star 项目信息"""
        return {
            'name': star['name'],
            'url': star['html_url'],
            'description': star['description'] or '暂无描述',
            'stars': star['stargazers_count'],
            'language': star['language'] or 'Unknown',
            'forks': star['forks_count'],
            'updated_at': star['updated_at'],
        }
    
    def generate_markdown(self):
        """生成 Markdown 文档"""
        md = f"# GitHub Stars 整理\n\n"
        md += f"**用户**: {self.username}\n"
        md += f"**生成时间**: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n"
        md += f"**总数**: {len(self.stars)} 个项目\n\n"
        md += "---\n\n"
        
        # 按语言分类
        md += "## 📊 按编程语言分类\n\n"
        by_lang = self.organize_by_language()
        for lang in sorted(by_lang.keys(), key=lambda x: len(by_lang[x]), reverse=True):
            projects = sorted(by_lang[lang], key=lambda x: x['stars'], reverse=True)
            md += f"### {lang} ({len(projects)})\n\n"
            
            for proj in projects:
                md += f"- **[{proj['name']}]({proj['url']})** ⭐ {proj['stars']}\n"
                md += f"  - {self.get_bilingual_description(proj['description'])}\n"
                md += f"  - 🔗 Forks: {proj['forks']}\n\n"
        
        # 按主题分类
        md += "\n---\n\n"
        md += "## 🏷️ 按主题分类\n\n"
        by_topic = self.organize_by_topic()
        for topic in sorted(by_topic.keys()):
            projects = sorted(by_topic[topic], key=lambda x: x['stars'], reverse=True)
            md += f"### {topic} ({len(projects)})\n\n"
            
            for proj in projects:
                md += f"- **[{proj['name']}]({proj['url']})** ⭐ {proj['stars']}\n"
                md += f"  - {self.get_bilingual_description(proj['description'])}\n\n"
        
        # Top 10
        md += "\n---\n\n"
        md += "## 🌟 Top 10 热门项目\n\n"
        top_10 = sorted(self.stars, key=lambda x: x['stargazers_count'], reverse=True)[:10]
        for i, proj in enumerate(top_10, 1):
            md += f"{i}. **[{proj['name']}]({proj['html_url']})** ⭐ {proj['stargazers_count']}\n"
            md += f"   - {self.get_bilingual_description(proj['description'] or '暂无描述')}\n\n"
        
        return md
    
    def save_markdown(self, filename='GitHub_Stars.md'):
        """保存为 Markdown 文件"""
        md = self.generate_markdown()
        with open(filename, 'w', encoding='utf-8') as f:
            f.write(md)
        print(f"✓ Markdown 文件已保存: {filename}")
    
    def save_json(self, filename='github_stars.json'):
        """保存为 JSON 文件"""
        data = {
            'username': self.username,
            'generated_at': datetime.now().isoformat(),
            'total': len(self.stars),
            'by_language': self.organize_by_language(),
            'by_topic': self.organize_by_topic(),
            'all_projects': [self._format_star(s) for s in self.stars]
        }
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        print(f"✓ JSON 文件已保存: {filename}")
    
    def save_csv(self, filename='github_stars.csv'):
        """保存为 CSV 文件"""
        with open(filename, 'w', newline='', encoding='utf-8') as f:
            writer = csv.writer(f)
            writer.writerow(['项目名称', '链接', '描述', 'Stars', '语言', 'Forks', '最后更新'])
            
            for star in sorted(self.stars, key=lambda x: x['stargazers_count'], reverse=True):
                writer.writerow([
                    star['name'],
                    star['html_url'],
                    star['description'] or '暂无描述',
                    star['stargazers_count'],
                    star['language'] or 'Unknown',
                    star['forks_count'],
                    star['updated_at']
                ])
        print(f"✓ CSV 文件已保存: {filename}")
    
    def generate_summary(self):
        """生成统计摘要"""
        by_lang = self.organize_by_language()
        by_topic = self.organize_by_topic()
        
        print("\n" + "="*50)
        print("📈 统计摘要")
        print("="*50)
        print(f"总项目数: {len(self.stars)}")
        print(f"\n编程语言分布 (Top 5):")
        for lang, projects in sorted(by_lang.items(), key=lambda x: len(x[1]), reverse=True)[:5]:
            print(f"  {lang}: {len(projects)} 个")
        
        print(f"\n主题分布 (Top 5):")
        for topic, projects in sorted(by_topic.items(), key=lambda x: len(x[1]), reverse=True)[:5]:
            print(f"  {topic}: {len(projects)} 个")
        
        top_star = max(self.stars, key=lambda x: x['stargazers_count'])
        print(f"\n最受欢迎的项目:")
        print(f"  {top_star['name']}: ⭐ {top_star['stargazers_count']}")
        print("="*50 + "\n")


def main():
    # 配置
    USERNAME = input("请输入你的 GitHub 用户名: ").strip()
    TOKEN = os.getenv('GITHUB_TOKEN') or input("请输入 GitHub Token (可选，直接回车跳过): ").strip() or None
    
    if not USERNAME:
        print("用户名不能为空!")
        return
    
    # 创建整理器
    organizer = GitHubStarOrganizer(USERNAME, TOKEN)
    
    # 获取数据 (先获取所有数据)
    if not organizer.fetch_stars():
        print("无法获取 star 项目，请检查用户名或网络连接")
        return
    
    # 生成报告
    organizer.generate_summary()
    organizer.save_markdown()
    organizer.save_json()
    organizer.save_csv()
    
    print("✅ 所有文件已生成完毕!")


if __name__ == '__main__':
    main()
