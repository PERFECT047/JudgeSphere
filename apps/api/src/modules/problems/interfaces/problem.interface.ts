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
  difficulty: "Easy" | "Medium" | "Hard";
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
  starterCode: Record<string, string>; // language -> starter code
  leetcodeNumber?: number; // Original LeetCode number for reference
  note?: string; // Brief note/hint
  acceptanceRate?: number;
  isPremium: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IProblemFilter {
  search?: string;
  difficulty?: string[];
  tags?: string[];
  topics?: string[];
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}