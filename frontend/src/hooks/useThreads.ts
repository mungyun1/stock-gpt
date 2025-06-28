import { useState, useCallback, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Thread } from "../types/chat";
import {
  createThread,
  deleteThread as deleteOpenAIThread,
  getThread,
  getThreadMessages,
  updateThreadMetadata,
  generateThreadTitle,
  convertOpenAIThreadToAppThread,
} from "../utils/openai";

const THREADS_STORAGE_KEY = "@stock_gpt_threads";

export const useThreads = () => {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [threadId, setThreadId] = useState<string | null>(null);
  const [editingThreadId, setEditingThreadId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");

  // AsyncStorage에서 스레드 목록 로드
  const loadThreadsFromStorage = useCallback(async () => {
    try {
      const storedThreads = await AsyncStorage.getItem(THREADS_STORAGE_KEY);
      if (storedThreads) {
        const parsedThreads: Thread[] = JSON.parse(storedThreads);
        setThreads(parsedThreads);

        // 가장 최근 스레드 선택
        if (parsedThreads.length > 0 && !threadId) {
          const mostRecentThread = parsedThreads.sort(
            (a, b) =>
              new Date(b.created_at).getTime() -
              new Date(a.created_at).getTime()
          )[0];
          setThreadId(mostRecentThread.id);
        }
      }
    } catch (error) {
      console.error("스레드 로드 중 오류:", error);
    }
  }, [threadId]);

  // AsyncStorage에 스레드 목록 저장
  const saveThreadsToStorage = useCallback(async (threadsToSave: Thread[]) => {
    try {
      await AsyncStorage.setItem(
        THREADS_STORAGE_KEY,
        JSON.stringify(threadsToSave)
      );
    } catch (error) {
      console.error("스레드 저장 중 오류:", error);
    }
  }, []);

  // OpenAI에서 스레드 목록 동기화
  const syncThreadsWithOpenAI = useCallback(
    async (keepCurrentSelection = false) => {
      try {
        const existingThreadIds = threads.map((thread) => thread.id);

        if (existingThreadIds.length === 0) {
          console.log("저장된 스레드가 없음, 빈 상태로 시작");
          return;
        }

        // 각 스레드 ID에 대해 OpenAI에서 최신 정보 가져오기
        const threadPromises = existingThreadIds.map(async (threadId) => {
          try {
            // 스레드 정보 가져오기
            const threadData = await getThread(threadId);

            // 스레드의 최신 메시지 가져오기
            const messages = await getThreadMessages(threadId);
            let lastMessage = "";

            if (messages && messages.length > 0) {
              const latestMessage = messages[0];
              if (
                latestMessage.content &&
                latestMessage.content[0]?.type === "text"
              ) {
                lastMessage =
                  latestMessage.content[0].text.value.substring(0, 50) + "...";
              }
            }

            return convertOpenAIThreadToAppThread(threadData, lastMessage);
          } catch (error) {
            console.warn(`스레드 ${threadId} 처리 중 오류:`, error);
            return null;
          }
        });

        const loadedThreads = await Promise.all(threadPromises);
        const validThreads = loadedThreads.filter(
          (thread) => thread !== null
        ) as Thread[];

        if (validThreads.length === 0) {
          console.log("유효한 스레드가 없음, 빈 상태로 시작");
          return;
        }

        // 생성 시간 순으로 정렬 (최신순)
        const sortedThreads = validThreads.sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );

        setThreads(sortedThreads);
        await saveThreadsToStorage(sortedThreads);

        // 현재 선택을 유지하거나 가장 최근 스레드 선택
        if (!keepCurrentSelection || !threadId) {
          const mostRecentThread = sortedThreads[0];
          if (mostRecentThread) {
            setThreadId(mostRecentThread.id);
          }
        }
      } catch (error) {
        console.error("OpenAI 스레드 동기화 중 오류:", error);
        throw error;
      }
    },
    [threads, threadId, saveThreadsToStorage]
  );

  // 새 스레드 생성
  const createNewThread = useCallback(async () => {
    try {
      // 먼저 기존에 비어있는 "새로운 대화" 스레드가 있는지 확인
      const emptyNewThread = threads.find(
        (thread) => thread.title === "새로운 대화" && !thread.last_message
      );

      if (emptyNewThread) {
        console.log("기존 빈 스레드 사용:", emptyNewThread.id);
        setThreadId(emptyNewThread.id);
        return emptyNewThread.id;
      }

      // 빈 스레드가 없을 때만 새로 생성
      const newOpenAIThread = await createThread("새로운 대화");
      const newThread = convertOpenAIThreadToAppThread(newOpenAIThread);

      const updatedThreads = [newThread, ...threads];
      setThreads(updatedThreads);
      await saveThreadsToStorage(updatedThreads);

      setThreadId(newThread.id);
      console.log("새 스레드 생성 완료:", newThread.id);

      return newThread.id;
    } catch (error) {
      console.error("새 스레드 생성 중 오류:", error);
      throw error;
    }
  }, [threads, saveThreadsToStorage]);

  // 스레드 선택
  const selectThread = useCallback((thread: Thread) => {
    setThreadId(thread.id);
  }, []);

  // 스레드 삭제
  const deleteThread = useCallback(
    async (threadIdToDelete: string) => {
      try {
        // API 호출로 OpenAI에서 스레드 삭제
        await deleteOpenAIThread(threadIdToDelete);

        // 로컬 스레드 목록에서 삭제
        const updatedThreads = threads.filter((t) => t.id !== threadIdToDelete);
        setThreads(updatedThreads);
        await saveThreadsToStorage(updatedThreads);

        // 삭제된 스레드가 현재 활성 스레드인 경우 처리
        if (threadId === threadIdToDelete) {
          if (updatedThreads.length > 0) {
            // 가장 최근 스레드 선택
            const mostRecentThread = updatedThreads.sort(
              (a, b) =>
                new Date(b.created_at).getTime() -
                new Date(a.created_at).getTime()
            )[0];
            setThreadId(mostRecentThread.id);
            return mostRecentThread.id;
          } else {
            // 모든 스레드가 삭제된 경우 새 스레드 생성
            return await createNewThread();
          }
        }
      } catch (error) {
        console.error("스레드 삭제 중 오류:", error);

        // 오류가 발생해도 로컬에서는 제거
        const updatedThreads = threads.filter((t) => t.id !== threadIdToDelete);
        setThreads(updatedThreads);
        await saveThreadsToStorage(updatedThreads);

        if (threadId === threadIdToDelete) {
          if (updatedThreads.length > 0) {
            const mostRecentThread = updatedThreads.sort(
              (a, b) =>
                new Date(b.created_at).getTime() -
                new Date(a.created_at).getTime()
            )[0];
            setThreadId(mostRecentThread.id);
            return mostRecentThread.id;
          } else {
            return await createNewThread();
          }
        }
      }
    },
    [threads, threadId, saveThreadsToStorage, createNewThread]
  );

  // 스레드 제목 업데이트
  const updateThreadTitle = useCallback(
    async (threadId: string, lastMessage: string) => {
      try {
        const currentThread = threads.find((t) => t.id === threadId);
        if (!currentThread || currentThread.title !== "새로운 대화") {
          // 제목이 이미 설정되어 있거나 스레드를 찾을 수 없는 경우 마지막 메시지만 업데이트
          const updatedThreads = threads.map((thread) =>
            thread.id === threadId
              ? {
                  ...thread,
                  last_message: lastMessage.substring(0, 50) + "...",
                }
              : thread
          );
          setThreads(updatedThreads);
          await saveThreadsToStorage(updatedThreads);
          return;
        }

        const newTitle = await generateThreadTitle(lastMessage);

        if (newTitle === "새로운 대화") {
          console.warn("제목 생성에 실패하여 기존 제목을 유지합니다.");
          const updatedThreads = threads.map((thread) =>
            thread.id === threadId
              ? {
                  ...thread,
                  last_message: lastMessage.substring(0, 50) + "...",
                }
              : thread
          );
          setThreads(updatedThreads);
          await saveThreadsToStorage(updatedThreads);
          return;
        }

        // OpenAI 스레드 메타데이터 업데이트
        await updateThreadMetadata(threadId, newTitle, lastMessage);

        // 로컬 상태 업데이트
        const updatedThreads = threads.map((thread) =>
          thread.id === threadId
            ? {
                ...thread,
                title: newTitle,
                last_message: lastMessage.substring(0, 50) + "...",
              }
            : thread
        );
        setThreads(updatedThreads);
        await saveThreadsToStorage(updatedThreads);
      } catch (error) {
        console.error("스레드 제목 업데이트 중 오류:", error);

        // 오류 발생 시 마지막 메시지만 업데이트
        const updatedThreads = threads.map((thread) =>
          thread.id === threadId
            ? { ...thread, last_message: lastMessage.substring(0, 50) + "..." }
            : thread
        );
        setThreads(updatedThreads);
        await saveThreadsToStorage(updatedThreads);
      }
    },
    [threads, saveThreadsToStorage]
  );

  // 스레드 제목 편집 시작
  const startEditingTitle = useCallback((thread: Thread) => {
    setEditingThreadId(thread.id);
    setEditingTitle(thread.title);
  }, []);

  // 스레드 제목 저장
  const saveThreadTitle = useCallback(
    async (threadId: string, newTitle: string) => {
      if (!newTitle.trim()) {
        setEditingThreadId(null);
        setEditingTitle("");
        return;
      }

      try {
        const currentThread = threads.find((t) => t.id === threadId);
        await updateThreadMetadata(
          threadId,
          newTitle.trim(),
          currentThread?.last_message || ""
        );

        const updatedThreads = threads.map((thread) =>
          thread.id === threadId
            ? { ...thread, title: newTitle.trim() }
            : thread
        );
        setThreads(updatedThreads);
        await saveThreadsToStorage(updatedThreads);
      } catch (error) {
        console.error("스레드 제목 업데이트 중 오류:", error);
      } finally {
        setEditingThreadId(null);
        setEditingTitle("");
      }
    },
    [threads, saveThreadsToStorage]
  );

  // 스레드 제목 편집 취소
  const cancelEditingTitle = useCallback(() => {
    setEditingThreadId(null);
    setEditingTitle("");
  }, []);

  // 초기화 시 스레드 로드
  useEffect(() => {
    loadThreadsFromStorage();
  }, [loadThreadsFromStorage]);

  return {
    threads,
    threadId,
    editingThreadId,
    editingTitle,
    setEditingTitle,
    loadThreadsFromStorage,
    syncThreadsWithOpenAI,
    createNewThread,
    selectThread,
    deleteThread,
    updateThreadTitle,
    startEditingTitle,
    saveThreadTitle,
    cancelEditingTitle,
  };
};
