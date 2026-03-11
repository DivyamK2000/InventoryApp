import Lot, { ILot } from "./lot.model";
import mongoose from "mongoose";
import { createMovement } from "../movements/movement.service";

export const createLot = async (data: Partial<ILot>) => {
    const lot = new Lot(data);
    await lot.save();

    await createMovement(
        lot.productId,
        "purchase",
        lot.quantityInitial,
        lot._id
    );
    
    return lot;
};

export const getLotsByProduct = async (productId: mongoose.Types.ObjectId) => {
    return await Lot.find({ productId }).sort({ purchaseDate: 1 });
};