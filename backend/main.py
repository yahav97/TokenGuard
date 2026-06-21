from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# ייבוא של כל הפיצ'רים (המודולים) שבנינו בקבצים הנפרדים
from semantic_cache import SemanticCache
from compressor import compress_prompt
from router import DynamicRouter
from llm_service import get_ai_response
from database import log_transaction

app = FastAPI(title="TokenGuard Enterprise API", version="1.0")

# --- הגדרות CORS לתמיכה בלקוחות Web ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # מאפשר לכל אתר לגשת. בפרודקשן נשים פה את הכתובת של ה-Frontend
    allow_credentials=True,
    allow_methods=["*"], # מאפשר POST, GET, OPTIONS וכו'
    allow_headers=["*"],
)

# אתחול מחלקות הליבה של המערכת
semantic_cache = SemanticCache(threshold=0.85)
llm_router = DynamicRouter()

class AIMessageRequest(BaseModel):
    department_key: str
    prompt: str

@app.post("/gateway/generate")
def generate_ai_response(request: AIMessageRequest):
    try:
        print(f"\n--- [New Request] Dept: {request.department_key} ---")
        
        # 1. חיפוש במסד הנתונים הוקטורי (Semantic Cache)
        cached_resp = semantic_cache.lookup(request.prompt)
        if cached_resp:
            print("✅ Cache Hit! החזרת תשובה ללא עלות מהזיכרון.")
            log_transaction(request.department_key, request.prompt, cached_resp, "cache", 0.02, 1)
            return {"status": "success", "source": "Cache", "response": cached_resp}

        # 2. צמצום הפרומפט (Prompt Compression)
        compressed_prompt = compress_prompt(request.prompt)
        print(f"✂️ Prompt Compressed: '{compressed_prompt}'")
        
        # 3. ניתוב חכם למודל (Dynamic Routing)
        selected_model = llm_router.route_request(compressed_prompt)
        print(f"🔀 Routed to model: {selected_model}")
        
        # 4. קריאה ל-AI
        ai_answer = get_ai_response(compressed_prompt, selected_model)
        
        # הגנה: אם ה-AI החזיר שגיאה (למשל מפתח חסר)
        if ai_answer.startswith("Error"):
            raise Exception(ai_answer)
        
        # 5. שמירה במסד הוקטורי 
        semantic_cache.insert(request.prompt, ai_answer)
        
        # 6. תיעוד במסד הטבלאי 
        log_transaction(request.department_key, request.prompt, ai_answer, selected_model, 0.0, 0)
        
        return {"status": "success", "source": selected_model, "response": ai_answer}

    except Exception as e:
        print(f"❌ Server Error: {str(e)}")
        # מחזירים שגיאה 500 מסודרת כדי שהלקוח (Web או Python) לא יקרוס
        raise HTTPException(status_code=500, detail=str(e))