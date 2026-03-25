import mongoose from "mongoose";
import { z } from "zod";

const objectIdSchema = z.string()
    .refine(val => mongoose.Types.ObjectId.isValid(val), {
        message: "Invalid Id"
    })
    .transform(val => new mongoose.Types.ObjectId(val));

export const createSaleSchema = z.object({
    quantity: z.number().int().positive("Quantity must be more than 0"),
    sellingPrice: z.number().positive(),
    note: z.string().trim().max(500).optional()
});

export const productIdParamSchema = z.object({
    productId: objectIdSchema
});

export type CreateSaleDTO = z.infer<typeof createSaleSchema>;