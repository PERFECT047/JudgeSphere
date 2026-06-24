import axios from "../../service/axios";

export interface ReviewCodeRequest {
  code: string;
  language: string;
  problemSlug: string;
}

export interface ReviewCodeResponse {
  review: string;
}

export const reviewCodeAPI = async (data: ReviewCodeRequest): Promise<ReviewCodeResponse> => {
  const response = await axios.post<ReviewCodeResponse>("/ai-review/review", data);
  return response.data;
};

export interface GenerateHintRequest {
  code: string;
  language: string;
  problemSlug: string;
  previousHints: string[];
}

export interface GenerateHintResponse {
  hint: string;
}

export const generateHintAPI = async (data: GenerateHintRequest): Promise<GenerateHintResponse> => {
  const response = await axios.post<GenerateHintResponse>("/ai-review/hint", data);
  return response.data;
};