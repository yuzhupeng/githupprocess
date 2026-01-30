---
inclusion: always
---

# 始终 中文交流
# 最佳实践指南

## API 使用最佳实践

### 1. 速率限制管理
```python
# 检查速率限制
response = requests.get('https://api.github.com/rate_limit', headers=headers)
rate_limit = response.json()
print(f"剩余请求数: {rate_limit['resources']['core']['remaining']}")
print(f"重置时间: {rate_limit['resources']['core']['reset']}")
```

### 2. 请求超时设置
```python
# 总是设置超时
response = requests.get(url, headers=headers, params=params, timeout=10)
```

### 3. 错误处理
```python
try:
    response = requests.get(url, timeout=10)
    response.raise_for_status()  # 检查 HTTP 错误
    data = response.json()
except requests.exceptions.Timeout:
    print("请求超时")
except requests.exceptions.ConnectionError:
    print("连接错误")
except requests.exceptions.HTTPError as e:
    print(f"HTTP 错误: {e.response.status_code}")
except ValueError:
    print("JSON 解析错误")
```

## 数据处理最佳实践

### 1. 字符编码
```python
# 始终使用 UTF-8
with open(filename, 'w', encoding='utf-8') as f:
    f.write(content)

# JSON 输出
json.dump(data, f, ensure_ascii=False, indent=2)
```

### 2. 数据验证
```python
# 检查必需字段
def validate_repo(repo):
    required_fields = ['name', 'html_url', 'stargazers_count']
    return all(field in repo for field in required_fields)

# 使用前验证
repos = [r for r in repos if validate_repo(r)]
```

### 3. 数据清理
```python
# 处理空值
description = repo.get('description') or '暂无描述'

# 截取长度
def truncate(text, max_len=100):
    return text[:max_len].rstrip() + '...' if len(text) > max_len else text
```

## 性能最佳实践

### 1. 分页处理
```python
# 正确的分页逻辑
page = 1
all_items = []
while True:
    params = {'page': page, 'per_page': 100}
    response = requests.get(url, params=params)
    data = response.json()
    if not data:
        break
    all_items.extend(data)
    page += 1
```

### 2. 缓存策略
```python
# 简单的缓存实现
cache = {}

def get_with_cache(key, fetch_func):
    if key not in cache:
        cache[key] = fetch_func()
    return cache[key]
```

### 3. 内存优化
```python
# 处理大数据集时使用生成器
def process_large_dataset(items):
    for item in items:
        yield process_item(item)

# 使用
for processed in process_large_dataset(large_list):
    save_to_file(processed)
```

## 代码质量最佳实践

### 1. 类设计
```python
# 使用类组织相关功能
class GitHubOrganizer:
    def __init__(self, username, token=None):
        self.username = username
        self.token = token
        self.data = []
    
    def fetch(self):
        """获取数据"""
        pass
    
    def organize(self):
        """组织数据"""
        pass
    
    def export(self):
        """导出数据"""
        pass
```

### 2. 方法设计
```python
# 单一职责原则
def fetch_data(self):
    """只负责获取数据"""
    pass

def organize_by_language(self):
    """只负责按语言分类"""
    pass

def save_markdown(self):
    """只负责保存 Markdown"""
    pass
```

### 3. 错误处理
```python
# 具体的异常处理
try:
    data = response.json()
except ValueError as e:
    logger.error(f"JSON 解析失败: {e}")
    return None
except Exception as e:
    logger.error(f"未知错误: {e}")
    raise
```

### 4. 日志记录
```python
import logging

logger = logging.getLogger(__name__)

# 使用日志而不是 print
logger.info(f"正在获取 {username} 的数据...")
logger.warning("翻译功能不可用")
logger.error(f"获取数据失败: {error}")
```

## 文档最佳实践

### 1. 函数文档
```python
def categorize_by_topic(self, description):
    """根据描述分类到主题
    
    Args:
        description (str): 项目描述
    
    Returns:
        list: 主题列表
    
    Examples:
        >>> organizer.categorize_by_topic("Python machine learning library")
        ['AI/ML', '数据科学']
    """
    pass
```

### 2. 类文档
```python
class GitHubRepoOrganizer:
    """GitHub Repositories 整理工具
    
    用于获取、分类和导出 GitHub repositories 数据。
    
    Attributes:
        username (str): GitHub 用户名
        token (str): GitHub API token
        repos (list): 获取的 repositories 列表
    
    Example:
        >>> organizer = GitHubRepoOrganizer('octocat', token='...')
        >>> organizer.fetch_repos()
        >>> organizer.save_markdown()
    """
    pass
```

