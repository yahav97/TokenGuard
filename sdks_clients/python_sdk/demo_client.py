import time
from sdk import TokenGuardClient

# אתחול ה-SDK עם ה-API Key המוגדר של האדמין
tg = TokenGuardClient(api_key="tg-sk-admin123456789", base_url="http://127.0.0.1:8000")

prompts_to_test = [
    {"dept": "dept_support_003", "prompt": "Give me a NEW quote for athletes."},
    {"dept": "dept_marketing_002", "prompt": "Write a SHORT blurb about our new AI engine."},
    {"dept": "dept_rnd_001", "prompt": "How do we calculate risk in Python?"}
]

print("🚀 Starting TokenGuard Live Testing Client...\n")

for i, test in enumerate(prompts_to_test, 1):
    print(f"[{i}/{len(prompts_to_test)}] Sending request for Department: '{test['dept']}'")
    
    try:
        result = tg.generate(department_key=test['dept'], prompt=test['prompt'])
        
        print(f"Status: {result.get('status')}")
        print(f"Source: {result.get('source')} 💎") 
        
        full_response = result.get('response', 'No response received')
        print("\n--- 🤖 AI Response ---")
        print(full_response[:200] + "..." if len(full_response) > 200 else full_response)
        print("----------------------\n")
    except Exception as e:
        print(f"❌ Error during request: {e}")
    
    print("=" * 70 + "\n")
    time.sleep(2)

print("✅ Live testing completed.")