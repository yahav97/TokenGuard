import os
from datetime import datetime
from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime, ForeignKey, func
from sqlalchemy.orm import declarative_base, sessionmaker, relationship
from dotenv import load_dotenv

# טעינת משתני הסביבה (כולל כתובת מסד הנתונים)
load_dotenv()
# ינסה למשוך מהקובץ, ואם ייכשל (יקבל None), ישתמש בכתובת הישירה לדוקר
DATABASE_URL = os.getenv("DATABASE_URL") or "postgresql://postgres:mysecretpassword@localhost:5433/tokenguard_db"

# אתחול מנוע ההתחברות ל-PostgreSQL
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# --- הגדרת המודלים (הטבלאות יווצרו אוטומטית לפי המחלקות האלו) ---

class Department(Base):
    __tablename__ = "departments"
    
    department_key = Column(String, primary_key=True, index=True)
    department_name = Column(String, nullable=False)
    monthly_budget = Column(Float, nullable=False)
    current_spending = Column(Float, default=0.0)

class Transaction(Base):
    __tablename__ = "transactions"
    
    id = Column(Integer, primary_key=True, index=True)
    department_key = Column(String, ForeignKey("departments.department_key"))
    prompt = Column(String, nullable=False)
    response = Column(String, nullable=False)
    model_used = Column(String, nullable=False)
    tokens_saved = Column(Integer, default=0)
    cost_saved = Column(Float, default=0.0)
    is_cached = Column(Integer, default=0)
    timestamp = Column(DateTime, default=datetime.utcnow)

# --- פונקציות ליבה ---

def init_db():
    """מייצר את הטבלאות בפוסטגרס ומזין נתוני הדגמה במידת הצורך"""
    # פקודה זו בונה את כל הטבלאות אם הן לא קיימות
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    try:
        # בדיקה האם מסד הנתונים ריק ממחלקות
        if db.query(Department).count() == 0:
            mock_departments = [
                Department(department_key='dept_rnd_001', department_name='Research & Development', monthly_budget=5000.0, current_spending=0.0),
                Department(department_key='dept_marketing_002', department_name='Marketing AI', monthly_budget=2000.0, current_spending=0.0),
                Department(department_key='dept_support_003', department_name='Customer Support Bot', monthly_budget=1500.0, current_spending=0.0)
            ]
            db.add_all(mock_departments)
            db.commit()
    finally:
        db.close()

def log_transaction(department_key: str, prompt: str, response: str, model_used: str, cost_saved: float, is_cached: int):
    """תיעוד קריאה ל-AI ועדכון תקציב מחלקתי באותה טרנזקציה"""
    db = SessionLocal()
    try:
        # 1. יצירת רשומת הטרנזקציה
        new_tx = Transaction(
            department_key=department_key,
            prompt=prompt,
            response=response,
            model_used=model_used,
            cost_saved=cost_saved,
            is_cached=is_cached
        )
        db.add(new_tx)
        
        # 2. עדכון הוצאות המחלקה (אם נשלף מהקאש - לא עלה לנו כסף)
        if not is_cached:
            dept = db.query(Department).filter(Department.department_key == department_key).first()
            if dept:
                dept.current_spending += 0.02  # עלות סימולטיבית לקריאה בפועל
        
        # שמירת כל השינויים למסד הנתונים בבת אחת (Atomic Transaction)
        db.commit()
    except Exception as e:
        # במקרה של קריסה, מבטלים את כל הפעולות כדי לא לזהם את המסד
        db.rollback()
        print(f"[Database Error] Failed to log transaction: {e}")
    finally:
        db.close()

def get_analytics_summary():
    """שולף מדדי מפתח כלליים עבור כרטיסי המידע בדשבורד"""
    db = SessionLocal()
    try:
        total_requests = db.query(Transaction).count()
        cache_hits = db.query(Transaction).filter(Transaction.is_cached == 1).count()
        
        # חישוב סך החיסכון הכספי
        total_saved = db.query(func.sum(Transaction.cost_saved)).scalar() or 0.0
        
        cache_hit_rate = (cache_hits / total_requests * 100) if total_requests > 0 else 0.0
        
        return {
            "total_requests": total_requests,
            "cache_hits": cache_hits,
            "cache_hit_rate": round(cache_hit_rate, 2),
            "total_usd_saved": round(total_saved, 4)
        }
    finally:
        db.close()

def get_department_budgets():
    """שולף את מצב התקציב הנוכחי של כל המחלקות עבור גרף העמודות"""
    db = SessionLocal()
    try:
        departments = db.query(Department).all()
        return [
            {
                "department_name": dept.department_name,
                "monthly_budget": dept.monthly_budget,
                "current_spending": round(dept.current_spending, 2)
            }
            for dept in departments
        ]
    finally:
        db.close() 

# הרצת האתחול בעת עליית השרת
init_db()