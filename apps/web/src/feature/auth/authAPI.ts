import axios from "../../service/axios";
import type { LoginDto, CreateUserDto, AuthResponseDto, RefreshTokenResponseDto } from "@repo/dto";

export const loginAPI = async (data: LoginDto): Promise<AuthResponseDto> => {
  const response = await axios.post<AuthResponseDto>(
    "/user/login",
    data
  );
  return response.data;
};

export const signupAPI = async (data: CreateUserDto): Promise<AuthResponseDto> => {
  const response = await axios.post<AuthResponseDto>(
    "/user/signup",
    data
  );
  return response.data;
};

export const refreshTokenAPI = async (): Promise<RefreshTokenResponseDto> => {
  const response = await axios.post<RefreshTokenResponseDto>(
    "/user/refresh"
  );
  return response.data;
};

export const logoutAPI = async (): Promise<void> => {
  await axios.post("/user/logout");
};

// Profile
export const getProfileAPI = async (): Promise<{ _id: string; name: string; email: string; createdAt: string }> => {
  const response = await axios.get("/user/me");
  return response.data;
};

export const updateProfileAPI = async (data: { name?: string; email?: string }): Promise<{ _id: string; name: string; email: string }> => {
  const response = await axios.put("/user/profile", data);
  return response.data;
};

export const changePasswordAPI = async (data: { currentPassword: string; newPassword: string }): Promise<{ message: string }> => {
  const response = await axios.put("/user/password", data);
  return response.data;
};

export interface DashboardStats {
  totalSubmissions: number;
  acceptedSubmissions: number;
  acceptanceRate: number;
  languagesUsed: string[];
  recentSubmissions: {
    status: string;
    language: string;
    problemSlug: string;
    createdAt: string;
    passedTestCases: number;
    totalTestCases: number;
  }[];
}

export const getDashboardStatsAPI = async (): Promise<DashboardStats> => {
  const response = await axios.get("/user/dashboard/stats");
  return response.data;
};
