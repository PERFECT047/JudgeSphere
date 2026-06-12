import * as problemRepo from "../repositories/problem.repository";
import { IProblem, IProblemFilter } from "../interfaces/problem.interface";
import { ApiError } from "../../../common/errors/apiError";

export const getProblems = async (filter: IProblemFilter) => {
  return problemRepo.findProblemsWithFilter(filter);
};

export const getProblemById = async (id: string) => {
  const problem = await problemRepo.findById(id);
  if (!problem) {
    throw new ApiError("Problem not found", 404);
  }
  return problem;
};

export const getProblemBySlug = async (slug: string) => {
  const problem = await problemRepo.findBySlug(slug);
  if (!problem) {
    throw new ApiError("Problem not found", 404);
  }
  return problem;
};

export const getProblemStats = async () => {
  return problemRepo.getProblemStats();
};

export const getAllTags = async () => {
  return problemRepo.getAllTags();
};

export const getAllTopics = async () => {
  return problemRepo.getAllTopics();
};

export const importProblems = async (problems: Omit<IProblem, "_id">[]) => {
  const result = await problemRepo.createManyProblems(problems);
  return {
    imported: result.insertedCount,
    total: problems.length,
  };
};

export const deleteAllProblems = async () => {
  return problemRepo.deleteAllProblems();
};

export const getProblemCount = async () => {
  return problemRepo.getProblemCount();
};