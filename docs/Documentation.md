# TokenGuard - Full System Documentation

## 1. Implementation

TokenGuard is implemented as a microservices-oriented architecture designed for scale and enterprise observability:

- **Backend Gateway:** Built with Python and FastAPI for high-performance, asynchronous REST API request handling.
- **Database Layer:** PostgreSQL is integrated via SQLAlchemy (ORM) to securely store user credentials (hashed), department budgets, and granular telemetry logs of every AI transaction.
- **AI Integration & Routing:** Implemented using native provider SDKs (OpenAI, Anthropic, Google GenAI). The internal Dynamic Router acts as a proxy, evaluating prompts and directing them to the relevant API based on prompt complexity heuristics.
- **Frontend Clients:**
  - A React/TypeScript web dashboard for administrators to monitor financial metrics.
  - A React Native mobile application demonstrating cross-platform client integration.

---

## 2. Getting Started

### Backend Setup (FastAPI)

1. Clone the repository and navigate to the `backend` folder.
2. Create a virtual environment: `python -m venv venv`
3. Activate the virtual environment:
   - Windows: `.\venv\Scripts\activate`
   - Mac/Linux: `source venv/bin/activate`
4. Install all dependencies: `pip install -r requirements.txt`
5. Create a `.env` file in the root of the backend directory with your API keys:
   ```properties
   OPENAI_API_KEY=your_openai_key_here
   ANTHROPIC_API_KEY=your_anthropic_key_here
   GOOGLE_API_KEY=your_gemini_key_here
   ```
6. Run the local server: `python main.py` (The API will run on `http://127.0.0.1:8000`).

### Dashboard Setup (React Web)

1. Navigate to the `frontend` folder.
2. Install Node modules: `npm install`
3. Start the Vite development server: `npm run dev`

---

## 3. How to Use

The system is divided into two primary workflows depending on the user's role:

1. **For System Admins (FinOps):**
   Open the Web Dashboard. Log in securely using your admin credentials. From the dashboard, you can view real-time API spending, analyze cache hit rates, track department budgets, and toggle the global **Eco-Mode** during budget overruns.
2. **For Developers (Integration):**
   Import the TokenGuard SDK (available in Python or TypeScript) into your external application. Initialize the client with your backend URL and your Admin API key. Send AI prompts directly through the client instead of calling OpenAI/Google directly. TokenGuard will handle the rest.

---

## 4. API Docs (OpenAPI / Swagger)

Because the backend is built with FastAPI, comprehensive and interactive OpenAPI documentation is generated automatically.

- **Swagger UI:** Once the backend server is running, navigate your browser to `http://127.0.0.1:8000/docs`.
- **Capabilities:** From this interface, you can inspect the expected JSON schemas, test endpoints directly (e.g., POST `/gateway/generate`, POST `/config/eco`), and view response codes without writing any external code.

---

## 5. SDK Reference

The TokenGuard ecosystem provides native wrappers to make integration seamless for developers, abstracting away the HTTP REST calls.

### Python SDK (`TokenGuardClient`)

**Initialization:**

```python
client = TokenGuardClient(api_key: str, base_url: str = "[http://127.0.0.1:8000](http://127.0.0.1:8000)")
```

- `api_key` (str): The authentication key provided by the TokenGuard Admin.
- `base_url` (str): The network location of the FastAPI backend.

**Main Method:**
`generate(department_key: str, prompt: str) -> dict`

- **Parameters:**
  - `department_key` (str): The ID of the department to which the cost should be billed.
  - `prompt` (str): The instruction intended for the AI.
- **Returns:** A dictionary containing `status`, `source` (the model used or "Cache"), and `response`.

### TypeScript / Web SDK (`TokenGuardWebClient`)

**Initialization:**

```typescript
import { TokenGuardWebClient } from "./sdk";
const client = new TokenGuardWebClient(
  "[http://127.0.0.1:8000](http://127.0.0.1:8000)",
);
```

**Main Method:**
`generateMessage(departmentKey: string, prompt: string, userApiKey: string) -> Promise<Object>`

- Returns a Promise resolving to a JSON object identical to the Python backend response.

---

## 6. Examples

### Example 1: Python Automation Script

```python
from sdk import TokenGuardClient

# Initialize the gateway client
tg = TokenGuardClient(api_key="admin_key", base_url="[http://127.0.0.1:8000](http://127.0.0.1:8000)")

# Send a request
result = tg.generate(
    department_key="dept_rnd_001",
    prompt="Design a PostgreSQL schema for a hospital management system."
)

print(f"Status: {result.get('status')}")
print(f"Served By: {result.get('source')}")
print(f"Output:\n{result.get('response')}")
```

