import HomePage from "@/components/HomePage";
import { supabase } from "@/lib/supabase";

export const revalidate = 1;

export default async function Home() {
  const { data: messages, error } = await supabase
    .from("messages")
    .select("id, message, created_at, from");

  return (
    <main>
      <HomePage messages={messages} />
    </main>
  );
}
