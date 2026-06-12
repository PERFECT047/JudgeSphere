import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Code,
  Plus,
  Trash2,
  Edit3,
  X,
  Save,
  Search,
  ChevronDown,
  ChevronUp,
  LogOut,
  ArrowLeft,
} from "lucide-react";
import { useAppSelector, useAppDispatch } from "../app/hooks";
import { logout } from "../feature/auth/authSlice";
import { logoutAPI } from "../feature/auth/authAPI";
import {
  getSnippets,
  createSnippet,
  updateSnippet,
  deleteSnippet,
  getAllTemplates,
  saveUserTemplate,
  type CodeSnippet,
  type CodeTemplate,
} from "../feature/snippets/snippetsAPI";

const LANGUAGES = [
  { id: "all", label: "All Languages" },
  { id: "javascript", label: "JavaScript" },
  { id: "typescript", label: "TypeScript" },
  { id: "python", label: "Python" },
  { id: "java", label: "Java" },
  { id: "cpp", label: "C++" },
  { id: "c", label: "C" },
  { id: "go", label: "Go" },
  { id: "rust", label: "Rust" },
];

interface SnippetForm {
  language: string;
  prefix: string;
  body: string;
  description: string;
}

const emptyForm: SnippetForm = {
  language: "javascript",
  prefix: "",
  body: "",
  description: "",
};

