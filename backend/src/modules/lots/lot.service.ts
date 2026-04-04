import Lot from "./lot.model";
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
            try {
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
            }

            catch(err: any) {
                if(err.code === 11000) {
                    throw new BadRequestError(
                        "Lot code already exists",
                        "LOT_DUPLICATE_CODE",
                        err.keyValue
                    );
                }
                
                throw err;
            }
        });
    } 
    
    finally {
        session.endSession();
    }
};

const CHUNK_SIZE = 1000;

export const createBulkLots = async (
    userId: mongoose.Types.ObjectId,
    productId: mongoose.Types.ObjectId,
    data: createBulkLotDTO
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

    const { groups } = data;

    const totalLots = groups.reduce((sum, g) => sum + g.count, 0);

    if(totalLots === 0) {
        throw new BadRequestError(
            "No lots to create",
            "INVALID_INPUT"
        );
    }

    const counterKey = `${userId.toString()}-lot-${productId.toString()}`;
    const { start } =  await getNextSequenceRange(counterKey, totalLots);

    let currentIndex = 0;
    const lotsData: any[] = [];
    const insertedLots: any[] = [];
    const failedLots: any[] = [];

    for(const group of groups) {
        for (let i=0; i < group.count; i++) {
            const {
                purchasePrice,
                quantityInitial,
                purchaseDate,
                mfd,
                bestBefore,
                expiryDate
            } = group;

            const seq = start + currentIndex++;
            const lotCode = `${product.productCode}-L${String(seq).padStart(3, "0")}`;

            if(product.hasExpiry && !expiryDate && !bestBefore) {
                failedLots.push({
                    data: {
                        lotCode,
                        purchasePrice,
                        quantityInitial
                    },
                    error: "EXPIRY_FIELD_REQUIRED"
                });
                continue;
            }
                    

            if (!product.hasExpiry && (expiryDate || mfd || bestBefore)) {
                failedLots.push({
                    data: {
                        lotCode,
                        purchasePrice,
                        quantityInitial
                    },
                    error: "EXPIRY_NOT_SUPPORTED"
                });
                continue;
            }

            lotsData.push({
                userId,
                productId,
                lotCode,

                purchasePrice,
                quantityInitial,
                quantityRemaining: quantityInitial,
                purchaseDate: purchaseDate ?? new Date(),

                ...(mfd && { mfd }),
                ...(bestBefore && { bestBefore }),

                expiryDate: expiryDate ?? (
                    mfd && bestBefore
                        ? calcExpiry({ mfd, bestBefore })
                        : undefined
                )
            });
        }
    }

    for(let i = 0; i < lotsData.length; i += CHUNK_SIZE) {
        const chunk = lotsData.slice(i, i + CHUNK_SIZE);

        try {
            const result = await Lot.insertMany(chunk, {
                ordered: false
            });

            insertedLots.push(...result);
        }

        catch (err: any) {
            if(err.writeErrors) {
                const failedIndexes =  err.writeErrors.map((e: any) => e.index);

                failedIndexes.forEach((idx: number) => {
                    const errorObj = err.writeErrors.find((e: any) => e.index === idx);

                    failedLots.push({
                        data: chunk[idx],
                        error: errorObj?.code === 11000 ? "LOT_DUPLICATE_CODE" : "DB_WRITE_ERROR"
                    });
                });

               const successDoc = chunk.filter((_, idx) => !failedIndexes.includes(idx));

               const inserted = await Lot.find({
                    userId,
                    productId,
                    lotCode: { $in: successDoc.map(d => d.lotCode) }
               }).sort({ createdAt: -1 });

               insertedLots.push(...inserted);
            }

            else {
                chunk.forEach(item => {
                    failedLots.push({
                        data: item,
                        error: err.message || "UNKNOWN_ERROR"
                    });
                });
            }
        }
    }

    if(insertedLots.length > 0) {
        const movements: CreateMovementDTO[] = insertedLots.map(lot => ({
            userId,
            productId,
            type: "purchase",
            quantity: lot.quantityInitial,
            lotId: lot._id,
            lotCode: lot.lotCode,
            reference: `PUR:${lot.lotCode}`
        }));

        await createMovementBulk(movements);
    }

    return {
        successCount: insertedLots.length,
        failedCount: failedLots.length,
        insertedLots,
        failedLots
    };
};

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

    const lots = await Lot.find({ userId, productId })
        .select("lotCode quantityRemaining expiryDate purchaseDate")
        .sort({ purchaseDate: 1 })
        .lean();

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