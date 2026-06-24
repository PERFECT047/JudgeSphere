import { db } from "../../../config/database/mongodb.js";
import { ObjectId, Filter, Document } from "mongodb";
import { IProblem, IProblemFilter } from "../interfaces/problem.interface.js";

const problems = db.collection<IProblem>("problems");

// Create indexes for efficient querying
problems.createIndex({ slug: 1 }, { unique: true });
problems.createIndex({ problemNumber: 1 }, { unique: true });
problems.createIndex({ difficulty: 1 });
problems.createIndex({ tags: 1 });
problems.createIndex({ topics: 1 });
problems.createIndex({ title: "text", description: "text" });

export const findBySlug = async (slug: string) => {
  return problems.findOne({ slug });
};

export const findByProblemNumber = async (problemNumber: number) => {
  return problems.findOne({ problemNumber });
};

export const findById = async (id: string) => {
  return problems.findOne({ _id: new ObjectId(id) });
};

export const createProblem = async (problem: Omit<IProblem, "_id">) => {
  const result = await problems.insertOne(problem);
  return { _id: result.insertedId, ...problem };
};

export const createManyProblems = async (problemList: Omit<IProblem, "_id">[]) => {
  if (problemList.length === 0) return { insertedCount: 0 };

  // Use ordered: false to continue on duplicate key errors
  const result = await problems.insertMany(problemList as any[], { ordered: false }).catch(err => {
    // Handle bulk write errors (duplicates)
    if (err.insertedCount !== undefined) {
      return err;
    }
    throw err;
  });

  return { insertedCount: result.insertedCount || 0 };
};

export const findProblemsWithFilter = async (
  filter: IProblemFilter
) => {
  const query: Filter<Document> = {};

  // Text search
  if (filter.search) {
    query.$or = [
      { title: { $regex: filter.search, $options: "i" } },
      { tags: { $regex: filter.search, $options: "i" } },
      { note: { $regex: filter.search, $options: "i" } },
      { description: { $regex: filter.search, $options: "i" } },
    ];
  }

  // Difficulty filter
  if (filter.difficulty && filter.difficulty.length > 0) {
    query.difficulty = { $in: filter.difficulty } as any;
  }

  // Tags filter
  if (filter.tags && filter.tags.length > 0) {
    query.tags = { $in: filter.tags };
  }

  // Topics filter
  if (filter.topics && filter.topics.length > 0) {
    query.topics = { $in: filter.topics };
  }

  const page = filter.page || 1;
  const limit = filter.limit || 20;
  const skip = (page - 1) * limit;

  // Sort
  const sortBy = filter.sortBy || "problemNumber";
  const sortOrder = filter.sortOrder === "desc" ? -1 : 1;
  const sort: Document = { [sortBy]: sortOrder };

  const [results, total] = await Promise.all([
    problems.find(query).sort(sort).skip(skip).limit(limit).toArray(),
    problems.countDocuments(query),
  ]);

  return {
    problems: results,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasNext: page * limit < total,
      hasPrev: page > 1,
    },
  };
};

export const getProblemStats = async () => {
  const stats = await problems
    .aggregate([
      {
        $facet: {
          byDifficulty: [
            { $group: { _id: "$difficulty", count: { $sum: 1 } } },
          ],
          byTopic: [
            { $unwind: "$topics" },
            { $group: { _id: "$topics", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
          ],
          byTag: [
            { $unwind: "$tags" },
            { $group: { _id: "$tags", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
          ],
          total: [{ $count: "count" }],
        },
      },
    ])
    .toArray();

  return {
    byDifficulty: stats[0]?.byDifficulty || [],
    byTopic: stats[0]?.byTopic || [],
    byTag: stats[0]?.byTag || [],
    total: stats[0]?.total[0]?.count || 0,
  };
};

export const getMaxProblemNumber = async () => {
  const result = await problems
    .find()
    .sort({ problemNumber: -1 })
    .limit(1)
    .toArray();
  return result[0]?.problemNumber || 0;
};

export const getAllTags = async () => {
  const result = await problems.distinct("tags");
  return result.sort();
};

export const getAllTopics = async () => {
  const result = await problems.distinct("topics");
  return result.sort();
};

export const deleteAllProblems = async () => {
  return problems.deleteMany({});
};

export const getProblemCount = async () => {
  return problems.countDocuments({});
};