import Product, { IProduct } from "./product.model";
import { createProductDTO } from "./product.validation";

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

const generateProductCode = async (userId: string, prefix: string) => {
    const lastProduct = await Product.findOne({ userId, prefix }).sort({ productCode: -1 });

    let nextNumber = 1;

    if(lastProduct) {
        const parts = lastProduct.productCode.split("-")
        const lastNumber = parseInt(parts[1], 10) || 0;
        nextNumber = lastNumber + 1; 
    }

    const formattedNumber = String(nextNumber).padStart(3, "0");

    return `${prefix}-${formattedNumber}`;
}

export const createProduct = async (data: createProductDTO) => {
    const prefix = data.prefix || generatorPrefix(data.name!).toUpperCase().trim();

    const productCode = await generateProductCode(data.userId, prefix);

    const existing =  await Product.findOne({
        userId: data.userId,
        productCode
    });

    if(existing) {
        throw new Error("Product code already exists");
    }

    const product = new Product({
        userId: data.userId,
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