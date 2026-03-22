import mongoose from "mongoose";
import { z } from "zod";

const objectIdSchema = z.string()
  .refine(val => mongoose.Types.ObjectId.isValid(val), {
    message: "Invalid Id"
  })
  .transform(val => new mongoose.Types.ObjectId(val));


export const createProductSchema = z.object({
    name: z.string().trim().min(2, "Product name must be at least 2 characters").max(120),

    prefix: z.string().min(2).max(4).optional()
        .transform(val => val?.toUpperCase().trim()),
    category: z.string().trim().optional(),

    mrp: z.number().nonnegative().optional(),
    codeFormat: z.enum(["barcode", "qr"]),
    lowStockThreshold: z.number().int().min(0).optional(),
    hasExpiry: z.boolean().optional().transform(val => val ?? false)
});

export const updateProductSchema = z.object({
    category: z.string().trim().optional(),
    mrp: z.number().nonnegative().optional(),
    lowStockThreshold: z.number().int().min(0).optional(),
    hasExpiry: z.boolean().optional().transform(val => val ?? false)
});

export const productIdParamSchema = z.object({
    id: objectIdSchema
});

export type CreateProductDTO = z.infer<typeof createProductSchema>;
export type UpdateProductDTO = z.infer<typeof updateProductSchema>;