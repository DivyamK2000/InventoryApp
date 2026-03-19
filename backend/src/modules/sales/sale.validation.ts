import mongoose from "mongoose";
import { z } from "zod";

export const createSaleSchema = z.object({
    productId: z.string()
        .transform((val) => new mongoose.Types.ObjectId(val)),
    quantity: z.number().int().positive("Quantity must be more than 0"),
    sellingPrice: z.number().positive(),
    note: z.string().trim().max(500).optional()
});

export type CreateSaleDTO = z.infer<typeof createSaleSchema>;