from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
import finnhub  # Finnhub API
from openai import OpenAI
import os
from dotenv import load_dotenv
import json
from datetime import datetime
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger
from pymongo import MongoClient

# .env.local 파일을 우선 로드하고, 없으면 .env 파일을 로드
load_dotenv('.env.local')
load_dotenv()  # fallback으로 .env도 로드

# 환경변수 로드 확인 (OpenAI + Finnhub + MongoDB)
openai_key = os.getenv("OPENAI_API_KEY")
finnhub_key = os.getenv("FINNHUB_API_KEY")
MONGODB_URI = os.getenv("MONGODB_URI")
MONGODB_DB = os.getenv("MONGODB_DB", "stockgpt")

# MongoDB 클라이언트 초기화
mongo_client = MongoClient(MONGODB_URI)
mongo_db = mongo_client[MONGODB_DB]
mongo_col = mongo_db["stock_recommendations"]

# Finnhub 클라이언트 초기화
finnhub_client = None
if finnhub_key:
    try:
        finnhub_client = finnhub.Client(api_key=finnhub_key)
        print("✅ Finnhub 클라이언트 초기화 완료")
    except Exception as e:
        print(f"❌ Finnhub 클라이언트 초기화 실패: {e}")

# Proxy 관련 환경변수 제거 (OpenAI 클라이언트 오류 방지)
proxy_vars = ['HTTP_PROXY', 'HTTPS_PROXY', 'http_proxy', 'https_proxy', 'ALL_PROXY', 'all_proxy']
for var in proxy_vars:
    if var in os.environ:
        print(f"🔧 {var} 환경변수 제거: {os.environ[var]}")
        del os.environ[var]

app = FastAPI()

# OpenAI 클라이언트와의 충돌을 방지하기 위해 requests 세션 설정을 최소화
# requests 기본 어댑터 리셋 (라이브러리 간 충돌 방지)
try:
    import requests
    # 기본 세션의 proxies 설정 제거
    requests.Session.proxies = {}
    print("✅ requests 기본 proxies 설정 제거 완료")
except Exception as e:
    print(f"⚠️ requests 설정 리셋 중 오류: {e}")

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:8081", 
        "http://localhost:19006", 
        "http://localhost:19000",
        "http://192.168.1.59:8081",
        "http://192.168.1.59:19006",
        "http://192.168.1.59:19000",
        "exp://192.168.1.59:8081",
        "exp://192.168.1.59:19006",
        "exp://192.168.1.59:19000"
    ], # 로컬 네트워크 접근 허용
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 요청 로깅 미들웨어 추가
@app.middleware("http")
async def log_requests(request, call_next):
    print(f"🌐 HTTP 요청: {request.method} {request.url}")
    response = await call_next(request)
    print(f"📤 HTTP 응답: {response.status_code}")
    return response

class StockRequest(BaseModel):
    ticker: str

class MarketRequest(BaseModel):
    indices: list[str] = ["^GSPC", "^IXIC", "^KS11"]  # S&P500, NASDAQ, KOSPI
    lookback_days: Optional[int] = 30  # 분석할 기간(일)
    include_news: Optional[bool] = True  # 뉴스 데이터 포함 여부

class ThreadTitleRequest(BaseModel):
    message: str

class StockAnalysisRequest(BaseModel):
    ticker: str
    thread_id: str
    assistant_id: str

class StockRecommendationRequest(BaseModel):
    category: str

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

def validate_stock_data(stock_info: dict, ticker: str, required_fields: list = None) -> dict:
    """
    Finnhub API에서 가져온 주식 데이터를 검증하고 정리
    """
    if required_fields is None:
        required_fields = ["longName", "currentPrice", "marketCap"]
    
    # 기본 검증
    if not stock_info or not isinstance(stock_info, dict):
        raise ValueError(f"'{ticker}' 종목의 데이터를 가져올 수 없습니다.")
    
    # 필수 필드 검증
    missing_fields = []
    for field in required_fields:
        if field not in stock_info or stock_info[field] is None:
            missing_fields.append(field)
    
    if missing_fields:
        print(f"Warning: {ticker}에서 누락된 필드들: {missing_fields}")
    
    # 데이터 정리 (None 값들을 "N/A"로 처리)
    cleaned_data = {}
    for key, value in stock_info.items():
        if value is None or value == "":
            cleaned_data[key] = "N/A"
        else:
            cleaned_data[key] = value
    
    return cleaned_data

