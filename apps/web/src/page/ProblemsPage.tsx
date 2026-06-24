import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Tag, BookOpen, CheckCircle, HelpCircle } from "lucide-react";
import { getProblems, getAllTopics, getAllTags, type ProblemSummary } from "../feature/problems/problemAPI";

export default function ProblemsPage() {
  const navigate = useNavigate();
  const [problems, setProblems] = useState<ProblemSummary[]>([]);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 0,
    hasNext: false,
    hasPrev: false,
  });

  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);

  const [availableTopics, setAvailableTopics] = useState<string[]>([]);
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    const fetchProblems = async () => {
      setLoading(true);
      try {
        const result = await getProblems({
          topics: selectedTopics.length > 0 ? selectedTopics : undefined,
          tags: selectedTags.length > 0 ? selectedTags : undefined,
          page: currentPage,
          limit: 20,
        });
        setProblems(result.problems);
        setPagination(result.pagination);
      } catch (error) {
        if (!controller.signal.aborted) {
          console.error("Failed to fetch problems:", error);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchProblems();
    return () => controller.abort();
  }, [selectedTopics, selectedTags, currentPage]);

  useEffect(() => {
    const fetchFilters = async () => {
      try {
        const [topics, tags] = await Promise.all([getAllTopics(), getAllTags()]);
        setAvailableTopics(topics);
        setAvailableTags(tags);
      } catch (error) {
        console.error("Failed to fetch filters:", error);
      }
    };
    fetchFilters();
  }, []);

  const toggleTopic = (topic: string) => {
    setSelectedTopics((prev) =>
      prev.includes(topic) ? prev.filter((t) => t !== topic) : [...prev, topic]
    );
    setCurrentPage(1);
  };

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setSelectedTopics([]);
    setSelectedTags([]);
    setCurrentPage(1);
  };

  const activeFilterCount = selectedTopics.length + selectedTags.length;

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-8">
      {/* Header Section */}
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white mb-2">
            Problems
          </h1>
          <p className="text-slate-600 dark:text-slate-300">
            {pagination.total} problems total • Practice and improve your skills
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="mb-6">
        <div className="flex gap-4">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-3 rounded-lg border text-sm font-medium transition-all ${
              showFilters || activeFilterCount > 0
                ? "bg-teal-50 dark:bg-teal-900/30 border-teal-300 dark:border-teal-700 text-teal-700 dark:text-teal-400"
                : "bg-white dark:bg-slate-900/80 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600"
            }`}
          >
            <Tag className="w-4 h-4" />
            Filters
            {activeFilterCount > 0 && (
              <span className="bg-teal-600 text-white text-xs rounded-full px-2 py-0.5">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="mt-4 bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700 rounded-xl p-4 space-y-4 shadow-md">
            {/* Topics Filter */}
            <div>
              <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 block">
                Topics
              </label>
              <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                {availableTopics.map((topic: string) => (
                  <button
                    key={topic}
                    onClick={() => toggleTopic(topic)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                      selectedTopics.includes(topic)
                        ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border border-blue-300 dark:border-blue-700"
                        : "bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                    }`}
                  >
                    {topic}
                  </button>
                ))}
              </div>
            </div>

            {/* Tags Filter */}
            <div>
              <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 block">
                Tags
              </label>
              <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                {availableTags.map((tag: string) => (
                  <button
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                      selectedTags.includes(tag)
                        ? "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 border border-purple-300 dark:border-purple-700"
                        : "bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Clear Filters */}
            {activeFilterCount > 0 && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-1 text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors"
              >
                <Tag className="w-4 h-4" />
                Clear all filters
              </button>
            )}
          </div>
        )}

        {/* Active Filters Display */}
        {activeFilterCount > 0 && !showFilters && (
          <div className="flex flex-wrap gap-2 mt-4">
            {selectedTopics.map((topic: string) => (
              <span
                key={topic}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400"
              >
                <BookOpen className="w-3 h-3" />
                {topic}
                <Tag
                  className="w-3 h-3 cursor-pointer"
                  onClick={() => toggleTopic(topic)}
                />
              </span>
            ))}
            {selectedTags.map((tag: string) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400"
              >
                <Tag className="w-3 h-3" />
                {tag}
                <Tag
                  className="w-3 h-3 cursor-pointer"
                  onClick={() => toggleTag(tag)}
                />
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Problems Table */}
      <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-md">
        {/* Table Header */}
        <div className="grid grid-cols-12 gap-4 px-6 py-3 border-b border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
          <div className="col-span-1">#</div>
          <div className="col-span-5">Title</div>
          <div className="col-span-3">Topics</div>
          <div className="col-span-3">Tags</div>
        </div>

        {/* Table Body */}
        {loading ? (
          <div className="px-6 py-12 text-center text-slate-500 dark:text-slate-400">
            <div className="animate-spin w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            Loading problems...
          </div>
        ) : problems.length === 0 ? (
          <div className="px-6 py-12 text-center text-slate-500 dark:text-slate-400">
            No problems found matching your criteria.
          </div>
        ) : (
          problems.map((problem) => (
            <div
              key={problem._id}
              onClick={() => navigate(`/problems/${problem.slug}`)}
              className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors"
            >
              <div className="col-span-1 text-slate-500 dark:text-slate-400 text-sm font-mono">
                {problem.problemNumber}
              </div>
              <div className="col-span-5 flex items-center gap-2">
                {problem.state === "Solved" && (
                  <span title="Solved" className="flex-shrink-0">
                    <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                  </span>
                )}
                {problem.state === "Attempted" && (
                  <span title="Attempted" className="flex-shrink-0">
                    <HelpCircle className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                  </span>
                )}
                <div className="text-sm font-medium text-slate-900 dark:text-white hover:text-teal-600 dark:hover:text-teal-400 transition-colors">
                  {problem.title}
                </div>
              </div>
              <div className="col-span-3 flex flex-wrap gap-1">
                {problem.topics.slice(0, 2).map((topic: string) => (
                  <span
                    key={topic}
                    className="px-2 py-0.5 rounded-lg text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                  >
                    {topic}
                  </span>
                ))}
                {problem.topics.length > 2 && (
                  <span className="px-2 py-0.5 rounded-lg text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-500">
                    +{problem.topics.length - 2}
                  </span>
                )}
              </div>
              <div className="col-span-3 flex flex-wrap gap-1">
                {(problem.tags || []).slice(0, 2).map((tag: string) => (
                  <span
                    key={tag}
                    className="px-2 py-0.5 rounded-lg text-[10px] font-medium bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400 border border-teal-100 dark:border-teal-900/50"
                  >
                    {tag}
                  </span>
                ))}
                {(problem.tags || []).length > 2 && (
                  <span className="px-2 py-0.5 rounded-lg text-[10px] font-medium bg-teal-50 dark:bg-teal-900/30 text-teal-600 dark:text-teal-500 border border-teal-100 dark:border-teal-900/50">
                    +{(problem.tags || []).length - 2}
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between">
          <div className="text-sm text-slate-500 dark:text-slate-400">
            Showing {((currentPage - 1) * 20) + 1} to {Math.min(currentPage * 20, pagination.total)} of {pagination.total} problems
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(1)}
              disabled={!pagination.hasPrev}
              className="px-3 py-2 rounded-lg text-sm font-medium bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:border-slate-300 dark:hover:border-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              First
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={!pagination.hasPrev}
              className="px-3 py-2 rounded-lg text-sm font-medium bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:border-slate-300 dark:hover:border-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              ‹
            </button>

            {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
              let pageNum: number;
              if (pagination.totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= pagination.totalPages - 2) {
                pageNum = pagination.totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }
              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    currentPage === pageNum
                      ? "bg-teal-50 dark:bg-teal-900/30 border border-teal-300 dark:border-teal-700 text-teal-700 dark:text-teal-400"
                      : "bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:border-slate-300 dark:hover:border-slate-600"
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}

            <button
              onClick={() => setCurrentPage((p) => Math.min(pagination.totalPages, p + 1))}
              disabled={!pagination.hasNext}
              className="px-3 py-2 rounded-lg text-sm font-medium bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:border-slate-300 dark:hover:border-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              ›
            </button>
            <button
              onClick={() => setCurrentPage(pagination.totalPages)}
              disabled={!pagination.hasNext}
              className="px-3 py-2 rounded-lg text-sm font-medium bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:border-slate-300 dark:hover:border-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              Last
            </button>
          </div>
        </div>
      )}
    </div>
  );
}