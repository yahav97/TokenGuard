import os
import uuid
import secrets
from datetime import datetime
from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime, ForeignKey, func
from sqlalchemy.orm import declarative_base, sessionmaker
from dotenv import load_dotenv
import bcrypt
import uuid

load_dotenv()
DATABASE_URL = os.getenv("DATABASE_URL") or "postgresql://postgres:mysecretpassword@localhost:5433/tokenguard_db"

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, nullable=False, index=True)
    password_hash = Column(String, nullable=False)
    role = Column(String, nullable=False)
    api_key = Column(String, unique=True, index=True, nullable=True)

class Department(Base):
    __tablename__ = "departments"
    department_key = Column(String, primary_key=True, index=True)
    owner_username = Column(String, ForeignKey("users.username"), nullable=False) 
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

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))

def get_user_by_username(username: str):
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.username == username).first()
        if user:
            return {"username": user.username, "password_hash": user.password_hash, "role": user.role}
        return None
    finally:
        db.close()

def register_new_user(username: str, password_raw: str):
    db = SessionLocal()
    try:
        if db.query(User).filter(User.username == username).first():
            return {"error": "Username is already taken"}
        
        new_api_key = f"tg-sk-{secrets.token_urlsafe(16)}"
        hashed_pw = hash_password(password_raw)
        
        new_user = User(username=username, password_hash=hashed_pw, role="user", api_key=new_api_key)
        db.add(new_user)
        db.flush() 
        
        unique_id = str(uuid.uuid4())[:6]
        new_dept_key = f"dept_{username}_{unique_id}"
        
        default_dept = Department(
            department_key=new_dept_key,
            owner_username=username,
            department_name="Default Workspace",
            monthly_budget=1000.0,
            current_spending=0.0
        )
        db.add(default_dept)
        db.commit()
        
        return {"success": True, "department_key": new_dept_key, "api_key": new_api_key}
    except Exception as e:
        db.rollback()
        return {"error": str(e)}
    finally:
        db.close()

def init_db():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        if db.query(User).count() == 0:
            admin_hash = hash_password("enterprise2026")
            admin_user = User(username="admin", password_hash=admin_hash, role="admin", api_key="tg-sk-admin123456789")
            db.add(admin_user)
            db.commit()
            print("✅ Default admin user created in PostgreSQL.")

        if db.query(Department).count() == 0:
            mock_departments = [
                Department(department_key='dept_rnd_001', owner_username='admin', department_name='Research & Development', monthly_budget=5000.0, current_spending=0.0),
                Department(department_key='dept_marketing_002', owner_username='admin', department_name='Marketing AI', monthly_budget=2000.0, current_spending=0.0),
                Department(department_key='dept_support_003', owner_username='admin', department_name='Customer Support Bot', monthly_budget=1500.0, current_spending=0.0)
            ]
            db.add_all(mock_departments)
            db.commit()
    finally:
        db.close()

def log_transaction(department_key: str, prompt: str, response: str, model_used: str, cost_saved: float, is_cached: int):
    db = SessionLocal()
    try:
        print(f"DEBUG: Attempting to log transaction for key: '{department_key}'")
        new_tx = Transaction(
            department_key=department_key, prompt=prompt, response=response,
            model_used=model_used, cost_saved=cost_saved, is_cached=is_cached
        )
        db.add(new_tx)
        
        if not is_cached:
            dept = db.query(Department).filter(Department.department_key == department_key).first()
            if dept:
                dept.current_spending += 150.0 
                print(f"✅ Success: Found department '{department_key}', updated spending to {dept.current_spending}")
            else:
                print(f"❌ Error: Department '{department_key}' NOT FOUND in database!")
        db.commit()
    except Exception as e:
        db.rollback()
        print(f"❌ Database Error in log_transaction: {e}")
    finally:
        db.close()

def get_analytics_summary(username: str):
    db = SessionLocal()
    try:
        user_depts = db.query(Department.department_key).filter(Department.owner_username == username).subquery()
        
        total_requests = db.query(Transaction).filter(Transaction.department_key.in_(user_depts)).count()
        cache_hits = db.query(Transaction).filter(Transaction.department_key.in_(user_depts), Transaction.is_cached == 1).count()
        total_saved = db.query(func.sum(Transaction.cost_saved)).filter(Transaction.department_key.in_(user_depts)).scalar() or 0.0
        
        cache_hit_rate = (cache_hits / total_requests * 100) if total_requests > 0 else 0.0
        return {"total_requests": total_requests, "cache_hits": cache_hits, "cache_hit_rate": round(cache_hit_rate, 2), "total_usd_saved": round(total_saved, 4)}
    finally:
        db.close()

def get_department_budgets(username: str):
    db = SessionLocal()
    try:
        departments = db.query(Department).filter(Department.owner_username == username).all()
        sorted_depts = sorted(departments, key=lambda x: x.monthly_budget, reverse=True)
        
        return [
            {
                "department_name": dept.department_name, 
                "monthly_budget": dept.monthly_budget, 
                "current_spending": round(dept.current_spending, 2)
            } 
            for dept in sorted_depts
        ]
    finally:
        db.close()
def create_new_department(owner_username: str, department_name: str, monthly_budget: float):
    db = SessionLocal()
    try:
        # יצירת מפתח ייחודי למחלקה
        unique_id = str(uuid.uuid4())[:6]
        new_dept_key = f"dept_{owner_username}_{unique_id}"
        
        new_dept = Department(
            department_key=new_dept_key,
            owner_username=owner_username,
            department_name=department_name,
            monthly_budget=monthly_budget,
            current_spending=0.0
        )
        
        db.add(new_dept)
        db.commit()
        
        return {
            "success": True, 
            "department": {
                "department_key": new_dept_key,
                "department_name": department_name,
                "monthly_budget": monthly_budget,
                "current_spending": 0.0
            }
        }
    except Exception as e:
        db.rollback()
        return {"error": str(e)}
    finally:
        db.close()


init_db()