import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { AuthRequest } from "../../middleware/auth.middleware";
import { 
    createProduct,
    getAllProducts,
    getProductById,
    softDeleteProduct
} from "./product.service";

export const createProductController = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user!.id;

    const product = await createProduct({
        ...req.body,
        userId
    });

    res.status(201).json({
        data: product
    });
});

export const getAllProductController = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user!.id;

    const products = await getAllProducts(userId);

    res.status(200).json(products);
});

export const getProductByIdController = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user!.id;

    const product = await getProductById(
        req.params.id as string,
        userId
    );

    if(!product) {
        res.status(404);
        throw new Error("Product not found");
    }

    res.status(200).json(product);
});

export const deleteProductController = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user!.id;
    const product = await softDeleteProduct(
        req.params.id as string,
        userId
    );

    if(!product) {
        res.status(404);
        throw new Error("Product not found");
    }

    res.status(200).json({ message: "Product deleted", product });
});