import { useInfiniteQuery, InfiniteData } from "@tanstack/react-query";
import { NewsCategory, NewsItem } from "../types/news";

const getSearchQuery = (category: NewsCategory): string => {
  switch (category) {
    case "semiconductor":
      return "(반도체 OR 삼성전자 OR SK하이닉스 OR 메모리 OR D램 OR 낸드플래시 OR HBM OR 시스템반도체) AND (주가 OR 실적 OR 전망 OR 개발)";
    case "ai":
      return "(인공지능 OR AI OR 네이버 OR 카카오 OR ChatGPT OR 초거대AI OR 머신러닝 OR 딥러닝) AND (기술 OR 서비스 OR 개발 OR 전망)";
    case "defense":
      return "(방산 OR 한화시스템 OR KAI OR 국방 OR 무기체계 OR 군사 OR 방위산업) AND (수주 OR 계약 OR 개발 OR 수출)";
    case "bio_pharma":
      return "(바이오 OR 제약 OR 셀트리온 OR 삼성바이오로직스 OR 신약 OR 임상시험 OR 의약품) AND (개발 OR 승인 OR 실적 OR 전망)";
    case "electric_vehicle":
      return "(전기차 OR 배터리 OR 현대차 OR 기아 OR LG에너지솔루션 OR 삼성SDI OR 테슬라) AND (개발 OR 생산 OR 판매 OR 전망)";
    case "renewable_energy":
      return "(신재생에너지 OR 태양광 OR 풍력 OR 한화큐셀 OR 두산에너빌리티 OR 태양전지) AND (설치 OR 발전 OR 사업 OR 전망)";
    case "fintech":
      return "(핀테크 OR 토스 OR 카카오페이 OR 네이버페이 OR 디지털화폐 OR 블록체인 OR 금융기술) AND (서비스 OR 투자 OR 사업 OR 전망)";
    default:
      return ""; // 전체 카테고리일 경우 빈 문자열 반환
  }
};

const fetchNewsData = async (
  category: NewsCategory,
  pageParam: number
): Promise<{ items: NewsItem[]; nextPage: number | null }> => {
  if (category === "all") {
    // 전체 카테고리일 경우 하나의 통합된 쿼리로 요청
    const combinedQuery = [
      "(반도체 OR 삼성전자 OR SK하이닉스 OR 인공지능 OR AI OR 네이버 OR 방산 OR 한화시스템 OR 바이오 OR 제약 OR 셀트리온 OR 전기차 OR 배터리 OR 현대차 OR LG에너지솔루션 OR 신재생에너지 OR 태양광 OR 핀테크 OR 토스)",
      "AND",
      "(주가 OR 실적 OR 전망 OR 개발 OR 기술 OR 서비스 OR 수주 OR 승인 OR 생산 OR 투자)",
    ].join(" ");

    const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(
      combinedQuery
    )}&language=ko&sortBy=publishedAt&page=${pageParam}&pageSize=18&apiKey=${
      process.env.EXPO_PUBLIC_NEWS_API_KEY
    }`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.status === "ok" && data.articles.length > 0) {
      const seenUrls = new Set<string>();
      const items = data.articles
        .filter((article: any) => {
          if (seenUrls.has(article.url)) {
            return false;
          }
          seenUrls.add(article.url);
          return true;
        })
        .map((article: any) => {
          // 기사 내용을 기반으로 카테고리 자동 분류
          let category: NewsCategory = "all";
          const content = (
            article.title +
            " " +
            article.description
          ).toLowerCase();

          if (
            content.includes("반도체") ||
            content.includes("메모리") ||
            content.includes("d램") ||
            content.includes("낸드") ||
            content.includes("sk하이닉스") ||
            (content.includes("삼성전자") &&
              (content.includes("반도체") || content.includes("메모리")))
          ) {
            category = "semiconductor";
          } else if (
            content.includes("인공지능") ||
            content.includes("ai") ||
            content.includes("머신러닝") ||
            content.includes("딥러닝") ||
            content.includes("초거대ai")
          ) {
            category = "ai";
          } else if (
            content.includes("방산") ||
            content.includes("한화시스템") ||
            content.includes("국방") ||
            content.includes("무기") ||
            content.includes("kai")
          ) {
            category = "defense";
          } else if (
            content.includes("바이오") ||
            content.includes("제약") ||
            content.includes("셀트리온") ||
            content.includes("신약") ||
            content.includes("임상")
          ) {
            category = "bio_pharma";
          } else if (
            content.includes("전기차") ||
            content.includes("배터리") ||
            content.includes("lg에너지솔루션") ||
            content.includes("삼성sdi") ||
            (content.includes("현대차") && content.includes("전기"))
          ) {
            category = "electric_vehicle";
          } else if (
            content.includes("태양광") ||
            content.includes("풍력") ||
            content.includes("신재생") ||
            content.includes("한화큐셀") ||
            content.includes("두산에너빌리티")
          ) {
            category = "renewable_energy";
          } else if (
            content.includes("핀테크") ||
            content.includes("토스") ||
            content.includes("카카오페이") ||
            content.includes("네이버페이") ||
            content.includes("금융기술")
          ) {
            category = "fintech";
          }

          return {
            id: `${category}-${article.url.split("/").pop() || Date.now()}`,
            title: article.title,
            summary: article.description || "내용 없음",
            source: article.source.name,
            date: article.publishedAt.split("T")[0],
            imageUrl: article.urlToImage || "https://picsum.photos/200/200",
            category,
            url: article.url,
          };
        });

      return {
        items,
        nextPage: items.length >= 12 ? pageParam + 1 : null,
      };
    }
  } else {
    // 특정 카테고리의 경우 기존 로직 유지
    const query = getSearchQuery(category);
    const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(
      query
    )}&language=ko&sortBy=publishedAt&page=${pageParam}&pageSize=10&apiKey=${
      process.env.EXPO_PUBLIC_NEWS_API_KEY
    }`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.status === "ok" && data.articles.length > 0) {
      const seenUrls = new Set<string>();
      const items = data.articles
        .filter((article: any) => {
          if (seenUrls.has(article.url)) {
            return false;
          }
          seenUrls.add(article.url);
          return true;
        })
        .map((article: any) => ({
          id: `${category}-${article.url.split("/").pop() || Date.now()}`,
          title: article.title,
          summary: article.description || "내용 없음",
          source: article.source.name,
          date: article.publishedAt.split("T")[0],
          imageUrl: article.urlToImage || "https://picsum.photos/200/200",
          category,
          url: article.url,
        }));

      return {
        items,
        nextPage: items.length === 10 ? pageParam + 1 : null,
      };
    }
  }

  throw new Error("뉴스를 찾을 수 없습니다");
};

type NewsResponse = {
  items: NewsItem[];
  nextPage: number | null;
};

export const useNewsQuery = (category: NewsCategory) => {
  return useInfiniteQuery<
    NewsResponse,
    Error,
    InfiniteData<NewsResponse>,
    [string, NewsCategory],
    number
  >({
    queryKey: ["news", category],
    queryFn: ({ pageParam = 1 }) => fetchNewsData(category, pageParam),
    getNextPageParam: (lastPage: NewsResponse) => lastPage.nextPage,
    initialPageParam: 1,
    staleTime: 1000 * 60 * 5, // 5분
    gcTime: 1000 * 60 * 30, // 30분
  });
};
