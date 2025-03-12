import { defineConfig } from "auth-astro";
import { User, db, eq } from "astro:db";

import bcrypt from 'bcryptjs';
import Credentials from '@auth/core/providers/credentials';

export default defineConfig({
    providers: [
        Credentials({
            credentials: {
                username: { type: 'string' },
                password: { type: 'password' },
            },
            authorize: async ({ username, password }) => {

                const [user] = await db.select().from(User).where(eq(User.username, `${username}`));

                if (!user) {
                    throw new Error('Invalid credentials');
                }

                if (!bcrypt.compareSync(`${password}`, user.password)) {
                    throw new Error('Invalid credentials');
                }

                return {
                    id: user.id,
                    username: user.username,
                    isSuperAdmin: user.isSuperAdmin,
                }
            }
        }),
    ],
});