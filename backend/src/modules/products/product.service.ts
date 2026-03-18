import mongoose from "mongoose";
import Product from "./product.model";
import { createProductDTO } from "./product.validation";
import { getNextSequence } from "../counters/counter.service";

const generatorPrefix = (name: string): string => {
    const words = name.trim().split(/\s+/);

    if(words.length === 1) {
        return words[0].substring(0, 3).toUpperCase();
    }

    if(words.length === 2) {
        return words.map(w => w[0]).join("").toUpperCase();
    }

    return words.slice(0, 3).map(w => w[0]).join("").toUpperCase();
};

export const createProduct = async (
    data: createProductDTO,
    userId: mongoose.Types.ObjectId
) => {
    const prefix = data.prefix || generatorPrefix(data.name!).toUpperCase().trim();

    const counterKey = `${userId.toString()}-product-${prefix}`;

    const seq = await getNextSequence(counterKey);

    const productCode = await `${prefix}-${String(seq).padStart(3, "0")}`;

    const product = new Product({
        userId,
        name: data.name,
        prefix,
        productCode,
        codeFormat: data.codeFormat,
        category: data.category,
        lowStockThreshold: data.lowStockThreshold,
        hasExpiry: data.hasExpiry
    });

    return product.save();
};

export const getAllProducts = async (userId: string) => {
    return await Product.find({ userId, isActive: true });
};

export const getProductById = async (id: string, userId: string) => {
    return await Product.findOne({ _id: id, userId });
};

export const softDeleteProduct = async (id: string, userId: string) => {
    return await Product.findOneAndUpdate(
        { _id: id, userId },
        {
            isActive: false,
            deletedAt: new Date()
        },
        { returnDocument: "after" }
    );
};