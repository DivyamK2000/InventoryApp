import mongoose from "mongoose";
import { z } from "zod";

const objectIdSchema = z.string()
    .refine(val => mongoose.Types.ObjectId.isValid(val), {
        message: "Invalid Id"
    })
    .transform(val => new mongoose.Types.ObjectId(val));

export const createLotSchema = z.object({
    purchasePrice: z.number().positive(),
    quantityInitial: z.number().int().positive(),
    expiryDate: z.string().optional()
        .transform((val) => (val ? new Date(val) : undefined))
        .refine((date) => !date || !isNaN(date.getTime()), {
            message: "Invalid expiry date"
        })
});

export const productIdParamSchema = z.object({
    id: objectIdSchema
});

export const lotIdParamSchema = z.object({
    id: objectIdSchema
});

export type CreateLotDTO = z.infer<typeof createLotSchema>;