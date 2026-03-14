import { z } from "zod";

export const createSaleSchema = z.object({
    productId: z.string(),
    quantity: z.number().int().positive(),
    sellingPrice: z.number().positive()
})