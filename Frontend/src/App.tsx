import React, { useState, useEffect, useRef } from "react";
import { Auth } from "./components/Auth";
import { 
  Sparkles, 
  MessageSquare, 
  Rss, 
  LogOut, 
  ArrowUpRight, 
  ChevronRight, 
  Send, 
  User, 
  Lock, 
  Terminal, 
  Zap, 
  Briefcase,
  TrendingUp,
  Cpu
} from "lucide-react";

// Types
interface Article {
  id: number;
  title: string;
  excerpt: string;
  content: string;
  category: "announcements" | "jobs" | "trends" | "tools";
  date: string;
  readTime: string;
}

interface Message {
  sender: "user" | "bot";
  text: string;
  time: string;
}

interface LiveUpdate {
  id: number;
  type: "announcements" | "jobs" | "trends" | "tools";
  title: string;
  timeAgo: string;
  source: string;
}

// Mock Data
const MOCK_ARTICLES: Article[] = [
  {
    id: 1,
    title: "OpenAI Announces Project Strawberry: Advanced Reasoning Upgrades",
    excerpt: "A deep dive into OpenAI's latest reasoning upgrades enabling self-improving code pipelines and logic capabilities.",
    content: "OpenAI has officially unveiled its new reasoning-focused updates, internally codenamed Project Strawberry. This architecture represents a significant departure from standard next-token prediction, incorporating planning stages and multi-step validation checks before producing output. Developers have reported substantial performance boosts on complex software engineering benchmarks and mathematical proofs.",
    category: "announcements",
    date: "June 28, 2026",
    readTime: "4 min read"
  },
  {
    id: 2,
    title: "Anthropic Releases Claude 4: The Next Frontier in Coding Agency",
    excerpt: "Claude 4 sets a new standard for fully agentic workflows, displaying direct file-system execution and terminal control.",
    content: "Anthropic's latest model, Claude 4, is now live. Designed from the ground up for agentic execution, it features a native sandboxed environment allowing the model to write, compile, and execute full-stack code independently. The model scored 87% on the SWE-bench verified dataset, eclipsing all previous systems.",
    category: "announcements",
    date: "June 27, 2026",
    readTime: "5 min read"
  },
  {
    id: 3,
    title: "Senior AI Researcher - Google DeepMind",
    excerpt: "Location: London, UK / Hybrid. Salary: £180,000 - £260,000 + Equity. Join the team building the next generation of AlphaFold models.",
    content: "Google DeepMind is looking for a Senior AI Researcher to drive breakthroughs in physical intelligence and biological modeling. Candidates should have a strong publication record in top-tier machine learning conferences (NeurIPS, ICML, ICLR) and hands-on experience scaling large multi-modal architectures.",
    category: "jobs",
    date: "June 28, 2026",
    readTime: "3 min read"
  },
  {
    id: 4,
    title: "Lead Prompt Engineer & Agent architect - Anthropic",
    excerpt: "Location: San Francisco, CA. Salary: $250,000 - $370,000. Design state-of-the-art system prompts and agentic behaviors.",
    content: "Anthropic is hiring a Lead Prompt Engineer to spearhead system instruction design for Claude. You will collaborate directly with model training teams to create robust, jailbreak-resistant instructions and structure output formats for external tool integration.",
    category: "jobs",
    date: "June 26, 2026",
    readTime: "2 min read"
  },
  {
    id: 5,
    title: "The Rise of Small, Local Models (SLMs) in Enterprise",
    excerpt: "Why companies are shifting away from massive APIs and adopting fine-tuned 8B models running locally on-premise.",
    content: "Enterprise architectures are witnessing a rapid shift. Rather than routing sensitive client data to external cloud APIs, organizations are deploying open weights models like Llama 3 8B and Phi 3. These models are heavily fine-tuned on company documents, and when deployed locally, they reduce latency by 60% and ensure absolute data privacy.",
    category: "trends",
    date: "June 28, 2026",
    readTime: "6 min read"
  },
  {
    id: 6,
    title: "Vector DB Optimization: HNSW vs. IVF-PQ Indexing",
    excerpt: "An in-depth analysis of retrieval speeds and memory footprints under different indexing structures.",
    content: "As RAG pipelines scale, vector search latency becomes a major bottleneck. This article compares Hierarchical Navigable Small World (HNSW) graphs against Inverted File with Product Quantization (IVF-PQ). We explore how memory constraints dictate index choices and provide performance benchmarks.",
    category: "trends",
    date: "June 25, 2026",
    readTime: "8 min read"
  },
  {
    id: 7,
    title: "Bolt.new: Instant Full-Stack App Creator",
    excerpt: "A look into the browser-based IDE that spins up complete React + Node.js backends from a single natural language prompt.",
    content: "Bolt.new has taken the developer community by storm. By compiling Node modules inside WebContainers in the browser, it allows users to boot up a full-stack project, edit files dynamically, and deploy directly to Netlify/Vercel with a single click, all controlled by an AI chat assistant.",
    category: "tools",
    date: "June 28, 2026",
    readTime: "3 min read"
  },
  {
    id: 8,
    title: "v0.dev Upgraded: Figma Designs to Fully Operational Code",
    excerpt: "Vercel's generative UI tool now integrates Figma APIs, outputting clean, production-ready Tailwind Components.",
    content: "Vercel has released a major upgrade to v0.dev. Developers can now paste raw Figma file URLs directly into the chat prompt. The assistant parses the layout hierarchy, color tokens, and styling constraints, returning modular, fully-typed React code with Tailwind CSS classes.",
    category: "tools",
    date: "June 24, 2026",
    readTime: "4 min read"
  }
];

