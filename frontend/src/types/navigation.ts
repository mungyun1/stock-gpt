export type RootTabParamList = {
  Chat: undefined;
  MarketNews: undefined;
  Calendar: undefined;
  StockStack: undefined;
  Home: undefined;
};

export type RootStackParamList = {
  StockCategory: undefined;
  StockList: { categoryId: string; categoryName: string };
};
