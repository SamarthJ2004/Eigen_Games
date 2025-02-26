import express from "express";
import {
  loadCharacters,
  initializeSettings,
  generateModelResponse,
} from "./config.js";
import { CacheManager, DbCacheAdapter } from "@elizaos/core";
import { MemoryCache } from "./memoryCache.js";
import { getBattleEvaluation, evaluateBattle } from "./battleEvaluation.js";
import { constructBattlePrompt, constructInitialMessage } from "./prompt.js";
import { analyzeResponse } from "./analyze.js";
import {
  getDebateData,
  formatDebateResponse,
  getAllDebateIds,
  getDebateHistory,
} from "./debateManager.js";

const app = express();
app.use(express.json());

const memoryCache = new MemoryCache();
const cache = new CacheManager(new DbCacheAdapter(memoryCache, "debate"));

const PORT = process.env.PORT || 3000;
const BATTLE_DURATION = 3 * 60 * 1000; // 3 minutes in milliseconds

// Track battle timers
const battleTimers = new Map();

function startBattleTimer(debateId) {
  const timer = setTimeout(async () => {
    try {
      let evaluation = await evaluateBattle(debateId, memoryCache);

      const debateData = await memoryCache.get(`debate:${debateId}`);
      if (debateData) {
        const debate = JSON.parse(debateData);
        debate.status = "completed";
        debate.evaluation = evaluation;
        await memoryCache.set(`debate:${debateId}`, JSON.stringify(debate));
      }

      battleTimers.delete(debateId);
    } catch (error) {
      console.error(`Error evaluating battle ${debateId}:`, error);
    }
  }, BATTLE_DURATION);

  battleTimers.set(debateId, timer);
}

app.post("/message", async (req, res) => {
  try {
    const { text, userId, context, characters: initialCharacters } = req.body;
    let debateId = context?.debateId;
    let lastCharacter = context?.lastCharacter;
    let characters = context?.characters || initialCharacters;

    if (!debateId) {
      if (!characters || characters.length !== 2) {
        throw new Error("Need exactly two characters to start a roast battle");
      }

      const loadedCharacters = await loadCharacters(
        characters.map((c) => `${c}.character.json`).join(",")
      );

      debateId = Date.now().toString();
      const debateData = {
        characters: loadedCharacters.map((c) => c.name),
        topic: text,
        messages: [],
        startTime: Date.now(),
        status: "active",
      };

      await memoryCache.set(`debate:${debateId}`, JSON.stringify(debateData));
      lastCharacter = loadedCharacters[1].name.toLowerCase();

      startBattleTimer(debateId);

      return res.json(constructInitialMessage(debateId, characters, text));
    }

    const debateData = await memoryCache.get(`debate:${debateId}`);
    if (!debateData) {
      throw new Error("Battle not found");
    }

    const debate = JSON.parse(debateData);
    if (debate.status === "completed") {
      return res.json({
        messages: [
          {
            text: "Battle has ended!",
            type: "text",
          },
        ],
      });
    }

    const nextCharacter =
      lastCharacter === characters[0] ? characters[1] : characters[0];
    const opponent =
      lastCharacter === characters[0] ? characters[0] : characters[1];

    const [characterData, opponentData] = await Promise.all([
      loadCharacters(`${nextCharacter}.character.json`),
      loadCharacters(`${opponent}.character.json`),
    ]);

    const character = characterData[0];
    const opponentChar = opponentData[0];
    const timeRemaining = BATTLE_DURATION - (Date.now() - debate.startTime);

    const prompt = constructBattlePrompt(
      character,
      opponentChar,
      debate.topic,
      debate.messages,
      timeRemaining
    );

    const response = await generateModelResponse(prompt, character);
    let parsedResponse;

    try {
      parsedResponse = JSON.parse(response);
    } catch (parseError) {
      console.log("Error parsing JSON repsonse: ", parseError);
      parsedResponse = response;
    }

    const analysis = analyzeResponse(response, character, opponentChar);

    debate.messages.push({
      character: character.name,
      content: parsedResponse,
      timestamp: Date.now(),
      analysis: analysis,
    });

    await memoryCache.set(`debate:${debateId}`, JSON.stringify(debate));

    res.json({
      messages: [
        {
          text: parsedResponse,
          type: "text",
        },
      ],
      context: {
        debateId: debateId,
        lastCharacter: nextCharacter,
        characters: characters,
        timeRemaining: BATTLE_DURATION - (Date.now() - debate.startTime),
        analysis: analysis,
      },
    });
  } catch (error) {
    console.error("Error processing message:", error);
    res.status(500).json({
      messages: [
        {
          text: "Error: " + error.message,
          type: "text",
        },
      ],
    });
  }
});

app.get("/battles/:debateId/evaluation", async (req, res) => {
  try {
    const { debateId } = req.params;
    const { format } = req.query;

    const debateData = await memoryCache.get(`debate:${debateId}`);
    if (!debateData) {
      return res.status(404).json({ error: "Battle not found" });
    }

    const debate = JSON.parse(debateData);

    if (debate.status !== "completed") {
      return res.status(400).json({
        error: "Battle is still in progress",
        timeRemaining: BATTLE_DURATION - (Date.now() - debate.startTime),
      });
    }

    const evaluationJson = await getBattleEvaluation(debateId, memoryCache);

    // If client requested simple format, return minimal info
    if (format === "simple") {
      return res.json({
        winner: evaluationJson.result.winner,
        margin: evaluationJson.result.margin,
        contestant1: {
          name: evaluationJson.battle.contestants[0],
          score:
            evaluationJson.scorecards[evaluationJson.battle.contestants[0]]
              ?.totalScore || 0,
        },
        contestant2: {
          name: evaluationJson.battle.contestants[1],
          score:
            evaluationJson.scorecards[evaluationJson.battle.contestants[1]]
              ?.totalScore || 0,
        },
      });
    }

    // Otherwise return the full evaluation
    res.json(evaluationJson);
  } catch (error) {
    console.error("Error getting evaluation:", error);
    res.status(500).json({ error: error.message });
  }
});

// Force re-evaluation of a battle (admin endpoint)
app.post("/battles/:debateId/evaluate", async (req, res) => {
  try {
    const { debateId } = req.params;
    const debateData = await memoryCache.get(`debate:${debateId}`);

    if (!debateData) {
      return res.status(404).json({ error: "Battle not found" });
    }

    // Force a re-evaluation
    const evaluationJson = await evaluateBattle(debateId, memoryCache);

    res.json(evaluationJson);
  } catch (error) {
    console.error("Error during forced evaluation:", error);
    res.status(500).json({ error: error.message });
  }
});

app.get("/debates", async (req, res) => {
  try {
    const debateIds = await getAllDebateIds(memoryCache);
    const debates = await Promise.all(
      debateIds.map(async (id) => {
        const debate = await getDebateData(id, memoryCache);
        return formatDebateResponse(debate);
      })
    );
    res.json({ debates });
  } catch (error) {
    console.error("Error getting debates:", error);
    res.status(500).json({ error: error.message });
  }
});

app.get("/debates/:debateId", async (req, res) => {
  try {
    const { debateId } = req.params;

    const debateHistory = await getDebateHistory(debateId, memoryCache);
    res.json(debateHistory);
  } catch (error) {
    console.error("Error getting debate history:", error);
    if (error.message.includes("not found")) {
      res.status(404).json({ error: error.message });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
});

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// Initialize settings before starting server
initializeSettings();

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