const INITIAL_LIVE_UPDATES: LiveUpdate[] = [
  { id: 1, type: "announcements", title: "OpenAI releases GPT-4o-mini globally", timeAgo: "1m ago", source: "OpenAI Blog" },
  { id: 2, type: "jobs", title: "ML Engineering Lead posted by Meta ($320k)", timeAgo: "5m ago", source: "Meta Careers" },
  { id: 3, type: "trends", title: "LLMs in assembly code compilation spikes in popularity", timeAgo: "12m ago", source: "GitHub Trends" },
  { id: 4, type: "tools", title: "Vite 6.0 launches with native Bun bundling support", timeAgo: "22m ago", source: "Vite Core" },
];

const CHAT_AGENT_METADATA = {
  announcements: {
    name: "Announcements Bot",
    role: "AI Announcements & Updates Agent",
    welcome: "Hello! I am your AI Announcements Agent. Ask me about new LLM releases, compute clusters, hardware breakthroughs, or tech events!",
    placeholder: "Ask about OpenAI, Anthropic, Google, hardware...",
    mockResponses: [
      "OpenAI's Project Strawberry is the hottest announcement right now, focusing on active search and planning during execution.",
      "Google Gemini 1.5 Pro now supports up to 2 million tokens of context, perfect for digesting large codebases.",
      "NVIDIA's Blackwell B200 GPUs are shipping now, offering up to 20 petaflops of FP4 performance for LLM training.",
      "Llama 3.1 405B continues to lead as the premier open-weights model, rivaling closed models on multiple benchmarks."
    ]
  },
  jobs: {
    name: "Jobs Bot",
    role: "AI Careers & Talent Agent",
    welcome: "Hi! I am the Job Updates Agent. I track salary trends, senior ML openings, remote contracts, and hiring companies.",
    placeholder: "Search for jobs, salaries, remote opportunities...",
    mockResponses: [
      "Currently, ML infrastructure engineers are seeing the highest starting salaries, averaging $220k - $340k in San Francisco.",
      "Anthropic has open remote-friendly positions for Prompt Engineers and Safety Researchers.",
      "Remote AI contract roles are surging, especially for fine-tuning specific models like Mistral-7B for localized enterprise tasks.",
      "Google DeepMind London has actively open positions in AI for BioTech and quantum chemistry modeling."
    ]
  },
  trends: {
    name: "Trends Bot",
    role: "AI Trends & Research Agent",
    welcome: "Welcome! I'm the AI Trends Agent. I monitor academic research papers, Github repositories, and architectural shifts.",
    placeholder: "Ask about RAG, small models, fine-tuning, agent frameworks...",
    mockResponses: [
      "The massive trend right now is shifting from giant cloud APIs to fine-tuned local models (like Llama-3 8B) running on-premise.",
      "RAG is evolving fast. Traditional vector databases are being augmented with GraphRAG to map entity relationships.",
      "Mixture of Agents (MoA) frameworks are proving that combining outputs from multiple smaller models beats a single large model.",
      "AI coding agents (like Cursor, Bolt, and Antigravity) are changing software development from manual typing to design-level code editing."
    ]
  },
  tools: {
    name: "Tools Bot",
    role: "AI Tools & Frameworks Agent",
    welcome: "Hello! I am the AI Tools Agent. I track developer libraries, front-end code generation platforms, and UI builders.",
    placeholder: "Inquire about new frameworks, coding assistants, libraries...",
    mockResponses: [
      "Bolt.new is a trending tool that runs Node.js inside the browser using WebContainers to create and launch full apps.",
      "Vercel's v0.dev is dominating front-end design generation, converting screenshots directly to Tailwind CSS components.",
      "Elysiajs has become a top backend framework for Bun due to its ultra-fast request throughput and type safety.",
      "OpenRouter is widely used for accessing multiple free and premium LLMs via a single unified API endpoint."
    ]
  }
};

