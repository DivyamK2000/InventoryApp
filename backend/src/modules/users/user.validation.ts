import { z } from "zod";

export const createUserSchema = z.object({
    name: z.string().min(5).max(120),
    email: z.string().email().min(10).max(200),
    password: z.string().min(6).max(200)
});

export const loginUserSchema = z.object({
    email: z.string().email().min(1),
    password: z.string().min(1)
});

export type registerUserDTO = z.infer<typeof createUserSchema>;

export type loginUserDTO = z.infer<typeof loginUserSchema>;