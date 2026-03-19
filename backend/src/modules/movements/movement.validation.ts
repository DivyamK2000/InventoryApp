import { z } from "zod";
import mongoose from "mongoose";

const objectId = z.string().transform((val) => new mongoose.Types.ObjectId(val));

export const movementTypes = ["purchase", "sale", "adjustment"] as const;

export const referencePrefix = ["PUR", "SAL", "ADJ"] as const;

export const createMovementSchema = z.object({
    userId: objectId,
    productId: objectId,
    lotId: objectId,
    lotCode: z.string(),
    type: z.enum(movementTypes),
    quantity: z.number(),
    reference: z.string(),
    note: z.string().trim().max(500).optional()
});

export type CreateMovementDTO = z.infer<typeof createMovementSchema>;