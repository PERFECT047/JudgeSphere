import axios from "../../service/axios";

export interface ProblemSummary {
  _id: string;
  problemNumber: number;
  title: string;
  slug: string;
  tags: string[];
  topics: string[];
  state?: "Solved" | "Attempted" | null;
}

export interface ProblemDetail {
  _id: string;
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

export interface ProblemFilter {
  tags?: string[];
  topics?: string[];
  page?: number;
  limit?: number;
}

export interface PaginatedResponse {
  problems: ProblemSummary[];
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
  byTopic: { _id: string; count: number }[];
  byTag: { _id: string; count: number }[];
  total: number;
}

export const getProblems = async (filter: ProblemFilter): Promise<PaginatedResponse> => {
  const params = new URLSearchParams();
  
  if (filter.tags?.length) params.append("tags", filter.tags.join(","));
  if (filter.topics?.length) params.append("topics", filter.topics.join(","));
  if (filter.page) params.append("page", filter.page.toString());
  if (filter.limit) params.append("limit", filter.limit.toString());

  const response = await axios.get<PaginatedResponse>(`/problems?${params.toString()}`);
  return response.data;
};

export const getProblemById = async (id: string): Promise<ProblemDetail> => {
  const response = await axios.get<ProblemDetail>(`/problems/${id}`);
  return response.data;
};

export const getProblemBySlug = async (slug: string): Promise<ProblemDetail> => {
  const response = await axios.get<ProblemDetail>(`/problems/slug/${slug}`);
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