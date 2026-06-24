import { db } from "../../../config/database/mongodb.js";
import { ObjectId } from "mongodb";

const users = db.collection("users");

export const findByEmail = async (email: string) => {
  return users.findOne({ email });
};

export const findById = async (id: string) => {
  return users.findOne({ _id: new ObjectId(id) });
};

export const createUser = async (user: any) => {
  const res = await users.insertOne(user);
  return { _id: res.insertedId.toString(), ...user };
};

export const updateUser = async (id: string, updates: Record<string, any>) => {
  const result = await users.findOneAndUpdate(
    { _id: new ObjectId(id) },
    { $set: updates },
    { returnDocument: "after" }
  );
  return result;
};

export const updatePassword = async (id: string, hashedPassword: string) => {
  const result = await users.findOneAndUpdate(
    { _id: new ObjectId(id) },
    { $set: { password: hashedPassword } },
    { returnDocument: "after" }
  );
  return result;
};