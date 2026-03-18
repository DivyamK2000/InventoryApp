import Lot, { ILot } from "./lot.model";
import mongoose from "mongoose";
import { createMovement } from "../movements/movement.service";
import Product from "../products/product.model";
import { createLotDTO } from "./lot.validation";
import { getNextSequence } from "../counters/counter.service";

export const createLot = async (
    data: createLotDTO,
    productId: mongoose.Types.ObjectId,
    userId: mongoose.Types.ObjectId
) => {
    const product = await Product.findOne({
        _id: productId,
        userId
    });

    if(!product) {
        throw new Error("Product not found or unauthorized");
    }

    if(product.hasExpiry && !data.expiryDate) {
        throw new Error("Expiry date is required for products with expiry");
    }

    const counterKey =  `${userId.toString()}-lot-${productId.toString()}`;

    const seq = await getNextSequence(counterKey);

    const lotCode = `${product.productCode}-L${String(seq).padStart(2, "0")}`;

    const lot = new Lot({
        userId,
        productId,
        lotCode,
        purchasePrice: data.purchasePrice,
        quantityInitial: data.quantityInitial,
        quantityRemaining: data.quantityInitial,
        expiryDate: data.expiryDate
    });

    await lot.save();

    await createMovement(
        lot.productId,
        "purchase",
        lot.quantityInitial,
        lot._id
    );
    
    return lot;
};

export const getLotsByProduct = async (
    productId: mongoose.Types.ObjectId,
    userId: mongoose.Types.ObjectId
) => {
    return await Lot.find({
        productId,
        userId
    }).sort({ purchaseDate: 1 });
};