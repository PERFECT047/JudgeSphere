import axios from "../../service/axios";

export interface Problem {
  _id: string;
  problemNumber: number;
  title: string;
  slug: string;
  difficulty: "Easy" | "Medium" | "Hard";
  description: string;
  constraints: string[];
  examples: {
    input: string;
    output: string;
    explanation?: string;
  }[];
  testCases: {
    input: string;
    expectedOutput: string;
    explanation?: string;
  }[];
  tags: string[];
  topics: string[];
  leetcodeNumber?: number;
  note?: string;
  isPremium: boolean;
}

export interface ProblemFilter {
  search?: string;
  difficulty?: string[];
  tags?: string[];
  topics?: string[];
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface PaginatedResponse {
  problems: Problem[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface ProblemStats {
  byDifficulty: { _id: string; count: number }[];
  byTopic: { _id: string; count: number }[];
  byTag: { _id: string; count: number }[];
  total: number;
}

export const getProblems = async (filter: ProblemFilter): Promise<PaginatedResponse> => {
  const params = new URLSearchParams();
  
  if (filter.search) params.append("search", filter.search);
  if (filter.difficulty?.length) params.append("difficulty", filter.difficulty.join(","));
  if (filter.tags?.length) params.append("tags", filter.tags.join(","));
  if (filter.topics?.length) params.append("topics", filter.topics.join(","));
  if (filter.page) params.append("page", filter.page.toString());
  if (filter.limit) params.append("limit", filter.limit.toString());
  if (filter.sortBy) params.append("sortBy", filter.sortBy);
  if (filter.sortOrder) params.append("sortOrder", filter.sortOrder);

  const response = await axios.get<PaginatedResponse>(`/problems?${params.toString()}`);
  return response.data;
};

export const getProblemById = async (id: string): Promise<Problem> => {
  const response = await axios.get<Problem>(`/problems/${id}`);
  return response.data;
};

export const getProblemBySlug = async (slug: string): Promise<Problem> => {
  const response = await axios.get<Problem>(`/problems/slug/${slug}`);
  return response.data;
};

export const getProblemStats = async (): Promise<ProblemStats> => {
  const response = await axios.get<ProblemStats>("/problems/stats");
  return response.data;
};

export const getAllTags = async (): Promise<string[]> => {
  const response = await axios.get<string[]>("/problems/tags");
  return response.data;
};

export const getAllTopics = async (): Promise<string[]> => {
  const response = await axios.get<string[]>("/problems/topics");
  return response.data;
};

export const getProblemCount = async (): Promise<{ count: number }> => {
  const response = await axios.get<{ count: number }>("/problems/count");
  return response.data;
};