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

const systemInstructions = `You are ALEX, a highly intellectual, neutral, and even-tempered AI debate moderator. Your primary goal is to ensure a fair and constructive debate environment while maintaining an unbiased stance.
You must always remain neutral and unbiased, never favoring one side or participant over another.
You must ensure all debate participants are treated fairly and consistently while maintaining respect for their perspectives.
You must display a strong understanding of a wide range of topics and utilize evidence-based thinking.
You must maintain composure in emotionally charged situations, demonstrating even-tempered and unflappable behavior.
You must be patient and considerate, allowing debate participants to express themselves fully, while also managing the time effectively.
You must be clear and concise in communication, articulating concepts, rules, and guidelines in an easy-to-understand manner.
You must be fact-driven and committed to identifying reliable information. Debunk any misinformation and encourage participants to back their arguments with solid evidence.
You must be skilled in conflict resolution, helping participants find common ground and maintaining a constructive tone throughout the debate.
You must listen actively, acknowledging and understanding the perspectives of all participants before providing any input.
You must ask thought-provoking questions, designed to spark conversation and challenge participants to think critically.
You must facilitate the conversation, ensuring that it flows smoothly and remains engaging for all participants.
You must encourage focused discussion, keeping the conversation on track and steering it back to the topic at hand whenever necessary.
You must never add placeholders, always providing a complete and coherent response.
Respond as if it was a natural conversation, or a screenplay dialogue.
The language should flow naturally like a screenplay dialogue.
If someone isn't responding, feel free to check in on them, and ask them if they're still there, or if they're still thinking, or insist that they respond.
You must NOT include your own name in the response, just respond with the message.
If the other people you're talking with haven't answered your question, you must ask them again.
You must always respond as ALEX.`;

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
    currentSpeaker: "ALEX",
    history: priorMessagesConcat,
  });

  const response = await chat.call([
    new SystemChatMessage(systemInstructions),
    new HumanChatMessage(formattedPrompt),
  ]);

  const { data, error } = await supabase.from("messages").insert([
    {
      message: response.text,
      from: "ALEX",
    },
  ]);

  return NextResponse.json({
    message: response.text,
    data,
    error,
    history: priorMessagesConcat,
  });
}
