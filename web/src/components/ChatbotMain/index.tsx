import axios from "axios";
import { useEffect, useState } from "react";
import * as Sub from "./Subs";
import * as S from "./style";
import * as T from "@root/src/types";

export default function ChatbotMain() {
  const [messages, setMessages] = useState<T.MessagesProps>([]);
  const [currentTypingId, setCurrentTypingId] = useState<number | null>(null);

  const openAiKey = "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";

  const generateText = async (prompt: string) => {
    try {
      const response = await axios.post(
        "https://api.openai.com/v1/chat/completions",
        {
          model: "gpt-3.5-turbo",
          messages: [
            {
              role: "system",
              content: "You are a helpful assistant.",
            },
            {
              role: "user",
              content: prompt,
            },
          ],
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${openAiKey}`,
          },
        },
      );
      console.log(response);
      const { choices } = response.data;
      const text = choices[0].message.content.trim();
      return text;
    } catch (e: any) {
      if (e.response?.status === 500) {
        alert("OpenAI 서버에 오류가 발생했습니다.");
        setMessages([
          ...messages,
          { text: prompt, sender: "user" },
          { text: "오류가 발생했습니다.", sender: "bot" },
        ]);
      }
    }
  };

  const handleSendMessage = async (message: string) => {
    setMessages((prev) => [...prev, { text: message, isUser: true }]);

    const response = await generateText(message);

    setMessages((prev) => [
      ...prev,
      {
        text: response,
        isUser: false,
        isTyping: true,
        id: Date.now(),
      },
    ]);
  };

  // const handleEndTyping: (id: number) => void = (id: number) => {
  //   setMessages((prev: T.MessagesProps) =>
  //     prev.map((msg) => {
  //       return msg.id === id ? { ...msg, isTyping: false } : msg;
  //     }),
  //   );
  //   setCurrentTypingId(null);
  // };

  useEffect(() => {
    if (currentTypingId === null) {
      const nextTypingMessage = messages.find((msg) => {
        !msg.isUser && msg.isTyping;
      });
      if (nextTypingMessage) {
        setCurrentTypingId(nextTypingMessage.id);
      }
    }
  }, [messages, currentTypingId]);

  return (
    <S.ChatMainWrapper>
      <S.ChatMessageWrapper>
        <Sub.MessageList messages={messages} currentTypingId={currentTypingId} />
      </S.ChatMessageWrapper>
      <S.ChatInputWrapper>
        <Sub.MessageForm onSendMessage={handleSendMessage} />
      </S.ChatInputWrapper>
    </S.ChatMainWrapper>
  );
}
