import axiosInstance from "../../service/axios";

export interface CodeTemplate {
  _id?: string;
  language: string;
  code: string;
  isDefault: boolean;
}

export interface CodeSnippet {
  _id?: string;
  language: string;
  prefix: string;
  body: string;
  description: string;
  isBuiltIn: boolean;
  userId?: string;
}

export interface EditorLanguageData {
  template: CodeTemplate;
  snippets: CodeSnippet[];
}

// Get template for a specific language
export const getTemplateByLanguage = async (language: string): Promise<CodeTemplate> => {
  const response = await axiosInstance.get(`/code-snippets/templates/${language}`);
  return response.data;
};

// Get all templates
export const getAllTemplates = async (): Promise<CodeTemplate[]> => {
  const response = await axiosInstance.get("/code-snippets/templates");
  return response.data;
};

// Create/update template (protected)
export const upsertTemplate = async (data: {
  language: string;
  code: string;
  isDefault?: boolean;
}): Promise<CodeTemplate> => {
  const response = await axiosInstance.post("/code-snippets/templates", data);
  return response.data;
};

// Get snippets for a specific language (built-in + user's own) - used by editor
export const getSnippetsForLanguage = async (language: string): Promise<EditorLanguageData> => {
  const response = await axiosInstance.get(`/code-snippets/editor/${language}`);
  return response.data;
};

// Get all snippets with filters
export const getSnippets = async (params?: {
  language?: string;
  search?: string;
  includeBuiltIn?: boolean;
}): Promise<CodeSnippet[]> => {
  const response = await axiosInstance.get("/code-snippets", { params });
  return response.data;
};

// Create a new snippet (protected)
export const createSnippet = async (data: {
  language: string;
  prefix: string;
  body: string;
  description?: string;
}): Promise<CodeSnippet> => {
  const response = await axiosInstance.post("/code-snippets", data);
  return response.data;
};

// Update a snippet (protected)
export const updateSnippet = async (
  id: string,
  data: {
    prefix?: string;
    body?: string;
    description?: string;
    language?: string;
  }
): Promise<CodeSnippet> => {
  const response = await axiosInstance.put(`/code-snippets/${id}`, data);
  return response.data;
};

// Delete a snippet (protected)
export const deleteSnippet = async (id: string): Promise<void> => {
  await axiosInstance.delete(`/code-snippets/${id}`);
};

// Save user-specific template (protected)
export const saveUserTemplate = async (data: {
  language: string;
  code: string;
}): Promise<CodeTemplate> => {
  const response = await axiosInstance.post("/code-snippets/templates/user", data);
  return response.data;
};
