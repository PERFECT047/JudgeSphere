import bcrypt from "bcryptjs";
import jwt, { JwtPayload } from "jsonwebtoken";

import { findByEmail, findById, createUser, updateUser, updatePassword } from "../repository/user.repository";
import { env } from "@repo/env/server";
import { ApiError } from "../../../common/errors/apiError";
import type { CreateUserDto, LoginDto, AuthResponseDto, RefreshTokenDto, RefreshTokenResponseDto, UpdateProfileDto, ChangePasswordDto } from "@repo/dto";


const isJwtPayload = (val: string | JwtPayload): val is JwtPayload & { sub: string; email: string } =>
  typeof val === "object" && val !== null && typeof val.sub === "string" && typeof val.email === "string";


const generateTokens = (userId: string, email: string) => {
  const token = jwt.sign(
    { sub: userId, email },
    env.JWT_SECRET,
    { expiresIn: env.JWT_EXPIRY }
  );

  const refreshToken = jwt.sign(
    { sub: userId, email },
    env.JWT_SECRET,
    { expiresIn: env.REFRESH_TOKEN_EXPIRY }
  );

  return { token, refreshToken };
};

export const signup = async (data: CreateUserDto): Promise<AuthResponseDto> => {
  const existing = await findByEmail(data.email);

  if (existing) {
    throw new ApiError("Email already in use", 400);
  }

  const hashed = await bcrypt.hash(data.password, 10);

  const created = await createUser({
    name: data.name,
    email: data.email,
    password: hashed,
    createdAt: new Date(),
  });

  const tokens = generateTokens(created._id, created.email);

  return {
    user: {
      _id: created._id?.toString(),
      name: created.name,
      email: created.email,
    },
    ...tokens,
  };
};


export const signin = async (data: LoginDto): Promise<AuthResponseDto> => {
  const user = await findByEmail(data.email);

  if (!user) {
    throw new ApiError("Invalid credentials", 401);
  }

  const match = await bcrypt.compare(data.password, user.password);

  if (!match) {
    throw new ApiError("Invalid credentials", 401);
  }

  const tokens = generateTokens(user._id.toString(), user.email);

  return {
    user: {
      _id: user._id.toString(),
      name: user.name,
      email: user.email,
    },
    ...tokens,
  };
};


export const refreshTokenService = async (
  data: RefreshTokenDto
): Promise<RefreshTokenResponseDto> => {
  try {
    const raw = jwt.verify(data.refreshToken, env.JWT_SECRET);

    if (!isJwtPayload(raw)) {
      throw new ApiError("Invalid token payload", 401);
    }

    const user = await findByEmail(raw.email);
    if (!user) {
      throw new ApiError("User not found", 401);
    }

    const tokens = generateTokens(user._id.toString(), user.email);

    return tokens;
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      throw new ApiError("Invalid or expired refresh token", 401);
    }
    throw error;
  }
};

// ========== PROFILE ==========

export const getProfile = async (userId: string) => {
  const user = await findById(userId);
  if (!user) {
    throw new ApiError("User not found", 404);
  }

  return {
    _id: user._id.toString(),
    name: user.name,
    email: user.email,
    createdAt: user.createdAt,
  };
};

export const updateProfile = async (userId: string, data: UpdateProfileDto) => {
  const user = await findById(userId);
  if (!user) {
    throw new ApiError("User not found", 404);
  }

  // If email is being changed, check it's not already used
  if (data.email && data.email !== user.email) {
    const existing = await findByEmail(data.email);
    if (existing) {
      throw new ApiError("Email already in use", 400);
    }
  }

  const updates: Record<string, any> = {};
  if (data.name) updates.name = data.name;
  if (data.email) updates.email = data.email;

  if (Object.keys(updates).length === 0) {
    throw new ApiError("No fields to update", 400);
  }

  const updated = await updateUser(userId, updates);
  if (!updated) {
    throw new ApiError("Failed to update profile", 500);
  }

  return {
    _id: updated._id.toString(),
    name: updated.name,
    email: updated.email,
  };
};

export const changePassword = async (userId: string, data: ChangePasswordDto) => {
  const user = await findById(userId);
  if (!user) {
    throw new ApiError("User not found", 404);
  }

  const match = await bcrypt.compare(data.currentPassword, user.password);
  if (!match) {
    throw new ApiError("Current password is incorrect", 401);
  }

  const hashed = await bcrypt.hash(data.newPassword, 10);
  const updated = await updatePassword(userId, hashed);

  if (!updated) {
    throw new ApiError("Failed to update password", 500);
  }

  return { message: "Password updated successfully" };
};

export const getDashboardStats = async (userId: string) => {
  const { db } = await import("../../../config/database/mongodb");
  const submissions = db.collection("submissions");

  const totalSubmissions = await submissions.countDocuments({ userId });
  const acceptedSubmissions = await submissions.countDocuments({ userId, status: "Accepted" });
  
  // Get unique languages used by this user
  const languagesUsed = await submissions.distinct("language", { userId });
  
  // Get recent submissions
  const recentSubmissions = await submissions
    .find({ userId })
    .sort({ createdAt: -1 })
    .limit(5)
    .project({ status: 1, language: 1, problemSlug: 1, createdAt: 1, passedTestCases: 1, totalTestCases: 1 })
    .toArray();

  return {
    totalSubmissions,
    acceptedSubmissions,
    acceptanceRate: totalSubmissions > 0 ? Math.round((acceptedSubmissions / totalSubmissions) * 100) : 0,
    languagesUsed,
    recentSubmissions,
  };
};
