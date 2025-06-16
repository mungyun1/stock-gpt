import { useRef, useEffect } from "react";
import { NativeScrollEvent } from "react-native";

interface UseNewsScrollProps {
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  fetchNextPage: () => Promise<any>;
}

export const useNewsScroll = ({
  hasNextPage,
  isFetchingNextPage,
  fetchNextPage,
}: UseNewsScrollProps) => {
  const scrollTimer = useRef<NodeJS.Timeout | null>(null);
  const isLoadingMore = useRef(false);

  const handleLoadMore = () => {
    if (!hasNextPage || isFetchingNextPage || isLoadingMore.current) {
      return;
    }

    isLoadingMore.current = true;
    fetchNextPage().finally(() => {
      isLoadingMore.current = false;
    });
  };

  const handleScroll = (event: NativeScrollEvent) => {
    if (scrollTimer.current) {
      clearTimeout(scrollTimer.current);
    }

    scrollTimer.current = setTimeout(() => {
      const { layoutMeasurement, contentOffset, contentSize } = event;
      const paddingToBottom = 50;
      const isCloseToBottom =
        layoutMeasurement.height + contentOffset.y >=
        contentSize.height - paddingToBottom;

      if (isCloseToBottom) {
        handleLoadMore();
      }
    }, 150);
  };

  useEffect(() => {
    return () => {
      if (scrollTimer.current) {
        clearTimeout(scrollTimer.current);
      }
    };
  }, []);

  return { handleScroll };
};
