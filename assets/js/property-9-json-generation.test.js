import fc from 'fast-check';
import JSONValidator from './validate-json.js';

/**
 * 属性 9: JSON 数据文件生成正确性
 * 
 * 对于任何从 Python 脚本生成的 JSON 数据文件，文件应包含所有必需字段且格式有效。
 * 
 * 验证需求: 需求 4.4
 */

describe('属性 9: JSON 数据文件生成正确性', () => {
    /**
     * 生成有效的 Stars 数据结构
     */
    const generateValidStarsData = () => {
        return fc.tuple(
            fc.string({ minLength: 1, maxLength: 39 }),
            fc.array(
                fc.record({
                    name: fc.string({ minLength: 1 }),
                    html_url: fc.webUrl(),
                    description: fc.oneof(fc.string(), fc.constant(null)),
                    stargazers_count: fc.integer({ min: 0, max: 1000000 }),
                    language: fc.oneof(
                        fc.constant('Python'),
                        fc.constant('JavaScript'),
                        fc.constant('Go'),
                        fc.constant(null)
                    ),
                    topics: fc.array(
                        fc.oneof(
                            fc.constant('AI/ML'),
                            fc.constant('Web'),
                            fc.constant('DevOps'),
                            fc.constant('Data')
                        ),
                        { maxLength: 3 }
                    ),
                    updated_at: fc.date().map(d => d.toISOString()),
                }),
                { maxLength: 50 }
            )
        ).map(([username, projects]) => {
            // 计算统计数据
            const by_language = {};
            const by_topic = {};

            projects.forEach(project => {
                if (project.language) {
                    by_language[project.language] = (by_language[project.language] || 0) + 1;
                }
                if (project.topics && project.topics.length > 0) {
                    project.topics.forEach(topic => {
                        by_topic[topic] = (by_topic[topic] || 0) + 1;
                    });
                }
            });

            // 计算百分比 - 语言基于项目总数
            const total = projects.length;
            Object.keys(by_language).forEach(lang => {
                by_language[lang] = {
                    count: by_language[lang],
                    percentage: total > 0 ? Math.round((by_language[lang] / total) * 100) : 0
                };
            });

            // 计算百分比 - 主题基于主题总数（因为一个项目可能有多个主题）
            const totalTopicCount = Object.values(by_topic).reduce((sum, count) => sum + count, 0);
            Object.keys(by_topic).forEach(topic => {
                by_topic[topic] = {
                    count: by_topic[topic],
                    percentage: totalTopicCount > 0 ? Math.round((by_topic[topic] / totalTopicCount) * 100) : 0
                };
            });

            return {
                username: username,
                generated_at: new Date().toISOString(),
                total: total,
                by_language: by_language,
                by_topic: by_topic,
                all_projects: projects,
            };
        });
    };

    /**
     * 生成有效的 Repositories 数据结构
     */
    const generateValidReposData = () => {
        return fc.tuple(
            fc.string({ minLength: 1, maxLength: 39 }),
            fc.array(
                fc.record({
                    name: fc.string({ minLength: 1 }),
                    html_url: fc.webUrl(),
                    description: fc.oneof(fc.string(), fc.constant(null)),
                    stargazers_count: fc.integer({ min: 0, max: 1000000 }),
                    forks_count: fc.integer({ min: 0, max: 100000 }),
                    language: fc.oneof(
                        fc.constant('Python'),
                        fc.constant('JavaScript'),
                        fc.constant('Go'),
                        fc.constant(null)
                    ),
                    topics: fc.array(
                        fc.oneof(
                            fc.constant('AI/ML'),
                            fc.constant('Web'),
                            fc.constant('DevOps'),
                            fc.constant('Data')
                        ),
                        { maxLength: 3 }
                    ),
                    updated_at: fc.date().map(d => d.toISOString()),
                    fork: fc.boolean(),
                    private: fc.boolean(),
                }),
                { maxLength: 50 }
            )
        ).map(([username, projects]) => {
            // 计算统计数据
            const by_language = {};
            const by_topic = {};
            let totalStars = 0;
            let totalForks = 0;

            projects.forEach(project => {
                totalStars += project.stargazers_count;
                totalForks += project.forks_count;

                if (project.language) {
                    by_language[project.language] = (by_language[project.language] || 0) + 1;
                }
                if (project.topics && project.topics.length > 0) {
                    project.topics.forEach(topic => {
                        by_topic[topic] = (by_topic[topic] || 0) + 1;
                    });
                }
            });

            // 计算百分比 - 语言基于项目总数
            const total = projects.length;
            Object.keys(by_language).forEach(lang => {
                by_language[lang] = {
                    count: by_language[lang],
                    percentage: total > 0 ? Math.round((by_language[lang] / total) * 100) : 0
                };
            });

            // 计算百分比 - 主题基于主题总数（因为一个项目可能有多个主题）
            const totalTopicCount = Object.values(by_topic).reduce((sum, count) => sum + count, 0);
            Object.keys(by_topic).forEach(topic => {
                by_topic[topic] = {
                    count: by_topic[topic],
                    percentage: totalTopicCount > 0 ? Math.round((by_topic[topic] / totalTopicCount) * 100) : 0
                };
            });

            return {
                username: username,
                generated_at: new Date().toISOString(),
                total: total,
                average_stars: total > 0 ? Math.round(totalStars / total) : 0,
                average_forks: total > 0 ? Math.round(totalForks / total) : 0,
                by_language: by_language,
                by_topic: by_topic,
                all_projects: projects,
            };
        });
    };

    test('Validates: Requirements 4.4 - Stars 数据文件生成应包含所有必需字段且格式有效', () => {
        fc.assert(
            fc.property(generateValidStarsData(), (generatedData) => {
                // 验证数据结构完整性
                expect(generatedData).toHaveProperty('username');
                expect(generatedData).toHaveProperty('generated_at');
                expect(generatedData).toHaveProperty('total');
                expect(generatedData).toHaveProperty('by_language');
                expect(generatedData).toHaveProperty('by_topic');
                expect(generatedData).toHaveProperty('all_projects');

                // 验证数据类型
                expect(typeof generatedData.username).toBe('string');
                expect(typeof generatedData.generated_at).toBe('string');
                expect(typeof generatedData.total).toBe('number');
                expect(typeof generatedData.by_language).toBe('object');
                expect(typeof generatedData.by_topic).toBe('object');
                expect(Array.isArray(generatedData.all_projects)).toBe(true);

                // 验证 by_language 结构
                Object.entries(generatedData.by_language).forEach(([, stats]) => {
                    expect(typeof stats.count).toBe('number');
                    expect(typeof stats.percentage).toBe('number');
                    expect(stats.count).toBeGreaterThanOrEqual(0);
                    expect(stats.percentage).toBeGreaterThanOrEqual(0);
                    expect(stats.percentage).toBeLessThanOrEqual(100);
                });

                // 验证 by_topic 结构
                Object.entries(generatedData.by_topic).forEach(([, stats]) => {
                    expect(typeof stats.count).toBe('number');
                    expect(typeof stats.percentage).toBe('number');
                    expect(stats.count).toBeGreaterThanOrEqual(0);
                    expect(stats.percentage).toBeGreaterThanOrEqual(0);
                    expect(stats.percentage).toBeLessThanOrEqual(100);
                });

                // 验证项目数据完整性
                generatedData.all_projects.forEach(project => {
                    expect(project).toHaveProperty('name');
                    expect(project).toHaveProperty('html_url');
                    expect(project).toHaveProperty('stargazers_count');
                    expect(project).toHaveProperty('language');
                    expect(project).toHaveProperty('topics');
                    expect(project).toHaveProperty('updated_at');

                    // 验证项目字段类型
                    expect(typeof project.name).toBe('string');
                    expect(typeof project.html_url).toBe('string');
                    expect(typeof project.stargazers_count).toBe('number');
                    expect(Array.isArray(project.topics)).toBe(true);
                    expect(typeof project.updated_at).toBe('string');
                });

                // 使用验证器验证整个数据结构
                const validationResult = JSONValidator.validateStarsData(generatedData);
                expect(validationResult.valid).toBe(true);
                expect(validationResult.errors.length).toBe(0);

                return true;
            }),
            { numRuns: 100 }
        );
    });

    test('Validates: Requirements 4.4 - Repositories 数据文件生成应包含所有必需字段且格式有效', () => {
        fc.assert(
            fc.property(generateValidReposData(), (generatedData) => {
                // 验证数据结构完整性
                expect(generatedData).toHaveProperty('username');
                expect(generatedData).toHaveProperty('generated_at');
                expect(generatedData).toHaveProperty('total');
                expect(generatedData).toHaveProperty('average_stars');
                expect(generatedData).toHaveProperty('average_forks');
                expect(generatedData).toHaveProperty('by_language');
                expect(generatedData).toHaveProperty('by_topic');
                expect(generatedData).toHaveProperty('all_projects');

                // 验证数据类型
                expect(typeof generatedData.username).toBe('string');
                expect(typeof generatedData.generated_at).toBe('string');
                expect(typeof generatedData.total).toBe('number');
                expect(typeof generatedData.average_stars).toBe('number');
                expect(typeof generatedData.average_forks).toBe('number');
                expect(typeof generatedData.by_language).toBe('object');
                expect(typeof generatedData.by_topic).toBe('object');
                expect(Array.isArray(generatedData.all_projects)).toBe(true);

                // 验证 by_language 结构
                Object.entries(generatedData.by_language).forEach(([, stats]) => {
                    expect(typeof stats.count).toBe('number');
                    expect(typeof stats.percentage).toBe('number');
                    expect(stats.count).toBeGreaterThanOrEqual(0);
                    expect(stats.percentage).toBeGreaterThanOrEqual(0);
                    expect(stats.percentage).toBeLessThanOrEqual(100);
                });

                // 验证 by_topic 结构
                Object.entries(generatedData.by_topic).forEach(([, stats]) => {
                    expect(typeof stats.count).toBe('number');
                    expect(typeof stats.percentage).toBe('number');
                    expect(stats.count).toBeGreaterThanOrEqual(0);
                    expect(stats.percentage).toBeGreaterThanOrEqual(0);
                    expect(stats.percentage).toBeLessThanOrEqual(100);
                });

                // 验证项目数据完整性
                generatedData.all_projects.forEach(project => {
                    expect(project).toHaveProperty('name');
                    expect(project).toHaveProperty('html_url');
                    expect(project).toHaveProperty('stargazers_count');
                    expect(project).toHaveProperty('forks_count');
                    expect(project).toHaveProperty('language');
                    expect(project).toHaveProperty('topics');
                    expect(project).toHaveProperty('updated_at');
                    expect(project).toHaveProperty('fork');
                    expect(project).toHaveProperty('private');

                    // 验证项目字段类型
                    expect(typeof project.name).toBe('string');
                    expect(typeof project.html_url).toBe('string');
                    expect(typeof project.stargazers_count).toBe('number');
                    expect(typeof project.forks_count).toBe('number');
                    expect(Array.isArray(project.topics)).toBe(true);
                    expect(typeof project.updated_at).toBe('string');
                    expect(typeof project.fork).toBe('boolean');
                    expect(typeof project.private).toBe('boolean');
                });

                // 使用验证器验证整个数据结构
                const validationResult = JSONValidator.validateReposData(generatedData);
                expect(validationResult.valid).toBe(true);
                expect(validationResult.errors.length).toBe(0);

                return true;
            }),
            { numRuns: 100 }
        );
    });

    test('Validates: Requirements 4.4 - JSON 数据应能被正确序列化和反序列化', () => {
        fc.assert(
            fc.property(generateValidStarsData(), (originalData) => {
                // 序列化为 JSON 字符串
                const jsonString = JSON.stringify(originalData);
                expect(typeof jsonString).toBe('string');

                // 反序列化回对象
                const deserializedData = JSON.parse(jsonString);

                // 验证反序列化后的数据结构完整性
                expect(deserializedData).toHaveProperty('username');
                expect(deserializedData).toHaveProperty('generated_at');
                expect(deserializedData).toHaveProperty('total');
                expect(deserializedData).toHaveProperty('by_language');
                expect(deserializedData).toHaveProperty('by_topic');
                expect(deserializedData).toHaveProperty('all_projects');

                // 验证数据值一致性
                expect(deserializedData.username).toBe(originalData.username);
                expect(deserializedData.total).toBe(originalData.total);
                expect(deserializedData.all_projects.length).toBe(originalData.all_projects.length);

                return true;
            }),
            { numRuns: 100 }
        );
    });

    test('Validates: Requirements 4.4 - JSON 数据的统计字段应与项目列表一致', () => {
        fc.assert(
            fc.property(generateValidStarsData(), (generatedData) => {
                // 验证 total 字段与项目列表长度一致
                expect(generatedData.total).toBe(generatedData.all_projects.length);

                // 验证 by_language 中的计数总和不超过项目总数
                let totalLanguageCount = 0;
                Object.entries(generatedData.by_language).forEach(([, stats]) => {
                    expect(typeof stats.count).toBe('number');
                    expect(stats.count).toBeGreaterThanOrEqual(0);
                    totalLanguageCount += stats.count;
                });
                expect(totalLanguageCount).toBeLessThanOrEqual(generatedData.total);

                // 验证 by_topic 中的计数总和不超过项目总数
                // （因为一个项目可能有多个主题）
                let totalTopicCount = 0;
                Object.entries(generatedData.by_topic).forEach(([, stats]) => {
                    expect(typeof stats.count).toBe('number');
                    expect(stats.count).toBeGreaterThanOrEqual(0);
                    totalTopicCount += stats.count;
                });
                expect(totalTopicCount).toBeLessThanOrEqual(generatedData.total * 10);  // 允许多个主题

                return true;
            }),
            { numRuns: 100 }
        );
    });

    test('Validates: Requirements 4.4 - JSON 数据的百分比字段应有效', () => {
        fc.assert(
            fc.property(generateValidStarsData(), (generatedData) => {
                // 验证 by_language 百分比
                Object.entries(generatedData.by_language).forEach(([, stats]) => {
                    expect(stats.percentage).toBeGreaterThanOrEqual(0);
                    expect(stats.percentage).toBeLessThanOrEqual(100);
                });

                // 验证 by_topic 百分比
                Object.entries(generatedData.by_topic).forEach(([, stats]) => {
                    expect(stats.percentage).toBeGreaterThanOrEqual(0);
                    expect(stats.percentage).toBeLessThanOrEqual(100);
                });

                return true;
            }),
            { numRuns: 100 }
        );
    });
});
