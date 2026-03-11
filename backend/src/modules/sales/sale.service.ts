import mongoose from "mongoose";
import Lot from "../lots/lot.model";
import Sale from "./sale.model";
import { createMovement } from "../movements/movement.service";

export const createSale = async(
    productId: mongoose.Types.ObjectId,
    quantity: number,
    sellingPrice: number
) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        let remainingQuantity = quantity;

        const lots = await Lot.find({
            productId,
            quantityRemaining: { $gt: 0 }
        }).sort({ purchaseDate: 1 });

        if(lots.length === 0) {
            throw new Error("No Stock Available");
        }

        const salesRecords = [];

        for (const lot of lots) {
            if(remainingQuantity <= 0) break;

            const available = lot.quantityRemaining;

            const quantityFromLot = Math.min(available, remainingQuantity);

            const purchasePrice = lot.purchasePrice;

            const profit = (sellingPrice - purchasePrice) * quantityFromLot;

            const sale = await Sale.create({
                productId,
                lotId: lot._id,
                quantity: quantityFromLot,
                purchasePrice,
                sellingPrice,
                profit
            });

            salesRecords.push(sale);

            lot.quantityRemaining -= quantityFromLot;
            await lot.save();

            await createMovement(
                productId,
                "sale",
                -quantityFromLot,
                lot._id,
            );

            remainingQuantity -= quantityFromLot;
        }

        if(remainingQuantity > 0) {
            throw new Error("Insufficient stock");
        }

        await session.commitTransaction();
        session. endSession();

        return salesRecords;
    }
    catch (error) {
        await session.abortTransaction();
        session.endSession();

        throw error;
    }    
};