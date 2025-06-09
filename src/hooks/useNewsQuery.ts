import { useQuery } from "@tanstack/react-query";
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
      return "(주식 OR 증시 OR 가상자산) AND (뉴스 OR 전망 OR 이슈)";
  }
};

const fetchNewsData = async (category: NewsCategory): Promise<NewsItem[]> => {
  const query = getSearchQuery(category);

  const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(
    query
  )}&language=ko&sortBy=publishedAt&pageSize=20&apiKey=${
    process.env.NEWS_API_KEY
  }`;

  const response = await fetch(url);
  const data = await response.json();

  if (data.status === "ok" && data.articles.length > 0) {
    return data.articles.map((article: any, index: number) => ({
      id: `${category}-${index}`,
      title: article.title,
      summary: article.description || "내용 없음",
      source: article.source.name,
      time: new Date(article.publishedAt).toLocaleString("ko-KR", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
      imageUrl: article.urlToImage || "https://picsum.photos/200/200",
      category,
      url: article.url,
    }));
  }

  throw new Error("뉴스를 찾을 수 없습니다");
};

export const useNewsQuery = (category: NewsCategory) => {
  return useQuery({
    queryKey: ["news", category],
    queryFn: () => fetchNewsData(category),
    staleTime: 1000 * 60 * 5, // 5분
    gcTime: 1000 * 60 * 30, // 30분
  });
};
