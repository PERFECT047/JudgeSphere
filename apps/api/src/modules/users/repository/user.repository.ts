import { db } from "../../../config/database/mongodb";
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
