import { db } from "../../../config/database/mongodb";
import { ApiError } from "../../../common/errors/apiError";
import type { RunCodeDto, SubmitCodeDto } from "@repo/dto";
import { createSubmission, getSubmissionsByUserAndProblem } from "../repositories/submission.repository";
import type { ITestCaseResult } from "../interfaces/submission.interface";

const problems = db.collection("problems");

const generateDummyResults = (testCases: { input: string; expectedOutput: string }[]): ITestCaseResult[] => {
  return testCases.map((tc) => ({
    passed: true,
    input: tc.input,
    expected: tc.expectedOutput,
    actual: tc.expectedOutput,
    runtime: Math.floor(Math.random() * 100) + 10,
  }));
};

const evaluateCode = async (problemSlug: string) => {
  const problem = await problems.findOne({ slug: problemSlug });

  if (!problem) {
    throw new ApiError("Problem not found", 404);
  }

  const testCases = problem.testCases as { input: string; expectedOutput: string }[];

  if (!testCases || testCases.length === 0) {
    throw new ApiError("No test cases found for this problem", 404);
  }

  const testCaseResults = generateDummyResults(testCases);
  const passedCount = testCaseResults.filter((r) => r.passed).length;
  const status = passedCount === testCases.length ? "Accepted" : "Wrong Answer";

  return {
    totalTestCases: testCases.length,
    passedTestCases: passedCount,
    status: status as "Accepted" | "Wrong Answer" | "Runtime Error",
    testCaseResults,
  };
};

export const runCode = async (userId: string, data: RunCodeDto) => {
  return evaluateCode(data.problemSlug);
};

export const submitCode = async (userId: string, data: SubmitCodeDto) => {
  const result = await evaluateCode(data.problemSlug);

  const submission = await createSubmission({
    userId,
    problemSlug: data.problemSlug,
    language: data.language,
    code: data.code,
    status: result.status,
    totalTestCases: result.totalTestCases,
    passedTestCases: result.passedTestCases,
    testCaseResults: result.testCaseResults,
    createdAt: new Date(),
  });

  return {
    _id: submission._id?.toString(),
    problemSlug: submission.problemSlug,
    language: submission.language,
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
    status: s.status,
    totalTestCases: s.totalTestCases,
    passedTestCases: s.passedTestCases,
    testCaseResults: s.testCaseResults,
    createdAt: s.createdAt.toISOString(),
  }));
};