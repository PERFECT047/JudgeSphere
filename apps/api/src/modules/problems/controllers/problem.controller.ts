import { Request, Response, NextFunction } from "express";
import * as problemService from "../services/problem.service.js";
import { HttpStatus } from "@repo/dto";
import { IProblemFilter } from "../interfaces/problem.interface.js";

export const getProblems = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { tags, topics, page, limit } = req.query;
    const userId = req.user!.userId;

    const filter: IProblemFilter = {
      tags: tags ? (tags as string).split(",") : undefined,
      topics: topics ? (topics as string).split(",") : undefined,
      page: page ? parseInt(page as string) : 1,
      limit: limit ? parseInt(limit as string) : 20,
    };

    const result = await problemService.getProblems(userId, filter);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

export const getProblemById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const problem = await problemService.getProblemById(req.params.id as string);
    res.json(problem);
  } catch (err) {
    next(err);
  }
};

export const getProblemBySlug = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const problem = await problemService.getProblemBySlug(req.params.slug as string);
    res.json(problem);
  } catch (err) {
    next(err);
  }
};

export const getProblemStats = async (
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const stats = await problemService.getProblemStats();
    res.json(stats);
  } catch (err) {
    next(err);
  }
};

export const getAllTags = async (
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const tags = await problemService.getAllTags();
    res.json(tags);
  } catch (err) {
    next(err);
  }
};

export const getAllTopics = async (
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const topics = await problemService.getAllTopics();
    res.json(topics);
  } catch (err) {
    next(err);
  }
};

export const importProblems = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { problems } = req.body;
    if (!problems || !Array.isArray(problems)) {
      return res.status(HttpStatus.BAD_REQUEST).json({ message: "problems array is required" });
    }
    const result = await problemService.importProblems(problems);
    res.status(HttpStatus.CREATED).json(result);
  } catch (err) {
    next(err);
  }
};

export const deleteAllProblems = async (
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await problemService.deleteAllProblems();
    res.json({ deleted: result.deletedCount });
  } catch (err) {
    next(err);
  }
};

export const getProblemCount = async (
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const count = await problemService.getProblemCount();
    res.json({ count });
  } catch (err) {
    next(err);
  }
};