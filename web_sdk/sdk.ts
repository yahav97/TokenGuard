// web_sdk/sdk.ts

export class TokenGuardClient {
    private baseUrl: string;

    constructor(baseUrl: string = "http://127.0.0.1:8000") {
        this.baseUrl = baseUrl;
    }

    async generate(departmentKey: string, prompt: string) {
        try {
            const response = await fetch(`${this.baseUrl}/gateway/generate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    department_key: departmentKey,
                    prompt: prompt
                })
            });

            if (!response.ok) {
                throw new Error(`TokenGuard Gateway Error: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error("TokenGuard SDK Connection Failed:", error);
            return { 
                status: "error", 
                source: "SDK_Internal",
                response: "Failed to connect to the TokenGuard Gateway." 
            };
        }
    }
}