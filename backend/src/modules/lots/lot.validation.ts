import { z } from "zod";

export const createLotSchema = z.object({
    purchasePrice: z.number().positive(),
    quantityInitial: z.number().int().positive(),
    expiryDate: z.string().optional()
        .transform((val) => (val ? new Date(val) : undefined))
        .refine((date) => !date || !isNaN(date.getTime()), {
            message: "Invalid expiry date"
        })
});

export type createLotDTO = z.infer<typeof createLotSchema>;