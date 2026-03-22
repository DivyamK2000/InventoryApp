import { Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { AuthRequest } from "../../middleware/auth.middleware";
import { createLot, getLotsByProduct } from "./lot.service";
import { createLotSchema, productIdParamSchema, lotIdParamSchema } from "./lot.validation";
import { validateRequest } from "../../utils/validateRequests";

export const createLotController = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user!.id;
    
    const { id: productId } = validateRequest(
        productIdParamSchema,
        req.params
    );
    
    const body = validateRequest(createLotSchema, req.body);

    const lots = await createLot(
        userId,
        productId,
        body
    );

    res.status(201).json(lots);
});

export const getLotsByProductController = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user!.id;

    const { id: productId } = validateRequest(
        productIdParamSchema,
        req.params
    );
    
    const lots = await getLotsByProduct(userId, productId);

    res.status(200).json(lots);
});