### Example 2: React Web App Integration

```javascript
import { TokenGuardWebClient } from "./sdk";
import { useState } from "react";

export default function SmartTextEditor() {
  const [response, setResponse] = useState("");
  const [modelUsed, setModelUsed] = useState("");

  const tg = new TokenGuardWebClient(
    "[http://127.0.0.1:8000](http://127.0.0.1:8000)",
  );

  const handleSend = async () => {
    const result = await tg.generateMessage(
      "marketing_dept",
      "Write a catchy 3-sentence tweet about our new AI product.",
      "admin_key",
    );
    setResponse(result.response);
    setModelUsed(result.source);
  };

  return (
    <div>
      <button onClick={handleSend}>Generate Content</button>
      <p>
        <i>Generated by: {modelUsed}</i>
      </p>
      <div>{response}</div>
    </div>
  );
}
```

### Example 3: React Native (Mobile) Integration

```javascript
import React, { useState } from 'react';
import { Button, Text, View, ScrollView } from 'react-native';
import { TokenGuardWebClient } from './sdk';

export default function MobileAssistant() {
  const [aiText, setAiText] = useState('Waiting for prompt...');
  // Use 10.0.2.2 to access localhost from an Android Emulator
  const tg = new TokenGuardWebClient("[http://10.0.2.2:8000](http://10.0.2.2:8000)");

  const askAI = async () => {
    const result = await tg.generateMessage(
      "mobile_team",
      "Summarize the latest trends in cross-platform mobile development.",
      "admin_key"
    );
    setAiText(`[${result.source}] \n\n ${result.response}`);
  };

  return (
    <View 20 padding: style="{{" }}>
      <Button onPress="{askAI}" title="Ask TokenGuard AI"/>
      <ScrollView 20 marginTop: style="{{" }}>
        <Text>{aiText}</Text>
      </ScrollView>
    </View>
  );
}
```
### Example 3: Native Android Integration (Kotlin)
```kotlin
import okhttp3.*
import org.json.JSONObject
import java.io.IOException

// Using 10.0.2.2 to access the local backend from the Android Emulator
val gatewayUrl = "[http://10.0.2.2:8000/gateway/generate](http://10.0.2.2:8000/gateway/generate)"
val client = OkHttpClient()

fun askTokenGuardAI(userPrompt: String) {
    val jsonPayload = JSONObject().apply {
        put("department_key", "mobile_team")
        put("prompt", userPrompt)
    }

    val requestBody = RequestBody.create(
        MediaType.parse("application/json"), 
        jsonPayload.toString()
    )

    val request = Request.Builder()
        .url(gatewayUrl)
        .addHeader("X-API-Key", "admin_key") // Secure authentication
        .post(requestBody)
        .build()

    client.newCall(request).enqueue(object : Callback {
        override fun onFailure(call: Call, e: IOException) {
            println("Failed to reach TokenGuard Gateway: ${e.message}")
        }

        override fun onResponse(call: Call, response: Response) {
            response.use {
                if (!response.isSuccessful) throw IOException("Unexpected HTTP code $response")
                
                val responseData = response.body()?.string()
                println("Gateway Response: $responseData")
            }
        }
    })
}

---

## 7. Other Functions (Core Internal Methods)

- **Semantic Caching (`semantic_cache.py`):**
  Before a request is routed, the system compares the new prompt against a database of previous prompts. If a semantically similar prompt is found (passing an >=85% similarity threshold), the system returns the cached answer instantly. This bypasses external APIs entirely, resulting in a cost of $0.00 and zero latency.
- **Prompt Compression (`compressor.py`):**
  LLM providers charge per "Input Token". This module automatically sanitizes the prompt by removing redundant filler words, unnecessary punctuation, and excessive whitespace before dispatching it to the external AI, actively reducing outbound token costs without altering the user's intent.

- **Eco-Mode Override (`config/eco`):**
  A global FinOps configuration toggle accessible via the dashboard. When a department or the organization exceeds its monthly budget, the Admin can enable Eco-Mode. Once activated, the Dynamic Router is bypassed, and all incoming requests are forcibly downgraded to the most cost-efficient model available (e.g., `gemini-3.1-flash-lite`), preventing further budget hemorrhaging while maintaining system uptime.
