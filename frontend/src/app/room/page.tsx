"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { v4 as uuidv4 } from "uuid";
import { IRoom } from "@/lib/db/models/Room";
import Ballpit from "../../components/hard-ui/ballPit";
import { ethers } from "ethers";
import {
  contractABI,
  contractBytecode,
  FIGHTERS,
} from "@/lib/utils/constants/room";
import Navbar from "@/components/common-components/navbar";
import { usePrivy } from "@privy-io/react-auth";
import Footer from "@/components/common-components/footer";

export default function Room() {
  const { login, logout, user, ready } = usePrivy();
  const [display, setDisplay] = useState(false);

  const [rooms, setRooms] = useState<IRoom[]>([]);
  const [bot1, setBot1] = useState<string>("");
  const [bot2, setBot2] = useState<string>("");
  const [topic, setTopic] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [userAddress, setUserAddress] = useState<string | null>(null);
  const [provider, setProvider] =
    useState<ethers.providers.Web3Provider | null>(null);

  // Connect wallet on component mount
  useEffect(() => {
    connectWallet();
  }, []);

  // Fetch rooms when userAddress changes
  useEffect(() => {
    if (!userAddress) return;

    fetchRooms();
  }, [userAddress]);

  const fetchRooms = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/rooms/address/${userAddress}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setRooms(data);
    } catch (error) {
      console.error("Error fetching rooms:", error);
      setError("Failed to load rooms. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  // Connect MetaMask wallet
  const connectWallet = async () => {
    if (typeof window.ethereum === "undefined") {
      setError("Please install MetaMask to continue.");
      return;
    }

    try {
      const web3Provider = new ethers.providers.Web3Provider(window.ethereum);
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      setUserAddress(accounts[0]);
      setProvider(web3Provider);
      setError("");
    } catch (error) {
      console.error("Error connecting to MetaMask:", error);
      setError("Failed to connect wallet. Please try again.");
    }
  };

  const deployRoomContract = async (roomId: string) => {
    if (!provider || !userAddress) {
      throw new Error("Wallet not connected");
    }

    try {
      const signer = provider.getSigner();
      const mainContract = new ethers.ContractFactory(
        contractABI,
        contractBytecode,
        signer
      );

      const contract = await mainContract.deploy(3, {
        gasLimit: 3000000,
      });

      console.log("Waiting for deployment transaction to be mined...");
      await contract.deployed();

      console.log("Room Contract deployed to:", contract.address);
      return contract.address;
    } catch (error) {
      console.error("Contract deployment failed:", error);
      throw error;
    }
  };

  // Validate and create room
  const createRoom = async () => {
    // Reset error state
    setError("");

    // Validate inputs
    if (!bot1 || !bot2 || !topic) {
      setError("Please fill in all fields.");
      return;
    }

    if (bot1 === bot2) {
      setError("Please select different fighters.");
      return;
    }

    if (!userAddress) {
      await connectWallet();
      if (!userAddress) return;
    }

    try {
      setIsLoading(true);
      const roomId = uuidv4().slice(0, 6);
      const roomLink = `/battle-royale/${roomId}`;

      const contractAddress = await deployRoomContract(roomId);

      if (roomLink && contractAddress) {
        router.push(roomLink);
      }

      const details = {
        id: roomId,
        link: roomLink,
        bots: [bot1, bot2],
        topic,
        userAddress,
        contractAddress,
      };

      const response = await fetch("/api/rooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(details),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const savedRoom = await response.json();
      setRooms((prev) => [...prev, savedRoom]);

      // Reset form
      setBot1("");
      setBot2("");
      setTopic("");
    } catch (error) {
      console.error("Error creating room:", error);
      setError("Failed to create room. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Navbar
        user={user}
        setDisplay={setDisplay}
        logout={logout}
        display={display}
      />
      <div className="relative min-h-[calc(100vh-8rem)]">
        <div className="absolute inset-0 z-[1]">
          <Ballpit
            count={300}
            gravity={1}
            friction={0.8}
            wallBounce={5}
            followCursor={false}
            colors={[[230, 200, 255], 221, 100, 255]}
            maxSize={0.8}
            minSize={0.4}
          />
        </div>
        <main className="relative z-[2] pt-24">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-[#2563EB] mb-4">
              Create Your Battle Arena
            </h1>
            <p className="text-gray-600">
              Place your bets on the ultimate showdown
            </p>
          </div>

          <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl p-8 mb-12 max-w-3xl mx-auto border border-[#2563EB]/10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <label
                    htmlFor="bot1"
                    className="block text-gray-700 font-semibold mb-2"
                  >
                    First Contender
                  </label>
                  <select
                    id="bot1"
                    value={bot1}
                    onChange={(e) => setBot1(e.target.value)}
                    className="w-full p-3 rounded-xl border-2 border-[#2563EB]/20 bg-white text-gray-900 focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20 transition-all"
                    disabled={isLoading}
                  >
                    <option value="" disabled>
                      Choose your fighter
                    </option>
                    {FIGHTERS.map((fighter) => (
                      <option key={fighter.value} value={fighter.value}>
                        {fighter.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="bot2"
                    className="block text-gray-700 font-semibold mb-2"
                  >
                    Second Contender
                  </label>
                  <select
                    id="bot2"
                    value={bot2}
                    onChange={(e) => setBot2(e.target.value)}
                    className="w-full p-3 rounded-xl border-2 border-[#2563EB]/20 bg-white text-gray-900 focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20 transition-all"
                    disabled={isLoading}
                  >
                    <option value="" disabled>
                      Choose your fighter
                    </option>
                    {FIGHTERS.map((fighter) => (
                      <option key={fighter.value} value={fighter.value}>
                        {fighter.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-6 space-y-6">
                <div>
                  <label
                    htmlFor="topic"
                    className="block text-gray-700 font-semibold mb-2"
                  >
                    Battle Topic
                  </label>
                  <input
                    id="topic"
                    type="text"
                    placeholder="What's the fight about?"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    className="w-full p-3 rounded-xl border-2 border-[#2563EB]/20 bg-white text-gray-900 focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20 transition-all"
                    disabled={isLoading}
                  />
                </div>

                <button
                  onClick={createRoom}
                  disabled={isLoading}
                  className="w-full py-4 px-6 text-lg font-semibold text-white bg-[#2563EB] hover:bg-[#1d4ed8] rounded-xl transform hover:scale-105 transition-all duration-300 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? "Creating..." : "Start The Battle!"}
                </button>
              </div>
            </div>

            {error && (
              <div className="mt-4 p-4 bg-red-50 border-l-4 border-[#EF4444] rounded-lg">
                <p className="text-[#EF4444]">{error}</p>
              </div>
            )}
          </div>

          <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl p-8 border border-[#2563EB]/10 max-w-7xl mx-auto">
            <h2 className="text-2xl font-bold text-[#2563EB] mb-6">
              Live Battle Arenas
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-[#F8FAFC]">
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                      Arena ID
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                      Battle Link
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                      Fighters
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                      Topic
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {isLoading ? (
                    <tr>
                      <td
                        colSpan={4}
                        className="px-6 py-4 text-center text-gray-500"
                      >
                        Loading...
                      </td>
                    </tr>
                  ) : rooms.length > 0 ? (
                    rooms.map((room) => (
                      <tr
                        key={room.id}
                        className="hover:bg-[#F8FAFC] transition-colors duration-200"
                      >
                        <td className="px-6 py-4 text-sm text-gray-700">
                          {room.id}
                        </td>
                        <td className="px-6 py-4">
                          <Link
                            href={room.link}
                            className="text-[#2563EB] hover:text-[#1d4ed8] font-medium"
                          >
                            {room.link}
                          </Link>
                        </td>
                        <td className="px-6 py-4">{room.bots.join(" 🆚 ")}</td>
                        <td className="px-6 py-4 text-sm text-gray-700">
                          {room.topic}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={4}
                        className="px-6 py-4 text-center text-gray-500"
                      >
                        No rooms found for this wallet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="h-10 w-full opacity-0">gap</div>
        </main>
      </div>
      <Footer />
    </>
  );
}
