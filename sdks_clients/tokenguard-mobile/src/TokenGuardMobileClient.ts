// tokenguard-mobile/src/TokenGuardMobileClient.ts

export class TokenGuardMobileClient {
    private apiKey: string;
    private baseUrl: string;

    
    constructor(apiKey: string, baseUrl: string = "192.168.1.223") {
        this.apiKey = apiKey;
        this.baseUrl = baseUrl;
    }

    async generate(departmentKey: string, prompt: string): Promise<any> {
        const url = `${this.baseUrl}/gateway/generate`;
        
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-API-Key': this.apiKey
                },
                body: JSON.stringify({
                    department_key: departmentKey,
                    prompt: prompt
                })
            });

            if (!response.ok) {
                console.error(`TokenGuard Error: ${response.status}`);
                return { status: "error", message: "Failed to fetch from Gateway" };
            }

            return await response.json();
            
        } catch (error) {
            console.error("TokenGuard Connection Failed:", error);
            return { status: "error", message: "Network connection failed" };
        }
    }
}