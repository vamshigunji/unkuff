import cron from 'node-cron';
import { spawn } from 'child_process';
import path from 'path';

/**
 * Story [7-5] scheduled-background-ingestion-cron
 * 
 * Sets up a recurring task to run the discovery script every hour.
 */
export function initIngestionCron() {
    console.log("[Cron] Initializing background ingestion scheduler...");

    // Run every hour
    cron.schedule('0 * * * *', () => {
        console.log("[Cron] Triggering hourly job discovery...");
        
        const scriptPath = path.resolve(process.cwd(), 'scripts/run-discovery.ts');
        const child = spawn('npx', ['tsx', scriptPath], {
            stdio: 'inherit',
            env: { ...process.env, NODE_ENV: 'production' }
        });

        child.on('error', (err) => {
            console.error("[Cron] Failed to start discovery script:", err);
        });

        child.on('exit', (code) => {
            if (code === 0) {
                console.log("[Cron] Background ingestion completed successfully.");
            } else {
                console.error(`[Cron] Background ingestion failed with exit code ${code}`);
            }
        });
    });
}
