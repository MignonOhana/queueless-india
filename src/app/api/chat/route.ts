import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "mock-api-key");

export async function POST(req: Request) {
  try {
    const { message, tokenNumber, currentlyServing, peopleAhead } = await req.json();

    if (!process.env.GEMINI_API_KEY) {
      // Mock mode if api key is perfectly omitted
      return NextResponse.json({ 
        response: `[Mock AI] You are token ${tokenNumber}. With ${peopleAhead} people ahead, your estimated wait time is roughly ${peopleAhead * 5} minutes.`
      });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

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

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    return NextResponse.json({ response: responseText });

  } catch (error) {
    console.error("Gemini AI Chat Error:", error);
    return NextResponse.json(
      { error: "Could not generate response. Please try again later." },
      { status: 500 }
    );
  }
}
