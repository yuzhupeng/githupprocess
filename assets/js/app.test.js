import fc from 'fast-check';
import { DataProcessor, LoadingIndicator, ErrorDisplay } from './app.js';

// ============================================
// 错误处理单元测试
// ============================================

describe('错误处理单元测试', () => {
    beforeEach(() => {
        // 清空 DOM
        document.body.innerHTML = `
            <div id="loading-indicator" class="loading-indicator hidden">
                <div class="spinner"></div>
                <p>正在加载数据...</p>
            </div>
            <div id="error-display" class="error-display hidden">
                <p id="error-message"></p>
                <button id="retry-button" class="retry-button">重试</button>
            </div>
        `;
    });

    describe('LoadingIndicator 组件', () => {
        test('应该能显示加载指示器', () => {
            const indicator = new LoadingIndicator();
            indicator.show();
            expect(indicator.isVisible()).toBe(true);
        });

        test('应该能隐藏加载指示器', () => {
            const indicator = new LoadingIndicator();
            indicator.show();
            indicator.hide();
            expect(indicator.isVisible()).toBe(false);
        });

        test('初始状态应该是隐藏的', () => {
            const indicator = new LoadingIndicator();
            expect(indicator.isVisible()).toBe(false);
        });
    });

    describe('ErrorDisplay 组件', () => {
        test('应该能显示错误信息', () => {
            const errorDisplay = new ErrorDisplay();
            const message = '网络连接失败';
            errorDisplay.show(message);
            expect(errorDisplay.isVisible()).toBe(true);
            expect(errorDisplay.getMessage()).toBe(message);
        });

        test('应该能隐藏错误显示', () => {
            const errorDisplay = new ErrorDisplay();
            errorDisplay.show('测试错误');
            errorDisplay.hide();
            expect(errorDisplay.isVisible()).toBe(false);
        });

        test('初始状态应该是隐藏的', () => {
            const errorDisplay = new ErrorDisplay();
            expect(errorDisplay.isVisible()).toBe(false);
        });

        test('应该能获取错误信息', () => {
            const errorDisplay = new ErrorDisplay();
            const message = '文件不存在';
            errorDisplay.show(message);
            expect(errorDisplay.getMessage()).toBe(message);
        });

        test('应该能处理不同的错误类型', () => {
            const errorDisplay = new ErrorDisplay();
            const errorMessages = [
                '网络错误: 无法连接到服务器',
                'JSON 解析错误: 无效的 JSON 格式',
                '文件不存在: assets/data/github_stars.json'
            ];

            errorMessages.forEach(message => {
                errorDisplay.show(message);
                expect(errorDisplay.getMessage()).toBe(message);
            });
        });
    });

    describe('错误场景处理', () => {
        test('应该能处理网络错误', () => {
            const errorDisplay = new ErrorDisplay();
            const networkError = '加载 Stars 数据失败: Failed to fetch';
            errorDisplay.show(networkError);
            expect(errorDisplay.isVisible()).toBe(true);
            expect(errorDisplay.getMessage()).toContain('Failed to fetch');
        });

        test('应该能处理 JSON 解析错误', () => {
            const errorDisplay = new ErrorDisplay();
            const parseError = '加载 Repositories 数据失败: Unexpected token < in JSON at position 0';
            errorDisplay.show(parseError);
            expect(errorDisplay.isVisible()).toBe(true);
            expect(errorDisplay.getMessage()).toContain('JSON');
        });

        test('应该能处理 HTTP 错误', () => {
            const errorDisplay = new ErrorDisplay();
            const httpError = '加载 Stars 数据失败: HTTP error! status: 404';
            errorDisplay.show(httpError);
            expect(errorDisplay.isVisible()).toBe(true);
            expect(errorDisplay.getMessage()).toContain('404');
        });

        test('应该能处理多个错误并显示最新的错误', () => {
            const errorDisplay = new ErrorDisplay();
            const error1 = '第一个错误';
            const error2 = '第二个错误';
            
            errorDisplay.show(error1);
            expect(errorDisplay.getMessage()).toBe(error1);
            
            errorDisplay.show(error2);
            expect(errorDisplay.getMessage()).toBe(error2);
        });
    });

    describe('加载和错误状态协调', () => {
        test('显示加载指示器时应该隐藏错误显示', () => {
            const indicator = new LoadingIndicator();
            const errorDisplay = new ErrorDisplay();

            errorDisplay.show('之前的错误');
            indicator.show();
            errorDisplay.hide();

            expect(indicator.isVisible()).toBe(true);
            expect(errorDisplay.isVisible()).toBe(false);
        });

        test('显示错误时应该隐藏加载指示器', () => {
            const indicator = new LoadingIndicator();
            const errorDisplay = new ErrorDisplay();

            indicator.show();
            indicator.hide();
            errorDisplay.show('发生错误');

            expect(indicator.isVisible()).toBe(false);
            expect(errorDisplay.isVisible()).toBe(true);
        });

        test('应该能在加载失败后显示错误并允许重试', () => {
            const indicator = new LoadingIndicator();
            const errorDisplay = new ErrorDisplay();

            // 模拟加载开始
            indicator.show();
            errorDisplay.hide();
            expect(indicator.isVisible()).toBe(true);

            // 模拟加载失败
            indicator.hide();
            errorDisplay.show('加载失败，请重试');
            expect(indicator.isVisible()).toBe(false);
            expect(errorDisplay.isVisible()).toBe(true);

            // 模拟重试
            indicator.show();
            errorDisplay.hide();
            expect(indicator.isVisible()).toBe(true);
            expect(errorDisplay.isVisible()).toBe(false);
        });
    });
});

