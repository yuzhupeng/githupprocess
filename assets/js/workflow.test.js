import { describe, it, expect, beforeEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(__dirname, '../data');

describe('GitHub Actions 工作流集成测试', () => {
  describe('JSON 数据文件格式验证', () => {
    it('应该生成有效的 github_stars.json 文件', () => {
      const starsPath = path.join(dataDir, 'github_stars.json');
      
      // 检查文件是否存在
      expect(fs.existsSync(starsPath)).toBe(true);
      
      // 读取并解析 JSON
      const content = fs.readFileSync(starsPath, 'utf-8');
      const data = JSON.parse(content);
      
      // 验证必需字段
      expect(data).toHaveProperty('username');
      expect(data).toHaveProperty('generated_at');
      expect(data).toHaveProperty('total');
      expect(data).toHaveProperty('by_language');
      expect(data).toHaveProperty('by_topic');
      expect(data).toHaveProperty('all_projects');
      
      // 验证数据类型
      expect(typeof data.username).toBe('string');
      expect(typeof data.generated_at).toBe('string');
      expect(typeof data.total).toBe('number');
      expect(Array.isArray(data.all_projects)).toBe(true);
      expect(typeof data.by_language).toBe('object');
      expect(typeof data.by_topic).toBe('object');
    });

    it('应该生成有效的 github_repos.json 文件', () => {
      const reposPath = path.join(dataDir, 'github_repos.json');
      
      // 检查文件是否存在
      expect(fs.existsSync(reposPath)).toBe(true);
      
      // 读取并解析 JSON
      const content = fs.readFileSync(reposPath, 'utf-8');
      const data = JSON.parse(content);
      
      // 验证必需字段
      expect(data).toHaveProperty('username');
      expect(data).toHaveProperty('generated_at');
      expect(data).toHaveProperty('total');
      expect(data).toHaveProperty('by_language');
      expect(data).toHaveProperty('by_topic');
      expect(data).toHaveProperty('all_projects');
      
      // 验证数据类型
      expect(typeof data.username).toBe('string');
      expect(typeof data.generated_at).toBe('string');
      expect(typeof data.total).toBe('number');
      expect(Array.isArray(data.all_projects)).toBe(true);
      expect(typeof data.by_language).toBe('object');
      expect(typeof data.by_topic).toBe('object');
    });

    it('Stars JSON 中的项目应包含所有必需字段', () => {
      const starsPath = path.join(dataDir, 'github_stars.json');
      const content = fs.readFileSync(starsPath, 'utf-8');
      const data = JSON.parse(content);
      
      // 检查至少有一个项目
      expect(data.all_projects.length).toBeGreaterThan(0);
      
      const project = data.all_projects[0];
      
      // 验证必需字段
      expect(project).toHaveProperty('name');
      expect(project).toHaveProperty('html_url');
      expect(project).toHaveProperty('description');
      expect(project).toHaveProperty('stargazers_count');
      expect(project).toHaveProperty('language');
      expect(project).toHaveProperty('topics');
      expect(project).toHaveProperty('updated_at');
      
      // 验证数据类型
      expect(typeof project.name).toBe('string');
      expect(typeof project.html_url).toBe('string');
      expect(typeof project.stargazers_count).toBe('number');
      expect(Array.isArray(project.topics)).toBe(true);
      expect(typeof project.updated_at).toBe('string');
    });

    it('Repos JSON 中的项目应包含所有必需字段', () => {
      const reposPath = path.join(dataDir, 'github_repos.json');
      const content = fs.readFileSync(reposPath, 'utf-8');
      const data = JSON.parse(content);
      
      // 检查至少有一个项目
      expect(data.all_projects.length).toBeGreaterThan(0);
      
      const repo = data.all_projects[0];
      
      // 验证必需字段
      expect(repo).toHaveProperty('name');
      expect(repo).toHaveProperty('html_url');
      expect(repo).toHaveProperty('description');
      expect(repo).toHaveProperty('stargazers_count');
      expect(repo).toHaveProperty('forks_count');
      expect(repo).toHaveProperty('language');
      expect(repo).toHaveProperty('topics');
      expect(repo).toHaveProperty('updated_at');
      expect(repo).toHaveProperty('fork');
      expect(repo).toHaveProperty('private');
      
      // 验证数据类型
      expect(typeof repo.name).toBe('string');
      expect(typeof repo.html_url).toBe('string');
      expect(typeof repo.stargazers_count).toBe('number');
      expect(typeof repo.forks_count).toBe('number');
      expect(typeof repo.fork).toBe('boolean');
      expect(typeof repo.private).toBe('boolean');
      expect(Array.isArray(repo.topics)).toBe(true);
    });

    it('JSON 中的 total 字段应与项目数量一致', () => {
      const starsPath = path.join(dataDir, 'github_stars.json');
      const content = fs.readFileSync(starsPath, 'utf-8');
      const data = JSON.parse(content);
      
      expect(data.total).toBe(data.all_projects.length);
    });

    it('Repos JSON 中的 total 字段应与项目数量一致', () => {
      const reposPath = path.join(dataDir, 'github_repos.json');
      const content = fs.readFileSync(reposPath, 'utf-8');
      const data = JSON.parse(content);
      
      expect(data.total).toBe(data.all_projects.length);
    });

    it('JSON 中的 generated_at 应是有效的 ISO 8601 日期格式', () => {
      const starsPath = path.join(dataDir, 'github_stars.json');
      const content = fs.readFileSync(starsPath, 'utf-8');
      const data = JSON.parse(content);
      
      // 验证 ISO 8601 格式
      const isoRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/;
      expect(isoRegex.test(data.generated_at)).toBe(true);
      
      // 验证可以解析为有效日期
      const date = new Date(data.generated_at);
      expect(date instanceof Date && !isNaN(date)).toBe(true);
    });

    it('by_language 对象应包含有效的语言分类', () => {
      const starsPath = path.join(dataDir, 'github_stars.json');
      const content = fs.readFileSync(starsPath, 'utf-8');
      const data = JSON.parse(content);
      
      // 检查 by_language 是否为对象
      expect(typeof data.by_language).toBe('object');
      
      // 检查每个语言分类中的数据结构
      for (const [lang, langData] of Object.entries(data.by_language)) {
        expect(typeof langData).toBe('object');
        expect(langData).toHaveProperty('count');
        expect(langData).toHaveProperty('percentage');
        expect(typeof langData.count).toBe('number');
        expect(typeof langData.percentage).toBe('number');
        expect(langData.count).toBeGreaterThan(0);
        expect(langData.percentage).toBeGreaterThan(0);
        expect(langData.percentage).toBeLessThanOrEqual(100);
      }
    });

    it('by_topic 对象应包含有效的主题分类', () => {
      const starsPath = path.join(dataDir, 'github_stars.json');
      const content = fs.readFileSync(starsPath, 'utf-8');
      const data = JSON.parse(content);
      
      // 检查 by_topic 是否为对象
      expect(typeof data.by_topic).toBe('object');
      
      // 检查每个主题分类中的数据结构
      for (const [topic, topicData] of Object.entries(data.by_topic)) {
        expect(typeof topicData).toBe('object');
        expect(topicData).toHaveProperty('count');
        expect(topicData).toHaveProperty('percentage');
        expect(typeof topicData.count).toBe('number');
        expect(typeof topicData.percentage).toBe('number');
        expect(topicData.count).toBeGreaterThan(0);
        expect(topicData.percentage).toBeGreaterThan(0);
        expect(topicData.percentage).toBeLessThanOrEqual(100);
      }
    });

    it('项目 URL 应是有效的 GitHub 链接', () => {
      const starsPath = path.join(dataDir, 'github_stars.json');
      const content = fs.readFileSync(starsPath, 'utf-8');
      const data = JSON.parse(content);
      
      expect(data.all_projects.length).toBeGreaterThan(0);
      
      data.all_projects.forEach(project => {
        expect(project.html_url).toMatch(/^https:\/\/github\.com\//);
      });
    });

    it('项目的 stargazers_count 和 forks_count 应为非负整数', () => {
      const starsPath = path.join(dataDir, 'github_stars.json');
      const content = fs.readFileSync(starsPath, 'utf-8');
      const data = JSON.parse(content);
      
      data.all_projects.forEach(project => {
        expect(project.stargazers_count).toBeGreaterThanOrEqual(0);
        expect(Number.isInteger(project.stargazers_count)).toBe(true);
      });
    });

    it('Repos 中的 forks_count 应为非负整数', () => {
      const reposPath = path.join(dataDir, 'github_repos.json');
      const content = fs.readFileSync(reposPath, 'utf-8');
      const data = JSON.parse(content);
      
      data.all_projects.forEach(repo => {
        expect(repo.forks_count).toBeGreaterThanOrEqual(0);
        expect(Number.isInteger(repo.forks_count)).toBe(true);
      });
    });

    it('Repos JSON 应包含 average_stars 和 average_forks 字段', () => {
      const reposPath = path.join(dataDir, 'github_repos.json');
      const content = fs.readFileSync(reposPath, 'utf-8');
      const data = JSON.parse(content);
      
      expect(data).toHaveProperty('average_stars');
      expect(data).toHaveProperty('average_forks');
      expect(typeof data.average_stars).toBe('number');
      expect(typeof data.average_forks).toBe('number');
      expect(data.average_stars).toBeGreaterThanOrEqual(0);
      expect(data.average_forks).toBeGreaterThanOrEqual(0);
    });

    it('项目的 updated_at 应是有效的 ISO 8601 日期格式', () => {
      const starsPath = path.join(dataDir, 'github_stars.json');
      const content = fs.readFileSync(starsPath, 'utf-8');
      const data = JSON.parse(content);
      
      const isoRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/;
      
      data.all_projects.forEach(project => {
        expect(isoRegex.test(project.updated_at)).toBe(true);
        const date = new Date(project.updated_at);
        expect(date instanceof Date && !isNaN(date)).toBe(true);
      });
    });

    it('项目名称和 URL 不应为空', () => {
      const starsPath = path.join(dataDir, 'github_stars.json');
      const content = fs.readFileSync(starsPath, 'utf-8');
      const data = JSON.parse(content);
      
      data.all_projects.forEach(project => {
        expect(project.name).toBeTruthy();
        expect(project.html_url).toBeTruthy();
        expect(project.name.length).toBeGreaterThan(0);
        expect(project.html_url.length).toBeGreaterThan(0);
      });
    });

    it('语言分类的百分比总和应接近 100%', () => {
      const starsPath = path.join(dataDir, 'github_stars.json');
      const content = fs.readFileSync(starsPath, 'utf-8');
      const data = JSON.parse(content);
      
      const totalPercentage = Object.values(data.by_language).reduce(
        (sum, lang) => sum + lang.percentage,
        0
      );
      
      // 允许 1% 的浮点误差
      expect(totalPercentage).toBeGreaterThanOrEqual(99);
      expect(totalPercentage).toBeLessThanOrEqual(101);
    });

    it('主题分类的百分比总和应接近 100%', () => {
      const starsPath = path.join(dataDir, 'github_stars.json');
      const content = fs.readFileSync(starsPath, 'utf-8');
      const data = JSON.parse(content);
      
      const totalPercentage = Object.values(data.by_topic).reduce(
        (sum, topic) => sum + topic.percentage,
        0
      );
      
      // 允许 1% 的浮点误差
      expect(totalPercentage).toBeGreaterThanOrEqual(99);
      expect(totalPercentage).toBeLessThanOrEqual(101);
    });
  });

  describe('工作流执行验证', () => {
    it('应该生成 Markdown 报告文件', () => {
      const markdownPath = path.join(__dirname, '../../GitHub_Stars.md');
      expect(fs.existsSync(markdownPath)).toBe(true);
    });

    it('应该生成 CSV 数据文件', () => {
      const csvPath = path.join(__dirname, '../../github_stars.csv');
      expect(fs.existsSync(csvPath)).toBe(true);
    });

    it('Markdown 文件应包含必要的内容', () => {
      const markdownPath = path.join(__dirname, '../../GitHub_Stars.md');
      const content = fs.readFileSync(markdownPath, 'utf-8');
      
      // 检查关键部分
      expect(content.length).toBeGreaterThan(0);
      expect(content).toContain('GitHub');
    });

    it('CSV 文件应包含有效的数据', () => {
      const csvPath = path.join(__dirname, '../../github_stars.csv');
      const content = fs.readFileSync(csvPath, 'utf-8');
      
      // 检查 CSV 文件不为空
      expect(content.length).toBeGreaterThan(0);
      
      // 检查是否包含逗号分隔符
      expect(content).toContain(',');
    });

    it('数据文件应该是最近生成的', () => {
      const starsPath = path.join(dataDir, 'github_stars.json');
      const stats = fs.statSync(starsPath);
      
      // 检查文件修改时间不超过 24 小时前
      const now = new Date();
      const fileTime = new Date(stats.mtime);
      const diffHours = (now - fileTime) / (1000 * 60 * 60);
      
      expect(diffHours).toBeLessThan(24);
    });
  });

  describe('工作流数据一致性验证', () => {
    it('Stars 和 Repos 数据应该有相同的用户名', () => {
      const starsPath = path.join(dataDir, 'github_stars.json');
      const reposPath = path.join(dataDir, 'github_repos.json');
      
      const starsContent = fs.readFileSync(starsPath, 'utf-8');
      const reposContent = fs.readFileSync(reposPath, 'utf-8');
      
      const starsData = JSON.parse(starsContent);
      const reposData = JSON.parse(reposContent);
      
      expect(starsData.username).toBe(reposData.username);
    });

    it('Stars 数据中的项目应该有有效的 topics 数组', () => {
      const starsPath = path.join(dataDir, 'github_stars.json');
      const content = fs.readFileSync(starsPath, 'utf-8');
      const data = JSON.parse(content);
      
      data.all_projects.forEach(project => {
        expect(Array.isArray(project.topics)).toBe(true);
      });
    });

    it('Repos 数据中的项目应该有有效的 topics 数组', () => {
      const reposPath = path.join(dataDir, 'github_repos.json');
      const content = fs.readFileSync(reposPath, 'utf-8');
      const data = JSON.parse(content);
      
      data.all_projects.forEach(repo => {
        expect(Array.isArray(repo.topics)).toBe(true);
      });
    });

    it('所有项目的 language 字段应该是字符串或 null', () => {
      const starsPath = path.join(dataDir, 'github_stars.json');
      const content = fs.readFileSync(starsPath, 'utf-8');
      const data = JSON.parse(content);
      
      data.all_projects.forEach(project => {
        expect(
          typeof project.language === 'string' || project.language === null
        ).toBe(true);
      });
    });

    it('Repos 中的 fork 和 private 字段应该是布尔值', () => {
      const reposPath = path.join(dataDir, 'github_repos.json');
      const content = fs.readFileSync(reposPath, 'utf-8');
      const data = JSON.parse(content);
      
      data.all_projects.forEach(repo => {
        expect(typeof repo.fork).toBe('boolean');
        expect(typeof repo.private).toBe('boolean');
      });
    });
  });
});
