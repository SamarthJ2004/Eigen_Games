export async function getDebateData(debateId, memoryCache) {
  try {
    const debateData = await memoryCache.get(`debate:${debateId}`);
    if (!debateData) {
      throw new Error("Debate not found");
    }
    return JSON.parse(debateData);
  } catch (error) {
    throw new Error(`Error retrieving debate data: ${error.message}`);
  }
}

export function formatDebateResponse(debate) {
  return {
    id: debate.debateId,
    topic: debate.topic,
    status: debate.status,
    startTime: debate.startTime,
    characters: debate.characters,
    messages: debate.messages.map((msg) => ({
      character: msg.character,
      content: msg.content,
      timestamp: msg.timestamp,
      analysis: msg.analysis || null,
    })),
    evaluation: debate.evaluation || null,
    timeRemaining:
      debate.status === "active"
        ? 3 * 60 * 1000 - (Date.now() - debate.startTime)
        : 0,
  };
}

export async function getAllDebateIds(memoryCache) {
  try {
    const keys = Array.from(memoryCache.cache.keys());
    return keys
      .filter((key) => key.startsWith("debate:"))
      .map((key) => key.replace("debate:", ""));
  } catch (error) {
    throw new Error(`Error retrieving debate IDs: ${error.message}`);
  }
}

export async function getDebateHistory(debateId, memoryCache) {
  try {
    const debate = await getDebateData(debateId, memoryCache);
    return formatDebateResponse(debate);
  } catch (error) {
    throw new Error(`Error retrieving debate history: ${error.message}`);
  }
}