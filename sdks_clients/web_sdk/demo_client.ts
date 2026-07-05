import { TokenGuardClient } from './sdk';

const tg = new TokenGuardClient("tg-sk-admin123456789", "http://127.0.0.1:8000");

const promptsToTest = [
    { dept: "dept_support_003", prompt: "Explain what a firewall is to a 10-year-old in one short paragraph." },
    
    { dept: "dept_rnd_001", prompt: "Write a comprehensive Python script using asyncio to scrape a paginated website, handle rate limits, and save the data to a SQLite database. Include error handling and comments." },
    
    { dept: "dept_support_003", prompt: "Explain what a firewall is to a 10-year-old in one short paragraph." }
];

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function runLiveTesting() {
    console.log("Starting TokenGuard Live Testing Client (TypeScript Edition)...\n");

    for (let i = 0; i < promptsToTest.length; i++) {
        const test = promptsToTest[i];
        console.log(`[${i + 1}/${promptsToTest.length}] Sending request for Department: '${test.dept}'`);
        console.log(`Prompt: '${test.prompt}'`);

        const result = await tg.generate(test.dept, test.prompt);

        console.log(`Status: ${result.status}`);
        console.log(`Source: ${result.source}`);
        
        console.log("\n--- AI Response ---");
        console.log(result.response);
        console.log("----------------------\n");
        console.log("=".repeat(70) + "\n");

        await sleep(3000);
    }

    console.log("Web SDK live testing completed.");
}

runLiveTesting();