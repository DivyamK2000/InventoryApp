import mongoose from "mongoose";
import { z } from "zod";

export const createLotSchema = z.object({
    productId:z.string()
        .transform((val) => new mongoose.Types.ObjectId(val)),
    purchasePrice: z.number().positive(),
    quantityInitial: z.number().int().positive(),
    expiryDate: z.string().optional()
        .transform((val) => (val ? new Date(val) : undefined))
        .refine((date) => !date || !isNaN(date.getTime()), {
            message: "Invalid expiry date"
        })
});

export type CreateLotDTO = z.infer<typeof createLotSchema>;