import { db } from "../../../config/database/mongodb";
import { ApiError } from "../../../common/errors/apiError";
import type { RunCodeDto, SubmitCodeDto } from "@repo/dto";
import { createSubmission, getSubmissionsByUserAndProblem } from "../repositories/submission.repository";
import type { ITestCaseResult } from "../interfaces/submission.interface";
import { executeCode, executeCodeRun } from "../../judge/judge.service";
import type { JudgeTestCase } from "../../judge/judge.interface";

const problems = db.collection("problems");

export const runCode = async (userId: string, data: RunCodeDto) => {
  const problem = await problems.findOne({ slug: data.problemSlug });
  if (!problem) {
    throw new ApiError("Problem not found", 404);
  }

  const testCases = (problem.testCases || []) as { input: string; expectedOutput: string }[];
  if (testCases.length === 0) {
    throw new ApiError("No test cases found for this problem", 404);
  }

  // Run against the first few test cases
  const judgeTestCases: JudgeTestCase[] = testCases.map((tc) => ({
    input: tc.input,
    expectedOutput: tc.expectedOutput,
  }));

  const result = await executeCodeRun({
    code: data.code,
    language: data.language,
    testCases: judgeTestCases,
  });

  return {
    totalTestCases: result.totalTestCases,
    passedTestCases: result.passedTestCases,
    status: result.status,
    testCaseResults: result.testCaseResults,
  };
};

export const submitCode = async (userId: string, data: SubmitCodeDto) => {
  const problem = await problems.findOne({ slug: data.problemSlug });
  if (!problem) {
    throw new ApiError("Problem not found", 404);
  }

  const testCases = (problem.testCases || []) as { input: string; expectedOutput: string }[];
  if (testCases.length === 0) {
    throw new ApiError("No test cases found for this problem", 404);
  }

  // Run against ALL test cases
  const judgeTestCases: JudgeTestCase[] = testCases.map((tc) => ({
    input: tc.input,
    expectedOutput: tc.expectedOutput,
  }));

  const result = await executeCode({
    code: data.code,
    language: data.language,
    testCases: judgeTestCases,
  });

  // Map judge results to ITestCaseResult for DB storage
  const testCaseResults: ITestCaseResult[] = result.testCaseResults.map((tc) => ({
    passed: tc.passed,
    input: tc.input,
    expected: tc.expected,
    actual: tc.actual,
    stdout: tc.stdout,
    stderr: tc.stderr,
    compileOutput: tc.compileOutput,
    runtime: tc.runtime,
    status: tc.status,
  }));

  const submission = await createSubmission({
    userId,
    problemSlug: data.problemSlug,
    language: data.language,
    code: data.code,
    status: result.status,
    totalTestCases: result.totalTestCases,
    passedTestCases: result.passedTestCases,
    testCaseResults,
    createdAt: new Date(),
  });

  return {
    _id: submission._id?.toString(),
    problemSlug: submission.problemSlug,
    language: submission.language,
    code: submission.code,
    status: submission.status,
    totalTestCases: submission.totalTestCases,
    passedTestCases: submission.passedTestCases,
    testCaseResults: submission.testCaseResults,
    createdAt: submission.createdAt.toISOString(),
  };
};

export const getSubmissions = async (userId: string, problemSlug: string) => {
  const submissions = await getSubmissionsByUserAndProblem(userId, problemSlug);

  return submissions.map((s) => ({
    _id: s._id?.toString(),
    problemSlug: s.problemSlug,
    language: s.language,
    code: s.code,
    status: s.status,
    totalTestCases: s.totalTestCases,
    passedTestCases: s.passedTestCases,
    testCaseResults: s.testCaseResults,
    createdAt: s.createdAt.toISOString(),
  }));
};

export const runCustomTestCase = async (
  userId: string,
  data: { problemSlug: string; language: string; code: string; input: string; expectedOutput?: string }
) => {
  const problem = await problems.findOne({ slug: data.problemSlug });
  if (!problem) {
    throw new ApiError("Problem not found", 404);
  }

  // Run against the custom test case
  const judgeTestCases: JudgeTestCase[] = [{
    input: data.input,
    expectedOutput: data.expectedOutput || "",
  }];

  const result = await executeCodeRun({
    code: data.code,
    language: data.language,
    testCases: judgeTestCases,
  });

  return {
    totalTestCases: result.totalTestCases,
    passedTestCases: result.passedTestCases,
    status: result.status,
    testCaseResults: result.testCaseResults,
  };
};
