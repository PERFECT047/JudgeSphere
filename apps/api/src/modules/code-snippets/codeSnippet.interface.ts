import { ObjectId } from "mongodb";

/**
 * CodeTemplate - Per-language default template rendered in the editor.
 * e.g., Java gets a "public class Main { public static void main... }" template
 */
export interface ICodeTemplate {
  _id?: any;
  language: string;
  code: string;
  isDefault: boolean;
  userId?: string; // If set, this is a user-specific template override
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * CodeSnippet - Small reusable code block triggered by a prefix (like psvm).
 * Built-in snippets are global. Users can create their own custom snippets too.
 */
export interface ICodeSnippet {
  _id?: ObjectId;
  language: string;        // "java", "python", etc. or "all" for language-agnostic
  prefix: string;          // Trigger prefix e.g. "psvm", "sout", "fori"
  body: string;            // Snippet body with $1, $2 placeholders
  description: string;     // Tooltip / description
  isBuiltIn: boolean;      // true = system-provided, false = user-created
  userId?: string;         // For user-created snippets (undefined for built-in)
  createdAt: Date;
  updatedAt: Date;
}

export interface ICodeSnippetFilter {
  language?: string;
  userId?: string;
  includeBuiltIn?: boolean;
  search?: string;
}