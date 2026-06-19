import { Router } from "express";
import { requireAuth } from "../../common/middleware/auth";
import * as snippetController from "./codeSnippet.controller";

const router = Router();

// ========== TEMPLATE ROUTES ==========

// Public: get template for a language (used by editor init)
router.get("/templates/:language", snippetController.getTemplateByLanguage);

// Public: get all templates
router.get("/templates", snippetController.getAllTemplates);

// Protected: upsert (create/update) a template
router.post("/templates", requireAuth, snippetController.upsertTemplate);

// Protected: save user-specific template
router.post("/templates/user", requireAuth, snippetController.saveUserTemplate);

// Protected: delete a template
router.delete("/templates/:id", requireAuth, snippetController.deleteTemplate);

// ========== SNIPPET ROUTES ==========

// Public: get all snippets for a language (built-in + user's own) - used by editor
router.get("/editor/:language", snippetController.getSnippetsForLanguage);

// Protected: get snippets (built-in + user's own, filtered by query params)
router.get("/", snippetController.getSnippets);

// Protected: get a single snippet by ID
router.get("/:id", snippetController.getSnippetById);

// Protected: create a new snippet
router.post("/", requireAuth, snippetController.createSnippet);

// Protected: update a snippet
router.put("/:id", requireAuth, snippetController.updateSnippet);

// Protected: delete a snippet
router.delete("/:id", requireAuth, snippetController.deleteSnippet);

export default router;