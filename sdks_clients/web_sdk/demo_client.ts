// web_sdk/demo_client.ts
import { TokenGuardClient } from './sdk';

const tg = new TokenGuardClient("http://127.0.0.1:8000");

const promptsToTest = [
    // 1. קצר ופשוט -> Eco
    { dept: "support", prompt: "Draft a short push notification reminding the athlete to log their daily recovery metrics." },
    
    // 2. מורכב/קוד -> Premium
    { dept: "dev", prompt: "We are building an ML pipeline for sports analytics. Can you analyze this requirement and write a complex Python function using pandas to preprocess player statistics and normalize the risk scores before feeding them into our predictive model?" },
    
    // 3. פרומפט זהה לראשון -> מנותב ל-Cache!
    { dept: "support", prompt: "Draft a short push notification reminding the athlete to log their daily recovery metrics." }
];

// פונקציית השהיה (Sleep) ב-JS
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function runLiveTesting() {
    console.log("🚀 Starting TokenGuard Live Testing Client (TypeScript Edition)...\n");

    for (let i = 0; i < promptsToTest.length; i++) {
        const test = promptsToTest[i];
        console.log(`[${i + 1}/${promptsToTest.length}] Sending request for Department: '${test.dept}'`);
        console.log(`Prompt: '${test.prompt}'`);

        // קריאה ל-SDK מתוך סביבת JS/TS
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