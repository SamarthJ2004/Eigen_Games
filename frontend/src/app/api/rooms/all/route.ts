// app/api/rooms/all/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getAllRooms, connectDB } from "@/lib/db/mongodb";
import { IRoom } from "@/lib/db/models/Room";

export async function GET(request: NextRequest) {
  try {
    // Ensure database connection
    await connectDB();

    const searchParams = request.nextUrl.searchParams;

    // Validate and parse query parameters
    const limit = Math.min(parseInt(searchParams.get("limit") || "10"), 50); // Cap at 50
    const skip = Math.max(parseInt(searchParams.get("skip") || "0"), 0); // Ensure non-negative

    // Validate sort parameters
    const validSortFields = ["createdAt", "topic", "id"];
    const requestedSortBy = searchParams.get("sortBy") as keyof IRoom;
    const sortBy = validSortFields.includes(requestedSortBy)
      ? requestedSortBy
      : "createdAt";

    const validSortOrders = ["asc", "desc"];
    const requestedSortOrder = searchParams.get("sortOrder") as "asc" | "desc";
    const sortOrder = validSortOrders.includes(requestedSortOrder)
      ? requestedSortOrder
      : "desc";

    const options = {
      limit,
      skip,
      sortBy,
      sortOrder,
    };

    const result = await getAllRooms(options);

    // Return 404 if no rooms found
    if (!result || !result.rooms || result.rooms.length === 0) {
      return NextResponse.json(
        { message: "No rooms found", rooms: [], total: 0, hasMore: false },
        { status: 200 }
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error in /api/rooms/all: ", error);

    // Check if it's a connection error
    if (error instanceof Error && error.message.includes("ECONNREFUSED")) {
      return NextResponse.json(
        { error: "Database connection failed. Please try again later." },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
