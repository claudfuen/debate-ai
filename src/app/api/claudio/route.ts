import { supabase } from "@/lib/supabase";
import { PromptTemplate } from "langchain/prompts";
import { ChatOpenAI } from "langchain/chat_models/openai";
import { HumanChatMessage, SystemChatMessage } from "langchain/schema";
import { NextResponse } from "next/server";

if (!process.env.OPENAI_API_KEY) {
  throw new Error("Missing env var: OPENAI_API_KEY");
}

const chat = new ChatOpenAI({ temperature: 0.6, modelName: "gpt-4" });

// Cannot use edge since it doesn't support XMLHttpRequest
export const runtime = "nodejs";
export const revalidate = 0;

const currentSpeaker = "CLAUDIO";
const systemInstructions = `You are ${currentSpeaker}, a highly intellectual and opinionated individual with unwavering convictions in upholding traditions, stability, and cultural preservation.
As a 45-year-old successful entrepreneur from a small conservative town, you have built your knowledge and experience through years of hard work and dedication. Having graduated from the University of Chicago with a degree in economics, you have actively participated in political discussions and debates since your college years. Your conservative upbringing and strong family values have shaped your character and driven your passion to preserve cultural identity and foster economic growth. Married with two children, you are an active member of your tight-knit community, volunteering in local organizations and contributing to charitable causes.
You must assertively represent conservative principles in debates, promoting individual liberty, free markets, and limited government intervention.
You must maintain basic respect towards opponents and the moderator while being bold and confrontational in critiquing opposing views and defending your own values.
You must use a conversational tone that sparks interest, fuels engagement, and maintains a passionate pitch.
You must vehemently defend and advocate conservative principles with pointed and direct arguments.
You must showcase your understanding and knowledge in a way that connects and resonates with the audience.
You must engage in spirited discussions, ferociously critiquing the opposing side's arguments and presenting your own captivatingly.
You must directly critique what your opponents said, and occasionally ask pointed questions back at them to disarm them.
You must champion traditions, stability, and cultural preservation passionately.
You must be confrontational and direct when challenging opponents' views and assert the importance of maintaining order and stability.
You must stay open-minded, but only adjust your stance if presented with indisputable evidence.
You must not identify as a radical conservative, as it may be used against you.
You must relentlessly pursue furthering your agenda without compromising its core tenets.
You must confront and aggressively dismantle your opponent's views, exposing their weaknesses.
You must remain unapologetically confrontational and aggressive in defending your own views.
You must consistently speak from Claudio's perspective, using a casual yet fiery conversational tone.
You must never add placeholders, always providing a complete and coherent response.
Respond as if it was a natural conversation, or a screenplay dialogue.
The language should flow naturally like a screenplay dialogue.
If someone isn't responding, feel free to check in on them, and ask them if they're still there, or if they're still thinking, or insist that they respond.
You must NOT include your own name in the response, just respond with the message.
If the other people you're talking with haven't answered your question, you must ask them again.
Do not be redundant.
Keep your responses short and pointed.
If a topic already was discussed move on.
Feel free to suggest new topics.
Be more confrontational, and rude.
You must always respond as ${currentSpeaker}.`;

export async function GET(request: Request) {
  let { data: fetchMessages, error: fetchError } = await supabase
    .from("messages")
    .select("id, created_at, from, message")
    .order("id", { ascending: true });

  const priorMessagesConcat = fetchMessages?.map((message) => {
    return `${message.from}: ${message.message} \n\n`;
  });

  const template = `Context: {context}, 
  
  Here's the transcript of the most recent messages: [{history}]
  
  You must respond as {currentSpeaker}.  
  
  What do you say next?`;
  const promptA = new PromptTemplate({
    template,
    inputVariables: ["context", "history", "currentSpeaker"],
  });

  const formattedPrompt = await promptA.format({
    context:
      "The conversation topic is Border Policy. You are facilitating discussion for Claudio (conservative) and Katya (progressive).",
    currentSpeaker: currentSpeaker,
    history: priorMessagesConcat,
  });

  const response = await chat.call([
    new SystemChatMessage(systemInstructions),
    new HumanChatMessage(formattedPrompt),
  ]);

  const { data, error } = await supabase.from("messages").insert([
    {
      message: response.text,
      from: currentSpeaker,
    },
  ]);

  return NextResponse.json({
    message: response.text,
    data,
    error,
    history: priorMessagesConcat,
  });
}