export default function SnippetManagerPage() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  useAppSelector((state) => state.auth);

  const [snippets, setSnippets] = useState<CodeSnippet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<SnippetForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [expandedSnippet, setExpandedSnippet] = useState<string | null>(null);

  // Template state
  const [activeView, setActiveView] = useState<"snippets" | "templates">("snippets");
  const [templates, setTemplates] = useState<CodeTemplate[]>([]);
  const [editingTemplateLang, setEditingTemplateLang] = useState<string | null>(null);
  const [templateCode, setTemplateCode] = useState("");
  const [savingTemplate, setSavingTemplate] = useState(false);

  // Fetch snippets when language or search changes
  useEffect(() => {
    let cancelled = false;
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getSnippets({
          language: selectedLanguage === "all" ? undefined : selectedLanguage,
          search: searchQuery || undefined,
          includeBuiltIn: true,
        });
        if (!cancelled) {
          setSnippets(data);
        }
      } catch (err: unknown) {
        if (!cancelled) {
          const message = err instanceof Error ? err.message : "Failed to fetch snippets";
          setError(message);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };
    fetchData();
    return () => { cancelled = true; };
  }, [selectedLanguage, searchQuery]);

  // Fetch templates
  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const data = await getAllTemplates();
        setTemplates(data);
      } catch (err) {
        console.error("Failed to fetch templates:", err);
      }
    };
    fetchTemplates();
  }, []);

  const handleSaveTemplate = async (language: string) => {
    if (!templateCode.trim()) {
      setError("Template code cannot be empty");
      return;
    }
    setSavingTemplate(true);
    try {
      await saveUserTemplate({ language, code: templateCode });
      // Refresh templates
      const data = await getAllTemplates();
      setTemplates(data);
      setEditingTemplateLang(null);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to save template";
      setError(message);
    } finally {
      setSavingTemplate(false);
    }
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

  const openCreateForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(true);
  };

  const openEditForm = (snippet: CodeSnippet) => {
    setForm({
      language: snippet.language,
      prefix: snippet.prefix,
      body: snippet.body,
      description: snippet.description,
    });
    setEditingId(snippet._id!);
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
  };

  const handleSave = async () => {
    if (!form.prefix.trim() || !form.body.trim()) {
      setError("Prefix and body are required");
      return;
    }

    setSaving(true);
    setError(null);
    try {
      if (editingId) {
        await updateSnippet(editingId, form);
      } else {
        await createSnippet(form);
      }
      closeForm();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to save snippet";
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this snippet?")) return;
    try {
      await deleteSnippet(id);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to delete snippet";
      setError(message);
    }
  };

  const filteredSnippets = snippets.filter((s) => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        s.prefix.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="w-full h-full flex flex-col" style={{ height: "calc(100vh - 48px)" }}>
      {/* Top Bar */}
      <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/problems")}
            className="flex items-center gap-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Problems
          </button>
          <div className="h-4 w-px bg-slate-300 dark:bg-slate-700"></div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Code className="w-5 h-5 text-teal-500" />
            Code Snippets
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={openCreateForm}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-teal-600 text-white text-sm hover:bg-teal-700 transition-all shadow-md"
          >
            <Plus className="w-4 h-4" />
            New Snippet
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm transition-all shadow-md"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* View Tabs */}
      <div className="flex items-center gap-1 px-4 pt-3 border-b border-slate-200 dark:border-slate-700">
        <button
          onClick={() => setActiveView("snippets")}
          className={`px-3 py-2 text-sm font-medium rounded-t-lg transition-colors ${
            activeView === "snippets"
              ? "bg-white dark:bg-slate-800 text-teal-600 dark:text-teal-400 border border-b-0 border-slate-200 dark:border-slate-700"
              : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
          }`}
        >
          <Code className="w-4 h-4 inline mr-1.5" />
          Snippets
        </button>
        <button
          onClick={() => setActiveView("templates")}
          className={`px-3 py-2 text-sm font-medium rounded-t-lg transition-colors ${
            activeView === "templates"
              ? "bg-white dark:bg-slate-800 text-teal-600 dark:text-teal-400 border border-b-0 border-slate-200 dark:border-slate-700"
              : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
          }`}
        >
          <Edit3 className="w-4 h-4 inline mr-1.5" />
          Templates
        </button>
      </div>

      {/* Filters - Snippets view */}
      {activeView === "snippets" && (
      <div className="flex items-center gap-4 px-4 py-3 border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Language:</span>
          <select
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
            className="text-sm px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300"
          >
            {LANGUAGES.map((lang) => (
              <option key={lang.id} value={lang.id}>
                {lang.label}
              </option>
            ))}
          </select>
        </div>
        <div className="flex-1 max-w-xs relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search snippets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300"
          />
        </div>
        <span className="text-xs text-slate-400 dark:text-slate-500">
          {filteredSnippets.length} snippet{filteredSnippets.length !== 1 ? "s" : ""}
        </span>
      </div>
      )}

      {/* Error message */}
      {error && (
        <div className="mx-4 mt-3 px-3 py-2 text-sm font-medium text-red-500 bg-red-50 dark:bg-red-950/30 rounded-lg border border-red-200 dark:border-red-900/50">
          {error}
          <button onClick={() => setError(null)} className="ml-2">
            <X className="w-3 h-3 inline" />
          </button>
        </div>
      )}

      {/* Create/Edit Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                {editingId ? (
                  <>
                    <Edit3 className="w-4 h-4 text-teal-500" />
                    Edit Snippet
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 text-teal-500" />
                    New Snippet
                  </>
                )}
              </h2>
              <button
                onClick={closeForm}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Language
                  </label>
                  <select
                    value={form.language}
                    onChange={(e) => setForm({ ...form, language: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                  >
                    {LANGUAGES.filter((l) => l.id !== "all").map((lang) => (
                      <option key={lang.id} value={lang.id}>
                        {lang.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Prefix <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.prefix}
                    onChange={(e) => setForm({ ...form, prefix: e.target.value })}
                    placeholder="e.g., psvm"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Description
                </label>
                <input
                  type="text"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Short description of the snippet"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Snippet Body <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={form.body}
                  onChange={(e) => setForm({ ...form, body: e.target.value })}
                  placeholder={`// Use $1, $2, ... for tab stops\n// e.g.: public static void main(String[] args) {\n//     $1\n// }`}
                  rows={8}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono"
                />
                <p className="text-xs text-slate-400 mt-1">
                  Use $1, $2, etc. for tab stops. $0 is the final cursor position.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 p-4 border-t border-slate-200 dark:border-slate-700">
              <button
                onClick={closeForm}
                className="px-4 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !form.prefix.trim() || !form.body.trim()}
                className="flex items-center gap-2 px-4 py-2 text-sm rounded-lg bg-teal-600 text-white hover:bg-teal-700 disabled:opacity-50 transition-all shadow-md"
              >
                {saving ? (
                  <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                ) : (
                  <Save className="w-4 h-4" />
                )}
                {editingId ? "Update" : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Content based on active view */}
      <div className="flex-1 overflow-y-auto p-4">
      {activeView === "templates" ? (
        /* Templates View */
        <div className="space-y-3">
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
            Edit your language templates. Your custom templates will be used instead of the default ones when you solve problems.
          </p>
          {templates.filter(t => !t.isDefault).length === 0 && templates.filter(t => t.isDefault).length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-500 dark:text-slate-400">
              <Edit3 className="w-12 h-12 mb-3 opacity-30" />
              <p className="text-sm font-medium">No templates found</p>
              <p className="text-xs mt-1">Templates will appear here once seeded</p>
            </div>
          ) : (
            <>
              {/* User's custom templates */}
              {templates.filter(t => !t.isDefault).length > 0 && (
                <div>
                  <h3 className="text-xs font-semibold text-teal-600 dark:text-teal-400 uppercase tracking-wider mb-2">Your Custom Templates</h3>
                  <div className="grid gap-2">
                    {templates.filter(t => !t.isDefault).map((template) => (
                      <TemplateCard
                        key={template._id || template.language}
                        template={template}
                        editingTemplateLang={editingTemplateLang}
                        setEditingTemplateLang={setEditingTemplateLang}
                        templateCode={templateCode}
                        setTemplateCode={setTemplateCode}
                        savingTemplate={savingTemplate}
                        handleSaveTemplate={handleSaveTemplate}
                      />
                    ))}
                  </div>
                </div>
              )}
              {/* Default templates */}
              <div>
                <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Default Templates</h3>
                <div className="grid gap-2">
                  {templates.filter(t => t.isDefault).map((template) => (
                    <TemplateCard
                      key={template._id || template.language}
                      template={template}
                      editingTemplateLang={editingTemplateLang}
                      setEditingTemplateLang={setEditingTemplateLang}
                      templateCode={templateCode}
                      setTemplateCode={setTemplateCode}
                      savingTemplate={savingTemplate}
                      handleSaveTemplate={handleSaveTemplate}
                    />
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      ) : (
        /* Snippets View */
        loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin w-6 h-6 border-2 border-teal-500 border-t-transparent rounded-full"></div>
          </div>
        ) : filteredSnippets.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-slate-500 dark:text-slate-400">
            <Code className="w-12 h-12 mb-3 opacity-30" />
            <p className="text-sm font-medium">No snippets found</p>
            <p className="text-xs mt-1">
              {searchQuery
                ? "Try a different search term"
                : 'Click "New Snippet" to create one'}
            </p>
          </div>
        ) : (
          <div className="grid gap-3">
            {filteredSnippets.map((snippet) => (
              <div
                key={snippet._id}
                className={`border rounded-xl overflow-hidden transition-all ${
                  snippet.isBuiltIn
                    ? "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/50"
                    : "border-teal-200 dark:border-teal-800/50 bg-teal-50/30 dark:bg-teal-900/10"
                }`}
              >
                <button
                  onClick={() =>
                    setExpandedSnippet(
                      expandedSnippet === snippet._id ? null : snippet._id!
                    )
                  }
                  className="w-full flex items-center justify-between px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Code className="w-4 h-4 text-teal-500 flex-shrink-0" />
                    <span className="font-mono text-sm font-semibold text-slate-900 dark:text-white">
                      {snippet.prefix}
                    </span>
                    {snippet.isBuiltIn && (
                      <span className="text-xs px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-medium">
                        built-in
                      </span>
                    )}
                    {!snippet.isBuiltIn && (
                      <span className="text-xs px-1.5 py-0.5 rounded bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400 font-medium">
                        custom
                      </span>
                    )}
                    <span className="text-xs text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                      {snippet.language}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {snippet.description && (
                      <span className="text-xs text-slate-500 dark:text-slate-400 hidden sm:inline max-w-[200px] truncate">
                        {snippet.description}
                      </span>
                    )}
                    {!snippet.isBuiltIn && (
                      <>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openEditForm(snippet);
                          }}
                          className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400 hover:text-teal-500 transition-colors"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(snippet._id!);
                          }}
                          className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400 hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </>
                    )}
                    {expandedSnippet === snippet._id ? (
                      <ChevronUp className="w-4 h-4 text-slate-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400" />
                    )}
                  </div>
                </button>
                {expandedSnippet === snippet._id && (
                  <div className="border-t border-slate-200 dark:border-slate-700">
                    {snippet.description && (
                      <div className="px-4 py-2 text-xs text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800">
                        {snippet.description}
                      </div>
                    )}
                    <pre className="p-4 text-xs font-mono text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/50 overflow-x-auto whitespace-pre-wrap">
                      {snippet.body}
                    </pre>
                  </div>
                )}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

// Template Card Component
const LANG_LABELS: Record<string, string> = {
  javascript: "JavaScript",
  typescript: "TypeScript",
  python: "Python",
  java: "Java",
  cpp: "C++",
  c: "C",
  go: "Go",
  rust: "Rust",
};

function TemplateCard({
  template,
  editingTemplateLang,
  setEditingTemplateLang,
  templateCode,
  setTemplateCode,
  savingTemplate,
  handleSaveTemplate,
}: {
  template: CodeTemplate;
  editingTemplateLang: string | null;
  setEditingTemplateLang: (lang: string | null) => void;
  templateCode: string;
  setTemplateCode: (code: string) => void;
  savingTemplate: boolean;
  handleSaveTemplate: (lang: string) => void;
}) {
  const isEditing = editingTemplateLang === template.language;
  const preview = template.code.split("\n").slice(0, 3).join("\n");

  return (
    <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden bg-white dark:bg-slate-900/50">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <Code className="w-4 h-4 text-teal-500" />
          <span className="text-sm font-semibold text-slate-900 dark:text-white">
            {LANG_LABELS[template.language] || template.language}
          </span>
          {template.isDefault ? (
            <span className="text-xs px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">default</span>
          ) : (
            <span className="text-xs px-1.5 py-0.5 rounded bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400">custom</span>
          )}
        </div>
        <button
          onClick={() => {
            if (isEditing) {
              setEditingTemplateLang(null);
            } else {
              setEditingTemplateLang(template.language);
              setTemplateCode(template.code);
            }
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
        >
          <Edit3 className="w-3.5 h-3.5" />
          {isEditing ? "Cancel" : "Edit"}
        </button>
      </div>
      {isEditing ? (
        <div className="border-t border-slate-200 dark:border-slate-700 p-4 space-y-3">
          <textarea
            value={templateCode}
            onChange={(e) => setTemplateCode(e.target.value)}
            rows={12}
            className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none"
          />
          <div className="flex justify-end">
            <button
              onClick={() => handleSaveTemplate(template.language)}
              disabled={savingTemplate}
              className="flex items-center gap-2 px-4 py-2 text-xs font-medium rounded-lg bg-teal-600 text-white hover:bg-teal-700 disabled:opacity-50 transition-all shadow-md"
            >
              {savingTemplate ? (
                <div className="animate-spin w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full"></div>
              ) : (
                <Save className="w-3.5 h-3.5" />
              )}
              Save as My Template
            </button>
          </div>
        </div>
      ) : (
        <div className="border-t border-slate-200 dark:border-slate-700">
          <pre className="px-4 py-3 text-xs font-mono text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 overflow-x-auto whitespace-pre-wrap max-h-24">
            {preview}
            {template.code.split("\n").length > 3 && "\n..."}
          </pre>
        </div>
      )}
    </div>
  );
}
