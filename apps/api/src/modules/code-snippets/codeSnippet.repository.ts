import { db } from "../../config/database/mongodb";
import { ObjectId } from "mongodb";
import type { ICodeTemplate, ICodeSnippet, ICodeSnippetFilter } from "./codeSnippet.interface";

// Collections
const templates = db.collection<ICodeTemplate>("code_templates");
const snippets = db.collection<ICodeSnippet>("code_snippets");

// Create indexes
templates.createIndex({ language: 1 });
templates.createIndex({ language: 1, isDefault: 1 });

snippets.createIndex({ language: 1, prefix: 1 });
snippets.createIndex({ userId: 1 });
snippets.createIndex({ isBuiltIn: 1 });
snippets.createIndex({ language: 1, userId: 1 });

// ========== TEMPLATES ==========

export const getTemplateByLanguage = async (language: string) => {
  return templates.findOne({ language, isDefault: true });
};

export const getUserTemplateByLanguage = async (language: string, userId: string) => {
  return templates.findOne({ language, userId, isDefault: false });
};

export const getAllTemplates = async () => {
  return templates.find({}).toArray();
};

export const upsertTemplate = async (template: Omit<ICodeTemplate, "_id" | "createdAt" | "updatedAt">) => {
  const now = new Date();
  const existing = await templates.findOne({ language: template.language, isDefault: template.isDefault });

  if (existing) {
    await templates.updateOne(
      { _id: existing._id },
      { $set: { code: template.code, updatedAt: now } }
    );
    return { ...existing, code: template.code, updatedAt: now };
  }

  const result = await templates.insertOne({
    ...template,
    createdAt: now,
    updatedAt: now,
  });
  return { _id: result.insertedId, ...template, createdAt: now, updatedAt: now };
};

export const upsertUserTemplate = async (template: { language: string; code: string; userId: string }) => {
  const now = new Date();
  const existing = await templates.findOne({ language: template.language, userId: template.userId, isDefault: false });

  if (existing) {
    await templates.updateOne(
      { _id: existing._id },
      { $set: { code: template.code, updatedAt: now } }
    );
    return { ...existing, code: template.code, updatedAt: now };
  }

  const result = await templates.insertOne({
    language: template.language,
    code: template.code,
    isDefault: false,
    userId: template.userId,
    createdAt: now,
    updatedAt: now,
  });
  return { _id: result.insertedId, language: template.language, code: template.code, isDefault: false, userId: template.userId, createdAt: now, updatedAt: now };
};

export const deleteTemplate = async (id: string) => {
  return templates.deleteOne({ _id: new ObjectId(id) });
};

// ========== SNIPPETS ==========

export const getSnippets = async (filter: ICodeSnippetFilter) => {
  const query: Record<string, any> = {};

  if (filter.language) {
    query.language = { $in: [filter.language, "all"] };
  }

  if (filter.includeBuiltIn !== false) {
    // Include built-in snippets and user's own snippets
    query.$or = [
      { isBuiltIn: true },
      ...(filter.userId ? [{ userId: filter.userId }] : []),
    ];
  } else if (filter.userId) {
    query.userId = filter.userId;
  }

  if (filter.search) {
    query.$or = [
      { prefix: { $regex: filter.search, $options: "i" } },
      { description: { $regex: filter.search, $options: "i" } },
      { body: { $regex: filter.search, $options: "i" } },
    ];
  }

  return snippets.find(query).sort({ isBuiltIn: -1, prefix: 1 }).toArray();
};

export const getSnippetById = async (id: string) => {
  return snippets.findOne({ _id: new ObjectId(id) });
};

export const createSnippet = async (snippet: Omit<ICodeSnippet, "_id" | "createdAt" | "updatedAt">) => {
  const now = new Date();
  const result = await snippets.insertOne({
    ...snippet,
    createdAt: now,
    updatedAt: now,
  });
  return { _id: result.insertedId, ...snippet, createdAt: now, updatedAt: now };
};

export const updateSnippet = async (id: string, updates: Partial<Omit<ICodeSnippet, "_id" | "createdAt" | "isBuiltIn">>) => {
  const now = new Date();
  await snippets.updateOne(
    { _id: new ObjectId(id) },
    { $set: { ...updates, updatedAt: now } }
  );
  return snippets.findOne({ _id: new ObjectId(id) });
};

export const deleteSnippet = async (id: string) => {
  return snippets.deleteOne({ _id: new ObjectId(id) });
};

export const deleteSnippetsByUserId = async (userId: string) => {
  return snippets.deleteMany({ userId, isBuiltIn: false });
};