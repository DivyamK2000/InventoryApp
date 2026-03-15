import Lot, { ILot } from "./lot.model";
import mongoose from "mongoose";
import { createMovement } from "../movements/movement.service";
import Product from "../products/product.model";


const generateLotCode = async (productCode: string) => {
    const lastLot = await Lot.findOne({
        lotCode: new RegExp(`^${productCode}-LOT`)
    }).sort({ createdAt: -1 });

    let nextNumber = 1;

    if (lastLot) {
        const lastNumber = parseInt(lastLot.lotCode.split("-L")[1]);
        nextNumber = lastNumber + 1;
    }

    const formatted = String(nextNumber).padStart(2, "0");

    return `${productCode}-L${formatted}`;
}

export const createLot = async (data: Partial<ILot>) => {
    const product = await Product.findById(data.productId);

    if(!product) {
        throw new Error("Product not found");
    }

    if(product.hasExpiry && !data.expiryDate) {
        throw new Error("Expiry date is required for products with expiry");
    }

    const lotCode = await generateLotCode(product.productCode);

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