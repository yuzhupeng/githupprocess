import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { DataLoader, DataProcessor, GitHubDisplayApp, LoadingIndicator, ErrorDisplay } from './app.js';

// ============================================
// 完整工作流集成测试
// ============================================

describe('完整工作流集成测试', () => {
    let app;
    let mockStarsData;
    let mockReposData;

    beforeEach(() => {
        // 清空 DOM
        document.body.innerHTML = `
            <div class="container">
                <nav class="tab-navigation">
                    <button class="tab-button active" data-tab="stars">⭐ Stars</button>
                    <button class="tab-button" data-tab="repos">📦 Repositories</button>
                </nav>

                <div id="loading-indicator" class="loading-indicator hidden">
                    <div class="spinner"></div>
                    <p>正在加载数据...</p>
                </div>

                <div id="error-display" class="error-display hidden">
                    <p id="error-message"></p>
                    <button id="retry-button" class="retry-button">重试</button>
                </div>

                <div id="stars-content" class="tab-content active">
                    <div id="stars-statistics" class="statistics-container"></div>
                    <section class="section">
                        <h2>🔥 热度排行</h2>
                        <div id="stars-list" class="project-list"></div>
                    </section>
                    <section class="section">
                        <h2>📚 按编程语言分类</h2>
                        <div id="stars-by-language" class="category-statistics"></div>
                    </section>
                    <section class="section">
                        <h2>🏷️ 按主题分类</h2>
                        <div id="stars-by-topic" class="category-statistics"></div>
                    </section>
                </div>

                <div id="repos-content" class="tab-content">
                    <div id="repos-statistics" class="statistics-container"></div>
                    <section class="section">
                        <h2>🔥 热度排行</h2>
                        <div id="repos-list" class="project-list"></div>
                    </section>
                    <section class="section">
                        <h2>📚 按编程语言分类</h2>
                        <div id="repos-by-language" class="category-statistics"></div>
                    </section>
                    <section class="section">
                        <h2>🏷️ 按主题分类</h2>
                        <div id="repos-by-topic" class="category-statistics"></div>
                    </section>
                </div>
            </div>
        `;

        // 清空 localStorage
        localStorage.clear();

        // 模拟数据
        mockStarsData = {
            username: 'testuser',
            generated_at: new Date().toISOString(),
            total: 3,
            by_language: {
                'Python': { count: 2, percentage: 66 },
                'JavaScript': { count: 1, percentage: 34 }
            },
            by_topic: {
                'AI/ML': { count: 1, percentage: 33 },
                'Web': { count: 2, percentage: 67 }
            },
            all_projects: [
                {
                    name: 'project1',
                    html_url: 'https://github.com/user/project1',
                    description: 'Test project 1',
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
                },
                {
                    name: 'project3',
                    html_url: 'https://github.com/user/project3',
                    description: 'Test project 3',
                    stargazers_count: 75,
                    language: 'Python',
                    topics: ['Web'],
                    updated_at: new Date().toISOString()
                }
            ]
        };

        mockReposData = {
            username: 'testuser',
            generated_at: new Date().toISOString(),
            total: 2,
            average_stars: 75,
            average_forks: 10,
            by_language: {
                'Python': { count: 1, percentage: 50 },
                'JavaScript': { count: 1, percentage: 50 }
            },
            by_topic: {
                'Web': { count: 2, percentage: 100 }
            },
            all_projects: [
                {
                    name: 'repo1',
                    html_url: 'https://github.com/user/repo1',
                    description: 'Test repo 1',
                    stargazers_count: 100,
                    forks_count: 15,
                    language: 'Python',
                    topics: ['Web'],
                    updated_at: new Date().toISOString(),
                    fork: false,
                    private: false
                },
                {
                    name: 'repo2',
                    html_url: 'https://github.com/user/repo2',
                    description: 'Test repo 2',
                    stargazers_count: 50,
                    forks_count: 5,
                    language: 'JavaScript',
                    topics: ['Web'],
                    updated_at: new Date().toISOString(),
                    fork: false,
                    private: false
                }
            ]
        };

        // Mock fetch
        global.fetch = vi.fn((url) => {
            if (url.includes('github_stars.json')) {
                return Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve(mockStarsData)
                });
            } else if (url.includes('github_repos.json')) {
                return Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve(mockReposData)
                });
            }
            return Promise.reject(new Error('Not found'));
        });
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    describe('从数据加载到页面渲染的完整流程', () => {
        it('应该成功加载数据并渲染页面', async () => {
            app = new GitHubDisplayApp();
            
            // 等待数据加载完成
            await new Promise(resolve => setTimeout(resolve, 100));

            // 验证加载指示器已隐藏
            expect(app.loadingIndicator.isVisible()).toBe(false);

            // 验证错误显示已隐藏
            expect(app.errorDisplay.isVisible()).toBe(false);

            // 验证数据已加载
            expect(app.dataLoader.starsData).toBeDefined();
            expect(app.dataLoader.reposData).toBeDefined();

            // 验证 Stars 统计卡片已渲染
            const statsCards = document.querySelectorAll('#stars-statistics .statistics-card');
            expect(statsCards.length).toBeGreaterThan(0);

            // 验证 Stars 项目列表已渲染
            const starsList = document.querySelectorAll('#stars-list .project-card');
            expect(starsList.length).toBe(3);

            // 验证 Repositories 统计卡片已渲染
            const reposStatsCards = document.querySelectorAll('#repos-statistics .statistics-card');
            expect(reposStatsCards.length).toBeGreaterThan(0);

            // 验证 Repositories 项目列表已渲染
            const reposList = document.querySelectorAll('#repos-list .project-card');
            expect(reposList.length).toBe(2);
        });

        it('应该在加载过程中显示加载指示器', async () => {
            // 创建延迟的 fetch
            global.fetch = vi.fn(() => new Promise(resolve => {
                setTimeout(() => {
                    resolve({
                        ok: true,
                        json: () => Promise.resolve(mockStarsData)
                    });
                }, 50);
            }));

            app = new GitHubDisplayApp();

            // 立即检查加载指示器
            expect(app.loadingIndicator.isVisible()).toBe(true);

            // 等待加载完成
            await new Promise(resolve => setTimeout(resolve, 150));

            // 验证加载指示器已隐藏
            expect(app.loadingIndicator.isVisible()).toBe(false);
        });

        it('应该正确渲染 Stars 页面内容', async () => {
            app = new GitHubDisplayApp();
            await new Promise(resolve => setTimeout(resolve, 100));

            // 验证 Stars 内容区域是活跃的
            const starsContent = document.getElementById('stars-content');
            expect(starsContent.classList.contains('active')).toBe(true);

            // 验证统计数据
            const statsCards = document.querySelectorAll('#stars-statistics .statistics-card');
            expect(statsCards.length).toBeGreaterThan(0);

            // 验证项目列表
            const projectCards = document.querySelectorAll('#stars-list .project-card');
            expect(projectCards.length).toBe(3);

            // 验证第一个项目是 Stars 最多的
            const firstProject = projectCards[0];
            expect(firstProject.textContent).toContain('project1');
        });

        it('应该正确渲染 Repositories 页面内容', async () => {
            app = new GitHubDisplayApp();
            await new Promise(resolve => setTimeout(resolve, 100));

            // 切换到 Repositories 页签
            app.switchTab('repos');

            // 验证 Repositories 内容区域是活跃的
            const reposContent = document.getElementById('repos-content');
            expect(reposContent.classList.contains('active')).toBe(true);

            // 验证统计数据
            const statsCards = document.querySelectorAll('#repos-statistics .statistics-card');
            expect(statsCards.length).toBeGreaterThan(0);

            // 验证项目列表
            const projectCards = document.querySelectorAll('#repos-list .project-card');
            expect(projectCards.length).toBe(2);
        });

        it('应该正确渲染语言分类', async () => {
            app = new GitHubDisplayApp();
            await new Promise(resolve => setTimeout(resolve, 100));

            // 验证 Stars 语言分类
            const languageItems = document.querySelectorAll('#stars-by-language .category-item');
            expect(languageItems.length).toBe(2);

            // 验证分类内容
            const categoryNames = Array.from(languageItems).map(item => 
                item.querySelector('.category-name').textContent
            );
            expect(categoryNames).toContain('Python');
            expect(categoryNames).toContain('JavaScript');
        });

        it('应该正确渲染主题分类', async () => {
            app = new GitHubDisplayApp();
            await new Promise(resolve => setTimeout(resolve, 100));

            // 验证 Stars 主题分类
            const topicItems = document.querySelectorAll('#stars-by-topic .category-item');
            expect(topicItems.length).toBe(2);

            // 验证分类内容
            const categoryNames = Array.from(topicItems).map(item => 
                item.querySelector('.category-name').textContent
            );
            expect(categoryNames).toContain('AI/ML');
            expect(categoryNames).toContain('Web');
        });
    });

    describe('页签切换功能', () => {
        it('应该能从 Stars 切换到 Repositories', async () => {
            app = new GitHubDisplayApp();
            await new Promise(resolve => setTimeout(resolve, 100));

            // 验证初始状态是 Stars
            expect(app.currentTab).toBe('stars');
            expect(document.getElementById('stars-content').classList.contains('active')).toBe(true);
            expect(document.getElementById('repos-content').classList.contains('active')).toBe(false);

            // 切换到 Repositories
            app.switchTab('repos');

            // 验证切换后的状态
            expect(app.currentTab).toBe('repos');
            expect(document.getElementById('stars-content').classList.contains('active')).toBe(false);
            expect(document.getElementById('repos-content').classList.contains('active')).toBe(true);
        });

        it('应该能从 Repositories 切换回 Stars', async () => {
            app = new GitHubDisplayApp();
            await new Promise(resolve => setTimeout(resolve, 100));

            // 先切换到 Repositories
            app.switchTab('repos');
            expect(app.currentTab).toBe('repos');

            // 切换回 Stars
            app.switchTab('stars');

            // 验证切换后的状态
            expect(app.currentTab).toBe('stars');
            expect(document.getElementById('stars-content').classList.contains('active')).toBe(true);
            expect(document.getElementById('repos-content').classList.contains('active')).toBe(false);
        });

        it('应该更新页签按钮的活跃状态', async () => {
            app = new GitHubDisplayApp();
            await new Promise(resolve => setTimeout(resolve, 100));

            const starsButton = document.querySelector('[data-tab="stars"]');
            const reposButton = document.querySelector('[data-tab="repos"]');

            // 验证初始状态
            expect(starsButton.classList.contains('active')).toBe(true);
            expect(reposButton.classList.contains('active')).toBe(false);

            // 切换到 Repositories
            app.switchTab('repos');

            // 验证按钮状态已更新
            expect(starsButton.classList.contains('active')).toBe(false);
            expect(reposButton.classList.contains('active')).toBe(true);
        });

        it('应该能通过点击页签按钮切换', async () => {
            app = new GitHubDisplayApp();
            await new Promise(resolve => setTimeout(resolve, 100));

            const reposButton = document.querySelector('[data-tab="repos"]');

            // 模拟点击
            reposButton.click();

            // 验证切换
            expect(app.currentTab).toBe('repos');
            expect(document.getElementById('repos-content').classList.contains('active')).toBe(true);
        });

        it('切换页签时不应该重新加载数据', async () => {
            app = new GitHubDisplayApp();
            await new Promise(resolve => setTimeout(resolve, 100));

            const initialFetchCount = global.fetch.mock.calls.length;

            // 切换页签多次
            app.switchTab('repos');
            app.switchTab('stars');
            app.switchTab('repos');

            // 验证 fetch 调用次数没有增加
            expect(global.fetch.mock.calls.length).toBe(initialFetchCount);
        });

        it('应该保存页签偏好到 localStorage', async () => {
            app = new GitHubDisplayApp();
            await new Promise(resolve => setTimeout(resolve, 100));

            // 切换到 Repositories
            app.switchTab('repos');

            // 验证 localStorage 中的值
            expect(localStorage.getItem('selectedTab')).toBe('repos');

            // 切换回 Stars
            app.switchTab('stars');

            // 验证 localStorage 中的值已更新
            expect(localStorage.getItem('selectedTab')).toBe('stars');
        });

        it('应该在页面加载时恢复保存的页签偏好', async () => {
            // 设置保存的页签偏好
            localStorage.setItem('selectedTab', 'repos');

            // 创建新应用实例
            app = new GitHubDisplayApp();
            await new Promise(resolve => setTimeout(resolve, 100));

            // 验证应用恢复了保存的页签
            expect(app.currentTab).toBe('repos');
            expect(document.getElementById('repos-content').classList.contains('active')).toBe(true);
        });

        it('应该在没有保存的页签偏好时默认显示 Stars', async () => {
            // 确保 localStorage 中没有保存的页签
            localStorage.removeItem('selectedTab');

            // 创建新应用实例
            app = new GitHubDisplayApp();
            await new Promise(resolve => setTimeout(resolve, 100));

            // 验证默认显示 Stars
            expect(app.currentTab).toBe('stars');
            expect(document.getElementById('stars-content').classList.contains('active')).toBe(true);
        });
    });

    describe('错误恢复', () => {
        it('应该在数据加载失败时显示错误信息', async () => {
            // Mock fetch 返回错误
            global.fetch = vi.fn(() => 
                Promise.reject(new Error('网络连接失败'))
            );

            app = new GitHubDisplayApp();
            await new Promise(resolve => setTimeout(resolve, 100));

            // 验证错误显示是可见的
            expect(app.errorDisplay.isVisible()).toBe(true);

            // 验证错误信息包含预期的文本
            const errorMessage = app.errorDisplay.getMessage();
            expect(errorMessage).toContain('失败');
        });

        it('应该在加载失败后隐藏加载指示器', async () => {
            // Mock fetch 返回错误
            global.fetch = vi.fn(() => 
                Promise.reject(new Error('网络连接失败'))
            );

            app = new GitHubDisplayApp();
            await new Promise(resolve => setTimeout(resolve, 100));

            // 验证加载指示器已隐藏
            expect(app.loadingIndicator.isVisible()).toBe(false);
        });

        it('应该能通过重试按钮重新加载数据', async () => {
            let callCount = 0;

            // Mock fetch 第一次失败，第二次成功
            global.fetch = vi.fn(() => {
                callCount++;
                if (callCount === 1) {
                    return Promise.reject(new Error('网络连接失败'));
                }
                return Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve(mockStarsData)
                });
            });

            app = new GitHubDisplayApp();
            await new Promise(resolve => setTimeout(resolve, 100));

            // 验证错误显示
            expect(app.errorDisplay.isVisible()).toBe(true);

            // 点击重试按钮
            const retryButton = document.getElementById('retry-button');
            retryButton.click();

            // 等待重试完成
            await new Promise(resolve => setTimeout(resolve, 100));

            // 验证错误已清除
            expect(app.errorDisplay.isVisible()).toBe(false);

            // 验证数据已加载
            expect(app.dataLoader.starsData).toBeDefined();
        });

        it('应该在 HTTP 错误时显示相应的错误信息', async () => {
            // Mock fetch 返回 404 错误
            global.fetch = vi.fn(() => 
                Promise.resolve({
                    ok: false,
                    status: 404
                })
            );

            app = new GitHubDisplayApp();
            await new Promise(resolve => setTimeout(resolve, 100));

            // 验证错误显示
            expect(app.errorDisplay.isVisible()).toBe(true);

            // 验证错误信息包含 404
            const errorMessage = app.errorDisplay.getMessage();
            expect(errorMessage).toContain('404');
        });

        it('应该在 JSON 解析错误时显示相应的错误信息', async () => {
            // Mock fetch 返回无效的 JSON
            global.fetch = vi.fn(() => 
                Promise.resolve({
                    ok: true,
                    json: () => Promise.reject(new Error('Unexpected token < in JSON'))
                })
            );

            app = new GitHubDisplayApp();
            await new Promise(resolve => setTimeout(resolve, 100));

            // 验证错误显示
            expect(app.errorDisplay.isVisible()).toBe(true);

            // 验证错误信息包含 JSON 相关的文本
            const errorMessage = app.errorDisplay.getMessage();
            expect(errorMessage).toContain('JSON');
        });

        it('应该在加载失败后仍然能够切换页签', async () => {
            // Mock fetch 返回错误
            global.fetch = vi.fn(() => 
                Promise.reject(new Error('网络连接失败'))
            );

            app = new GitHubDisplayApp();
            await new Promise(resolve => setTimeout(resolve, 100));

            // 验证错误显示
            expect(app.errorDisplay.isVisible()).toBe(true);

            // 尝试切换页签
            app.switchTab('repos');

            // 验证页签已切换（即使没有数据）
            expect(app.currentTab).toBe('repos');
            expect(document.getElementById('repos-content').classList.contains('active')).toBe(true);
        });

        it('应该在重试成功后清除错误信息', async () => {
            let callCount = 0;

            // Mock fetch 第一次失败，第二次成功
            global.fetch = vi.fn(() => {
                callCount++;
                if (callCount === 1) {
                    return Promise.reject(new Error('网络连接失败'));
                }
                return Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve(mockStarsData)
                });
            });

            app = new GitHubDisplayApp();
            await new Promise(resolve => setTimeout(resolve, 100));

            // 验证错误显示
            expect(app.errorDisplay.isVisible()).toBe(true);

            // 点击重试按钮
            const retryButton = document.getElementById('retry-button');
            retryButton.click();

            // 等待重试完成
            await new Promise(resolve => setTimeout(resolve, 100));

            // 验证错误已清除
            expect(app.errorDisplay.isVisible()).toBe(false);

            // 验证数据已加载
            expect(app.dataLoader.starsData).toBeDefined();
        });

        it('应该在多次失败后仍然能够重试', async () => {
            let callCount = 0;

            // Mock fetch 前两次失败，第三次成功
            global.fetch = vi.fn(() => {
                callCount++;
                if (callCount <= 2) {
                    return Promise.reject(new Error('网络连接失败'));
                }
                return Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve(mockStarsData)
                });
            });

            app = new GitHubDisplayApp();
            await new Promise(resolve => setTimeout(resolve, 100));

            // 验证初始错误显示
            expect(app.errorDisplay.isVisible()).toBe(true);

            // 第一次重试
            let retryButton = document.getElementById('retry-button');
            retryButton.click();
            await new Promise(resolve => setTimeout(resolve, 100));

            // 第二次重试
            retryButton = document.getElementById('retry-button');
            retryButton.click();
            await new Promise(resolve => setTimeout(resolve, 100));

            // 验证错误已清除
            expect(app.errorDisplay.isVisible()).toBe(false);

            // 验证数据已加载
            expect(app.dataLoader.starsData).toBeDefined();
        });
    });
});
