import { z } from "zod";

export const scanSchema = z.object({
    code: z.string().min(1, "Scan code required!")
});