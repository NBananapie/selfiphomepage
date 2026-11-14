export type Language = 'en' | 'zh';
export type ToolStatusKey = 'statusLive' | 'statusSoon';

export interface ToolItem {
  id: string;
  name: string;
  description: string;
  url: string;
  icon: string;
  iconImage?: string;
  highlights?: string[];
  statusKey: ToolStatusKey;
}

export interface BlogPost {
  id: string;
  title: string;
  date: string;
  excerpt: string;
  category: string;
  readTime: string;
  url: string;
}

export interface MusicPlatform {
  id: 'qq-music' | 'apple-music';
  name: string;
  url: string;
  color: string;
}

interface BaseSocialPlatform {
  id: 'wechat' | 'xiaohongshu' | 'github' | 'x';
  name: string;
  handle: string;
  description: string;
  color: string;
  badgeColor: string;
}

export interface QrSocialPlatform extends BaseSocialPlatform {
  type: 'qr';
  qrImage: string;
}

export interface LinkSocialPlatform extends BaseSocialPlatform {
  type: 'link';
  url: string;
}

export type SocialPlatform = QrSocialPlatform | LinkSocialPlatform;

export interface TranslationSchema {
  hero: {
    greeting: string;
    name: string;
    subtitle: string;
    explore: string;
    blog: string;
  };
  tools: {
    title: string;
    subtitle: string;
    launch: string;
    learnMore: string;
    statusLive: string;
    statusSoon: string;
    comingSoon: string;
    workingOn: string;
    items: ToolItem[];
  };
  blog: {
    title: string;
    subtitle: string;
    viewAll: string;
    readArticle: string;
    posts: BlogPost[];
  };
  music: {
    badge: string;
    trackType: string;
    title: string;
    subtitle: string;
    trackTitle: string;
    artist: string;
    description: string;
    listenOn: string;
    platforms: MusicPlatform[];
  };
  social: {
    badge: string;
    title: string;
    subtitle: string;
    qrBadge: string;
    linkBadge: string;
    viewQr: string;
    visitProfile: string;
    scanPrompt: string;
    close: string;
    platforms: SocialPlatform[];
  };
  footer: {
    rights: string;
  };
}

