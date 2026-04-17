import mongoose from "mongoose";
import Product from "./product.model";
import { CreateProductDTO, UpdateProductDTO } from "./product.validation";
import { ProductService } from "../../utils/productcode/ProductService";
import { BadRequestError, NotFoundError } from "../../utils/AppError";

export const createProduct = async (
    userId: mongoose.Types.ObjectId,
    data: CreateProductDTO
) => {
    const session = await mongoose.startSession();

    try {
        return await session.withTransaction(async() => {
            const escaped = data.name.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

            const existingName = await Product.findOne({
                userId,
                isActive: true,
                name: { $regex: `^${escaped}$`, $options: "i" }
            }).session(session);

            if (existingName) {
                throw new BadRequestError(
                    "Product with this name already exists",
                    "PRODUCT_DUPLICATE_NAME",
                    { field: "name" }
                );
            }

            let productCode: string;

            if(data.productCode) {
                const normalized = data.productCode.toUpperCase().trim();

                const existingCode = await Product.findOne({
                    userId,
                    productCode: normalized,
                    isActive: true
                }).session(session);

                if(existingCode) {
                    throw new BadRequestError(
                        "Product code already exists",
                        "PRODUCT_DUPLICATE_CODE",
                        { field: "productCode" }
                    );
                }

                productCode = normalized;
            } else {
                const initial = ProductService.resolve(data.name, new Set());

                const baseCode = "code" in initial ? initial.code : undefined;

                if (!baseCode || baseCode.length === 0) {
                    throw new BadRequestError(
                        "Failed to generate base code",
                        "PRODUCT_CODE_GENERATION_FAILED"
                    );
                }

                const exists =  await Product.findOne({
                    userId,
                    productCode: baseCode,
                    isActive: true
                }).session(session);

                if(!exists) {
                    productCode = baseCode;
                } else {
                    const similarProducts = await Product.find(
                        {
                            userId,
                            isActive: true,
                            productCode: { $regex: `^${baseCode[0]}` }
                        },
                        {productCode: 1},
                        { session }
                    ).lean();

                    const existingCodes = new Set(
                        similarProducts.map(p => p.productCode)
                    );

                    const result = ProductService.resolve(
                        data.name,
                        existingCodes
                    );

                    if("code" in result) {
                        productCode = result.code;
                    } else {
                        throw new BadRequestError(
                            "Unable to auto-generate product code",
                            "PRODUCT_CODE_GENERATION_FAILED",
                            {
                                field: "productCode",
                                suggestions: result.suggestions
                            }
                        );
                    }
                }
            }

            const [product] = await Product.create([{
                userId,
                name: data.name.trim(),
                productCode: productCode,
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
    if("productCode" in data) {
        throw new BadRequestError(
            "Product code cannot be updated",
            "PRODUCT_CODE_IMMUTABLE"
        );
    }
    
    const product =  await Product.findOneAndUpdate(
        { userId, _id: productId, isActive: true },
        { $set: data },
        { returnDocument: "after" }
    ).lean();

    if(!product) {
        throw new NotFoundError(
            "Product not found",
            "PRODUCT_NOT_FOUND"
        );
    }

    return product;
};

export const getAllProducts = async (userId: mongoose.Types.ObjectId) => {
    const product = await Product.find({ userId, isActive: true }).lean();

    return product;
};

export const getProductById = async (userId: mongoose.Types.ObjectId, productId: mongoose.Types.ObjectId) => {
    const product = await Product.findOne({ userId, _id: productId, isActive: true }).lean();

    if(!product) {
        throw new NotFoundError(
            "Product not found",
            "PRODUCT_NOT_FOUND"
        );
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
    ).lean();

    if(!product) {
        throw new NotFoundError(
            "Product not found",
            "PRODUCT_NOT_FOUND"
        );
    }

    return product;
};