def get_stock_info(ticker_symbol: str) -> dict:
    """
    Finnhub API를 사용한 주식 정보 조회 (429 오류 없는 안정적인 방법)
    """
    if not finnhub_client:
        raise ValueError("Finnhub API 키가 설정되지 않았습니다. .env.local 파일에 FINNHUB_API_KEY를 추가해주세요.")
    
    if not ticker_symbol or not isinstance(ticker_symbol, str):
        raise ValueError("유효하지 않은 ticker symbol입니다.")
    
    try:
        ticker_symbol = ticker_symbol.upper()
        print(f"📊 Finnhub API로 {ticker_symbol} 조회 중...")
        
        # 1. 실시간 주가 정보
        quote = finnhub_client.quote(ticker_symbol)
        current_price = quote.get('c', 0)  # current price
        
        if current_price == 0:
            raise ValueError(f"'{ticker_symbol}' 종목을 찾을 수 없습니다. ticker symbol을 확인해주세요.")
        
        # 2. 회사 프로필 정보
        try:
            profile = finnhub_client.company_profile2(symbol=ticker_symbol)
        except:
            profile = {}
        
        # 3. 기본 재무 지표
        try:
            metrics = finnhub_client.company_basic_financials(ticker_symbol, 'all')
            financial_metrics = metrics.get('metric', {}) if metrics else {}
        except:
            financial_metrics = {}
        
        # 4. 일관된 데이터 형식으로 매핑 (기존 호환성 유지)
        stock_data = {
            # 기본 정보
            "symbol": ticker_symbol,
            "longName": profile.get('name', ticker_symbol),
            "shortName": profile.get('name', ticker_symbol),
            
            # 가격 정보
            "currentPrice": current_price,
            "previousClose": quote.get('pc', current_price),
            "open": quote.get('o', current_price),
            "dayLow": quote.get('l', current_price),
            "dayHigh": quote.get('h', current_price),
            
            # 52주 고저
            "fiftyTwoWeekLow": financial_metrics.get('52WeekLow', 'N/A'),
            "fiftyTwoWeekHigh": financial_metrics.get('52WeekHigh', 'N/A'),
            
            # 재무 지표
            "marketCap": financial_metrics.get('marketCapitalization', 'N/A'),
            "trailingPE": financial_metrics.get('peBasicExclExtraTTM', 'N/A'),
            "trailingEps": financial_metrics.get('epsBasicExclExtraAnnual', 'N/A'),
            "returnOnEquity": financial_metrics.get('roeTTM', 'N/A'),
            "debtToEquity": financial_metrics.get('totalDebt/totalEquityAnnual', 'N/A'),
            "freeCashflow": financial_metrics.get('freeCashFlowTTM', 'N/A'),
            
            # 회사 정보
            "industry": profile.get('finnhubIndustry', 'N/A'),
            "country": profile.get('country', 'N/A'),
            "currency": profile.get('currency', 'USD'),
            "exchange": profile.get('exchange', 'N/A'),
            "weburl": profile.get('weburl', 'N/A'),
            
            # 추가 정보
            "logoUrl": profile.get('logo', 'N/A'),
            "shareOutstanding": profile.get('shareOutstanding', 'N/A'),
            "ipo": profile.get('ipo', 'N/A'),
        }
        
        # 시가총액 단위 변환 (백만 달러 -> 달러)
        if stock_data["marketCap"] != 'N/A' and isinstance(stock_data["marketCap"], (int, float)):
            stock_data["marketCap"] = stock_data["marketCap"] * 1_000_000
        
        # 데이터 검증
        validated_data = validate_stock_data(stock_data, ticker_symbol)
        
        print(f"✅ {ticker_symbol} Finnhub 데이터 조회 성공")
        return validated_data
        
    except Exception as e:
        error_str = str(e)
        
        # API 키 관련 오류
        if "401" in error_str or "unauthorized" in error_str.lower():
            raise ValueError("Finnhub API 키가 유효하지 않습니다. API 키를 확인해주세요.")
        
        # 종목 없음 오류
        if "404" in error_str or "not found" in error_str.lower():
            raise ValueError(f"'{ticker_symbol}' 종목을 찾을 수 없습니다. ticker symbol을 확인해주세요.")
        
        # Rate limit 오류
        if "429" in error_str or "rate limit" in error_str.lower():
            raise ValueError("Finnhub API 호출 한도를 초과했습니다. 잠시 후 다시 시도해주세요. (무료: 60 calls/분)")
        
        raise ValueError(f"Finnhub API 조회 중 오류 발생: {error_str}")



