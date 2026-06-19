export interface JudgeTestCase {
  input: string;
  expectedOutput: string;
}

export interface JudgeTestCaseResult {
  passed: boolean;
  input: string;
  expected: string;
  actual: string;
  stdout?: string;
  stderr?: string;
  compileOutput?: string;
  runtime: number; // milliseconds
  status: JudgeStatus;
}

export type JudgeStatus =
  | "Accepted"
  | "Wrong Answer"
  | "Runtime Error"
  | "Compilation Error"
  | "Time Limit Exceeded"
  | "Internal Error";

export interface JudgeResult {
  totalTestCases: number;
  passedTestCases: number;
  status: JudgeStatus;
  testCaseResults: JudgeTestCaseResult[];
}

export interface JudgeRequest {
  code: string;
  language: string;
  testCases: JudgeTestCase[];
  timeoutPerTestCase?: number; // seconds
}

export const LANGUAGE_EXTENSIONS: Record<string, string> = {
  c: "c",
  cpp: "cpp",
  java: "java",
  python: "py",
  javascript: "js",
  typescript: "ts",
  go: "go",
  rust: "rs",
};

export const DOCKER_IMAGE_PREFIX = "judgesphere";

export const LANGUAGE_DOCKER_IMAGES: Record<string, string> = {
  c: `${DOCKER_IMAGE_PREFIX}/c-runner:latest`,
  cpp: `${DOCKER_IMAGE_PREFIX}/cpp-runner:latest`,
  java: `${DOCKER_IMAGE_PREFIX}/java-runner:latest`,
  python: `${DOCKER_IMAGE_PREFIX}/python-runner:latest`,
  javascript: `${DOCKER_IMAGE_PREFIX}/javascript-runner:latest`,
  typescript: `${DOCKER_IMAGE_PREFIX}/typescript-runner:latest`,
  go: `${DOCKER_IMAGE_PREFIX}/go-runner:latest`,
  rust: `${DOCKER_IMAGE_PREFIX}/rust-runner:latest`,
};