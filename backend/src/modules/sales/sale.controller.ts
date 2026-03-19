import { Request, Response } from "express";
import mongoose from "mongoose";
import { createSale } from "./sale.service";
import { asyncHandler } from "../../utils/asyncHandler";
import { AuthRequest } from "../../middleware/auth.middleware";

export const createSaleController = asyncHandler(async(req: AuthRequest, res: Response) => {
    const userId = new mongoose.Types.ObjectId(req.user!.id);
    
    const result = await createSale(
        userId,
        req.body.productId,
        req.body
    );

    res.status(201).json(result);
});