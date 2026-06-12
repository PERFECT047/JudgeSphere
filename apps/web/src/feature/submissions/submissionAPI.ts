import axios from "../../service/axios";

export interface TestCaseResult {
  passed: boolean;
  input: string;
  expected: string;
  actual: string;
  runtime?: number;
}

export interface Submission {
  _id: string;
  problemSlug: string;
  language: string;
  status: "Accepted" | "Wrong Answer" | "Runtime Error";
  totalTestCases: number;
  passedTestCases: number;
  testCaseResults: TestCaseResult[];
  createdAt: string;
}

export interface RunCodeRequest {
  problemSlug: string;
  language: string;
  code: string;
}

export interface RunCodeResponse {
  totalTestCases: number;
  passedTestCases: number;
  status: "Accepted" | "Wrong Answer" | "Runtime Error";
  testCaseResults: TestCaseResult[];
}

export const runCodeAPI = async (data: RunCodeRequest): Promise<RunCodeResponse> => {
  const response = await axios.post<RunCodeResponse>("/submissions/run", data);
  return response.data;
};

export const submitCodeAPI = async (data: RunCodeRequest): Promise<Submission> => {
  const response = await axios.post<Submission>("/submissions/submit", data);
  return response.data;
};

export const getSubmissionsAPI = async (problemSlug: string): Promise<Submission[]> => {
  const response = await axios.get<Submission[]>(`/submissions/${problemSlug}`);
  return response.data;
};

export interface RunCustomTestCaseRequest {
  problemSlug: string;
  language: string;
  code: string;
  input: string;
  expectedOutput?: string;
}

export const runCustomTestCaseAPI = async (data: RunCustomTestCaseRequest): Promise<RunCodeResponse> => {
  const response = await axios.post<RunCodeResponse>("/submissions/run-custom", data);
  return response.data;
};
