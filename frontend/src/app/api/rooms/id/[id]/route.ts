import { NextRequest, NextResponse } from "next/server";
import { getRoomById } from "@/lib/db/mongodb";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = (await params).id;

    if (!id) {
      return NextResponse.json(
        { error: "aidddress is required" },
        { status: 400 }
      );
    }

    const rooms = await getRoomById(id);
    console.log("rooms: ", rooms);
    return NextResponse.json(rooms);
  } catch (error) {
    console.error("Error fetching rooms:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
