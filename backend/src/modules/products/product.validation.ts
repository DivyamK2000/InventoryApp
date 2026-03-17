import { z } from "zod";

const objectIdSchema =  z.string().regex(/^[0-9a-fA-F]{24}$/)

export const createProductSchema = z.object({
    name: z.string().trim().min(2, "Product name must be at least 2 characters").max(120),

    prefix: z.string().trim().toUpperCase().min(2).max(4).optional(),

    category: z.string().trim().optional(),

    codeFormat: z.enum(["barcode", "qr"]),

    lowStockThreshold: z.number().int().min(0).optional(),

    hasExpiry: z.boolean().optional()
}).strict();

export const productIdParamSchema = z.object({
    id: objectIdSchema
});

type createProductInput = z.infer<typeof createProductSchema>;

export type createProductDTO = createProductInput & {
    userId: string;
} 