import { ObjectId } from "mongodb";

export interface ITestCase {
  input: string;
  expectedOutput: string;
  explanation?: string;
}

export interface IProblem {
  _id?: ObjectId;
  problemNumber: number; // Our own DB numbering
  title: string;
  slug: string; // Unique slug for URL-friendly identifier
  description: string;
  constraints: string[];
  examples: {
    input: string;
    output: string;
    explanation?: string;
  }[];
  testCases: ITestCase[];
  tags: string[];
  topics: string[];
  createdAt: Date;
  updatedAt: Date;
}

/** Lightweight summary for problem list (no description/examples/testCases) */
export interface IProblemSummary {
  _id?: string;
  problemNumber: number;
  title: string;
  slug: string;
  tags: string[];
  topics: string[];
}

/** Full detail for problem solve page (no testCases) */
export interface IProblemDetail {
  _id?: string;
  problemNumber: number;
  title: string;
  slug: string;
  description: string;
  constraints: string[];
  examples: {
    input: string;
    output: string;
    explanation?: string;
  }[];
  tags: string[];
  topics: string[];
}

export interface IProblemFilter {
  tags?: string[];
  topics?: string[];
  page?: number;
  limit?: number;
}