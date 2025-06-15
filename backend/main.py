from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import yfinance as yf
from openai import OpenAI
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI()

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8081"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class StockRequest(BaseModel):
    ticker: str

class MarketRequest(BaseModel):
    indices: list[str] = ["^GSPC", "^IXIC", "^KS11"]  # S&P500, NASDAQ, KOSPI
    lookback_days: Optional[int] = 30  # 분석할 기간(일)
    include_news: Optional[bool] = True  # 뉴스 데이터 포함 여부

def build_prompt_from_data(data: dict, ticker: str) -> str:
    return f"""
당신은 워렌 버핏 스타일의 가치투자 분석가입니다.
아래는 {data.get('longName')}({ticker})의 주요 지표입니다:

📌 산업/지역: {data.get("industry")} / {data.get("country")}
💰 현재가: {data.get("currentPrice")}, 시가총액: {data.get("marketCap")}
📈 PER: {data.get("trailingPE")}, EPS: {data.get("trailingEps")}
📊 ROE: {data.get("returnOnEquity")}, 부채비율: {data.get("debtToEquity")}
💸 잉여현금흐름: {data.get("freeCashflow")}
📉 52주 최고/최저: {data.get("fiftyTwoWeekHigh")} / {data.get("fiftyTwoWeekLow")}

이 기업이 소비자독점기업 특성(브랜드, 가격 결정력 등)을 가지고 있는지 평가하고, 지금 매수 타이밍이 적절한지 다음 기준에 따라 분석해주세요:

- 브랜드 장벽, 제품 독점력
- 재무 건전성: ROE, 부채비율, EPS 추세
- 밸류에이션 적정성: PER 기준
- 산업과 경쟁사 비교
- 최근 매크로 환경(금리, 환율, 정책 등) 고려

분석 결과를 마치 애널리스트 보고서처럼 표와 요약으로 정리해 주세요.
"""

def get_market_data(indices: list[str], lookback_days: int) -> dict:
    market_data = {}
    
    for index in indices:
        try:
            ticker = yf.Ticker(index)
            info = ticker.info
            hist = ticker.history(period=f"{lookback_days}d")
            
            market_data[index] = {
                "name": info.get("shortName", index),
                "current_price": info.get("regularMarketPrice", 0),
                "change_percent": info.get("regularMarketChangePercent", 0),
                "previous_close": info.get("regularMarketPreviousClose", 0),
                "volume": info.get("regularMarketVolume", 0),
                "price_history": hist["Close"].tolist() if not hist.empty else [],
                "volume_history": hist["Volume"].tolist() if not hist.empty else []
            }
        except Exception as e:
            print(f"Error fetching data for {index}: {str(e)}")
            market_data[index] = {"error": f"데이터 조회 실패: {str(e)}"}
    
    # 미국 10년 국채 수익률
    try:
        treasury = yf.Ticker("^TNX")
        market_data["US10Y"] = {
            "rate": treasury.info.get("regularMarketPrice", 0),
            "change": treasury.info.get("regularMarketChange", 0)
        }
    except Exception as e:
        market_data["US10Y"] = {"error": f"금리 데이터 조회 실패: {str(e)}"}
    
    # USD/KRW 환율
    try:
        usdkrw = yf.Ticker("KRW=X")
        market_data["USDKRW"] = {
            "rate": usdkrw.info.get("regularMarketPrice", 0),
            "change": usdkrw.info.get("regularMarketChange", 0)
        }
    except Exception as e:
        market_data["USDKRW"] = {"error": f"환율 데이터 조회 실패: {str(e)}"}
    
    return market_data

@app.post("/analyze")
async def analyze_stock(request: StockRequest):
    try:
        # yfinance로 데이터 수집
        ticker = yf.Ticker(request.ticker)
        stock_info = ticker.info

        # OpenAI API를 통한 분석
        client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
        
        prompt = build_prompt_from_data(stock_info, request.ticker)
        
        completion = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": """당신은 워렌 버핏 스타일의 가치투자 전문가입니다. 
주식 분석 시 다음 사항을 중점적으로 살펴봅니다:
1. 기업의 경쟁우위와 소비자독점력
2. 재무건전성과 수익성
3. 적정주가와 투자매력도
4. 산업 내 경쟁력과 시장지배력
5. 리스크 요인과 대응방안

분석은 항상 데이터에 기반하여 객관적이고 전문적으로 제시합니다."""},
                {"role": "user", "content": prompt}
            ]
        )

        analysis = completion.choices[0].message.content

        return {
            "stock_info": stock_info,
            "analysis": analysis
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/market-analyze")
async def analyze_market(request: MarketRequest):
    try:
        # yfinance를 통해 시장 데이터 수집
        market_data = get_market_data(request.indices, request.lookback_days or 30)
        
        # 프롬프트 생성
        prompt = f"""
당신은 글로벌 경제 및 금융시장 전문가입니다.
아래는 현재 시장의 주요 지표입니다:

[주요 지수 현황]
"""
        # 주요 지수 데이터 추가
        for index, data in market_data.items():
            if index not in ["US10Y", "USDKRW"]:
                if "error" not in data:
                    prompt += f"""
• {data['name']} ({index})
  - 현재가: {data['current_price']:,.2f}
  - 등락률: {data['change_percent']:,.2f}%
  - 거래량: {data['volume']:,.0f}
"""

        # 금리와 환율 데이터 추가
        us10y = market_data.get("US10Y", {})
        usdkrw = market_data.get("USDKRW", {})
        
        prompt += f"""
[금리 및 환율]
• 미국 10년 국채 수익률: {us10y.get('rate', 'N/A')}% (변동: {us10y.get('change', 'N/A')}%p)
• USD/KRW 환율: {usdkrw.get('rate', 'N/A'):,.2f}원 (변동: {usdkrw.get('change', 'N/A'):,.2f}원)

위 데이터를 바탕으로 다음 사항을 분석해주세요:
1. 글로벌 주식시장 동향 및 투자심리
2. 금리와 환율이 시장에 미치는 영향
3. 주요 위험요인과 기회요인
4. 단기 및 중기 시장 전망
5. 투자자들이 주목해야 할 핵심 포인트

전문가 리포트 형식으로 작성해주세요.
"""

        client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
        completion = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": """당신은 글로벌 금융시장 전문가입니다.
시장 분석 시 다음 요소들을 종합적으로 고려합니다:
1. 주요국 증시 동향과 상관관계
2. 금리/환율 변동이 시장에 미치는 영향
3. 글로벌 거시경제 흐름
4. 주요 위험요인과 기회요인
5. 자산군별 투자 전략

분석은 항상 최신 데이터에 기반하여 객관적이고 전문적으로 제시합니다."""},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7
        )
        
        analysis = completion.choices[0].message.content
        
        return {
            "market_data": market_data,
            "analysis": analysis
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
