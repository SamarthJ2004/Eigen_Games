import { loadCharacters, generateModelResponse } from "./config.js";

function constructJsonEvaluationPrompt(battleData, elizaCharacter) {
  const rounds = battleData.messages;
  const contestants = [...new Set(rounds.map((r) => r.character))];
  const [contestant1, contestant2] = contestants;

  return `
You are ${
    elizaCharacter.name
  }, the Technical Roast Battle Analyst. Evaluate this battle and return your evaluation in JSON format.

BATTLE INFORMATION:
Topic: ${battleData.topic}
Contestants: ${contestants.join(" vs ")}
Rounds: ${rounds.length}

BATTLE TRANSCRIPT:
${rounds
  .map(
    (msg, index) =>
      `Round ${Math.floor(index / 2) + 1}: ${msg.character}: ${msg.content}`
  )
  .join("\n\n")}

Evaluate this battle using your technical analysis skills, but ONLY return your evaluation as a valid JSON object with this exact structure:

{
  "battle": {
    "contestants": ["${contestant1}", "${contestant2}"],
    "technicalAnalysis": "Brief overall battle assessment"
  },
  "scorecards": {
    "${contestant1}": {
      "characterAuthenticity": [score 1-10],
      "roastQuality": [score 1-10],
      "battleFlow": [score 1-10],
      "totalScore": [sum of scores]
    },
    "${contestant2}": {
      "characterAuthenticity": [score 1-10],
      "roastQuality": [score 1-10],
      "battleFlow": [score 1-10],
      "totalScore": [sum of scores]
    }
  },
  "highlights": {
    "bestBurns": [
      {
        "character": "${contestant1}",
        "burn": "Quote their best roast"
      },
      {
        "character": "${contestant2}",
        "burn": "Quote their best roast"
      }
    ],
    "bestCallback": "Quote the best callback or 'None' if none exists"
  },
  "result": {
    "winner": "Name of winner",
    "margin": "Point difference",
    "winningFactor": "Brief explanation of deciding factor"
  },
  "finalRemarks": {
    "${contestant1}": "One sentence specific feedback",
    "${contestant2}": "One sentence specific feedback"
  }
}

Important: Return ONLY the JSON object, with no additional text, explanations, or code blocks around it. The response must be valid JSON that can be parsed directly. So, make sure to fill all fields.
Remember:
1. Use numerical scores (1-10)
2. Calculate totals accurately
3. MUST declare explicit winner based on highest total score
4. Keep justifications concise
5. Stay in Eliza's technical analyst persona`;
}

async function evaluateBattle(debateId, memoryCache) {
  try {
    const debateData = await memoryCache.get(`debate:${debateId}`);
    if (!debateData) {
      throw new Error("Battle not found");
    }

    const battle = JSON.parse(debateData);

    // If battle is already evaluated, return the stored evaluation
    if (battle.status === "completed" && battle.evaluationJson) {
      return battle.evaluationJson;
    }

    const elizaCharacter = await loadCharacters("eliza.character.json");

    const evaluationPrompt = constructJsonEvaluationPrompt(
      battle,
      elizaCharacter[0]
    );
    const jsonResponse = await generateModelResponse(
      evaluationPrompt,
      elizaCharacter[0]
    );

    let evaluationJson;
    try {
      evaluationJson = JSON.parse(jsonResponse);
      console.log("Successfully parsed evaluation JSON");
    } catch (parseError) {
      console.error("Error parsing JSON response:", parseError);
      evaluationJson = {
        error: "Failed to parse evaluation JSON",
        rawResponse: jsonResponse,
      };
    }

    battle.evaluationJson = evaluationJson;
    battle.status = "completed";

    if (evaluationJson.result && evaluationJson.result.winner) {
      battle.winner = evaluationJson.result.winner;
    }

    await memoryCache.set(`debate:${debateId}`, JSON.stringify(battle));

    return evaluationJson;
  } catch (error) {
    console.error("Error evaluating battle:", error);
    return {
      error: "Evaluation failed",
      errorDetails: error.message,
    };
  }
}

async function getBattleEvaluation(debateId, memoryCache) {
  try {
    const debateData = await memoryCache.get(`debate:${debateId}`);
    if (!debateData) {
      throw new Error("Battle not found");
    }

    const battle = JSON.parse(debateData);

    if (battle.status !== "completed") {
      throw new Error("Battle has not been evaluated yet");
    }

    if (battle.evaluationJson) {
      return battle.evaluationJson;
    }

    throw new Error("No evaluation found for this battle");
  } catch (error) {
    console.error("Error getting battle evaluation:", error);
    return {
      error: "Failed to get evaluation",
      errorDetails: error.message,
    };
  }
}

export { evaluateBattle, getBattleEvaluation };
