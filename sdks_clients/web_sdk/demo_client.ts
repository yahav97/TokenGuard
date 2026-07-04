// web_sdk/demo_client.ts
import { TokenGuardClient } from './sdk';

const tg = new TokenGuardClient("tg-sk-admin123456789", "http://127.0.0.1:8000");

const promptsToTest = [
    { dept: "support", prompt: "Write a quick 2-sentence welcome message for a new user joining our platform." },
    
    { dept: "dev", prompt: "Please design a high-performance Python backend service using FastAPI and SQLAlchemy. The service must include robust JWT authentication, connection pooling for PostgreSQL, and a Redis-based rate limiter to prevent API abuse." },
    
    { dept: "support", prompt: "Write a quick 2-sentence welcome message for a new user joining our platform." }
];

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function runLiveTesting() {
    console.log("🚀 Starting TokenGuard Live Testing Client (TypeScript Edition)...\n");

    for (let i = 0; i < promptsToTest.length; i++) {
        const test = promptsToTest[i];
        console.log(`[${i + 1}/${promptsToTest.length}] Sending request for Department: '${test.dept}'`);
        console.log(`Prompt: '${test.prompt}'`);

        const result = await tg.generate(test.dept, test.prompt);

        console.log(`Status: ${result.status}`);
        console.log(`Source: ${result.source} 💎`);
        
        console.log("\n--- 🤖 AI Response ---");
        console.log(result.response);
        console.log("----------------------\n");
        console.log("=".repeat(70) + "\n");

        await sleep(3000);
    }

    console.log("✅ Web SDK Live testing completed.");
}

runLiveTesting();