export const translations = {
  en: {
    hero: {
      greeting: "Hi, I'm",
      name: "Gan",
      subtitle: "Building AI-driven tools to enhance productivity and simplify the complex. Welcome to my creative space.",
      explore: "Explore Tools",
      blog: "Read Blog"
    },
    tools: {
      title: "AI Toolkit",
      subtitle: "Explore the suite of tools and applications I've built to solve real-world problems.",
      launch: "Launch Tool",
      learnMore: "Learn More",
      statusLive: "Live",
      statusSoon: "Coming Soon",
      comingSoon: "More coming soon",
      workingOn: "Working on new ideas...",
      items: [
        {
          id: 'ai-translator',
          name: 'AI Translator',
          description: 'A lightning-fast, highly accurate document translation tool powered by MiniMax models.',
          url: 'https://aitranslator.justganit.com/',
          icon: '🌐',
          statusKey: 'statusLive',
        },
        {
          id: 'douyin-scraper',
          name: 'Douyin Data Scraper',
          description: 'Advanced data extraction pipeline for Douyin (TikTok China) analytics and insights.',
          url: '#',
          icon: '📊',
          statusKey: 'statusSoon',
        }
      ]
    },
    blog: {
      title: "Latest Writing",
      subtitle: "Thoughts, tutorials, and reflections on AI, software engineering, and design.",
      viewAll: "View all posts",
      posts: [
        {
          id: 'post-1',
          title: 'How I Built the AI Document Translator',
          date: 'May 06, 2026',
          excerpt: 'A deep dive into the architecture and prompt engineering behind a high-speed, accurate PDF translation tool.',
          category: 'Engineering',
          readTime: '5 min read'
        },
        {
          id: 'post-2',
          title: 'The Future of Douyin Data Extraction',
          date: 'April 28, 2026',
          excerpt: 'Exploring ethical and scalable ways to gather insights from short-video platforms for market analysis.',
          category: 'Data Science',
          readTime: '8 min read'
        },
        {
          id: 'post-3',
          title: 'Designing with Glassmorphism in Tailwind v4',
          date: 'April 15, 2026',
          excerpt: 'How to create stunning, lightweight liquid glass effects without sacrificing performance or accessibility.',
          category: 'Design',
          readTime: '4 min read'
        }
      ]
    },
    social: {
      title: "Connect with me",
      subtitle: "Find me across the web and follow my latest updates.",
      platforms: [
        {
          id: 'wechat',
          name: 'WeChat Official',
          label: '微信公众号',
          color: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400',
          shadow: 'group-hover:shadow-[0_0_30px_-5px_rgba(34,197,94,0.4)] dark:group-hover:shadow-[0_0_40px_0_rgba(34,197,94,0.6)]',
        },
        {
          id: 'xiaohongshu',
          name: 'Xiaohongshu',
          label: '小红书',
          color: 'bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400',
          shadow: 'group-hover:shadow-[0_0_30px_-5px_rgba(220,38,38,0.4)] dark:group-hover:shadow-[0_0_40px_0_rgba(220,38,38,0.6)]',
        },
        {
          id: 'x',
          name: 'X (Twitter)',
          label: 'X.com',
          color: 'bg-slate-200 text-slate-800 dark:bg-slate-800 dark:text-slate-200',
          shadow: 'group-hover:shadow-[0_0_30px_-5px_rgba(15,23,42,0.4)] dark:group-hover:shadow-[0_0_40px_0_rgba(255,255,255,0.3)]',
        }
      ]
    },
    footer: {
      rights: "All rights reserved."
    }
  },
  zh: {
    hero: {
      greeting: "你好，我是",
      name: "Gan",
      subtitle: "致力于构建 AI 驱动的工具，提升生产力并化繁为简。欢迎来到我的创意空间。",
      explore: "探索工具箱",
      blog: "阅读博客"
    },
    tools: {
      title: "AI 工具箱",
      subtitle: "探索我为了解决实际问题而打造的一系列工具与应用。",
      launch: "立即体验",
      learnMore: "了解更多",
      statusLive: "已上线",
      statusSoon: "即将推出",
      comingSoon: "更多惊喜，敬请期待",
      workingOn: "正在构思新点子...",
      items: [
        {
          id: 'ai-translator',
          name: 'AI 沉浸式翻译',
          description: '基于 MiniMax 大模型驱动的极速、高精度的文档与 PDF 翻译工具。',
          url: 'https://aitranslator.justganit.com/',
          icon: '🌐',
          statusKey: 'statusLive',
        },
        {
          id: 'douyin-scraper',
          name: '抖音数据抓取引擎',
          description: '为抖音短视频和直播数据分析打造的高级自动化提取管道。',
          url: '#',
          icon: '📊',
          statusKey: 'statusSoon',
        }
      ]
    },
    blog: {
      title: "最新文章",
      subtitle: "关于人工智能、软件工程与设计的思考、教程与回顾。",
      viewAll: "查看所有文章",
      posts: [
        {
          id: 'post-1',
          title: '我是如何构建 AI 沉浸式翻译工具的',
          date: '2026年5月06日',
          excerpt: '深入解析这款极速、准确的 PDF 翻译工具背后的架构设计与提示词工程策略。',
          category: '工程实践',
          readTime: '5 分钟阅读'
        },
        {
          id: 'post-2',
          title: '抖音数据提取的未来之道',
          date: '2026年4月28日',
          excerpt: '探索如何以合规、可扩展的方式从短视频平台获取深度洞察，用于市场分析。',
          category: '数据科学',
          readTime: '8 分钟阅读'
        },
        {
          id: 'post-3',
          title: '在 Tailwind v4 中设计液态玻璃',
          date: '2026年4月15日',
          excerpt: '如何在不牺牲性能或无障碍访问的前提下，创造令人惊艳的轻量级流体玻璃视觉效果。',
          category: '设计规范',
          readTime: '4 分钟阅读'
        }
      ]
    },
    social: {
      title: "与我联系",
      subtitle: "在各个平台找到我，关注我的最新动态。",
      platforms: [
        {
          id: 'wechat',
          name: '微信公众号',
          label: 'JustGanIt',
          color: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400',
          shadow: 'group-hover:shadow-[0_0_30px_-5px_rgba(34,197,94,0.4)] dark:group-hover:shadow-[0_0_40px_0_rgba(34,197,94,0.6)]',
        },
        {
          id: 'xiaohongshu',
          name: '小红书',
          label: '前端与AI日常',
          color: 'bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400',
          shadow: 'group-hover:shadow-[0_0_30px_-5px_rgba(220,38,38,0.4)] dark:group-hover:shadow-[0_0_40px_0_rgba(220,38,38,0.6)]',
        },
        {
          id: 'x',
          name: 'X (Twitter)',
          label: 'X.com',
          color: 'bg-slate-200 text-slate-800 dark:bg-slate-800 dark:text-slate-200',
          shadow: 'group-hover:shadow-[0_0_30px_-5px_rgba(15,23,42,0.4)] dark:group-hover:shadow-[0_0_40px_0_rgba(255,255,255,0.3)]',
        }
      ]
    },
    footer: {
      rights: "保留所有权利。"
    }
  }
};

export type Language = 'en' | 'zh';
export type TranslationKey = keyof typeof translations['en'];
