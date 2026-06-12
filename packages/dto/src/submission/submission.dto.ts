import { z } from "zod";


export const RunCodeDtoSchema = z.object({
  problemSlug: z.string().min(1, "Problem slug is required"),
  language: z.string().min(1, "Language is required"),
  code: z.string().min(1, "Code is required"),
}).strict();
export type RunCodeDto = z.infer<typeof RunCodeDtoSchema>;


export const SubmitCodeDtoSchema = z.object({
  problemSlug: z.string().min(1, "Problem slug is required"),
  language: z.string().min(1, "Language is required"),
  code: z.string().min(1, "Code is required"),
}).strict();
export type SubmitCodeDto = z.infer<typeof SubmitCodeDtoSchema>;


export const JudgeStatusSchema = z.enum([
  "Accepted",
  "Wrong Answer",
  "Runtime Error",
  "Compilation Error",
  "Time Limit Exceeded",
  "Internal Error",
]);
export type JudgeStatus = z.infer<typeof JudgeStatusSchema>;


export const TestCaseResultSchema = z.object({
  passed: z.boolean(),
  input: z.string(),
  expected: z.string(),
  actual: z.string(),
  stdout: z.string().optional(),
  stderr: z.string().optional(),
  compileOutput: z.string().optional(),
  runtime: z.number(),
  status: JudgeStatusSchema,
});
export type TestCaseResult = z.infer<typeof TestCaseResultSchema>;


export const SubmissionResultSchema = z.object({
  _id: z.string().optional(),
  problemSlug: z.string(),
  language: z.string(),
  code: z.string().optional(),
  status: JudgeStatusSchema,
  totalTestCases: z.number(),
  passedTestCases: z.number(),
  testCaseResults: z.array(TestCaseResultSchema),
  createdAt: z.string(),
});
export type SubmissionResult = z.infer<typeof SubmissionResultSchema>;


export const RunCodeResponseSchema = z.object({
  totalTestCases: z.number(),
  passedTestCases: z.number(),
  status: JudgeStatusSchema,
  testCaseResults: z.array(TestCaseResultSchema),
});
export type RunCodeResponse = z.infer<typeof RunCodeResponseSchema>;