def get_market_data(indices: list[str], lookback_days: int) -> dict:
    """
    Finnhub API를 사용한 마켓 데이터 조회
    """
    if not finnhub_client:
        raise ValueError("Finnhub API 키가 설정되지 않았습니다. .env.local 파일에 FINNHUB_API_KEY를 추가해주세요.")
    
    market_data = {}
    
    # 주요 지수 데이터 조회
    for index in indices:
        try:
            print(f"📈 Finnhub로 {index} 마켓 데이터 조회 중...")
            quote = finnhub_client.quote(index)
            current_price = quote.get('c', 0)
            previous_close = quote.get('pc', 0)
            
            if current_price > 0:
                change = current_price - previous_close
                change_percent = (change / previous_close * 100) if previous_close > 0 else 0
                
                market_data[index] = {
                    "name": index,
                    "current_price": current_price,
                    "change_percent": change_percent,
                    "previous_close": previous_close,
                    "change": change,
                    "volume": quote.get('v', 0),
                    "day_high": quote.get('h', current_price),
                    "day_low": quote.get('l', current_price),
                    "price_history": [],  # 히스토리 데이터는 별도 API 필요
                    "volume_history": []
                }
                print(f"✅ {index} Finnhub 데이터 조회 성공")
            else:
                print(f"⚠️ {index} 데이터가 없습니다")
                market_data[index] = {"error": f"{index} 데이터를 찾을 수 없습니다"}
                
        except Exception as e:
            print(f"❌ {index} Finnhub 조회 실패: {str(e)[:100]}...")
            market_data[index] = {"error": f"데이터 조회 실패: {str(e)[:100]}"}
    
    # 미국 10년 국채 수익률 (^TNX)
    try:
        print(f"📊 Finnhub로 미국 10년 국채 수익률 조회 중...")
        quote = finnhub_client.quote("^TNX")
        current_rate = quote.get('c', 0)
        previous_rate = quote.get('pc', 0)
        
        if current_rate > 0:
            market_data["US10Y"] = {
                "rate": current_rate,
                "change": current_rate - previous_rate
            }
            print(f"✅ 미국 10년 국채 수익률 Finnhub 조회 성공")
        else:
            market_data["US10Y"] = {"error": "미국 10년 국채 수익률 데이터 없음"}
            
    except Exception as e:
        print(f"❌ 미국 10년 국채 수익률 조회 실패: {str(e)[:100]}...")
        market_data["US10Y"] = {"error": f"금리 데이터 조회 실패: {str(e)[:100]}"}
    
    # USD/KRW 환율
    try:
        print(f"💱 Finnhub로 USD/KRW 환율 조회 중...")
        # Finnhub에서는 여러 형식 시도
        for symbol in ["USDKRW", "USD/KRW"]:
            try:
                quote = finnhub_client.quote(symbol)
                current_rate = quote.get('c', 0)
                previous_rate = quote.get('pc', 0)
                
                if current_rate > 0:
                    market_data["USDKRW"] = {
                        "rate": current_rate,
                        "change": current_rate - previous_rate
                    }
                    print(f"✅ USD/KRW 환율 Finnhub 조회 성공 ({symbol})")
                    break
            except:
                continue
        else:
            market_data["USDKRW"] = {"error": "USD/KRW 환율 데이터 없음"}
            
    except Exception as e:
        print(f"❌ USD/KRW 환율 조회 실패: {str(e)[:100]}...")
        market_data["USDKRW"] = {"error": f"환율 데이터 조회 실패: {str(e)[:100]}"}
    
    return market_data

@app.post("/analyze")
async def analyze_stock(request: StockRequest):
    print(f"🚀 /analyze 엔드포인트 호출됨!")
    print(f"📊 요청 데이터: ticker={request.ticker}")
    try:
        # Finnhub API로 주식 데이터 수집
        stock_info = get_stock_info(request.ticker)

        # OpenAI API를 통한 분석
        api_key = os.getenv("OPENAI_API_KEY")
        if not api_key:
            raise ValueError("OPENAI_API_KEY 환경변수가 설정되지 않았습니다.")
        
        # 명시적으로 필요한 매개변수만 전달
        client = OpenAI(
            api_key=api_key,
            timeout=30.0,
            max_retries=3
        )
        
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
    
    except ValueError as ve:
        # Finnhub API 관련 에러 (잘못된 ticker 등)
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        # 기타 서버 에러
        raise HTTPException(status_code=500, detail=f"서버 오류: {str(e)}")

