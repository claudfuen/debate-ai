import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export const runtime = "edge";
export const revalidate = 5;

export async function GET(request: Request) {
  let { data: messages, error } = await supabase
    .from("messages")
    .select("id, message, created_at, from")
    .order("id", { ascending: true });

  if (error) {
    console.error(error);
    return NextResponse.error();
  }

  if (!messages || messages.length === 0) {
    return NextResponse.error();
  }

  return NextResponse.json(messages, {
    // add CORS headers
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET",
    },
  });
}
