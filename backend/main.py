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

if openai_key:
    print(f"✅ OPENAI_API_KEY 로드됨 (길이: {len(openai_key)}자)")
else:
    print("❌ OPENAI_API_KEY를 찾을 수 없습니다!")

if finnhub_key:
    print(f"✅ FINNHUB_API_KEY 로드됨 (길이: {len(finnhub_key)}자)")
else:
    print("❌ FINNHUB_API_KEY를 찾을 수 없습니다!")
    print("📝 https://finnhub.io 에서 무료 API 키를 발급받아 .env.local 파일에 FINNHUB_API_KEY=your_key 로 추가하세요")

if MONGODB_URI:
    print(f"✅ MONGODB_URI 로드됨: {MONGODB_URI}")
else:
    print("❌ MONGODB_URI를 찾을 수 없습니다! .env.local 파일을 확인하세요.")

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
    allow_origins=["http://localhost:8081", "http://localhost:19006", "http://localhost:19000"], # Expo 개발 서버 포트들 추가
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

def get_recommendation_prompt(category: str) -> str:
    """카테고리별 추천 종목 생성 프롬프트"""
    category_prompts = {
        "growth": """
당신은 성장주 투자 전문가입니다. 
미국 주식시장에서 다음 조건을 만족하는 성장주 5개를 추천해주세요:

조건:
- 시가총액 10억 달러 이상
- 최근 3년간 매출 성장률 20% 이상
- 혁신적인 기술이나 비즈니스 모델 보유
- 강력한 경쟁우위와 시장 지배력
- 건전한 재무상태

각 종목에 대해 다음 정보를 제공해주세요:
1. 티커 심볼
2. 회사명
3. 현재 주가 (Finnhub API로 확인)
4. 추천 이유 (구체적인 근거 포함)

JSON 형식으로 응답해주세요:
{
  "recommendations": [
    {
      "ticker": "AAPL",
      "company_name": "Apple Inc.",
      "current_price": 150.00,
      "recommendation_reason": "강력한 브랜드 파워와 생태계..."
    }
  ]
}
""",
        "value": """
당신은 가치주 투자 전문가입니다.
미국 주식시장에서 다음 조건을 만족하는 가치주 5개를 추천해주세요:

조건:
- PER 15 이하
- PBR 1.5 이하
- 안정적인 배당률
- 강력한 현금흐름
- 낮은 부채비율

각 종목에 대해 다음 정보를 제공해주세요:
1. 티커 심볼
2. 회사명
3. 현재 주가 (Finnhub API로 확인)
4. 추천 이유 (구체적인 근거 포함)

JSON 형식으로 응답해주세요.
""",
        "dividend": """
당신은 배당주 투자 전문가입니다.
미국 주식시장에서 다음 조건을 만족하는 배당주 5개를 추천해주세요:

조건:
- 배당수익률 3% 이상
- 배당 성장률 5% 이상
- 배당 지급 안정성
- 강력한 현금흐름
- 낮은 부채비율

각 종목에 대해 다음 정보를 제공해주세요:
1. 티커 심볼
2. 회사명
3. 현재 주가 (Finnhub API로 확인)
4. 추천 이유 (구체적인 근거 포함)

JSON 형식으로 응답해주세요.
""",
        "tech": """
당신은 기술주 투자 전문가입니다.
미국 주식시장에서 다음 조건을 만족하는 기술주 5개를 추천해주세요:

조건:
- 혁신적인 기술 보유
- 강력한 시장 지배력
- 높은 수익성
- 지속적인 R&D 투자
- 글로벌 확장 가능성

각 종목에 대해 다음 정보를 제공해주세요:
1. 티커 심볼
2. 회사명
3. 현재 주가 (Finnhub API로 확인)
4. 추천 이유 (구체적인 근거 포함)

JSON 형식으로 응답해주세요.
""",
        "defensive": """
당신은 방어주 투자 전문가입니다.
미국 주식시장에서 다음 조건을 만족하는 방어주 5개를 추천해주세요:

조건:
- 안정적인 수익
- 낮은 변동성
- 필수 소비재 또는 유틸리티
- 강력한 현금흐름
- 경제 침체기에도 안정적

각 종목에 대해 다음 정보를 제공해주세요:
1. 티커 심볼
2. 회사명
3. 현재 주가 (Finnhub API로 확인)
4. 추천 이유 (구체적인 근거 포함)

JSON 형식으로 응답해주세요.
"""
    }
    
    return category_prompts.get(category, category_prompts["growth"])

def generate_stock_recommendations(category: str) -> list:
    try:
        api_key = os.getenv("OPENAI_API_KEY")
        if not api_key:
            raise ValueError("OPENAI_API_KEY 환경변수가 설정되지 않았습니다.")
        client = OpenAI(api_key=api_key, timeout=60.0, max_retries=3)
        prompt = get_recommendation_prompt(category)
        completion = client.chat.completions.create(
            model="gpt-4",
            messages=[
                {
                    "role": "system",
                    "content": (
                        "당신은 워렌 버핏 스타일의 주식 투자 전문가입니다. "
                        "각 종목의 추천 이유는 최소 200자 이상, 다음 항목을 반드시 포함해 작성하세요:\n"
                        "- 기업의 핵심 사업/제품/서비스\n"
                        "- 최근 실적 및 성장성(매출, 이익, 시장점유율 등)\n"
                        "- 재무 건전성(부채비율, 현금흐름 등)\n"
                        "- 산업 내 경쟁력 및 시장 전망\n"
                        "- 리스크 요인 및 투자 시 유의점\n"
                        "- 왜 이 시점에 매수/관심이 필요한지\n"
                        "각 항목을 구체적으로 근거와 함께 서술하고, JSON 형식으로 응답하세요."
                    )
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            temperature=0.3
        )
        response_text = completion.choices[0].message.content
        try:
            if "```json" in response_text:
                json_start = response_text.find("```json") + 7
                json_end = response_text.find("```", json_start)
                json_text = response_text[json_start:json_end].strip()
            else:
                json_text = response_text.strip()
            data = json.loads(json_text)
            if isinstance(data, dict):
                recommendations = data.get("recommendations", [])
            elif isinstance(data, list):
                recommendations = data
            else:
                recommendations = []
            for rec in recommendations:
                try:
                    stock_info = get_stock_info(rec["ticker"])
                    rec["current_price"] = stock_info.get("currentPrice", rec.get("current_price", 0))
                    rec["company_name"] = stock_info.get("longName", rec.get("company_name", ""))
                except Exception as e:
                    print(f"Warning: {rec['ticker']} 주가 업데이트 실패: {e}")
            return recommendations
        except json.JSONDecodeError as e:
            print(f"JSON 파싱 오류: {e}")
            print(f"응답 텍스트: {response_text}")
            return []
    except Exception as e:
        print(f"추천 종목 생성 오류: {e}")
        return []

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

if __name__ == "__main__":
    import uvicorn
    start_scheduler()
    uvicorn.run(app, host="0.0.0.0", port=8000)
