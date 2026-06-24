
```markdown
# 🛡️ TokenGuard

**Enterprise AI FinOps & Gateway Platform**

TokenGuard is a full-stack, enterprise-grade AI Gateway designed to optimize Large Language Model (LLM) API costs, manage traffic, and provide deep observability into organizational AI usage. By utilizing Dynamic Routing and Semantic Caching, TokenGuard ensures you get the best AI performance at a fraction of the cost.

## ✨ Key Features

* **🔀 Dynamic Routing Engine:** Automatically calculates prompt complexity and routes requests to the most cost-effective model (e.g., `gemini-3.1-flash-lite` for simple tasks, `gemini-3.1-pro` for complex logic).
* **🧠 Semantic Caching:** Prevents redundant API calls by caching responses. If a user asks a conceptually similar question, the gateway serves the response directly from the cache, reducing API costs to $0.
* **🌱 Eco Mode:** A one-click global override that forces all traffic to highly efficient, low-cost models during budget constraints.
* **📊 Enterprise Dashboard:** A React-based, dark-mode telemetry dashboard providing real-time insights into budget utilization, cache hit rates, and departmental spending.
* **🔐 Secure Authentication:** Protected dashboard access ensuring only authorized personnel can view financial and usage telemetry.
* **📦 Multi-Language SDKs:** Ready-to-use client libraries for both **Python** and **TypeScript/Node.js**, allowing seamless integration for any engineering team.

---

## 🏗️ Architecture & Tech Stack

* **Backend Gateway:** Python, FastAPI, Uvicorn
* **Frontend Dashboard:** React, TailwindCSS, Recharts, Lucide Icons
* **LLM Integration:** Google GenAI SDK (Gemini 3.1 & 3.5 series)
* **SDKs:** Python (Requests), TypeScript (Native Fetch)

---

## 🚀 Getting Started

### 1. Clone the Repository
```bash
git clone [https://github.com/YOUR_USERNAME/TokenGuard.git](https://github.com/YOUR_USERNAME/TokenGuard.git)
cd TokenGuard
```

### 2. Backend Setup (FastAPI Gateway)
Navigate to the backend directory, set up the virtual environment, and install dependencies:
```bash
cd backend
python -m venv venv

# Windows
.\venv\Scripts\activate
# Mac/Linux
source venv/bin/activate

pip install -r requirements.txt
```

Create a `.env` file in the `backend` directory and add your API keys:
```env
GOOGLE_API_KEY=your_gemini_api_key_here
```

Run the server:
```bash
python main.py
```

### 3. Frontend Setup (React Dashboard)
Open a new terminal, navigate to the frontend directory, and start the development server:
```bash
cd frontend
npm install
npm run dev
```

*Default Login Credentials:* * **Workspace ID:** `admin`
* **Access Key:** `enterprise2026`

---

## 💻 Using the SDKs

TokenGuard provides native SDKs to easily integrate FinOps protection into your existing apps.

### Python Integration
```python
from backend.sdk import TokenGuardClient

tg = TokenGuardClient(base_url="[http://127.0.0.1:8000](http://127.0.0.1:8000)")

# The Gateway handles caching and routing automatically!
response = tg.generate(
    department_key="dev", 
    prompt="Write a Python script to analyze server logs."
)

print(response.get('response'))
print(f"Served by: {response.get('source')}") 
```

### TypeScript / Node.js Integration
```typescript
import { TokenGuardClient } from './web_sdk/sdk';

const tg = new TokenGuardClient("[http://127.0.0.1:8000](http://127.0.0.1:8000)");

async function run() {
    const result = await tg.generate(
        "marketing", 
        "Write a short tweet about AI FinOps."
    );
    console.log(result.response);
}

run();
```

---

## 📈 Roadmap
- [ ] Add SQLite/PostgreSQL persistent database for long-term analytics.
- [ ] Implement AI Guardrails (PII masking and prompt injection detection).
- [ ] Export financial reports to CSV/PDF.

## 📄 License
This project is licensed under the MIT License.

```
