import uvicorn
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from semantic_cache import SemanticCache
from compressor import compress_prompt
from router import DynamicRouter
from llm_service import get_ai_response
from database import log_transaction, get_analytics_summary, get_department_budgets

app = FastAPI(title="TokenGuard Enterprise API", version="1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"], 
    allow_headers=["*"],
)

semantic_cache = SemanticCache(threshold=0.85)
llm_router = DynamicRouter()

GLOBAL_CONFIG = {
    "eco_mode": False
}

class AIMessageRequest(BaseModel):
    department_key: str
    prompt: str

class EcoModeRequest(BaseModel):
    enabled: bool

@app.get("/")
def read_root():
    return {"status": "TokenGuard Backend is alive and updated!"}

@app.post("/config/eco")
def toggle_eco_mode(request: EcoModeRequest):
    GLOBAL_CONFIG["eco_mode"] = request.enabled
    state = "ON" if request.enabled else "OFF"
    print(f"🌍 Eco Mode turned {state}!")
    return {"status": "success", "eco_mode": request.enabled}

@app.post("/gateway/generate")
def generate_ai_response(request: AIMessageRequest):
    try:
        print(f"\n--- [New Request] Dept: {request.department_key} ---")
        
        cached_resp = semantic_cache.lookup(request.prompt)
        if cached_resp:
            print("✅ Cache Hit! החזרת תשובה מהזיכרון.")
            log_transaction(request.department_key, request.prompt, cached_resp, "cache", 0.02, 1)
            return {"status": "success", "source": "Cache", "response": cached_resp}

        compressed_prompt = compress_prompt(request.prompt)
        print(f"✂️ Prompt Compressed: '{compressed_prompt}'")
        
        if GLOBAL_CONFIG["eco_mode"]:
            print("🌿 ECO MODE ACTIVE: Forcing cost-efficient model.")
            selected_model = "gemini-2.0-flash" 
        else:
            selected_model = llm_router.route_request(compressed_prompt)
            print(f"🔀 Routed to model: {selected_model}")
        
        ai_answer = get_ai_response(compressed_prompt, selected_model)
        if ai_answer.startswith("Error"):
            raise Exception(ai_answer)
        
        semantic_cache.insert(request.prompt, ai_answer)
        log_transaction(request.department_key, request.prompt, ai_answer, selected_model, 0.0, 0)
        
        return {"status": "success", "source": selected_model, "response": ai_answer}

    except Exception as e:
        print(f"❌ Server Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/analytics/summary")
def read_analytics_summary():
    try:
        return get_analytics_summary()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch summary: {str(e)}")

@app.get("/analytics/departments")
def read_department_budgets():
    try:
        return get_department_budgets()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch budgets: {str(e)}")

if __name__ == "__main__":
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)