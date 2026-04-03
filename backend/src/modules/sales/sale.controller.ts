import { Request, Response } from "express";
import { createSale } from "./sale.service";
import { asyncHandler } from "../../utils/asyncHandler";
import { AuthRequest } from "../../middleware/auth.middleware";
import { validateRequest } from "../../utils/validateRequests";
import { createSaleSchema, productIdParamSchema } from "./sale.validation";

export const createSaleController = asyncHandler(async(req: AuthRequest, res: Response) => {
    const userId = req.user!.id;

    const { productId } = validateRequest(productIdParamSchema, req.params)

    const body = validateRequest(createSaleSchema, req.body);
    
    const result = await createSale(
        userId,
        productId,
        body
    );

    res.status(201).json(result);
});