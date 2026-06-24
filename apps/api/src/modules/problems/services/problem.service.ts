import * as problemRepo from "../repositories/problem.repository.js";
import { IProblem, IProblemFilter, IProblemDetail } from "../interfaces/problem.interface.js";
import { ApiError } from "../../../common/errors/apiError.js";
import { HttpStatus } from "@repo/dto";

export const getProblems = async (userId: string, filter: IProblemFilter) => {
  const { db } = await import("../../../config/database/mongodb.js");
  const userProblemStates = db.collection("userProblemStates");

  const result = await problemRepo.findProblemsWithFilter(filter);

  // Fetch all problem states for this user
  const states = await userProblemStates.find({ userId }).toArray();
  const statesMap = new Map(states.map(s => [s.problemSlug, s.state]));

  // Merge the state into the problems summary list
  const problemsWithState = result.problems.map(p => ({
    ...p,
    state: statesMap.get(p.slug) || null
  }));

  return {
    problems: problemsWithState,
    pagination: result.pagination
  };
};

export const getProblemById = async (id: string) => {
  const problem = await problemRepo.findById(id);
  if (!problem) {
    throw new ApiError("Problem not found", HttpStatus.NOT_FOUND);
  }
  return problem;
};

export const getProblemBySlug = async (slug: string): Promise<IProblemDetail> => {
  const problem = await problemRepo.findProblemDetail(slug);
  if (!problem) {
    throw new ApiError("Problem not found", HttpStatus.NOT_FOUND);
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