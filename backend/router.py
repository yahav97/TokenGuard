import re

class DynamicRouter:
    def __init__(self):
        # מחירון סימולטיבי לדור המודלים העדכני של גוגל
        self.model_costs = {
            "gemini-3.1-flash-lite": 0.075, # הזול והמהיר ביותר
            "gemini-3.5-flash": 0.35,       # ממוצע ואיכותי
            "gemini-3.1-pro": 3.50          # מודל חשיבה מתקדם ויקר
        }

    def calculate_complexity(self, prompt: str) -> float:
        score = 0.0
        if len(prompt.split()) > 100: score += 0.3
        
        code_patterns = [r"\{.*\}", r"def\s+\w+", r"class\s+\w+", r"Exception", r"Error", r"Traceback"]
        for pattern in code_patterns:
            if re.search(pattern, prompt, re.IGNORECASE):
                score += 0.5
                break 
                
        complex_keywords = ["תדבג", "למה", "ארכיטקטורה", "debug", "architecture", "explain", "refactor", "analyze", "optimize"]
        if any(word in prompt.lower() for word in complex_keywords):
            score += 0.4
            
        return min(score, 1.0)

    def route_request(self, prompt: str) -> str:
        score = self.calculate_complexity(prompt)
        print(f"[TokenGuard Router] Prompt complexity score: {score}")
        
        if score >= 0.7:
             return "gemini-3.1-pro"
        elif score >= 0.3:
             return "gemini-3.5-flash"
        else:
             return "gemini-3.1-flash-lite"