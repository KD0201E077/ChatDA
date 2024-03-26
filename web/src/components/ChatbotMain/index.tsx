/* eslint-disable */
import axios from "axios";
import { Dispatch, SetStateAction, useEffect, useState, useRef } from "react";
import { request } from "@src/apis/requestBuilder";
import * as Sub from "./Subs";
import * as S from "./style";
import * as T from "@root/src/types";

export default function ChatbotMain(props: {
  props: T.ComparePrdProps[];
  setComparePrds: Dispatch<SetStateAction<T.ComparePrdProps[]>>;
  messages: T.MessagesProps;
  setMessages: Dispatch<SetStateAction<T.MessagesProps>>;
  handleOpenExpandModal: (st: T.ExpandModalStateType) => void;
  changeSelectedModelNo: (models: string[]) => void;
  isSpeechDisplay?: boolean;
  speechText?: string;
}) {
  const [currentTypingId, setCurrentTypingId] = useState<number | null>(null);

  const [lastHeight, setLastHeight] = useState(null);
  const chatElement = useRef<HTMLDivElement>();

  const openAiKey = "";

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
      const { choices } = response.data;
      const text = choices[0].message.content.trim();
      return text;
    } catch (e: any) {
      if (e.response?.status === 500) {
        alert("OpenAI 서버에 오류가 발생했습니다.");
        props.setMessages([
          ...props.messages,
          { text: prompt, sender: "user" },
          { text: "오류가 발생했습니다.", sender: "bot" },
        ]);
      }
    }
  };
  // 비교버튼 누를 시 메시지 생성
  // useEffect(() => {
  //   if (props.props && props.props.length > 0) {
  //     props.setMessages((prev) => [
  //       ...prev,
  //       ...props.props.map((item) => ({
  //         text: `${item.제품명}\n${item.modelNo}`,
  //         isUser: true,
  //         isTyping: true,
  //         id: item.id,
  //         isCompared: true,
  //       })),
  //     ]);
  //   }
  // }, [props.props]);

  // useEffect(() => {
  //   if (messages.length > 0 && messages[messages.length - 1].id === 0) {
  //     console.log("답변 생성중");
  //   }
  // }, [messages]);

  const handleSendMessage = async (message: string) => {
    // props.setMessages((prev) => [
    //   ...prev,
    //   { text: message, isUser: true, isCompared: false },
    //   // { text: "", isUser: false, isTyping: true, id: 0 },
    // ]);

    // const response = await generateText(message);
    // props.setMessages((prev) => [
    //   // ...prev.slice(0, prev.length - 1), // 성능적으로 괜찮은지, 더 좋은 방법이 있는지 고민해 봐야할 필요 있음
    //   ...prev,
    //   {
    //     text: response,
    //     isUser: false,
    //     isTyping: true,
    //     id: Date.now(),
    //     isCompared: false,
    //   },
    // ]);
    // const response = await generateText(message);
    const sessionId = window.sessionStorage.getItem("_da_da_sessionId");
    const tabHash = window.sessionStorage.getItem("di_tab_hash");

    const response = await request.post("/chat", {
      uuid: `${sessionId}_${tabHash}`,
      content: message,
    });
    const { data } = response;

    // const data = {
    //   type: "info",
    //   content: "테스트용",
    //   modelNo: "11",
    // };

    if (data.type === "recommend") {
      props.setMessages((prev) => [
        ...prev,
        { text: message, isUser: true },
        {
          type: data.type,
          text: data.content.message,
          isUser: false,
          isTyping: true,
          isCompared: false,
          id: Date.now(),
          modelNo: data.modelNo,
          spec: data.content.spec,
        },
      ]);
    } else if (data.type === "info") {
      props.setMessages((prev) => [
        ...prev,
        { text: message, isUser: true },
        {
          type: data.type,
          text: data.content,
          isUser: false,
          isTyping: true,
          isCompared: false,
          id: Date.now(),
          modelNo: data.modelNo,
          btnString: "상세 스펙 보기",
        },
      ]);
    } else if (data.type === "compare") {
      props.setMessages((prev) => [
        ...prev,
        { text: message, isUser: true },
        {
          type: data.type,
          text: data.content,
          isUser: false,
          isTyping: true,
          isCompared: true,
          id: Date.now(),
          modelNoList: data.modelNoList,
          btnString: "자세히 비교하기",
        },
      ]);
    }

    // setMessages((prev) => [
    //   ...prev,
    //   { text: message, isUser: true },
    //   {
    //     type: data.type,
    //     text: data.content,
    //     isUser: false,
    //     isTyping: true,
    //     id: Date.now(),
    //     modelNo: data?.modelNo,
    //     modelNoList: data?.modelNoList,
    //   },
    // ]);
  };

  // const handleEndTyping: (id: number) => void = (id: number) => {
  //   setMessages((prev: T.MessagesProps) =>
  //     prev.map((msg) => {
  //       return msg.id === id ? { ...msg, isTyping: false } : msg;
  //     }),
  //   );
  //   setCurrentTypingId(null);
  // };

  // useEffect(() => {
  //   if (currentTypingId === null) {
  //     const nextTypingMessage = props.messages.find((msg) => {
  //       !msg.isUser && msg.isTyping;
  //     });
  //     if (nextTypingMessage) {
  //       setCurrentTypingId(nextTypingMessage.id);
  //     }
  //   }
  // }, [props.messages, currentTypingId]);

  useEffect(() => {
    const { scrollTop, scrollHeight, clientHeight } = chatElement.current;

    if (scrollTop + clientHeight >= scrollHeight - 100) {
      chatElement.current.scrollTop = scrollHeight;
      return;
    }

    if (!lastHeight) {
      chatElement.current.scrollTop = scrollHeight;
    } else {
      if (scrollTop === 0) {
        const diff = scrollHeight - lastHeight;
        chatElement.current.scrollTop = diff;
      }
    }
  }, [props.messages, lastHeight]);

  return (
    <S.ChatMainWrapper>
      <S.ChatMessageWrapper ref={chatElement}>
        <Sub.MessageList
          messages={props.messages}
          currentTypingId={currentTypingId}
          setMessages={props.setMessages}
          setComparePrds={props.setComparePrds}
          handleOpenExpandModal={props.handleOpenExpandModal}
          changeSelectedModelNo={props.changeSelectedModelNo}
        />
      </S.ChatMessageWrapper>
      <S.ChatInputWrapper>
        {props.isSpeechDisplay ? (
          <Sub.SpeechMessageDisplayForm message={props.speechText} />
        ) : (
          <Sub.MessageForm onSendMessage={handleSendMessage} />
        )}
      </S.ChatInputWrapper>
    </S.ChatMainWrapper>
  );
}