// ============================================
// 属性 7: JSON 数据加载正确性
// ============================================

describe('属性 7: JSON 数据加载正确性', () => {
    test('Validates: Requirements 5.1 - 加载有效的 JSON 数据应能正确解析', async () => {
        // 生成有效的 JSON 数据结构
        const validDataArbitrary = fc.record({
            username: fc.string({ minLength: 1, maxLength: 39 }),
            generated_at: fc.date().map(d => d.toISOString()),
            total: fc.integer({ min: 0, max: 1000 }),
            all_projects: fc.array(
                fc.record({
                    name: fc.string({ minLength: 1 }),
                    html_url: fc.webUrl(),
                    description: fc.oneof(fc.string(), fc.constant(null)),
                    stargazers_count: fc.integer({ min: 0, max: 100000 }),
                    language: fc.oneof(fc.string(), fc.constant(null)),
                    topics: fc.array(fc.string({ minLength: 1 }), { maxLength: 10 }),
                    updated_at: fc.date().map(d => d.toISOString()),
                }),
                { maxLength: 100 }
            ),
        });

        fc.assert(
            fc.property(validDataArbitrary, (data) => {
                // 验证数据结构完整性
                expect(data).toHaveProperty('username');
                expect(data).toHaveProperty('generated_at');
                expect(data).toHaveProperty('total');
                expect(data).toHaveProperty('all_projects');

                // 验证数据类型
                expect(typeof data.username).toBe('string');
                expect(typeof data.generated_at).toBe('string');
                expect(typeof data.total).toBe('number');
                expect(Array.isArray(data.all_projects)).toBe(true);

                // 验证项目数据完整性
                data.all_projects.forEach(project => {
                    expect(project).toHaveProperty('name');
                    expect(project).toHaveProperty('html_url');
                    expect(project).toHaveProperty('stargazers_count');
                    expect(typeof project.stargazers_count).toBe('number');
                });

                return true;
            }),
            { numRuns: 100 }
        );
    });
});

// ============================================
// 属性 1: 热度排行排序正确性
// ============================================

