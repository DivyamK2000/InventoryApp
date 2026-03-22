import mongoose from "mongoose";
import Lot from "../lots/lot.model";
import Sale from "./sale.model";
import { createMovement } from "../movements/movement.service";
import { CreateSaleDTO } from "./sale.validation";

export const createSale = async(
    userId: mongoose.Types.ObjectId,
    productId: mongoose.Types.ObjectId,
    data: CreateSaleDTO
) => {
    if(data.quantity <= 0) {
        throw new Error("Quantity must be greater than 0")
    }
    
    const session = await mongoose.startSession();

    try {
        return await session.withTransaction(async() => {
            let remainingQuantity = data.quantity;

            const lots = await Lot.find({
                userId,
                productId,
                quantityRemaining: { $gt: 0 }
            })
            .sort({ purchaseDate: 1 })
            .session(session);

            if(lots.length === 0) {
                throw new Error("No Stock Available");
            }

            const salesRecords = [];

            let totalRevenue = 0;
            let totalProfit = 0;

            for (const lot of lots) {
                if(remainingQuantity <= 0) break;

                const available = lot.quantityRemaining;
                const quantityFromLot = Math.min(available, remainingQuantity);

                const purchasePrice = lot.purchasePrice;
                const profit = (data.sellingPrice - purchasePrice) * quantityFromLot;

                const sale = await Sale.create([{
                    userId,
                    productId,
                    lotId: lot._id,
                    quantity: quantityFromLot,
                    purchasePrice,
                    sellingPrice: data.sellingPrice,
                    profit
                }], { session });

                salesRecords.push(sale[0]);

                lot.quantityRemaining -= quantityFromLot;
                await lot.save({ session });

                await createMovement({
                    userId,
                    productId,
                    type: "sale",
                    quantity: -quantityFromLot,
                    lotId: lot._id,
                    lotCode: lot.lotCode,
                    reference: `SAL:${sale[0]._id}`,
                    note: data.note
                }, session);

                totalRevenue += data.sellingPrice * quantityFromLot;
                totalProfit += profit;

                remainingQuantity -= quantityFromLot;
            }

            if(remainingQuantity > 0) {
                throw new Error("Insufficient stock");
            }

            return {
                summary: {
                    totalQuantity: data.quantity,
                    totalRevenue,
                    totalProfit,
                    lotsUsed: salesRecords.length
                },
                breakdown: salesRecords
            };
        });
    }
    
    finally {
        session.endSession();
    }
};