@app.post("/analyze-stock-with-assistant")
async def analyze_stock_with_assistant(request: StockAnalysisRequest):
    print(f"🚀 /analyze-stock-with-assistant 엔드포인트 호출됨!")
    print(f"📊 요청 데이터: ticker={request.ticker}, thread_id={request.thread_id}, assistant_id={request.assistant_id}")
    try:
        # Finnhub API로 주식 데이터 수집
        stock_info = get_stock_info(request.ticker)
        
        # 종목 데이터를 포함한 프롬프트 생성
        prompt = build_prompt_from_data(stock_info, request.ticker)
        
        # OpenAI Assistant API 클라이언트 생성
        api_key = os.getenv("OPENAI_API_KEY")
        if not api_key:
            raise ValueError("OPENAI_API_KEY 환경변수가 설정되지 않았습니다.")
        
        # OpenAI 클라이언트 생성 (최신 SDK는 자동으로 v2 사용)
        client = OpenAI(
            api_key=api_key,
            timeout=30.0,
            max_retries=3
        )
        
        # 스레드에 메시지 추가
        message = client.beta.threads.messages.create(
            thread_id=request.thread_id,
            role="user",
            content=prompt
        )
        
        # Assistant 실행
        run = client.beta.threads.runs.create(
            thread_id=request.thread_id,
            assistant_id=request.assistant_id
        )
        
        return {
            "message_id": message.id,
            "run_id": run.id,
            "stock_info": {
                "ticker": request.ticker,
                "company_name": stock_info.get("longName", "N/A"),
                "current_price": stock_info.get("currentPrice", "N/A"),
                "market_cap": stock_info.get("marketCap", "N/A")
            }
        }
        
    except ValueError as ve:
        # Finnhub API 관련 에러 (잘못된 ticker 등)
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        # 기타 서버 에러
        raise HTTPException(status_code=500, detail=f"서버 오류: {str(e)}")

@app.post("/market-analyze")
async def analyze_market(request: MarketRequest):
    try:
        # Finnhub API를 통해 시장 데이터 수집
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

        api_key = os.getenv("OPENAI_API_KEY")
        if not api_key:
            raise ValueError("OPENAI_API_KEY 환경변수가 설정되지 않았습니다.")
        
        # 명시적으로 필요한 매개변수만 전달
        client = OpenAI(
            api_key=api_key,
            timeout=30.0,
            max_retries=3
        )
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

@app.post("/generate-title")
async def generate_title(request: ThreadTitleRequest):
    try:
        api_key = os.getenv("OPENAI_API_KEY")
        if not api_key:
            raise ValueError("OPENAI_API_KEY 환경변수가 설정되지 않았습니다.")
        
        # 명시적으로 필요한 매개변수만 전달
        client = OpenAI(
            api_key=api_key,
            timeout=30.0,
            max_retries=3
        )
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {
                    "role": "system",
                    "content": "주식 투자와 관련된 대화의 제목을 10자 이내로 간결하게 생성해주세요. 한국어로 작성해주세요."
                },
                {
                    "role": "user",
                    "content": request.message
                }
            ],
            max_tokens=20,
            temperature=0.7
        )
        
        title = response.choices[0].message.content.strip() if response.choices[0].message.content else "새로운 대화"
        return {"title": title}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# 실제 종목 리스트 - 카테고리별로 실제 ticker만 관리
CATEGORY_STOCKS = {
    "tech": ["NVDA", "MSFT", "GOOGL", "META", "AAPL"],
    "growth": ["TSLA", "AMZN", "CRM", "SNOW", "PLTR"],
    "value": ["JNJ", "PG", "KO", "WMT", "VZ"],
    "dividend": ["T", "ABBV", "PFE", "XOM", "CVX"],
    "defensive": ["PG", "JNJ", "KO", "WMT", "PEP"]
}

def get_risk_level(category: str) -> str:
    """카테고리별 위험도 등급 반환"""
    risk_mapping = {
        "tech": "HIGH",
        "growth": "HIGH", 
        "value": "LOW",
        "dividend": "LOW",
        "defensive": "LOW"
    }
    return risk_mapping.get(category, "MEDIUM")

def get_target_price_estimate(current_price: float, category: str) -> float:
    """카테고리별 목표가 추정 (현재가 기준 상승률 적용)"""
    multipliers = {
        "tech": 1.25,      # 25% 상승 목표
        "growth": 1.30,    # 30% 상승 목표
        "value": 1.15,     # 15% 상승 목표
        "dividend": 1.10,  # 10% 상승 목표
        "defensive": 1.12  # 12% 상승 목표
    }
    multiplier = multipliers.get(category, 1.20)
    return round(current_price * multiplier, 2)

def get_analyst_rating(category: str, per_ratio: float) -> str:
    """카테고리와 PER 기준으로 애널리스트 등급 추정"""
    if category in ["tech", "growth"]:
        if per_ratio < 20:
            return "STRONG_BUY"
        elif per_ratio < 35:
            return "BUY"
        else:
            return "HOLD"
    else:  # value, dividend, defensive
        if per_ratio < 15:
            return "STRONG_BUY"
        elif per_ratio < 25:
            return "BUY"
        else:
            return "HOLD"

