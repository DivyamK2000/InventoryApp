import { Request, Response } from "express";
import { createSale } from "./sale.service";
import { asyncHandler } from "../../utils/asyncHandler";
import { AuthRequest } from "../../middleware/auth.middleware";
import { validateRequest } from "../../utils/validateRequests";
import { createSaleSchema, productIdParamSchema } from "./sale.validation";
import { SendResponse } from "../../utils/SendResponse";
import { UnauthorizedError } from "../../utils/AppError";

export const createSaleController = asyncHandler(async(req: AuthRequest, res: Response) => {
    if(!req.user) {
        throw new UnauthorizedError("Unauthorized", "AUTH_UNAUTHORIZED");
    }

    const userId = req.user.id;

    const { productId } = validateRequest(productIdParamSchema, req.params)

    const body = validateRequest(createSaleSchema, req.body);
    
    const result = await createSale(
        userId,
        productId,
        body
    );

    return SendResponse(
        req,
        res,
        201,
        "Sale created",
        result
    );
});