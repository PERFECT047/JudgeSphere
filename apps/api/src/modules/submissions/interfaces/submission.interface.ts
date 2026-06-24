import { ObjectId } from "mongodb";
import type { JudgeStatus } from "../../judge/judge.interface.js";

export interface ITestCaseResult {
  passed: boolean;
  input: string;
  expected: string;
  actual: string;
  stdout?: string;
  stderr?: string;
  compileOutput?: string;
  runtime: number;
  status: JudgeStatus;
}

export interface ISubmission {
  _id?: ObjectId;
  userId: string;
  problemSlug: string;
  language: string;
  code: string;
  status: JudgeStatus;
  totalTestCases: number;
  passedTestCases: number;
  testCaseResults: ITestCaseResult[];
  createdAt: Date;
}