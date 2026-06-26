import uvicorn
from fastapi import FastAPI, HTTPException, Header, Security, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import APIKeyHeader
from pydantic import BaseModel

from semantic_cache import SemanticCache
from compressor import compress_prompt
from router import DynamicRouter
from llm_service import get_ai_response
from database import (
    log_transaction, 
    get_analytics_summary, 
    get_department_budgets,
    get_user_by_username,
    verify_password,
    create_new_department,
    register_new_user,
    SessionLocal,
    User
)

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

api_key_header = APIKeyHeader(name="X-API-Key")

def get_current_user_from_api_key(api_key: str = Security(api_key_header)):
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.api_key == api_key).first()
        if not user:
            raise HTTPException(status_code=403, detail="Invalid API Key. Access Denied.")
        return user
    finally:
        db.close()

class AIMessageRequest(BaseModel):
    department_key: str
    prompt: str

class EcoModeRequest(BaseModel):
    enabled: bool

class CreateDepartmentRequest(BaseModel):
    department_name: str
    monthly_budget: float

class LoginRequest(BaseModel):
    username: str
    password: str

class RegisterRequest(BaseModel):
    username: str
    password: str

@app.get("/")
def read_root():
    return {"status": "TokenGuard Backend is alive and updated!"}

@app.post("/auth/register")
def register(request: RegisterRequest):
    result = register_new_user(request.username, request.password)
    
    if "error" in result:
        raise HTTPException(status_code=400, detail=result["error"])
        
    print(f"🎉 New user registered: {request.username}")
    return {
        "status": "success", 
        "message": "User created successfully", 
        "default_key": result["department_key"],
        "api_key": result["api_key"]
    }

@app.post("/auth/login")
def login(request: LoginRequest):
    user = get_user_by_username(request.username)
    if not user or not verify_password(request.password, user["password_hash"]):
        print(f"🚫 Failed login attempt for user: {request.username}")
        raise HTTPException(status_code=401, detail="Invalid username or password")
        
    print(f"🔒 Successful login for user: {request.username}")
    return {"status": "success", "token": f"tokneguard-auth-token-{user['username']}"}

@app.post("/config/eco")
def toggle_eco_mode(request: EcoModeRequest):
    GLOBAL_CONFIG["eco_mode"] = request.enabled
    state = "ON" if request.enabled else "OFF"
    print(f"🌍 Eco Mode turned {state}!")
    return {"status": "success", "eco_mode": request.enabled}

@app.post("/gateway/generate")
def generate_ai_response(request: AIMessageRequest, user: User = Depends(get_current_user_from_api_key)):
    try:
        print(f"\n--- [New Request] Dept: {request.department_key} | User: {user.username} ---")
        
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
def read_analytics_summary(x_user_id: str = Header(None)):
    if not x_user_id:
        raise HTTPException(status_code=401, detail="User ID header is missing")
    try:
        return get_analytics_summary(username=x_user_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch summary: {str(e)}")

@app.get("/analytics/departments")
def read_department_budgets(x_user_id: str = Header(None)):
    if not x_user_id:
        raise HTTPException(status_code=401, detail="User ID header is missing")
    try:
        return get_department_budgets(username=x_user_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch budgets: {str(e)}")

@app.post("/departments/create")
def api_create_department(request: CreateDepartmentRequest, x_user_id: str = Header(None)):
    if not x_user_id:
        raise HTTPException(status_code=401, detail="User ID header is missing")

    result = create_new_department(
        owner_username=x_user_id,
        department_name=request.department_name,
        monthly_budget=request.monthly_budget
    )

    if "error" in result:
        raise HTTPException(status_code=500, detail=result["error"])

    print(f"🏢 New Workspace Created: {result['department']['department_name']} for user {x_user_id}")
    return result

if __name__ == "__main__":
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)