import Lot, { ILot } from "./lot.model";
import mongoose from "mongoose";
import { createMovement } from "../movements/movement.service";
import Product from "../products/product.model";
import { CreateLotDTO} from "./lot.validation";
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

            const lotData = {
                purchasePrice: data.purchasePrice,
                quantityInitial: data.quantityInitial,
                purchaseDate: data.purchaseDate ?? new Date(),

                ...(product.hasExpiry && {
                    mfd: data.mfd,
                    bestBefore: data.bestBefore
                })
            };

            if(product.hasExpiry) {
                if(!data.mfd || !data.bestBefore) {
                    throw new Error("Expiry details required");
                }
            }

            

            const counterKey =  `${userId.toString()}-lot-${productId.toString()}`;

            const seq = await getNextSequence(counterKey, session);

            const lotCode = `${product.productCode}-L${String(seq).padStart(2, "0")}`;

            const [lot] = await Lot.create([{
                userId,
                productId,
                lotCode,
                ...lotData,
                quantityRemaining: data.quantityInitial,
            }], { session });

            await createMovement({
                userId,
                productId,
                type: "purchase",
                quantity: lot.quantityInitial,
                lotId: lot._id,
                lotCode: lot.lotCode,
                reference: `PUR:${lot.lotCode}`
            }, session);
    
            return lot;
        });
    }

    finally {
        session.endSession()
    }
}

export const getLotsByProduct = async (
    userId: mongoose.Types.ObjectId,
    productId: mongoose.Types.ObjectId
) => {
    return await Lot.find({
        userId,
        productId
    }).sort({ purchaseDate: 1 });
};
