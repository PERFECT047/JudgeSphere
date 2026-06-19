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