import Lot, { ILot } from "./lot.model";
import mongoose from "mongoose";
import { createMovement, createMovementBulk } from "../movements/movement.service";
import Product from "../products/product.model";
import { createBulkLotDTO, CreateLotDTO } from "./lot.validation";
import { getNextSequence, getNextSequenceRange } from "../counters/counter.service";
import { BadRequestError, NotFoundError } from "../../utils/AppError";
import { CreateMovementDTO } from "../movements/movement.validation";
import { calcExpiry } from "../../utils/calculateExpiry";

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
                _id: productId,
                isActive: true
            }).session(session);

            if(!product) {
                throw new NotFoundError(
                    "Product not found",
                    "PRODUCT_NOT_FOUND"
                );
            }

            const { 
                purchasePrice,
                quantityInitial,
                purchaseDate,
                mfd,
                bestBefore,
                expiryDate
            } = data;

            const baseData = {
                purchasePrice,
                quantityInitial,
                purchaseDate: purchaseDate ?? new Date()
            };

            const expiryData = {
                ...(mfd && { mfd }),
                ...(bestBefore && { bestBefore }),
                ...(expiryDate && { expiryDate })
            };

            const counterKey =  `${userId.toString()}-lot-${productId.toString()}`;

            const seq = await getNextSequence(counterKey, session);

            const lotCode = `${product.productCode}-L${String(seq).padStart(3, "0")}`;

            if(product.hasExpiry && !data.expiryDate && !data.bestBefore) {
                throw new BadRequestError(
                    "Expiry required for this product",
                    "EXPIRY_FIELD_REQUIRED"
                );
            }

            if(!product.hasExpiry && (expiryDate || mfd || bestBefore)) {
                throw new BadRequestError(
                    "This product does not support expiry",
                    "EXPIRY_NOT_SUPPORTED"
                );
            }

            const lotData = {
                userId,
                productId,
                lotCode,
                ...baseData,
                ...expiryData,
                quantityRemaining: quantityInitial,
            };

            const [lot] = await Lot.create([lotData], { session });

            const { _id: lotId } = lot;

            const movements: CreateMovementDTO = {
                userId,
                productId,
                type: "purchase",
                quantity: quantityInitial,
                lotId,
                lotCode,
                reference: `PUR:${lotCode}`
            }

            await createMovement(movements, session);
    
            return lot;
        });
    } catch(err: any) {
        if(err.code === 11000) {
            throw new BadRequestError(
                "Lot code already exists",
                "LOT_DUPLICATE_CODE",
                err.keyValue
            );
        }

        throw err;
    } finally {
        session.endSession();
    }
};

export const createBulkLot = async(
    userId: mongoose.Types.ObjectId,
    productId: mongoose.Types.ObjectId,
    data: createBulkLotDTO
) => {
    const session = await mongoose.startSession();

    try {
        return await session.withTransaction(async() => {
            const product = await Product.findOne({
                userId,
                _id: productId,
                isActive: true
            }).session(session);

            if(!product) {
                throw new NotFoundError(
                    "Product not found",
                    "PRODUCT_NOT_FOUND"
                );
            }

            const { groups } = data;

            const expandedLots = groups.flatMap(group => {
                const { count, ...rest } = group;
                return Array.from({ length: count }, () => ({
                    ...rest
                }));
            });
            
            const totalLots = groups.reduce((sum, g) => sum + g.count, 0);

            if(totalLots === 0) {
                throw new BadRequestError(
                    "No lots to create", 
                    "INVALID_INPUT"
                );
            }

            const counterKey =  `${userId.toString()}-lot-${productId.toString()}`;

            const { start } = await getNextSequenceRange(counterKey, totalLots, session);

            if(product.hasExpiry && groups.some(g => !g.expiryDate && !g.bestBefore)) {
                throw new BadRequestError(
                    "Expiry required for this product", 
                    "EXPIRY_FIELD_REQUIRED"
                );
            }

            if(!product.hasExpiry && groups.some(g => g.expiryDate || g.bestBefore)) {
                throw new BadRequestError(
                    "This product does not support expiry", 
                    "EXPIRY_NOT_SUPPORTED"
                );
            }

            const lotsData = expandedLots.map((lot, index) => {
                const seq = start + index;

                const {
                    purchasePrice,
                    quantityInitial,
                    purchaseDate,
                    mfd,
                    bestBefore,
                    expiryDate
                } = lot;

                return {
                    userId,
                    productId,
                    lotCode: `${product.productCode}-L${String(seq).padStart(3, "0")}`,

                    purchasePrice,
                    quantityInitial,
                    quantityRemaining: quantityInitial,
                    purchaseDate: purchaseDate ?? new Date(),

                    ...(mfd && { mfd: mfd }),
                    ...(bestBefore && { bestBefore: bestBefore }),
                    
                    expiryDate: expiryDate ?? (
                        mfd && bestBefore
                            ? calcExpiry({ mfd, bestBefore })
                            : undefined
                    )
                };
            });

            const lots = await Lot.insertMany(lotsData, {session});

            const movements: CreateMovementDTO[] = lots.map(lot => ({
                userId,
                productId,
                type: "purchase",
                quantity: lot.quantityInitial,
                lotId: lot._id,
                lotCode: lot.lotCode,
                reference: `PUR:${lot.lotCode}`
            }));

            await createMovementBulk(movements, session);

            return lots;
        });
    } catch(err: any) {
        if(err.code === 11000) {
            throw new BadRequestError(
                "One or more lot code already exists",
                "LOT_DUPLICATE_CODE",
                err.keyValue
            );
        }
        
        throw err;
    } finally {
        session.endSession();
    }
}

export const getLotsByProduct = async (
    userId: mongoose.Types.ObjectId,
    productId: mongoose.Types.ObjectId
) => {
    const product = await Product.findOne({
        userId,
        _id: productId,
        isActive: true
    });

    if(!product) {
        throw new NotFoundError(
            "Product not found",
            "PRODUCT_NOT_FOUND"
        );
    }

    const lots = await Lot.find({
        userId,
        productId,
    }).sort({ purchaseDate: 1 }).lean();

    return lots
};

export const softDeleteLot = async(
    userId: mongoose.Types.ObjectId,
    productId: mongoose.Types.ObjectId,
    lotId: mongoose.Types.ObjectId,
) => {
    const lot = await Lot.findOneAndUpdate(
        { userId, productId, _id: lotId, isActive: true },
        {
            isActive: false,
            deletedAt: new Date()
        },
        { returnDocument: "after" }
    );

    if(!lot) {
        throw new NotFoundError(
            "Lot already deleted or does not exist",
            "LOT_NOT_FOUND"
        )
    }

    return lot;
}