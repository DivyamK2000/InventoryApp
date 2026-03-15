import { z } from "zod";

export const createProductSchema = z.object({
    name: z.string().min(2, "Product name must be at least 2 characters").max(120),

    prefix: z.string().max(4).optional(),

    category: z.string().max(100).optional(),

    codeFormat: z.enum(["barcode", "qr"]),

    lowStockThreshold: z.number().min(0).optional(),

    hasExpiry: z.boolean().optional()
})