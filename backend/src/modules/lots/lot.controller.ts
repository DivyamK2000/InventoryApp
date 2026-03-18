import { Response } from "express";
import mongoose from "mongoose";
import { createLot, getLotsByProduct } from "./lot.service";
import { asyncHandler } from "../../utils/asyncHandler";
import { AuthRequest } from "../../middleware/auth.middleware";

export const createLotController = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = new mongoose.Types.ObjectId(req.user!.id);
    const productId = new mongoose.Types.ObjectId(req.params.productId as string);

    const lots = await createLot(
        req.body,
        productId,
        userId
    );

    res.status(201).json(lots);
});

export const getLotsByProductController = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = new mongoose.Types.ObjectId(req.user!.id);
    const productId = new mongoose.Types.ObjectId(req.params.productId as string);

    const lots = await getLotsByProduct(productId, userId);

    res.status(200).json(lots);
});