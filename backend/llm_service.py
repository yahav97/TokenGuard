import os
from openai import OpenAI
from anthropic import Anthropic
from google import genai
from dotenv import load_dotenv

load_dotenv()

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY")
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")

openai_client = OpenAI(api_key=OPENAI_API_KEY) if OPENAI_API_KEY else None
anthropic_client = Anthropic(api_key=ANTHROPIC_API_KEY) if ANTHROPIC_API_KEY else None
# אתחול נכון של הספרייה החדשה שרצית
gemini_client = genai.Client(api_key=GOOGLE_API_KEY) if GOOGLE_API_KEY else None

def get_ai_response(prompt: str, model_name: str) -> str:
    print(f"🤖 llm_service called with model: {model_name}")
    try:
        # 1. OpenAI
        if "gpt" in model_name:
            if not openai_client: return "Error: OpenAI API key is missing"
            response = openai_client.chat.completions.create(
                model=model_name, messages=[{"role": "user", "content": prompt}]
            )
            return response.choices[0].message.content
        
        # 2. Anthropic (Claude)
        elif "claude" in model_name:
            if not anthropic_client: return "Error: Anthropic API key is missing"
            response = anthropic_client.messages.create(
                model=model_name, max_tokens=1024, messages=[{"role": "user", "content": prompt}]
            )
            return response.content[0].text

        # 3. Google Gemini (הספרייה העדכנית)
        elif "gemini" in model_name:
            if not gemini_client: return "Error: Google API key is missing"
            
            print(f"🚀 Sending request to Gemini ({model_name})...")
            response = gemini_client.models.generate_content(
                model=model_name,
                contents=prompt
            )
            print("✅ Received response from Gemini")
            return response.text
            
        return f"Unknown model: {model_name}"
    except Exception as e:
        print(f"❌ Exception in get_ai_response: {str(e)}")
        return f"Error: {str(e)}"