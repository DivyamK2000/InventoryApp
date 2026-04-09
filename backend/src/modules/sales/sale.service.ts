import mongoose from "mongoose";
import Product from "../products/product.model";
import Lot from "../lots/lot.model";
import Sale from "./sale.model";
import { createMovement } from "../movements/movement.service";
import { CreateSaleDTO } from "./sale.validation";
import { BadRequestError } from "../../utils/AppError";

export const createSale = async(
    userId: mongoose.Types.ObjectId,
    productId: mongoose.Types.ObjectId,
    data: CreateSaleDTO
) => {
    if(data.quantity <= 0) {
        throw new BadRequestError(
            "Quantity must be greater than 0",
            "SALE_INVALID_QUANTITY",
            { field: "quantity" }
        );
    }
    
    const session = await mongoose.startSession();

    try {
        return await session.withTransaction(async() => {
            const saleGroupId = new mongoose.Types.ObjectId();

            const product = await Product.findOne({
                _id: productId,
                userId,
                isActive: true
            }).session(session);

            if(!product) {
                throw new BadRequestError(
                    "Product not found",
                    "PRODUCT_NOT_FOUND"
                );
            }

            let sortCondition: Record<string, 1 | -1>;

            if (product.hasExpiry) {
                sortCondition = { expiryDate: 1 };
            } else {
                sortCondition = { purchaseDate: 1 };
            }

            let remainingQuantity = data.quantity;

            const lotQuery: any = {
                userId,
                productId,
                quantityRemaining: { $gt: 0 },
                isActive: true
            };

            if(product.hasExpiry) {
                lotQuery.expiryDate = { $gt : new Date() };
            }

            const lots = await Lot.find(lotQuery)
                .sort(sortCondition)
                .session(session);

            if(lots.length === 0) {
                throw new BadRequestError(
                    "No Stock Available",
                    "INVENTORY_OUT_OF_STOCK"
                );
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
                    saleGroupId,
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
                    reference: `SAL:${saleGroupId}`,
                    note: data.note
                }, session);

                totalRevenue += data.sellingPrice * quantityFromLot;
                totalProfit += profit;

                remainingQuantity -= quantityFromLot;
            }

            if(remainingQuantity > 0) {
                throw new BadRequestError(
                    "Insufficient stock",
                    "INVENTORY_INSUFFICIENT_STOCK",
                    {
                        requested: data.quantity,
                        available: data.quantity - remainingQuantity
                    }
                );
            }

            return {
                summary: {
                    saleGroupId,
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