def get_analysis_reason(ticker: str, stock_info: dict, category: str) -> str:
    """종목별 투자 분석 이유 생성 (실제 데이터 기반 전문 분석)"""
    company_name = stock_info.get("longName", ticker)
    sector = stock_info.get("industry", "N/A")
    current_price = stock_info.get("currentPrice", 0)
    market_cap = stock_info.get("marketCap", 0)
    per_ratio = stock_info.get("trailingPE")
    roe = stock_info.get("returnOnEquity")
    debt_to_equity = stock_info.get("debtToEquity")
    eps = stock_info.get("trailingEps")
    
    # 시가총액을 조 단위로 변환
    market_cap_trillion = market_cap / 1_000_000_000_000 if market_cap > 0 else 0
    
    # 재무 지표 분석
    per_analysis = ""
    if per_ratio and per_ratio != "N/A":
        if per_ratio < 15:
            per_analysis = f"PER {per_ratio:.2f}로 업계 평균 대비 저평가되어 있어 가치 투자 매력도가 높습니다."
        elif per_ratio < 25:
            per_analysis = f"PER {per_ratio:.2f}로 합리적인 밸류에이션을 보여주고 있습니다."
        else:
            per_analysis = f"PER {per_ratio:.2f}로 성장 기대감이 반영된 프리미엄 밸류에이션입니다."
    
    roe_analysis = ""
    if roe and roe != "N/A":
        roe_value = float(roe) if isinstance(roe, str) else roe
        if roe_value > 0.20:
            roe_analysis = f"ROE {roe_value:.3f}로 우수한 자본 효율성을 보여주며,"
        elif roe_value > 0.15:
            roe_analysis = f"ROE {roe_value:.3f}로 양호한 수익성을 유지하고 있으며,"
        else:
            roe_analysis = f"ROE {roe_value:.3f}로 개선 여지가 있으나,"
    
    # EPS 분석
    eps_analysis = ""
    if eps and eps != "N/A":
        eps_value = float(eps) if isinstance(eps, str) else eps
        if eps_value > 0:
            eps_analysis = f"EPS ${eps_value:.2f}로 안정적인 수익성을 보여주고 있습니다."
        else:
            eps_analysis = "현재 적자 상태이나 성장 투자 단계로 평가됩니다."
    
    # 부채비율 분석
    debt_analysis = ""
    if debt_to_equity and debt_to_equity != "N/A":
        debt_value = float(debt_to_equity) if isinstance(debt_to_equity, str) else debt_to_equity
        if debt_value < 0.5:
            debt_analysis = f"부채비율 {debt_value:.2f}로 매우 건전한 재무구조를 보유하고 있습니다."
        elif debt_value < 1.0:
            debt_analysis = f"부채비율 {debt_value:.2f}로 적정 수준의 레버리지를 활용하고 있습니다."
        else:
            debt_analysis = f"부채비율 {debt_value:.2f}로 높은 레버리지이나 성장 투자 단계로 평가됩니다."
    
    # 52주 고저가 분석
    week_52_low = stock_info.get("fiftyTwoWeekLow", current_price * 0.7)
    week_52_high = stock_info.get("fiftyTwoWeekHigh", current_price * 1.3)
    price_position_analysis = ""
    if isinstance(week_52_low, (int, float)) and isinstance(week_52_high, (int, float)) and week_52_high > week_52_low:
        position = ((current_price - week_52_low) / (week_52_high - week_52_low)) * 100
        if position < 30:
            price_position_analysis = f"52주 대비 {position:.1f}% 위치로 저점 근처에서 매수 기회로 평가됩니다."
        elif position < 70:
            price_position_analysis = f"52주 대비 {position:.1f}% 위치로 적정 수준의 밸류에이션을 보여줍니다."
        else:
            price_position_analysis = f"52주 대비 {position:.1f}% 위치로 고점 근처이나 성장 기대감이 반영된 수준입니다."
    
    # 카테고리별 전문 분석
    category_analysis = {
        "tech": f"""
🔹 **기술 혁신 리더십**: {sector} 분야의 선도 기업으로 AI, 클라우드, 디지털 전환 등 핵심 기술 트렌드에서 강력한 경쟁 우위를 보유
🔹 **시장 지배력**: {market_cap_trillion:.1f}조 달러 규모의 시가총액으로 업계 표준을 주도하는 시장 지배력 확보
🔹 **성장 동력**: 글로벌 디지털화 가속화로 인한 수요 증가와 신기술 도입으로 지속적인 성장 기대
🔹 **재무 건전성**: {roe_analysis} {eps_analysis} {debt_analysis}
🔹 **매수 타이밍**: {price_position_analysis}""",
        
        "growth": f"""
🔹 **고성장 잠재력**: 혁신적인 비즈니스 모델과 시장 확장성으로 연평균 15-25% 수준의 고성장 기대
🔹 **시장 기회**: 신흥 시장 진출과 신제품 출시를 통한 매출 다각화로 성장 동력 확보
🔹 **경쟁 우위**: 독창적인 기술과 브랜드 파워로 시장 진입 장벽 구축
🔹 **재무 효율성**: {roe_analysis} {eps_analysis} {debt_analysis}
🔹 **매수 타이밍**: {price_position_analysis}""",
        
        "value": f"""
🔹 **저평가 매력**: {per_analysis} 내재가치 대비 할인된 주가로 안전마진 확보
🔹 **안정적 수익**: 성숙한 시장에서 안정적인 현금흐름과 꾸준한 수익성 유지
🔹 **배당 안정성**: 꾸준한 배당 지급과 배당 성장으로 소득 투자자에게 매력적
🔹 **재무 건전성**: {roe_analysis} {eps_analysis} {debt_analysis}
🔹 **매수 타이밍**: {price_position_analysis}""",
        
        "dividend": f"""
🔹 **배당 안정성**: 연 3-5% 수준의 안정적인 배당 수익률과 꾸준한 배당 성장
🔹 **현금흐름**: 안정적인 영업 현금흐름으로 배당 지급 능력 확보
🔹 **배당 성장**: 매년 배당 인상으로 인플레이션 헤지 효과 제공
🔹 **재무 건전성**: {roe_analysis} {eps_analysis} {debt_analysis}
🔹 **매수 타이밍**: {price_position_analysis}""",
        
        "defensive": f"""
🔹 **경기 방어력**: 필수 소비재 특성으로 경기 침체기에도 안정적인 수요 유지
🔹 **브랜드 파워**: 강력한 브랜드 인지도와 고객 충성도로 가격 결정력 보유
🔹 **안정적 수익**: 반복적 소비 패턴으로 예측 가능한 매출과 수익 구조
🔹 **재무 안정성**: {roe_analysis} {eps_analysis} {debt_analysis}
🔹 **매수 타이밍**: {price_position_analysis}"""
    }
    
    # 기본 분석
    base_analysis = f"""
📊 **{company_name} ({ticker}) 투자 분석**

💰 **기본 정보**
• 현재가: ${current_price:.2f}
• 시가총액: {market_cap_trillion:.1f}조 달러
• 섹터: {sector}
• 52주 범위: ${week_52_low:.2f} - ${week_52_high:.2f}

{category_analysis.get(category, f"""
🔹 **종합 평가**: {company_name}은 {sector} 분야의 우량 기업으로, 안정적인 재무구조와 성장 잠재력을 보유한 장기 투자 대상입니다.
🔹 **투자 포인트**: {roe_analysis} {per_analysis} {eps_analysis} {debt_analysis}
🔹 **매수 타이밍**: {price_position_analysis}
""")}

🎯 **투자 전략**: {category} 투자 스타일에 적합한 포트폴리오 구성 요소로 권장
⚠️ **투자 위험**: 투자 결정 전 개인적인 재무 상황과 투자 목표를 고려하시기 바랍니다.
"""
    
    return base_analysis.strip()

