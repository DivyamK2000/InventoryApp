import { Request, Response } from "express";
import mongoose from "mongoose";
import { createSale } from "./sale.service";
import { asyncHandler } from "../../utils/asyncHandler";

export const createSaleController = asyncHandler(async(req: Request, res: Response) => {
    const { productId, quantity, sellingPrice } = req.body;

    if(!mongoose.Types.ObjectId.isValid(productId)) {
        res.status(400);
        throw new Error("Invalid Product!");
    }

    if(!quantity || quantity <= 0) {
        res.status(400);
        throw new Error("Inavlid Quantity!");
    }

    if(!sellingPrice || sellingPrice <= 0) {
        res.status(400);
        throw new Error("Invalid Selling Price!");
    }

    const sales = await createSale(
        new mongoose.Types.ObjectId(productId),
        quantity,
        sellingPrice
    );

    res.status(201).json(sales);
});