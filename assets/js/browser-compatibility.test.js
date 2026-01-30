import { describe, it, expect, beforeEach } from 'vitest';
import { DataLoader, DataProcessor, GitHubDisplayApp } from './app.js';

// ============================================
// 浏览器兼容性测试
// ============================================

describe('浏览器兼容性测试', () => {
    let mockStarsData;
    let mockReposData;

    beforeEach(() => {
        // 模拟数据
        mockStarsData = {
            username: 'testuser',
            generated_at: new Date().toISOString(),
            total: 2,
            by_language: {
                'Python': { count: 1, percentage: 50 },
                'JavaScript': { count: 1, percentage: 50 }
            },
            by_topic: {
                'AI/ML': { count: 1, percentage: 50 },
                'Web': { count: 1, percentage: 50 }
            },
            all_projects: [
                {
                    name: 'project1',
                    html_url: 'https://github.com/user/project1',
                    description: 'Test project',
                    stargazers_count: 100,
                    language: 'Python',
                    topics: ['AI/ML'],
                    updated_at: new Date().toISOString()
                },
                {
                    name: 'project2',
                    html_url: 'https://github.com/user/project2',
                    description: 'Test project 2',
                    stargazers_count: 50,
                    language: 'JavaScript',
                    topics: ['Web'],
                    updated_at: new Date().toISOString()
                }
            ]
        };

        mockReposData = {
            username: 'testuser',
            generated_at: new Date().toISOString(),
            total: 1,
            average_stars: 100,
            average_forks: 10,
            by_language: {
                'Python': { count: 1, percentage: 100 }
            },
            by_topic: {
                'Web': { count: 1, percentage: 100 }
            },
            all_projects: [
                {
                    name: 'repo1',
                    html_url: 'https://github.com/user/repo1',
                    description: 'Test repo',
                    stargazers_count: 100,
                    forks_count: 10,
                    language: 'Python',
                    topics: ['Web'],
                    updated_at: new Date().toISOString(),
                    fork: false,
                    private: false
                }
            ]
        };

        // Mock fetch
        global.fetch = async (url) => {
            if (url.includes('github_stars.json')) {
                return {
                    ok: true,
                    json: async () => mockStarsData
                };
            } else if (url.includes('github_repos.json')) {
                return {
                    ok: true,
                    json: async () => mockReposData
                };
            }
            throw new Error('Not found');
        };
    });

    describe('ES6 特性兼容性', () => {
        it('应该支持 const 和 let 声明', () => {
            const testConst = 'test';
            let testLet = 'test';
            expect(testConst).toBe('test');
            expect(testLet).toBe('test');
        });

        it('应该支持箭头函数', () => {
            const add = (a, b) => a + b;
            expect(add(1, 2)).toBe(3);
        });

        it('应该支持模板字符串', () => {
            const name = 'World';
            const greeting = `Hello, ${name}!`;
            expect(greeting).toBe('Hello, World!');
        });

        it('应该支持 Set 数据结构', () => {
            const set = new Set([1, 2, 3, 2, 1]);
            expect(set.size).toBe(3);
        });

        it('应该支持 Object.entries()', () => {
            const obj = { a: 1, b: 2 };
            const entries = Object.entries(obj);
            expect(entries.length).toBe(2);
        });

        it('应该支持 Array.from()', () => {
            const set = new Set([1, 2, 3]);
            const array = Array.from(set);
            expect(array.length).toBe(3);
        });

        it('应该支持 Promise', async () => {
            const promise = Promise.resolve('test');
            const result = await promise;
            expect(result).toBe('test');
        });

        it('应该支持 async/await', async () => {
            const asyncFunc = async () => 'test';
            const result = await asyncFunc();
            expect(result).toBe('test');
        });

        it('应该支持 spread 操作符', () => {
            const arr1 = [1, 2];
            const arr2 = [...arr1, 3];
            expect(arr2).toEqual([1, 2, 3]);
        });

        it('应该支持解构赋值', () => {
            const [a, b] = [1, 2];
            expect(a).toBe(1);
            expect(b).toBe(2);
        });
    });

    describe('DOM API 兼容性', () => {
        beforeEach(() => {
            document.body.innerHTML = `
                <div id="test-container">
                    <button class="test-button">Click me</button>
                    <div class="test-div">Test</div>
                </div>
            `;
        });

        it('应该支持 querySelector', () => {
            const element = document.querySelector('.test-button');
            expect(element).toBeDefined();
            expect(element.textContent).toBe('Click me');
        });

        it('应该支持 querySelectorAll', () => {
            const elements = document.querySelectorAll('.test-div');
            expect(elements.length).toBeGreaterThan(0);
        });

        it('应该支持 classList API', () => {
            const element = document.querySelector('.test-button');
            element.classList.add('active');
            expect(element.classList.contains('active')).toBe(true);
            element.classList.remove('active');
            expect(element.classList.contains('active')).toBe(false);
        });

        it('应该支持 addEventListener', () => {
            const element = document.querySelector('.test-button');
            let clicked = false;
            element.addEventListener('click', () => {
                clicked = true;
            });
            element.click();
            expect(clicked).toBe(true);
        });

        it('应该支持 innerHTML', () => {
            const element = document.querySelector('.test-div');
            element.innerHTML = '<span>Updated</span>';
            expect(element.querySelector('span').textContent).toBe('Updated');
        });

        it('应该支持 dataset 属性', () => {
            const element = document.querySelector('.test-button');
            element.dataset.testAttr = 'test-value';
            expect(element.dataset.testAttr).toBe('test-value');
        });

        it('应该支持 createDocumentFragment', () => {
            const fragment = document.createDocumentFragment();
            const div = document.createElement('div');
            div.textContent = 'Test';
            fragment.appendChild(div);
            expect(fragment.childNodes.length).toBe(1);
        });

        it('应该支持 appendChild', () => {
            const container = document.getElementById('test-container');
            const newElement = document.createElement('div');
            newElement.textContent = 'New';
            container.appendChild(newElement);
            expect(container.querySelector('div:last-child').textContent).toBe('New');
        });

        it('应该支持 getAttribute 和 setAttribute', () => {
            const element = document.querySelector('.test-button');
            element.setAttribute('data-test', 'value');
            expect(element.getAttribute('data-test')).toBe('value');
        });

        it('应该支持 getElementById', () => {
            const element = document.getElementById('test-container');
            expect(element).toBeDefined();
        });
    });

    describe('CSS 兼容性', () => {
        beforeEach(() => {
            document.body.innerHTML = `
                <style>
                    .test-flex { display: flex; }
                    .test-grid { display: grid; }
                    .test-transform { transform: translateY(-2px); }
                    .test-transition { transition: all 0.3s ease; }
                </style>
                <div class="test-flex">Flex</div>
                <div class="test-grid">Grid</div>
                <div class="test-transform">Transform</div>
                <div class="test-transition">Transition</div>
            `;
        });

        it('应该支持 Flexbox', () => {
            const element = document.querySelector('.test-flex');
            const style = window.getComputedStyle(element);
            expect(style.display).toBe('flex');
        });

        it('应该支持 CSS Grid', () => {
            const element = document.querySelector('.test-grid');
            const style = window.getComputedStyle(element);
            expect(style.display).toBe('grid');
        });

        it('应该支持 CSS Transform', () => {
            const element = document.querySelector('.test-transform');
            const style = window.getComputedStyle(element);
            expect(style.transform).not.toBe('none');
        });

        it('应该支持 CSS Transition', () => {
            const element = document.querySelector('.test-transition');
            const style = window.getComputedStyle(element);
            expect(style.transition).toContain('all');
        });

        it('应该支持 CSS 变量', () => {
            const style = document.createElement('style');
            style.textContent = ':root { --test-color: red; }';
            document.head.appendChild(style);
            
            const div = document.createElement('div');
            div.style.color = 'var(--test-color)';
            document.body.appendChild(div);
            
            expect(div.style.color).toContain('var');
        });

        it('应该支持 CSS 媒体查询', () => {
            const style = document.createElement('style');
            style.textContent = '@media (max-width: 768px) { .test { color: red; } }';
            document.head.appendChild(style);
            expect(style.sheet.cssRules.length).toBeGreaterThan(0);
        });
    });

    describe('JSON 和数据处理兼容性', () => {
        it('应该支持 JSON.parse', () => {
            const json = '{"name":"test","value":123}';
            const obj = JSON.parse(json);
            expect(obj.name).toBe('test');
            expect(obj.value).toBe(123);
        });

        it('应该支持 JSON.stringify', () => {
            const obj = { name: 'test', value: 123 };
            const json = JSON.stringify(obj);
            expect(json).toContain('name');
            expect(json).toContain('test');
        });

        it('应该支持 Date 对象', () => {
            const date = new Date('2024-01-01');
            expect(date instanceof Date).toBe(true);
            expect(date.getFullYear()).toBe(2024);
        });

        it('应该支持 Math 对象', () => {
            expect(Math.round(3.7)).toBe(4);
            expect(Math.max(1, 2, 3)).toBe(3);
            expect(Math.min(1, 2, 3)).toBe(1);
        });

        it('应该支持 Number 方法', () => {
            expect(Number.isInteger(5)).toBe(true);
            expect(Number.isInteger(5.5)).toBe(false);
        });

        it('应该支持 String 方法', () => {
            const str = 'test string';
            expect(str.includes('test')).toBe(true);
            expect(str.startsWith('test')).toBe(true);
            expect(str.endsWith('string')).toBe(true);
        });

        it('应该支持 Array 方法', () => {
            const arr = [1, 2, 3, 4, 5];
            expect(arr.find(x => x > 3)).toBe(4);
            expect(arr.filter(x => x > 2).length).toBe(3);
            expect(arr.map(x => x * 2)).toEqual([2, 4, 6, 8, 10]);
        });
    });

    describe('localStorage 兼容性', () => {
        beforeEach(() => {
            localStorage.clear();
        });

        it('应该支持 localStorage.setItem', () => {
            localStorage.setItem('test', 'value');
            expect(localStorage.getItem('test')).toBe('value');
        });

        it('应该支持 localStorage.removeItem', () => {
            localStorage.setItem('test', 'value');
            localStorage.removeItem('test');
            expect(localStorage.getItem('test')).toBeNull();
        });

        it('应该支持 localStorage.clear', () => {
            localStorage.setItem('test1', 'value1');
            localStorage.setItem('test2', 'value2');
            localStorage.clear();
            expect(localStorage.length).toBe(0);
        });

        it('应该支持 localStorage.key', () => {
            localStorage.setItem('test', 'value');
            expect(localStorage.key(0)).toBe('test');
        });
    });

    describe('Fetch API 兼容性', () => {
        it('应该支持 fetch', async () => {
            const response = await fetch('assets/data/github_stars.json');
            expect(response.ok).toBe(true);
        });

        it('应该支持 response.json()', async () => {
            const response = await fetch('assets/data/github_stars.json');
            const data = await response.json();
            expect(data).toHaveProperty('username');
        });

        it('应该支持 Promise 链式调用', async () => {
            const data = await fetch('assets/data/github_stars.json')
                .then(response => response.json());
            expect(data).toHaveProperty('username');
        });

        it('应该支持 async/await 错误处理', async () => {
            try {
                await fetch('assets/data/nonexistent.json');
            } catch (error) {
                expect(error).toBeDefined();
            }
        });
    });

    describe('应用功能兼容性', () => {
        beforeEach(() => {
            document.body.innerHTML = `
                <div class="container">
                    <nav class="tab-navigation">
                        <button class="tab-button active" data-tab="stars">Stars</button>
                        <button class="tab-button" data-tab="repos">Repos</button>
                    </nav>
                    <div id="loading-indicator" class="loading-indicator hidden"></div>
                    <div id="error-display" class="error-display hidden">
                        <p id="error-message"></p>
                        <button id="retry-button">重试</button>
                    </div>
                    <div id="stars-content" class="tab-content active">
                        <div id="stars-statistics" class="statistics-container"></div>
                        <div id="stars-list" class="project-list"></div>
                        <div id="stars-by-language" class="category-statistics"></div>
                        <div id="stars-by-topic" class="category-statistics"></div>
                    </div>
                    <div id="repos-content" class="tab-content">
                        <div id="repos-statistics" class="statistics-container"></div>
                        <div id="repos-list" class="project-list"></div>
                        <div id="repos-by-language" class="category-statistics"></div>
                        <div id="repos-by-topic" class="category-statistics"></div>
                    </div>
                </div>
            `;
        });

        it('应该能够创建应用实例', async () => {
            const app = new GitHubDisplayApp();
            expect(app).toBeDefined();
            expect(app.dataLoader).toBeDefined();
            expect(app.loadingIndicator).toBeDefined();
            expect(app.errorDisplay).toBeDefined();
        });

        it('应该能够加载数据', async () => {
            const app = new GitHubDisplayApp();
            await new Promise(resolve => setTimeout(resolve, 100));
            expect(app.dataLoader.starsData).toBeDefined();
            expect(app.dataLoader.reposData).toBeDefined();
        });

        it('应该能够处理数据', () => {
            const projects = mockStarsData.all_projects;
            const sorted = DataProcessor.sortByStars(projects);
            expect(sorted.length).toBe(projects.length);
            expect(sorted[0].stargazers_count).toBeGreaterThanOrEqual(sorted[1].stargazers_count);
        });

        it('应该能够分组数据', () => {
            const projects = mockStarsData.all_projects;
            const grouped = DataProcessor.groupByLanguage(projects);
            expect(Object.keys(grouped).length).toBeGreaterThan(0);
        });

        it('应该能够计算统计数据', () => {
            const projects = mockStarsData.all_projects;
            const stats = DataProcessor.calculateStatistics(projects);
            expect(stats.total).toBe(projects.length);
            expect(stats.languages).toBeGreaterThan(0);
        });
    });
});
