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
    purchaseDate: z.preprocess(val => val
        ? new Date(val as string) : undefined,
        z.date().optional()
    ),
    mfd: z.preprocess(val => val
        ? new Date(val as string) : undefined,
        z.date().optional()
    ),
    bestBefore: z.object({
        value: z.number().positive(),
        unit: z.enum(["day", "week", "month", "year"])
    }).optional(),
    expiryDate: z.preprocess(val => val
        ? new Date(val as string) : undefined,
        z.date().optional()
    )
});

export const productIdParamSchema = z.object({
    id: objectIdSchema
});

export const lotIdParamSchema = z.object({
    id: objectIdSchema
});

export type CreateLotDTO = z.infer<typeof createLotSchema>;