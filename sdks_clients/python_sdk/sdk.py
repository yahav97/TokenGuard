import requests

class TokenGuardClient:
    """
    TokenGuard Enterprise SDK Client.
    Integrates FinOps protection, Semantic Cache, and Dynamic Routing into any LLM pipeline.
    """
    def __init__(self, api_key: str, base_url: str = "http://127.0.0.1:8000"):
        self.api_key = api_key
        self.base_url = base_url

    def generate(self, department_key: str, prompt: str) -> dict:
        """
        Sends a prompt through the TokenGuard Gateway to safely optimize costs and routing.
        """
        url = f"{self.base_url}/gateway/generate"
        payload = {
            "department_key": department_key,
            "prompt": prompt
        }
        
        headers = {
            "Content-Type": "application/json",
            "X-API-Key": self.api_key
        }
        
        try:
            response = requests.post(url, json=payload, headers=headers)
            response.raise_for_status() 
            return response.json()
        except requests.exceptions.RequestException as e:
            return {
                "status": "error",
                "source": "SDK_Internal",
                "response": f"TokenGuard SDK failed to connect to Gateway: {str(e)}"
            }