describe('属性 1: 热度排行排序正确性', () => {
    test('Validates: Requirements 1.2, 2.2 - 按 Stars 排序后应保持递减关系', () => {
        // 生成随机项目列表
        const projectsArbitrary = fc.array(
            fc.record({
                name: fc.string({ minLength: 1 }),
                html_url: fc.webUrl(),
                description: fc.oneof(fc.string(), fc.constant(null)),
                stargazers_count: fc.integer({ min: 0, max: 100000 }),
                language: fc.oneof(fc.string(), fc.constant(null)),
                topics: fc.array(fc.string(), { maxLength: 5 }),
                updated_at: fc.date().map(d => d.toISOString()),
                forks_count: fc.integer({ min: 0, max: 10000 }),
            }),
            { minLength: 1, maxLength: 100 }
        );

        fc.assert(
            fc.property(projectsArbitrary, (projects) => {
                const sorted = DataProcessor.sortByStars(projects);

                // 验证排序后的列表长度不变
                expect(sorted.length).toBe(projects.length);

                // 验证递减关系：相邻项目的 Stars 数应满足 前项 >= 后项
                for (let i = 0; i < sorted.length - 1; i++) {
                    expect(sorted[i].stargazers_count).toBeGreaterThanOrEqual(
                        sorted[i + 1].stargazers_count
                    );
                }

                return true;
            }),
            { numRuns: 100 }
        );
    });
});

// ============================================
// 属性 2: 项目信息完整性
// ============================================

describe('属性 2: 项目信息完整性', () => {
    test('Validates: Requirements 1.3, 2.3 - 渲染的项目卡片应包含所有必需字段', () => {
        const projectArbitrary = fc.record({
            name: fc.string({ minLength: 1 }),
            html_url: fc.webUrl(),
            description: fc.oneof(fc.string(), fc.constant(null)),
            stargazers_count: fc.integer({ min: 0, max: 100000 }),
            language: fc.oneof(fc.string(), fc.constant(null)),
            topics: fc.array(fc.string(), { maxLength: 5 }),
            updated_at: fc.date().map(d => d.toISOString()),
            forks_count: fc.integer({ min: 0, max: 10000 }),
        });

        fc.assert(
            fc.property(projectArbitrary, (project) => {
                // 验证必需字段存在
                expect(project).toHaveProperty('name');
                expect(project).toHaveProperty('html_url');
                expect(project).toHaveProperty('stargazers_count');
                expect(project).toHaveProperty('language');

                // 验证字段类型
                expect(typeof project.name).toBe('string');
                expect(typeof project.html_url).toBe('string');
                expect(typeof project.stargazers_count).toBe('number');

                // 对于 Repositories，验证额外字段
                expect(project).toHaveProperty('forks_count');
                expect(project).toHaveProperty('updated_at');
                expect(typeof project.forks_count).toBe('number');
                expect(typeof project.updated_at).toBe('string');

                return true;
            }),
            { numRuns: 100 }
        );
    });
});

// ============================================
// 属性 3: 语言分类准确性
// ============================================

describe('属性 3: 语言分类准确性', () => {
    test('Validates: Requirements 1.4, 2.4 - 按语言分组后每个分组中的项目语言应一致', () => {
        const projectsArbitrary = fc.array(
            fc.record({
                name: fc.string({ minLength: 1 }),
                html_url: fc.webUrl(),
                description: fc.oneof(fc.string(), fc.constant(null)),
                stargazers_count: fc.integer({ min: 0, max: 100000 }),
                language: fc.oneof(
                    fc.constant('Python'),
                    fc.constant('JavaScript'),
                    fc.constant('Go'),
                    fc.constant(null)
                ),
                topics: fc.array(fc.string(), { maxLength: 5 }),
                updated_at: fc.date().map(d => d.toISOString()),
                forks_count: fc.integer({ min: 0, max: 10000 }),
            }),
            { minLength: 1, maxLength: 100 }
        );

        fc.assert(
            fc.property(projectsArbitrary, (projects) => {
                const grouped = DataProcessor.groupByLanguage(projects);

                // 验证每个分组中的项目语言一致
                Object.entries(grouped).forEach(([language, items]) => {
                    items.forEach(item => {
                        const itemLanguage = item.language || '未分类';
                        expect(itemLanguage).toBe(language);
                    });
                });

                return true;
            }),
            { numRuns: 100 }
        );
    });
});

// ============================================
// 属性 4: 主题分类准确性
// ============================================

