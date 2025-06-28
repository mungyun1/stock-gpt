import { useState, useCallback } from "react";
import { Keyboard } from "react-native";
import { Message } from "../types/chat";
import {
  addMessageToThread,
  createAndRunAssistant,
  waitForRunCompletion,
  getThreadMessages,
  convertOpenAIMessagesToAppMessages,
  getAssistantId,
} from "../utils/openai";
import {
  isStockAnalysisRequest,
  extractStockTicker,
  requestStockAnalysis,
} from "../utils/stockAnalysisUtils";

export const useChat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  const addMessage = useCallback((message: Message) => {
    setMessages((prev) => [...prev, message]);
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  const loadThreadMessages = useCallback(async (threadId: string) => {
    try {
      const openAIMessages = await getThreadMessages(threadId);
      const convertedMessages =
        convertOpenAIMessagesToAppMessages(openAIMessages);
      setMessages(convertedMessages);
    } catch (error) {
      console.error("메시지 로딩 중 오류:", error);
    }
  }, []);

  const sendMessage = useCallback(
    async (
      userMessage: string,
      threadId: string,
      onSuccess?: (assistantMessage: string) => void,
      onError?: (error: string) => void
    ) => {
      if (!userMessage.trim() || isLoading || !threadId) return;

      setInput("");
      Keyboard.dismiss();

      const newMessage: Message = {
        id: Date.now().toString(),
        text: userMessage,
        isUser: true,
        createdAt: new Date(),
      };

      addMessage(newMessage);
      setIsLoading(true);
      setIsTyping(true);

      try {
        // 종목 분석 요청인지 확인
        if (isStockAnalysisRequest(userMessage)) {
          const ticker = extractStockTicker(userMessage);
          const assistantId = getAssistantId();

          if (ticker && assistantId) {
            // 종목 분석 요청을 백엔드로 전송
            const analysisResult = await requestStockAnalysis(
              ticker,
              threadId,
              assistantId
            );

            // Run 완료 대기
            await waitForRunCompletion(threadId, analysisResult.run_id);

            // 메시지 목록 가져오기
            const openAIMessages = await getThreadMessages(threadId);
            const latestAssistantMessage = openAIMessages.find(
              (msg: any) =>
                msg.role === "assistant" &&
                msg.created_at > Date.now() / 1000 - 60
            );

            if (
              latestAssistantMessage &&
              latestAssistantMessage.content[0].type === "text"
            ) {
              const assistantText =
                latestAssistantMessage.content[0].text.value;
              const assistantMessage: Message = {
                id: (Date.now() + 1).toString(),
                text: assistantText,
                isUser: false,
                createdAt: new Date(),
              };

              addMessage(assistantMessage);
              onSuccess?.(assistantText);
            }
            return;
          }
        }

        // 일반적인 메시지 처리 (기존 로직)
        // 메시지 생성
        await addMessageToThread(threadId, userMessage);

        // Run 생성 및 실행
        const run = await createAndRunAssistant(threadId);

        // Run 완료 대기
        await waitForRunCompletion(threadId, run.id);

        // 메시지 목록 가져오기
        const openAIMessages = await getThreadMessages(threadId);
        const latestAssistantMessage = openAIMessages.find(
          (msg: any) =>
            msg.role === "assistant" && msg.created_at > Date.now() / 1000 - 60
        );

        if (
          latestAssistantMessage &&
          latestAssistantMessage.content[0].type === "text"
        ) {
          const assistantText = latestAssistantMessage.content[0].text.value;
          const assistantMessage: Message = {
            id: (Date.now() + 1).toString(),
            text: assistantText,
            isUser: false,
            createdAt: new Date(),
          };

          addMessage(assistantMessage);
          onSuccess?.(assistantText);
        }
      } catch (error) {
        console.error("메시지 전송 중 오류:", error);
        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: "죄송합니다. 메시지 전송 중 오류가 발생했습니다. 다시 시도해주세요.",
          isUser: false,
          createdAt: new Date(),
          error: true,
        };
        addMessage(errorMessage);
        onError?.("메시지 전송 실패");
      } finally {
        setIsLoading(false);
        setIsTyping(false);
      }
    },
    [isLoading, addMessage]
  );

  const retryMessage = useCallback(
    async (failedMessageId: string, threadId: string) => {
      const failedMessage = messages.find((msg) => msg.id === failedMessageId);
      if (!failedMessage?.lastUserMessage) return;

      // 실패한 메시지 제거
      setMessages((prev) => prev.filter((msg) => msg.id !== failedMessageId));

      // 메시지 재전송
      await sendMessage(failedMessage.lastUserMessage, threadId);
    },
    [messages, sendMessage]
  );

  return {
    messages,
    input,
    setInput,
    isLoading,
    isTyping,
    addMessage,
    clearMessages,
    loadThreadMessages,
    sendMessage,
    retryMessage,
  };
};
