import { Request, Response, NextFunction } from "express";
import * as userService from "../services/user.service";
import { parseToMs } from "../../../common/utils/timeConvertor"
import { CreateUserDtoSchema, LoginDtoSchema, RefreshTokenDtoSchema, UpdateProfileDtoSchema, ChangePasswordDtoSchema } from "@repo/dto"
import { env } from "@repo/env/server";
import { HttpStatus } from "../../../common/constants/httpStatus";


const setRefreshTokenCookie = (res: Response, refreshToken: string) => {
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: parseToMs(env.REFRESH_TOKEN_EXPIRY),
    path: "/",
  });
};

const clearRefreshTokenCookie = (res: Response) => {
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
  });
};

export const signup = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const payload = CreateUserDtoSchema.parse(req.body);

    const result = await userService.signup(payload);

    setRefreshTokenCookie(res, result.refreshToken);

    res.status(HttpStatus.CREATED).json({
      user: result.user,
      token: result.token,
    });
  } catch (err) {
    next(err);
  }
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const payload = LoginDtoSchema.parse(req.body);

    const result = await userService.signin(payload);

    setRefreshTokenCookie(res, result.refreshToken);

    res.json({
      user: result.user,
      token: result.token,
    });
  } catch (err) {
    next(err);
  }
};

export const refresh = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      clearRefreshTokenCookie(res);
      return res.status(HttpStatus.UNAUTHORIZED).json({ message: "Refresh token missing" });
    }

    const result = await userService.refreshTokenService({ refreshToken });

    setRefreshTokenCookie(res, result.refreshToken);

    res.json({
      token: result.token,
    });
  } catch (err) {
    next(err);
  }
};

export const logout = async (
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  clearRefreshTokenCookie(res);
  res.json({ message: "Logged out successfully" });
};

// ========== PROFILE ==========

export const getProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user!.userId;
    const profile = await userService.getProfile(userId);
    res.json(profile);
  } catch (err) {
    next(err);
  }
};

export const updateProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user!.userId;
    const payload = UpdateProfileDtoSchema.parse(req.body);
    const profile = await userService.updateProfile(userId, payload);
    res.json(profile);
  } catch (err) {
    next(err);
  }
};

export const changePassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user!.userId;
    const payload = ChangePasswordDtoSchema.parse(req.body);
    const result = await userService.changePassword(userId, payload);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

export const getDashboardStats = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user!.userId;
    const stats = await userService.getDashboardStats(userId);
    res.json(stats);
  } catch (err) {
    next(err);
  }
};