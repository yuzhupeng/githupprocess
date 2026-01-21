#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
GitHub Stars MD 文件翻译脚本
功能：提取 MD 文件中的英文描述，翻译为中文，生成中英文双语版本
"""

import re
import requests
import time
import sys
import os
from pathlib import Path

# 设置 UTF-8 编码
os.environ['PYTHONIOENCODING'] = 'utf-8'
if sys.platform == 'win32':
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')


class MDTranslator:
    """MD 文件翻译器"""
    
    DESC_MAX_LENGTH = 100
    TRANSLATION_CACHE = {}
    
    def __init__(self, input_file, output_file=None, proxy=None):
        self.input_file = input_file
        self.output_file = output_file or input_file.replace('.md', '_bilingual.md')
        self.content = ""
        self.translated_count = 0
        self.skipped_count = 0
        
        # 配置代理
        self.proxies = {}
        if proxy:
            self.proxies = {
                'http': f'http://{proxy}',
                'https': f'http://{proxy}'
            }
            print(f"✓ 已配置代理: {proxy}")
    
    def read_file(self):
        """读取 MD 文件"""
        try:
            with open(self.input_file, 'r', encoding='utf-8') as f:
                self.content = f.read()
            print(f"✓ 已读取文件: {self.input_file}")
            return True
        except Exception as e:
            print(f"✗ 读取文件失败: {e}")
            return False
    
    def truncate_text(self, text, max_length=None):
        """截取文本长度"""
        if max_length is None:
            max_length = self.DESC_MAX_LENGTH
        
        if not text or len(text) <= max_length:
            return text
        
        return text[:max_length].rstrip() + '...'
    
    def translate_text(self, text):
        """翻译文本 - 使用 MyMemory 翻译 API"""
        if not text or len(text.strip()) == 0:
            return text
        
        # 检查缓存
        if text in self.TRANSLATION_CACHE:
            return self.TRANSLATION_CACHE[text]
        
        try:
            # 使用 MyMemory 翻译 API (免费，无需 key)
            url = 'https://api.mymemory.translated.net/get'
            params = {
                'q': text,
                'langpair': 'en|zh-CN'
            }
            response = requests.get(url, params=params, timeout=5, proxies=self.proxies)
            
            if response.status_code == 200:
                data = response.json()
                if data.get('responseStatus') == 200:
                    translated = data['responseData']['translatedText']
                    # 避免缓存失败的翻译
                    if translated and translated != text:
                        self.TRANSLATION_CACHE[text] = translated
                        return translated
        except Exception as e:
            print(f"  ⚠️  翻译失败: {e}")
        
        return text
    
    def extract_descriptions(self):
        """提取所有描述"""
        # 匹配模式: - **[项目名](...)**  ⭐ 数字
        #           - 描述文本
        pattern = r'- \*\*\[([^\]]+)\]\(([^)]+)\)\*\* ⭐ (\d+)\n  - ([^\n]+)'
        
        matches = re.findall(pattern, self.content)
        print(f"✓ 找到 {len(matches)} 个项目描述")
        return matches
    
    def process_descriptions(self, limit=None):
        """处理所有描述，进行翻译"""
        print("\n开始翻译描述...")
        print("=" * 60)
        
        matches = self.extract_descriptions()
        
        # 如果指定了限制，只处理前 N 个
        if limit:
            matches = matches[:limit]
            print(f"✓ 限制处理前 {limit} 个项目\n")
        
        for i, (name, url, stars, desc) in enumerate(matches, 1):
            # 截取长度
            truncated = self.truncate_text(desc)
            
            # 翻译
            translated = self.translate_text(truncated)
            
            # 更新缓存
            self.TRANSLATION_CACHE[truncated] = translated
            
            # 显示进度
            if translated != truncated:
                self.translated_count += 1
                print(f"[{i}/{len(matches)}] {name}")
                print(f"  EN: {truncated}")
                print(f"  ZH: {translated}")
            else:
                self.skipped_count += 1
                print(f"[{i}/{len(matches)}] {name} (跳过)")
            
            # 避免 API 限制，每个请求间隔 0.3 秒
            if i < len(matches):
                time.sleep(0.3)
        
        print("=" * 60)
        print(f"✓ 翻译完成: {self.translated_count} 个成功, {self.skipped_count} 个跳过\n")
    
    def replace_descriptions(self):
        """替换 MD 文件中的描述为中英文版本"""
        def replace_func(match):
            name = match.group(1)
            url = match.group(2)
            stars = match.group(3)
            desc = match.group(4)
            
            # 截取长度
            truncated = self.truncate_text(desc)
            
            # 获取翻译
            translated = self.TRANSLATION_CACHE.get(truncated, truncated)
            
            # 生成新的描述行
            if translated != truncated:
                # 中英文双语
                new_desc = f"- **[{name}]({url})** ⭐ {stars}\n  - {translated}\n  > {truncated}"
            else:
                # 只有英文
                new_desc = f"- **[{name}]({url})** ⭐ {stars}\n  - {truncated}"
            
            return new_desc
        
        # 替换所有匹配项
        pattern = r'- \*\*\[([^\]]+)\]\(([^)]+)\)\*\* ⭐ (\d+)\n  - ([^\n]+)'
        self.content = re.sub(pattern, replace_func, self.content)
    
    def save_file(self):
        """保存翻译后的文件"""
        try:
            with open(self.output_file, 'w', encoding='utf-8') as f:
                f.write(self.content)
            print(f"✓ 已保存文件: {self.output_file}")
            return True
        except Exception as e:
            print(f"✗ 保存文件失败: {e}")
            return False
    
    def run(self):
        """执行完整的翻译流程"""
        print("\n" + "=" * 60)
        print("GitHub Stars MD 文件翻译工具")
        print("=" * 60 + "\n")
        
        # 读取文件
        if not self.read_file():
            return False
        
        # 处理描述 (限制前 100 个作为演示)
        self.process_descriptions(limit=100)
        
        # 替换描述
        print("正在替换描述...")
        self.replace_descriptions()
        
        # 保存文件
        if not self.save_file():
            return False
        
        print("\n✅ 翻译完成!")
        print(f"   输入文件: {self.input_file}")
        print(f"   输出文件: {self.output_file}")
        return True


def main():
    # 配置
    input_file = 'GitHub_Stars.md'
    output_file = 'GitHub_Stars_Bilingual.md'
    proxy = '127.0.0.1:7897'  # 代理地址
    
    # 检查文件是否存在
    if not Path(input_file).exists():
        print(f"✗ 文件不存在: {input_file}")
        return
    
    # 创建翻译器
    translator = MDTranslator(input_file, output_file, proxy=proxy)
    
    # 执行翻译
    translator.run()


if __name__ == '__main__':
    main()
