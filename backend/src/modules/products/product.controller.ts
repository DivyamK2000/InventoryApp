import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { 
    createProduct,
    getAllProducts,
    getProductById,
    softDeleteProduct
} from "./product.service";

export const createProductController = asyncHandler(async (req: Request, res: Response) => {
    const product = await createProduct(req.body);

    res.status(201).json(product);
});

export const getAllProductController = asyncHandler(async (req: Request, res: Response) => {
    const products = await getAllProducts();
    res.status(200).json(products);
});

export const getProductByIdController = asyncHandler(async (req: Request<{ id: string }>, res: Response) => {
    const product = await getProductById(req.params.id);

    res.status(200).json(product);
});

export const deleteProductController = asyncHandler(async (req: Request<{ id: string }>, res: Response) => {
    const product = await softDeleteProduct(req.params.id);

    if(!product) {
        res.status(404);
        throw new Error("Product not found");
    }

    res.status(200).json({ message: "Product deleted", product });
});