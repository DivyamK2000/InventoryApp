import { z } from "zod";
import mongoose from "mongoose";

const objectId = z.union([
    z.string().refine((val) => mongoose.Types.ObjectId.isValid(val),{
        message: "Invalid ObjectId"
    }),
    z.instanceof(mongoose.Types.ObjectId)
]).transform((val) => {
    if (typeof val === "string") { 
        return new mongoose.Types.ObjectId(val);
    } 
    return val;
});

export const referencePrefix = ["PUR", "SAL", "ADJ"] as const;

export const createMovementSchema = z.object({
    userId: objectId,
    productId: objectId,
    lotId: objectId,
    lotCode: z.string(),
    type: z.enum(["purchase", "sale", "adjustment"]),
    quantity: z.number(),
    reference: z.string(),
    note: z.string().trim().max(500).optional()
});

export type CreateMovementDTO = z.infer<typeof createMovementSchema>;