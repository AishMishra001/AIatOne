import React, { useState, useEffect } from "react";
import { 
  Search, 
  RefreshCw, 
  ChevronRight, 
  ArrowUpRight, 
  X, 
  Cpu, 
  ChevronDown, 
  ChevronUp, 
  Heart,
  Award
} from "lucide-react";

interface ModelRow {
  eval_name: string;
  fullname: string;
  Precision: string;
  Type: string;
  T: string;
  "Weight type": string;
  Architecture: string;
  "Model sha": string;
  "Average ⬆️": number;
  "Hub License": string;
  "Hub ❤️": number;
  "#Params (B)": number;
  "Available on the hub": boolean;
  MoE: boolean;
  "CO₂ cost (kg)": number | null;
  "IFEval": number;
  "BBH": number;
  "MATH Lvl 5": number;
  "GPQA": number;
  "MUSR": number;
  "MMLU-PRO": number;
  "Upload To Hub Date": string;
  "Submission Date": string;
  "Base Model": string;
}

interface ArenaModel {
  rank: number;
  model: string;
  vendor: string;
  license: string;
  score: number;
  ci: number;
  votes: number;
}

interface LeaderboardProps {
  onBackToHome: () => void;
}

export function Leaderboard({ onBackToHome }: LeaderboardProps) {
  // Navigation Tab State
  const [activeLeaderboardTab, setActiveLeaderboardTab] = useState<"arena" | "open-llm">("arena");

  // Shared Search States
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");

  // ==========================================
  // HF OPEN LLM LEADERBOARD STATE
  // ==========================================
  const [type, setType] = useState("");
  const [precision, setPrecision] = useState("");
  const [moe, setMoe] = useState("");
  const [sizeRange, setSizeRange] = useState(""); 
  const [sortField, setSortField] = useState("Average ⬆️");
  const [sortDirection, setSortDirection] = useState<"ASC" | "DESC">("DESC");
  const [offset, setOffset] = useState(0);
  const limit = 50;
  const [models, setModels] = useState<ModelRow[]>([]);
  const [totalModelsCount, setTotalModelsCount] = useState(0);
  const [selectedModel, setSelectedModel] = useState<ModelRow | null>(null);

  // ==========================================
  // LMSYS ARENA LEADERBOARD STATE
  // ==========================================
  const [arenaCategory, setArenaCategory] = useState("text");
  const [arenaModels, setArenaModels] = useState<ArenaModel[]>([]);
  const [arenaDate, setArenaDate] = useState("");
  const [selectedArenaModel, setSelectedArenaModel] = useState<ArenaModel | null>(null);
  const [arenaSortField, setArenaSortField] = useState("rank");
  const [arenaSortDirection, setArenaSortDirection] = useState<"ASC" | "DESC">("ASC");

  // Core Loading & Error States
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch Hugging Face rankings
  const fetchHFLeaderboard = async () => {
    setLoading(true);
    setError(null);
    try {
      const queryParams = new URLSearchParams();
      queryParams.append("offset", offset.toString());
      queryParams.append("limit", limit.toString());
      
      if (search) queryParams.append("search", search);
      if (type) queryParams.append("type", type);
      if (precision) queryParams.append("precision", precision);
      if (moe) queryParams.append("moe", moe);

      if (sizeRange === "under10") {
        queryParams.append("maxParams", "10");
      } else if (sizeRange === "10to30") {
        queryParams.append("minParams", "10");
        queryParams.append("maxParams", "30");
      } else if (sizeRange === "30to70") {
        queryParams.append("minParams", "30");
        queryParams.append("maxParams", "70");
      } else if (sizeRange === "over70") {
        queryParams.append("minParams", "70");
      }

      const orderbyQuery = `"${sortField}" ${sortDirection}`;
      queryParams.append("orderby", orderbyQuery);

      const res = await fetch(`http://localhost:3000/api/leaderboard?${queryParams.toString()}`);
      if (!res.ok) throw new Error(`Failed to load data: ${res.statusText}`);
      
      const data = await res.json();
      if (data && data.rows) {
        const rows = data.rows.map((r: any) => r.row);
        setModels(rows);
        setTotalModelsCount(data.num_rows_total || rows.length);
      } else {
        setModels([]);
        setTotalModelsCount(0);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Unable to fetch open LLM rankings.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch LMSYS Arena rankings
  const fetchArenaLeaderboard = async () => {
    setLoading(true);
    setError(null);
    try {
      const queryParams = new URLSearchParams();
      queryParams.append("category", arenaCategory);
      if (search) queryParams.append("search", search);

      const res = await fetch(`http://localhost:3000/api/leaderboard/arena?${queryParams.toString()}`);
      if (!res.ok) throw new Error(`Failed to load LMSYS Arena data: ${res.statusText}`);
      
      const data = await res.json();
      setArenaModels(data.models || []);
      setArenaDate(data.date || "");
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Unable to fetch Chatbot Arena rankings.");
    } finally {
      setLoading(false);
    }
  };

  // Trigger fetch depending on active tab
  useEffect(() => {
    if (activeLeaderboardTab === "open-llm") {
      fetchHFLeaderboard();
    } else {
      fetchArenaLeaderboard();
    }
  }, [activeLeaderboardTab, search, type, precision, moe, sizeRange, sortField, sortDirection, offset, arenaCategory]);

  const handleFilterChange = (filterType: string, val: string) => {
    setOffset(0);
    if (filterType === "type") setType(val);
    else if (filterType === "precision") setPrecision(val);
    else if (filterType === "moe") setMoe(val);
    else if (filterType === "size") setSizeRange(val);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setOffset(0);
    setSearch(searchInput);
  };

  const handleClearFilters = () => {
    setSearch("");
    setSearchInput("");
    setType("");
    setPrecision("");
    setMoe("");
    setSizeRange("");
    setSortField("Average ⬆️");
    setSortDirection("DESC");
    setArenaSortField("rank");
    setArenaSortDirection("ASC");
    setOffset(0);
    setArenaCategory("text");
  };

  const handleSortHF = (field: string) => {
    if (sortField === field) {
      setSortDirection(prev => prev === "ASC" ? "DESC" : "ASC");
    } else {
      setSortField(field);
      setSortDirection("DESC");
    }
    setOffset(0);
  };

  const handleSortArena = (field: keyof ArenaModel) => {
    if (arenaSortField === field) {
      setArenaSortDirection(prev => prev === "ASC" ? "DESC" : "ASC");
    } else {
      setArenaSortField(field);
      setArenaSortDirection(field === "rank" ? "ASC" : "DESC");
    }
  };

  const renderHFSortIndicator = (field: string) => {
    if (sortField !== field) return null;
    return sortDirection === "DESC" ? 
      <ChevronDown size={12} className="inline ml-0.5 text-lightAccent" /> : 
      <ChevronUp size={12} className="inline ml-0.5 text-lightAccent" />;
  };

  const renderArenaSortIndicator = (field: string) => {
    if (arenaSortField !== field) return null;
    return arenaSortDirection === "DESC" ? 
      <ChevronDown size={12} className="inline ml-0.5 text-lightAccent" /> : 
      <ChevronUp size={12} className="inline ml-0.5 text-lightAccent" />;
  };

  const cleanModelName = (name: string) => {
    if (!name) return "";
    return name.replace(/<\/?[^>]+(>|$)/g, ""); 
  };

  const getRankNumber = (index: number) => {
    return offset + index + 1;
  };

  const getTypeBadgeStyle = (modelType: string) => {
    const typeLower = (modelType || "").toLowerCase();
    if (typeLower.includes("pretrained")) {
      return "bg-emerald-500/10 border-emerald-500/20 text-emerald-400";
    } else if (typeLower.includes("chat")) {
      return "bg-sky-500/10 border-sky-500/20 text-sky-400";
    } else if (typeLower.includes("fine-tuned")) {
      return "bg-purple-500/10 border-purple-500/20 text-purple-400";
    } else {
      return "bg-amber-500/10 border-amber-500/20 text-amber-400";
    }
  };

  // Sort Arena models locally in frontend
  const sortedArenaModels = [...arenaModels].sort((a: any, b: any) => {
    let valA = a[arenaSortField];
    let valB = b[arenaSortField];

    if (typeof valA === "string") {
      valA = valA.toLowerCase();
      valB = valB.toLowerCase();
    }

    if (valA < valB) return arenaSortDirection === "ASC" ? -1 : 1;
    if (valA > valB) return arenaSortDirection === "ASC" ? 1 : -1;
    return 0;
  });

  return (
    <main className="max-w-[1480px] w-full mx-auto px-6 py-12 flex-1 flex flex-col gap-8">
      {/* Header breadcrumb and details */}
      <div className="flex flex-col gap-4 border-b border-borderGray pb-6">
        <button 
          onClick={onBackToHome} 
          className="text-xs text-gray-400 hover:text-lightAccent flex items-center gap-1.5 transition-colors font-bold w-fit"
        >
          <ChevronRight size={14} className="rotate-180" /> 
          <span>Back to Homepage</span>
        </button>
        
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-lightAccent">
                LLM Benchmarks & Rankings
              </h1>
              <div className="flex items-center gap-1.5 bg-[#fefff5]/10 border border-[#fefff5]/20 px-2.5 py-0.5 rounded-full text-[9px] font-bold text-lightAccent uppercase tracking-wider h-fit">
                <Award size={10} className="text-yellow-400" />
                <span>Live Feed</span>
              </div>
            </div>
            <p className="text-xs text-gray-500 font-medium">
              Compare commercial giants (Claude, Gemini, GPT-4, Grok) with community-driven open-weights models.
            </p>
          </div>
        </div>
      </div>

      {/* Primary Navigation Tabs - LMSYS Arena vs HF Open LLM */}
      <div className="flex border-b border-borderGray w-full gap-2">
        <button
          onClick={() => {
            setActiveLeaderboardTab("arena");
            handleClearFilters();
          }}
          className={`px-6 py-3 text-xs uppercase font-extrabold tracking-wider border-b-2 transition-all ${
            activeLeaderboardTab === "arena" 
              ? "border-lightAccent text-lightAccent" 
              : "border-transparent text-gray-500 hover:text-gray-300"
          }`}
        >
          🏆 LMSYS Chatbot Arena (All Models)
        </button>
        
        <button
          onClick={() => {
            setActiveLeaderboardTab("open-llm");
            handleClearFilters();
          }}
          className={`px-6 py-3 text-xs uppercase font-extrabold tracking-wider border-b-2 transition-all ${
            activeLeaderboardTab === "open-llm" 
              ? "border-lightAccent text-lightAccent" 
              : "border-transparent text-gray-500 hover:text-gray-300"
          }`}
        >
          📦 Hugging Face Open LLM (Open Weights Only)
        </button>
      </div>

      {/* Grid Stats cards */}
      {activeLeaderboardTab === "arena" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-darkCard border border-borderGray rounded-xl p-5 flex flex-col justify-between">
            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Arena Category</span>
            <span className="text-2xl font-extrabold text-lightAccent mt-2 capitalize">{arenaCategory} Models</span>
            <span className="text-[10px] text-gray-500 font-medium mt-1">Multi-modal options available</span>
          </div>
          <div className="bg-darkCard border border-borderGray rounded-xl p-5 flex flex-col justify-between">
            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Current Elo Leader</span>
            <span className="text-lg font-extrabold text-emerald-400 mt-2 truncate leading-tight">claude-fable-5</span>
            <span className="text-[10px] text-gray-500 font-medium mt-1">Elo score: 1508</span>
          </div>
          <div className="bg-darkCard border border-borderGray rounded-xl p-5 flex flex-col justify-between">
            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Total User Votes</span>
            <span className="text-2xl font-extrabold text-[#fefff5] mt-2">Millions+</span>
            <span className="text-[10px] text-gray-500 font-medium mt-1">Based on side-by-side preference</span>
          </div>
          <div className="bg-darkCard border border-borderGray rounded-xl p-5 flex flex-col justify-between">
            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Snapshot Date</span>
            <span className="text-2xl font-extrabold text-purple-400 mt-2">{arenaDate || "Fetching..."}</span>
            <span className="text-[10px] text-gray-500 font-medium mt-1">Updated automatically daily</span>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-darkCard border border-borderGray rounded-xl p-5 flex flex-col justify-between">
            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Total Evaluated Models</span>
            <span className="text-2xl font-extrabold text-lightAccent mt-2">4,576</span>
            <span className="text-[10px] text-gray-500 font-medium mt-1">Open weight models only</span>
          </div>
          <div className="bg-darkCard border border-borderGray rounded-xl p-5 flex flex-col justify-between">
            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Current Technical Leader</span>
            <span className="text-lg font-extrabold text-emerald-400 mt-2 truncate leading-tight">calme-3.2-instruct-78b</span>
            <span className="text-[10px] text-gray-500 font-medium mt-1">Average score: 52.08%</span>
          </div>
          <div className="bg-darkCard border border-borderGray rounded-xl p-5 flex flex-col justify-between">
            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Most Active Architecture</span>
            <span className="text-2xl font-extrabold text-[#fefff5] mt-2">Qwen & Llama</span>
            <span className="text-[10px] text-gray-500 font-medium mt-1">Open source foundation models</span>
          </div>
          <div className="bg-darkCard border border-borderGray rounded-xl p-5 flex flex-col justify-between">
            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Evaluation Benchmarks</span>
            <span className="text-2xl font-extrabold text-purple-400 mt-2">6 Standard Tests</span>
            <span className="text-[10px] text-gray-500 font-medium mt-1">MMLU-Pro, IFEval, GPQA...</span>
          </div>
        </div>
      )}

      {/* Search and Filters panel */}
      <div className="bg-[#121212] border border-borderGray rounded-xl p-4 flex flex-col gap-4">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          
          {/* Shared Search Box */}
          <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 bg-[#0d0d0d] border border-borderGray rounded-lg px-3 py-1.5 flex-1 max-w-md focus-within:border-lightAccent transition-colors">
            <Search size={16} className="text-gray-500" />
            <input
              type="text"
              placeholder={
                activeLeaderboardTab === "arena" 
                  ? "Search models or vendors (e.g. GPT-4, Claude, Gemini)..."
                  : "Search model name (e.g. Meta, Qwen, DeepSeek)..."
              }
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="bg-transparent border-0 text-xs text-lightAccent focus:outline-none w-full"
            />
            {searchInput && (
              <button 
                type="button" 
                onClick={() => {
                  setSearchInput("");
                  setSearch("");
                  setOffset(0);
                }} 
                className="text-gray-500 hover:text-lightAccent transition-colors"
              >
                <X size={14} />
              </button>
            )}
            <button 
              type="submit" 
              className="text-[10px] uppercase font-bold text-gray-400 hover:text-lightAccent border-l border-borderGray pl-2 transition-colors"
            >
              Search
            </button>
          </form>

          {/* Filtering selectors */}
          {activeLeaderboardTab === "arena" ? (
            /* LMSYS Filters */
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex flex-col gap-1">
                <select
                  value={arenaCategory}
                  onChange={(e) => {
                    setArenaCategory(e.target.value);
                    setSearch("");
                    setSearchInput("");
                  }}
                  className="bg-[#0d0d0d] border border-borderGray rounded-lg px-3 py-2 text-xs text-lightAccent focus:outline-none focus:border-lightAccent cursor-pointer"
                >
                  <option value="text">💬 General Text (Overall)</option>
                  <option value="code">💻 Coding Tasks</option>
                  <option value="vision">👁️ Computer Vision</option>
                  <option value="agent">🤖 Agent Behaviors</option>
                  <option value="search">🔍 Search & Retrieval</option>
                </select>
              </div>

              <button
                onClick={handleClearFilters}
                className="px-3 py-2 border border-borderGray hover:border-gray-500 rounded-lg text-xs font-bold text-gray-400 hover:text-lightAccent transition-all active:scale-95 flex items-center gap-1.5"
              >
                Reset Settings
              </button>
              
              <button
                onClick={fetchArenaLeaderboard}
                disabled={loading}
                className="p-2 border border-borderGray rounded-lg text-gray-500 hover:text-lightAccent active:scale-95 transition-all disabled:opacity-50"
              >
                <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
              </button>
            </div>
          ) : (
            /* HF Filters */
            <div className="flex flex-wrap items-center gap-3">
              <select
                value={type}
                onChange={(e) => handleFilterChange("type", e.target.value)}
                className="bg-[#0d0d0d] border border-borderGray rounded-lg px-3 py-2 text-xs text-lightAccent focus:outline-none focus:border-lightAccent cursor-pointer"
              >
                <option value="">All Types</option>
                <option value="pretrained">Pretrained</option>
                <option value="chat">Chat / RLHF</option>
                <option value="fine-tuned">Fine-Tuned</option>
                <option value="merge">Merges</option>
              </select>

              <select
                value={precision}
                onChange={(e) => handleFilterChange("precision", e.target.value)}
                className="bg-[#0d0d0d] border border-borderGray rounded-lg px-3 py-2 text-xs text-lightAccent focus:outline-none focus:border-lightAccent cursor-pointer font-mono"
              >
                <option value="">All Precisions</option>
                <option value="bfloat16">bfloat16</option>
                <option value="float16">float16</option>
                <option value="8bit">8bit</option>
                <option value="4bit">4bit</option>
                <option value="Unknown">Unknown</option>
              </select>

              <select
                value={moe}
                onChange={(e) => handleFilterChange("moe", e.target.value)}
                className="bg-[#0d0d0d] border border-borderGray rounded-lg px-3 py-2 text-xs text-lightAccent focus:outline-none focus:border-lightAccent cursor-pointer"
              >
                <option value="">All Architectures</option>
                <option value="true">MoE Only</option>
                <option value="false">Dense Only</option>
              </select>

              <select
                value={sizeRange}
                onChange={(e) => handleFilterChange("size", e.target.value)}
                className="bg-[#0d0d0d] border border-borderGray rounded-lg px-3 py-2 text-xs text-lightAccent focus:outline-none focus:border-lightAccent cursor-pointer"
              >
                <option value="">All Sizes</option>
                <option value="under10">&lt; 10B Params</option>
                <option value="10to30">10B - 30B Params</option>
                <option value="30to70">30B - 70B Params</option>
                <option value="over70">&gt; 70B Params</option>
              </select>

              <button
                onClick={handleClearFilters}
                className="px-3 py-2 border border-borderGray hover:border-gray-500 rounded-lg text-xs font-bold text-gray-400 hover:text-lightAccent transition-all active:scale-95"
              >
                Clear Filters
              </button>

              <button
                onClick={fetchHFLeaderboard}
                disabled={loading}
                className="p-2 border border-borderGray rounded-lg text-gray-500 hover:text-lightAccent active:scale-95 transition-all disabled:opacity-50"
              >
                <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Table view */}
      <div className="border border-borderGray rounded-xl bg-darkCard overflow-hidden shadow-lg flex flex-col flex-1">
        
        {loading ? (
          <div className="p-8 space-y-4">
            <div className="flex justify-between items-center pb-4 border-b border-borderGray animate-pulse">
              <div className="h-4 bg-[#212121] rounded w-16"></div>
              <div className="h-4 bg-[#212121] rounded w-64"></div>
              <div className="h-4 bg-[#212121] rounded w-20"></div>
              <div className="h-4 bg-[#212121] rounded w-20"></div>
            </div>
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="flex justify-between items-center py-4 border-b border-[#1c1c1c] last:border-0 animate-pulse">
                <div className="h-3 bg-[#212121] rounded w-6"></div>
                <div className="h-3 bg-[#212121] rounded w-48"></div>
                <div className="h-3 bg-[#212121] rounded w-12"></div>
                <div className="h-3 bg-[#212121] rounded w-14"></div>
                <div className="h-3 bg-[#212121] rounded w-14"></div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="border border-red-500/20 bg-red-500/5 rounded-xl p-12 text-center space-y-4 max-w-xl mx-auto my-12">
            <p className="text-xs text-red-400">{error}</p>
            <button
              onClick={activeLeaderboardTab === "arena" ? fetchArenaLeaderboard : fetchHFLeaderboard}
              className="bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 text-xs font-bold px-5 py-2.5 rounded-xl transition-all"
            >
              Retry Loading rankings
            </button>
          </div>
        ) : activeLeaderboardTab === "arena" && sortedArenaModels.length === 0 ? (
          <div className="border border-borderGray bg-darkCard/50 rounded-xl p-16 text-center space-y-3 max-w-xl mx-auto my-12">
            <Cpu size={28} className="text-gray-600 mx-auto" />
            <h4 className="font-bold text-sm text-lightAccent">No Arena Models Found</h4>
            <p className="text-xs text-gray-500">
              No models matched your search criteria for the Chatbot Arena rankings.
            </p>
          </div>
        ) : activeLeaderboardTab === "open-llm" && models.length === 0 ? (
          <div className="border border-borderGray bg-darkCard/50 rounded-xl p-16 text-center space-y-3 max-w-xl mx-auto my-12">
            <Cpu size={28} className="text-gray-600 mx-auto" />
            <h4 className="font-bold text-sm text-lightAccent">No Open Weights Models Found</h4>
            <p className="text-xs text-gray-500">
              No models matched your filters for the Hugging Face Open LLM leaderboard.
            </p>
          </div>
        ) : activeLeaderboardTab === "arena" ? (
          /* ========================================================
             LMSYS ARENA TABLE
             ======================================================== */
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs select-none">
              <thead>
                <tr className="bg-[#121212] border-b border-borderGray text-gray-400 font-extrabold uppercase tracking-wider text-[10px]">
                  <th 
                    onClick={() => handleSortArena("rank")} 
                    className="py-4 px-5 text-center w-[75px] cursor-pointer hover:bg-[#1c1c1c] transition-colors"
                  >
                    Rank {renderArenaSortIndicator("rank")}
                  </th>
                  <th 
                    onClick={() => handleSortArena("model")} 
                    className="py-4 px-4 min-w-[220px] cursor-pointer hover:bg-[#1c1c1c] transition-colors"
                  >
                    Model {renderArenaSortIndicator("model")}
                  </th>
                  <th 
                    onClick={() => handleSortArena("vendor")} 
                    className="py-4 px-4 cursor-pointer hover:bg-[#1c1c1c] transition-colors min-w-[120px]"
                  >
                    Vendor {renderArenaSortIndicator("vendor")}
                  </th>
                  <th 
                    onClick={() => handleSortArena("score")} 
                    className="py-4 px-4 cursor-pointer hover:bg-[#1c1c1c] text-center transition-colors min-w-[100px]"
                  >
                    Elo Score {renderArenaSortIndicator("score")}
                  </th>
                  <th 
                    onClick={() => handleSortArena("ci")} 
                    className="py-4 px-4 cursor-pointer hover:bg-[#1c1c1c] text-center transition-colors min-w-[100px]"
                  >
                    Confidence {renderArenaSortIndicator("ci")}
                  </th>
                  <th 
                    onClick={() => handleSortArena("votes")} 
                    className="py-4 px-4 cursor-pointer hover:bg-[#1c1c1c] text-center transition-colors min-w-[110px]"
                  >
                    Votes {renderArenaSortIndicator("votes")}
                  </th>
                  <th 
                    onClick={() => handleSortArena("license")} 
                    className="py-4 px-4 cursor-pointer hover:bg-[#1c1c1c] text-center transition-colors min-w-[110px]"
                  >
                    License {renderArenaSortIndicator("license")}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1c1c1c]">
                {sortedArenaModels.map((model, idx) => {
                  return (
                    <tr 
                      key={`${model.model}-${idx}`}
                      onClick={() => setSelectedArenaModel(model)}
                      className="hover:bg-[#161616]/70 transition-all duration-150 cursor-pointer border-b border-[#1c1c1c] font-medium"
                    >
                      {/* Rank badge */}
                      <td className="py-3.5 px-5 text-center font-bold text-gray-500">
                        {model.rank === 1 ? (
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 text-xs">🥇</span>
                        ) : model.rank === 2 ? (
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-300/10 text-slate-300 border border-slate-300/20 text-xs">🥈</span>
                        ) : model.rank === 3 ? (
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-700/10 text-amber-600 border border-amber-700/20 text-xs">🥉</span>
                        ) : (
                          model.rank
                        )}
                      </td>

                      {/* Model Name */}
                      <td className="py-3.5 px-4 font-extrabold text-lightAccent text-sm truncate max-w-[280px]">
                        {model.model}
                      </td>

                      {/* Vendor */}
                      <td className="py-3.5 px-4 font-semibold text-gray-300">
                        {model.vendor || "Open Weights"}
                      </td>

                      {/* Elo Score */}
                      <td className="py-3.5 px-4 text-center font-extrabold text-emerald-400 text-sm">
                        {model.score}
                      </td>

                      {/* Confidence Interval */}
                      <td className="py-3.5 px-4 text-center text-gray-400 font-mono">
                        ±{model.ci}
                      </td>

                      {/* Votes */}
                      <td className="py-3.5 px-4 text-center text-gray-300 font-semibold">
                        {model.votes?.toLocaleString() || "0"}
                      </td>

                      {/* License Badges */}
                      <td className="py-3.5 px-4 text-center">
                        {model.license?.toLowerCase() === "proprietary" ? (
                          <span className="text-[8.5px] px-2 py-0.5 rounded border border-red-500/20 bg-red-500/10 text-red-400 font-bold uppercase tracking-wider">
                            Proprietary
                          </span>
                        ) : (
                          <span className="text-[8.5px] px-2 py-0.5 rounded border border-emerald-500/20 bg-emerald-500/10 text-emerald-400 font-bold uppercase tracking-wider">
                            Open weights
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          /* ========================================================
             HF OPEN LLM TABLE
             ======================================================== */
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs select-none">
              <thead>
                <tr className="bg-[#121212] border-b border-borderGray text-gray-400 font-extrabold uppercase tracking-wider text-[10px]">
                  <th className="py-4 px-5 text-center w-[60px]">Rank</th>
                  <th className="py-4 px-4 min-w-[200px]">Model Name</th>
                  <th 
                    onClick={() => handleSortHF("Average ⬆️")} 
                    className="py-4 px-4 cursor-pointer hover:bg-[#1c1c1c] text-center transition-colors min-w-[90px]"
                  >
                    Average {renderHFSortIndicator("Average ⬆️")}
                  </th>
                  <th 
                    onClick={() => handleSortHF("#Params (B)")} 
                    className="py-4 px-4 cursor-pointer hover:bg-[#1c1c1c] text-center transition-colors min-w-[90px]"
                  >
                    Params {renderHFSortIndicator("#Params (B)")}
                  </th>
                  <th 
                    onClick={() => handleSortHF("Hub ❤️")} 
                    className="py-4 px-4 cursor-pointer hover:bg-[#1c1c1c] text-center transition-colors min-w-[90px]"
                  >
                    Likes {renderHFSortIndicator("Hub ❤️")}
                  </th>
                  <th 
                    onClick={() => handleSortHF("MMLU-PRO")} 
                    className="py-4 px-4 cursor-pointer hover:bg-[#1c1c1c] text-center transition-colors min-w-[90px]"
                  >
                    MMLU-Pro {renderHFSortIndicator("MMLU-PRO")}
                  </th>
                  <th 
                    onClick={() => handleSortHF("GPQA")} 
                    className="py-4 px-4 cursor-pointer hover:bg-[#1c1c1c] text-center transition-colors min-w-[90px]"
                  >
                    GPQA {renderHFSortIndicator("GPQA")}
                  </th>
                  <th 
                    onClick={() => handleSortHF("IFEval")} 
                    className="py-4 px-4 cursor-pointer hover:bg-[#1c1c1c] text-center transition-colors min-w-[90px]"
                  >
                    IFEval {renderHFSortIndicator("IFEval")}
                  </th>
                  <th 
                    onClick={() => handleSortHF("MATH Lvl 5")} 
                    className="py-4 px-4 cursor-pointer hover:bg-[#1c1c1c] text-center transition-colors min-w-[90px]"
                  >
                    MATH {renderHFSortIndicator("MATH Lvl 5")}
                  </th>
                  <th 
                    onClick={() => handleSortHF("BBH")} 
                    className="py-4 px-4 cursor-pointer hover:bg-[#1c1c1c] text-center transition-colors min-w-[90px]"
                  >
                    BBH {renderHFSortIndicator("BBH")}
                  </th>
                  <th 
                    onClick={() => handleSortHF("MUSR")} 
                    className="py-4 px-4 cursor-pointer hover:bg-[#1c1c1c] text-center transition-colors min-w-[90px]"
                  >
                    MUSR {renderHFSortIndicator("MUSR")}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1c1c1c]">
                {models.map((model, idx) => {
                  const rank = getRankNumber(idx);
                  return (
                    <tr 
                      key={`${model.fullname}-${idx}`}
                      onClick={() => setSelectedModel(model)}
                      className="hover:bg-[#161616]/70 transition-all duration-150 cursor-pointer border-b border-[#1c1c1c] font-medium"
                    >
                      <td className="py-3 px-5 text-center font-bold text-gray-500">
                        {rank === 1 ? (
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 text-xs">🥇</span>
                        ) : rank === 2 ? (
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-300/10 text-slate-300 border border-slate-300/20 text-xs">🥈</span>
                        ) : rank === 3 ? (
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-700/10 text-amber-600 border border-amber-700/20 text-xs">🥉</span>
                        ) : (
                          rank
                        )}
                      </td>

                      <td className="py-3 px-4">
                        <div className="flex flex-col gap-1 max-w-[320px] md:max-w-[450px]">
                          <span className="font-extrabold text-lightAccent truncate hover:text-white" title={model.fullname}>
                            {cleanModelName(model.fullname)}
                          </span>
                          
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className={`text-[8.5px] px-1.5 py-0.5 rounded border font-semibold ${getTypeBadgeStyle(model.Type)}`}>
                              {model.Type?.split(" ")[1] || "model"}
                            </span>

                            <span className="text-[8.5px] px-1.5 py-0.5 rounded border border-borderGray bg-[#121212] text-gray-400 font-mono font-semibold">
                              {model.Precision}
                            </span>

                            {model.MoE && (
                              <span className="text-[8.5px] px-1.5 py-0.5 rounded border border-purple-500/20 bg-purple-500/10 text-purple-400 font-bold uppercase tracking-wider">
                                MoE
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4 text-center font-extrabold text-emerald-400 text-sm">
                        {typeof model["Average ⬆️"] === "number" ? model["Average ⬆️"].toFixed(2) : "-"}
                      </td>

                      <td className="py-3 px-4 text-center font-bold text-gray-300">
                        {typeof model["#Params (B)"] === "number" ? `${model["#Params (B)"].toFixed(2)}B` : "-"}
                      </td>

                      <td className="py-3 px-4 text-center text-gray-400">
                        <span className="inline-flex items-center gap-1">
                          <Heart size={11} className="text-red-500/80 fill-red-500/20" />
                          <span>{model["Hub ❤️"] ?? 0}</span>
                        </span>
                      </td>

                      <td className="py-3 px-4 text-center font-semibold text-gray-300">{typeof model["MMLU-PRO"] === "number" ? model["MMLU-PRO"].toFixed(2) : "-"}</td>
                      <td className="py-3 px-4 text-center font-semibold text-gray-300">{typeof model["GPQA"] === "number" ? model["GPQA"].toFixed(2) : "-"}</td>
                      <td className="py-3 px-4 text-center font-semibold text-gray-300">{typeof model["IFEval"] === "number" ? model["IFEval"].toFixed(2) : "-"}</td>
                      <td className="py-3 px-4 text-center font-semibold text-gray-300">{typeof model["MATH Lvl 5"] === "number" ? model["MATH Lvl 5"].toFixed(2) : "-"}</td>
                      <td className="py-3 px-4 text-center font-semibold text-gray-300">{typeof model["BBH"] === "number" ? model["BBH"].toFixed(2) : "-"}</td>
                      <td className="py-3 px-4 text-center font-semibold text-gray-300">{typeof model["MUSR"] === "number" ? model["MUSR"].toFixed(2) : "-"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Dynamic Pagination Bar (only for Hugging Face weights rankings, Arena contains single-page lists) */}
        {activeLeaderboardTab === "open-llm" && !loading && !error && models.length > 0 && (
          <div className="bg-[#121212] border-t border-borderGray px-5 py-3 flex items-center justify-between text-[11px] text-gray-500 font-bold uppercase tracking-wider">
            <div>
              Showing {offset + 1} - {Math.min(offset + limit, totalModelsCount)} of {totalModelsCount} models
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => setOffset(prev => Math.max(0, prev - limit))}
                disabled={offset === 0}
                className="bg-[#0d0d0d] hover:bg-[#181818] disabled:opacity-30 border border-borderGray hover:border-gray-500 disabled:hover:border-borderGray text-lightAccent px-3 py-1.5 rounded-lg transition-all active:scale-95"
              >
                Previous
              </button>
              <button
                onClick={() => setOffset(prev => prev + limit)}
                disabled={offset + limit >= totalModelsCount}
                className="bg-[#0d0d0d] hover:bg-[#181818] disabled:opacity-30 border border-borderGray hover:border-gray-500 disabled:hover:border-borderGray text-lightAccent px-3 py-1.5 rounded-lg transition-all active:scale-95"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ========================================================
         LMSYS ARENA MODEL DETAIL MODAL
         ======================================================== */}
      {selectedArenaModel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="bg-[#121212] border border-borderGray rounded-2xl w-full max-w-[600px] p-8 shadow-2xl relative max-h-[85vh] overflow-y-auto">
            <button
              onClick={() => setSelectedArenaModel(null)}
              className="absolute top-4 right-4 text-gray-500 hover:text-lightAccent transition-colors"
            >
              <X size={20} />
            </button>
            
            <div className="space-y-6">
              <div className="space-y-2">
                <span className={`text-[9px] px-2 py-0.5 rounded border font-bold uppercase tracking-widest ${
                  selectedArenaModel.license?.toLowerCase() === "proprietary" 
                    ? "border-red-500/20 bg-red-500/10 text-red-400"
                    : "border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
                }`}>
                  {selectedArenaModel.license} model
                </span>
                
                <h2 className="text-xl md:text-2xl font-extrabold text-lightAccent leading-tight truncate">
                  {selectedArenaModel.model}
                </h2>
                
                <div className="text-xs text-gray-500 font-semibold">
                  <span>Vendor: {selectedArenaModel.vendor || "Open weights community"}</span>
                </div>
              </div>

              {/* Specs Grid */}
              <div className="border border-borderGray bg-[#0d0d0d] rounded-xl p-5 space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-borderGray">
                  <Award size={16} className="text-yellow-400" />
                  <span className="text-xs uppercase font-extrabold text-lightAccent tracking-wider">Arena Ratings</span>
                </div>
                
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="bg-darkCard/50 border border-borderGray/50 p-3 rounded-lg">
                    <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest block">Arena Rank</span>
                    <p className="text-xl font-extrabold text-lightAccent mt-1">#{selectedArenaModel.rank}</p>
                  </div>
                  <div className="bg-darkCard/50 border border-borderGray/50 p-3 rounded-lg">
                    <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest block">Elo Score</span>
                    <p className="text-xl font-extrabold text-emerald-400 mt-1">{selectedArenaModel.score}</p>
                  </div>
                  <div className="bg-darkCard/50 border border-borderGray/50 p-3 rounded-lg">
                    <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest block">Confidence (CI)</span>
                    <p className="text-xl font-extrabold text-purple-400 mt-1">±{selectedArenaModel.ci}</p>
                  </div>
                </div>
              </div>

              <div className="border-t border-borderGray pt-5 text-xs text-textGray leading-relaxed space-y-3">
                <div className="flex justify-between items-center border-b border-[#1c1c1c] pb-2">
                  <span className="text-gray-500 font-bold uppercase tracking-wider text-[10px]">Total Votes Recorded</span>
                  <span className="text-lightAccent font-extrabold">{selectedArenaModel.votes?.toLocaleString() || "0"} votes</span>
                </div>
                <div className="flex justify-between items-center border-b border-[#1c1c1c] pb-2">
                  <span className="text-gray-500 font-bold uppercase tracking-wider text-[10px]">Evaluation Category</span>
                  <span className="text-lightAccent capitalize">{arenaCategory} benchmarking</span>
                </div>
                <div className="flex justify-between items-center border-b border-[#1c1c1c] pb-2">
                  <span className="text-gray-500 font-bold uppercase tracking-wider text-[10px]">Provider / Vendor</span>
                  <span className="text-lightAccent font-semibold">{selectedArenaModel.vendor}</span>
                </div>
                <div className="flex justify-between items-center pb-2">
                  <span className="text-gray-500 font-bold uppercase tracking-wider text-[10px]">Snapshot Date</span>
                  <span className="text-lightAccent">{arenaDate}</span>
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-borderGray pt-5 mt-6">
                <button
                  onClick={() => setSelectedArenaModel(null)}
                  className="border border-borderGray hover:border-gray-500 text-xs font-bold px-5 py-2.5 rounded-xl transition-all active:scale-95"
                >
                  Close Description
                </button>
                <a
                  href={`https://lmarena.ai/`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-lightAccent text-darkBg hover:bg-white text-xs font-extrabold px-6 py-2.5 rounded-xl inline-flex items-center gap-1.5 active:scale-95 transition-all shadow-[0_0_20px_rgba(254,255,245,0.15)]"
                >
                  <span>Visit LM Arena</span>
                  <ArrowUpRight size={14} />
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
         HF OPEN LLM MODEL DETAIL MODAL
         ======================================================== */}
      {selectedModel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="bg-[#121212] border border-borderGray rounded-2xl w-full max-w-[700px] p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedModel(null)}
              className="absolute top-4 right-4 text-gray-500 hover:text-lightAccent transition-colors"
            >
              <X size={20} />
            </button>
            
            <div className="space-y-6">
              <div className="space-y-2">
                <span className={`text-[9px] px-2 py-0.5 rounded border font-bold uppercase tracking-widest ${getTypeBadgeStyle(selectedModel.Type)}`}>
                  {selectedModel.Type}
                </span>
                
                <h2 className="text-xl md:text-2xl font-extrabold text-lightAccent leading-tight truncate mr-6" title={selectedModel.fullname}>
                  {cleanModelName(selectedModel.fullname)}
                </h2>
                
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-gray-500 font-semibold">
                  <div className="flex items-center gap-1">
                    <Cpu size={12} className="text-gray-400" />
                    <span>Arch: {selectedModel.Architecture || "Transformer"}</span>
                  </div>
                  <span>•</span>
                  <span>License: {selectedModel["Hub License"] || "N/A"}</span>
                  {selectedModel.MoE && (
                    <>
                      <span>•</span>
                      <span className="text-purple-400 font-bold uppercase">MoE Model</span>
                    </>
                  )}
                </div>
              </div>

              <div className="border border-borderGray bg-[#0d0d0d] rounded-xl p-5 space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-borderGray">
                  <Award size={16} className="text-yellow-400" />
                  <span className="text-xs uppercase font-extrabold text-lightAccent tracking-wider">Benchmark Evaluations</span>
                </div>
                
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  <div className="bg-darkCard/50 border border-borderGray/50 p-3 rounded-lg text-center">
                    <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">Average Score</span>
                    <p className="text-lg font-extrabold text-emerald-400 mt-1">{selectedModel["Average ⬆️"] ? selectedModel["Average ⬆️"].toFixed(2) : "-"}</p>
                  </div>
                  <div className="bg-darkCard/50 border border-borderGray/50 p-3 rounded-lg text-center">
                    <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">MMLU-Pro</span>
                    <p className="text-lg font-extrabold text-[#fefff5] mt-1">{selectedModel["MMLU-PRO"] ? selectedModel["MMLU-PRO"].toFixed(2) : "-"}</p>
                  </div>
                  <div className="bg-darkCard/50 border border-borderGray/50 p-3 rounded-lg text-center">
                    <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">GPQA</span>
                    <p className="text-lg font-extrabold text-[#fefff5] mt-1">{selectedModel["GPQA"] ? selectedModel["GPQA"].toFixed(2) : "-"}</p>
                  </div>
                  <div className="bg-darkCard/50 border border-borderGray/50 p-3 rounded-lg text-center">
                    <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">IFEval</span>
                    <p className="text-lg font-extrabold text-[#fefff5] mt-1">{selectedModel["IFEval"] ? selectedModel["IFEval"].toFixed(2) : "-"}</p>
                  </div>
                  <div className="bg-darkCard/50 border border-borderGray/50 p-3 rounded-lg text-center">
                    <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">MATH Lvl 5</span>
                    <p className="text-lg font-extrabold text-[#fefff5] mt-1">{selectedModel["MATH Lvl 5"] ? selectedModel["MATH Lvl 5"].toFixed(2) : "-"}</p>
                  </div>
                  <div className="bg-darkCard/50 border border-borderGray/50 p-3 rounded-lg text-center">
                    <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">BBH</span>
                    <p className="text-lg font-extrabold text-[#fefff5] mt-1">{selectedModel["BBH"] ? selectedModel["BBH"].toFixed(2) : "-"}</p>
                  </div>
                </div>
              </div>

              <div className="border-t border-borderGray pt-5 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 text-xs font-semibold">
                <div className="space-y-1 flex items-center justify-between border-b border-[#1c1c1c] pb-2">
                  <span className="text-gray-500 font-bold uppercase tracking-wider text-[10px]">Precision Type</span>
                  <span className="text-lightAccent font-mono">{selectedModel.Precision}</span>
                </div>
                <div className="space-y-1 flex items-center justify-between border-b border-[#1c1c1c] pb-2">
                  <span className="text-gray-500 font-bold uppercase tracking-wider text-[10px]">Parameter Count</span>
                  <span className="text-lightAccent font-bold">{selectedModel["#Params (B)"] ? `${selectedModel["#Params (B)"]} Billion` : "N/A"}</span>
                </div>
                <div className="space-y-1 flex items-center justify-between border-b border-[#1c1c1c] pb-2">
                  <span className="text-gray-500 font-bold uppercase tracking-wider text-[10px]">Weight Type</span>
                  <span className="text-lightAccent">{selectedModel["Weight type"] || "Original"}</span>
                </div>
                <div className="space-y-1 flex items-center justify-between border-b border-[#1c1c1c] pb-2">
                  <span className="text-gray-500 font-bold uppercase tracking-wider text-[10px]">CO₂ cost (kg)</span>
                  <span className="text-lightAccent">{selectedModel["CO₂ cost (kg)"] ? `${selectedModel["CO₂ cost (kg)"].toFixed(4)}` : "Not Evaluated"}</span>
                </div>
                <div className="space-y-1 flex items-center justify-between border-b border-[#1c1c1c] pb-2">
                  <span className="text-gray-500 font-bold uppercase tracking-wider text-[10px]">Upload Date</span>
                  <span className="text-lightAccent">{selectedModel["Upload To Hub Date"] || "N/A"}</span>
                </div>
                <div className="space-y-1 flex items-center justify-between border-b border-[#1c1c1c] pb-2">
                  <span className="text-gray-500 font-bold uppercase tracking-wider text-[10px]">Submission Date</span>
                  <span className="text-lightAccent">{selectedModel["Submission Date"] || "N/A"}</span>
                </div>
                <div className="space-y-1 sm:col-span-2 flex flex-col gap-1 border-b border-[#1c1c1c] pb-2.5 mt-2">
                  <span className="text-gray-500 font-bold uppercase tracking-wider text-[10px]">Base Model</span>
                  <span className="text-lightAccent truncate font-mono text-[11px]">{selectedModel["Base Model"] || "Self / None"}</span>
                </div>
                <div className="space-y-1 sm:col-span-2 flex flex-col gap-1 pb-1">
                  <span className="text-gray-500 font-bold uppercase tracking-wider text-[10px]">Model SHA</span>
                  <span className="text-gray-400 font-mono text-[10px] select-all break-all">{selectedModel["Model sha"] || "N/A"}</span>
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-borderGray pt-5 mt-6">
                <button
                  onClick={() => setSelectedModel(null)}
                  className="border border-borderGray hover:border-gray-500 text-xs font-bold px-5 py-2.5 rounded-xl transition-all active:scale-95"
                >
                  Close Description
                </button>
                <a
                  href={`https://huggingface.co/${selectedModel.fullname}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-lightAccent text-darkBg hover:bg-white text-xs font-extrabold px-6 py-2.5 rounded-xl inline-flex items-center gap-1.5 active:scale-95 transition-all shadow-[0_0_20px_rgba(254,255,245,0.15)]"
                >
                  <span>View on Hugging Face</span>
                  <ArrowUpRight size={14} />
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