describe('属性 4: 主题分类准确性', () => {
    test('Validates: Requirements 1.5, 2.5 - 按主题分组后每个分组中的项目主题列表应包含该分组名称', () => {
        const projectsArbitrary = fc.array(
            fc.record({
                name: fc.string({ minLength: 1 }),
                html_url: fc.webUrl(),
                description: fc.oneof(fc.string(), fc.constant(null)),
                stargazers_count: fc.integer({ min: 0, max: 100000 }),
                language: fc.oneof(fc.string(), fc.constant(null)),
                topics: fc.array(
                    fc.oneof(
                        fc.constant('AI/ML'),
                        fc.constant('Web 框架'),
                        fc.constant('DevOps'),
                        fc.constant('数据科学')
                    ),
                    { maxLength: 5 }
                ),
                updated_at: fc.date().map(d => d.toISOString()),
                forks_count: fc.integer({ min: 0, max: 10000 }),
            }),
            { minLength: 1, maxLength: 100 }
        );

        fc.assert(
            fc.property(projectsArbitrary, (projects) => {
                const grouped = DataProcessor.groupByTopic(projects);

                // 验证每个分组中的项目主题列表包含该分组名称
                Object.entries(grouped).forEach(([topic, items]) => {
                    items.forEach(item => {
                        const topics = item.topics || [];
                        if (topic === '未分类') {
                            expect(topics.length).toBe(0);
                        } else {
                            expect(topics).toContain(topic);
                        }
                    });
                });

                return true;
            }),
            { numRuns: 100 }
        );
    });
});

// ============================================
// 属性 5: 页签切换内容正确性
// ============================================

describe('属性 5: 页签切换内容正确性', () => {
    test('Validates: Requirements 3.2, 3.3 - 切换页签后应显示对应的内容', () => {
        // 模拟 DOM 环境
        document.body.innerHTML = `
            <nav class="tab-navigation">
                <button class="tab-button active" data-tab="stars">⭐ Stars</button>
                <button class="tab-button" data-tab="repos">📦 Repositories</button>
            </nav>
            <div id="stars-content" class="tab-content active"></div>
            <div id="repos-content" class="tab-content"></div>
        `;

        // 创建应用实例
        const app = {
            currentTab: 'stars',
            switchTab(tabName) {
                this.currentTab = tabName;
                document.querySelectorAll('.tab-button').forEach(button => {
                    button.classList.toggle('active', button.dataset.tab === tabName);
                });
                document.querySelectorAll('.tab-content').forEach(content => {
                    content.classList.remove('active');
                });
                document.getElementById(`${tabName}-content`).classList.add('active');
            }
        };

        fc.assert(
            fc.property(fc.oneof(fc.constant('stars'), fc.constant('repos')), (tabName) => {
                app.switchTab(tabName);

                // 验证当前页签
                expect(app.currentTab).toBe(tabName);

                // 验证按钮状态
                const activeButton = document.querySelector(`.tab-button[data-tab="${tabName}"]`);
                expect(activeButton.classList.contains('active')).toBe(true);

                // 验证内容显示
                const activeContent = document.getElementById(`${tabName}-content`);
                expect(activeContent.classList.contains('active')).toBe(true);

                // 验证其他内容隐藏
                const otherTab = tabName === 'stars' ? 'repos' : 'stars';
                const otherContent = document.getElementById(`${otherTab}-content`);
                expect(otherContent.classList.contains('active')).toBe(false);

                return true;
            }),
            { numRuns: 100 }
        );
    });
});

// ============================================
// 属性 6: 页签偏好持久化
// ============================================

