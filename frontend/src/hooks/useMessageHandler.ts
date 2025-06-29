import { useState } from "react";
import OpenAI from "openai";
import {
  Message,
  StockAnalysisResponse,
  MarketAnalysisResponse,
} from "../types/chat";
import {
  analyzeUserInput,
  STOCK_TICKER_PATTERN,
  delay,
} from "../utils/chatUtils";
import {
  isStockAnalysisRequest,
  extractStockTicker,
} from "../utils/stockAnalysisUtils";

const BACKEND_URL = "http://localhost:8000"; // 백엔드 서버 URL

export const useMessageHandler = (
  openai: OpenAI,
  threadId: string | null,
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>,
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>,
  setIsTyping: React.Dispatch<React.SetStateAction<boolean>>,
  startThinkingAnimation: (messageId: string, setMessages: any) => void,
  stopThinkingAnimation: () => void,
  stopColorAnimation: () => void,
  threads: any[],
  setThreads: React.Dispatch<React.SetStateAction<any[]>>,
  saveThreads: (threads: any[]) => Promise<void>,
  generateThreadTitle: (message: string, openai: OpenAI) => Promise<string>
) => {
  const [editingThreadId, setEditingThreadId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");

  const handleRateLimit = async () => {
    const maxRetries = 3;
    const baseDelay = 2000; // 2초
    let retryAttempt = 0;

    const retry = async () => {
      retryAttempt++;
      if (retryAttempt <= maxRetries) {
        const waitTime = baseDelay * Math.pow(2, retryAttempt - 1); // 지수 백오프
        console.log(
          `Rate limit 도달. ${
            waitTime / 1000
          }초 후 재시도 (${retryAttempt}/${maxRetries})...`
        );

        setMessages((prev) => [
          ...prev,
          {
            text: `API 사용량 제한에 도달했습니다. ${
              waitTime / 1000
            }초 후 재시도합니다...`,
            isUser: false,
            id: Date.now().toString(),
            createdAt: new Date(),
          },
        ]);

        await delay(waitTime);
        return true; // 재시도
      }
      return false; // 재시도 중단
    };

    return retry();
  };

  const sendMessageToAssistant = async (userMessage: string) => {
    const ASSISTANT_ID = process.env.EXPO_PUBLIC_OPENAI_ASSISTANT_ID;

    if (!threadId || !ASSISTANT_ID) {
      console.error("스레드 ID 또는 어시스턴트 ID가 없음:", {
        threadId,
        ASSISTANT_ID,
      });
      return;
    }

    try {
      setIsLoading(true);
      console.log("사용자 메시지 생성 시작");

      // 스레드가 실제로 존재하는지 먼저 확인
      try {
        await openai.beta.threads.retrieve(threadId);
      } catch (error: any) {
        console.error("스레드가 존재하지 않음:", threadId, error);
        // 스레드가 존재하지 않는 경우 새로운 스레드 생성
        const newThread = await openai.beta.threads.create();
        const newThreadObj = {
          id: newThread.id,
          title: "새로운 대화",
          created_at: new Date(),
        };

        const updatedThreads = [newThreadObj, ...threads];
        setThreads(updatedThreads);
        await saveThreads(updatedThreads);

        // 새로운 스레드로 메시지 전송
        return await sendMessageToAssistant(userMessage);
      }

      let streamingMessageId = Date.now().toString();

      // 로딩 메시지 초기화 (첫 번째 생각 메시지로 시작)
      setMessages((prev) => [
        ...prev,
        {
          text: "답변을 생각하고 있어요...",
          isUser: false,
          id: streamingMessageId,
          createdAt: new Date(),
        },
      ]);

      // 생각하는 애니메이션 시작
      startThinkingAnimation(streamingMessageId, setMessages);

      // Assistant ID 유효성 검사
      try {
        const assistant = await openai.beta.assistants.retrieve(ASSISTANT_ID);
      } catch (error: any) {
        if (error?.error?.code === "rate_limit_exceeded") {
          const shouldRetry = await handleRateLimit();
          if (shouldRetry) {
            return await sendMessageToAssistant(userMessage);
          }
        }
        console.error("Assistant ID가 유효하지 않음:", error);
        throw new Error("Assistant ID가 유효하지 않습니다.");
      }

      // 사용자 메시지 생성
      let createdMessage;
      try {
        createdMessage = await openai.beta.threads.messages.create(threadId, {
          role: "user",
          content: userMessage,
        });
        console.log("사용자 메시지 생성 완료:", createdMessage.id);
      } catch (error: any) {
        if (error?.error?.code === "rate_limit_exceeded") {
          const shouldRetry = await handleRateLimit();
          if (shouldRetry) {
            return await sendMessageToAssistant(userMessage);
          }
        }
        throw error;
      }

      // Assistant 실행
      let run;
      try {
        run = await openai.beta.threads.runs.create(threadId, {
          assistant_id: ASSISTANT_ID,
          instructions:
            "너는 소비자독점 기업을 중심으로 미국과 한국 주식을 분석하는 고급 투자 어시스턴트야.",
        });
        console.log("Assistant 실행 요청 완료:", run.id);
      } catch (error: any) {
        if (error?.error?.code === "rate_limit_exceeded") {
          const shouldRetry = await handleRateLimit();
          if (shouldRetry) {
            return await sendMessageToAssistant(userMessage);
          }
        }
        throw error;
      }

      // 실행 상태 확인 및 응답 처리
      let runStatus = await openai.beta.threads.runs.retrieve(run.id, {
        thread_id: threadId,
      });
      console.log("초기 실행 상태:", runStatus.status);

      let retryCount = 0;
      const maxStatusRetries = 30; // 30초 타임아웃

      while (
        runStatus.status !== "completed" &&
        runStatus.status !== "failed" &&
        runStatus.status !== "expired" &&
        retryCount < maxStatusRetries
      ) {
        await delay(1000);
        try {
          runStatus = await openai.beta.threads.runs.retrieve(run.id, {
            thread_id: threadId,
          });
          console.log("실행 상태 업데이트:", runStatus.status);
        } catch (error: any) {
          if (error?.error?.code === "rate_limit_exceeded") {
            const shouldRetry = await handleRateLimit();
            if (shouldRetry) {
              continue;
            }
          }
          throw error;
        }
        retryCount++;
      }

      if (runStatus.status === "completed") {
        // 생각하는 애니메이션 정지
        stopThinkingAnimation();

        const messages = await openai.beta.threads.messages.list(threadId);
        const lastMessage = messages.data[0];

        if (
          lastMessage.role === "assistant" &&
          lastMessage.content[0].type === "text"
        ) {
          const messageContent = lastMessage.content[0].text.value;
          const titleMatch = messageContent.match(/#제목:\s*([^\n]+)/);
          let title = "새로운 대화";
          let content = messageContent;

          if (titleMatch) {
            title = titleMatch[1].trim();
            content = messageContent.replace(/#제목:.*\n*/, "").trim();
          }

          // 기존 로딩 메시지를 새로운 응답으로 교체
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === streamingMessageId
                ? { ...msg, text: content.trim() }
                : msg
            )
          );

          // 첫 메시지인 경우에만 제목 업데이트
          if (messages.data.length <= 2) {
            const updatedThreads = threads.map((thread) =>
              thread.id === threadId
                ? { ...thread, title, last_message: userMessage }
                : thread
            );
            setThreads(updatedThreads);
            await saveThreads(updatedThreads);
          }
        }
      } else if (runStatus.status === "failed") {
        const runDetails = await openai.beta.threads.runs.retrieve(run.id, {
          thread_id: threadId,
        });
        console.error("실행 실패 상세:", runDetails);

        if (runDetails.last_error?.code === "rate_limit_exceeded") {
          const shouldRetry = await handleRateLimit();
          if (shouldRetry) {
            return await sendMessageToAssistant(userMessage);
          }
        }

        throw new Error(
          `Assistant 실행 실패: ${
            runDetails.last_error?.message || "알 수 없는 오류"
          }`
        );
      } else if (runStatus.status === "expired") {
        throw new Error("Assistant 실행 시간 초과");
      } else if (retryCount >= maxStatusRetries) {
        throw new Error("Assistant 응답 시간 초과");
      }
    } catch (error: any) {
      stopColorAnimation();
      // 에러 발생 시 애니메이션 정지
      stopThinkingAnimation();
      console.error("메시지 전송 중 상세 오류:", error);

      const errorMessage =
        error?.error?.code === "rate_limit_exceeded"
          ? "API 사용량 제한에 도달했습니다. 잠시 후 다시 시도해주세요."
          : error?.status === 404 || error?.error?.code === "not_found"
          ? "스레드가 존재하지 않습니다. 새로운 대화를 시작해주세요."
          : `오류가 발생했습니다: ${
              error.message || "알 수 없는 오류가 발생했습니다"
            }`;

      setMessages((prev) => [
        ...prev,
        {
          text: errorMessage,
          isUser: false,
          id: Date.now().toString(),
          createdAt: new Date(),
          error: true,
          lastUserMessage: userMessage,
        },
      ]);
    } finally {
      setIsLoading(false);
      stopThinkingAnimation();
      stopColorAnimation();
    }
  };

  const handleSend = async (
    input: string,
    setInput: (value: string) => void
  ) => {
    if (!input.trim()) return;

    const userMessage = input.trim();
    setInput("");

    try {
      if (!threadId) {
        // 새로운 대화 스레드가 있는지 확인
        const newThread = threads.find(
          (thread) => thread.title === "새로운 대화"
        );

        if (newThread) {
          // 새로운 대화 스레드가 있으면 그 스레드 사용
          console.log("기존 새로운 대화 스레드 사용:", newThread.id);
        } else {
          // 새로운 대화 스레드가 없을 때만 새로 생성
          const thread = await openai.beta.threads.create();
          const newThreadObj = {
            id: thread.id,
            title: "새로운 대화",
            created_at: new Date(),
          };
          setThreads((prevThreads) => {
            const updatedThreads = [newThreadObj, ...prevThreads];
            saveThreads(updatedThreads); // 비동기로 저장
            return updatedThreads;
          });
        }
      }

      setMessages((prev) => [
        ...prev,
        {
          text: userMessage,
          isUser: true,
          id: Date.now().toString(),
          createdAt: new Date(),
        },
      ]);

      // 첫 메시지 전송 시 '새로운 대화' 스레드의 제목을 변경
      if (threadId) {
        const currentThread = threads.find((t) => t.id === threadId);
        if (currentThread && currentThread.title === "새로운 대화") {
          const generatedTitle = await generateThreadTitle(userMessage, openai);
          const updatedThreads = threads.map((t) =>
            t.id === threadId
              ? { ...t, title: generatedTitle, last_message: userMessage }
              : t
          );
          setThreads(updatedThreads);
          await saveThreads(updatedThreads);
        }
      }

      setIsTyping(true);

      // 종목 분석 요청인지 먼저 확인 (한국 주식 포함)
      const isStockRequest = isStockAnalysisRequest(userMessage);
      const messageType = isStockRequest
        ? "stock"
        : analyzeUserInput(userMessage);
      console.log(
        `메시지 분석 결과: ${messageType} (한국주식체크: ${isStockRequest})`
      );

      let analysisResult: StockAnalysisResponse | MarketAnalysisResponse;

      if (messageType === "stock") {
        // 한국 주식 매핑을 포함한 ticker 추출
        let ticker = extractStockTicker(userMessage);

        // 한국 주식 매핑에서 못 찾으면 기존 방식으로 시도
        if (!ticker) {
          ticker = userMessage.match(STOCK_TICKER_PATTERN)?.[0] || "";
        }

        console.log(
          `주식 분석 요청 - 원문: "${userMessage}", 추출된 티커: "${ticker}"`
        );

        if (!ticker) {
          console.error("티커를 추출할 수 없음");
          await sendMessageToAssistant(userMessage);
        } else {
          try {
            console.log(`${BACKEND_URL}/analyze 요청 시작`);
            const response = await fetch(`${BACKEND_URL}/analyze`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ ticker }),
            });

            if (!response.ok) {
              const errorText = await response.text();
              console.error("HTTP 오류:", response.status, errorText);
              throw new Error(
                `HTTP error! status: ${response.status}, message: ${errorText}`
              );
            }

            analysisResult = (await response.json()) as StockAnalysisResponse;
            console.log(`주식 분석 완료 - ${ticker}:`, {
              hasStockInfo: !!analysisResult.stock_info,
              analysisLength: analysisResult.analysis.length,
            });

            setMessages((prev) => [
              ...prev,
              {
                text: analysisResult.analysis,
                isUser: false,
                id: Date.now().toString(),
                createdAt: new Date(),
              },
            ]);
          } catch (error) {
            console.error("주식 분석 요청 실패:", error);
            await sendMessageToAssistant(userMessage);
          }
        }
      } else if (messageType === "market") {
        const marketRequest = {
          indices: ["^GSPC", "^IXIC", "^KS11"],
          lookback_days: 30,
        };

        console.log("시장 분석 요청:", marketRequest);

        try {
          console.log(`${BACKEND_URL}/market-analyze 요청 시작`);
          const response = await fetch(`${BACKEND_URL}/market-analyze`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(marketRequest),
          });

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          analysisResult = (await response.json()) as MarketAnalysisResponse;
          console.log("시장 분석 완료:", {
            indices: Object.keys(analysisResult.market_data),
            analysisLength: analysisResult.analysis.length,
          });

          setMessages((prev) => [
            ...prev,
            {
              text: analysisResult.analysis,
              isUser: false,
              id: Date.now().toString(),
              createdAt: new Date(),
            },
          ]);
        } catch (error) {
          console.error("시장 분석 요청 실패:", error);
          await sendMessageToAssistant(userMessage);
        }
      } else {
        console.log("일반 대화 처리 - OpenAI Assistant 사용");
        await sendMessageToAssistant(userMessage);
      }

      setIsTyping(false);
    } catch (error) {
      console.error("메시지 전송 중 오류:", error);
      setIsTyping(false);
    }
  };

  const handleRetry = async (failedMessageId: string, messages: Message[]) => {
    // 실패한 메시지 찾기
    const failedMessage = messages.find((msg) => msg.id === failedMessageId);
    if (!failedMessage?.lastUserMessage) return;

    // 실패한 메시지 제거
    setMessages((prev) => prev.filter((msg) => msg.id !== failedMessageId));

    // 메시지 재전송
    await sendMessageToAssistant(failedMessage.lastUserMessage);
  };

  const loadThreadMessages = async (threadId: string) => {
    try {
      setIsLoading(true);
      console.log("이전 메시지 로딩 시작:", threadId);

      // 스레드가 실제로 존재하는지 먼저 확인
      try {
        await openai.beta.threads.retrieve(threadId);
      } catch (error: any) {
        console.error("스레드가 존재하지 않음:", threadId, error);
        // 스레드가 존재하지 않는 경우 로컬에서 제거
        const updatedThreads = threads.filter((t) => t.id !== threadId);
        setThreads(updatedThreads);
        await saveThreads(updatedThreads);

        setMessages([
          {
            text: "이 스레드는 더 이상 존재하지 않습니다. 새로운 대화를 시작해주세요.",
            isUser: false,
            id: Date.now().toString(),
            createdAt: new Date(),
          },
        ]);
        return;
      }

      const messagesList = await openai.beta.threads.messages.list(threadId);
      console.log("메시지 목록 받음:", messagesList.data.length + "개");

      // 메시지를 시간순으로 정렬 (오래된 메시지가 먼저 오도록)
      const formattedMessages = messagesList.data
        .filter((msg) => {
          const content = msg.content[0];
          return (
            content &&
            "type" in content &&
            content.type === "text" &&
            "text" in content &&
            "value" in content.text
          );
        })
        .map((msg) => {
          const content = msg.content[0];
          return {
            text:
              "text" in content && "value" in content.text
                ? content.text.value
                : "",
            isUser: msg.role === "user",
            id: msg.id,
            createdAt: new Date(msg.created_at * 1000),
          };
        })
        .reverse();

      console.log("메시지 변환 완료");
      setMessages(formattedMessages);
    } catch (error: any) {
      console.error("이전 메시지 로딩 중 오류:", error);

      if (error?.error?.code === "rate_limit_exceeded") {
        // rate limit 처리
        const shouldRetry = await handleRateLimit();
        if (shouldRetry) {
          return await loadThreadMessages(threadId);
        }
      } else if (error?.status === 404 || error?.error?.code === "not_found") {
        // 스레드가 존재하지 않는 경우
        const updatedThreads = threads.filter((t) => t.id !== threadId);
        setThreads(updatedThreads);
        await saveThreads(updatedThreads);

        setMessages([
          {
            text: "이 스레드는 더 이상 존재하지 않습니다. 새로운 대화를 시작해주세요.",
            isUser: false,
            id: Date.now().toString(),
            createdAt: new Date(),
          },
        ]);
      } else {
        setMessages([
          {
            text: "이전 메시지를 불러오는 중 오류가 발생했습니다.",
            isUser: false,
            id: Date.now().toString(),
            createdAt: new Date(),
          },
        ]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return {
    editingThreadId,
    setEditingThreadId,
    editingTitle,
    setEditingTitle,
    handleSend,
    handleRetry,
    loadThreadMessages,
  };
};
