"use client";
import { useEffect, useState, useRef } from "react";
import { Heart, DollarSign, Wallet, Info, ChevronDown, MessageCircle } from "lucide-react";
import TextPressure from "@/components/hard-ui/textPressure";
import GlitchText from "../../../components/ui/glitchText"
import FuzzyText from "../../../components/ui/fuzzy"
import LiveChat from "@/components/battle-royale/liveChat";
import { useParams } from "next/navigation";
import { IRoom } from "@/lib/db/models/Room";
import { ethers } from "ethers";
import Integration from "@/components/battle-royale/start";
import { contractABI } from "@/lib/utils/constants/room";
import { usePrivy } from "@privy-io/react-auth";
import Navbar from "@/components/common-components/navbar";
import toast from "react-hot-toast";

export default function BattleRoyale() {
  const { login, logout, user, ready } = usePrivy();
  const [display, setDisplay] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedBot, setSelectedBot] = useState<string | number>("");
  const [txHash, setTxHash] = useState("");
  const [contractAddress, setContractAddress] = useState<string | null>(null);
  const [room, setRoom] = useState<IRoom>();
  const [amount, setAmount] = useState("");
  const [provider, setProvider] = useState<ethers.providers.Web3Provider | null>(null);
  const [userAddress, setUserAddress] = useState<string | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [isChatVisible, setIsChatVisible] = useState(true);
  const [isChatExpanded, setIsChatExpanded] = useState(false);
  const [duration, setDuration] = useState<string | undefined>(undefined);
  const [bot1, setBot1] =useState<string | undefined>(undefined)
  const [bot2, setBot2] = useState<string | undefined>(undefined)

  const params = useParams();
  const roomId = params.id;

  useEffect(() => {
    if (typeof roomId === 'string') {
      console.log("Room Id: ", roomId);
      fetchData(roomId);
    } else {
      console.error('Invalid roomId:', roomId);
    }

    connectWallet();
  }, [roomId]);

  const fetchData = async (roomId: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/rooms/id/${roomId}`, {
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
      console.log("Fetched room data:", room);
      setContractAddress(room.contractAddress);
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
      toast.success("Wallet connected successfully!");
    } catch (error) {
      console.error("Error connecting to MetaMask:", error);
      setError("Failed to connect wallet. Please try again.");
      toast.error("Failed to connect wallet");
    }
  };

  async function sendTransaction(botNumber: number) {
    if (!provider || !userAddress) {
      toast.error("Wallet not connected");
      throw new Error("Wallet not connected");
    }

    if (!amount || parseFloat(amount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    setSelectedBot(botNumber);
    
    try {
      setIsLoading(true);
      const signer = provider.getSigner();

      if (contractAddress) {
        const contract = new ethers.Contract(contractAddress, contractABI, signer);

        try {
          toast.loading("Placing bet...");
          const tx = await contract.placeBet(botNumber, {
            value: ethers.utils.parseEther(amount) // Convert ETH to wei
          });

          setTxHash(tx.hash);
          toast.loading("Transaction pending...");
          
          await tx.wait(); // Wait for the transaction to be confirmed
          console.log("Transaction Hash:", tx.hash);
          toast.success(`Bet placed on Bot ${botNumber}!`);
          setAmount("");

          const txx = await contract.currentFight()

          const time = new Date(txx[2] * 1000).toLocaleString();
          setDuration(time);
          setBot1(ethers.utils.formatEther(txx[7]));
          setBot2(ethers.utils.formatEther(txx[8]));

          console.log("currentFight ", txx)
        } catch (error) {
          console.error("Transaction failed:", error);
          toast.error("Transaction failed. Please try again.");
        }
        return contract.address;
      }
    } catch (error) {
      console.error("Transaction initiation failed:", error);
      toast.error("Failed to initiate transaction");
      throw error;
    } finally {
      setIsLoading(false);
    }
  }

  async function getDuration(){
    if (!provider || !userAddress) {
      toast.error("Wallet not connected");
      throw new Error("Wallet not connected");
    }

    try {
      const signer = provider.getSigner();
      if(contractAddress){
        const contract = new ethers.Contract(contractAddress, contractABI, signer)
        const tx = await contract.currentFight()
        setDuration(tx[2]);
        setBot1(tx[7]);
        setBot2(tx[8]);
        try {
          
        } catch (error) {
          console.error("Contract address not found", error)
        }
      }
      
    } catch (error) {
      console.error("Error in getDuration ", error)
    }
  }

  const toggleChatExpansion = () => {
    setIsChatExpanded(!isChatExpanded);
  };

  const toggleChatVisibility = () => {
    setIsChatVisible(!isChatVisible);
  };

  return (
    <div className="min-h-screen min-w-2.5 relative overflow-hidden">
      {/* Funky Background */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        {/* Gradient base */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900 opacity-90"></div>
        
        {/* Animated circles */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-yellow-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-6000"></div>
        
        {/* Grid overlay */}
        <div className="absolute inset-0 bg-grid-white/10 bg-grid-16 z-10 opacity-20"></div>
        
        {/* Cyber pattern */}
        <div className="absolute inset-0 z-20">
          <div className="absolute top-1/4 left-1/4 h-32 w-32 border-4 border-blue-400 opacity-20 rotate-45"></div>
          <div className="absolute top-1/2 right-1/3 h-48 w-48 border-4 border-pink-400 opacity-20 rotate-12"></div>
          <div className="absolute bottom-1/3 left-1/2 h-24 w-24 border-4 border-yellow-400 opacity-20 -rotate-12"></div>
          <div className="absolute bottom-1/4 right-1/4 h-40 w-40 border-4 border-purple-400 opacity-20 rotate-45"></div>
        </div>
      </div>

      <Navbar
        user={user}
        setDisplay={setDisplay}
        logout={logout}
        display={display}
      />

      <div className="container px-4 mx-auto relative z-10">
        {/* Mobile chat toggle button */}
        <button 
          onClick={toggleChatVisibility}
          className="fixed bottom-20 right-6 z-20 md:hidden bg-purple-700 text-white p-3 rounded-full shadow-lg"
        >
          <MessageCircle size={24} />
        </button>

        <div className="flex flex-col md:flex-row gap-6 mt-24 mb-12 relative">
          {/* Main content area */}
          <div 
            className={`transition-all duration-300 ease-in-out flex-1 ${
              isChatExpanded ? 'md:w-3/5 md:pr-4' : 'md:w-3/4'
            } ${
              isChatVisible && isChatExpanded ? 'md:order-1' : ''
            }`}
            style={{
              width: isChatVisible 
                ? (isChatExpanded ? 'calc(100% - 35%)' : 'calc(100% - 25%)') 
                : '100%'
            }}
          >
            {/* Header with animated text */}
            <div className="mb-8">
              <div  className="mx-auto h-40 "> {/* style={{ position: "relative", height: "150px" } } */}
                <FuzzyText 
                  baseIntensity={0.15} 
                  hoverIntensity= {0.69}
                  enableHover={true}
                >
                  Battle Royale!
                </FuzzyText>
              </div>
            </div>

            {/* Error display */}
            {error && (
              <div className="mb-6 p-4 bg-red-900/70 backdrop-blur-sm border border-red-500 rounded-lg text-red-100">
                <p className="flex items-center gap-2"><Info size={18} /> {error}</p>
              </div>
            )}

            {/* Transaction status */}
            {txHash && (
              <div className="mb-6 p-4 bg-green-900/70 backdrop-blur-sm border border-green-500 rounded-lg text-green-100">
                <p className="flex items-center gap-2">
                  <Info size={18} /> Transaction submitted: 
                  <a 
                    href={`https://etherscan.io/tx/${txHash}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="underline hover:text-green-300 ml-1"
                  >
                    {txHash.slice(0, 10)}...{txHash.slice(-8)}
                  </a>
                </p>
              </div>
            )}

            {/* Battle area */}
            <div className="bg-gray-900/70 backdrop-blur-md shadow-lg rounded-xl overflow-hidden mb-8 border border-purple-500/30">
              <div className="border-b border-purple-500/30 p-6">
                <h2 className="text-2xl font-bold text-white">Battle Arena</h2>
                <p className="text-purple-200 mt-1">Watch bots compete and place your bets!</p>
              </div>
              
              <div className="p-6">
                <Integration />
              </div>
            </div>

            {/* Creator profiles and betting section */}
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              {[1, 2].map((botNumber) => (
                <div key={botNumber} className="bg-gray-900/70 backdrop-blur-md shadow-lg rounded-xl overflow-hidden border border-blue-500/30">
                  <div className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 overflow-hidden flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-blue-500/20">
                          {`B${botNumber}`}
                        </div>
                      </div>

                      <div className="flex-grow">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div>
                            <h3 className="text-lg font-semibold text-white">Bot {botNumber}</h3>
                            <p className="text-sm text-blue-300">Win rate: 68%</p>
                          </div>

                          <button 
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors self-start shadow-lg shadow-blue-600/20"
                          >
                            <Heart className="w-4 h-4" /> Follow
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6">
                      <button 
                        onClick={() => setShowDetails(!showDetails)}
                        className="flex items-center gap-1 text-sm text-blue-400 hover:text-blue-300 transition-colors"
                      >
                        {showDetails ? "Hide" : "Show"} details
                        <ChevronDown 
                          className={`w-4 h-4 transition-transform duration-200 ${showDetails ? 'rotate-180' : ''}`} 
                        />
                      </button>
                      
                      {showDetails && (
                        <div className="mt-4 text-sm text-blue-200 bg-blue-900/50 p-4 rounded-lg border border-blue-500/20">
                          <p>
                            Bot {botNumber} specializes in strategic gameplay with a focus on resource management.
                            It has won 68 out of 100 matches and is currently on a 5-game winning streak.
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="mt-6 border-t border-blue-500/30 pt-6">
                      <div className="flex flex-col gap-4">
                        <div className="flex flex-col gap-2">
                          <label htmlFor={`amount-${botNumber}`} className="text-sm font-medium text-blue-200">
                            Bet Amount (ETH)
                          </label>
                          <input
                            id={`amount-${botNumber}`}
                            type="text"
                            value={amount}
                            onChange={(e) => {
                              const value = e.target.value.replace(/[^0-9.]/g, "");
                              setAmount(value);
                            }}
                            placeholder="0.05"
                            className="px-4 py-2 border border-blue-500/30 bg-blue-900/30 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-white"
                          />
                        </div>
                        
                        <button
                          onClick={() => sendTransaction(botNumber)}
                          disabled={isLoading}
                          className={`flex items-center justify-center gap-2 px-6 py-3 rounded-lg transition-colors
                            ${selectedBot === botNumber ? "bg-green-600 hover:bg-green-700" : "bg-blue-600 hover:bg-blue-700"}
                            text-white disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-600/20
                          `}
                        >
                          {isLoading && selectedBot === botNumber ? (
                            <>Processing...</>
                          ) : (
                            <>
                              <DollarSign className="w-5 h-5" />
                              Bet on Bot {botNumber}
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* About section */}
            <div className="bg-gray-900/70 backdrop-blur-md shadow-lg rounded-xl overflow-hidden mb-8 border border-pink-500/30">
              <div className="border-b border-pink-500/30 p-6">
                <h2 className="text-2xl font-bold text-white">About This Battle</h2>
              </div>
              
              <div className="p-6">
                <p className="text-pink-200 leading-relaxed">
                  This is an AI-powered battle royale where two sophisticated bots compete against each other.
                  Players can place bets on which bot they think will win, with all transactions secured on the blockchain.
                  The battle system uses advanced algorithms to ensure fair and exciting competitions.
                </p>
                
                <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-blue-900/50 rounded-lg border border-blue-500/30">
                    <h3 className="font-semibold text-blue-300 mb-2">Duration</h3>
                    <p className="text-2xl font-bold text-white">{ duration || "0.00"}</p>
                  </div>
                  
                  <div className="p-4 bg-green-900/50 rounded-lg border border-green-500/30">
                    <h3 className="font-semibold text-green-300 mb-2">Bot 1</h3>
                    <p className="text-2xl font-bold text-white">{bot1 || 0.0}</p>
                  </div>
                  
                  <div className="p-4 bg-purple-900/50 rounded-lg border border-purple-500/30">
                    <h3 className="font-semibold text-purple-300 mb-2">Bot2</h3>
                    <p className="text-2xl font-bold text-white">{bot2 || 0.0}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Chat sidebar */}
          {isChatVisible && (
            <LiveChat />
          )}
        </div>
      </div>
      
      {/* Wallet connection status */}
      <div className="fixed bottom-6 right-6 z-50">
        <div className={`flex items-center gap-2 px-4 py-2 rounded-full shadow-lg backdrop-blur-md border ${userAddress ? 'bg-green-900/70 text-white border-green-500/50' : 'bg-gray-900/70 text-white border-purple-500/50'}`}>
          <Wallet size={18} />
          {userAddress ? (
            <span>Connected: {userAddress.slice(0, 6)}...{userAddress.slice(-4)}</span>
          ) : (
            <button onClick={connectWallet}>Connect Wallet</button>
          )}
        </div>
      </div>
    </div>
  );
}

