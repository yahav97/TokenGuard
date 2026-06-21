import re

class DynamicRouter:
    def __init__(self):
        # הגדרת המודלים - אפשר לשנות לכל ספק שתרצה בהמשך
        self.cheap_model = "gemini-1.5-flash"
        self.standard_model = "gpt-4o-mini"
        self.premium_model = "claude-3.5-sonnet"

    def calculate_complexity(self, prompt: str) -> float:
        """
        מחשב ציון מורכבות מ-0.0 עד 1.0 על סמך 3 וקטורים אבחוניים.
        """
        score = 0.0
        
        # 1. נפח הקונטקסט: טקסטים ארוכים נוטים ללכת לאיבוד במודלים קטנים
        word_count = len(prompt.split())
        if word_count > 100:
            score += 0.3
            
        # 2. צפיפות קוד (Code Density): חיפוש סממנים מובהקים של קוד או שגיאות
        # מחפש סוגריים מסולסלים, הגדרת פונקציות/מחלקות, או מילים של חריגות
        code_patterns = [r"\{.*\}", r"def\s+\w+", r"class\s+\w+", r"Exception", r"Error", r"Traceback"]
        for pattern in code_patterns:
            if re.search(pattern, prompt, re.IGNORECASE):
                score += 0.5
                break # מספיק סממן אחד כדי להקפיץ את המורכבות
                
        # 3. אפיון משימה (Intent): משימות חשיבה מורכבות לעומת משימות סגורות
        complex_keywords = ["תדבג", "למה", "ארכיטקטורה", "debug", "architecture", "explain", "refactor"]
        if any(word in prompt.lower() for word in complex_keywords):
            score += 0.4
            
        # חסימת הציון למקסימום 1.0
        return min(score, 1.0)

    def route_request(self, prompt: str) -> str:
        """
        הפונקציה הראשית שמחזירה את שם המודל הנבחר לפי הציון
        """
        score = self.calculate_complexity(prompt)
        print(f"[TokenGuard Router] Prompt complexity score: {score}")
        
        # הרף שלנו: אם הציון גבוה מ-0.6, הולכים למודל הכבד והיקר
        if score > 0.6:
            return self.expensive_model
        return self.cheap_model