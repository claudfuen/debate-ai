"use client";

import { Center, Spinner, Stack, VStack } from "@chakra-ui/react";
import { useEffect, useRef, useState } from "react";
import Message, { MessageProps } from "./Message";

export default function HomePage() {
  const [messages, setMessages] = useState<MessageProps[] | null>(null);
  const [loading, setLoading] = useState(true);
  const lastMessageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const getMessages = async () => {
      setLoading(true);
      const res = await fetch("/api/get-messages");
      const data = await res.json();
      setMessages(data);
      setLoading(false);
    };

    getMessages();
    const interval = setInterval(() => getMessages(), 10000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (lastMessageRef.current) {
      lastMessageRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  if (!messages && loading)
    return (
      <VStack p={8} gap={4} py={16}>
        <Spinner color="blue.500" />
      </VStack>
    );

  return (
    <Stack p={8} gap={4}>
      {messages?.map((message, index) => (
        <Message
          key={message.id}
          ref={index === messages.length - 1 ? lastMessageRef : null}
          {...message}
        />
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
