import { Request, Response, NextFunction } from "express";
import * as userService from "../services/user.service";
import { parseToMs } from "../../../common/utils/timeConvertor"
import { CreateUserDtoSchema, LoginDtoSchema, RefreshTokenDtoSchema } from "@repo/dto"
import { env } from "@repo/env/server";


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

    res.status(201).json({
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
      return res.status(401).json({ message: "Refresh token missing" });
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