import { defineAction } from "astro:actions";
import { z } from "astro:schema";

const userSchema = z.object({
    username: z.string().min(3),
    password: z.string().min(6),
    passwordConfirm: z.string().min(6),
});

export const registerUser = defineAction({
    accept: 'form',
    input: userSchema,
    async handler({ username, password, passwordConfirm }, { cookies }) {
        if (password !== passwordConfirm) {
            throw new Error('Passwords do not match');
        }

        // Save user to database
        // await db.User.insert({ username, password });

        // Set user session
        cookies.set('user', { username });

        return { username };
    },
});
