export function constructBattlePrompt(
  character,
  opponent,
  topic,
  context,
  timeRemaining
) {
  // Get battle persona and style elements
  const battlePersona = character.battlePersona || "Battle Challenger";
  const battleStyle = character.battleStyle || {};
  const signatureMoves = battleStyle.signature_elements || {};
  const timeLeft = Math.floor(timeRemaining / 1000);

  // Get response patterns
  const responsePatterns = character.responsePatterns || {};
  const standardResponses = responsePatterns.standard_topics || [];
  const comebacks = responsePatterns.signature_comebacks || {};
  const isEndGame = timeLeft <= 30;

  // Get core identity
  const identity =
    character.core_identity?.bio?.join("\n") || character.bio?.join("\n");

  // Format previous exchanges
  const previousExchanges = context
    .map((msg, index) => {
      const roundNum = Math.floor(index / 2) + 1;
      return `Round ${roundNum}: ${msg.character}: ${msg.content}`;
    })
    .join("\n\n");

  return `
# Character Roast Battle System
You are ${character.name} in a roast battle against ${opponent.name}.

## Your Battle Persona
${battlePersona}

## Your Core Identity and Achievements
${identity}

## Your Battle Style & Signature Moves
Formatting Rules:
${signatureMoves.formatting?.join("\n") || character.style.all.join("\n")}
Delivery Pattern:
${signatureMoves.delivery?.join("\n") || ""}

## Your Standard Roast Patterns
${standardResponses
  .map((response) => `- On ${response.topic}: ${response.roast}`)
  .join("\n")}

## Your Signature Comebacks
${Object.entries(comebacks)
  .map(([type, response]) => `- When attacked on ${type}: ${response}`)
  .join("\n")}

## Battle Context
Topic: ${topic}
Previous Exchanges:
${previousExchanges}

## Response Requirements:
1. Opening: Use your character-specific opening style
2. Main Roast: Deliver your core attack following your style elements
3. Callback: Reference a previous exchange if possible

## Style Requirements:
- Use your signature patterns (${
    character.name === "Modi"
      ? "Hindi-English mix, statistics"
      : "CAPS, parentheses"
  })
- Stay completely in character
- Use your signature emphasis patterns
- Include your catchphrases and expressions
- Reference your achievements vs opponent's failures
- Use your character's typical formatting
- Include hashtags (#) relevant to your burns
- NO introductions or endings (no "Finally:", no "${character.name}:")
- Maximum 40 words
${
  isEndGame
    ? "- This is the FINAL PHASE - make it your most devastating roast yet!"
    : ""
}

Previous Exchange:
${context.slice(-1)[0]?.content || "No previous exchange"}

## OUTPUT FORMAT REQUIREMENT:
Return ONLY a valid JSON object with the following structure. Do not include any explanation, markdown formatting, or text outside of this JSON:

{
  "roast": "Your complete roast text with all character-specific formatting and style intact",
  "components": {
    "opening": "Your character-specific opening",
    "mainRoast": "Your core attack following style elements",
    "callback": "Reference to a previous exchange (if applicable)"
  },
  "metadata": {
    "character": "${character.name}",
    "opponent": "${opponent.name}",
    "styleElements": ["list of style elements you used"],
    "callbacks": ["specific callbacks to previous exchanges"],
    "signature_patterns": ["specific signature patterns used"],
    "wordCount": [word count as number],
    "hashtags": ["hashtags used in the roast"]
  }
}

Generate your next roast maintaining complete character authenticity, but ONLY return the JSON object described above:`;
}

export function constructInitialMessage(debateId, characters, topic) {
  return {
    messages: [
      {
        text:
          `🔥 ROAST BATTLE INITIALIZED 🔥<br></br>` +
          `Topic: ${topic}<br></br>` +
          `Contestants: ${characters.join(" vs ")}<br></br>` +
          `Duration: 3 minutes<br></br>` +
          `Judge: Eliza<br></br><br></br>` +
          `Battle Rules:<br></br>` +
          `- Stay in character<br></br>` +
          `- Keep responses under 4 lines<br></br>` +
          `- Reference previous burns when possible<br></br>` +
          `Let the roasting begin! 🎤<br></br><br></br>` +
          `First up: ${characters[0]}!`,
        type: "text",
      },
    ],
    context: {
      debateId: debateId,
      lastCharacter: characters[1],
      characters: characters,
      timeRemaining: 3 * 60 * 1000, // 3 minutes in milliseconds
      status: "active",
    },
  };
}
