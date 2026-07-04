import time
from sdk import TokenGuardClient

tg = TokenGuardClient(api_key="tg-sk-admin123456789", base_url="http://127.0.0.1:8000")
prompts_to_test = [
    {"dept": "dept_support_003", "prompt": "What is the formula for the area of a circle?"},
    {"dept": "dept_marketing_002", "prompt": "Suggest three creative names for a new vegan bakery."},
    {"dept": "dept_rnd_001", "prompt": "Please design a comprehensive, production-ready microservices architecture. You must include detailed specifications for Kubernetes deployment configurations, a robust CI/CD pipeline using GitHub Actions, advanced JWT-based authentication with role-based access control, distributed tracing implementation utilizing OpenTelemetry, and a complete disaster recovery strategy for a multi-region PostgreSQL cluster."},
    {"dept": "dept_marketing_002", "prompt": "Suggest three creative names for a new vegan bakery."}
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