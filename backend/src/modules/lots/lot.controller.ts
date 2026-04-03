import { Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { AuthRequest } from "../../middleware/auth.middleware";
import { createBulkLot, createLot, getLotsByProduct, softDeleteLot } from "./lot.service";
import { createLotSchema, productIdParamSchema, lotIdParamSchema, createBulkLotSchema } from "./lot.validation";
import { validateRequest } from "../../utils/validateRequests";
import { UnauthorizedError } from "../../utils/AppError";

export const createLotController = asyncHandler(async (req: AuthRequest, res: Response) => {
    if(!req.user) {
        throw new UnauthorizedError("Unauthorized", "AUTH_UNAUTHORIZED");
    }

    const userId = req.user.id;
    
    const { productId } = validateRequest(
        productIdParamSchema,
        req.params
    );
    
    const body = validateRequest(createLotSchema, req.body);

    const lot = await createLot(
        userId,
        productId,
        body
    );

    res.status(201).json(lot);
});

export const createBulkLotsController = asyncHandler(async(req: AuthRequest, res: Response) => {
    if(!req.user) {
        throw new UnauthorizedError("Unauthorized", "AUTH_UNAUTHORIZED");
    }

    const userId = req.user.id;

    const { productId } = validateRequest(
        productIdParamSchema,
        req.params
    );

    const body = validateRequest(createBulkLotSchema, req.body);

    const lots = await createBulkLot(userId, productId, body);

    res.status(201).json(lots);
})

export const getLotsByProductController = asyncHandler(async (req: AuthRequest, res: Response) => {
    if(!req.user) {
        throw new UnauthorizedError("Unauthorized", "AUTH_UNAUTHORIZED");
    }
    
    const userId = req.user.id;

    const { productId } = validateRequest(
        productIdParamSchema,
        req.params
    );
    
    const lots = await getLotsByProduct(userId, productId);

    res.status(200).json(lots);
});

export const softDeleteLotController = asyncHandler(async(req: AuthRequest, res: Response) => {
    if(!req.user) {
        throw new UnauthorizedError("Unauthorized", "AUTH_UNAUTHORIZED");
    }
    
    const userId = req.user.id;

    const { productId } = validateRequest(
        productIdParamSchema,
        req.params
    );

    const { lotId } = validateRequest(
        lotIdParamSchema,
        req.params
    );

    const lot = await softDeleteLot(userId, productId, lotId);

    res.status(200).json(lot);
})