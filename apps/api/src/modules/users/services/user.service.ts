import bcrypt from "bcryptjs";
import jwt, { JwtPayload } from "jsonwebtoken";

import { findByEmail, createUser } from "../repository/user.repository";
import { env } from "@repo/env/server";
import { ApiError } from "../../../common/errors/apiError";
import { CreateUserDto, LoginDto, AuthResponseDto, RefreshTokenDto, RefreshTokenResponseDto } from "@repo/dto";


const isJwtPayload = (val: string | JwtPayload): val is JwtPayload & { sub: string; email: string } =>
  typeof val === "object" && val !== null && typeof val.sub === "string" && typeof val.email === "string";


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

  const token = jwt.sign(
    { sub: created._id, email: created.email },
    env.JWT_SECRET,
    { expiresIn: env.JWT_EXPIRY }
  );

  const refreshToken = jwt.sign(
    { sub: created._id, email: created.email },
    env.JWT_SECRET,
    { expiresIn: env.REFRESH_TOKEN_EXPIRY }
  );

  return {
    user: {
      _id: created._id?.toString(),
      name: created.name,
      email: created.email,
    },
    token,
    refreshToken,
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

  const token = jwt.sign(
    { sub: user._id.toString(), email: user.email },
    env.JWT_SECRET,
    { expiresIn: env.JWT_EXPIRY }
  );

  const refreshToken = jwt.sign(
    { sub: user._id.toString(), email: user.email },
    env.JWT_SECRET,
    { expiresIn: env.REFRESH_TOKEN_EXPIRY }
  );

  return {
    user: {
      _id: user._id.toString(),
      name: user.name,
      email: user.email,
    },
    token,
    refreshToken,
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

    const newToken = jwt.sign(
      { sub: user._id.toString(), email: user.email },
      env.JWT_SECRET,
      { expiresIn: env.JWT_EXPIRY }
    );

    const newRefreshToken = jwt.sign(
      { sub: user._id.toString(), email: user.email },
      env.JWT_SECRET,
      { expiresIn: env.REFRESH_TOKEN_EXPIRY }
    );

    return { token: newToken, refreshToken: newRefreshToken };
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      throw new ApiError("Invalid or expired refresh token", 401);
    }
    throw error;
  }
};