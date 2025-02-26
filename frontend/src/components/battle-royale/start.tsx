"use client";
import React, { useState, useRef, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { MessageCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { usePrivy } from "@privy-io/react-auth";
import { ethers } from "ethers";
import {
  APIContext,
  APIMessage,
  APIResponse,
  Message,
  Character,
} from "@/lib/utils/types/start";
import {contractABI} from "@/lib/utils/constants/room";
import "dotenv/config";

const API_URL = process.env.NEXT_PUBLIC_AUTONOME_API;
const POLLING_INTERVAL = 15000;
const DEBATE_DURATION = 180000;
const TIMER_INTERVAL = 1000;

const Integration: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [lastCharacter, setLastCharacter] = useState<Character | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [debateStatus, setDebateStatus] = useState<
    "active" | "completed" | null
  >(null);
  const [result, setResult] = useState("");

  const messagePollingRef = useRef<NodeJS.Timeout | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const serverTimeRef = useRef<number | null>(null);

  const debateIdRef = useRef<string | null>(null);
  const debateStatusRef = useRef<string | null>(null);
  const lastCharacterRef = useRef<Character | null>(null);
  const [debateEnded, setDebateEnded] = useState(false);
  const debateTimerRef = useRef<NodeJS.Timeout | null>(null);
  const { login, logout, user, ready } = usePrivy();
  const [userAddress, setUserAddress] = useState<string | null>(null);
  const [provider, setProvider] =
      useState<ethers.providers.Web3Provider | null>(null);

  const updateLocalTimer = useCallback(() => {
    setTimeRemaining((prev) => {
      if (prev === null || prev <= 0) {
        if (!debateEnded) {
          setDebateEnded(true);
          // Clear all intervals when timer reaches 0
          if (messagePollingRef.current)
            clearInterval(messagePollingRef.current);
          if (timerRef.current) clearInterval(timerRef.current);
          // Fetch the result with retry logic
          fetchEvaluation();
        }
        return 0;
      }
      return prev - 1000;
    });
  }, [debateEnded]);
  

  const fetchEvaluation = async () => {
    try {
      // Add a small delay to ensure the debate has been processed
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_AUTONOME_API}/battles/${debateIdRef.current}/evaluation`
      );
      const data = await res.json();
      if (data.evaluation) {
        setResult(data.evaluation);
      } else {
        // If no evaluation yet, retry after a short delay
        setTimeout(fetchEvaluation, 2000);
      }
    } catch (error) {
      console.error("Error fetching evaluation:", error);
      // Retry on error
      setTimeout(fetchEvaluation, 2000);
    }
  };

  const makeApiRequest = async (url: string, options: RequestInit) => {
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          "Content-Type": "application/json",
          ...options.headers,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (err) {
      if (err instanceof TypeError && err.message === "Failed to fetch") {
        throw new Error("Network error: Unable to connect to the server");
      }
      throw err;
    }
  };

  const updateDebateState = useCallback(
    (data: APIResponse) => {
      serverTimeRef.current = data.context.timeRemaining;

      setTimeRemaining(data.context.timeRemaining);
      setDebateStatus(data.context.status);

      // Only update lastCharacter if it's different from current
      console.log("data.context.lastCharacter", data.context.lastCharacter);
      console.log("lastCharacterRef.current", lastCharacterRef.current);
      if (data.context.lastCharacter !== lastCharacterRef.current) {
        // setLastCharacter(data.context.lastCharacter);
        lastCharacterRef.current = data.context.lastCharacter;
        console.log("data.context.lastCharacter", data.context.lastCharacter);
      }

      if (data.messages && data.messages.length > 0) {
        setMessages((prev) => {
          const newMessage = {
            id: prev.length + 1,
            character: data.context.lastCharacter || "musk",
            content: data.messages[0].text,
            timestamp: new Date().toISOString(),
          };

          // Check if this message is already in the list to avoid duplicates
          const isDuplicate = prev.some(
            (msg) => msg.content === newMessage.content
          );
          if (!isDuplicate) {
            return [...prev, newMessage];
          }

          if (!isDuplicate) {
            // After adding a message, alternate the lastCharacter for next request
            lastCharacterRef.current =
              lastCharacterRef.current === "musk" ? "tate" : "musk";
            return [...prev, newMessage];
          }

          return prev;
        });
      }
    },
    [lastCharacter, lastCharacterRef]
  );

  const pollDebateStatus = useCallback(async () => {
    if (!debateIdRef.current || debateStatusRef.current !== "active") {
      console.log("deabteId not found");
      return;
    }

    try {
      //   const nextCharacter = lastCharacterRef.current === "musk" ? "tate" : "musk";
      //   lastCharacterRef.current = nextCharacter;

      console.log("inside pollDebateStatus ");
      console.log("lastCharacterRef.current ", lastCharacterRef.current);
      console.log("DebateId", debateIdRef.current);
      const data = (await makeApiRequest(API_URL, {
        method: "POST",
        body: JSON.stringify({
          text: "",
          userId: "user",
          context: {
            debateId: debateIdRef.current,
            lastCharacter: lastCharacterRef.current || "musk",
            characters: ["musk", "tate"],
          },
        }),
      })) as APIResponse;

      console.log("caling updateDebateState");
      updateDebateState(data);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to generate response";
      setError(errorMessage);
      console.error(err);
    }
  }, [updateDebateState]);

  const initializeDebate = async (): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      lastCharacterRef.current = "musk";
      const data = (await makeApiRequest(API_URL, {
        method: "POST",
        body: JSON.stringify({
          text: "Tesla vs Whey Protein",
          characters: ["musk", "tate"],
          userId: "user",
        }),
      })) as APIResponse;

      if (data.context.debateId) {
        debateIdRef.current = data.context.debateId;
        // setDebateId(data.context.debateId);
        // console.log(debateIdRef, " hihaa ", data.context.debateId);
        // updateDebateState(data);
        startPollingAndTimer();
        debateStatusRef.current = "active";
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to initialize debate";
      setError(errorMessage);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const startPollingAndTimer = useCallback(() => {
    // Clear existing intervals if any
    if (messagePollingRef.current) clearInterval(messagePollingRef.current);
    if (timerRef.current) clearInterval(timerRef.current);
    if (debateTimerRef.current) clearTimeout(debateTimerRef.current);

    setDebateEnded(false); // Reset debate ended state
    setResult(""); // Reset result
    setTimeRemaining(DEBATE_DURATION);

    // Start message polling
    messagePollingRef.current = setInterval(async () => {
      if (!debateEnded) {
        await pollDebateStatus();
      }
    }, POLLING_INTERVAL);

    // Start local timer
    timerRef.current = setInterval(() => {
      updateLocalTimer();
    }, TIMER_INTERVAL);

    // Set timeout to end debate after DEBATE_DURATION
    debateTimerRef.current = setTimeout(() => {
      setDebateEnded(true);
      if (messagePollingRef.current) clearInterval(messagePollingRef.current);
      if (timerRef.current) clearInterval(timerRef.current);
      fetchEvaluation();
    }, DEBATE_DURATION);
  }, [pollDebateStatus, updateLocalTimer, debateEnded]);

  useEffect(() => {
    initializeDebate();

    return () => {
      if (messagePollingRef.current) clearInterval(messagePollingRef.current);
      if (timerRef.current) clearInterval(timerRef.current);
      if (debateTimerRef.current) clearTimeout(debateTimerRef.current);
    };
  }, []);

  const getCharacterDisplayName = (character: Character): string => {
    return character === "musk" ? "Elon Musk" : "Andrew Tate";
  };

  const formatTimeRemaining = (ms: number): string => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardContent className="p-6">
        <div className="mb-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold">Tesla vs Whey Protein Debate</h2>
          <div className="flex items-center gap-4">
            {timeRemaining !== null && (
              <span className="text-sm font-medium">
                Time Remaining: {formatTimeRemaining(timeRemaining)}
              </span>
            )}
          </div>
        </div>

        {debateEnded && (
          <Alert className="mb-4">
            <AlertDescription>
              Debate has ended!{" "}
              {result && <div className="mt-2">Result: {result}</div>}
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-4 mb-4 max-h-96 overflow-y-auto">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex items-start gap-2 ${
                message.character === "musk" ? "flex-row" : "flex-row-reverse"
              }`}
            >
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <MessageCircle className="w-4 h-4" />
                </div>
              </div>
              <div
                className={`max-w-[80%] rounded-lg p-3 ${
                  message.character === "musk" ? "bg-blue-100" : "bg-gray-100"
                }`}
              >
                <div className="font-semibold mb-1">
                  {getCharacterDisplayName(message.character)}
                </div>
                <div>{message.content}</div>
                <div>{result}</div>
              </div>
            </div>
          ))}
        </div>

        {isLoading && (
          <div className="text-center text-gray-500">
            Initializing debate...
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default Integration;
