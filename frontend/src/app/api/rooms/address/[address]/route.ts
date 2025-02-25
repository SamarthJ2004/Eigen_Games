import { NextRequest, NextResponse } from "next/server";
import { getRoomsByAddress } from "@/lib/db/mongodb";
export async function GET(
  request: NextRequest,
  { params }: { params: { address: string } }
) {
  try {
    const address = (await params).address;

    if (!address) {
      return NextResponse.json(
        { error: "Address is required" },
        { status: 400 }
      );
    }

    const rooms = await getRoomsByAddress(address);
    return NextResponse.json(rooms);
  } catch (error) {
    console.error("Error fetching rooms:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
