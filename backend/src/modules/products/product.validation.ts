import { z } from "zod";

const objectIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/);

export const createProductSchema = z.object({
    userId: objectIdSchema,
    name: z.string().trim().min(1),
    productCode: z.string().min(1),
    codeFormat: z.enum(["barcode", "qr"]),
    category: z.string().trim().optional()
});

export const productIdParamSchema = z.object({
    id: objectIdSchema
})