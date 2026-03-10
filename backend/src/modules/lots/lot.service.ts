import Lot, { ILot } from "./lot.model";
import mongoose from "mongoose";

export const createLot = async (data: Partial<ILot>) => {
    const lot = new Lot(data);
    return await lot.save();
};

export const getLotsByProduct = async (productId: mongoose.Types.ObjectId) => {
    return await Lot.find({ productId }).sort({ purchaseDate: 1 });
};