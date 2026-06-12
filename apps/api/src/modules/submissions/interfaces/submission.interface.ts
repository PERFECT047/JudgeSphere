import { ObjectId } from "mongodb";

export interface ITestCaseResult {
  passed: boolean;
  input: string;
  expected: string;
  actual: string;
  runtime?: number;
}

export interface ISubmission {
  _id?: ObjectId;
  userId: string;
  problemSlug: string;
  language: string;
  code: string;
  status: "Accepted" | "Wrong Answer" | "Runtime Error";
  totalTestCases: number;
  passedTestCases: number;
  testCaseResults: ITestCaseResult[];
  createdAt: Date;
}