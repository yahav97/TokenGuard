const API_BASE_URL = "http://127.0.0.1:8000";

// Request and response type definitions
export interface AIMessageRequest {
  department_key: string;
  prompt: string;
}

export interface AIMessageResponse {
  status: string;
  source: string;
  response: string;
}

export const tokenGuardApi = {
  // Send a new request to the gateway
  generateResponse: async (data: AIMessageRequest): Promise<AIMessageResponse> => {
    const response = await fetch(`${API_BASE_URL}/gateway/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || "Failed to generate response");
    }

    return response.json();
  }
};