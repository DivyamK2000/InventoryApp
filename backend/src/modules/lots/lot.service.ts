import Lot, { ILot } from "./lot.model";
import mongoose from "mongoose";
import { createMovement } from "../movements/movement.service";
import Product from "../products/product.model";
import { CreateLotDTO } from "./lot.validation";
import { getNextSequence } from "../counters/counter.service";

export const createLot = async (
    userId: mongoose.Types.ObjectId,
    productId: mongoose.Types.ObjectId,
    data: CreateLotDTO
) => {
    
    const session = await mongoose.startSession();

    try {
        return await session.withTransaction(async() => {
            

            const product = await Product.findOne({
                userId,
                _id: productId
                
            }).session(session);

            if(!product) {
                throw new Error("Product not found or unauthorized");
            }

            if(product.hasExpiry && !data.expiryDate) {
                throw new Error("Expiry date is required for products with expiry");
            }

            const counterKey =  `${userId.toString()}-lot-${productId.toString()}`;

            const seq = await getNextSequence(counterKey, session);

            const lotCode = `${product.productCode}-L${String(seq).padStart(2, "0")}`;

            const lot = await Lot.create([{
                userId,
                productId,
                lotCode,
                purchasePrice: data.purchasePrice,
                quantityInitial: data.quantityInitial,
                quantityRemaining: data.quantityInitial,
                expiryDate: data.expiryDate
            }], { session });

            const crLot = lot[0];

            await createMovement({
                userId,
                productId,
                type: "purchase",
                quantity: crLot.quantityInitial,
                lotId: crLot._id,
                lotCode: crLot.lotCode,
                reference: `PUR:${crLot.lotCode}`
            }, session);
    
            return crLot;
        });
    }

    finally {
        session.endSession()
    }
}

export const getLotsByProduct = async (
    productId: mongoose.Types.ObjectId,
    userId: mongoose.Types.ObjectId
) => {
    return await Lot.find({
        userId,
        productId
    }).sort({ purchaseDate: 1 });
};

