"use client";

import { useState, useEffect } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { ethers } from "ethers";
import CenteredWalletModal from "./privy_wallet";

interface WalletInfo {
  walletId: string;
  walletAddress: string;
  walletFund: number;
}

export default function CreateWallet() {
  const { user, authenticated } = usePrivy();
  const [walletInfo, setWalletInfo] = useState<WalletInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [amount, setAmount] = useState("");
  const [close, setClose] = useState(true);
  const [exists, setExists] = useState(false);

  // Check for existing wallet on component mount
  useEffect(() => {
    const savedWallet = localStorage.getItem("privyWallet");
    if (savedWallet) {
      const parsedWallet = JSON.parse(savedWallet);
      setWalletInfo(parsedWallet);
      setExists(true);
      setClose(true);
    }
  }, []);

  async function handleCreateWallet() {
    if (!authenticated || !user?.id) {
      alert("Please log in first.");
      return;
    }

    setLoading(true);

    // Check if wallet exists in localStorage
    const savedWallet = localStorage.getItem("privyWallet");
    if (savedWallet) {
      const parsedWallet = JSON.parse(savedWallet);
      setWalletInfo(parsedWallet);
      setExists(true);
      setClose(false);
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/create-wallet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id }),
      });

      const data = await response.json();
      if (response.ok) {
        const newWalletInfo = {
          walletId: data.walletId,
          walletAddress: data.walletAddress,
          walletFund: data.amount || 0,
        };

        // Save wallet info to localStorage
        localStorage.setItem("privyWallet", JSON.stringify(newWalletInfo));

        setWalletInfo(newWalletInfo);
        setExists(true);
      } else {
        alert("Error: " + data.error);
      }
    } catch (error) {
      console.error("Network error:", error);
      alert("Network error");
    }

    setLoading(false);
    setClose(false);
  }

  const handleFundWallet = async () => {
    try {
      if (!window.ethereum) {
        alert("Please install MetaMask to use this feature");
        return;
      }

      await window.ethereum.request({ method: "eth_requestAccounts" });

      const amountInWei = ethers.utils
        .parseEther(amount.toString())
        .toHexString();
      const money = amountInWei.slice(2);

      if (walletInfo) {
        const transactionParameters = {
          to: walletInfo.walletAddress,
          from: window.ethereum.selectedAddress,
          value: `0x${money}`,
        };

        await window.ethereum.request({
          method: "eth_sendTransaction",
          params: [transactionParameters],
        });

        // Update wallet info in localStorage with new amount
        const updatedWalletInfo = {
          ...walletInfo,
          walletFund: walletInfo.walletFund + parseFloat(amount),
        };
        localStorage.setItem("privyWallet", JSON.stringify(updatedWalletInfo));
        setWalletInfo(updatedWalletInfo);
      }

      setAmount("");
      alert("Transaction initiated successfully!");
    } catch (error) {
      console.error("Error:", error);
      alert("Transaction failed. Please try again.");
    }
  };

  const handleCloseWallet = () => {
    setClose(true);
  };

  return (
    <div>
      <button
        onClick={handleCreateWallet}
        className="bg-blue-500 text-white py-2 px-4 rounded-xl"
        disabled={loading}
      >
        {loading
          ? "Creating Wallet..."
          : exists
          ? "Open Wallet"
          : "Create Wallet"}
      </button>

      {walletInfo && !close && (
        <CenteredWalletModal
          handleFundWallet={handleFundWallet}
          amount={amount}
          setAmount={setAmount}
          walletInfo={walletInfo}
          onClose={handleCloseWallet}
        />
      )}
    </div>
  );
}
