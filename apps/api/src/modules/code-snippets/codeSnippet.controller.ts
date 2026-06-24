import { Request, Response, NextFunction } from "express";
import * as snippetService from "./codeSnippet.service.js";
import { HttpStatus } from "@repo/dto";
import type { ICodeSnippetFilter } from "./codeSnippet.interface.js";

// ========== TEMPLATES ==========

export const getTemplateByLanguage = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const language = req.params.language as string;
    const userId = req.user?.userId;
    const template = await snippetService.getTemplateByLanguage(language, userId);
    res.json(template);
  } catch (err) {
    next(err);
  }
};

export const saveUserTemplate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;
    const { language, code } = req.body;
    const template = await snippetService.saveUserTemplate(language, code, userId);
    res.status(HttpStatus.CREATED).json(template);
  } catch (err) {
    next(err);
  }
};

export const getAllTemplates = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const templates = await snippetService.getAllTemplates();
    res.json(templates);
  } catch (err) {
    next(err);
  }
};

export const upsertTemplate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { language, code, isDefault } = req.body;
    const template = await snippetService.upsertTemplate({ language, code, isDefault });
    res.status(HttpStatus.CREATED).json(template);
  } catch (err) {
    next(err);
  }
};

export const deleteTemplate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await snippetService.deleteTemplate(req.params.id as string);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

// ========== SNIPPETS ==========

export const getSnippets = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId;
    const language = req.query.language as string | undefined;
    const search = req.query.search as string | undefined;
    const includeBuiltIn = req.query.includeBuiltIn !== "false";
    
    const filter: ICodeSnippetFilter = {
      language,
      userId: userId,
      includeBuiltIn,
      search,
    };
    const snippets = await snippetService.getSnippets(filter);
    res.json(snippets);
  } catch (err) {
    next(err);
  }
};

export const getSnippetById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const snippet = await snippetService.getSnippetById(req.params.id as string);
    res.json(snippet);
  } catch (err) {
    next(err);
  }
};

export const createSnippet = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;
    const { language, prefix, body, description } = req.body;
    const snippet = await snippetService.createSnippet({
      language,
      prefix,
      body,
      description,
      userId,
    });
    res.status(HttpStatus.CREATED).json(snippet);
  } catch (err) {
    next(err);
  }
};

export const updateSnippet = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;
    const { prefix, body, description, language } = req.body;
    const snippet = await snippetService.updateSnippet(req.params.id as string, userId, {
      prefix,
      body,
      description,
      language,
    });
    res.json(snippet);
  } catch (err) {
    next(err);
  }
};

export const deleteSnippet = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;
    const result = await snippetService.deleteSnippet(req.params.id as string, userId);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

// ========== SNIPPETS FOR PROBLEM SOLVE ==========

export const getSnippetsForLanguage = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId;
    const language = req.params.language as string;

    // Get both the template and snippets for this language
    const [template, snippets] = await Promise.all([
      snippetService.getTemplateByLanguage(language, userId),
      snippetService.getSnippets({ language, userId, includeBuiltIn: true }),
    ]);

    res.json({ template, snippets });
  } catch (err) {
    next(err);
  }
};
