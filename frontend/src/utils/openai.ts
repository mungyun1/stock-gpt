import {
  OpenAIMessage,
  OpenAIThread,
  OpenAIRun,
  Thread,
  Message,
} from "../types/chat";

const ASSISTANT_ID = process.env.EXPO_PUBLIC_OPENAI_ASSISTANT_ID;
const OPENAI_API_KEY = process.env.EXPO_PUBLIC_OPENAI_API_KEY;
const OPENAI_BASE_URL = "https://api.openai.com/v1";

// Assistant ID 반환
export const getAssistantId = (): string | undefined => {
  return ASSISTANT_ID;
};

// OpenAI API 요청을 위한 헤더
export const getOpenAIHeaders = () => ({
  Authorization: `Bearer ${OPENAI_API_KEY}`,
  "Content-Type": "application/json",
  "OpenAI-Beta": "assistants=v2",
});

// 지연 함수
export const delay = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

// 새 스레드 생성
export const createThread = async (
  title: string = "새로운 대화"
): Promise<OpenAIThread> => {
  const response = await fetch(`${OPENAI_BASE_URL}/threads`, {
    method: "POST",
    headers: getOpenAIHeaders(),
    body: JSON.stringify({
      metadata: {
        title,
        last_message: "",
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to create thread: ${response.status}`);
  }

  return await response.json();
};

// 스레드 삭제
export const deleteThread = async (threadId: string): Promise<void> => {
  const response = await fetch(`${OPENAI_BASE_URL}/threads/${threadId}`, {
    method: "DELETE",
    headers: getOpenAIHeaders(),
  });

  if (!response.ok) {
    console.warn(`OpenAI 스레드 삭제 실패: ${response.status}`);
  }
};

// 스레드 정보 가져오기
export const getThread = async (threadId: string): Promise<OpenAIThread> => {
  const response = await fetch(`${OPENAI_BASE_URL}/threads/${threadId}`, {
    method: "GET",
    headers: getOpenAIHeaders(),
  });

  if (!response.ok) {
    throw new Error(`Failed to get thread: ${response.status}`);
  }

  return await response.json();
};

// 스레드의 메시지 목록 가져오기
export const getThreadMessages = async (
  threadId: string
): Promise<OpenAIMessage[]> => {
  const response = await fetch(
    `${OPENAI_BASE_URL}/threads/${threadId}/messages`,
    {
      method: "GET",
      headers: getOpenAIHeaders(),
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to load messages: ${response.status}`);
  }

  const messagesList = await response.json();
  return messagesList.data;
};

// 스레드에 메시지 추가
export const addMessageToThread = async (
  threadId: string,
  message: string
): Promise<OpenAIMessage> => {
  const response = await fetch(
    `${OPENAI_BASE_URL}/threads/${threadId}/messages`,
    {
      method: "POST",
      headers: getOpenAIHeaders(),
      body: JSON.stringify({
        role: "user",
        content: message,
      }),
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to create message: ${response.status}`);
  }

  return await response.json();
};

// Run 생성 및 실행
export const createAndRunAssistant = async (
  threadId: string
): Promise<OpenAIRun> => {
  const response = await fetch(`${OPENAI_BASE_URL}/threads/${threadId}/runs`, {
    method: "POST",
    headers: getOpenAIHeaders(),
    body: JSON.stringify({
      assistant_id: ASSISTANT_ID!,
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to create run: ${response.status}`);
  }

  return await response.json();
};

// Run 상태 확인
export const checkRunStatus = async (
  threadId: string,
  runId: string
): Promise<OpenAIRun> => {
  const response = await fetch(
    `${OPENAI_BASE_URL}/threads/${threadId}/runs/${runId}`,
    {
      method: "GET",
      headers: getOpenAIHeaders(),
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to check run status: ${response.status}`);
  }

  return await response.json();
};

// Run이 완료될 때까지 대기
export const waitForRunCompletion = async (
  threadId: string,
  runId: string
): Promise<OpenAIRun> => {
  let runStatus = await checkRunStatus(threadId, runId);

  while (runStatus.status === "in_progress" || runStatus.status === "queued") {
    await delay(1000);
    runStatus = await checkRunStatus(threadId, runId);
  }

  if (runStatus.status === "failed") {
    throw new Error(`Run failed: ${runStatus.last_error?.message}`);
  }

  return runStatus;
};

// 스레드 메타데이터 업데이트
export const updateThreadMetadata = async (
  threadId: string,
  title: string,
  lastMessage: string
): Promise<void> => {
  const response = await fetch(`${OPENAI_BASE_URL}/threads/${threadId}`, {
    method: "POST",
    headers: getOpenAIHeaders(),
    body: JSON.stringify({
      metadata: {
        title,
        last_message: lastMessage.substring(0, 50) + "...",
      },
    }),
  });

  if (!response.ok) {
    console.warn(`OpenAI 스레드 메타데이터 업데이트 실패: ${response.status}`);
  }
};

// 제목 생성
export const generateThreadTitle = async (message: string): Promise<string> => {
  try {
    const response = await fetch(`${OPENAI_BASE_URL}/chat/completions`, {
      method: "POST",
      headers: getOpenAIHeaders(),
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content:
              "사용자의 메시지를 바탕으로 간단하고 명확한 대화 제목을 생성해주세요. 제목은 15자 이내로 작성하고, 핵심 키워드를 포함해야 합니다.",
          },
          {
            role: "user",
            content: `다음 메시지에 대한 적절한 대화 제목을 생성해주세요: "${message}"`,
          },
        ],
        max_tokens: 50,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to generate title: ${response.status}`);
    }

    const data = await response.json();
    let title = data.choices?.[0]?.message?.content?.trim();

    // API 응답이 없거나 비어있는 경우 간단한 제목 생성
    if (!title) {
      title = message.substring(0, 15).trim();
      if (title.length < message.length) {
        title += "...";
      }
    }

    // 따옴표 제거 및 길이 제한
    const cleanTitle = title.replace(/^["']|["']$/g, "");
    return cleanTitle.length > 20
      ? cleanTitle.substring(0, 17) + "..."
      : cleanTitle;
  } catch (error) {
    console.error("제목 생성 중 오류:", error);
    const fallbackTitle = message.substring(0, 15).trim();
    return fallbackTitle.length < message.length
      ? fallbackTitle + "..."
      : fallbackTitle;
  }
};

// OpenAI 메시지를 앱 메시지로 변환
export const convertOpenAIMessagesToAppMessages = (
  openAIMessages: OpenAIMessage[]
): Message[] => {
  return openAIMessages
    .map((msg) => ({
      id: msg.id,
      text: msg.content[0].type === "text" ? msg.content[0].text.value : "",
      isUser: msg.role === "user",
      createdAt: new Date(msg.created_at * 1000),
    }))
    .reverse();
};

// Thread 형태로 변환
export const convertOpenAIThreadToAppThread = (
  openAIThread: OpenAIThread,
  lastMessage?: string
): Thread => {
  return {
    id: openAIThread.id,
    title: openAIThread.metadata?.title || "새로운 대화",
    created_at: new Date(openAIThread.created_at * 1000),
    last_message: lastMessage,
  };
};