export const translations: Record<Language, TranslationSchema> = {
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
      learnMore: "In Development",
      statusLive: "Live",
      statusSoon: "Coming Soon",
      comingSoon: "More coming soon",
      workingOn: "Working on new ideas...",
      items: [
        {
          id: 'ai-translator',
          name: 'AI Book Translator',
          description: 'Read foreign PDFs side-by-side with instant translations, inline AI explanations, and effortless highlights.',
          url: 'https://aitranslator.justganit.com/',
          icon: '🌐',
          iconImage: '/yueyi-icon.svg',
          highlights: ['Side-by-Side PDF', 'AI Companion', 'Encrypted Sync'],
          statusKey: 'statusLive',
        },
        {
          id: 'poker-arena',
          name: 'LLM Poker Arena',
          description: 'A multi-agent Texas Hold\'em arena powered by Gemini LLM intelligence, featuring loan mechanics and battle analytics.',
          url: 'https://poker.justganit.com/',
          icon: '🃏',
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
      viewAll: "View on WeChat",
      readArticle: "Read Article",
      posts: [
        {
          id: 'post-antigravity',
          title: 'After Being Disgusted by Codex, Is Antigravity the Ultimate Meta Answer?',
          date: 'Nov 01, 2026',
          excerpt: 'An in-depth analysis of Codex quota changes vs Google Antigravity architecture, multi-model ecosystem, and 7x value proposition as the ultimate coding assistant.',
          category: 'Deep Dive',
          readTime: '5 min read',
          url: 'https://mp.weixin.qq.com/s/qT0VjSlxIyn0uTNTrx7H8Q'
        },
        {
          id: 'post-1',
          title: 'HKSIA Ep.14 | AI-Powered Transformation for Secretarial Firms Successfully Held!',
          date: 'Jun 14, 2026',
          excerpt: 'A comprehensive recap of the HKSIA specialized lecture on practical AI tools and industry digital upgrades in Futian, Shenzhen.',
          category: 'Recap',
          readTime: '4 min read',
          url: 'https://mp.weixin.qq.com/s/kQ3GYBjsXnouL8DilXJpcQ'
        },
        {
          id: 'post-2',
          title: 'Event Preview | HKSIA Lecture: AI Practical Tools for Secretarial Firms',
          date: 'May 25, 2026',
          excerpt: 'Empowering secretarial companies with AI-driven transformation, boosting efficiency, and building cross-border cooperation.',
          category: 'Event Preview',
          readTime: '3 min read',
          url: 'https://mp.weixin.qq.com/s/FVV186ZPk1t2hNUbVF1ziw'
        },
        {
          id: 'post-3',
          title: 'They Laughed at Your Dream, Now They Ask How You Did It...',
          date: 'Apr 06, 2025',
          excerpt: 'Keep going and you WIN. Reflections on grit, perseverance, and the mindset required to turn bold visions into reality.',
          category: 'Growth & Mindset',
          readTime: '3 min read',
          url: 'https://mp.weixin.qq.com/s/sSDzbM0X5_HrWMNMyOkAmA'
        },
        {
          id: 'post-4',
          title: 'Your AI Action Advisor "JustGanIt Bot" is Officially Live!',
          date: 'Mar 22, 2025',
          excerpt: 'Say goodbye to hesitation: Introducing JustGanIt Bot, your proactive AI assistant designed to break procrastination.',
          category: 'AI Product',
          readTime: '3 min read',
          url: 'https://mp.weixin.qq.com/s/UPE42z0LCZW-GbSjbu_xLQ'
        },
        {
          id: 'post-5',
          title: 'Why Did the 3rd IPP Choose Such an Abstract Theme?',
          date: 'Mar 20, 2025',
          excerpt: 'Behind-the-scenes thoughts and creative inspiration exploring the abstract symbolism and theme of the 3rd IPP.',
          category: 'Insights',
          readTime: '4 min read',
          url: 'https://mp.weixin.qq.com/s/KHhlkuvYLhcEn09DoZpncw'
        }
      ]
    },
    music: {
      badge: "Creative Release",
      trackType: "Single Track",
      title: "Music & Creative Works",
      subtitle: "Beyond coding and AI — rhythmic creations and energetic beats for unstoppable dreamers.",
      trackTitle: "Dare to Shine (干这属于我的精彩)",
      artist: "BANANA PIES / CHUANG",
      description: "An energetic anthem crafted for those who dare to chase their dreams and break through limits.",
      listenOn: "Listen Now",
      platforms: [
        {
          id: 'qq-music',
          name: 'QQ 音乐 (QQ Music)',
          url: 'https://c6.y.qq.com/base/fcgi-bin/u?__=g0x92Xn59VU3',
          color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
        },
        {
          id: 'apple-music',
          name: 'Apple Music',
          url: 'https://music.apple.com/cn/album/%E5%B9%B2%E8%BF%99%E5%B1%9E%E4%BA%8E%E6%88%91%E7%9A%84%E7%B2%BE%E5%BD%A9/1830182307?i=1830182311&ls',
          color: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30'
        }
      ]
    },
    social: {
      badge: "Multi-Channel Matrix",
      title: "Social Matrix",
      subtitle: "Connect with me across platforms and follow my latest builds, thoughts, and updates.",
      qrBadge: "QR Code",
      linkBadge: "Link",
      viewQr: "View QR Code",
      visitProfile: "Visit Profile",
      scanPrompt: "Scan with App to follow",
      close: "Close",
      platforms: [
        {
          id: 'wechat',
          name: 'WeChat Official',
          handle: 'JustGanIt',
          description: 'Deep dives on AI engineering, tool breakdowns, and productivity thoughts.',
          qrImage: '/wechat-qrcode.jpg',
          color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
          badgeColor: 'bg-emerald-500 text-white',
          type: 'qr',
        },
        {
          id: 'xiaohongshu',
          name: 'Xiaohongshu',
          handle: 'KeepGoingGan (ID: 42894296947)',
          description: 'Life, frontend, AI routine & creative journey. Love what you do, do what you love.',
          qrImage: '/xiaohongshu-card.jpg',
          color: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30',
          badgeColor: 'bg-rose-500 text-white',
          type: 'qr',
        },
        {
          id: 'github',
          name: 'GitHub',
          handle: '@NBananapie',
          description: 'Open-source projects, AI applications, and full-stack developer repositories.',
          url: 'https://github.com/NBananapie',
          color: 'bg-slate-500/10 text-slate-800 dark:text-slate-200 border-slate-500/30',
          badgeColor: 'bg-slate-900 dark:bg-white text-white dark:text-slate-900',
          type: 'link',
        },
        {
          id: 'x',
          name: 'X (Twitter)',
          handle: '@GanBananaReal',
          description: 'Real-time updates, AI insights, tech observations, and unfiltered ideas.',
          url: 'https://x.com/GanBananaReal',
          color: 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/30',
          badgeColor: 'bg-black dark:bg-white text-white dark:text-black',
          type: 'link',
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
      learnMore: "敬请期待",
      statusLive: "已上线",
      statusSoon: "即将推出",
      comingSoon: "更多惊喜，敬请期待",
      workingOn: "正在构思新点子...",
      items: [
        {
          id: 'ai-translator',
          name: '阅译 · AI Book Translator',
          description: '左看外文原版、右读中文译文，划词就能问 AI、记书摘，读外文书就像读母语一样顺手。',
          url: 'https://aitranslator.justganit.com/',
          icon: '🌐',
          iconImage: '/yueyi-icon.svg',
          highlights: ['双栏对照', 'AI 伴读', '多端加密同步'],
          statusKey: 'statusLive',
        },
        {
          id: 'poker-arena',
          name: '德州扑克 AI 博弈场',
          description: '基于 Gemini 大模型多智能体决策框架的德州扑克博弈游戏，支持借贷机制与战绩追踪。',
          url: 'https://poker.justganit.com/',
          icon: '🃏',
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
      subtitle: "记录关于 AI 实践、行业赋能、产品设计与创业成长的深度思考。",
      viewAll: "在微信公众号阅读全部",
      readArticle: "阅读文章",
      posts: [
        {
          id: 'post-antigravity',
          title: '被Codex恶心后，Antigravity真的是版本答案了？',
          date: '2026年11月01日',
          excerpt: '深入剖析 Codex 用量限制与骚操作，全面评测 Google Antigravity 架构特点、多模型调用生态与超高性价比，探讨当前 AI 编程辅助工具的“版本答案”。',
          category: '深度评测',
          readTime: '5 分钟阅读',
          url: 'https://mp.weixin.qq.com/s/qT0VjSlxIyn0uTNTrx7H8Q'
        },
        {
          id: 'post-1',
          title: 'HKSIA第14期 | 香港秘书行业协会【AI赋能秘书公司转型升级】讲座圆满举办！',
          date: '2026年6月14日',
          excerpt: '香港秘书行业协会「AI赋能秘书公司转型升级」专题讲座在深圳福田圆满举办，围绕 AI 技术在秘书行业的实战落地展开深度分享。',
          category: '活动回顾',
          readTime: '4 分钟阅读',
          url: 'https://mp.weixin.qq.com/s/kQ3GYBjsXnouL8DilXJpcQ'
        },
        {
          id: 'post-2',
          title: '活动预告 | 香港秘书行业协会【AI赋能秘书公司转型升级:AI+秘书工具实战分享】讲座',
          date: '2026年5月25日',
          excerpt: '为紧跟人工智能发展浪潮，助力秘书行业实现数字化转型，特举办 AI 赋能秘书行业实战分享活动。',
          category: '活动预告',
          readTime: '3 分钟阅读',
          url: 'https://mp.weixin.qq.com/s/FVV186ZPk1t2hNUbVF1ziw'
        },
        {
          id: 'post-3',
          title: '他们嘲笑你的梦想，现在却在问你是怎么做到的……',
          date: '2025年4月06日',
          excerpt: 'Keep going 就能 WIN（赢），分享在创业与追梦旅途中的思考、韧性与坚持的力量。',
          category: '成长心路',
          readTime: '3 分钟阅读',
          url: 'https://mp.weixin.qq.com/s/sSDzbM0X5_HrWMNMyOkAmA'
        },
        {
          id: 'post-4',
          title: '你的AI行动顾问“干就完了bot”正式上线！',
          date: '2025年3月22日',
          excerpt: '告别踌躇，即刻启程：您的 AI 赋能行动顾问——“干就完了bot”正式亮相，助你击破拖延。',
          category: 'AI 产品',
          readTime: '3 分钟阅读',
          url: 'https://mp.weixin.qq.com/s/UPE42z0LCZW-GbSjbu_xLQ'
        },
        {
          id: 'post-5',
          title: '为什么第三届IPP取了个这么抽象的主题?',
          date: '2025年3月20日',
          excerpt: '深度探讨第三届 IPP 创意主题背后的构思故事、抽象隐喻与灵感来源。',
          category: '思考随笔',
          readTime: '4 分钟阅读',
          url: 'https://mp.weixin.qq.com/s/KHhlkuvYLhcEn09DoZpncw'
        }
      ]
    },
    music: {
      badge: "原创音乐特辑",
      trackType: "个人单曲",
      title: "音乐与创意作品",
      subtitle: "在代码与 AI 之外，用热血律动记录灵感与追梦的轨迹。",
      trackTitle: "干这属于我的精彩",
      artist: "BANANA PIES / CHUANG",
      description: "热血节奏，献给每一个敢想敢拼、打破常规的追梦者。即刻在各大音乐流媒体试听。",
      listenOn: "前往试听",
      platforms: [
        {
          id: 'qq-music',
          name: 'QQ 音乐',
          url: 'https://c6.y.qq.com/base/fcgi-bin/u?__=g0x92Xn59VU3',
          color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
        },
        {
          id: 'apple-music',
          name: 'Apple Music',
          url: 'https://music.apple.com/cn/album/%E5%B9%B2%E8%BF%99%E5%B1%9E%E4%BA%8E%E6%88%91%E7%9A%84%E7%B2%BE%E5%BD%A9/1830182307?i=1830182311&ls',
          color: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30'
        }
      ]
    },
    social: {
      badge: "全网社交矩阵",
      title: "社交矩阵",
      subtitle: "跨平台连接与关注我的最新开发成果、技术思考与日常动态。",
      qrBadge: "二维码",
      linkBadge: "外链",
      viewQr: "查看二维码",
      visitProfile: "前往主页",
      scanPrompt: "使用 App 扫码快速关注",
      close: "关闭",
      platforms: [
        {
          id: 'wechat',
          name: '微信公众号',
          handle: 'JustGanIt',
          description: '深度解析 AI 落地实践、全栈工具研发与高能生产力心法。',
          qrImage: '/wechat-qrcode.jpg',
          color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
          badgeColor: 'bg-emerald-500 text-white',
          type: 'qr',
        },
        {
          id: 'xiaohongshu',
          name: '小红书',
          handle: 'KeepGoingGan (小红书号: 42894296947)',
          description: '你所热爱的，就是你的生活。干想干的，成为自己。',
          qrImage: '/xiaohongshu-card.jpg',
          color: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30',
          badgeColor: 'bg-rose-500 text-white',
          type: 'qr',
        },
        {
          id: 'github',
          name: 'GitHub',
          handle: '@NBananapie',
          description: '开源项目、AI 应用、前端工程与个人作品全栈代码库。',
          url: 'https://github.com/NBananapie',
          color: 'bg-slate-500/10 text-slate-800 dark:text-slate-200 border-slate-500/30',
          badgeColor: 'bg-slate-900 dark:bg-white text-white dark:text-slate-900',
          type: 'link',
        },
        {
          id: 'x',
          name: 'X (Twitter)',
          handle: '@GanBananaReal',
          description: '实时科技动态、AI 深度观察与即兴灵感速递。',
          url: 'https://x.com/GanBananaReal',
          color: 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/30',
          badgeColor: 'bg-black dark:bg-white text-white dark:text-black',
          type: 'link',
        }
      ]
    },
    footer: {
      rights: "保留所有权利。"
    }
  }
};

export type TranslationKey = keyof TranslationSchema;
