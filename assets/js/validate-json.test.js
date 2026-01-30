import JSONValidator from './validate-json.js';
import fs from 'fs';
import path from 'path';

/**
 * 测试 JSON 数据文件验证
 */

describe('JSON 数据文件验证', () => {
    let starsData;
    let reposData;

    beforeAll(() => {
        // 读取实际的 JSON 文件
        const starsPath = path.join(process.cwd(), 'assets/data/github_stars.json');
        const reposPath = path.join(process.cwd(), 'assets/data/github_repos.json');

        starsData = JSON.parse(fs.readFileSync(starsPath, 'utf-8'));
        reposData = JSON.parse(fs.readFileSync(reposPath, 'utf-8'));
    });

    describe('Stars 数据文件验证', () => {
        test('github_stars.json 应该是有效的 JSON 格式', () => {
            expect(starsData).toBeDefined();
            expect(typeof starsData).toBe('object');
        });

        test('github_stars.json 应该包含所有必需的顶级字段', () => {
            expect(starsData).toHaveProperty('username');
            expect(starsData).toHaveProperty('generated_at');
            expect(starsData).toHaveProperty('total');
            expect(starsData).toHaveProperty('by_language');
            expect(starsData).toHaveProperty('by_topic');
            expect(starsData).toHaveProperty('all_projects');
        });

        test('github_stars.json 的顶级字段类型应该正确', () => {
            expect(typeof starsData.username).toBe('string');
            expect(typeof starsData.generated_at).toBe('string');
            expect(typeof starsData.total).toBe('number');
            expect(typeof starsData.by_language).toBe('object');
            expect(typeof starsData.by_topic).toBe('object');
            expect(Array.isArray(starsData.all_projects)).toBe(true);
        });

        test('github_stars.json 的 by_language 应该包含有效的统计数据', () => {
            Object.entries(starsData.by_language).forEach(([language, stats]) => {
                expect(typeof stats.count).toBe('number');
                expect(stats.count).toBeGreaterThanOrEqual(0);
                expect(typeof stats.percentage).toBe('number');
                expect(stats.percentage).toBeGreaterThanOrEqual(0);
                expect(stats.percentage).toBeLessThanOrEqual(100);
            });
        });

        test('github_stars.json 的 by_topic 应该包含有效的统计数据', () => {
            Object.entries(starsData.by_topic).forEach(([topic, stats]) => {
                expect(typeof stats.count).toBe('number');
                expect(stats.count).toBeGreaterThanOrEqual(0);
                expect(typeof stats.percentage).toBe('number');
                expect(stats.percentage).toBeGreaterThanOrEqual(0);
                expect(stats.percentage).toBeLessThanOrEqual(100);
            });
        });

        test('github_stars.json 的每个项目应该包含所有必需字段', () => {
            starsData.all_projects.forEach((project, index) => {
                expect(project).toHaveProperty('name');
                expect(project).toHaveProperty('html_url');
                expect(project).toHaveProperty('description');
                expect(project).toHaveProperty('stargazers_count');
                expect(project).toHaveProperty('language');
                expect(project).toHaveProperty('topics');
                expect(project).toHaveProperty('updated_at');
            });
        });

        test('github_stars.json 的每个项目字段类型应该正确', () => {
            starsData.all_projects.forEach((project, index) => {
                expect(typeof project.name).toBe('string');
                expect(typeof project.html_url).toBe('string');
                expect(typeof project.stargazers_count).toBe('number');
                expect(project.language === null || typeof project.language === 'string').toBe(true);
                expect(Array.isArray(project.topics)).toBe(true);
                expect(typeof project.updated_at).toBe('string');
            });
        });

        test('github_stars.json 的验证应该通过', () => {
            const result = JSONValidator.validateStarsData(starsData);
            expect(result.valid).toBe(true);
            expect(result.errors.length).toBe(0);
        });
    });

    describe('Repositories 数据文件验证', () => {
        test('github_repos.json 应该是有效的 JSON 格式', () => {
            expect(reposData).toBeDefined();
            expect(typeof reposData).toBe('object');
        });

        test('github_repos.json 应该包含所有必需的顶级字段', () => {
            expect(reposData).toHaveProperty('username');
            expect(reposData).toHaveProperty('generated_at');
            expect(reposData).toHaveProperty('total');
            expect(reposData).toHaveProperty('average_stars');
            expect(reposData).toHaveProperty('average_forks');
            expect(reposData).toHaveProperty('by_language');
            expect(reposData).toHaveProperty('by_topic');
            expect(reposData).toHaveProperty('all_projects');
        });

        test('github_repos.json 的顶级字段类型应该正确', () => {
            expect(typeof reposData.username).toBe('string');
            expect(typeof reposData.generated_at).toBe('string');
            expect(typeof reposData.total).toBe('number');
            expect(typeof reposData.average_stars).toBe('number');
            expect(typeof reposData.average_forks).toBe('number');
            expect(typeof reposData.by_language).toBe('object');
            expect(typeof reposData.by_topic).toBe('object');
            expect(Array.isArray(reposData.all_projects)).toBe(true);
        });

        test('github_repos.json 的 by_language 应该包含有效的统计数据', () => {
            Object.entries(reposData.by_language).forEach(([language, stats]) => {
                expect(typeof stats.count).toBe('number');
                expect(stats.count).toBeGreaterThanOrEqual(0);
                expect(typeof stats.percentage).toBe('number');
                expect(stats.percentage).toBeGreaterThanOrEqual(0);
                expect(stats.percentage).toBeLessThanOrEqual(100);
            });
        });

        test('github_repos.json 的 by_topic 应该包含有效的统计数据', () => {
            Object.entries(reposData.by_topic).forEach(([topic, stats]) => {
                expect(typeof stats.count).toBe('number');
                expect(stats.count).toBeGreaterThanOrEqual(0);
                expect(typeof stats.percentage).toBe('number');
                expect(stats.percentage).toBeGreaterThanOrEqual(0);
                expect(stats.percentage).toBeLessThanOrEqual(100);
            });
        });

        test('github_repos.json 的每个项目应该包含所有必需字段', () => {
            reposData.all_projects.forEach((project, index) => {
                expect(project).toHaveProperty('name');
                expect(project).toHaveProperty('html_url');
                expect(project).toHaveProperty('description');
                expect(project).toHaveProperty('stargazers_count');
                expect(project).toHaveProperty('forks_count');
                expect(project).toHaveProperty('language');
                expect(project).toHaveProperty('topics');
                expect(project).toHaveProperty('updated_at');
                expect(project).toHaveProperty('fork');
                expect(project).toHaveProperty('private');
            });
        });

        test('github_repos.json 的每个项目字段类型应该正确', () => {
            reposData.all_projects.forEach((project, index) => {
                expect(typeof project.name).toBe('string');
                expect(typeof project.html_url).toBe('string');
                expect(typeof project.stargazers_count).toBe('number');
                expect(typeof project.forks_count).toBe('number');
                expect(project.language === null || typeof project.language === 'string').toBe(true);
                expect(Array.isArray(project.topics)).toBe(true);
                expect(typeof project.updated_at).toBe('string');
                expect(typeof project.fork).toBe('boolean');
                expect(typeof project.private).toBe('boolean');
            });
        });

        test('github_repos.json 的验证应该通过', () => {
            const result = JSONValidator.validateReposData(reposData);
            expect(result.valid).toBe(true);
            expect(result.errors.length).toBe(0);
        });
    });

    describe('数据一致性验证', () => {
        test('Stars 数据的统计数据应该与项目列表一致', () => {
            const totalProjects = starsData.all_projects.length;
            expect(starsData.total).toBe(totalProjects);
        });

        test('Repositories 数据的统计数据应该与项目列表一致', () => {
            const totalProjects = reposData.all_projects.length;
            expect(reposData.total).toBe(totalProjects);
        });

        test('Stars 数据的语言分类计数应该与项目列表一致', () => {
            const languageCounts = {};
            starsData.all_projects.forEach(project => {
                const lang = project.language || '未分类';
                languageCounts[lang] = (languageCounts[lang] || 0) + 1;
            });

            Object.entries(starsData.by_language).forEach(([language, stats]) => {
                expect(stats.count).toBe(languageCounts[language] || 0);
            });
        });

        test('Repositories 数据的语言分类计数应该与项目列表一致', () => {
            const languageCounts = {};
            reposData.all_projects.forEach(project => {
                const lang = project.language || '未分类';
                languageCounts[lang] = (languageCounts[lang] || 0) + 1;
            });

            Object.entries(reposData.by_language).forEach(([language, stats]) => {
                expect(stats.count).toBe(languageCounts[language] || 0);
            });
        });
    });
});
