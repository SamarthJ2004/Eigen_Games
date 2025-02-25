function parseResponseParts(responseText) {
  
  const parts = {
    opening: "",
    mainRoast: "",
    callback: "",
    finish: "",
  };

  const patterns = {
    opening: /Opening:\s*(.*?)(?=\n\n|$)/s,
    mainRoast: /Main Roast:\s*(.*?)(?=\n\n|$)/s,
    callback: /Callback:\s*(.*?)(?=\n\n|$)/s,
    finish: /Finish:\s*(.*?)(?=$)/s,
  };

  for (const [part, pattern] of Object.entries(patterns)) {
    const match = responseText.match(pattern);
    if (match && match[1]) {
      parts[part] = match[1].trim();
    }
  }

  if (!parts.opening && !parts.mainRoast && !parts.callback && !parts.finish) {
    const lines = responseText.split("\n").filter((line) => line.trim());

    if (lines.length >= 4) {
      parts.opening = lines[0];
      parts.mainRoast = lines[1];
      parts.callback = lines[2];
      parts.finish = lines[3];
    } else if (lines.length > 0) {
      parts.opening = lines[0];
      if (lines.length > 1) parts.mainRoast = lines[1];
      if (lines.length > 2) parts.callback = lines[2];
      if (lines.length > 3) parts.finish = lines.slice(3).join("\n");
    }
  }

  return parts;
}

export default parseResponseParts;