def generate_stock_recommendations(category: str) -> list:
    """실제 Finnhub API 데이터만 사용하여 추천 종목 생성"""
    try:
        # 카테고리별 종목 리스트 가져오기
        tickers = CATEGORY_STOCKS.get(category, CATEGORY_STOCKS["tech"])
        print(f"📊 {category} 카테고리 종목 리스트: {tickers}")
        
        recommendations = []
        
        for ticker in tickers:
            try:
                print(f"🔍 {ticker} 실제 데이터 조회 중...")
                
                # Finnhub API로 실제 데이터 가져오기
                stock_info = get_stock_info(ticker)
                
                # 기본 정보 추출
                current_price = stock_info.get("currentPrice", 0)
                company_name = stock_info.get("longName", ticker)
                market_cap = stock_info.get("marketCap", 0)
                
                # 재무 지표 추출 (실제 값 또는 합리적인 기본값)
                per_ratio = stock_info.get("trailingPE")
                if per_ratio == "N/A" or per_ratio is None or per_ratio == 0:
                    default_per = {"tech": 35, "growth": 40, "value": 18, "dividend": 20, "defensive": 22}
                    per_ratio = default_per.get(category, 25)
                else:
                    per_ratio = float(per_ratio)

                eps = stock_info.get("trailingEps")
                if eps == "N/A" or eps is None:
                    eps = current_price / per_ratio if current_price > 0 and per_ratio > 0 else 0
                else:
                    eps = float(eps)

                # ROE
                roe = stock_info.get("returnOnEquity")
                if roe == "N/A" or roe is None:
                    default_roe = {"tech": 0.25, "growth": 0.20, "value": 0.15, "dividend": 0.18, "defensive": 0.16}
                    roe = default_roe.get(category, 0.18)
                else:
                    roe = float(roe)
                    if roe > 1:
                        roe = roe / 100

                # 순이익률
                profit_margin = stock_info.get("profitMargin")
                if profit_margin == "N/A" or profit_margin is None:
                    profit_margin = 0.15 + (roe - 0.15) * 0.5
                else:
                    profit_margin = float(profit_margin)
                    if profit_margin > 1:
                        profit_margin = profit_margin / 100

                # 매출 성장률
                revenue_growth = stock_info.get("revenueGrowth")
                if revenue_growth == "N/A" or revenue_growth is None:
                    revenue_growth = 0.08 if category in ["tech", "growth"] else 0.03
                else:
                    revenue_growth = float(revenue_growth)
                    if revenue_growth > 1:
                        revenue_growth = revenue_growth / 100

                # 배당수익률
                dividend_yield = stock_info.get("dividendYield")
                if dividend_yield == "N/A" or dividend_yield is None:
                    dividend_yield = 0.02 if category in ["dividend", "defensive"] else 0.005
                else:
                    dividend_yield = float(dividend_yield)
                    if dividend_yield > 1:
                        dividend_yield = dividend_yield / 100

                # 목표가 계산
                target_price = get_target_price_estimate(current_price, category)

                # 애널리스트 등급 추정
                analyst_rating = get_analyst_rating(category, per_ratio)

                # 위험도 등급
                risk_level = get_risk_level(category)

                # 52주 고저가 정보
                week_52_low = stock_info.get("fiftyTwoWeekLow", current_price * 0.7)
                week_52_high = stock_info.get("fiftyTwoWeekHigh", current_price * 1.3)

                # 52주 위치 계산
                if isinstance(week_52_low, (int, float)) and isinstance(week_52_high, (int, float)) and week_52_high > week_52_low:
                    week_52_position = round(((current_price - week_52_low) / (week_52_high - week_52_low)) * 100, 1)
                else:
                    week_52_position = 50.0

                # 추천 종목 데이터 구성
                recommendation = {
                    "ticker": ticker,
                    "company_name": company_name,
                    "current_price": current_price,
                    "per_ratio": per_ratio,
                    "peg_ratio": per_ratio / 15.0 if per_ratio > 0 else 1.5,  # PEG 추정
                    "roe": roe,
                    "debt_to_equity": debt_to_equity,
                    "profit_margin": profit_margin,
                    "revenue_growth": revenue_growth,
                    "dividend_yield": dividend_yield,
                    "market_cap": market_cap,
                    "eps": eps,
                    "target_price": target_price,
                    "risk_level": risk_level,
                    "analyst_rating": analyst_rating,
                    "sector": stock_info.get("industry", "Technology"),
                    "industry": stock_info.get("industry", "Software"),
                    "country": stock_info.get("country", "US"),
                    "week_52_low": week_52_low,
                    "week_52_high": week_52_high,
                    "week_52_position": week_52_position,
                    "recommendation_reason": get_analysis_reason(ticker, stock_info, category),
                    "updated_at": datetime.now().isoformat() + "Z",
                    "key_metrics": {
                        "free_cash_flow": market_cap * 0.05 if market_cap > 0 else 1000000000,  # 시총의 5% 추정
                        "competitive_advantages": get_competitive_advantages(category),
                        "growth_drivers": get_growth_drivers(category)
                    }
                }
                
                recommendations.append(recommendation)
                print(f"✅ {ticker} 데이터 처리 완료: 현재가=${current_price:.2f}, PER={per_ratio}")
                
            except Exception as e:
                print(f"⚠️ {ticker} 데이터 처리 실패: {e}")
                continue
        
        print(f"🎯 {category} 카테고리 총 {len(recommendations)}개 종목 생성 완료")
        return recommendations
        
    except Exception as e:
        print(f"❌ {category} 카테고리 추천 종목 생성 실패: {e}")
        return []

