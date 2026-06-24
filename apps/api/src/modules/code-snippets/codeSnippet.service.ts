import { ApiError } from "../../common/errors/apiError.js";
import { HttpStatus } from "@repo/dto";
import * as snippetRepo from "./codeSnippet.repository.js";
import type { ICodeSnippetFilter } from "./codeSnippet.interface.js";

// ========== TEMPLATES ==========

export const getTemplateByLanguage = async (language: string, userId?: string) => {
  // If userId provided, check for user-specific template first
  if (userId) {
    const userTemplate = await snippetRepo.getUserTemplateByLanguage(language, userId);
    if (userTemplate) {
      return userTemplate;
    }
  }
  // Fall back to default template
  const template = await snippetRepo.getTemplateByLanguage(language);
  if (!template) {
    // Return a minimal fallback template if none found
    return {
      language,
      code: getFallbackTemplate(language),
      isDefault: true,
    };
  }
  return template;
};

export const saveUserTemplate = async (language: string, code: string, userId: string) => {
  return snippetRepo.upsertUserTemplate({ language, code, userId });
};

export const getAllTemplates = async () => {
  return snippetRepo.getAllTemplates();
};

export const upsertTemplate = async (data: { language: string; code: string; isDefault?: boolean }) => {
  return snippetRepo.upsertTemplate({
    language: data.language,
    code: data.code,
    isDefault: data.isDefault ?? true,
  });
};

export const deleteTemplate = async (id: string) => {
  const result = await snippetRepo.deleteTemplate(id);
  if (result.deletedCount === 0) {
    throw new ApiError("Template not found", HttpStatus.NOT_FOUND);
  }
  return { deleted: true };
};

// ========== SNIPPETS ==========

export const getSnippets = async (filter: ICodeSnippetFilter) => {
  return snippetRepo.getSnippets(filter);
};

export const getSnippetById = async (id: string) => {
  const snippet = await snippetRepo.getSnippetById(id);
  if (!snippet) {
    throw new ApiError("Snippet not found", HttpStatus.NOT_FOUND);
  }
  return snippet;
};

export const createSnippet = async (data: {
  language: string;
  prefix: string;
  body: string;
  description?: string;
  userId: string;
}) => {
  // Validate prefix is unique for this user/language combo
  const existing = await snippetRepo.getSnippets({
    language: data.language,
    userId: data.userId,
    includeBuiltIn: false,
  });
  
  if (existing.some((s: any) => s.prefix === data.prefix)) {
    throw new ApiError(`A snippet with prefix "${data.prefix}" already exists`, HttpStatus.CONFLICT);
  }

  return snippetRepo.createSnippet({
    language: data.language,
    prefix: data.prefix,
    body: data.body,
    description: data.description || "",
    isBuiltIn: false,
    userId: data.userId,
  });
};

export const updateSnippet = async (
  id: string,
  userId: string,
  updates: {
    prefix?: string;
    body?: string;
    description?: string;
    language?: string;
  }
) => {
  const existing = await snippetRepo.getSnippetById(id);
  if (!existing) {
    throw new ApiError("Snippet not found", HttpStatus.NOT_FOUND);
  }
  if (existing.isBuiltIn) {
    throw new ApiError("Cannot edit built-in snippets", HttpStatus.FORBIDDEN);
  }
  if (existing.userId !== userId) {
    throw new ApiError("Not authorized to edit this snippet", HttpStatus.FORBIDDEN);
  }

  return snippetRepo.updateSnippet(id, updates);
};

export const deleteSnippet = async (id: string, userId: string) => {
  const existing = await snippetRepo.getSnippetById(id);
  if (!existing) {
    throw new ApiError("Snippet not found", HttpStatus.NOT_FOUND);
  }
  if (existing.isBuiltIn) {
    throw new ApiError("Cannot delete built-in snippets", HttpStatus.FORBIDDEN);
  }
  if (existing.userId !== userId) {
    throw new ApiError("Not authorized to delete this snippet", HttpStatus.FORBIDDEN);
  }

  const result = await snippetRepo.deleteSnippet(id);
  if (result.deletedCount === 0) {
    throw new ApiError("Snippet not found", HttpStatus.NOT_FOUND);
  }
  return { deleted: true };
};

// ========== HELPERS ==========

function getFallbackTemplate(language: string): string {
  const fallbacks: Record<string, string> = {
    javascript: '// Write your code here\n\nconsole.log("Hello World!");',
    typescript: '// Write your code here\n\nconsole.log("Hello World!");',
    python: '# Write your code here\n\nprint("Hello World!")',
    java: `public class Main {\n    public static void main(String[] args) {\n        // Write your code here\n        System.out.println("Hello World!");\n    }\n}`,
    cpp: `#include <iostream>\nusing namespace std;\n\nint main() {\n    // Write your code here\n    cout << "Hello World!" << endl;\n    return 0;\n}`,
    c: `#include <stdio.h>\n\nint main() {\n    // Write your code here\n    printf("Hello World!\\n");\n    return 0;\n}`,
    go: `package main\n\nimport "fmt"\n\nfunc main() {\n    // Write your code here\n    fmt.Println("Hello World!")\n}`,
    rust: `fn main() {\n    // Write your code here\n    println!("Hello World!");\n}`,
  };

  return fallbacks[language] || `// Write your code here\n`;
}