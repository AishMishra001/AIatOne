import { Elysia } from "elysia";

interface CacheEntry {
  data: any;
  timestamp: number;
}

// In-memory cache for remote jobs
let jobsCache: CacheEntry | null = null;
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

async function handleGetJobs({ query, error }: any) {
  try {
    const now = Date.now();
    
    // If cache is valid, use it
    if (jobsCache && now - jobsCache.timestamp < CACHE_DURATION) {
      console.log("Serving jobs from cache");
      return filterAndRespond(jobsCache.data, query);
    }

    console.log("Fetching jobs from Remotive API...");
    // Fetch new data from Remotive API
    const response = await fetch("https://remotive.com/api/remote-jobs");
    if (!response.ok) {
      console.error("Remotive API returned non-OK status:", response.status);
      if (jobsCache) {
        console.warn("Remotive API failed. Serving stale cache.");
        return filterAndRespond(jobsCache.data, query);
      }
      return error(502, { message: `Failed to fetch jobs: ${response.statusText}` });
    }

    const data = await response.json();
    console.log("Successfully fetched jobs from Remotive. Count:", data.jobs?.length);
    
    // Update cache
    jobsCache = {
      data,
      timestamp: now
    };

    return filterAndRespond(data, query);
  } catch (err: any) {
    console.error("Error in jobs controller:", err);
    if (jobsCache) {
      console.warn("Exception while fetching jobs. Serving stale cache.", err);
      return filterAndRespond(jobsCache.data, query);
    }
    return error(500, { message: err.message || "An unexpected error occurred" });
  }
}

export const jobsController = new Elysia({ prefix: "/jobs" })
  .get("/", handleGetJobs)
  .get("", handleGetJobs); // Support both /api/jobs/ and /api/jobs

function filterAndRespond(data: any, query: Record<string, string | undefined>) {
  let jobs = data.jobs || [];

  // Flexible category filtering
  const category = query.category;
  if (category) {
    const cleanCategory = category.toLowerCase().replace(/[^a-z0-9]/g, "");
    jobs = jobs.filter((job: any) => {
      const jobCat = (job.category || "").toLowerCase().replace(/[^a-z0-9]/g, "");
      return jobCat.includes(cleanCategory) || cleanCategory.includes(jobCat);
    });
  }

  // Filter by search query if requested
  const search = query.search;
  if (search) {
    const searchLower = search.toLowerCase();
    jobs = jobs.filter((job: any) => 
      job.title?.toLowerCase().includes(searchLower) ||
      job.company_name?.toLowerCase().includes(searchLower) ||
      job.description?.toLowerCase().includes(searchLower) ||
      job.tags?.some((tag: string) => tag.toLowerCase().includes(searchLower))
    );
  }

  // Filter specifically for AI jobs if requested
  const aiOnly = query.aiOnly === "true";
  if (aiOnly) {
    const aiKeywords = [
      "ai", "machine learning", "ml", "deep learning", "llm", "neural", "nlp", 
      "computer vision", "gpt", "data scientist", "data science", "openai", 
      "anthropic", "cohere", "hugging face", "prompt", "artificial intelligence"
    ];
    jobs = jobs.filter((job: any) => {
      const titleLower = job.title?.toLowerCase() || "";
      const descriptionLower = job.description?.toLowerCase() || "";
      const categoryLower = job.category?.toLowerCase() || "";
      const tags = (job.tags || []).map((t: string) => t.toLowerCase());

      return aiKeywords.some(keyword => 
        titleLower.includes(keyword) || 
        categoryLower.includes(keyword) ||
        tags.some((tag: string) => tag.includes(keyword))
      );
    });
  }

  return {
    success: true,
    count: jobs.length,
    jobs: jobs.slice(0, 50) // Return top 50 jobs for better performance
  };
}