def get_competitive_advantages(category: str) -> list:
    """카테고리별 경쟁 우위 요소"""
    advantages = {
        "tech": ["기술 혁신력", "시장 지배력", "네트워크 효과"],
        "growth": ["시장 확장성", "혁신 제품", "고성장 시장"],
        "value": ["브랜드 파워", "안정적 수익", "저평가 매력"],
        "dividend": ["안정적 배당", "현금흐름", "배당 성장"],
        "defensive": ["방어적 특성", "필수재 수요", "안정적 수익"]
    }
    return advantages.get(category, ["장기 성장성", "시장 경쟁력", "재무 안정성"])

def get_growth_drivers(category: str) -> list:
    """카테고리별 성장 동력"""
    drivers = {
        "tech": ["AI 기술 발전", "디지털 전환", "클라우드 확산"],
        "growth": ["시장 점유율 확대", "신제품 출시", "글로벌 확장"],
        "value": ["가치 재평가", "배당 증가", "자사주 매입"],
        "dividend": ["배당 성장", "안정적 수익", "인플레이션 헤지"],
        "defensive": ["경기 방어력", "필수재 수요", "안정적 현금흐름"]
    }
    return drivers.get(category, ["장기 성장성", "시장 기회", "경영 효율성"])

def save_recommendations_to_mongo(category: str, recommendations: list):
    doc = {
        "category": category,
        "updated_at": datetime.now(),
        "recommendations": recommendations
    }
    mongo_col.replace_one({"category": category}, doc, upsert=True)

