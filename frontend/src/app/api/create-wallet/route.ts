import { PrivyClient } from "@privy-io/server-auth";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const privy = new PrivyClient(
      process.env.NEXT_PUBLIC_PRIVY_APP_ID || "a",
      process.env.NEXT_PUBLIC_APP_SECRET || "b"
    );
    console.log("prvvy \n", privy);

    // const { userId } = await req.json();
    // if (!userId) {
    //   return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    // }

    // Create an embedded wallet for the user
    const wallet = await privy.walletApi.create({ chainType: "ethereum" });
    console.log("wallet ", wallet);

    return NextResponse.json(
      {
        message: "Wallet created successfully",
        walletAddress: wallet.address,
        walletId: wallet.id,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error creating wallet:", error);
    return NextResponse.json(
      { error: "Failed to create wallet" },
      { status: 500 }
    );
  }
}
