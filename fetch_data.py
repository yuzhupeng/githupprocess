#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
非交互式数据获取脚本 - 用于 GitHub Actions 和自动化
"""

import os
import sys
from pathlib import Path

# 添加当前目录到 Python 路径
sys.path.insert(0, str(Path(__file__).parent))

from organize_github_stars import GitHubStarOrganizer
from organize_github_repos import GitHubRepoOrganizer

def main():
    # 从环境变量读取配置
    username = os.getenv('GITHUB_USERNAME', 'yuzhupeng')
    token = os.getenv('GITHUB_TOKEN')
    
    print(f"📊 开始获取 GitHub 数据...")
    print(f"用户名: {username}")
    print(f"Token: {'已设置' if token else '未设置'}\n")
    
    # 确保输出目录存在
    output_dir = Path('assets/data')
    output_dir.mkdir(parents=True, exist_ok=True)
    
    # 获取 Stars 数据
    print("=" * 50)
    print("获取 Stars 数据...")
    print("=" * 50)
    try:
        stars_organizer = GitHubStarOrganizer(username, token)
        if stars_organizer.fetch_stars():
            stars_organizer.generate_summary()
            stars_organizer.save_markdown('GitHub_Stars.md')
            stars_organizer.save_json(str(output_dir / 'github_stars.json'))
            stars_organizer.save_csv('github_stars.csv')
            print("✅ Stars 数据已生成\n")
        else:
            print("❌ 无法获取 Stars 数据\n")
    except Exception as e:
        print(f"❌ 获取 Stars 数据出错: {e}\n")
    
    # 获取 Repositories 数据
    print("=" * 50)
    print("获取 Repositories 数据...")
    print("=" * 50)
    try:
        repos_organizer = GitHubRepoOrganizer(username, token)
        if repos_organizer.fetch_repos():
            repos_organizer.generate_summary()
            repos_organizer.save_markdown('GitHub_Repos.md')
            repos_organizer.save_json(str(output_dir / 'github_repos.json'))
            repos_organizer.save_csv('github_repos.csv')
            print("✅ Repositories 数据已生成\n")
        else:
            print("❌ 无法获取 Repositories 数据\n")
    except Exception as e:
        print(f"❌ 获取 Repositories 数据出错: {e}\n")
    
    print("=" * 50)
    print("✅ 所有数据已生成完毕!")
    print("=" * 50)

if __name__ == '__main__':
    main()
