import { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import OpenAI from "openai";
import { Thread, Message } from "../types/chat";
import { generateThreadTitle } from "../utils/chatUtils";

const THREADS_STORAGE_KEY = "@stock_gpt_threads";

export const useThreadManager = (openai: OpenAI) => {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [threadId, setThreadId] = useState<string | null>(null);

  const saveThreads = async (updatedThreads: Thread[]) => {
    try {
      // 최신 순서로 정렬하여 저장
      const sortedThreads = updatedThreads.sort(
        (a: Thread, b: Thread) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

      await AsyncStorage.setItem(
        THREADS_STORAGE_KEY,
        JSON.stringify(sortedThreads)
      );
    } catch (error) {
      console.error("스레드 저장 중 오류:", error);
    }
  };

  const initializeThread = async () => {
    try {
      // 항상 최신 스레드 목록을 AsyncStorage에서 직접 읽음
      const storedThreads = await AsyncStorage.getItem(THREADS_STORAGE_KEY);
      let threadsFromStorage: Thread[] = [];
      if (storedThreads) {
        threadsFromStorage = JSON.parse(storedThreads).map(
          (thread: Thread) => ({
            ...thread,
            created_at: new Date(thread.created_at),
          })
        );
      }
      setThreads(threadsFromStorage);

      // 스레드가 있는 경우 가장 최근 스레드를 찾음
      if (threadsFromStorage.length > 0) {
        // 최신 순서로 정렬 (이미 정렬되어 있을 수도 있지만 확실히 하기 위해)
        const sortedThreads = threadsFromStorage.sort(
          (a: Thread, b: Thread) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );

        // 실제 대화가 있는 가장 최근 스레드를 찾음 (last_message가 있는 스레드 우선)
        let mostRecentThread = sortedThreads[0];

        // last_message가 있는 스레드가 있는지 확인
        const threadWithMessages = sortedThreads.find(
          (thread) => thread.last_message
        );
        if (threadWithMessages) {
          mostRecentThread = threadWithMessages;
        }

        // 가장 최근 스레드가 실제로 존재하는지 확인
        try {
          await openai.beta.threads.retrieve(mostRecentThread.id);
          console.log(
            "가장 최근 스레드로 이동:",
            mostRecentThread.title,
            mostRecentThread.id
          );
          setThreadId(mostRecentThread.id);
          return mostRecentThread.id;
        } catch (error: any) {
          console.log("가장 최근 스레드가 존재하지 않음, 새로 생성:", error);
          // 스레드가 존재하지 않으면 새로 생성
          const thread = await openai.beta.threads.create();
          const newThreadObj: Thread = {
            id: thread.id,
            title: "새로운 대화",
            created_at: new Date(),
          };
          const updatedThreads = [
            newThreadObj,
            ...threadsFromStorage.filter((t) => t.id !== mostRecentThread.id),
          ];
          setThreads(updatedThreads);
          setThreadId(thread.id);
          await saveThreads(updatedThreads);
          return thread.id;
        }
      } else {
        // 스레드가 없으면 새로 생성
        console.log("새로운 대화 스레드 생성");
        const thread = await openai.beta.threads.create();
        const newThreadObj: Thread = {
          id: thread.id,
          title: "새로운 대화",
          created_at: new Date(),
        };
        const updatedThreads = [newThreadObj];
        setThreads(updatedThreads);
        setThreadId(thread.id);
        await saveThreads(updatedThreads);
        return thread.id;
      }
    } catch (error) {
      console.error("스레드 초기화 중 오류:", error);
      // 오류 발생 시 빈 상태로 시작
      setThreadId(null);
      return null;
    }
  };

  const createNewThread = async () => {
    try {
      // 항상 최신 스레드 목록을 AsyncStorage에서 직접 읽음
      const storedThreads = await AsyncStorage.getItem(THREADS_STORAGE_KEY);
      let threadsFromStorage: Thread[] = [];
      if (storedThreads) {
        threadsFromStorage = JSON.parse(storedThreads).map(
          (thread: Thread) => ({
            ...thread,
            created_at: new Date(thread.created_at),
          })
        );
      }

      // 대화 내용이 없는 "새로운 대화" 스레드가 있는지 확인
      const emptyNewThread = threadsFromStorage.find(
        (thread) => thread.title === "새로운 대화" && !thread.last_message
      );

      if (emptyNewThread) {
        // 빈 "새로운 대화" 스레드가 있으면 실제로 존재하는지 확인
        try {
          await openai.beta.threads.retrieve(emptyNewThread.id);
          setThreadId(emptyNewThread.id);
          return emptyNewThread.id;
        } catch (error: any) {
          console.log("빈 스레드가 존재하지 않음, 새로 생성:", error);
          // 스레드가 존재하지 않으면 새로 생성
          const thread = await openai.beta.threads.create();
          const newThreadObj: Thread = {
            id: thread.id,
            title: "새로운 대화",
            created_at: new Date(),
          };
          const updatedThreads = [
            newThreadObj,
            ...threadsFromStorage.filter((t) => t.id !== emptyNewThread.id),
          ];
          setThreads(updatedThreads);
          setThreadId(thread.id);
          await saveThreads(updatedThreads);
          return thread.id;
        }
      } else {
        // 빈 "새로운 대화" 스레드가 없으면 새로 생성
        const thread = await openai.beta.threads.create();
        const newThreadObj: Thread = {
          id: thread.id,
          title: "새로운 대화",
          created_at: new Date(),
        };
        const updatedThreads = [newThreadObj, ...threadsFromStorage];
        setThreads(updatedThreads);
        setThreadId(thread.id);
        await saveThreads(updatedThreads);
        return thread.id;
      }
    } catch (error) {
      console.error("새 스레드 생성 중 오류:", error);
      return null;
    }
  };

  const updateThreadTitle = async (threadId: string, lastMessage: string) => {
    // 이미 제목이 있는 경우 마지막 메시지만 업데이트
    const updatedThreads = threads.map((thread) => {
      if (thread.id === threadId) {
        return {
          ...thread,
          last_message: lastMessage,
        };
      }
      return thread;
    });
    setThreads(updatedThreads);
    await saveThreads(updatedThreads);
  };

  const saveThreadTitle = async (threadId: string, newTitle: string) => {
    if (!newTitle.trim()) {
      return;
    }

    try {
      const updatedThreads = threads.map((thread) => {
        if (thread.id === threadId) {
          return {
            ...thread,
            title: newTitle.trim(),
          };
        }
        return thread;
      });

      setThreads(updatedThreads);
      await saveThreads(updatedThreads);
      console.log("스레드 제목 업데이트 완료:", newTitle);
    } catch (error) {
      console.error("스레드 제목 업데이트 중 오류:", error);
    }
  };

  const deleteThread = async (threadIdToDelete: string) => {
    try {
      // 스레드가 실제로 존재하는지 먼저 확인
      try {
        await openai.beta.threads.retrieve(threadIdToDelete);
      } catch (error: any) {
        console.log("스레드가 이미 존재하지 않음:", threadIdToDelete);
        // 스레드가 이미 삭제되었거나 존재하지 않는 경우 로컬에서만 제거
        const updatedThreads = threads.filter((t) => t.id !== threadIdToDelete);
        setThreads(updatedThreads);
        await saveThreads(updatedThreads);

        // 현재 선택된 스레드가 삭제된 경우
        if (threadId === threadIdToDelete) {
          if (updatedThreads.length > 0) {
            // 가장 최근 스레드로 이동
            const mostRecentThread = updatedThreads[0];
            setThreadId(mostRecentThread.id);
            return mostRecentThread.id;
          } else {
            // 스레드가 모두 삭제된 경우
            setThreadId(null);
            return null;
          }
        }
        return threadId;
      }

      // 스레드가 존재하면 삭제 시도
      await openai.beta.threads.delete(threadIdToDelete);
      console.log("스레드 삭제 성공:", threadIdToDelete);

      const updatedThreads = threads.filter((t) => t.id !== threadIdToDelete);
      setThreads(updatedThreads);
      await saveThreads(updatedThreads);

      // 현재 선택된 스레드가 삭제된 경우
      if (threadId === threadIdToDelete) {
        if (updatedThreads.length > 0) {
          // 가장 최근 스레드로 이동
          const mostRecentThread = updatedThreads[0];
          setThreadId(mostRecentThread.id);
          return mostRecentThread.id;
        } else {
          // 스레드가 모두 삭제된 경우
          setThreadId(null);
          return null;
        }
      }
      return threadId;
    } catch (error: any) {
      console.error("스레드 삭제 중 오류:", error);

      // 404 오류인 경우 로컬에서만 제거
      if (error?.status === 404 || error?.error?.code === "not_found") {
        console.log("스레드가 이미 삭제됨, 로컬에서만 제거");
        const updatedThreads = threads.filter((t) => t.id !== threadIdToDelete);
        setThreads(updatedThreads);
        await saveThreads(updatedThreads);

        // 현재 선택된 스레드가 삭제된 경우
        if (threadId === threadIdToDelete) {
          if (updatedThreads.length > 0) {
            const mostRecentThread = updatedThreads[0];
            setThreadId(mostRecentThread.id);
            return mostRecentThread.id;
          } else {
            setThreadId(null);
            return null;
          }
        }
      }
      return threadId;
    }
  };

  return {
    threads,
    threadId,
    setThreadId,
    initializeThread,
    createNewThread,
    updateThreadTitle,
    saveThreadTitle,
    deleteThread,
  };
};