export default function App() {
  // Authentication State
  const [token, setToken] = useState<string | null>(localStorage.getItem("token"));
  const [userEmail, setUserEmail] = useState<string | null>(localStorage.getItem("userEmail"));
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Articles State
  const [activeArticleTab, setActiveArticleTab] = useState<"announcements" | "jobs" | "trends" | "tools">("announcements");
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);

  // Chatbots State
  const [activeChatbot, setActiveChatbot] = useState<"announcements" | "jobs" | "trends" | "tools">("announcements");
  const [chatHistories, setChatHistories] = useState<Record<string, Message[]>>({
    announcements: [{ sender: "bot", text: CHAT_AGENT_METADATA.announcements.welcome, time: "Just now" }],
    jobs: [{ sender: "bot", text: CHAT_AGENT_METADATA.jobs.welcome, time: "Just now" }],
    trends: [{ sender: "bot", text: CHAT_AGENT_METADATA.trends.welcome, time: "Just now" }],
    tools: [{ sender: "bot", text: CHAT_AGENT_METADATA.tools.welcome, time: "Just now" }]
  });
  const [chatInput, setChatInput] = useState("");
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Live Updates State
  const [liveUpdates, setLiveUpdates] = useState<LiveUpdate[]>(INITIAL_LIVE_UPDATES);

  // Scroll Chat to bottom
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistories, activeChatbot]);

  // Simulate dynamically updating real-time feed
  useEffect(() => {
    const interval = setInterval(() => {
      const titles = {
        announcements: [
          "Meta hints at Llama 4 training progress on 100k H100 cluster",
          "xAI launches Colossus supercluster in Memphis",
          "Mistral AI introduces Large 2 model with multilingual optimization"
        ],
        jobs: [
          "Senior Frontend Developer (Next.js) role open at Cohere ($160k - $220k)",
          "Applied ML Specialist hired at OpenAI (San Francisco)",
          "Prisma Team searching for database engineer with Neon experience"
        ],
        trends: [
          "Local-first RAG setups spike 40% in enterprise projects",
          "Fine-tuning vs. RAG debate heats up on Twitter/X tech circles",
          "Interest in Bun + Elysia server deployments grows rapidly"
        ],
        tools: [
          "shadcn/ui updates charts component library with interactive animations",
          "LangChain releases upgraded routing agent framework v0.3",
          "Antigravity AI coding assistant updates code generation accuracy"
        ]
      };

      const categories: ("announcements" | "jobs" | "trends" | "tools")[] = ["announcements", "jobs", "trends", "tools"];
      const selectedCategory = categories[Math.floor(Math.random() * categories.length)];
      const titleOptions = titles[selectedCategory];
      const selectedTitle = titleOptions[Math.floor(Math.random() * titleOptions.length)];
      
      const newUpdate: LiveUpdate = {
        id: Date.now(),
        type: selectedCategory,
        title: selectedTitle,
        timeAgo: "Just now",
        source: selectedCategory === "announcements" ? "AI News" : 
                selectedCategory === "jobs" ? "TechJobs" :
                selectedCategory === "trends" ? "HackerNews" : "ProductHunt"
      };

      setLiveUpdates(prev => [newUpdate, ...prev.slice(0, 5)]);
    }, 12000);

    return () => clearInterval(interval);
  }, []);

  const handleAuthSuccess = (newToken: string, email: string) => {
    localStorage.setItem("token", newToken);
    localStorage.setItem("userEmail", email);
    setToken(newToken);
    setUserEmail(email);
    setShowAuthModal(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userEmail");
    setToken(null);
    setUserEmail(null);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      setShowAuthModal(true);
      return;
    }
    if (!chatInput.trim()) return;

    const userMsg: Message = {
      sender: "user",
      text: chatInput,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const currentAgent = CHAT_AGENT_METADATA[activeChatbot];
    const botAnswers = currentAgent.mockResponses;
    const randomAnswer = botAnswers[Math.floor(Math.random() * botAnswers.length)];

    const botMsg: Message = {
      sender: "bot",
      text: randomAnswer,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setChatHistories(prev => ({
      ...prev,
      [activeChatbot]: [...prev[activeChatbot], userMsg]
    }));
    setChatInput("");

    // Simulate Agent typing delay
    setTimeout(() => {
      setChatHistories(prev => ({
        ...prev,
        [activeChatbot]: [...prev[activeChatbot], botMsg]
      }));
    }, 800);
  };

  const filteredArticles = MOCK_ARTICLES.filter(a => a.category === activeArticleTab);

  return (
    <div className="min-h-screen bg-darkBg text-lightAccent flex flex-col font-satoshi selection:bg-lightAccent selection:text-darkBg">
      
      {/* 1. Header & Navigation */}
      <header className="sticky top-0 z-40 bg-darkBg/80 backdrop-blur-md border-b border-borderGray">
        <div className="max-w-[1480px] mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-lightAccent text-darkBg flex items-center justify-center font-extrabold text-xl tracking-tighter">
              A1
            </div>
            <div>
              <span className="font-extrabold text-lg tracking-tight block">AI at One</span>
              <span className="text-[10px] text-gray-500 uppercase tracking-widest block -mt-1 font-bold">Intelligence Hub</span>
            </div>
          </div>

          {/* Nav links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-textGray">
            <a href="#articles" className="hover:text-lightAccent transition-colors">Daily Articles</a>
            <a href="#chatbots" className="hover:text-lightAccent transition-colors">Specialized Chatbots</a>
            <a href="#live-feed" className="hover:text-lightAccent transition-colors">Live Feed</a>
            <a href="#tech-stack" className="hover:text-lightAccent transition-colors">Architecture Stack</a>
          </nav>

          {/* Right Action buttons */}
          <div className="flex items-center gap-4">
            {token ? (
              <div className="flex items-center gap-3 bg-darkCard border border-borderGray px-4 py-2 rounded-xl">
                <div className="w-6 h-6 rounded-full bg-[#1c1c1c] border border-borderGray flex items-center justify-center text-[10px]">
                  <User size={12} className="text-lightAccent" />
                </div>
                <span className="text-xs font-semibold text-textGray truncate max-w-[120px]">{userEmail}</span>
                <button 
                  onClick={handleLogout}
                  className="text-gray-500 hover:text-red-400 transition-colors pl-2 border-l border-borderGray"
                  title="Sign Out"
                >
                  <LogOut size={16} />
                </button>
              </div>
            ) : (
              <button 
                onClick={() => setShowAuthModal(true)}
                className="bg-lightAccent text-darkBg hover:bg-white active:scale-95 font-bold text-sm px-5 py-2.5 rounded-xl transition-all duration-200"
              >
                Getting Started
              </button>
            )}
          </div>
        </div>
      </header>

      {/* 2. Hero Section */}
      <section className="relative min-h-[70vh] flex flex-col items-center justify-center text-center px-6 py-20 overflow-hidden border-b border-borderGray">
        {/* Subtle grid background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#212121_1px,transparent_1px),linear-gradient(to_bottom,#212121_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-30 pointer-events-none"></div>
        
        {/* Glow point */}
        <div className="absolute top-0 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl -z-10 pointer-events-none"></div>

        <div className="max-w-4xl mx-auto space-y-8 relative z-10">
          {/* Badge */}
          <div className="inline-flex items-center gap-1.5 bg-[#121212] border border-borderGray px-3 py-1.5 rounded-full text-xs font-bold text-gray-400 tracking-wider uppercase">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            ALL OF AI. AT ONE PLACE.
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-[1.05] text-lightAccent">
            All AI Announcements, <br/>
            <span className="text-gray-500">Trends & Jobs. In One Place.</span>
          </h1>

          <p className="text-lg md:text-xl text-textGray max-w-2xl mx-auto font-medium leading-relaxed">
            Stay ahead of the curve with daily AI-generated briefings, interactive specialized chatbot agents, and real-time live-streams of industry events.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            {token ? (
              <a 
                href="#chatbots" 
                className="w-full sm:w-auto bg-lightAccent text-darkBg hover:bg-white active:scale-95 font-extrabold text-base px-8 py-4 rounded-xl flex items-center justify-center gap-2 transition-all duration-200"
              >
                <span>Enter Dashboard Workspace</span>
                <ArrowUpRight size={18} />
              </a>
            ) : (
              <button 
                onClick={() => setShowAuthModal(true)}
                className="w-full sm:w-auto bg-lightAccent text-darkBg hover:bg-white active:scale-95 font-extrabold text-base px-8 py-4 rounded-xl flex items-center justify-center gap-2 transition-all duration-200 shadow-[0_0_30px_rgba(254,255,245,0.15)]"
              >
                <span>Get Started with Google</span>
                <ArrowUpRight size={18} />
              </button>
            )}
            
            <a 
              href="#articles" 
              className="w-full sm:w-auto border border-borderGray hover:border-lightAccent bg-darkCard/50 hover:bg-darkCard active:scale-95 font-extrabold text-base px-8 py-4 rounded-xl transition-all duration-200"
            >
              Explore Features
            </a>
          </div>

          {/* Social Proof/Tech stack badges */}
          <div className="pt-12 flex flex-wrap justify-center items-center gap-x-8 gap-y-4 text-xs font-semibold text-gray-500 uppercase tracking-widest">
            <span>Powered by Bun & Elysia</span>
            <span className="w-1.5 h-1.5 rounded-full bg-borderGray"></span>
            <span>RAG Query Pipeline</span>
            <span className="w-1.5 h-1.5 rounded-full bg-borderGray"></span>
            <span>Redis Cache</span>
            <span className="w-1.5 h-1.5 rounded-full bg-borderGray"></span>
            <span>Postgres DB</span>
          </div>
        </div>
      </section>

      {/* 3. Main Workspace / Pitch Sections */}
      <main className="max-w-[1480px] w-full mx-auto px-6 py-16 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column - Articles & Chatbots (8 cols) */}
        <div className="lg:col-span-8 space-y-16">
          
          {/* Section A: Daily AI Articles */}
          <section id="articles" className="space-y-6">
            <div className="flex items-center gap-2">
              <Sparkles size={20} className="text-lightAccent" />
              <h2 className="text-2xl font-bold tracking-tight">AI Generated Articles</h2>
              <span className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-extrabold tracking-wider uppercase px-2 py-0.5 rounded">Daily Updates</span>
            </div>

            {/* Category selection tabs */}
            <div className="flex flex-wrap gap-2 border-b border-borderGray pb-3">
              {(["announcements", "jobs", "trends", "tools"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => {
                    setActiveArticleTab(tab);
                    setSelectedArticle(null);
                  }}
                  className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg border transition-all ${
                    activeArticleTab === tab
                      ? "bg-lightAccent text-darkBg border-lightAccent font-extrabold"
                      : "bg-transparent border-borderGray text-gray-400 hover:border-gray-600"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Articles Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredArticles.map((article) => (
                <div
                  key={article.id}
                  onClick={() => setSelectedArticle(article)}
                  className="bg-darkCard hover:bg-[#161616] border border-borderGray hover:border-gray-700 rounded-xl p-5 cursor-pointer flex flex-col justify-between transition-all duration-200 group"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-[11px] font-semibold text-gray-500">
                      <span>{article.date}</span>
                      <span>{article.readTime}</span>
                    </div>
                    <h3 className="font-bold text-base leading-snug group-hover:text-lightAccent transition-colors">
                      {article.title}
                    </h3>
                    <p className="text-gray-400 text-xs line-clamp-3">
                      {article.excerpt}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-lightAccent pt-4">
                    <span>Read Full Article</span>
                    <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Section B: Specialized AI Chatbots */}
          <section id="chatbots" className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare size={20} className="text-lightAccent" />
                <h2 className="text-2xl font-bold tracking-tight">Specialized Chatbots</h2>
              </div>
              
              {!token && (
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-yellow-500 bg-yellow-500/10 border border-yellow-500/20 px-2.5 py-1 rounded">
                  <Lock size={12} />
                  <span>Lock State: Read-Only Preview</span>
                </div>
              )}
            </div>

            {/* Chat view framework container */}
            <div className="border border-borderGray rounded-xl overflow-hidden grid grid-cols-1 md:grid-cols-4 min-h-[500px]">
              
              {/* Bots Sidebar (1 col on desktop) */}
              <div className="bg-[#121212] border-b md:border-b-0 md:border-r border-borderGray p-3 space-y-2">
                <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest px-2.5 py-1.5">
                  Select Bot Agent
                </div>
                {(["announcements", "jobs", "trends", "tools"] as const).map((category) => {
                  const botInfo = CHAT_AGENT_METADATA[category];
                  const isActive = activeChatbot === category;
                  return (
                    <button
                      key={category}
                      onClick={() => {
                        setActiveChatbot(category);
                      }}
                      className={`w-full flex flex-col items-start p-3 rounded-lg text-left transition-all ${
                        isActive 
                          ? "bg-darkCard border border-borderGray text-lightAccent" 
                          : "hover:bg-darkCard/40 text-gray-500 border border-transparent"
                      }`}
                    >
                      <span className="text-xs font-bold uppercase tracking-wide">{botInfo.name}</span>
                      <span className="text-[10px] text-gray-400 mt-0.5 line-clamp-1">{category} bot</span>
                    </button>
                  );
                })}
              </div>

              {/* Chat Content Panel (3 cols on desktop) */}
              <div className="md:col-span-3 bg-darkCard flex flex-col justify-between">
                
                {/* Active Bot Header */}
                <div className="bg-[#181818] border-b border-borderGray px-5 py-3.5 flex items-center justify-between">
                  <div>
                    <h4 className="font-extrabold text-sm text-lightAccent">
                      {CHAT_AGENT_METADATA[activeChatbot].name}
                    </h4>
                    <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block">
                      {CHAT_AGENT_METADATA[activeChatbot].role}
                    </span>
                  </div>
                  
                  {token && (
                    <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                      Active Session
                    </span>
                  )}
                </div>

                {/* Message Log View */}
                <div className="flex-1 p-5 overflow-y-auto space-y-4 max-h-[340px] min-h-[300px]">
                  {chatHistories[activeChatbot].map((msg, index) => (
                    <div 
                      key={index} 
                      className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}
                    >
                      <div className={`max-w-[80%] rounded-xl p-3 text-xs leading-relaxed ${
                        msg.sender === "user" 
                          ? "bg-lightAccent text-darkBg font-bold rounded-tr-none" 
                          : "bg-[#181818] border border-borderGray text-lightAccent rounded-tl-none"
                      }`}>
                        {msg.text}
                      </div>
                      <span className="text-[9px] text-gray-600 mt-1 px-1">{msg.time}</span>
                    </div>
                  ))}
                  <div ref={chatBottomRef} />
                </div>

                {/* Input Text Form */}
                <div className="p-4 border-t border-borderGray bg-[#181818]">
                  {token ? (
                    <form onSubmit={handleSendMessage} className="flex gap-2">
                      <input
                        type="text"
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        placeholder={CHAT_AGENT_METADATA[activeChatbot].placeholder}
                        className="flex-1 bg-[#121212] border border-borderGray focus:border-lightAccent rounded-lg px-4 py-2.5 text-xs focus:outline-none transition-colors"
                      />
                      <button
                        type="submit"
                        className="bg-lightAccent hover:bg-white text-darkBg p-2.5 rounded-lg transition-colors"
                      >
                        <Send size={16} />
                      </button>
                    </form>
                  ) : (
                    <div className="text-center py-2">
                      <p className="text-xs text-gray-500 font-bold mb-2">
                        🔒 Sign in with Google to start conversing with AI agents.
                      </p>
                      <button
                        onClick={() => setShowAuthModal(true)}
                        className="bg-lightAccent text-darkBg hover:bg-white text-xs font-extrabold px-4 py-2 rounded-lg transition-colors active:scale-95 inline-flex items-center gap-1.5"
                      >
                        <Zap size={12} />
                        <span>Unlock Chatbot Console</span>
                      </button>
                    </div>
                  )}
                </div>

              </div>

            </div>
          </section>

        </div>

        {/* Right Column - Live Updates Feed & Tech Stack Pitch (4 cols) */}
        <div className="lg:col-span-4 space-y-8">
          
          {/* Section C: Real-Time Updates */}
          <section id="live-feed" className="bg-darkCard border border-borderGray rounded-xl p-6 space-y-6">
            <div className="flex items-center gap-2 pb-4 border-b border-borderGray">
              <Rss size={20} className="text-lightAccent" />
              <div>
                <h3 className="font-extrabold text-base text-lightAccent">Real-time updates</h3>
                <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block">Live Stream Feed</span>
              </div>
            </div>

            <div className="space-y-4">
              {liveUpdates.map((update) => (
                <div 
                  key={update.id} 
                  className="text-xs flex gap-3 items-start border-b border-[#1c1c1c] pb-3 last:border-0 last:pb-0"
                >
                  <div className="mt-0.5">
                    {update.type === "announcements" && <Cpu size={14} className="text-blue-400" />}
                    {update.type === "jobs" && <Briefcase size={14} className="text-purple-400" />}
                    {update.type === "trends" && <TrendingUp size={14} className="text-emerald-400" />}
                    {update.type === "tools" && <Zap size={14} className="text-yellow-400" />}
                  </div>
                  <div className="space-y-1 flex-1">
                    <p className="text-lightAccent font-semibold leading-snug">
                      {update.title}
                    </p>
                    <div className="flex items-center justify-between text-[10px] text-gray-500">
                      <span>{update.source}</span>
                      <span className="font-bold text-[#454545]">{update.timeAgo}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Architecture Stack Details */}
          <section id="tech-stack" className="bg-darkCard border border-borderGray rounded-xl p-6 space-y-6">
            <div className="flex items-center gap-2 pb-4 border-b border-borderGray">
              <Terminal size={18} className="text-lightAccent" />
              <h3 className="font-extrabold text-base text-lightAccent">System Architecture</h3>
            </div>

            <div className="space-y-4 text-xs">
              <div className="space-y-1">
                <span className="text-gray-500 font-bold uppercase tracking-widest text-[9px] block">RAG pipeline</span>
                <p className="text-lightAccent font-medium">OpenRouter Free Models with PostgreSQL PGVector storage to ingest and query latest bulletins.</p>
              </div>

              <div className="space-y-1">
                <span className="text-gray-500 font-bold uppercase tracking-widest text-[9px] block">High Performance Backend</span>
                <p className="text-lightAccent font-medium">Bun runtime coupled with Elysia web framework serving requests at sub-millisecond latency.</p>
              </div>

              <div className="space-y-1">
                <span className="text-gray-500 font-bold uppercase tracking-widest text-[9px] block">Database & Cache layer</span>
                <p className="text-lightAccent font-medium">Neon serverless PostgreSQL database running migrations with Prisma ORM. Redis tracks rate-limits.</p>
              </div>
            </div>
          </section>

        </div>

      </main>

      {/* 4. Footer */}
      <footer className="mt-auto border-t border-borderGray bg-[#0d0d0d] py-12 px-6">
        <div className="max-w-[1480px] mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-gray-500">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-lightAccent text-darkBg flex items-center justify-center font-bold text-xs">
              A1
            </div>
            <span className="font-bold text-lightAccent">AI at One</span>
            <span>© 2026. All rights reserved.</span>
          </div>

          <div className="flex gap-6 font-semibold">
            <a href="#articles" className="hover:text-lightAccent transition-colors">Articles</a>
            <a href="#chatbots" className="hover:text-lightAccent transition-colors">Chatbots</a>
            <a href="#live-feed" className="hover:text-lightAccent transition-colors">Live Feed</a>
            <a href="#tech-stack" className="hover:text-lightAccent transition-colors">Stack</a>
          </div>
        </div>
      </footer>

      {/* 5. Auth Modal Overlay */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <Auth 
            onAuthSuccess={handleAuthSuccess} 
            onClose={() => setShowAuthModal(false)}
          />
        </div>
      )}

      {/* 6. Article Reader Modal */}
      {selectedArticle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-[#121212] border border-borderGray rounded-2xl w-full max-w-[600px] p-8 shadow-2xl relative max-h-[85vh] overflow-y-auto">
            <button
              onClick={() => setSelectedArticle(null)}
              className="absolute top-4 right-4 text-gray-500 hover:text-lightAccent transition-colors text-lg font-bold"
            >
              ✕
            </button>
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="bg-lightAccent text-darkBg text-[10px] font-extrabold uppercase px-2 py-0.5 rounded">
                  {selectedArticle.category}
                </span>
                <span className="text-xs text-gray-500">{selectedArticle.date}</span>
              </div>
              <h2 className="text-2xl font-extrabold tracking-tight text-lightAccent leading-tight">
                {selectedArticle.title}
              </h2>
              <div className="border-t border-borderGray pt-4 text-sm text-textGray leading-relaxed space-y-4">
                {selectedArticle.content.split("\n\n").map((para, i) => (
                  <p key={i}>{para}</p>
                ))}
              </div>
              
              {!token && (
                <div className="bg-yellow-500/10 border border-yellow-500/20 text-yellow-500/90 rounded-xl p-4 mt-6 text-xs flex flex-col gap-2">
                  <div className="flex items-center gap-2 font-bold">
                    <Lock size={14} />
                    <span>Locked features details</span>
                  </div>
                  <p className="text-gray-400">
                    Sign in to unlock interactive RAG citation links, automatic vector queries, and to discuss this update with the specialized bots!
                  </p>
                  <button
                    onClick={() => {
                      setSelectedArticle(null);
                      setShowAuthModal(true);
                    }}
                    className="bg-lightAccent text-darkBg hover:bg-white text-xs font-extrabold py-2 px-4 rounded-lg w-fit mt-2 transition-colors active:scale-95"
                  >
                    Authenticate Now
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
