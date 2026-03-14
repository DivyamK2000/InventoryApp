import { Request, Response } from "express";
import mongoose from "mongoose";
import { createLot, getLotsByProduct } from "./lot.service";
import { asyncHandler } from "../../utils/asyncHandler";

export const createLotController = asyncHandler(async (req: Request<{ productId: string }>, res: Response) => {
    const productId = new mongoose.Types.ObjectId(req.params.productId);

    const lots = await createLot({
        productId,
        purchasePrice: req.body.purchasePrice,
        quantityInitial: req.body.quantityInitial,
        quantityRemaining: req.body.quantityInitial
    });

    res.status(201).json(lots);
});

export const getLotsByProductController = asyncHandler(async (req: Request<{ productId: string }>, res: Response) => {
    const productId = new mongoose.Types.ObjectId(req.params.productId);

    const lots = await getLotsByProduct(productId);

    res.status(200).json(lots);
});