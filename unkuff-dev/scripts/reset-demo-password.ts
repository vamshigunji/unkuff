// Reset password for demo user
import 'dotenv/config';
import { db } from '../src/lib/db';
import { users } from '../src/features/auth/schema';
import { eq } from 'drizzle-orm';
import { hash } from 'bcryptjs';

async function resetDemoPassword() {
    const hashedPassword = await hash('demo123', 10);

    await db.update(users)
        .set({ password: hashedPassword })
        .where(eq(users.email, 'demo@unkuff.com'));

    console.log('✅ Password reset for demo@unkuff.com');
    console.log('   New password: demo123');
    process.exit(0);
}

resetDemoPassword().catch(console.error);
