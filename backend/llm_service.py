import os
from openai import OpenAI
from anthropic import Anthropic
from google import genai
from dotenv import load_dotenv

load_dotenv()

# טעינת המפתחות בצורה בטוחה
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY")
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")

# אתחול הלקוחות רק אם המפתח באמת קיים ב-.env, אחרת יהיו None
openai_client = OpenAI(api_key=OPENAI_API_KEY) if OPENAI_API_KEY else None
anthropic_client = Anthropic(api_key=ANTHROPIC_API_KEY) if ANTHROPIC_API_KEY else None
gemini_client = genai.Client(api_key=GOOGLE_API_KEY) if GOOGLE_API_KEY else None

def get_ai_response(prompt: str, model_name: str) -> str:
    try:
        # 1. OpenAI
        if "gpt" in model_name:
            if not openai_client:
                return "Error: OpenAI API key is missing from .env"
            
            response = openai_client.chat.completions.create(
                model=model_name,
                messages=[{"role": "user", "content": prompt}]
            )
            return response.choices[0].message.content
        
        # 2. Anthropic (Claude)
        elif "claude" in model_name:
            if not anthropic_client:
                return "Error: Anthropic API key is missing from .env"
                
            response = anthropic_client.messages.create(
                model=model_name,
                max_tokens=1024,
                messages=[{"role": "user", "content": prompt}]
            )
            return response.content[0].text

        # 3. Google Gemini (עודכן לסינטקס של החבילה החדשה)
        elif "gemini" in model_name:
            if not gemini_client:
                return "Error: Google API key is missing from .env"
                
            response = gemini_client.models.generate_content(
                model=model_name,
                contents=prompt
            )
            return response.text
            
        return f"Unknown model: {model_name}"
    except Exception as e:
        return f"Error: {str(e)}"