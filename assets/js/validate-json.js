/**
 * JSON 数据文件验证工具
 * 验证 github_stars.json 和 github_repos.json 的格式和必需字段
 */

class JSONValidator {
    /**
     * 验证 Stars 数据文件格式
     * @param {Object} data - 要验证的数据
     * @returns {Object} 验证结果 { valid: boolean, errors: string[] }
     */
    static validateStarsData(data) {
        const errors = [];

        // 验证顶级字段
        if (!data.username || typeof data.username !== 'string') {
            errors.push('缺少或无效的 username 字段');
        }

        if (!data.generated_at || typeof data.generated_at !== 'string') {
            errors.push('缺少或无效的 generated_at 字段');
        }

        if (typeof data.total !== 'number' || data.total < 0) {
            errors.push('缺少或无效的 total 字段');
        }

        // 验证 by_language 结构
        if (!data.by_language || typeof data.by_language !== 'object') {
            errors.push('缺少或无效的 by_language 字段');
        } else {
            Object.entries(data.by_language).forEach(([lang, stats]) => {
                if (typeof stats.count !== 'number' || stats.count < 0) {
                    errors.push(`by_language.${lang}.count 无效`);
                }
                if (typeof stats.percentage !== 'number' || stats.percentage < 0 || stats.percentage > 100) {
                    errors.push(`by_language.${lang}.percentage 无效`);
                }
            });
        }

        // 验证 by_topic 结构
        if (!data.by_topic || typeof data.by_topic !== 'object') {
            errors.push('缺少或无效的 by_topic 字段');
        } else {
            Object.entries(data.by_topic).forEach(([topic, stats]) => {
                if (typeof stats.count !== 'number' || stats.count < 0) {
                    errors.push(`by_topic.${topic}.count 无效`);
                }
                if (typeof stats.percentage !== 'number' || stats.percentage < 0 || stats.percentage > 100) {
                    errors.push(`by_topic.${topic}.percentage 无效`);
                }
            });
        }

        // 验证 all_projects 数组
        if (!Array.isArray(data.all_projects)) {
            errors.push('缺少或无效的 all_projects 字段');
        } else {
            data.all_projects.forEach((project, index) => {
                const projectErrors = this.validateStarsProject(project, index);
                errors.push(...projectErrors);
            });
        }

        return {
            valid: errors.length === 0,
            errors
        };
    }

    /**
     * 验证 Stars 项目对象
     * @param {Object} project - 项目对象
     * @param {number} index - 项目索引
     * @returns {string[]} 错误列表
     */
    static validateStarsProject(project, index) {
        const errors = [];
        const prefix = `all_projects[${index}]`;

        if (!project.name || typeof project.name !== 'string') {
            errors.push(`${prefix}.name 缺少或无效`);
        }

        if (!project.html_url || typeof project.html_url !== 'string') {
            errors.push(`${prefix}.html_url 缺少或无效`);
        }

        if (typeof project.stargazers_count !== 'number' || project.stargazers_count < 0) {
            errors.push(`${prefix}.stargazers_count 缺少或无效`);
        }

        if (project.language !== null && typeof project.language !== 'string') {
            errors.push(`${prefix}.language 类型无效`);
        }

        if (!Array.isArray(project.topics)) {
            errors.push(`${prefix}.topics 缺少或无效`);
        }

        if (!project.updated_at || typeof project.updated_at !== 'string') {
            errors.push(`${prefix}.updated_at 缺少或无效`);
        }

        return errors;
    }

    /**
     * 验证 Repositories 数据文件格式
     * @param {Object} data - 要验证的数据
     * @returns {Object} 验证结果 { valid: boolean, errors: string[] }
     */
    static validateReposData(data) {
        const errors = [];

        // 验证顶级字段
        if (!data.username || typeof data.username !== 'string') {
            errors.push('缺少或无效的 username 字段');
        }

        if (!data.generated_at || typeof data.generated_at !== 'string') {
            errors.push('缺少或无效的 generated_at 字段');
        }

        if (typeof data.total !== 'number' || data.total < 0) {
            errors.push('缺少或无效的 total 字段');
        }

        if (typeof data.average_stars !== 'number' || data.average_stars < 0) {
            errors.push('缺少或无效的 average_stars 字段');
        }

        if (typeof data.average_forks !== 'number' || data.average_forks < 0) {
            errors.push('缺少或无效的 average_forks 字段');
        }

        // 验证 by_language 结构
        if (!data.by_language || typeof data.by_language !== 'object') {
            errors.push('缺少或无效的 by_language 字段');
        } else {
            Object.entries(data.by_language).forEach(([lang, stats]) => {
                if (typeof stats.count !== 'number' || stats.count < 0) {
                    errors.push(`by_language.${lang}.count 无效`);
                }
                if (typeof stats.percentage !== 'number' || stats.percentage < 0 || stats.percentage > 100) {
                    errors.push(`by_language.${lang}.percentage 无效`);
                }
            });
        }

        // 验证 by_topic 结构
        if (!data.by_topic || typeof data.by_topic !== 'object') {
            errors.push('缺少或无效的 by_topic 字段');
        } else {
            Object.entries(data.by_topic).forEach(([topic, stats]) => {
                if (typeof stats.count !== 'number' || stats.count < 0) {
                    errors.push(`by_topic.${topic}.count 无效`);
                }
                if (typeof stats.percentage !== 'number' || stats.percentage < 0 || stats.percentage > 100) {
                    errors.push(`by_topic.${topic}.percentage 无效`);
                }
            });
        }

        // 验证 all_projects 数组
        if (!Array.isArray(data.all_projects)) {
            errors.push('缺少或无效的 all_projects 字段');
        } else {
            data.all_projects.forEach((project, index) => {
                const projectErrors = this.validateReposProject(project, index);
                errors.push(...projectErrors);
            });
        }

        return {
            valid: errors.length === 0,
            errors
        };
    }

    /**
     * 验证 Repositories 项目对象
     * @param {Object} project - 项目对象
     * @param {number} index - 项目索引
     * @returns {string[]} 错误列表
     */
    static validateReposProject(project, index) {
        const errors = [];
        const prefix = `all_projects[${index}]`;

        if (!project.name || typeof project.name !== 'string') {
            errors.push(`${prefix}.name 缺少或无效`);
        }

        if (!project.html_url || typeof project.html_url !== 'string') {
            errors.push(`${prefix}.html_url 缺少或无效`);
        }

        if (typeof project.stargazers_count !== 'number' || project.stargazers_count < 0) {
            errors.push(`${prefix}.stargazers_count 缺少或无效`);
        }

        if (typeof project.forks_count !== 'number' || project.forks_count < 0) {
            errors.push(`${prefix}.forks_count 缺少或无效`);
        }

        if (project.language !== null && typeof project.language !== 'string') {
            errors.push(`${prefix}.language 类型无效`);
        }

        if (!Array.isArray(project.topics)) {
            errors.push(`${prefix}.topics 缺少或无效`);
        }

        if (!project.updated_at || typeof project.updated_at !== 'string') {
            errors.push(`${prefix}.updated_at 缺少或无效`);
        }

        if (typeof project.fork !== 'boolean') {
            errors.push(`${prefix}.fork 缺少或无效`);
        }

        if (typeof project.private !== 'boolean') {
            errors.push(`${prefix}.private 缺少或无效`);
        }

        return errors;
    }
}

// 导出用于 Node.js 环境
if (typeof module !== 'undefined' && module.exports) {
    module.exports = JSONValidator;
}
