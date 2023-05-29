"use client";

import { Center, Spinner, Stack, VStack } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { Message } from "./Message";

export type Message = {
  id: number;
  message: string;
  created_at: string;
  from: "ALEX" | "KATYA" | "CLAUDIO";
};

export default function HomePage() {
  const [messages, setMessages] = useState<Message[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getMessages = async () => {
      setLoading(true);
      const res = await fetch("/api/get-messages");
      const data = await res.json();
      setMessages(data);
      setLoading(false);
    };

    getMessages();
    const interval = setInterval(() => getMessages(), 5000);

    return () => clearInterval(interval);
  }, []);

  if (!messages && loading)
    return (
      <VStack p={8} gap={4} py={16}>
        <Spinner color="blue.500" />
      </VStack>
    );

  return (
    <Stack p={8} gap={4}>
      {messages?.map((message) => (
        <Message key={message.id} {...message} />
      ))}
      {loading && (
        <Center
          position={"absolute"}
          bottom={4}
          right={4}
          zIndex={10}
          bg={"whiteAlpha.100"}
          p={4}
          rounded={"md"}
        >
          <Spinner />
        </Center>
      )}
    </Stack>
  );
}
