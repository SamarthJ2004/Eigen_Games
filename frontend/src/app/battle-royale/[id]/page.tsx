"use client";
import { useEffect, useState } from "react";
import { Heart, DollarSign } from "lucide-react";
import TextPressure from "@/components/hard-ui/textPressure";
import LiveChat from "@/components/battle-royale/liveChat";
import { useParams } from "next/navigation";
import { IRoom } from "@/lib/db/models/Room";
//import { getRoomById } from '@/db/mongodb';
import { ethers } from "ethers";
import Integration from "@/components/battle-royale/start";
import { contractABI, contractAddress } from "@/lib/utils/constants/room";
import { usePrivy } from "@privy-io/react-auth";
import Navbar from "@/components/common-components/navbar";

export default function BattleRoyale() {
  const { login, logout, user, ready } = usePrivy();
  const [display, setDisplay] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedBot, setSelectedBot] = useState<string | number>("");
  const [txHash, setTxHash] = useState("");
  const [contractAddress, setContractAddress] = useState<string | null>(null);
  const [room, setRoom] = useState<IRoom>();
  const [amount , setAmount] = useState("");
  const [provider, setProvider] =
  useState<ethers.providers.Web3Provider | null>(null);
  const [userAddress, setUserAddress] = useState<string | null>(null);

  const params = useParams();
  const roomId = params.id;

  useEffect(() => {
		if (typeof roomId === 'string') {
			console.log("inside useEE  ",roomId);
			fetchData(roomId);
		} else {
			console.error('Invalid roomId:', roomId);
		}

    connectWallet();
	  }, [roomId]);

	  const fetchData = async(roomId: string) => {
        setIsLoading(true);
        try {
          const response = await fetch(`/api/rooms/id/${roomId}`,{
          method: "GET",
          headers: {
            'Content-Type': 'application/json'  
          }
          });
          
          if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Room not found');
          }
          throw new Error(`HTTP error! status: ${response.status}`);
          }
          
          const room = await response.json();
          console.log("Fetched room data:", room); // Debug log
          setContractAddress(room.contractAddress)
          setRoom(room);
        } catch (error) {
          console.error("Error fetching room:", error);
          setError(error instanceof Error ? error.message : "Failed to load room");
          setRoom(undefined);
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

    async function sendTransaction(botNumber: number) {
       if (!provider || !userAddress) {
             throw new Error("Wallet not connected");
           }
       
           try {
             const signer = provider.getSigner();
             
            console.log("contract addresss  ",contractAddress )
             if(contractAddress){

                const contract =  new ethers.Contract(contractAddress, contractABI, signer);
              
                try {
              
                  const tx = await contract.placeBet(botNumber, {
                      value: ethers.utils.parseEther(amount) // Convert ETH to wei
                  });
                 
                  await tx.wait(); // Wait for the transaction to be confirmed
                  console.log("Transaction Hash:", tx.hash);
              } catch (error) {
                  console.error("Transaction failed:", error);
              }
                console.log("Waiting for trnx to be sent...");
                
                return contract.address;}
           } catch (error) {
             console.error("Contract deployment failed:", error);
             throw error;
           }
    }

  const getBetButtonText = (botNumber: number) => {
    return `Bet on Bot ${botNumber}`;
  };

  return (
    <div>
      <Navbar
        user={user}
        setDisplay={setDisplay}
        logout={logout}
        display={display}
      />
      <div className="bg-white-100 flex mt-20 text-black mx-auto">
        <div className="w-55">
          <div className="mt-4">
            <div style={{ position: "relative", height: "120px" }}>
              <TextPressure
                text="Battle_Royale!"
                flex={false}
                alpha={false}
                stroke={false}
                width={true}
                weight={false}
                italic={true}
                scale={false}
                textColor="#"
                strokeColor="#ff0000"
                minFontSize={36}
              />
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-4 p-4">
            <div className="flex-1">
              <Integration />

              <div className="max-w-5xl p-4">
                <div className="flex items-start gap-4 p-4 rounded-lg bg-gray-50">
                  <div className="flex-shrink-0">
                    <div className="w-16 h-16 rounded-full bg-blue-100 overflow-hidden flex items-center justify-center" />
                  </div>

                  <div className="flex-grow">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold">
                          Content Creator 1
                        </h3>
                        <p className="text-sm text-gray-500">100k followers</p>
                      </div>

                      <div className="flex gap-3">
                        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors">
                          <Heart className="w-4 h-4" /> Follow
                        </button>

                        {error && <p className="text-red-500">{error}</p>}
                        <div className="flex flex-col sm:flex-row gap-2 w-1/2 max-w-sm">
                          <input
                            type="text"
                            value={amount}
                            onChange={(e) => {
                              const value = e.target.value.replace(/[^0-9.]/g, "");
                              setAmount(value);
                            }}
                            placeholder="Enter ETH amount"
                            className="flex-1 px-4 py-2 border rounded-xl outline-none dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                          />
                          </div>
                        <button
                          onClick={() => sendTransaction(1)}
                          className={`flex items-center gap-2 px-4 py-2 rounded-full transition-colors
                            ${
                              selectedBot === 1
                                ? "bg-green-600 hover:bg-green-700"
                                : "bg-red-600 hover:bg-red-700"
                            }
                            text-white 
                           `}
                        >
                          <DollarSign className="w-4 h-4" />
                          {getBetButtonText(1)}
                        </button>

                        <button
                          onClick={() => sendTransaction(2)}
                          className={`flex items-center gap-2 px-4 py-2 rounded-full transition-colors
                            ${
                              selectedBot === 2
                                ? "bg-green-600 hover:bg-green-700"
                                : "bg-red-600 hover:bg-red-700"
                            }
                            text-white 
                           `}
                        >
                          <DollarSign className="w-4 h-4" />
                          {getBetButtonText(2)}
                        </button>

                        {/* Add error display */}
                        {error && (
                          <div className="mt-2 text-red-500">{error}</div>
                        )}

                        {/* Add transaction hash display */}
                        {txHash && (
                          <div className="mt-2 text-green-500">
                            Transaction submitted: {txHash}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="h-[400px] m-4 p-2">
                  <strong>About:</strong> Lorem ipsum dolor sit, amet
                  consectetur adipisicing elit. Tempore perferendis omnis
                  expedita, labore debitis fugit dignissimos laborum esse quam
                  corporis porro, ipsa adipisci, alias totam dolorem saepe
                  itaque sapiente unde.
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="w-1/4">
          <LiveChat />
        </div>
      </div>
    </div>
    
  );
}
