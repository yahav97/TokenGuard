from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI(title="TokenGuard Enterprise API", version="1.0")

class AIMessageRequest(BaseModel):
    department_key: str
    prompt: str

@app.get("/")
def read_root():
    return {"status": "TokenGuard Server is running perfectly"}

@app.post("/gateway/generate")
def generate_ai_response(request: AIMessageRequest):
    return {
        "status": "Success",
        "department": request.department_key,
        "original_prompt": request.prompt,
        "message": "This is a mock response from TokenGuard Server."
    }