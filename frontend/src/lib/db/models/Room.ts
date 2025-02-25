import mongoose, { Schema, Document } from "mongoose";

export interface IRoom extends Document {
  id: string;
  link: string;
  bots: string[];
  topic: string;
  userAddress: string;
  contractAddress: string;
  createdAt: Date;
}

const RoomSchema = new Schema({
  id: { type: String, required: true, unique: true },
  link: { type: String, required: true },
  bots: { type: [String], required: true },
  topic: { type: String, required: true },
  userAddress: { type: String, required: true },
  contractAddress: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

export const Room =
  mongoose.models.Room || mongoose.model<IRoom>("Room", RoomSchema);
