"use client";
import React, { useState, useRef, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { MessageCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { usePrivy } from "@privy-io/react-auth";
import { ethers } from "ethers";
import { APIResponse, Message, Character } from "@/lib/utils/types/start";
import "dotenv/config";
import { IRoom } from "@/lib/db/models/Room";

const API_URL = process.env.NEXT_PUBLIC_AUTONOME_API || "";
const POLLING_INTERVAL = 15000;
const DEBATE_DURATION = 180000;
const TIMER_INTERVAL = 1000;

const Integration = ({ room }: { room: IRoom }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [lastCharacter, setLastCharacter] = useState<Character | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [result, setResult] = useState("");

  const messagePollingRef = useRef<NodeJS.Timeout | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const serverTimeRef = useRef<number | null>(null);

  const debateIdRef = useRef<string | null>(null);
  const debateStatusRef = useRef<string | null>(null);
  const lastCharacterRef = useRef<Character | null>(null);
  const [debateEnded, setDebateEnded] = useState(false);
  const debateTimerRef = useRef<NodeJS.Timeout | null>(null);

  const updateLocalTimer = useCallback(() => {
    setTimeRemaining((prev) => {
      if (prev === null || prev <= 0) {
        if (!debateEnded) {
          setDebateEnded(true);
          if (messagePollingRef.current)
            clearInterval(messagePollingRef.current);
          if (timerRef.current) clearInterval(timerRef.current);
          fetchEvaluation();
        }
        return 0;
      }
      return prev - 1000;
    });
  }, [debateEnded]);

  const fetchEvaluation = async () => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_AUTONOME_API}/battles/${debateIdRef.current}/evaluation`
      );
      const data = await res.json();
      if (data.evaluation) {
        setResult(data.evaluation);
      } else {
        setTimeout(fetchEvaluation, 2000);
      }
    } catch (error) {
      console.error("Error fetching evaluation:", error);
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

      console.log("data.context.lastCharacter", data.context.lastCharacter);
      console.log("lastCharacterRef.current", lastCharacterRef.current);
      if (data.context.lastCharacter !== lastCharacterRef.current) {
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

          const isDuplicate = prev.some(
            (msg) => msg.content === newMessage.content
          );
          if (!isDuplicate) {
            return [...prev, newMessage];
          }

          if (!isDuplicate) {
            lastCharacterRef.current =
              lastCharacterRef.current === "musk" ? "tate" : "musk";
            return [...prev, newMessage];
          }

          return prev;
        });
      }
    },
    [lastCharacterRef]
  );

  const giveBots = (characters: string[]) => {
    if (!characters || !Array.isArray(characters)) {
      console.error("Invalid characters array:", characters);
      return ["bot1", "bot2"];
    }

    return characters.map((name) => {
      const nameParts = name.split(" ");
      const lastName = nameParts[nameParts.length - 1];
      return lastName.toLowerCase();
    });
  };

  const pollDebateStatus = useCallback(async () => {
    if (!debateIdRef.current || debateStatusRef.current !== "active") {
      console.log("deabteId not found");
      return;
    }

    if (!room || !room.bots) {
      console.error("Room data is undefined or missing bots array");
      return;
    }

    try {
      console.log("lastCharacterRef.current ", lastCharacterRef.current);
      console.log("DebateId", debateIdRef.current);

      const bots = giveBots(room.bots);

      const data = (await makeApiRequest(API_URL + "/message", {
        method: "POST",
        body: JSON.stringify({
          text: "",
          userId: "user",
          context: {
            debateId: debateIdRef.current,
            lastCharacter:
              lastCharacterRef.current == bots[0] ? bots[0] : bots[1],
            characters: bots,
          },
        }),
      })) as APIResponse;

      console.log("caling updateDebateState");
      updateDebateState(data);
    } catch (err) {
      console.error(err);
    }
  }, [updateDebateState, room]);

  const initializeDebate = async (): Promise<void> => {
    // Check if room data is defined and has the necessary properties
    if (!room || !room.bots || !Array.isArray(room.bots) || !room.topic) {
      console.error(
        "Cannot initialize debate: Room data is missing or incomplete",
        room
      );
      return;
    }

    try {
      setIsLoading(true);
      const bots = giveBots(room.bots);

      // Additional validation for bots
      if (!bots || bots.length < 2) {
        throw new Error("At least two bots are required for a debate");
      }

      lastCharacterRef.current = bots[0] as Character;

      const data = (await makeApiRequest(API_URL + "/message", {
        method: "POST",
        body: JSON.stringify({
          text: room.topic,
          characters: bots,
          userId: "user",
        }),
      })) as APIResponse;

      if (data?.context?.debateId) {
        debateIdRef.current = data.context.debateId;
        startPollingAndTimer();
        debateStatusRef.current = "active";
      } else {
        throw new Error("No debate ID received from the server");
      }
    } catch (err) {
      console.error("Debate initialization error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const startPollingAndTimer = useCallback(() => {
    if (!room || !room.bots || room.bots.length < 2) {
      console.error("Cannot start polling: Room data is missing or incomplete");
      return;
    }

    [
      messagePollingRef.current,
      timerRef.current,
      debateTimerRef.current,
    ].forEach((timer) => {
      if (timer) {
        clearInterval(timer);
        clearTimeout(timer);
      }
    });

    setDebateEnded(false);
    setResult("");
    setTimeRemaining(DEBATE_DURATION);

    messagePollingRef.current = setInterval(async () => {
      if (!debateEnded) {
        await pollDebateStatus();
      }
    }, POLLING_INTERVAL);

    timerRef.current = setInterval(updateLocalTimer, TIMER_INTERVAL);

    debateTimerRef.current = setTimeout(() => {
      setDebateEnded(true);

      if (messagePollingRef.current) clearInterval(messagePollingRef.current);
      if (timerRef.current) clearInterval(timerRef.current);

      fetchEvaluation();
    }, DEBATE_DURATION);
  }, [pollDebateStatus, updateLocalTimer, debateEnded, room]);

  useEffect(() => {
    console.log("room: ", room);
    if (room) {
      console.log("Initializing debate with room data:", {
        topic: room.topic,
        bots: room.bots,
      });
      initializeDebate();
    } else {
      console.log("Waiting for complete room data before initializing debate");
    }

    return () => {
      if (messagePollingRef.current) clearInterval(messagePollingRef.current);
      if (timerRef.current) clearInterval(timerRef.current);
      if (debateTimerRef.current) clearTimeout(debateTimerRef.current);
    };
  }, [room]);

  const getCharacterDisplayName = (character: Character): string => {
    switch (character) {
      case "musk":
        return "Elon Musk";
      case "tate":
        return "Andrew Tate";
      case "trump":
        return "Donald Trump";
      case "modi":
        return "Narendra Modi";
      default:
        return "Bot";
    }
  };

  const formatTimeRemaining = (ms: number): string => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  return (
    <Card className="w-full max-w-5xl mx-auto">
      <CardContent className="p-6">
        <div className="mb-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold">{room?.topic}</h2>
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
              {result && (
                <div className="mt-2">Result: {JSON.stringify(result)}</div>
              )}
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-4 mb-4 max-h-[30rem] overflow-y-auto">
          {messages.map((message, index) => (
            <div
              key={`message-${message.id}-${index}`}
              className={`flex items-start gap-2 ${
                getCharacterDisplayName(message.character) === room.bots[0]
                  ? "flex-row"
                  : "flex-row-reverse"
              }`}
            >
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <MessageCircle className="w-4 h-4" />
                </div>
              </div>
              <div
                className={`max-w-[80%] rounded-lg p-3 ${
                  message.character === room.bots[0]
                    ? "bg-blue-100"
                    : "bg-gray-100"
                }`}
              >
                <div className="font-semibold mb-1">
                  {getCharacterDisplayName(message.character)}
                </div>
                <div>{message.content.roast || message.content}</div>
                <div>{JSON.stringify(result)}</div>
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
