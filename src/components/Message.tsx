import { Box, Flex, Stack, Tag, Text } from "@chakra-ui/react";
import { useEffect, useState, forwardRef } from "react";

export type MessageProps = {
  id: number;
  message: string;
  created_at: string;
  from: "ALEX" | "KATYA" | "CLAUDIO";
};
const Message = forwardRef<HTMLDivElement, MessageProps>(
  ({ id, message, created_at, from }, ref) => {
    const [dateString, setDateString] = useState("");

    useEffect(() => {
      setDateString(new Date(created_at).toLocaleTimeString());
    }, [created_at]);

    return (
      <Flex ref={ref}>
        <Flex w={24} dir="column">
          <Stack>
            <Box>
              <Tag
                colorScheme={
                  from === "CLAUDIO"
                    ? "red"
                    : from === "KATYA"
                    ? "blue"
                    : "gray"
                }
              >
                {from}
              </Tag>
            </Box>
            <Text fontSize={"xs"}>{dateString}</Text>
          </Stack>
        </Flex>
        <Box bg={"blackAlpha.200"} p={2} rounded={"md"} w={"full"}>
          {message}
        </Box>
      </Flex>
    );
  }
);

Message.displayName = "Message";
export default Message;
