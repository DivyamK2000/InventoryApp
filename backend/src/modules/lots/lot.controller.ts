import { Response } from "express";
import mongoose from "mongoose";
import { createLot, getLotsByProduct } from "./lot.service";
import { asyncHandler } from "../../utils/asyncHandler";
import { AuthRequest } from "../../middleware/auth.middleware";

export const createLotController = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = new mongoose.Types.ObjectId(req.user!.id);
    
    const lots = await createLot(
        userId,
        req.body.productId,
        req.body
    );

    res.status(201).json(lots);
});

export const getLotsByProductController = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = new mongoose.Types.ObjectId(req.user!.id);
    
    const lots = await getLotsByProduct(req.body.productId, userId);

    res.status(200).json(lots);
});