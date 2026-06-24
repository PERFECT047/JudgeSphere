import { env } from "@repo/env/server";
import { ApiError } from "../../common/errors/apiError.js";
import { HttpStatus } from "@repo/dto";

const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";
// deepseek/deepseek-r1-0528 is no longer free on OpenRouter.
// If you need a free model, consider switching to "openrouter/free",
// "meta-llama/llama-3.2-3b-instruct:free",
// or "qwen/qwen-2.5-7b-instruct:free".
const MODEL = "openrouter/free";

interface ReviewRequest {
  code: string;
  language: string;
  problemTitle: string;
  problemDescription: string;
  problemConstraints: string[];
  problemExamples: { input: string; output: string; explanation?: string }[];
}

export interface ReviewResponse {
  review: string;
}

function buildPrompt(data: ReviewRequest): string {
  const examplesStr = data.problemExamples
    .map(
      (ex, i) =>
        `Example ${i + 1}:\n  Input: ${ex.input}\n  Output: ${ex.output}${ex.explanation ? `\n  Explanation: ${ex.explanation}` : ""}`
    )
    .join("\n\n");

  const constraintsStr = data.problemConstraints
    .map((c) => `  - ${c}`)
    .join("\n");

  return `You are an expert code reviewer and competitive programming mentor. Analyze the following solution for a coding problem and provide a detailed review.

## Problem: ${data.problemTitle}

### Description:
${data.problemDescription}

### Constraints:
${constraintsStr}

### Examples:
${examplesStr}

## User's Solution (${data.language}):

\`\`\`${data.language}
${data.code}
\`\`\`

## Please provide your review in the following format:

### ✅ Correctness
Analyze if the code correctly solves the problem. Point out any bugs or edge cases that might fail.

### ⚡ Time & Space Complexity
Provide the time and space complexity analysis of the solution.

### 💡 Optimization Suggestions
Suggest specific optimizations or improvements. If the code can be optimized, show the optimized version.

### 🔍 Code Quality
Comment on code readability, naming conventions, and best practices for the language used.

### 📝 Summary
A brief overall assessment (2-3 sentences max).

Keep your review concise but thorough. Focus on actionable improvements.`;
}

export async function reviewCode(data: ReviewRequest): Promise<ReviewResponse> {
  const apiKey = env.OPENROUTER_API_KEY;

  if (!apiKey) {
    throw new ApiError(
      "AI Review is not configured. Please set the OPENROUTER_API_KEY environment variable.",
      HttpStatus.SERVICE_UNAVAILABLE
    );
  }

  const prompt = buildPrompt(data);

  const response = await fetch(OPENROUTER_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "https://judgesphere.dev",
      "X-Title": "JudgeSphere AI Code Review",
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      max_tokens: 4096,
      temperature: 0.3,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error("OpenRouter API error:", response.status, errorBody);
    throw new ApiError(
      `AI service error: ${response.status}`,
      HttpStatus.BAD_GATEWAY
    );
  }

  const result = await response.json();

  const review = result.choices?.[0]?.message?.content;

  if (!review) {
    throw new ApiError("AI service returned an empty response", HttpStatus.BAD_GATEWAY);
  }

  return { review };
}

interface HintRequest {
  code: string;
  language: string;
  problemTitle: string;
  problemDescription: string;
  problemConstraints: string[];
  problemExamples: { input: string; output: string; explanation?: string }[];
  previousHints: string[];
}

export interface HintResponse {
  hint: string;
}

function buildHintPrompt(data: HintRequest): string {
  const examplesStr = data.problemExamples
    .map(
      (ex, i) =>
        `Example ${i + 1}:\n  Input: ${ex.input}\n  Output: ${ex.output}${ex.explanation ? `\n  Explanation: ${ex.explanation}` : ""}`
    )
    .join("\n\n");

  const constraintsStr = data.problemConstraints
    .map((c) => `  - ${c}`)
    .join("\n");

  const previousHintsStr = data.previousHints.length > 0
    ? data.previousHints.map((h, i) => `Hint ${i + 1}: ${h}`).join("\n")
    : "None";

  return `You are an expert competitive programming coach. Provide a helpful, constructive, and progressive hint to the user based on their current code and the problem description.

## Problem: ${data.problemTitle}

### Description:
${data.problemDescription}

### Constraints:
${constraintsStr}

### Examples:
${examplesStr}

## User's Current Code (${data.language}):
\`\`\`${data.language}
${data.code}
\`\`\`

## Previously Generated Hints:
${previousHintsStr}

## Your Task:
Generate a NEW hint that is helpful and helps the user debug, optimize, or figure out the next step.
- Do NOT repeat any of the previously generated hints.
- Do NOT give the full solution or write the code for them.
- Be concise (2-4 sentences). Focus on one specific concept or bug in their logic.
- Directly output the hint text. No markdown header, no conversational filler (like "Sure! Here is a hint:").`;
}

export async function generateHint(data: HintRequest): Promise<HintResponse> {
  const apiKey = env.OPENROUTER_API_KEY;

  if (!apiKey) {
    throw new ApiError(
      "AI Hint is not configured. Please set the OPENROUTER_API_KEY environment variable.",
      HttpStatus.SERVICE_UNAVAILABLE
    );
  }

  const prompt = buildHintPrompt(data);

  const response = await fetch(OPENROUTER_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "https://judgesphere.dev",
      "X-Title": "JudgeSphere AI Code Hint",
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      max_tokens: 1024,
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error("OpenRouter API error (hints):", response.status, errorBody);
    throw new ApiError(
      `AI service error: ${response.status}`,
      HttpStatus.BAD_GATEWAY
    );
  }

  const result = await response.json();

  const hint = result.choices?.[0]?.message?.content?.trim();

  if (!hint) {
    throw new ApiError("AI service returned an empty hint response", HttpStatus.BAD_GATEWAY);
  }

  return { hint };
}