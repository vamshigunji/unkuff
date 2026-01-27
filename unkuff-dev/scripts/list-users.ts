// List all users in the database
import 'dotenv/config';
import { db } from '../src/lib/db';
import { users } from '../src/features/auth/schema';

async function listUsers() {
    const allUsers = await db.select({
        id: users.id,
        email: users.email,
        name: users.name,
    }).from(users);

    console.log('All users:');
    allUsers.forEach((u, i) => {
        console.log(`  ${i + 1}. ${u.email} (${u.name || 'no name'}) - ID: ${u.id}`);
    });

    process.exit(0);
}

listUsers().catch(console.error);
