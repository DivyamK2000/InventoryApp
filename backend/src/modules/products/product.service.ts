import mongoose from "mongoose";
import Product from "./product.model";
import { CreateProductDTO, UpdateProductDTO } from "./product.validation";
import { getNextSequence } from "../counters/counter.service";
import { NotFoundError } from "../../utils/appError";

const generatorPrefix = (name: string): string => {
    if (!name) return "PRD";

    const clean = name
        .replace(/[^a-zA-Z0-9 ]/g, "")
        .trim()
        .toUpperCase();

    const words = clean.split(" ").filter(Boolean);

    if(words.length == 1) {
        return words[0].slice(0, 3).padEnd(3, "X");
    }

    const initials = words.map(w => w[0]).join("");

    if(initials.length >= 3) {
        return initials.slice(0, 3);
    }

    const combined = words.join("");
    return combined.slice(0, 3).padEnd(3, "X");
};

export const createProduct = async (
    userId: mongoose.Types.ObjectId,
    data: CreateProductDTO
) => {
    const session = await mongoose.startSession();

    try {
        return await session.withTransaction(async() => {
            const prefix = data.prefix || generatorPrefix(data.name!);

            const normalizedPrefix = prefix.toUpperCase().trim();

            const counterKey = `${userId.toString()}-product-${normalizedPrefix}`;

            const seq = await getNextSequence(counterKey, session);

            const productCode = `${normalizedPrefix}-${String(seq).padStart(3, "0")}`;

            const [product] = await Product.create([{
                userId,
                name: data.name,
                productCode,
                codeFormat: data.codeFormat,
                category: data.category,
                mrp: data.mrp,
                lowStockThreshold: data.lowStockThreshold,
                hasExpiry: data.hasExpiry
            }], { session });

            return product;
        });
    } finally {
        session.endSession();
    }
};

export const updateProduct = async(
    userId: mongoose.Types.ObjectId,
    productId: mongoose.Types.ObjectId,
    data: UpdateProductDTO
   
) => {
    const product =  await Product.findOneAndUpdate(
        { userId, _id: productId, isActive: true },
        { $set: data },
        { returnDocument: "after" },
    );

    if(!product) {
    throw new NotFoundError("Product not found");
    }

    return product;
};

export const getAllProducts = async (userId: mongoose.Types.ObjectId) => {
    const product = await Product.find({ userId, isActive: true }).lean();

    if(!product) {
        throw new NotFoundError("User does not have any product");
    }

    return product;
};

export const getProductById = async (userId: mongoose.Types.ObjectId, productId: mongoose.Types.ObjectId) => {
    const product = await Product.findOne({ userId, _id: productId, isActive: true });

    if(!product) {
        throw new NotFoundError("Product not found");
    }

    return product;
};

export const softDeleteProduct = async (userId: mongoose.Types.ObjectId, productId: mongoose.Types.ObjectId) => {
    const product = await Product.findOneAndUpdate(
        { userId, _id: productId, isActive: true },
        {
            isActive: false,
            deletedAt: new Date()
        },
        { returnDocument: "after" }
    );

    if(!product) {
        throw new NotFoundError("Product not found");
    }

    return product;
};