### 3. 模块文档
```python
"""GitHub Stars 整理脚本

功能：
- 获取用户的 GitHub stars
- 按语言和主题分类
- 生成 Markdown、JSON、CSV 报告

使用:
    python organize_github_stars.py
"""
```

## 安全最佳实践

### 1. Token 管理
```python
# ❌ 不要硬编码 token
TOKEN = "ghp_xxxxxxxxxxxx"

# ✅ 使用环境变量
import os
TOKEN = os.getenv('GITHUB_TOKEN')

# ✅ 从配置文件读取
import json
with open('.env.json') as f:
    config = json.load(f)
    TOKEN = config.get('github_token')
```

### 2. 敏感信息处理
```python
# 不要在日志中输出 token
logger.info(f"Token: {token}")  # ❌

# 使用掩码
masked_token = token[:10] + '*' * (len(token) - 10)
logger.info(f"Token: {masked_token}")  # ✅
```

### 3. 输入验证
```python
# 验证用户输入
def validate_username(username):
    if not username or len(username) > 39:
        raise ValueError("无效的用户名")
    if not re.match(r'^[a-zA-Z0-9-]+$', username):
        raise ValueError("用户名只能包含字母、数字和连字符")
    return username
```

## 测试最佳实践

### 1. 单元测试
```python
import unittest

class TestGitHubOrganizer(unittest.TestCase):
    def setUp(self):
        self.organizer = GitHubRepoOrganizer('test-user')
    
    def test_categorize_by_topic(self):
        topics = self.organizer.categorize_by_topic('Python machine learning')
        self.assertIn('AI/ML', topics)
    
    def test_truncate_description(self):
        long_text = 'a' * 200
        result = self.organizer.truncate_description(long_text)
        self.assertLessEqual(len(result), 103)  # 100 + '...'
```

### 2. 集成测试
```python
# 测试完整流程
def test_full_workflow():
    organizer = GitHubRepoOrganizer('octocat', token=TEST_TOKEN)
    repos = organizer.fetch_repos(limit=10)
    assert len(repos) > 0
    
    organizer.save_markdown('test_output.md')
    assert os.path.exists('test_output.md')
```

### 3. Mock 测试
```python
from unittest.mock import patch, MagicMock

@patch('requests.get')
def test_fetch_with_mock(mock_get):
    mock_response = MagicMock()
    mock_response.status_code = 200
    mock_response.json.return_value = [{'name': 'test-repo'}]
    mock_get.return_value = mock_response
    
    organizer = GitHubRepoOrganizer('test-user')
    repos = organizer.fetch_repos()
    assert len(repos) == 1
```

## 部署最佳实践

### 1. 依赖管理
```bash
# 生成 requirements.txt
pip freeze > requirements.txt

# 安装依赖
pip install -r requirements.txt
```

### 2. 配置管理
```python
# 使用配置文件
import configparser

config = configparser.ConfigParser()
config.read('config.ini')

username = config.get('github', 'username')
token = config.get('github', 'token')
```

### 3. 日志配置
```python
import logging.config

logging.config.dictConfig({
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'standard': {
            'format': '%(asctime)s [%(levelname)s] %(name)s: %(message)s'
        },
    },
    'handlers': {
        'default': {
            'level': 'INFO',
            'class': 'logging.StreamHandler',
            'formatter': 'standard',
        },
    },
    'root': {
        'level': 'INFO',
        'handlers': ['default'],
    }
})
```

## 常见陷阱避免

### 1. ❌ 不要忽视异常
```python
# 不好
try:
    data = response.json()
except:
    pass

# 好
try:
    data = response.json()
except ValueError as e:
    logger.error(f"JSON 解析失败: {e}")
    return None
```

### 2. ❌ 不要硬编码值
```python
# 不好
url = 'https://api.github.com/users/octocat/repos'

# 好
url = f'https://api.github.com/users/{username}/repos'
```

### 3. ❌ 不要忽视性能
```python
# 不好 - 多次循环
for repo in repos:
    for topic in topics:
        if topic in repo['description']:
            pass

# 好 - 单次循环
for repo in repos:
    desc_lower = repo['description'].lower()
    for topic in topics:
        if topic in desc_lower:
            pass
```

### 4. ❌ 不要忽视用户体验
```python
# 不好 - 无反馈
for i in range(1000):
    fetch_data(i)

# 好 - 提供进度反馈
for i in range(1000):
    fetch_data(i)
    if i % 100 == 0:
        print(f"已处理 {i}/1000...")
```
