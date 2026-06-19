import {
  type JudgeRequest,
  type JudgeResult,
  type JudgeTestCaseResult,
  type JudgeStatus,
} from "./judge.interface";
import { runCodeInContainer } from "./docker.service";
import { compareOutput } from "./output-comparator";

/**
 * Execute code against test cases using Docker sandbox.
 * This is the main entry point for code evaluation.
 */
export async function executeCode(request: JudgeRequest): Promise<JudgeResult> {
  const { code, language, testCases, timeoutPerTestCase = 5 } = request;

  if (!code || code.trim().length === 0) {
    return {
      totalTestCases: testCases.length,
      passedTestCases: 0,
      status: "Compilation Error",
      testCaseResults: testCases.map((tc) => ({
        passed: false,
        input: tc.input,
        expected: tc.expectedOutput,
        actual: "",
        compileOutput: "No code provided",
        runtime: 0,
        status: "Compilation Error" as JudgeStatus,
      })),
    };
  }

  const testCaseResults: JudgeTestCaseResult[] = [];
  let hasCompilationError = false;
  let hasRuntimeError = false;
  let hasTimeLimitExceeded = false;

  for (let i = 0; i < testCases.length; i++) {
    const testCase = testCases[i];

    try {
      const startTime = Date.now();

      const { stdout, stderr, timedOut } = runCodeInContainer(
        language,
        code,
        testCase.input,
        timeoutPerTestCase
      );

      const runtime = Date.now() - startTime;

      // Check for compilation error (first test case only, since compilation is shared)
      if (i === 0 && stdout.includes("COMPILATION_ERROR")) {
        hasCompilationError = true;
        const compileOutput = stdout.replace("COMPILATION_ERROR\n", "").trim();

        // Fill all test cases with compilation error
        for (let j = 0; j < testCases.length; j++) {
          testCaseResults.push({
            passed: false,
            input: testCases[j].input,
            expected: testCases[j].expectedOutput,
            actual: "",
            compileOutput,
            runtime: 0,
            status: "Compilation Error",
          });
        }
        break;
      }

      // Check for time limit exceeded
      if (timedOut || stdout.includes("TIME_LIMIT_EXCEEDED")) {
        hasTimeLimitExceeded = true;
        testCaseResults.push({
          passed: false,
          input: testCase.input,
          expected: testCase.expectedOutput,
          actual: "",
          stderr: stderr || "Time limit exceeded",
          runtime,
          status: "Time Limit Exceeded",
        });
        continue;
      }

      // Check for runtime error
      if (stdout.includes("RUNTIME_ERROR")) {
        hasRuntimeError = true;
        testCaseResults.push({
          passed: false,
          input: testCase.input,
          expected: testCase.expectedOutput,
          actual: stdout,
          stderr,
          runtime,
          status: "Runtime Error",
        });
        continue;
      }

      // Compare output
      const comparison = compareOutput(testCase.expectedOutput, stdout);

      testCaseResults.push({
        passed: comparison.passed,
        input: testCase.input,
        expected: comparison.expected,
        actual: comparison.actual,
        stdout,
        stderr,
        runtime,
        status: comparison.passed ? "Accepted" : "Wrong Answer",
      });
    } catch (error: any) {
      // Internal error (Docker not available, etc.)
      testCaseResults.push({
        passed: false,
        input: testCase.input,
        expected: testCase.expectedOutput,
        actual: "",
        stderr: error.message || "Internal execution error",
        runtime: 0,
        status: "Internal Error",
      });
    }
  }

  // Determine overall status
  const passedCount = testCaseResults.filter((r) => r.passed).length;
  let overallStatus: JudgeStatus;

  if (hasCompilationError) {
    overallStatus = "Compilation Error";
  } else if (hasTimeLimitExceeded) {
    overallStatus = "Time Limit Exceeded";
  } else if (hasRuntimeError) {
    overallStatus = "Runtime Error";
  } else if (passedCount === testCases.length) {
    overallStatus = "Accepted";
  } else {
    overallStatus = "Wrong Answer";
  }

  return {
    totalTestCases: testCases.length,
    passedTestCases: passedCount,
    status: overallStatus,
    testCaseResults,
  };
}

/**
 * Execute code against a subset of test cases (for "Run" mode).
 * Typically runs the first 3 test cases or all if less than 5.
 */
export async function executeCodeRun(
  request: JudgeRequest
): Promise<JudgeResult> {
  const runLimit = Math.min(request.testCases.length, 3);
  const runTestCases = request.testCases.slice(0, runLimit);

  return executeCode({
    ...request,
    testCases: runTestCases,
  });
}