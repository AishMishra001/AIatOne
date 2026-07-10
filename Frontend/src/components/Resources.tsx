import { useState, useEffect } from "react";
import { 
  ArrowLeft, 
  Search, 
  GraduationCap, 
  Youtube, 
  FileText, 
  BookOpen, 
  ExternalLink,
  Compass,
  Bookmark,
  Plus,
  X,
  Link as LinkIcon,
  RefreshCw,
  Image as ImageIcon
} from "lucide-react";

interface Resource {
  id: number;
  title: string;
  creator: string;
  type: "paid-courses" | "youtube" | "docs" | "books";
  price: string;
  description: string;
  link: string;
  tags: string[];
  image?: string | null;
}

interface ResourcesProps {
  onBackToHome: () => void;
}

export default function Resources({ onBackToHome }: ResourcesProps) {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<"all" | "paid-courses" | "youtube" | "docs" | "books" | string>("all");

  // Modal Submission State
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Form Fields
  const [formTitle, setFormTitle] = useState("");
  const [formCreator, setFormCreator] = useState("");
  const [formType, setFormType] = useState("paid-courses");
  const [formPrice, setFormPrice] = useState("Free");
  const [formCustomPrice, setFormCustomPrice] = useState("");
  const [formLink, setFormLink] = useState("");
  const [formImage, setFormImage] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formTags, setFormTags] = useState("");

  const fetchResources = async () => {
    setLoading(true);
    setError(null);
    try {
      const queryParams = new URLSearchParams();
      if (activeCategory !== "all") {
        queryParams.append("category", activeCategory);
      }
      if (searchQuery.trim()) {
        queryParams.append("search", searchQuery);
      }

      const response = await fetch(`http://localhost:3000/api/resources?${queryParams.toString()}`);
      if (!response.ok) {
        throw new Error("Failed to load resources from backend API.");
      }
      const data = await response.json();
      setResources(data);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch when search query or active category changes
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchResources();
    }, 200); // 200ms debounce to prevent database queries on every character typed

    return () => clearTimeout(delayDebounceFn);
  }, [activeCategory, searchQuery]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(false);

    // Validate fields
    if (!formTitle.trim() || !formCreator.trim() || !formLink.trim() || !formDescription.trim()) {
      setSubmitError("Please fill out all required fields.");
      setSubmitting(false);
      return;
    }

    if (!formLink.startsWith("http://") && !formLink.startsWith("https://")) {
      setSubmitError("Link URL must start with http:// or https://");
      setSubmitting(false);
      return;
    }

    if (formImage.trim() && !formImage.trim().startsWith("http://") && !formImage.trim().startsWith("https://")) {
      setSubmitError("Image URL must start with http:// or https://");
      setSubmitting(false);
      return;
    }

    const priceValue = formPrice === "Custom" ? formCustomPrice.trim() || "Paid" : formPrice;

    try {
      const response = await fetch("http://localhost:3000/api/resources", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          title: formTitle,
          creator: formCreator,
          type: formType,
          price: priceValue,
          description: formDescription,
          link: formLink,
          tags: formTags,
          image: formImage.trim() || undefined
        })
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || "Error submitting resource.");
      }

      // Success
      setSubmitSuccess(true);
      // Reset form
      setFormTitle("");
      setFormCreator("");
      setFormLink("");
      setFormImage("");
      setFormDescription("");
      setFormTags("");
      setFormPrice("Free");
      setFormCustomPrice("");

      // Refresh list
      fetchResources();
      
      // Close modal after 1.5 seconds
      setTimeout(() => {
        setShowSubmitModal(false);
        setSubmitSuccess(false);
      }, 1500);

    } catch (err: any) {
      setSubmitError(err.message || "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  };

  const getPlaceholderImage = (type: string) => {
    switch (type) {
      case "paid-courses":
        return "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&auto=format&fit=crop&q=60";
      case "youtube":
        return "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=600&auto=format&fit=crop&q=60";
      case "docs":
        return "https://images.unsplash.com/photo-1607799279861-4dd421887fb3?w=600&auto=format&fit=crop&q=60";
      case "books":
        return "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=600&auto=format&fit=crop&q=60";
      default:
        return "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&auto=format&fit=crop&q=60";
    }
  };

  return (
    <main className="max-w-[1480px] w-full mx-auto px-6 py-12 flex-1 flex flex-col gap-8">
      {/* Header and Back navigation */}
      <div className="flex flex-col gap-4 border-b border-borderGray pb-8">
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
          <div>
            <button 
              onClick={onBackToHome}
              className="group flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-lightAccent uppercase tracking-widest transition-colors mb-4"
            >
              <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
              Back to Home
            </button>
            
            <div className="flex items-center gap-3">
              <Bookmark size={28} className="text-lightAccent animate-pulse" />
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-lightAccent">
                AI Resources Hub
              </h1>
            </div>
            <p className="text-sm text-textGray mt-2 max-w-2xl font-medium">
              Curated selection of industry-grade paid courses, expert YouTube playlists, comprehensive documentation, and best-selling books to master Artificial Intelligence.
            </p>
          </div>

          <button
            onClick={() => {
              setSubmitError(null);
              setSubmitSuccess(false);
              setShowSubmitModal(true);
            }}
            className="flex items-center gap-2 bg-lightAccent text-darkBg hover:bg-white active:scale-95 font-extrabold text-sm px-6 py-3.5 rounded-xl transition-all duration-200 shadow-[0_0_20px_rgba(254,255,245,0.1)] w-fit"
          >
            <Plus size={16} />
            <span>Suggest a Resource</span>
          </button>
        </div>
      </div>

      {/* Filters and Search toolbar */}
      <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
        
        {/* Category Tabs */}
        <div className="flex flex-wrap gap-2 w-full lg:w-auto">
          <button
            onClick={() => setActiveCategory("all")}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold uppercase tracking-wider rounded-xl border transition-all ${
              activeCategory === "all"
                ? "bg-lightAccent text-darkBg border-lightAccent font-extrabold"
                : "bg-darkCard border-borderGray text-gray-400 hover:border-gray-600"
            }`}
          >
            <Compass size={14} />
            <span>All</span>
          </button>

          <button
            onClick={() => setActiveCategory("paid-courses")}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold uppercase tracking-wider rounded-xl border transition-all ${
              activeCategory === "paid-courses"
                ? "bg-lightAccent text-darkBg border-lightAccent font-extrabold"
                : "bg-darkCard border-borderGray text-gray-400 hover:border-gray-600"
            }`}
          >
            <GraduationCap size={14} />
            <span>Paid Courses</span>
          </button>

          <button
            onClick={() => setActiveCategory("youtube")}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold uppercase tracking-wider rounded-xl border transition-all ${
              activeCategory === "youtube"
                ? "bg-lightAccent text-darkBg border-lightAccent font-extrabold"
                : "bg-darkCard border-borderGray text-gray-400 hover:border-gray-600"
            }`}
          >
            <Youtube size={14} />
            <span>YouTube Playlists</span>
          </button>

          <button
            onClick={() => setActiveCategory("docs")}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold uppercase tracking-wider rounded-xl border transition-all ${
              activeCategory === "docs"
                ? "bg-lightAccent text-darkBg border-lightAccent font-extrabold"
                : "bg-darkCard border-borderGray text-gray-400 hover:border-gray-600"
            }`}
          >
            <FileText size={14} />
            <span>Free Docs</span>
          </button>

          <button
            onClick={() => setActiveCategory("books")}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold uppercase tracking-wider rounded-xl border transition-all ${
              activeCategory === "books"
                ? "bg-lightAccent text-darkBg border-lightAccent font-extrabold"
                : "bg-darkCard border-borderGray text-gray-400 hover:border-gray-600"
            }`}
          >
            <BookOpen size={14} />
            <span>Books</span>
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative w-full lg:w-80">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-500">
            <Search size={16} />
          </span>
          <input
            type="text"
            placeholder="Search resources, topics or authors..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-sm bg-darkCard border border-borderGray rounded-xl text-lightAccent placeholder-gray-600 outline-none focus:border-lightAccent transition-all"
          />
        </div>

      </div>

      {/* Loading state indicator */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4 text-gray-500">
          <RefreshCw size={24} className="animate-spin text-lightAccent" />
          <span className="text-xs font-semibold tracking-widest uppercase">Fetching resources from database...</span>
        </div>
      ) : error ? (
        <div className="text-center py-16 bg-red-500/5 border border-red-500/10 rounded-2xl p-6">
          <p className="text-sm text-red-400 font-bold mb-2">Error Loading Resources</p>
          <p className="text-xs text-gray-500">{error}</p>
          <button 
            onClick={fetchResources}
            className="mt-4 px-4 py-2 border border-borderGray hover:border-lightAccent text-xs font-bold rounded-xl text-lightAccent hover:bg-lightAccent hover:text-darkBg transition-all"
          >
            Retry Connection
          </button>
        </div>
      ) : (
        <>
          {/* Dynamic Results Counter */}
          <div className="text-xs text-gray-500 font-semibold tracking-wider uppercase">
            Showing {resources.length} learning materials
          </div>

          {/* Grid of Resource Cards */}
          {resources.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fadeIn">
              {resources.map((item) => (
                <div 
                  key={item.id}
                  className="bg-darkCard border border-borderGray hover:border-lightAccent/30 hover:shadow-[0_0_20px_rgba(254,255,245,0.03)] rounded-2xl overflow-hidden flex flex-col justify-between transition-all duration-300 group"
                >
                  {/* Thumbnail Banner */}
                  <div className="h-44 w-full bg-[#141414] relative overflow-hidden border-b border-borderGray/50">
                    <img 
                      src={item.image || getPlaceholderImage(item.type)} 
                      alt={item.title} 
                      className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500 ease-out opacity-80 group-hover:opacity-100"
                      loading="lazy"
                    />
                    
                    {/* Floating Badges absolutely positioned over thumbnail */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-black/30 p-4 flex flex-col justify-between pointer-events-none">
                      <div className="flex items-center justify-between w-full">
                        <span className="text-[9px] font-extrabold uppercase tracking-widest text-lightAccent bg-black/75 backdrop-blur-md border border-borderGray px-2 py-0.5 rounded flex items-center gap-1">
                          {item.type === "paid-courses" && <GraduationCap size={10} className="text-purple-400" />}
                          {item.type === "youtube" && <Youtube size={10} className="text-red-400" />}
                          {item.type === "docs" && <FileText size={10} className="text-blue-400" />}
                          {item.type === "books" && <BookOpen size={10} className="text-emerald-400" />}
                          {item.type.replace("-", " ")}
                        </span>

                        <span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded backdrop-blur-md border ${
                          item.price.toLowerCase() === "free"
                            ? "bg-emerald-950/75 border-emerald-500/25 text-emerald-400"
                            : item.price.toLowerCase().includes("free web")
                            ? "bg-blue-950/75 border-blue-500/25 text-blue-400"
                            : "bg-purple-950/75 border-purple-500/25 text-purple-400"
                        }`}>
                          {item.price}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Card Content body */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      {/* Title & Author info */}
                      <div className="space-y-1">
                        <h3 className="font-extrabold text-base text-lightAccent group-hover:text-white transition-colors leading-snug line-clamp-2">
                          {item.title}
                        </h3>
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">
                          by {item.creator}
                        </p>
                      </div>

                      {/* Description */}
                      <p className="text-xs text-textGray leading-relaxed font-medium line-clamp-3">
                        {item.description}
                      </p>
                    </div>

                    {/* Footer block: Tags & Action link */}
                    <div className="space-y-4 pt-2">
                      {/* Tag pills */}
                      <div className="flex flex-wrap gap-1">
                        {item.tags.map((tag, idx) => (
                          <span 
                            key={idx} 
                            className="text-[9px] font-bold text-gray-400 bg-[#161616] border border-borderGray px-2 py-0.5 rounded"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>

                      {/* Resource action link */}
                      <a
                        href={item.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full flex items-center justify-center gap-2 border border-borderGray hover:border-lightAccent hover:bg-lightAccent hover:text-darkBg active:scale-95 font-extrabold text-xs py-3 rounded-xl transition-all duration-200"
                      >
                        <span>Access Resource</span>
                        <ExternalLink size={12} />
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-darkCard border border-borderGray rounded-2xl">
              <p className="text-sm text-gray-500 font-semibold mb-2">No learning materials found matching your query.</p>
              <p className="text-xs text-gray-600">Try cleaning your search string or switching categories.</p>
              <button 
                onClick={() => { setSearchQuery(""); setActiveCategory("all"); }}
                className="mt-4 px-4 py-2 border border-borderGray hover:border-lightAccent text-xs font-bold rounded-xl text-lightAccent hover:bg-lightAccent hover:text-darkBg transition-all"
              >
                Clear Filters
              </button>
            </div>
          )}
        </>
      )}

      {/* Suggest Resource Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-[#121212] border border-borderGray rounded-2xl w-full max-w-[550px] p-6 shadow-2xl relative my-8">
            {/* Close Button */}
            <button
              onClick={() => setShowSubmitModal(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-lightAccent transition-colors text-lg font-bold"
            >
              <X size={18} />
            </button>

            <div className="space-y-4">
              <div className="border-b border-borderGray pb-3">
                <h3 className="text-xl font-extrabold text-lightAccent">Suggest a Resource</h3>
                <p className="text-xs text-gray-500">Contribute new online courses, videos, tutorials, or books to the community.</p>
              </div>

              {submitSuccess ? (
                <div className="py-8 text-center space-y-3">
                  <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto text-lg font-bold">
                    ✓
                  </div>
                  <h4 className="font-extrabold text-lightAccent">Submission Received!</h4>
                  <p className="text-xs text-gray-500">The resource database has been updated successfully.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4 text-xs font-semibold">
                  {submitError && (
                    <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-[11px]">
                      {submitError}
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    {/* Title */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-gray-400 uppercase tracking-wider text-[10px]">Resource Title *</label>
                      <input 
                        type="text" 
                        placeholder="e.g. Neural Networks Course" 
                        value={formTitle}
                        onChange={(e) => setFormTitle(e.target.value)}
                        className="w-full bg-[#161616] border border-borderGray rounded-lg px-3.5 py-2 text-lightAccent outline-none focus:border-lightAccent transition-colors"
                        required
                      />
                    </div>
                    {/* Creator */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-gray-400 uppercase tracking-wider text-[10px]">Creator / Author *</label>
                      <input 
                        type="text" 
                        placeholder="e.g. Andrej Karpathy" 
                        value={formCreator}
                        onChange={(e) => setFormCreator(e.target.value)}
                        className="w-full bg-[#161616] border border-borderGray rounded-lg px-3.5 py-2 text-lightAccent outline-none focus:border-lightAccent transition-colors"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {/* Type Category */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-gray-400 uppercase tracking-wider text-[10px]">Resource Type *</label>
                      <select
                        value={formType}
                        onChange={(e) => setFormType(e.target.value)}
                        className="w-full bg-[#161616] border border-borderGray rounded-lg px-3.5 py-2 text-lightAccent outline-none focus:border-lightAccent transition-colors cursor-pointer"
                      >
                        <option value="paid-courses">Paid Course</option>
                        <option value="youtube">YouTube Video/Playlist</option>
                        <option value="docs">Documentation / Tutorial</option>
                        <option value="books">Bestselling Book</option>
                      </select>
                    </div>

                    {/* Price options */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-gray-400 uppercase tracking-wider text-[10px]">Price Tier *</label>
                      <select
                        value={formPrice}
                        onChange={(e) => setFormPrice(e.target.value)}
                        className="w-full bg-[#161616] border border-borderGray rounded-lg px-3.5 py-2 text-lightAccent outline-none focus:border-lightAccent transition-colors cursor-pointer"
                      >
                        <option value="Free">Free</option>
                        <option value="Paid">Paid</option>
                        <option value="Free Web Version / Paid">Free Web Version / Paid</option>
                        <option value="Custom">Custom value...</option>
                      </select>
                    </div>
                  </div>

                  {/* Custom Price Value Input if selected Custom */}
                  {formPrice === "Custom" && (
                    <div className="flex flex-col gap-1.5">
                      <label className="text-gray-400 uppercase tracking-wider text-[10px]">Specify Custom Price *</label>
                      <input 
                        type="text" 
                        placeholder="e.g. Free (audit) / Paid certificate" 
                        value={formCustomPrice}
                        onChange={(e) => setFormCustomPrice(e.target.value)}
                        className="w-full bg-[#161616] border border-borderGray rounded-lg px-3.5 py-2 text-lightAccent outline-none focus:border-lightAccent transition-colors"
                        required
                      />
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* URL Link */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-gray-400 uppercase tracking-wider text-[10px] flex items-center gap-1.5">
                        <LinkIcon size={10} />
                        <span>URL Link Address *</span>
                      </label>
                      <input 
                        type="url" 
                        placeholder="https://example.com/course" 
                        value={formLink}
                        onChange={(e) => setFormLink(e.target.value)}
                        className="w-full bg-[#161616] border border-borderGray rounded-lg px-3.5 py-2 text-lightAccent outline-none focus:border-lightAccent transition-colors"
                        required
                      />
                    </div>

                    {/* Image URL Link (Optional) */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-gray-400 uppercase tracking-wider text-[10px] flex items-center gap-1.5">
                        <ImageIcon size={10} />
                        <span>Thumbnail Image URL (Optional)</span>
                      </label>
                      <input 
                        type="url" 
                        placeholder="https://unsplash.com/photos/your-image" 
                        value={formImage}
                        onChange={(e) => setFormImage(e.target.value)}
                        className="w-full bg-[#161616] border border-borderGray rounded-lg px-3.5 py-2 text-lightAccent outline-none focus:border-lightAccent transition-colors"
                      />
                    </div>
                  </div>

                  {/* Description */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-gray-400 uppercase tracking-wider text-[10px]">Brief Description *</label>
                    <textarea 
                      placeholder="Give a short summary of what developers will learn from this course/book..." 
                      value={formDescription}
                      onChange={(e) => setFormDescription(e.target.value)}
                      rows={3}
                      className="w-full bg-[#161616] border border-borderGray rounded-lg px-3.5 py-2 text-lightAccent outline-none focus:border-lightAccent transition-colors resize-none"
                      required
                    />
                  </div>

                  {/* Tags */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-gray-400 uppercase tracking-wider text-[10px]">Tags (comma-separated)</label>
                    <input 
                      type="text" 
                      placeholder="e.g. PyTorch, Generative AI, LLMs" 
                      value={formTags}
                      onChange={(e) => setFormTags(e.target.value)}
                      className="w-full bg-[#161616] border border-borderGray rounded-lg px-3.5 py-2 text-lightAccent outline-none focus:border-lightAccent transition-colors"
                    />
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-lightAccent text-darkBg hover:bg-white disabled:bg-gray-700 disabled:text-gray-500 font-extrabold text-xs py-3.5 rounded-xl transition-all duration-200 active:scale-[0.98] mt-2 flex items-center justify-center gap-2"
                  >
                    {submitting ? (
                      <>
                        <RefreshCw size={14} className="animate-spin" />
                        <span>Submitting Resource...</span>
                      </>
                    ) : (
                      <span>Submit Resource Suggestion</span>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
