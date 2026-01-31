#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
部署验证脚本

用于验证 GitHub Pages 部署是否成功。
检查必需文件、JSON 格式、以及基本的页面结构。
"""

import os
import json
import sys
from pathlib import Path


class DeploymentVerifier:
    """部署验证器"""
    
    def __init__(self):
        self.errors = []
        self.warnings = []
        self.success_count = 0
        self.total_checks = 0
    
    def check_file_exists(self, filepath, description):
        """检查文件是否存在"""
        self.total_checks += 1
        if os.path.exists(filepath):
            print(f"✅ {description}: {filepath}")
            self.success_count += 1
            return True
        else:
            print(f"❌ {description}: {filepath} 不存在")
            self.errors.append(f"文件不存在: {filepath}")
            return False
    
    def check_json_format(self, filepath, description):
        """检查 JSON 文件格式"""
        self.total_checks += 1
        if not os.path.exists(filepath):
            print(f"❌ {description}: {filepath} 不存在")
            self.errors.append(f"JSON 文件不存在: {filepath}")
            return False
        
        try:
            with open(filepath, 'r', encoding='utf-8') as f:
                data = json.load(f)
            print(f"✅ {description}: JSON 格式有效")
            self.success_count += 1
            return True
        except json.JSONDecodeError as e:
            print(f"❌ {description}: JSON 格式错误 - {e}")
            self.errors.append(f"JSON 格式错误: {filepath} - {e}")
            return False
        except Exception as e:
            print(f"❌ {description}: 读取文件失败 - {e}")
            self.errors.append(f"读取文件失败: {filepath} - {e}")
            return False
    
    def check_json_structure(self, filepath, required_fields, description):
        """检查 JSON 文件结构"""
        self.total_checks += 1
        if not os.path.exists(filepath):
            print(f"❌ {description}: {filepath} 不存在")
            self.errors.append(f"JSON 文件不存在: {filepath}")
            return False
        
        try:
            with open(filepath, 'r', encoding='utf-8') as f:
                data = json.load(f)
            
            missing_fields = [field for field in required_fields if field not in data]
            
            if missing_fields:
                print(f"❌ {description}: 缺少必需字段 - {missing_fields}")
                self.errors.append(f"JSON 缺少字段: {filepath} - {missing_fields}")
                return False
            else:
                print(f"✅ {description}: 所有必需字段存在")
                self.success_count += 1
                return True
        except Exception as e:
            print(f"❌ {description}: 检查失败 - {e}")
            self.errors.append(f"检查失败: {filepath} - {e}")
            return False
    
    def check_html_structure(self, filepath, required_elements, description):
        """检查 HTML 文件结构"""
        self.total_checks += 1
        if not os.path.exists(filepath):
            print(f"❌ {description}: {filepath} 不存在")
            self.errors.append(f"HTML 文件不存在: {filepath}")
            return False
        
        try:
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()
            
            missing_elements = [elem for elem in required_elements if elem not in content]
            
            if missing_elements:
                print(f"❌ {description}: 缺少必需元素 - {missing_elements}")
                self.warnings.append(f"HTML 缺少元素: {filepath} - {missing_elements}")
                return False
            else:
                print(f"✅ {description}: 所有必需元素存在")
                self.success_count += 1
                return True
        except Exception as e:
            print(f"❌ {description}: 检查失败 - {e}")
            self.errors.append(f"检查失败: {filepath} - {e}")
            return False
    
    def verify_deployment(self):
        """执行完整的部署验证"""
        print("=" * 60)
        print("GitHub Pages 部署验证")
        print("=" * 60)
        print()
        
        # 检查必需文件
        print("📋 检查必需文件...")
        print("-" * 60)
        self.check_file_exists("index.html", "主页面")
        self.check_file_exists("assets/css/style.css", "样式表")
        self.check_file_exists("assets/js/app.js", "应用脚本")
        self.check_file_exists("assets/data/github_stars.json", "Stars 数据")
        self.check_file_exists("assets/data/github_repos.json", "Repositories 数据")
        self.check_file_exists("README.md", "README 文档")
        print()
        
        # 检查 JSON 格式
        print("📊 检查 JSON 文件格式...")
        print("-" * 60)
        self.check_json_format("assets/data/github_stars.json", "Stars JSON")
        self.check_json_format("assets/data/github_repos.json", "Repositories JSON")
        print()
        
        # 检查 JSON 结构
        print("🔍 检查 JSON 文件结构...")
        print("-" * 60)
        stars_fields = ["username", "generated_at", "total", "by_language", "by_topic", "all_projects"]
        repos_fields = ["username", "generated_at", "total", "average_stars", "average_forks", "by_language", "by_topic", "all_projects"]
        
        self.check_json_structure("assets/data/github_stars.json", stars_fields, "Stars JSON 结构")
        self.check_json_structure("assets/data/github_repos.json", repos_fields, "Repositories JSON 结构")
        print()
        
        # 检查 HTML 结构
        print("🏗️ 检查 HTML 文件结构...")
        print("-" * 60)
        html_elements = [
            "tab-navigation",
            "stars-content",
            "repos-content",
            "loading-indicator",
            "error-display",
            "assets/js/app.js"
        ]
        self.check_html_structure("index.html", html_elements, "HTML 结构")
        print()
        
        # 检查 GitHub Actions 工作流
        print("🤖 检查 GitHub Actions 工作流...")
        print("-" * 60)
        self.check_file_exists(".github/workflows/update-data.yml", "数据更新工作流")
        self.check_file_exists(".github/workflows/deploy-pages.yml", "部署工作流")
        print()
        
        # 输出总结
        print("=" * 60)
        print("验证总结")
        print("=" * 60)
        print(f"✅ 成功: {self.success_count}/{self.total_checks}")
        print(f"❌ 失败: {len(self.errors)}")
        print(f"⚠️  警告: {len(self.warnings)}")
        print()
        
        if self.errors:
            print("❌ 错误:")
            for error in self.errors:
                print(f"  - {error}")
            print()
        
        if self.warnings:
            print("⚠️  警告:")
            for warning in self.warnings:
                print(f"  - {warning}")
            print()
        
        if not self.errors:
            print("✅ 部署验证成功！所有检查都通过了。")
            print()
            print("📝 后续步骤:")
            print("  1. 访问 GitHub Pages URL 验证页面显示")
            print("  2. 检查页面交互功能是否正常")
            print("  3. 验证数据是否正确加载")
            print("  4. 测试响应式设计")
            print()
            return True
        else:
            print("❌ 部署验证失败！请修复上述错误。")
            print()
            return False


def main():
    """主函数"""
    verifier = DeploymentVerifier()
    success = verifier.verify_deployment()
    
    # 返回适当的退出码
    sys.exit(0 if success else 1)


if __name__ == "__main__":
    main()
