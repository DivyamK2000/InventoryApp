import { Request, Response } from "express";
import mongoose from "mongoose";
import { createSale } from "./sale.service";
import { asyncHandler } from "../../utils/asyncHandler";

export const createSaleController = asyncHandler(async(req: Request, res: Response) => {
    const result = await createSale(
        new mongoose.Types.ObjectId(req.body.productId),
        req.body.quantity,
        req.body.sellingPrice
    );

    res.status(201).json(result);
});