import { Elysia } from "elysia";

interface CacheEntry {
  data: any;
  timestamp: number;
}

// In-memory cache for news feed
let newsCache: CacheEntry | null = null;
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

const MOCK_NEWS = {
  status: "ok",
  news: [
    {
      id: "ai-news-1",
      title: "Anthropic Releases Claude 3.5 Sonnet: Setting New Industry Benchmarks",
      description: "Anthropic has launched Claude 3.5 Sonnet, establishing a new state of the art for graduate-level reasoning, undergraduate-level knowledge, and coding proficiency. It operates at twice the speed of Claude 3 Opus at a fraction of the cost.",
      url: "https://www.anthropic.com/news/claude-3-5-sonnet",
      author: "Anthropic Team",
      image: "https://images.unsplash.com/photo-1677442136019-21780efad99a?w=800&auto=format&fit=crop&q=60",
      language: "en",
      category: ["technology"],
      published: new Date().toISOString(),
      source: "anthropic.com"
    },
    {
      id: "ai-news-2",
      title: "OpenAI Announces GPT-4o: Omni Model Integrating Text, Vision, and Audio",
      description: "OpenAI introduces GPT-4o, its newest flagship model that reasons across audio, vision, and text in real-time. GPT-4o accepts any combination of text, audio, and image inputs and generates text, audio, and image outputs.",
      url: "https://openai.com/index/gpt-4o-and-more-tools-to-chatgpt-free/",
      author: "OpenAI",
      image: "https://images.unsplash.com/photo-1684369175833-3d026938a16c?w=800&auto=format&fit=crop&q=60",
      language: "en",
      category: ["technology"],
      published: new Date(Date.now() - 3600000).toISOString(),
      source: "openai.com"
    },
    {
      id: "ai-news-3",
      title: "Google DeepMind Unveils Gemini 1.5 Pro with 2 Million Token Context Window",
      description: "Google's Gemini 1.5 Pro features a revolutionary long-context window, letting it process vast amounts of information including 1 hour of video, 11 hours of audio, codebases with over 30,000 lines of code, or upwards of 700,000 words.",
      url: "https://deepmind.google/technologies/gemini/",
      author: "Google DeepMind",
      image: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop&q=60",
      language: "en",
      category: ["technology"],
      published: new Date(Date.now() - 7200000).toISOString(),
      source: "deepmind.google"
    },
    {
      id: "ai-news-4",
      title: "Meta Open-Sources Llama 3.1: The Largest Openly Available Mixture-of-Experts Model",
      description: "Meta introduces Llama 3.1 405B, which they claim is the world's largest and most capable openly available foundation model. The model features improved multilingual capabilities, tool use, and stronger reasoning skills.",
      url: "https://ai.meta.com/blog/meta-llama-3-1/",
      author: "Meta AI",
      image: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=800&auto=format&fit=crop&q=60",
      language: "en",
      category: ["technology"],
      published: new Date(Date.now() - 14400000).toISOString(),
      source: "ai.meta.com"
    },
    {
      id: "ai-news-5",
      title: "Mistral AI Releases 'Large 2' Optimized for Advanced Multilingual Coding Tasks",
      description: "Mistral AI launches Mistral Large 2, a 123-billion parameter model boasting cutting-edge capabilities in multilingual tasks, advanced reasoning, mathematics, and code generation, rivaling closed models.",
      url: "https://mistral.ai/news/mistral-large-2407/",
      author: "Mistral AI Team",
      image: "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=800&auto=format&fit=crop&q=60",
      language: "en",
      category: ["technology"],
      published: new Date(Date.now() - 28800000).toISOString(),
      source: "mistral.ai"
    },
    {
      id: "ai-news-6",
      title: "xAI Launches Colossus: The Most Powerful AI Training Supercluster in the World",
      description: "Elon Musk's xAI has brought online 'Colossus', a massive AI training cluster powered by 100,000 liquid-cooled NVIDIA H100 GPUs. The system is designed to train the upcoming Grok 3 model.",
      url: "https://x.ai",
      author: "xAI Team",
      image: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&auto=format&fit=crop&q=60",
      language: "en",
      category: ["technology"],
      published: new Date(Date.now() - 43200000).toISOString(),
      source: "x.ai"
    }
  ]
};

async function handleGetNews({ error }: any) {
  try {
    const now = Date.now();
    
    // If cache is valid, use it
    if (newsCache && now - newsCache.timestamp < CACHE_DURATION) {
      console.log("Serving news from cache");
      return newsCache.data;
    }

    const apiKey = process.env.CURRENTS_API_KEY || "558347948c5016fbe7d0d91547771af9";
    console.log("Fetching news from Currents API...");
    
    // Build query to target AI/ML keywords
    const keywords = encodeURIComponent('"artificial intelligence" OR "machine learning" OR LLM OR "deep learning" OR OpenAI OR "generative AI"');
    const apiUrl = `https://api.currentsapi.services/v1/search?keywords=${keywords}&language=en&page_size=20&apiKey=${apiKey}`;

    const response = await fetch(apiUrl);
    if (!response.ok) {
      console.error("Currents API returned non-OK status:", response.status);
      if (newsCache) {
        console.warn("Serving stale news cache");
        return newsCache.data;
      }
      console.warn("Falling back to mock news data");
      return MOCK_NEWS;
    }

    const data = await response.json();
    
    // Check if the response actually contains news articles or if it's an error response (e.g. 401 status in JSON payload)
    if (data.status === "401" || data.status === "error" || !data.news || !Array.isArray(data.news)) {
      console.warn("Currents API returned error response:", data);
      if (newsCache) {
        return newsCache.data;
      }
      return MOCK_NEWS;
    }

    console.log("Successfully fetched news from Currents API. Count:", data.news?.length);
    
    // Format data slightly if necessary
    const formattedData = {
      status: "ok",
      news: data.news.map((item: any) => ({
        id: item.id || Math.random().toString(36).substr(2, 9),
        title: item.title || "No Title",
        description: item.description || "No description available.",
        url: item.url || "#",
        author: item.author || "Unknown",
        image: item.image || "https://images.unsplash.com/photo-1677442136019-21780efad99a?w=800&auto=format&fit=crop&q=60",
        language: item.language || "en",
        category: item.category || ["technology"],
        published: item.published || new Date().toISOString(),
        source: item.source || "Currents API"
      }))
    };

    // Update cache
    newsCache = {
      data: formattedData,
      timestamp: now
    };

    return formattedData;
  } catch (err: any) {
    console.error("Error in news controller:", err);
    if (newsCache) {
      console.warn("Exception while fetching news. Serving stale cache.", err);
      return newsCache.data;
    }
    return MOCK_NEWS;
  }
}

export const newsController = new Elysia({ prefix: "/news" })
  .get("/", handleGetNews)
  .get("", handleGetNews);
