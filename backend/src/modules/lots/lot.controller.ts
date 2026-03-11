import { Request, Response } from "express";
import mongoose from "mongoose";
import { createLot, getLotsByProduct } from "./lot.service";

export const createLotController = async (req: Request, res: Response) => {
    const productIdParam = req.params.productId as string;

    if (!mongoose.Types.ObjectId.isValid(productIdParam)) {
        res.status(400);
        throw new Error("Invalid productId");
    }

    const productId = new mongoose.Types.ObjectId(productIdParam);

    const lots = await createLot({
        productId,
        purchasePrice: req.body.purchasePrice,
        quantityInitial: req.body.quantityInitial,
        quantityRemaining: req.body.quantityInitial
    });

    res.status(201).json(lots);
};

export const getLotsByProductController = async (req: Request, res: Response) => {
    const productIdParam = req.params.productId as string;

    if(!mongoose.Types.ObjectId.isValid(productIdParam)) {
        res.status(400);
        throw new Error("Invalid productId");
    }

    const productId = new mongoose.Types.ObjectId(productIdParam);

    const lots = await getLotsByProduct(productId);

    res.status(200).json(lots);
};