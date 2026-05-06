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
      workingOn: "Working on new ideas..."
    },
    blog: {
      title: "Latest Writing",
      subtitle: "Thoughts, tutorials, and reflections on AI, software engineering, and design.",
      viewAll: "View all posts"
    },
    social: {
      title: "Connect with me",
      subtitle: "Find me across the web and follow my latest updates."
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
      workingOn: "正在构思新点子..."
    },
    blog: {
      title: "最新文章",
      subtitle: "关于人工智能、软件工程与设计的思考、教程与回顾。",
      viewAll: "查看所有文章"
    },
    social: {
      title: "与我联系",
      subtitle: "在各个平台找到我，关注我的最新动态。"
    },
    footer: {
      rights: "保留所有权利。"
    }
  }
};

export type Language = 'en' | 'zh';
export type TranslationKey = keyof typeof translations['en'];
