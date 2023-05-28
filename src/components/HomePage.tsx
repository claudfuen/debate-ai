"use client";

import { Box, Flex, Heading, Stack, Tag, Text } from "@chakra-ui/react";

export type Message = {
  id: number;
  message: string;
  created_at: string;
  from: "ALEX" | "KATYA" | "CLAUDIO";
};

export default function HomePage({ messages }: { messages: Message[] | null }) {
  return (
    <Stack p={8} gap={4}>
      {messages?.map((message) => (
        <Flex key={message.id}>
          <Flex w={24} dir="column">
            <Stack>
              <Heading size={"xs"} fontSize={"xs"}>
                {message.from}
              </Heading>
              <Text fontSize={"xs"}>
                {new Date(message.created_at).toLocaleTimeString()}
              </Text>
            </Stack>
          </Flex>
          <Box bg={"blackAlpha.200"} p={2} rounded={"md"} w={"full"}>
            {message.message}
          </Box>
        </Flex>
      ))}
    </Stack>
  );
}
