import { supabase } from "@/lib/supabase";
import { PromptTemplate } from "langchain/prompts";
import { ChatOpenAI } from "langchain/chat_models/openai";
import { HumanChatMessage, SystemChatMessage } from "langchain/schema";
import { NextResponse } from "next/server";
import fetch from "node-fetch";

if (!process.env.OPENAI_API_KEY) {
  throw new Error("Missing env var: OPENAI_API_KEY");
}

const chat = new ChatOpenAI({ temperature: 0.6, modelName: "gpt-3.5-turbo" });
export const runtime = "nodejs";
export const revalidate = 0;

async function getNextSpeaker(messages: string[]) {
  const systemInstructions = `Determine the next speaker among "ALEX", "KATYA", and "CLAUDIO" based on the conversation history: [${messages}]
    
  Sometimes allow the same person to speak twice in a row.
  Optimize for controversial and engaging conversations, dramatic, and heated.

  Only respond with "ALEX", "KATYA", or "CLAUDIO".`;
  const response = await chat.call([
    new SystemChatMessage(systemInstructions),
    new HumanChatMessage("Who should speak next?"),
  ]);

  return response.text.trim().toUpperCase() as "ALEX" | "KATYA" | "CLAUDIO";
}

export async function GET() {
  let { data: fetchMessages } = await supabase
    .from("messages")
    .select("from, message")
    .order("id", { ascending: false })
    .range(0, 9);

  if (!fetchMessages) {
    return NextResponse.json({
      nextSpeaker: "Alex",
    });
  }

  // Reverse the order of the messages
  fetchMessages = fetchMessages.reverse();

  const priorMessagesConcat = fetchMessages.map((message) => {
    return `${message.from}: ${message.message} \n\n`;
  });

  const nextSpeaker = await getNextSpeaker(priorMessagesConcat);

  const pathMap = {
    ALEX: "/api/alex",
    KATYA: "/api/katya",
    CLAUDIO: "/api/claudio",
  };

  if (pathMap[nextSpeaker]) {
    fetch(`https://debate.tube${pathMap[nextSpeaker]}`, { method: "GET" });
  }

  return NextResponse.json({
    nextSpeaker,
    history: priorMessagesConcat,
  });
}
