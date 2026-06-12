import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Editor from "@monaco-editor/react";
import {
  ArrowLeft,
  Play,
  Send,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  XCircle,
  Clock,
  FileText,
  History,
  Code,
  LogOut,
  GripVertical,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { logout } from "../feature/auth/authSlice";
import { logoutAPI } from "../feature/auth/authAPI";
import { getProblemBySlug, type Problem } from "../feature/problems/problemAPI";
import {
  runCode,
  submitCode,
  fetchSubmissions,
  clearCurrentResult,
} from "../feature/submissions/submissionSlice";
import type { Submission, TestCaseResult } from "../feature/submissions/submissionAPI";

const LANGUAGES = [
  { id: "javascript", label: "JavaScript", monacoId: "javascript", extension: "js" },
  { id: "python", label: "Python", monacoId: "python", extension: "py" },
  { id: "java", label: "Java", monacoId: "java", extension: "java" },
  { id: "cpp", label: "C++", monacoId: "cpp", extension: "cpp" },
  { id: "typescript", label: "TypeScript", monacoId: "typescript", extension: "ts" },
  { id: "go", label: "Go", monacoId: "go", extension: "go" },
  { id: "rust", label: "Rust", monacoId: "rust", extension: "rs" },
  { id: "c", label: "C", monacoId: "c", extension: "c" },
];

const DIFFICULTY_COLORS = {
  Easy: { bg: "bg-green-100 dark:bg-green-900/30", text: "text-green-700 dark:text-green-400", border: "border-green-300 dark:border-green-700" },
  Medium: { bg: "bg-yellow-100 dark:bg-yellow-900/30", text: "text-yellow-700 dark:text-yellow-400", border: "border-yellow-300 dark:border-yellow-700" },
  Hard: { bg: "bg-red-100 dark:bg-red-900/30", text: "text-red-700 dark:text-red-400", border: "border-red-300 dark:border-red-700" },
};

const SPLIT_STORAGE_KEY = "problemSplitPosition";
const RESPONSIVE_BREAKPOINT = 1024;

export default function ProblemSolvePage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const editorRef = useRef<Parameters<NonNullable<React.ComponentProps<typeof Editor>["onMount"]>>[0] | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);

  // Problem state
  const [problem, setProblem] = useState<Problem | null>(null);
  const [loading, setLoading] = useState(true);

  // Editor state
  const [selectedLanguage, setSelectedLanguage] = useState(LANGUAGES[0]);
  const [code, setCode] = useState("");
  const [activeTab, setActiveTab] = useState<"description" | "submissions">("description");
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);

  // Split panel state
  const [splitPosition, setSplitPosition] = useState(() => {
    const saved = localStorage.getItem(SPLIT_STORAGE_KEY);
    return saved ? parseFloat(saved) : 50;
  });
  const [isStacked, setIsStacked] = useState(false);
  const [expandedSubmission, setExpandedSubmission] = useState<string | null>(null);

  // Redux state
  const {
    submissions,
    currentResult,
    loading: submissionLoading,
    submitting,
    error: submissionError,
  } = useAppSelector((state) => state.submissions);

  // Responsive check
  useEffect(() => {
    const checkResponsive = () => {
      setIsStacked(window.innerWidth < RESPONSIVE_BREAKPOINT);
    };
    checkResponsive();
    window.addEventListener("resize", checkResponsive);
    return () => window.removeEventListener("resize", checkResponsive);
  }, []);

  // Fetch problem
  useEffect(() => {
    const fetchProblem = async () => {
      if (!slug) return;
      setLoading(true);
      try {
        const data = await getProblemBySlug(slug);
        setProblem(data);
        const starter = data.starterCode[selectedLanguage.id] || data.starterCode.javascript || "";
        setCode(starter);
      } catch (error) {
        console.error("Failed to fetch problem:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProblem();
  }, [slug]);


  // Fetch submissions when tab changes to submissions
  useEffect(() => {
    if (activeTab === "submissions" && slug) {
      dispatch(fetchSubmissions(slug));
    }
  }, [activeTab, slug, dispatch]);

  // Clear current result when switching to submissions tab
  useEffect(() => {
    if (activeTab === "submissions") {
      dispatch(clearCurrentResult());
    }
  }, [activeTab, dispatch]);

  // Save split position to localStorage
  useEffect(() => {
    localStorage.setItem(SPLIT_STORAGE_KEY, splitPosition.toString());
  }, [splitPosition]);

  // Drag handlers
  const handleDragStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    isDragging.current = true;
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
  }, []);

  const handleDragMove = useCallback((e: MouseEvent) => {
    if (!isDragging.current || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = (x / rect.width) * 100;
    setSplitPosition(Math.max(20, Math.min(80, percentage)));
  }, []);

  const handleDragEnd = useCallback(() => {
    isDragging.current = false;
    document.body.style.cursor = "";
    document.body.style.userSelect = "";
  }, []);

  useEffect(() => {
    document.addEventListener("mousemove", handleDragMove);
    document.addEventListener("mouseup", handleDragEnd);
    return () => {
      document.removeEventListener("mousemove", handleDragMove);
      document.removeEventListener("mouseup", handleDragEnd);
    };
  }, [handleDragMove, handleDragEnd]);

  const handleEditorDidMount = (editor: Parameters<NonNullable<React.ComponentProps<typeof Editor>["onMount"]>>[0]) => {
    editorRef.current = editor;
    editor.focus();
  };

  const handleCodeChange = (value: string | undefined) => {
    if (value !== undefined) {
      setCode(value);
    }
  };

  const handleRun = async () => {
    if (!problem) return;
    dispatch(
      runCode({
        problemSlug: problem.slug,
        language: selectedLanguage.id,
        code,
      })
    );
  };

  const handleSubmit = async () => {
    if (!problem) return;
    dispatch(
      submitCode({
        problemSlug: problem.slug,
        language: selectedLanguage.id,
        code,
      })
    );
  };

  const handleLanguageChange = (lang: (typeof LANGUAGES)[0]) => {
    setSelectedLanguage(lang);
    setShowLanguageDropdown(false);
  };

  const handleLogout = async () => {
    try {
      await logoutAPI();
    } catch (error) {
      console.error("Logout API error:", error);
    } finally {
      dispatch(logout());
      window.location.href = "/login";
    }
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="w-full max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-center">
          <div className="animate-spin w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full"></div>
        </div>
      </div>
    );
  }

  if (!problem) {
    return (
      <div className="w-full max-w-6xl mx-auto px-4 py-8">
        <div className="text-center text-slate-500 dark:text-slate-400">Problem not found</div>
      </div>
    );
  }

  const colors = DIFFICULTY_COLORS[problem.difficulty];

  // Left panel content (problem description / submissions)
  const leftPanelContent = (
    <div className="flex flex-col h-full">
      {/* Tabs */}
      <div className="flex items-center gap-4 mb-4 border-b border-slate-200 dark:border-slate-700">
        <button
          onClick={() => setActiveTab("description")}
          className={`flex items-center gap-1.5 text-sm font-medium pb-3 transition-colors ${
            activeTab === "description"
              ? "text-teal-600 dark:text-teal-400 border-b-2 border-teal-600 dark:border-teal-400"
              : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
          }`}
        >
          <FileText className="w-4 h-4" />
          Description
        </button>
        <button
          onClick={() => setActiveTab("submissions")}
          className={`flex items-center gap-1.5 text-sm font-medium pb-3 transition-colors ${
            activeTab === "submissions"
              ? "text-teal-600 dark:text-teal-400 border-b-2 border-teal-600 dark:border-teal-400"
              : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
          }`}
        >
          <History className="w-4 h-4" />
          Submissions
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto pr-2">
        {activeTab === "description" ? (
          <div className="space-y-6">
            {/* Description */}
            <div className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
              {problem.description}
            </div>

            {/* Examples */}
            {problem.examples.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Examples:</h3>
                {problem.examples.map((ex, idx) => (
                  <div
                    key={idx}
                    className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg p-4 space-y-2"
                  >
                    <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                      Example {idx + 1}:
                    </div>
                    <div className="text-sm">
                      <span className="text-slate-500 dark:text-slate-400">Input: </span>
                      <code className="text-green-700 dark:text-green-400 font-mono text-xs bg-green-50 dark:bg-green-900/20 px-1.5 py-0.5 rounded">
                        {ex.input}
                      </code>
                    </div>
                    <div className="text-sm">
                      <span className="text-slate-500 dark:text-slate-400">Output: </span>
                      <code className="text-blue-700 dark:text-blue-400 font-mono text-xs bg-blue-50 dark:bg-blue-900/20 px-1.5 py-0.5 rounded">
                        {ex.output}
                      </code>
                    </div>
                    {ex.explanation && (
                      <div className="text-sm">
                        <span className="text-slate-500 dark:text-slate-400">Explanation: </span>
                        <span className="text-slate-600 dark:text-slate-300">{ex.explanation}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Constraints */}
            {problem.constraints.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Constraints:</h3>
                <ul className="list-disc list-inside space-y-1">
                  {problem.constraints.map((c, idx) => (
                    <li
                      key={idx}
                      className="text-sm text-slate-600 dark:text-slate-400 font-mono"
                    >
                      {c}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Note */}
            {problem.note && (
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                <div className="text-xs text-yellow-700 dark:text-yellow-400 font-medium mb-1">
                  Note:
                </div>
                <div className="text-sm text-slate-600 dark:text-slate-300">{problem.note}</div>
              </div>
            )}
          </div>
        ) : (
          /* Submissions Tab */
          <div className="space-y-3">
            {submissionLoading && submissions.length === 0 ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin w-6 h-6 border-2 border-teal-500 border-t-transparent rounded-full"></div>
              </div>
            ) : submissions.length === 0 ? (
              <div className="text-center py-12 text-slate-500 dark:text-slate-400 text-sm">
                No submissions yet. Submit your code to see results here.
              </div>
            ) : (
              submissions.map((sub) => (
                <SubmissionCard
                  key={sub._id}
                  submission={sub}
                  isExpanded={expandedSubmission === sub._id}
                  onToggle={() =>
                    setExpandedSubmission(expandedSubmission === sub._id ? null : sub._id)
                  }
                  formatDate={formatDate}
                />
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );

  // Right panel content (editor + results)
  const rightPanelContent = (
    <div className="flex flex-col h-full">
      {/* Editor */}
      <div className="flex-1 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-md min-h-0">
        <Editor
          height="100%"
          language={selectedLanguage.monacoId}
          value={code}
          onChange={handleCodeChange}
          onMount={handleEditorDidMount}
          theme="vs-dark"
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
            lineNumbers: "on",
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 2,
            wordWrap: "on",
            bracketPairColorization: { enabled: true },
            cursorBlinking: "smooth",
            cursorSmoothCaretAnimation: "on",
            smoothScrolling: true,
            padding: { top: 16, bottom: 16 },
            suggest: {
              showKeywords: true,
              showSnippets: true,
            },
            quickSuggestions: true,
            formatOnPaste: true,
            formatOnType: true,
          }}
        />
      </div>

      {/* Test Results Panel (shown after run) */}
      {currentResult && (
        <div className="mt-3 bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden shadow-md">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold text-slate-900 dark:text-white">
                Run Results
              </span>
              <span
                className={`text-xs font-medium px-2 py-0.5 rounded-lg ${
                  currentResult.status === "Accepted"
                    ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                    : "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400"
                }`}
              >
                {currentResult.passedTestCases}/{currentResult.totalTestCases} passed
              </span>
            </div>
            <button
              onClick={() => dispatch(clearCurrentResult())}
              className="text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
            >
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>
          <div className="max-h-48 overflow-y-auto p-4 space-y-2">
            {currentResult.testCaseResults.map((result: TestCaseResult, idx: number) => (
              <div
                key={idx}
                className={`flex items-center gap-3 p-2 rounded-lg text-sm ${
                  result.passed
                    ? "bg-green-50 dark:bg-green-900/20"
                    : "bg-red-50 dark:bg-red-900/20"
                }`}
              >
                {result.passed ? (
                  <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0" />
                ) : (
                  <XCircle className="w-4 h-4 text-red-600 dark:text-red-400 flex-shrink-0" />
                )}
                <span
                  className={
                    result.passed
                      ? "text-green-700 dark:text-green-400"
                      : "text-red-700 dark:text-red-400"
                  }
                >
                  Test Case {idx + 1}
                </span>
                {result.runtime && (
                  <span className="text-slate-500 dark:text-slate-400 text-xs flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {result.runtime}ms
                  </span>
                )}
                {!result.passed && (
                  <span className="text-xs text-slate-500 dark:text-slate-400 ml-auto">
                    Expected: {result.expected}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Submission error */}
      {submissionError && (
        <div className="mt-3 text-sm font-medium text-red-500 bg-red-50 dark:bg-red-950/30 p-3 rounded-xl border border-red-200 dark:border-red-900/50">
          {submissionError}
        </div>
      )}
    </div>
  );

  return (
    <div className="w-full h-full flex flex-col" style={{ height: "calc(100vh - 48px)" }}>
      {/* Top Bar */}
      <div className="mb-4 flex items-center justify-between flex-shrink-0 px-4 pt-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/problems")}
            className="flex items-center gap-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <div className="h-4 w-px bg-slate-300 dark:bg-slate-700"></div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">
            {problem.problemNumber}. {problem.title}
          </h1>
          <span
            className={`px-2.5 py-0.5 rounded-lg text-xs font-medium ${colors.bg} ${colors.text} border ${colors.border}`}
          >
            {problem.difficulty}
          </span>
        </div>
        <div className="flex items-center gap-3">
          {/* Language Selector */}
          <div className="relative">
            <button
              onClick={() => setShowLanguageDropdown(!showLanguageDropdown)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700 text-sm text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600 transition-all"
            >
              <Code className="w-4 h-4" />
              {selectedLanguage.label}
              {showLanguageDropdown ? (
                <ChevronUp className="w-3 h-3" />
              ) : (
                <ChevronDown className="w-3 h-3" />
              )}
            </button>
            {showLanguageDropdown && (
              <div className="absolute right-0 top-full mt-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg py-1 z-50 min-w-[160px] shadow-lg">
                {LANGUAGES.map((lang) => (
                  <button
                    key={lang.id}
                    onClick={() => handleLanguageChange(lang)}
                    className={`w-full px-3 py-2 text-left text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors ${
                      selectedLanguage.id === lang.id
                        ? "text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-900/30"
                        : "text-slate-700 dark:text-slate-300"
                    }`}
                  >
                    {lang.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Run Button */}
          <button
            onClick={handleRun}
            disabled={submissionLoading}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700 text-sm text-slate-700 dark:text-slate-300 hover:border-green-400 dark:hover:border-green-600 hover:text-green-600 dark:hover:text-green-400 transition-all disabled:opacity-50"
          >
            {submissionLoading ? (
              <div className="animate-spin w-4 h-4 border-2 border-green-500 border-t-transparent rounded-full"></div>
            ) : (
              <Play className="w-4 h-4" />
            )}
            Run
          </button>

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-teal-600 text-sm text-white hover:bg-teal-700 active:scale-95 transition-all duration-150 shadow-md disabled:opacity-50"
          >
            {submitting ? (
              <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
            ) : (
              <Send className="w-4 h-4" />
            )}
            Submit
          </button>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 active:scale-95 text-white font-semibold rounded-lg transition-all duration-150 shadow-md hover:shadow-red-500/20"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Content */}
      {isStacked ? (
        /* Stacked Layout (small screens) */
        <div className="flex-1 flex flex-col gap-4 px-4 pb-4 overflow-hidden">
          <div className="h-1/2 overflow-hidden">{leftPanelContent}</div>
          <div className="flex-1 overflow-hidden">{rightPanelContent}</div>
        </div>
      ) : (
        /* Side-by-side Layout with resizable split */
        <div
          ref={containerRef}
          className="flex-1 flex gap-0 px-4 pb-4 overflow-hidden"
        >
          {/* Left Panel */}
          <div
            className="overflow-hidden pr-3"
            style={{ width: `${splitPosition}%` }}
          >
            {leftPanelContent}
          </div>

          {/* Drag Handle */}
          <div
            onMouseDown={handleDragStart}
            className="w-1.5 flex-shrink-0 flex items-center justify-center cursor-col-resize group hover:bg-teal-500/20 rounded transition-colors"
          >
            <GripVertical className="w-4 h-4 text-slate-400 dark:text-slate-500 group-hover:text-teal-500 transition-colors" />
          </div>

          {/* Right Panel */}
          <div
            className="overflow-hidden pl-3"
            style={{ width: `${100 - splitPosition}%` }}
          >
            {rightPanelContent}
          </div>
        </div>
      )}
    </div>
  );
}

// Submission Card Component
function SubmissionCard({
  submission,
  isExpanded,
  onToggle,
  formatDate,
}: {
  submission: Submission;
  isExpanded: boolean;
  onToggle: () => void;
  formatDate: (dateStr: string) => string;
}) {
  const isAccepted = submission.status === "Accepted";

  return (
    <div
      className={`border rounded-xl overflow-hidden transition-all ${
        isAccepted
          ? "border-green-200 dark:border-green-800/50 bg-green-50/50 dark:bg-green-900/10"
          : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/50"
      }`}
    >
      {/* Header */}
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
      >
        <div className="flex items-center gap-3">
          {isAccepted ? (
            <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" />
          ) : (
            <XCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" />
          )}
          <span
            className={`text-sm font-semibold ${
              isAccepted
                ? "text-green-700 dark:text-green-400"
                : "text-red-700 dark:text-red-400"
            }`}
          >
            {submission.status}
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            {submission.passedTestCases}/{submission.totalTestCases} test cases
          </span>
          <span className="text-xs text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
            {submission.language}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 dark:text-slate-400">
            {formatDate(submission.createdAt)}
          </span>
          {isExpanded ? (
            <ChevronUp className="w-4 h-4 text-slate-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-400" />
          )}
        </div>
      </button>

      {/* Expanded Details */}
      {isExpanded && (
        <div className="border-t border-slate-200 dark:border-slate-700 px-4 py-3 space-y-2 max-h-64 overflow-y-auto">
          {submission.testCaseResults.map((tc, idx) => (
            <div
              key={idx}
              className={`flex items-start gap-3 p-2 rounded-lg text-sm ${
                tc.passed
                  ? "bg-green-50 dark:bg-green-900/20"
                  : "bg-red-50 dark:bg-red-900/20"
              }`}
            >
              {tc.passed ? (
                <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
              ) : (
                <XCircle className="w-4 h-4 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span
                    className={`font-medium ${
                      tc.passed
                        ? "text-green-700 dark:text-green-400"
                        : "text-red-700 dark:text-red-400"
                    }`}
                  >
                    Test Case {idx + 1}
                  </span>
                  {tc.runtime && (
                    <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {tc.runtime}ms
                    </span>
                  )}
                </div>
                {!tc.passed && (
                  <div className="mt-1.5 space-y-1 text-xs">
                    <div>
                      <span className="text-slate-500 dark:text-slate-400 font-medium">Input: </span>
                      <code className="text-green-700 dark:text-green-400 font-mono bg-green-50 dark:bg-green-900/20 px-1 py-0.5 rounded">
                        {tc.input}
                      </code>
                    </div>
                    <div>
                      <span className="text-slate-500 dark:text-slate-400 font-medium">Expected: </span>
                      <code className="text-blue-700 dark:text-blue-400 font-mono bg-blue-50 dark:bg-blue-900/20 px-1 py-0.5 rounded">
                        {tc.expected}
                      </code>
                    </div>
                    <div>
                      <span className="text-slate-500 dark:text-slate-400 font-medium">Your output: </span>
                      <code className="text-red-700 dark:text-red-400 font-mono bg-red-50 dark:bg-red-900/20 px-1 py-0.5 rounded">
                        {tc.actual}
                      </code>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}