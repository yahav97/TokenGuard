import time
from sdk import TokenGuardClient

tg = TokenGuardClient(api_key="tg-sk-admin123456789", base_url="http://127.0.0.1:8000")

print("Starting TokenGuard Eco-Mode Live Testing...\n")

print("[1/2] Eco Mode is OFF (Normal Routing)")
print("Sending a highly complex architecture request...")
try:
    result = tg.generate(
        department_key="dept_rnd_001", 
        prompt="Please design a comprehensive, production-ready microservices architecture. You must include detailed specifications for Kubernetes deployment configurations, and advanced JWT-based authentication."
    )
    print(f"Status: {result.get('status')}")
    print(f"Source: {result.get('source')}") 
except Exception as e:
    print(f"Error: {e}")

print("\n" + "=" * 70 + "\n")

input("turn ON the Eco Mode button, then press ENTER here to continue...")
print("\n" + "=" * 70 + "\n")

print("[2/2] Eco Mode is ON (Forced Cost-Saving)")
print("Sending a BRAND NEW highly complex programming request...")
try:
    result = tg.generate(
        department_key="dept_rnd_001", 
        prompt="Write a highly concurrent Rust backend service using Actix-Web and WebSockets to process live telemetry data from Formula 1 cars. Implement custom binary serialization to minimize payload size, and use Redis Pub/Sub to scale the WebSocket connections horizontally across 5 different geographic regions."
    )
    print(f"Status: {result.get('status')}")
    print(f"Source: {result.get('source')} ") 
except Exception as e:
    print(f"Error: {e}")

print("\n" + "=" * 70 + "\n")
print("Live testing completed. Refresh your dashboard to see the cost savings!")