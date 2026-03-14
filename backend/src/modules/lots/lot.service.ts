import Lot, { ILot } from "./lot.model";
import mongoose from "mongoose";
import { createMovement } from "../movements/movement.service";
import Product from "../products/product.model";

export const createLot = async (data: Partial<ILot>) => {
    const product = await Product.findById(data.productId);

    if(!product) {
        throw new Error("Product not found");
    }

    if(product.hasExpiry && !data.expiryDate) {
        throw new Error("Expiry date is required for products with expiry");
    }

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