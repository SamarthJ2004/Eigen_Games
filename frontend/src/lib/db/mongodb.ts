import mongoose from "mongoose";
import { IRoom, Room } from "./models/Room";
import 'dotenv/config';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error(
    "Please define the MONGODB_URI environment variable inside .env.local"
  );
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

export async function connectDB() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGODB_URI!, opts).then((mongoose) => {
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    console.log("cached connection issue \n");
    throw e;
  }

  return cached.conn;
}

export async function saveRoom(details: Omit<IRoom, "createdAt">) {
  try {
    await connectDB();
    const room = new Room(details);
    const savedRoom = await room.save();
    return savedRoom.toObject();
  } catch (error) {
    console.error("Error saving room here:", error);
    throw error;
  }
}

export async function getRoomsByAddress(userAddress: string) {
  try {
    await connectDB();
    const rooms = await Room.find({ userAddress })
      .sort({ createdAt: -1 })
      .lean()
      .exec();
    return rooms;
  } catch (error) {
    console.error("Error fetching rooms:", error);
    throw error;
  }
}

export async function getAllRooms(
  options: {
    limit?: number;
    skip?: number;
    sortBy?: keyof IRoom;
    sortOrder?: "asc" | "desc";
  } = {}
) {
  try {
    await connectDB();

    const {
      limit = 50,
      skip = 0,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = options;

    const query = Room.find()
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(limit)
      .lean()
      .exec();

    const [rooms, total] = await Promise.all([query, Room.countDocuments()]);

    return {
      rooms,
      total,
      hasMore: total > skip + limit,
    };
  } catch (error) {
    console.error("Error fetching all rooms:", error);
    throw error;
  }
}

export async function getRoomById(roomId: string) {
  try {
    await connectDB();
    const room = await Room.findOne({ id: roomId }).lean().exec();
    return room;
  } catch (error) {
    console.error("Error fetching room by ID:", error);
    throw error;
  }
}
