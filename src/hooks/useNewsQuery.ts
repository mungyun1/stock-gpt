import { useInfiniteQuery, InfiniteData } from "@tanstack/react-query";
import { NewsCategory, NewsItem } from "../types/news";

const getSearchQuery = (category: NewsCategory): string => {
  switch (category) {
    case "us_market":
      return "(뉴욕증시 OR 다우존스 OR S&P500 OR 나스닥) AND (증시 OR 주가 OR 전망)";
    case "us_tech":
      return "(애플 OR 마이크로소프트 OR 구글 OR 메타 OR 엔비디아 OR 테슬라) AND (주가 OR 실적 OR 전망)";
    case "kr_kospi":
      return "(코스피 OR 삼성전자 OR SK하이닉스 OR LG에너지솔루션) AND (주가 OR 증시 OR 실적)";
    case "kr_kosdaq":
      return "(코스닥 OR 셀트리온 OR 에코프로 OR 카카오게임즈) AND (주가 OR 증시 OR 실적)";
    case "crypto_bitcoin":
      return "(비트코인 OR 가상자산) AND (시세 OR 가격 OR 전망)";
    case "crypto_altcoin":
      return "(이더리움 OR 리플 OR 솔라나 OR 알트코인) AND (시세 OR 가격 OR 전망)";
    default:
      return ""; // 전체 카테고리일 경우 빈 문자열 반환
  }
};

const fetchNewsData = async (
  category: NewsCategory,
  pageParam: number
): Promise<{ items: NewsItem[]; nextPage: number | null }> => {
  if (category === "all") {
    // 전체 카테고리일 경우 각 카테고리별로 2개씩 뉴스를 가져옴
    const categories: NewsCategory[] = [
      "us_market",
      "us_tech",
      "kr_kospi",
      "kr_kosdaq",
      "crypto_bitcoin",
      "crypto_altcoin",
    ];
    const allNews: NewsItem[] = [];
    const seenUrls = new Set<string>();

    for (const cat of categories) {
      const query = getSearchQuery(cat);
      const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(
        query
      )}&language=ko&sortBy=publishedAt&page=${pageParam}&pageSize=2&apiKey=${
        process.env.EXPO_PUBLIC_NEWS_API_KEY
      }`;

      const response = await fetch(url);
      const data = await response.json();

      if (data.status === "ok" && data.articles.length > 0) {
        const newsItems = data.articles
          .filter((article: any) => {
            // URL이 이미 있는지 확인하고, 없으면 추가
            if (seenUrls.has(article.url)) {
              return false;
            }
            seenUrls.add(article.url);
            return true;
          })
          .map((article: any) => ({
            id: `${cat}-${article.url.split("/").pop() || Date.now()}`,
            title: article.title,
            summary: article.description || "내용 없음",
            source: article.source.name,
            date: article.publishedAt.split("T")[0],
            imageUrl: article.urlToImage || "https://picsum.photos/200/200",
            category: cat,
            url: article.url,
          }));
        allNews.push(...newsItems);
      }
    }

    return {
      items: allNews,
      nextPage: allNews.length > 0 ? pageParam + 1 : null,
    };
  } else {
    // 특정 카테고리의 경우
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
