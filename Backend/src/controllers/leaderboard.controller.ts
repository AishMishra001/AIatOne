import { Elysia } from "elysia";

interface CacheEntry {
  data: any;
  timestamp: number;
}

// In-memory cache for Hugging Face leaderboard requests
const leaderboardCache = new Map<string, CacheEntry>();
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes cache

async function handleGetLeaderboard({ query, error }: any) {
  try {
    const search = query.search || "";
    const orderby = query.orderby || `"Average ⬆️" DESC`;
    const type = query.type || "";
    const precision = query.precision || "";
    const moe = query.moe || "";
    const minParams = query.minParams || "";
    const maxParams = query.maxParams || "";
    const offset = parseInt(query.offset || "0", 10);
    const limit = parseInt(query.limit || "50", 10);

    // Limit maximum rows returned per request to prevent overloading
    const length = Math.min(limit, 100);

    // Build SQL conditions for the Hugging Face datasets-server filter query
    const conditions: string[] = [];

    if (search) {
      const cleanSearch = search.replace(/'/g, "''");
      conditions.push(`"fullname" LIKE '%${cleanSearch}%'`);
    }

    if (type) {
      let mappedType = "";
      if (type === "pretrained") mappedType = "pretrained";
      else if (type === "chat") mappedType = "chat models";
      else if (type === "fine-tuned") mappedType = "fine-tuned";
      else if (type === "merge") mappedType = "merged models";

      if (mappedType) {
        conditions.push(`"Type" LIKE '%${mappedType}%'`);
      }
    }

    if (minParams) {
      const parsedMin = parseFloat(minParams);
      if (!isNaN(parsedMin)) {
        conditions.push(`"#Params (B)" >= ${parsedMin}`);
      }
    }

    if (maxParams) {
      const parsedMax = parseFloat(maxParams);
      if (!isNaN(parsedMax)) {
        conditions.push(`"#Params (B)" <= ${parsedMax}`);
      }
    }

    if (moe === "true") {
      conditions.push(`"MoE"=true`);
    } else if (moe === "false") {
      conditions.push(`"MoE"=false`);
    }

    if (precision) {
      const cleanPrecision = precision.replace(/'/g, "''");
      conditions.push(`"Precision"='${cleanPrecision}'`);
    }

    const whereClause = conditions.length > 0 ? conditions.join(" AND ") : "";

    // Construct the Hugging Face datasets-server URL
    let hfUrl = `https://datasets-server.huggingface.co/filter?dataset=open-llm-leaderboard/contents&config=default&split=train&offset=${offset}&length=${length}`;

    if (whereClause) {
      hfUrl += `&where=${encodeURIComponent(whereClause)}`;
    }
    if (orderby) {
      hfUrl += `&orderby=${encodeURIComponent(orderby)}`;
    }

    const now = Date.now();

    // Cache clean-up if cache grows too large
    if (leaderboardCache.size > 150) {
      const cutoff = now - CACHE_DURATION;
      for (const [key, entry] of leaderboardCache.entries()) {
        if (entry.timestamp < cutoff) {
          leaderboardCache.delete(key);
        }
      }
    }

    // Check query cache
    const cached = leaderboardCache.get(hfUrl);
    if (cached && now - cached.timestamp < CACHE_DURATION) {
      console.log(`[Cache Hit] Serving leaderboard data for query: ${hfUrl}`);
      return cached.data;
    }

    console.log(`[Cache Miss] Fetching leaderboard from HF: ${hfUrl}`);
    const response = await fetch(hfUrl);

    if (!response.ok) {
      console.error(`Hugging Face API returned error status: ${response.status} ${response.statusText}`);
      
      // Attempt to return stale cache if available
      if (cached) {
        console.warn("[Cache Stale] Serving stale cache after Hugging Face API failure");
        return cached.data;
      }
      
      return error(response.status || 502, { 
        message: `Hugging Face API returned error: ${response.statusText}` 
      });
    }

    const data = await response.json();

    // Cache the successful response
    leaderboardCache.set(hfUrl, {
      data,
      timestamp: now
    });

    return data;
  } catch (err: any) {
    console.error("Exception in leaderboard controller:", err);
    return error(500, { message: err.message || "Internal server error fetching leaderboard" });
  }
}

// In-memory cache for LMSYS Arena leaderboard requests
const arenaCache = new Map<string, CacheEntry>();
const ARENA_CACHE_DURATION = 60 * 60 * 1000; // 1 hour caching for arena data

async function handleGetArenaLeaderboard({ query, error }: any) {
  try {
    const category = query.category || "text";
    const search = query.search || "";
    
    // Validate supported categories
    const validCategories = ["text", "code", "vision", "agent", "search"];
    if (!validCategories.includes(category)) {
      return error(400, { message: `Invalid category. Must be one of: ${validCategories.join(", ")}` });
    }

    const now = Date.now();
    const cacheKey = `${category}-${search}`;

    // Clean up expired cache
    if (arenaCache.size > 50) {
      const cutoff = now - ARENA_CACHE_DURATION;
      for (const [key, entry] of arenaCache.entries()) {
        if (entry.timestamp < cutoff) {
          arenaCache.delete(key);
        }
      }
    }

    // Check cache
    const cached = arenaCache.get(cacheKey);
    if (cached && now - cached.timestamp < ARENA_CACHE_DURATION) {
      console.log(`[Cache Hit] Serving Arena leaderboard for: ${cacheKey}`);
      return cached.data;
    }

    console.log(`[Cache Miss] Fetching Arena latest date...`);
    // 1. Get the latest date folder from latest.json
    const latestRes = await fetch("https://raw.githubusercontent.com/oolong-tea-2026/arena-ai-leaderboards/main/data/latest.json");
    if (!latestRes.ok) {
      console.error(`Failed to fetch Arena latest.json: ${latestRes.status} ${latestRes.statusText}`);
      if (cached) {
        console.warn("[Cache Stale] Serving stale Arena cache");
        return cached.data;
      }
      return error(502, { message: "Failed to resolve latest Chatbot Arena snapshot metadata" });
    }
    
    const latestData = await latestRes.json();
    const date = latestData.date || latestData.path; // e.g. "2026-06-30"
    if (!date) {
      throw new Error("Invalid latest date layout from github repository");
    }

    // 2. Fetch the category file e.g. text.json
    const dataUrl = `https://raw.githubusercontent.com/oolong-tea-2026/arena-ai-leaderboards/main/data/${date}/${category}.json`;
    console.log(`Fetching Arena rankings from: ${dataUrl}`);
    const dataRes = await fetch(dataUrl);
    if (!dataRes.ok) {
      console.error(`Failed to fetch Arena data file: ${dataRes.status} ${dataRes.statusText}`);
      if (cached) {
        console.warn("[Cache Stale] Serving stale Arena cache");
        return cached.data;
      }
      return error(502, { message: `Failed to fetch Chatbot Arena ${category} rankings snapshot` });
    }

    const rawData = await dataRes.json();
    let modelsList = rawData.models || [];

    // Filter by search term if requested
    if (search) {
      const searchLower = search.toLowerCase();
      modelsList = modelsList.filter((m: any) => 
        m.model?.toLowerCase().includes(searchLower) ||
        m.vendor?.toLowerCase().includes(searchLower)
      );
    }

    const payload = {
      meta: rawData.meta || {},
      date,
      models: modelsList
    };

    // Cache results
    arenaCache.set(cacheKey, {
      data: payload,
      timestamp: now
    });

    return payload;
  } catch (err: any) {
    console.error("Exception in Arena leaderboard controller:", err);
    if (cached) {
      console.warn("[Cache Stale] Serving stale Arena cache after exception");
      return cached.data;
    }
    return error(500, { message: err.message || "Internal server error fetching Arena rankings" });
  }
}

export const leaderboardController = new Elysia({ prefix: "/leaderboard" })
  .get("/", handleGetLeaderboard)
  .get("", handleGetLeaderboard)
  .get("/arena", handleGetArenaLeaderboard);
