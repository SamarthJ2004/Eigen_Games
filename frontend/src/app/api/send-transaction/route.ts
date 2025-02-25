import { NextRequest, NextResponse } from "next/server";
import { PrivyClient } from "@privy-io/server-auth";
import { ethers } from "ethers";

export async function POST(req: NextRequest) {
  "use server";

  try {
    const privy = new PrivyClient(
      process.env.NEXT_PUBLIC_PRIVY_APP_ID || "a",
      process.env.NEXT_PUBLIC_APP_SECRET || "b"
    );

    const { walletId, amount, to, metaData } = await req.json();
    // if ( !to || !amount) {
    //   return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    // }

    const amountInWei = ethers.utils
      .parseEther(amount.toString())
      .toHexString();
    const money = amountInWei.slice(2);

    console.log("walletAPiiiiii   ", privy.walletApi);

    

    const response = await privy.walletApi.rpc({
      walletId: walletId,
      method: "eth_sendTransaction",
      caip2: "eip155:84532",
      params: {
        transaction: {
          to: to,
          data: metaData,
          value: `0x${money}`,
          chainId: 84532,
        },
      },
    });

    if ("data" in response) {
      const { data } = response;
      console.log(data.hash);
      console.log(data.caip2);
    } else if ("error" in response) {
      console.error(response.error.message);
    }

    const hash = (response as { data: { hash: string } }).data.hash;
    return NextResponse.json(
      { message: "Transaction sent successfully", txHash: hash },
      { status: 200 }
    );
  } catch (error) {
    console.log("Error sending transaction:", error);
    return NextResponse.json(
      { error: "Failed to send transaction" },
      { status: 500 }
    );
  }
}
