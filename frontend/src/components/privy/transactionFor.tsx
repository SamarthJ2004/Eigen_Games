"use client";

import { useState } from "react";

export default function TransactionForm() {
  const [walletId, setWalletId] = useState("");
  const [amount, setAmount] = useState("");
  const [txHash, setTxHash] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function sendTransaction(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/send-transaction", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          walletId: walletId,
          amount,
          to: ""
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
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-4 bg-white rounded-lg shadow-md max-w-md mx-auto mt-10">
      <h2 className="text-xl font-bold mb-4">Send Transaction</h2>
      <form onSubmit={sendTransaction} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Wallet ID</label>
          <input
            type="text"
            value={walletId}
            onChange={(e) => setWalletId(e.target.value)}
            className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-black"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Amount (ETH)</label>
          <input
            type="text"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-black"
            required
          />
        </div>
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
          disabled={loading}
        >
          {loading ? "Processing..." : "Send Transaction"}
        </button>
      </form>
      {txHash && (
        <p className="mt-4 text-green-600">Transaction successful! Hash: {txHash}</p>
      )}
    </div>
  );
}
