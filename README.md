# 🛡️ TokenGuard

> **Shifting AI Integration from Unpredictable Costs to Managed Enterprise FinOps.**

[![Python](https://img.shields.io/badge/Python-Backend-3776AB.svg)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/Gateway-FastAPI-009688.svg)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/Dashboard-React-61DAFB.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/SDK-TypeScript-3178C6.svg)](https://www.typescriptlang.org/)
[![Gemini](https://img.shields.io/badge/AI-Gemini_API-orange.svg)](https://ai.google.dev/)

## 📖 Overview

LLM API costs can spiral out of control without proper observability and routing. **TokenGuard** unifies cost-management, traffic routing, and caching into one centralized **AI Gateway** for enterprises.

The system utilizes native SDKs (Python/TypeScript) to send prompts to a **FastAPI** backend. The gateway evaluates prompt complexity, routes requests to the most cost-effective Gemini model, and leverages **Semantic Caching** to prevent redundant calls. A secure **React** dashboard visualizes real-time budget utilization and savings.

## ✨ Core Features

* **🔀 Dynamic Routing Engine:** Automatically calculates prompt complexity and routes requests to the most cost-effective model (`gemini-3.1-flash-lite`, `gemini-3.5-flash`, `gemini-3.1-pro`).
* **🧠 Semantic Caching:** Prevents redundant API calls by caching responses. Conceptually similar queries return a cached response, reducing API costs to $0.
* **🌱 Eco Mode:** A one-click global override that forces all traffic to highly efficient models during budget constraints.
* **📊 Enterprise Dashboard:** Dark-mode telemetry UI showing real-time budget utilization, cache hit rates, and departmental spending.
* **🔐 Secure Authentication:** Protected workspace access ensuring only authorized personnel can view financial telemetry.

## 🛠️ Tech Stack

| Layer | Technologies |
|-------|----------------|
| **Frontend Dashboard** | React, TypeScript, TailwindCSS, Recharts, Lucide Icons |
| **Backend Gateway** | Python, FastAPI, Uvicorn, Pydantic |
| **AI Integration** | Google GenAI SDK (Gemini 3.1 & 3.5 series) |
| **Client SDKs** | Python (Requests), TypeScript (Native Fetch) |

### System architecture (as implemented)

**Gateway-centric** — Centralized routing and logic.

* External applications use the `TokenGuardClient` (Web or Python) to send requests.
* The Gateway handles all external API calls, evaluating complexity scores via `calculate_complexity()`.
* Internal telemetry logic saves routing decisions, costs, and cache hits for the dashboard to consume.

## 🏗️ System Architecture & Workflow

Two primary interaction layers exist within the ecosystem:

### Developer SDKs

* Initialize the client pointing to the gateway base URL.
* Send `department_key` and `prompt` payloads.
* Receive structured AI responses including the source (Cache vs. Specific Model).

### Admin Dashboard

* Authenticate securely (Admin Workspace).
* Monitor global metrics: Total Savings, Request Volume, Cache Hit Rate.
* Analyze specific departmental overspending.

```text
Client App (SDK)    → POST /gateway/generate
                    → FastAPI (Cache Check -> Complexity Router)
Backend             → Gemini API (Fetch AI Response)
Backend             → DB (Log Telemetry & Cost)
React Dashboard     ← GET /analytics (Visualizes Data)
