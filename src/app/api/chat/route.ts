import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { message, tokenNumber, currentlyServing, peopleAhead } = await req.json();
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      // Mock mode if api key is perfectly omitted
      return NextResponse.json({ 
        response: `[Mock AI] You are token ${tokenNumber}. With ${peopleAhead} people ahead, your estimated wait time is roughly ${peopleAhead * 5} minutes.`
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

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: prompt }]
        }]
      })
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text || "Sorry, I am out of service right now.";

    return NextResponse.json({ response: responseText });

  } catch (error) {
    console.error("Gemini AI Chat Error:", error);
    return NextResponse.json(
      { error: "Could not generate response. Please try again later." },
      { status: 500 }
    );
  }
}
