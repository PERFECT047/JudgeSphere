import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Code,
  CheckCircle,
  TrendingUp,
  Clock,
  ArrowRight,
  Settings,
  FileText,
  Zap,
  BookOpen,
  Trophy,
  X,
  Copy,
  Check,
} from "lucide-react";
import { useAppSelector } from "../app/hooks";
import { getDashboardStatsAPI, type DashboardStats } from "../feature/auth/authAPI";
import { getAllTemplates, type CodeTemplate } from "../feature/snippets/snippetsAPI";

const LANGUAGES = [
  { id: "javascript", label: "JavaScript", icon: "🟨" },
  { id: "typescript", label: "TypeScript", icon: "🔷" },
  { id: "python", label: "Python", icon: "🐍" },
  { id: "java", label: "Java", icon: "☕" },
  { id: "cpp", label: "C++", icon: "⚙️" },
  { id: "c", label: "C", icon: "🔧" },
  { id: "go", label: "Go", icon: "🐹" },
  { id: "rust", label: "Rust", icon: "🦀" },
];

export default function DashboardPage() {
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.auth);

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [templates, setTemplates] = useState<CodeTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubmission, setSelectedSubmission] = useState<DashboardStats['recentSubmissions'][number] | null>(null);
  const [copied, setCopied] = useState(false);

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsData, templatesData] = await Promise.all([
          getDashboardStatsAPI(),
          getAllTemplates(),
        ]);
        setStats(statsData);
        setTemplates(templatesData);
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const statCards = [
    {
      label: "Total Submissions",
      value: stats?.totalSubmissions ?? 0,
      icon: Code,
      color: "text-blue-600 dark:text-blue-400",
      bg: "bg-blue-50 dark:bg-blue-900/20",
    },
    {
      label: "Accepted",
      value: stats?.acceptedSubmissions ?? 0,
      icon: CheckCircle,
      color: "text-green-600 dark:text-green-400",
      bg: "bg-green-50 dark:bg-green-900/20",
    },
    {
      label: "Acceptance Rate",
      value: `${stats?.acceptanceRate ?? 0}%`,
      icon: TrendingUp,
      color: "text-teal-600 dark:text-teal-400",
      bg: "bg-teal-50 dark:bg-teal-900/20",
    },
    {
      label: "Languages Used",
      value: stats?.languagesUsed?.length ?? 0,
      icon: Code,
      color: "text-purple-600 dark:text-purple-400",
      bg: "bg-purple-50 dark:bg-purple-900/20",
    },
  ];

  const navCards = [
    {
      title: "Problems",
      description: "Practice coding problems",
      icon: BookOpen,
      path: "/problems",
      color: "text-teal-600 dark:text-teal-400",
      border: "border-teal-200 dark:border-teal-800",
      bg: "bg-teal-50 dark:bg-teal-900/20",
    },
    {
      title: "Code Snippets",
      description: "Manage reusable code snippets",
      icon: Zap,
      path: "/snippets",
      color: "text-yellow-600 dark:text-yellow-400",
      border: "border-yellow-200 dark:border-yellow-800",
      bg: "bg-yellow-50 dark:bg-yellow-900/20",
    },
    {
      title: "Settings",
      description: "Update your profile and password",
      icon: Settings,
      path: "/settings",
      color: "text-slate-600 dark:text-slate-400",
      border: "border-slate-200 dark:border-slate-700",
      bg: "bg-slate-50 dark:bg-slate-800/50",
    },
  ];

  if (loading) {
    return (
      <div className="w-full max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">
            Welcome back, {user?.name?.split(" ")[0] || "User"} 👋
          </h1>
          <p className="text-slate-600 dark:text-slate-300 mt-1">
            Here's your coding progress overview
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-lg ${card.bg}`}>
                  <Icon className={`w-5 h-5 ${card.color}`} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">
                    {card.value}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {card.label}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {navCards.map((card) => {
          const Icon = card.icon;
          return (
            <button
              key={card.title}
              onClick={() => navigate(card.path)}
              className={`group text-left bg-white dark:bg-slate-900/80 border ${card.border} rounded-xl p-5 hover:shadow-lg transition-all hover:-translate-y-0.5`}
            >
              <div className={`p-3 rounded-lg ${card.bg} w-fit mb-3`}>
                <Icon className={`w-6 h-6 ${card.color}`} />
              </div>
              <h3 className="font-semibold text-slate-900 dark:text-white mb-1">
                {card.title}
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">
                {card.description}
              </p>
              <div className="flex items-center gap-1 text-sm font-medium text-teal-600 dark:text-teal-400 group-hover:gap-2 transition-all">
                Go <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </button>
          );
        })}
      </div>

      {/* Templates Section */}
      <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden shadow-sm mb-8">
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-teal-500" />
            Code Templates
          </h2>
          <button
            onClick={() => navigate("/snippets")}
            className="text-sm text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 font-medium"
          >
            Manage All
          </button>
        </div>
        <div className="p-5">
          {templates.length === 0 ? (
            <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-8">
              No templates found. Seed the database to create default templates.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {templates.map((template) => {
                const langInfo = LANGUAGES.find((l) => l.id === template.language);
                const preview = template.code.split("\n").slice(0, 3).join("\n");
                return (
                  <div
                    key={template._id || template.language}
                    className="border border-slate-200 dark:border-slate-700 rounded-lg p-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer group"
                    onClick={() => navigate(`/snippets?language=${template.language}`)}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm">{langInfo?.icon || "📄"}</span>
                      <span className="text-sm font-semibold text-slate-900 dark:text-white">
                        {langInfo?.label || template.language}
                      </span>
                    </div>
                    <pre className="text-[10px] font-mono text-slate-500 dark:text-slate-400 truncate leading-relaxed">
                      {preview}
                    </pre>
                    <div className="mt-2 text-xs text-teal-600 dark:text-teal-400 opacity-0 group-hover:opacity-100 transition-opacity">
                      View template →
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Recent Submissions */}
      {stats && stats.recentSubmissions.length > 0 && (
        <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden shadow-sm">
          <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-teal-500" />
              Recent Submissions
            </h2>
            <button
              onClick={() => navigate("/problems")}
              className="text-sm text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 font-medium"
            >
              View All
            </button>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {stats.recentSubmissions.map((sub, idx) => (
              <div
                key={idx}
                onClick={() => setSelectedSubmission(sub)}
                className="px-5 py-3 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors cursor-pointer group"
                title="Click to view submitted code"
              >
                <div className="flex items-center gap-3">
                  {sub.status === "Accepted" ? (
                    <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                  ) : (
                    <Trophy className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                  )}
                  <span className="text-sm text-slate-700 dark:text-slate-300 font-medium capitalize">
                    {sub.problemSlug.replace(/-/g, " ")}
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                    {sub.language}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
                    {sub.passedTestCases}/{sub.totalTestCases}
                  </span>
                  <span className="text-xs text-slate-400 dark:text-slate-500">
                    {new Date(sub.createdAt).toLocaleDateString()}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Code Viewer Modal */}
      {selectedSubmission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm transition-all duration-300">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh] transform transition-transform duration-300 scale-100">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white capitalize">
                    {selectedSubmission.problemSlug.replace(/-/g, " ")}
                  </h3>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    selectedSubmission.status === "Accepted"
                      ? "bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                      : "bg-yellow-50 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                  }`}>
                    {selectedSubmission.status}
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Submitted on {new Date(selectedSubmission.createdAt).toLocaleString()} in <span className="font-semibold capitalize text-teal-600 dark:text-teal-400">{selectedSubmission.language}</span>
                </p>
              </div>
              <button
                onClick={() => setSelectedSubmission(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto flex-1 bg-slate-950 font-mono text-sm text-slate-200 relative group">
              <button
                onClick={() => handleCopyCode(selectedSubmission.code)}
                className="absolute top-4 right-4 p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-all flex items-center gap-1.5 text-xs shadow-lg border border-slate-700/50"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-green-400" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    Copy Code
                  </>
                )}
              </button>
              <pre className="whitespace-pre-wrap overflow-x-auto selection:bg-teal-500/30">
                <code>{selectedSubmission.code}</code>
              </pre>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50 text-xs text-slate-500 dark:text-slate-400">
              <span>Test Cases: {selectedSubmission.passedTestCases}/{selectedSubmission.totalTestCases} Passed</span>
              <button
                onClick={() => setSelectedSubmission(null)}
                className="px-4 py-2 bg-slate-900 dark:bg-slate-100 hover:bg-slate-800 dark:hover:bg-white text-white dark:text-slate-900 rounded-lg font-semibold transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}