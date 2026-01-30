// ============================================
// 加载指示器
// ============================================

class LoadingIndicator {
    constructor(elementId = 'loading-indicator') {
        this.element = document.getElementById(elementId);
    }

    show() {
        if (this.element) {
            this.element.classList.remove('hidden');
        }
    }

    hide() {
        if (this.element) {
            this.element.classList.add('hidden');
        }
    }

    isVisible() {
        return this.element && !this.element.classList.contains('hidden');
    }
}

// ============================================
// 错误显示
// ============================================

class ErrorDisplay {
    constructor(elementId = 'error-display', messageId = 'error-message') {
        this.element = document.getElementById(elementId);
        this.messageElement = document.getElementById(messageId);
    }

    show(message) {
        if (this.element && this.messageElement) {
            this.messageElement.textContent = message;
            this.element.classList.remove('hidden');
        }
    }

    hide() {
        if (this.element) {
            this.element.classList.add('hidden');
        }
    }

    isVisible() {
        return this.element && !this.element.classList.contains('hidden');
    }

    getMessage() {
        return this.messageElement ? this.messageElement.textContent : '';
    }
}

// ============================================
// 数据加载器
// ============================================

class DataLoader {
    constructor() {
        this.starsData = null;
        this.reposData = null;
    }

    async loadStars() {
        try {
            const response = await fetch('assets/data/github_stars.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            this.starsData = await response.json();
            return this.starsData;
        } catch (error) {
            throw new Error(`加载 Stars 数据失败: ${error.message}`);
        }
    }

    async loadRepos() {
        try {
            const response = await fetch('assets/data/github_repos.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            this.reposData = await response.json();
            return this.reposData;
        } catch (error) {
            throw new Error(`加载 Repositories 数据失败: ${error.message}`);
        }
    }

    async loadAll() {
        try {
            await Promise.all([this.loadStars(), this.loadRepos()]);
        } catch (error) {
            throw error;
        }
    }
}

// ============================================
// 数据处理器
// ============================================

class DataProcessor {
    static sortByStars(projects) {
        // 使用原地排序以减少内存分配
        return [...projects].sort((a, b) => b.stargazers_count - a.stargazers_count);
    }

    static groupByLanguage(projects) {
        const grouped = {};
        // 预分配对象以提高性能
        for (let i = 0; i < projects.length; i++) {
            const project = projects[i];
            const language = project.language || '未分类';
            if (!grouped[language]) {
                grouped[language] = [];
            }
            grouped[language].push(project);
        }
        return grouped;
    }

    static groupByTopic(projects) {
        const grouped = {};
        // 使用 for 循环而不是 forEach 以提高性能
        for (let i = 0; i < projects.length; i++) {
            const project = projects[i];
            const topics = project.topics || [];
            if (topics.length === 0) {
                if (!grouped['未分类']) {
                    grouped['未分类'] = [];
                }
                grouped['未分类'].push(project);
            } else {
                for (let j = 0; j < topics.length; j++) {
                    const topic = topics[j];
                    if (!grouped[topic]) {
                        grouped[topic] = [];
                    }
                    grouped[topic].push(project);
                }
            }
        }
        return grouped;
    }

    static calculateStatistics(projects) {
        const languages = new Set();
        const topics = new Set();
        let totalStars = 0;
        let totalForks = 0;

        // 单次遍历计算所有统计数据
        for (let i = 0; i < projects.length; i++) {
            const p = projects[i];
            if (p.language) {
                languages.add(p.language);
            }
            totalStars += p.stargazers_count || 0;
            totalForks += p.forks_count || 0;

            const projectTopics = p.topics || [];
            for (let j = 0; j < projectTopics.length; j++) {
                topics.add(projectTopics[j]);
            }
        }

        return {
            total: projects.length,
            languages: languages.size,
            topics: topics.size,
            averageStars: projects.length > 0 ? Math.round(totalStars / projects.length) : 0,
            averageForks: projects.length > 0 ? Math.round(totalForks / projects.length) : 0,
        };
    }
}

// ============================================
// UI 组件
// ============================================

class UIComponents {
    static createStatisticsCard(icon, value, label) {
        const card = document.createElement('div');
        card.className = 'statistics-card';
        card.innerHTML = `
            <div class="icon">${icon}</div>
            <div class="value">${value}</div>
            <div class="label">${label}</div>
        `;
        return card;
    }

    static createProjectCard(project, isRepos = false) {
        const card = document.createElement('div');
        card.className = 'project-card';

        const description = project.description || '暂无描述';
        const language = project.language || '未分类';
        const updatedAt = new Date(project.updated_at).toLocaleDateString('zh-CN');

        let metaHTML = `
            <div class="project-meta-item">
                <span class="label">⭐ Stars:</span>
                <span class="value">${project.stargazers_count}</span>
            </div>
            <div class="project-meta-item">
                <span class="label">📝 语言:</span>
                <span class="value">${language}</span>
            </div>
        `;

        if (isRepos) {
            metaHTML += `
                <div class="project-meta-item">
                    <span class="label">🔀 Forks:</span>
                    <span class="value">${project.forks_count}</span>
                </div>
                <div class="project-meta-item">
                    <span class="label">📅 更新:</span>
                    <span class="value">${updatedAt}</span>
                </div>
            `;
        }

        card.innerHTML = `
            <div class="project-name">
                <a href="${project.html_url}" target="_blank" rel="noopener noreferrer">
                    ${project.name}
                </a>
            </div>
            <div class="project-description">${description}</div>
            <div class="project-meta">
                ${metaHTML}
            </div>
        `;

        return card;
    }

    static createCategoryItem(name, count, percentage) {
        const item = document.createElement('div');
        item.className = 'category-item';
        item.innerHTML = `
            <div class="category-name">${name}</div>
            <div class="category-count">${count}</div>
            <div class="category-percentage">${percentage}%</div>
        `;
        return item;
    }

    // 批量渲染优化方法
    static renderBatch(container, items, createItemFn) {
        const fragment = document.createDocumentFragment();
        for (let i = 0; i < items.length; i++) {
            fragment.appendChild(createItemFn(items[i]));
        }
        container.innerHTML = '';
        container.appendChild(fragment);
    }
}

// ============================================
// 应用主类
// ============================================

class GitHubDisplayApp {
    constructor() {
        this.dataLoader = new DataLoader();
        this.loadingIndicator = new LoadingIndicator();
        this.errorDisplay = new ErrorDisplay();
        this.currentTab = 'stars';
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadData();
    }

    setupEventListeners() {
        // 页签切换
        document.querySelectorAll('.tab-button').forEach(button => {
            button.addEventListener('click', (e) => {
                this.switchTab(e.target.dataset.tab);
            });
        });

        // 重试按钮
        const retryButton = document.getElementById('retry-button');
        if (retryButton) {
            retryButton.addEventListener('click', () => this.loadData());
        }

        // 加载用户选择的页签
        this.loadTabPreference();
    }

    async loadData() {
        this.loadingIndicator.show();
        this.errorDisplay.hide();

        try {
            await this.dataLoader.loadAll();
            this.renderAllContent();
            this.loadingIndicator.hide();
        } catch (error) {
            this.errorDisplay.show(error.message);
            this.loadingIndicator.hide();
        }
    }

    renderAllContent() {
        this.renderStarsContent();
        this.renderReposContent();
    }

    renderStarsContent() {
        const data = this.dataLoader.starsData;
        if (!data) return;

        const projects = data.all_projects || [];
        const stats = DataProcessor.calculateStatistics(projects);

        // 渲染统计卡片
        const statsContainer = document.getElementById('stars-statistics');
        const statsFragment = document.createDocumentFragment();
        statsFragment.appendChild(UIComponents.createStatisticsCard('📊', stats.total, '总数'));
        statsFragment.appendChild(UIComponents.createStatisticsCard('📝', stats.languages, '编程语言'));
        statsFragment.appendChild(UIComponents.createStatisticsCard('🏷️', stats.topics, '主题'));
        statsContainer.innerHTML = '';
        statsContainer.appendChild(statsFragment);

        // 渲染热度排行
        const sortedProjects = DataProcessor.sortByStars(projects);
        const listContainer = document.getElementById('stars-list');
        const listFragment = document.createDocumentFragment();
        for (let i = 0; i < sortedProjects.length; i++) {
            listFragment.appendChild(UIComponents.createProjectCard(sortedProjects[i], false));
        }
        listContainer.innerHTML = '';
        listContainer.appendChild(listFragment);

        // 渲染语言分类
        const byLanguage = DataProcessor.groupByLanguage(projects);
        const languageContainer = document.getElementById('stars-by-language');
        const languageFragment = document.createDocumentFragment();
        const languageEntries = Object.entries(byLanguage).sort((a, b) => b[1].length - a[1].length);
        for (let i = 0; i < languageEntries.length; i++) {
            const [language, items] = languageEntries[i];
            const percentage = Math.round((items.length / projects.length) * 100);
            languageFragment.appendChild(
                UIComponents.createCategoryItem(language, items.length, percentage)
            );
        }
        languageContainer.innerHTML = '';
        languageContainer.appendChild(languageFragment);

        // 渲染主题分类
        const byTopic = DataProcessor.groupByTopic(projects);
        const topicContainer = document.getElementById('stars-by-topic');
        const topicFragment = document.createDocumentFragment();
        const topicEntries = Object.entries(byTopic).sort((a, b) => b[1].length - a[1].length);
        for (let i = 0; i < topicEntries.length; i++) {
            const [topic, items] = topicEntries[i];
            const percentage = Math.round((items.length / projects.length) * 100);
            topicFragment.appendChild(
                UIComponents.createCategoryItem(topic, items.length, percentage)
            );
        }
        topicContainer.innerHTML = '';
        topicContainer.appendChild(topicFragment);
    }

    renderReposContent() {
        const data = this.dataLoader.reposData;
        if (!data) return;

        const projects = data.all_projects || [];
        const stats = DataProcessor.calculateStatistics(projects);

        // 渲染统计卡片
        const statsContainer = document.getElementById('repos-statistics');
        const statsFragment = document.createDocumentFragment();
        statsFragment.appendChild(UIComponents.createStatisticsCard('📊', stats.total, '总数'));
        statsFragment.appendChild(UIComponents.createStatisticsCard('📝', stats.languages, '编程语言'));
        statsFragment.appendChild(UIComponents.createStatisticsCard('🏷️', stats.topics, '主题'));
        statsFragment.appendChild(UIComponents.createStatisticsCard('⭐', stats.averageStars, '平均 Stars'));
        statsFragment.appendChild(UIComponents.createStatisticsCard('🔀', stats.averageForks, '平均 Forks'));
        statsContainer.innerHTML = '';
        statsContainer.appendChild(statsFragment);

        // 渲染热度排行
        const sortedProjects = DataProcessor.sortByStars(projects);
        const listContainer = document.getElementById('repos-list');
        const listFragment = document.createDocumentFragment();
        for (let i = 0; i < sortedProjects.length; i++) {
            listFragment.appendChild(UIComponents.createProjectCard(sortedProjects[i], true));
        }
        listContainer.innerHTML = '';
        listContainer.appendChild(listFragment);

        // 渲染语言分类
        const byLanguage = DataProcessor.groupByLanguage(projects);
        const languageContainer = document.getElementById('repos-by-language');
        const languageFragment = document.createDocumentFragment();
        const languageEntries = Object.entries(byLanguage).sort((a, b) => b[1].length - a[1].length);
        for (let i = 0; i < languageEntries.length; i++) {
            const [language, items] = languageEntries[i];
            const percentage = Math.round((items.length / projects.length) * 100);
            languageFragment.appendChild(
                UIComponents.createCategoryItem(language, items.length, percentage)
            );
        }
        languageContainer.innerHTML = '';
        languageContainer.appendChild(languageFragment);

        // 渲染主题分类
        const byTopic = DataProcessor.groupByTopic(projects);
        const topicContainer = document.getElementById('repos-by-topic');
        const topicFragment = document.createDocumentFragment();
        const topicEntries = Object.entries(byTopic).sort((a, b) => b[1].length - a[1].length);
        for (let i = 0; i < topicEntries.length; i++) {
            const [topic, items] = topicEntries[i];
            const percentage = Math.round((items.length / projects.length) * 100);
            topicFragment.appendChild(
                UIComponents.createCategoryItem(topic, items.length, percentage)
            );
        }
        topicContainer.innerHTML = '';
        topicContainer.appendChild(topicFragment);
    }

    switchTab(tabName) {
        this.currentTab = tabName;
        this.saveTabPreference();

        // 更新按钮状态
        document.querySelectorAll('.tab-button').forEach(button => {
            button.classList.toggle('active', button.dataset.tab === tabName);
        });

        // 更新内容显示
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(`${tabName}-content`).classList.add('active');
    }

    saveTabPreference() {
        localStorage.setItem('selectedTab', this.currentTab);
    }

    loadTabPreference() {
        const savedTab = localStorage.getItem('selectedTab') || 'stars';
        this.switchTab(savedTab);
    }
}

// ============================================
// 导出类供测试使用
// ============================================

export { DataLoader, DataProcessor, UIComponents, GitHubDisplayApp, LoadingIndicator, ErrorDisplay };

// ============================================
// 应用初始化
// ============================================

if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
        new GitHubDisplayApp();
    });
}
