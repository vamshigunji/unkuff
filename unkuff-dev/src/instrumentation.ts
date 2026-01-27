export async function register() {
    if (process.env.NEXT_RUNTIME === 'nodejs') {
        const { initMatchEvents, runStartupMaintenance } = await import('@/features/matching/match-service');
        initMatchEvents();

        // AC3: Scheduled Maintenance / Startup Check
        // Run non-blocking to avoid delaying startup
        void runStartupMaintenance().catch(err => console.error("Startup maintenance failed:", err));
    }
}