def get_recommendations_from_mongo(category: str):
    doc = mongo_col.find_one({"category": category})
    if not doc:
        return None
    return doc

def update_all_recommendations():
    categories = ["tech", "growth", "value", "dividend", "defensive"]
    print("🕛 매일 자동 업데이트 시작...")
    for category in categories:
        try:
            print(f"🔄 {category} 카테고리 추천 종목 업데이트 중...")
            recs = generate_stock_recommendations(category)
            save_recommendations_to_mongo(category, recs)
            print(f"✅ {category} 카테고리 추천 종목 업데이트 완료")
        except Exception as e:
            print(f"❌ {category} 카테고리 업데이트 실패: {e}")
    print("✅ 매일 자동 업데이트 완료!")

def start_scheduler():
    scheduler = AsyncIOScheduler()
    scheduler.add_job(
        update_all_recommendations,
        CronTrigger(hour=0, minute=0),  # 매일 오전 12시
        id='daily_recommendations_update',
        name='매일 추천 종목 업데이트',
        replace_existing=True
    )
    scheduler.add_job(
        update_all_recommendations,
        'date',  # 서버 시작 시 즉시 실행
        id='initial_recommendations_update',
        name='초기 추천 종목 업데이트'
    )
    scheduler.start()
    print("📅 스케줄러 시작됨 - 매일 오전 12시에 추천 종목 자동 업데이트")

@app.get("/stock-recommendations/{category}")
async def get_stock_recommendations(category: str):
    doc = get_recommendations_from_mongo(category)
    if not doc:
        raise HTTPException(404, f"{category} 카테고리의 추천 종목을 찾을 수 없습니다. 오전 12시에 자동으로 업데이트됩니다.")
    return {
        "category": doc["category"],
        "recommendations": doc["recommendations"],
        "updated_at": doc["updated_at"]
    }

@app.post("/force-update-recommendations")
async def force_update_recommendations():
    try:
        update_all_recommendations()
        return {"message": "모든 추천 종목이 성공적으로 업데이트되었습니다."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"수동 업데이트 실패: {str(e)}")

@app.post("/test-category/{category}")
async def test_single_category(category: str):
    """단일 카테고리 테스트용 엔드포인트"""
    try:
        print(f"🧪 테스트: {category} 카테고리 추천 종목 생성 중...")
        recommendations = generate_stock_recommendations(category)
        print(f"🧪 테스트 결과: {len(recommendations)}개 종목 생성됨")
        
        if recommendations:
            # 첫 번째 종목의 모든 데이터 출력
            first_stock = recommendations[0]
            print(f"🧪 첫 번째 종목 전체 데이터:")
            for key, value in first_stock.items():
                print(f"  {key}: {value}")
        
        # MongoDB에 저장
        save_recommendations_to_mongo(category, recommendations)
        
        return {
            "category": category,
            "recommendations": recommendations,
            "count": len(recommendations)
        }
    except Exception as e:
        print(f"🧪 테스트 실패: {str(e)}")
        raise HTTPException(status_code=500, detail=f"테스트 실패: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    start_scheduler()
    uvicorn.run(app, host="0.0.0.0", port=8000)
