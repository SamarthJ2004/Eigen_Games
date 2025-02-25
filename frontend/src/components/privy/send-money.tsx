"use client";

import { useState } from "react";
import { usePrivy } from "@privy-io/react-auth";

export default function SendTransaction() {
  const { user, authenticated } = usePrivy();
  const [txHash, setTxHash] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSendTransaction() {
    // if (!authenticated || !user?.id) {
    //   alert("Please log in first.");
    //   return;
    // }

    setLoading(true);

    try {
      const response = await fetch("/api/send-transaction", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: "0x34040646ba5166C6Df72Eb82d754AcF9EaCe5724", // Replace with recipient address
          amount: "0.0005", // Amount in ETH
        }),
      });

      const data = await response.json();
      if (response.ok) {
        setTxHash(data.txHash);
      } else {
        alert("Error: " + data.error);
      }
    } catch (error) {
      console.error("Network error:", error);
      alert("Network error");
    }

    setLoading(false);
  }

  return (
    <div>
      <button
        onClick={handleSendTransaction}
        className="bg-green-500 text-white p-2 rounded"
        disabled={loading}
      >
        {loading ? "Sending..." : "Send Transaction"}
      </button>

      {txHash && (
        <div className="mt-4 p-4 bg-gray-200 rounded">
          <p>
            <strong>Transaction Sent!</strong>
          </p>
          <p>
            <strong>Tx Hash:</strong>{" "}
            <a
              href={`https://etherscan.io/tx/${txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500"
            >
              {txHash}
            </a>
          </p>
        </div>
      )}
    </div>
  );
}
