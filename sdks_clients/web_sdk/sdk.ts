export class TokenGuardClient {
    private apiKey: string;
    private baseUrl: string;

    constructor(apiKey: string, baseUrl: string = "http://127.0.0.1:8000") {
        this.apiKey = apiKey;
        this.baseUrl = baseUrl;
    }

    async generate(departmentKey: string, prompt: string) {
        try {
            const response = await fetch(`${this.baseUrl}/gateway/generate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-API-Key': this.apiKey // <-- הוספנו את זה!
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