import mongoose from "mongoose";
import Product from "./product.model";
import { CreateProductDTO } from "./product.validation";
import { getNextSequence } from "../counters/counter.service";

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
    data: CreateProductDTO,
    userId: mongoose.Types.ObjectId
) => {
    const prefix = data.prefix?.toUpperCase().trim() || generatorPrefix(data.name!).toUpperCase().trim();

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