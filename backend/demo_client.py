import time
from sdk import TokenGuardClient

# אתחול ה-SDK
tg = TokenGuardClient(base_url="http://127.0.0.1:8000")

# פרומפטים מותאמים אישית (עם קונטקסט של חיזוי פציעות ספורטאים ו-ML)
prompts_to_test = [
    # 1. קצר ופשוט -> ינותב ל-Eco (gemini-3.1-flash-lite)
    {"dept": "support", "prompt": "Draft a short push notification reminding the athlete to log their daily recovery metrics."},
    
    # 2. שיווקי / בינוני -> ינותב ל-Standard (gemini-3.5-flash)
    {"dept": "marketing", "prompt": "Write a 3-sentence email update for our investors announcing the successful deployment of our new predictive machine learning model for athlete injury risk scoring."},
    
    # 3. מורכב/קוד -> ינותב ל-Premium (gemini-3.1-pro)
    {"dept": "dev", "prompt": "We are building an ML pipeline for sports analytics. Can you analyze this requirement and write a complex Python function using pandas to preprocess player statistics and normalize the risk scores before feeding them into our predictive model?"},
    
    # 4. פרומפט זהה לראשון -> ינותב ל-Cache!
    {"dept": "support", "prompt": "Draft a short push notification reminding the athlete to log their daily recovery metrics."}
]

print("🚀 Starting TokenGuard Live Testing Client...\n")

for i, test in enumerate(prompts_to_test, 1):
    print(f"[{i}/{len(prompts_to_test)}] Sending request for Department: '{test['dept']}'")
    print(f"Prompt: '{test['prompt']}'")
    
    # שליחת הבקשה לשרת
    result = tg.generate(department_key=test['dept'], prompt=test['prompt'])
    
    print(f"Status: {result.get('status')}")
    print(f"Source: {result.get('source')} 💎") 
    
    # --- התיקון: מדפיסים את כל התגובה בצורה יפה ומסודרת ---
    full_response = result.get('response', 'No response received')
    print("\n--- 🤖 AI Response ---")
    print(full_response)
    print("----------------------\n")
    print("=" * 70 + "\n")
    
    # השהיה קלה בין בקשות
    time.sleep(2)

print("✅ Live testing completed.")