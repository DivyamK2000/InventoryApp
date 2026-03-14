import { z } from "zod";

export const createLotSchema = z.object({
    purchasePrice: z.number().positive(),
    quantityInitial: z.number().int().positive(),
    expiryDate: z.string().optional()
});