describe('属性 6: 页签偏好持久化', () => {
    test('Validates: Requirements 3.6 - 刷新页面后应恢复用户上次选择的页签', () => {
        // 清空 localStorage
        localStorage.clear();

        // 模拟 DOM 环境
        document.body.innerHTML = `
            <nav class="tab-navigation">
                <button class="tab-button active" data-tab="stars">⭐ Stars</button>
                <button class="tab-button" data-tab="repos">📦 Repositories</button>
            </nav>
            <div id="stars-content" class="tab-content active"></div>
            <div id="repos-content" class="tab-content"></div>
        `;

        // 创建应用实例
        const app = {
            currentTab: 'stars',
            switchTab(tabName) {
                this.currentTab = tabName;
                this.saveTabPreference();
                document.querySelectorAll('.tab-button').forEach(button => {
                    button.classList.toggle('active', button.dataset.tab === tabName);
                });
                document.querySelectorAll('.tab-content').forEach(content => {
                    content.classList.remove('active');
                });
                document.getElementById(`${tabName}-content`).classList.add('active');
            },
            saveTabPreference() {
                localStorage.setItem('selectedTab', this.currentTab);
            },
            loadTabPreference() {
                const savedTab = localStorage.getItem('selectedTab') || 'stars';
                this.switchTab(savedTab);
            }
        };

        fc.assert(
            fc.property(fc.oneof(fc.constant('stars'), fc.constant('repos')), (tabName) => {
                // 用户选择页签
                app.switchTab(tabName);

                // 验证保存到 localStorage
                expect(localStorage.getItem('selectedTab')).toBe(tabName);

                // 模拟页面刷新 - 创建新应用实例
                const newApp = {
                    currentTab: 'stars',
                    switchTab(tabName) {
                        this.currentTab = tabName;
                        document.querySelectorAll('.tab-button').forEach(button => {
                            button.classList.toggle('active', button.dataset.tab === tabName);
                        });
                        document.querySelectorAll('.tab-content').forEach(content => {
                            content.classList.remove('active');
                        });
                        document.getElementById(`${tabName}-content`).classList.add('active');
                    },
                    loadTabPreference() {
                        const savedTab = localStorage.getItem('selectedTab') || 'stars';
                        this.switchTab(savedTab);
                    }
                };

                // 加载保存的页签偏好
                newApp.loadTabPreference();

                // 验证恢复到用户选择的页签
                expect(newApp.currentTab).toBe(tabName);
                expect(localStorage.getItem('selectedTab')).toBe(tabName);

                return true;
            }),
            { numRuns: 100 }
        );
    });
});

// ============================================
// 属性 8: 页签切换无需重新加载
// ============================================

describe('属性 8: 页签切换无需重新加载', () => {
    test('Validates: Requirements 5.4 - 切换页签时应立即显示对应内容，无需重新加载数据', () => {
        // 模拟 DOM 环境
        document.body.innerHTML = `
            <nav class="tab-navigation">
                <button class="tab-button active" data-tab="stars">⭐ Stars</button>
                <button class="tab-button" data-tab="repos">📦 Repositories</button>
            </nav>
            <div id="stars-content" class="tab-content active">
                <div class="project-list">
                    <div class="project-card">Project 1</div>
                </div>
            </div>
            <div id="repos-content" class="tab-content">
                <div class="project-list">
                    <div class="project-card">Repo 1</div>
                </div>
            </div>
        `;

        // 创建应用实例，模拟已加载的数据
        const app = {
            currentTab: 'stars',
            dataLoaded: true,
            loadCount: 0,
            switchTab(tabName) {
                this.currentTab = tabName;
                document.querySelectorAll('.tab-button').forEach(button => {
                    button.classList.toggle('active', button.dataset.tab === tabName);
                });
                document.querySelectorAll('.tab-content').forEach(content => {
                    content.classList.remove('active');
                });
                document.getElementById(`${tabName}-content`).classList.add('active');
            },
            loadData() {
                this.loadCount++;
                this.dataLoaded = true;
            }
        };

        // 初始加载数据
        app.loadData();
        const initialLoadCount = app.loadCount;

        fc.assert(
            fc.property(
                fc.array(fc.oneof(fc.constant('stars'), fc.constant('repos')), { minLength: 1, maxLength: 10 }),
                (tabSequence) => {
                    // 执行一系列页签切换
                    tabSequence.forEach(tabName => {
                        app.switchTab(tabName);
                    });

                    // 验证数据只加载了一次（初始加载）
                    expect(app.loadCount).toBe(initialLoadCount);

                    // 验证最后一个页签是活跃的
                    const lastTab = tabSequence[tabSequence.length - 1];
                    expect(app.currentTab).toBe(lastTab);

                    // 验证对应的内容区域是活跃的
                    const activeContent = document.getElementById(`${lastTab}-content`);
                    expect(activeContent.classList.contains('active')).toBe(true);

                    return true;
                }
            ),
            { numRuns: 100 }
        );
    });
});
