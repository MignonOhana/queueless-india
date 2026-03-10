import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { message, tokenNumber, currentlyServing, peopleAhead } = await req
      .json();
    const apiKey = process.env.GEMINI_API_KEY;

    // If no API key is configured, return smart fallback instead of crashing
    if (!apiKey) {
      return NextResponse.json({
        response: generateFallbackResponse(message, tokenNumber, peopleAhead),
        fallback: true,
      });
    }

    const prompt = `
      You are a helpful virtual assistant for "QueueLess India".
      The user asking the question is currently in a waiting line.
      Here is their context:
      - Their Token Number: ${tokenNumber}
      - Tokens Ahead of them: ${peopleAhead}
      - Expected wait time: ~${peopleAhead * 5} minutes left.
      
      Answer this user's question concisely, happily, and politely.
      Assume each person takes about 5 minutes to be served.
      
      User Question: "${message}"
    `;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: prompt }],
          }],
        }),
      },
    );

    if (!response.ok) {
      // API error — fall back gracefully instead of 500
      console.error(`Gemini API error: ${response.status}`);
      return NextResponse.json({
        response: generateFallbackResponse(message, tokenNumber, peopleAhead),
        fallback: true,
      });
    }

    const data = await response.json();
    const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!responseText) {
      return NextResponse.json({
        response: generateFallbackResponse(message, tokenNumber, peopleAhead),
        fallback: true,
      });
    }

    return NextResponse.json({ response: responseText, fallback: false });
  } catch (error) {
    console.error("AI Chat Error:", error);
    // Never show an error to the user — always return a helpful fallback
    return NextResponse.json({
      response: generateFallbackResponse("", undefined, undefined),
      fallback: true,
    });
  }
}

function generateFallbackResponse(
  message: string,
  tokenNumber?: string,
  peopleAhead?: number,
): string {
  const lower = (message || "").toLowerCase();

  if (
    lower.includes("wait") || lower.includes("time") || lower.includes("long")
  ) {
    const estimate = peopleAhead
      ? `about ${peopleAhead * 5} minutes`
      : "shown on your token card";
    return `Your estimated wait time is ${estimate}. We update this in real-time as the queue moves.`;
  }
  if (lower.includes("cancel")) {
    return 'To cancel your token, go to your token page and tap "Cancel Token". Your spot will be released immediately.';
  }
  if (
    lower.includes("position") || lower.includes("number") ||
    lower.includes("ahead")
  ) {
    const pos = peopleAhead !== undefined
      ? `There are ${peopleAhead} people ahead of you.`
      : "Your current position is displayed on your token.";
    return `${pos} The number decreases as customers ahead of you are served.`;
  }
  if (
    lower.includes("fast") || lower.includes("skip") ||
    lower.includes("priority")
  ) {
    return "FastPass lets you skip ahead in the queue for a small fee. This feature is coming soon!";
  }
  if (
    lower.includes("hello") || lower.includes("hi") || lower.includes("hey")
  ) {
    const greeting = tokenNumber
      ? `Hi! You're token ${tokenNumber}.`
      : "Hi there!";
    return `${greeting} I'm here to help with your queue experience. Ask me about wait times, your position, or how things work.`;
  }
  return "I'm here to help with your queue experience. You can ask me about wait times, your position, or how to cancel your token.";
}
